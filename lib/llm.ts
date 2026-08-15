import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
//  llm.ts — la interfaz del LLM del intake conversacional (chat-first).
//
//  A diferencia de lib/ai.ts (que elige Anthropic si hay key), acá SIEMPRE
//  forzamos Kimi/Moonshot: es el modelo del intake. Todo lo específico del
//  proveedor (url, modelo, knobs de thinking) vive detrás de esta interfaz para
//  poder migrar a Fireworks/Clarifai sin tocar la ruta ni la UI (spec §8).
//
//  Modos (spec §4):
//   - instant (thinking:false, temp 0.6, top_p 0.95, stream) → la conversación.
//   - deep    (thinking:true,  temp 1.0)                     → la síntesis del plan.
//
//  ⚠️ La KIMI_API_KEY vive SOLO server-side. Este módulo es `server-only`.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CHECKLIST_SYSTEM,
  PLAN_FORCED_HINT,
  HIDDEN_CHECKLIST,
} from "./intake-prompt";
import { composeSystem } from "./skills";
import { parsePlan, type Plan } from "./plan";

/** Checklist mental (oculto) que el orchestrator cubre conversando, nunca como form. */
const CHECKLIST_BLOCK = `Checklist mental (cubrilo conversando, nunca como formulario):
${HIDDEN_CHECKLIST.map((c) => `- ${c}`).join("\n")}`;
import type { Activity } from "./chat-format";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface KimiProvider {
  url: string;
  model: string;
  headers: Record<string, string>;
}

/** Fuerza Kimi/Moonshot (no cae a Anthropic). null si falta la key → la ruta avisa. */
function provider(): KimiProvider | null {
  const key = process.env.KIMI_API_KEY;
  if (!key) return null;
  const base = process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1";
  return {
    url: `${base.replace(/\/$/, "")}/chat/completions`,
    // K2.6 real en Moonshot (id verificado contra /v1/models). Override por env.
    model: process.env.KIMI_MODEL ?? "kimi-k2.6",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
  };
}

/** ¿Hay runtime de IA configurado para el intake? (la ruta lo usa para avisar). */
export const llmConfigured = (): boolean => provider() !== null;

// ── Config / seam de límite de turnos ────────────────────────────────────────
export interface IntakeConfig {
  /** Seam: null = ilimitado (default v0). Si se setea, al alcanzarlo se fuerza el plan. */
  maxUserTurns: number | null;
}

export function intakeConfig(): IntakeConfig {
  const raw = process.env.MAX_USER_TURNS;
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return { maxUserTurns: Number.isFinite(n) && n > 0 ? n : null };
}

function userTurns(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

// ── low-level ─────────────────────────────────────────────────────────────────
type Mode = "instant" | "deep";

/**
 * Arma el body para Kimi K2.6 (Moonshot). Contrato REAL del modelo (verificado
 * contra la API), que coincide con spec §4:
 *   - El control de thinking es un OBJETO `thinking: { type: "enabled"|"disabled" }`
 *     (NO el bool `chat_template_kwargs.thinking`, que la API ignora).
 *   - Con thinking ON  → el modelo EXIGE `temperature: 1`   (modo deep / síntesis).
 *   - Con thinking OFF → el modelo EXIGE `temperature: 0.6` (modo instant / charla).
 *   - `max_tokens` cuenta el reasoning: en deep hay que dar aire para pensar + el
 *     JSON, si no se trunca antes de llegar al content.
 * Todo lo específico del host vive acá: migrar a Fireworks/Clarifai = cambiar esto.
 */
function buildBody(
  p: KimiProvider,
  messages: ChatMessage[],
  mode: Mode,
  stream: boolean,
  maxTokens?: number
) {
  const deep = mode === "deep";
  const body: Record<string, unknown> = {
    model: p.model,
    messages,
    stream,
    temperature: deep ? 1 : 0.6,
    max_tokens: maxTokens ?? (deep ? 6000 : 700),
    thinking: { type: deep ? "enabled" : "disabled" },
  };
  if (!deep) body.top_p = 0.95;
  return body;
}

/** Extrae el primer objeto JSON de un texto (el modelo puede envolverlo en ```). */
function extractJSON(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function safeParse(s: string): any | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/** Espera `ms`, cancelable por el signal (rechaza si se aborta). */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/** ms a esperar tras un 429: usa Retry-After si viene, si no backoff (1s, 2s, 4s…). */
function retryAfterMs(res: Response, attempt: number): number {
  const secs = Number.parseInt(res.headers.get("retry-after") ?? "", 10);
  if (Number.isFinite(secs) && secs > 0) return secs * 1000;
  return Math.min(1000 * 2 ** attempt, 8000);
}

/**
 * POST a Moonshot con reintentos ante 429 (el org tiene un tope de RPM muy bajo, y un
 * turno dispara varias llamadas). Espera lo que sugiere Retry-After (o un backoff
 * exponencial) y reintenta con el mismo body; el resto de los status se devuelven tal
 * cual para que cada caller los maneje.
 */
async function kimiFetch(
  p: KimiProvider,
  body: unknown,
  signal?: AbortSignal,
  retries = 3
): Promise<Response> {
  const init: RequestInit = {
    method: "POST",
    headers: p.headers,
    body: JSON.stringify(body),
    signal,
  };
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(p.url, init);
    if (res.status !== 429 || attempt >= retries) return res;
    // 429 = tope de RPM de la org: soltamos el body y reintentamos tras esperar.
    await res.body?.cancel().catch(() => {});
    await sleep(retryAfterMs(res, attempt), signal);
  }
}

// ── turno agéntico: razona (thinking) + puede buscar en la web ($web_search) ──
export type AgentEvent =
  | { type: "activity"; activity: Activity }
  | { type: "token"; value: string };

/** Web search built-in de Moonshot (se puede apagar con KIMI_WEB_SEARCH=0). */
const webSearchEnabled = (): boolean => process.env.KIMI_WEB_SEARCH !== "0";

/** Saca tokens de control del reasoning (<|...|>) para mostrarlo limpio. */
function stripControl(s: string): string {
  return s.replace(/<\|[^|]*\|>/g, "").trim();
}

function searchQuery(args: string): string {
  try {
    const o = JSON.parse(args);
    return String(o?.query ?? o?.search_query ?? o?.q ?? "").trim();
  } catch {
    return "";
  }
}

/**
 * Corre un turno de conversación como AGENTE: el modelo RAZONA (thinking) antes de
 * responder y, si un dato concreto ayuda, BUSCA EN LA WEB (built-in $web_search de
 * Moonshot: se devuelven los arguments tal cual y el server ejecuta la búsqueda).
 * Emite eventos de actividad (para el timeline de la UI) y tokens de la respuesta.
 * Streaming + thinking + tools en la misma llamada; loop acotado por costo.
 */
export async function* runAgentTurn(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<AgentEvent> {
  const p = provider();
  if (!p) throw new Error("KIMI_API_KEY no configurado");

  const convo: any[] = [
    { role: "system", content: composeSystem("orchestrator", CHECKLIST_BLOCK) },
    ...messages,
  ];
  const tools = webSearchEnabled()
    ? [{ type: "builtin_function", function: { name: "$web_search" } }]
    : undefined;

  const MAX_ROUNDS = 3; // ≤ 2 rondas de búsqueda (control de costo/latencia)
  // Paso "Redactando" del timeline: distinto ícono según lo que hace el agente.
  const writeId = "write";
  let writeStarted = false;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    // Conversación = INSTANT (rápido). El thinking real de K2.6 tarda ~1min en
    // charla abierta: inutilizable por turno. Con KIMI_THINK_CONVO=1 se activa el
    // razonamiento real (lento) en la 1ª ronda. El plan sí usa deep (una sola vez).
    // Igual mostramos un paso "Pensando" en el timeline (transparencia).
    const useThinking = round === 0 && process.env.KIMI_THINK_CONVO === "1";
    const body: Record<string, unknown> = {
      model: p.model,
      messages: convo,
      stream: true,
      temperature: useThinking ? 1 : 0.6,
      max_tokens: useThinking ? 2800 : round === 0 ? 900 : 1200,
      thinking: { type: useThinking ? "enabled" : "disabled" },
    };
    if (!useThinking) body.top_p = 0.95;
    if (tools) body.tools = tools;

    const res = await kimiFetch(p, body, signal);
    if (!res.ok || !res.body) {
      throw new Error(`Kimi ${res.status}: ${await res.text().catch(() => "")}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let reasoning = "";
    let content = "";
    let finish = "";
    const toolCalls: Record<number, { id: string; name: string; args: string }> = {};
    const thinkId = `think-${round}`;
    let thinkStarted = false;
    let thinkDone = false;

    // "Pensando" desde el arranque del turno (transparencia + "razona un poco").
    if (round === 0) {
      thinkStarted = true;
      yield {
        type: "activity",
        activity: { id: thinkId, kind: "think", label: "Pensando", status: "running" },
      };
    }

    let streaming = true;
    while (streaming) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          streaming = false;
          break;
        }
        const choice = safeParse(payload)?.choices?.[0];
        if (!choice) continue;
        const delta = choice.delta ?? {};
        if (choice.finish_reason) finish = choice.finish_reason;

        const rc = delta.reasoning_content;
        if (typeof rc === "string" && rc.length) reasoning += rc;

        const dc = delta.content;
        if (typeof dc === "string" && dc.length) {
          if (thinkStarted && !thinkDone) {
            thinkDone = true;
            yield {
              type: "activity",
              activity: {
                id: thinkId,
                kind: "think",
                label: "Pensó un momento",
                detail: stripControl(reasoning) || undefined,
                status: "done",
              },
            };
          }
          if (!writeStarted) {
            writeStarted = true;
            yield {
              type: "activity",
              activity: { id: writeId, kind: "write", label: "Redactando", status: "running" },
            };
          }
          content += dc;
          yield { type: "token", value: dc };
        }

        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const i = tc.index ?? 0;
            const cur = (toolCalls[i] ??= { id: "", name: "", args: "" });
            if (tc.id) cur.id = tc.id;
            if (tc.function?.name) cur.name = tc.function.name;
            if (tc.function?.arguments) cur.args += tc.function.arguments;
          }
        }
      }
    }

    // cerrar el "pensando" si terminó sin contenido (p.ej. antes de una búsqueda)
    if (thinkStarted && !thinkDone) {
      yield {
        type: "activity",
        activity: {
          id: thinkId,
          kind: "think",
          label: "Pensó un momento",
          detail: stripControl(reasoning) || undefined,
          status: "done",
        },
      };
    }

    if (finish === "tool_calls" && Object.keys(toolCalls).length) {
      convo.push({
        role: "assistant",
        content: content || "",
        tool_calls: Object.values(toolCalls).map((t) => ({
          id: t.id,
          type: "function",
          function: { name: t.name, arguments: t.args },
        })),
      });
      for (const [i, t] of Object.entries(toolCalls)) {
        const isSearch = t.name === "$web_search";
        const q = searchQuery(t.args);
        const sid = `search-${round}-${i}`;
        yield {
          type: "activity",
          activity: {
            id: sid,
            kind: isSearch ? "search" : "browse",
            label: isSearch ? "Buscando en la web" : "Consultando",
            detail: q || undefined,
            status: "running",
          },
        };
        // eco de arguments tal cual → Moonshot ejecuta la búsqueda del lado server
        convo.push({ role: "tool", tool_call_id: t.id, name: t.name, content: t.args });
        yield {
          type: "activity",
          activity: {
            id: sid,
            kind: isSearch ? "search" : "browse",
            label: isSearch ? "Busqué en la web" : "Consulté",
            detail: q || undefined,
            status: "done",
          },
        };
      }
      continue; // otra ronda: el modelo ve los resultados y sigue
    }

    if (writeStarted) {
      yield {
        type: "activity",
        activity: { id: writeId, kind: "write", label: "Listo", status: "done" },
      };
    }
    return; // finish stop → turno terminado
  }
}

// ── clasificador: ¿ya alcanza para el plan? (instant, no-stream) ──────────────
async function assessChecklist(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<{ satisfied: boolean; missing: string[] }> {
  const p = provider();
  if (!p) return { satisfied: false, missing: [] };
  try {
    const body = buildBody(
      p,
      [{ role: "system", content: CHECKLIST_SYSTEM }, ...messages],
      "instant",
      false,
      250
    );
    const res = await kimiFetch(p, body, signal);
    if (!res.ok) return { satisfied: false, missing: [] };
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    const out = typeof text === "string" ? extractJSON(text) : null;
    return {
      satisfied: Boolean(out?.satisfied),
      missing: Array.isArray(out?.missing) ? out.missing.map(String) : [],
    };
  } catch {
    return { satisfied: false, missing: [] };
  }
}

/**
 * ÚNICO punto de decisión "¿seguir preguntando o dropear el plan?" (spec §Archivos).
 * Combina el seam del cap (MAX_USER_TURNS, default ilimitado) con el checklist
 * oculto (clasificador). Prender el cap en el futuro no toca ninguna otra pieza.
 */
export async function shouldDropPlan(
  messages: ChatMessage[],
  config: IntakeConfig,
  signal?: AbortSignal
): Promise<{ drop: boolean; forced: boolean; progress: number }> {
  const total = HIDDEN_CHECKLIST.length;
  if (
    config.maxUserTurns != null &&
    userTurns(messages) >= config.maxUserTurns
  ) {
    return { drop: true, forced: true, progress: 1 };
  }
  // Antes del 2º turno todavía no evaluamos el checklist: progreso tentativo.
  if (userTurns(messages) < 2) {
    return { drop: false, forced: false, progress: Math.min(userTurns(messages) * 0.15, 0.3) };
  }
  const { satisfied, missing } = await assessChecklist(messages, signal);
  // progreso real = ítems del checklist ya cubiertos / total.
  const covered = Math.max(0, total - Math.min(missing.length, total));
  const progress = satisfied ? 1 : Math.max(0.3, covered / total);
  return { drop: satisfied, forced: false, progress };
}

// ── síntesis del plan (deep / thinking mode) ─────────────────────────────────
/**
 * Corre el pass de síntesis (thinking mode) y devuelve el PLAN validado por Zod.
 * `forced` = se llegó por el cap de turnos → se le pide completar con supuestos.
 * Devuelve null si el modelo no produjo un plan válido (la ruta lo maneja).
 */
export async function synthesizePlan(
  messages: ChatMessage[],
  opts: { forced?: boolean; previousPlan?: Plan | null; fast?: boolean } = {},
  signal?: AbortSignal
): Promise<Plan | null> {
  const p = provider();
  if (!p) throw new Error("KIMI_API_KEY no configurado");

  // Refinar un plan existente = skill `edit` (objetivo: el plan). Sintetizar de cero
  // = `prepare-plan` (voz/ángulo) + `adapt` (adaptar el template al material).
  const system = opts.previousPlan
    ? composeSystem(
        "edit",
        `Estás editando: EL PLAN.\nEl usuario ya vio este plan y pidió refinarlo. Plan anterior (JSON):\n${JSON.stringify(
          opts.previousPlan
        )}`
      )
    : composeSystem(
        ["prepare-plan", "adapt"],
        opts.forced ? PLAN_FORCED_HINT : undefined
      );

  // Refinar un plan existente NO necesita razonamiento profundo: usamos modo
  // instant (sin thinking) → respuesta mucho más rápida para cambios chicos. La
  // síntesis inicial sí usa deep (calidad de la primera pasada).
  const body = opts.fast
    ? buildBody(p, [{ role: "system", content: system }, ...messages], "instant", false, 3500)
    : buildBody(p, [{ role: "system", content: system }, ...messages], "deep", false);

  const res = await kimiFetch(p, body, signal);
  if (!res.ok) {
    throw new Error(`Kimi plan ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") return null;
  return parsePlan(extractJSON(text));
}

// ── editor del sitio (Phase 3): instrucción → PATCH parcial de Content ─────────
/**
 * Corre el agente de EDICIÓN del sitio (instant mode): recibe el `Content` actual
 * + la instrucción del usuario y devuelve un PATCH PARCIAL de Content (objeto JSON)
 * que la ruta mergea (deep-merge) y valida con `contentSchema`. Devuelve null si el
 * modelo no produjo un JSON. Ver skills/edit/SKILL.md (objetivo: el sitio) para el contrato.
 */
export async function editSiteContent(
  messages: ChatMessage[],
  currentContent: unknown,
  signal?: AbortSignal
): Promise<Record<string, unknown> | null> {
  const p = provider();
  if (!p) throw new Error("KIMI_API_KEY no configurado");

  const system = composeSystem(
    "edit",
    `Estás editando: EL SITIO.\nCONTENT ACTUAL del sitio (JSON):\n${JSON.stringify(
      currentContent
    )}`
  );
  const body = buildBody(
    p,
    [{ role: "system", content: system }, ...messages],
    "instant",
    false,
    3500
  );

  const res = await kimiFetch(p, body, signal);
  if (!res.ok) {
    throw new Error(`Kimi site ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") return null;
  const patch = extractJSON(text);
  return patch && typeof patch === "object" ? (patch as Record<string, unknown>) : null;
}
