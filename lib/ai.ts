import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
//  ai.ts — las skills de IA del template (WP-3): `generar-narrativa` (mejora la
//  narrativa generada) y `editar-contenido` (edición por prompt del plan `pro`).
//
//  Es una MEJORA opcional: si no hay API key configurada, `enhanceNarrative`
//  devuelve el content sin tocar (el generador determinista de lib/generate.ts ya
//  produce un sitio coherente). Con key, usa Claude Sonnet (o Kimi, OpenAI-compat)
//  para reescribir los textos con la voz de la pareja.
//    Runtime: Claude Sonnet (editar) / Kimi (generar) — ver PLAN §0.
// ─────────────────────────────────────────────────────────────────────────────

import type { Content } from "./content";
import type { WizardState } from "./draft";

interface Provider {
  kind: "anthropic" | "openai";
  url: string;
  model: string;
  headers: Record<string, string>;
}

/** Elige el proveedor LLM según las env keys disponibles (o null → sin IA). */
function provider(): Provider | null {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  if (anthropic) {
    return {
      kind: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      headers: {
        "x-api-key": anthropic,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    };
  }
  const kimi = process.env.KIMI_API_KEY;
  if (kimi) {
    const base = process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1";
    return {
      kind: "openai",
      url: `${base}/chat/completions`,
      model: process.env.KIMI_MODEL ?? "moonshot-v1-32k",
      headers: {
        Authorization: `Bearer ${kimi}`,
        "content-type": "application/json",
      },
    };
  }
  return null;
}

/** ¿Hay un runtime de IA configurado? (la lo usa el flujo para saltear la mejora). */
export const aiConfigured = (): boolean => provider() !== null;

/** Llama al LLM pidiendo JSON y lo parsea. Defensivo: null si algo falla. */
async function callJSON(system: string, user: string): Promise<any | null> {
  const p = provider();
  if (!p) return null;
  try {
    const body =
      p.kind === "anthropic"
        ? {
            model: p.model,
            max_tokens: 2000,
            system,
            messages: [{ role: "user", content: user }],
          }
        : {
            model: p.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
          };
    const res = await fetch(p.url, {
      method: "POST",
      headers: p.headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text =
      p.kind === "anthropic"
        ? data?.content?.[0]?.text
        : data?.choices?.[0]?.message?.content;
    if (typeof text !== "string") return null;
    // el modelo puede envolver el JSON en ```json … ```; extraemos el objeto.
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Skill `generar-narrativa`: reescribe hero.lede, los taglines de cada persona y
 * el texto de cada beat de las secciones "story" con la voz de la pareja, a
 * partir de su descripción libre. Merge no destructivo; si no hay IA o falla,
 * devuelve el content tal cual.
 */
export async function enhanceNarrative(
  content: Content,
  state: WizardState
): Promise<Content> {
  if (!aiConfigured() || !state.story?.trim()) return content;

  const storyBeats = Object.entries(content.story).map(([id, s]) => ({
    id,
    title: s.beats[0]?.title ?? id,
  }));

  const system =
    "Sos un escritor romántico pero natural (español rioplatense). Escribís copy " +
    "cálido, breve y honesto para el sitio de aniversario de una pareja. Devolvés " +
    "SOLO un objeto JSON válido, sin markdown.";

  const user = JSON.stringify({
    instruccion:
      "Reescribí los textos con la voz de esta pareja usando su historia. " +
      "Sé concreto y emotivo, nada cursi ni genérico. Respetá los nombres.",
    pareja: content.couple,
    persona_izquierda: {
      nombre: content.people.left.name,
      personalidad: state.people.left.personality,
    },
    persona_derecha: {
      nombre: content.people.right.name,
      personalidad: state.people.right.personality,
    },
    historia: state.story,
    secciones: storyBeats,
    formato_salida: {
      heroLede: "string (1-2 frases, portada)",
      leftTagline: "string (<= 6 palabras)",
      rightTagline: "string (<= 6 palabras)",
      beats: "objeto { [idSeccion]: string (2-3 frases) } para cada sección listada",
    },
  });

  const out = await callJSON(system, user);
  if (!out || typeof out !== "object") return content;

  const next: Content = structuredClone(content);
  if (typeof out.heroLede === "string") next.hero.lede = out.heroLede;
  if (typeof out.leftTagline === "string") next.people.left.tagline = out.leftTagline;
  if (typeof out.rightTagline === "string")
    next.people.right.tagline = out.rightTagline;
  if (out.beats && typeof out.beats === "object") {
    for (const [id, text] of Object.entries(out.beats)) {
      const sec = next.story[id];
      if (sec && sec.beats[0] && typeof text === "string") sec.beats[0].text = text;
    }
  }
  return next;
}

/**
 * Skill `editar-contenido` (plan `pro`): aplica un cambio pedido por prompt sobre
 * el content del tenant y devuelve el content actualizado. Sin IA → devuelve el
 * content sin cambios (la UI debe avisar que el plan no incluye edición IA).
 */
export async function aiEdit(
  content: Content,
  instruction: string
): Promise<{ content: Content; changed: boolean }> {
  if (!aiConfigured() || !instruction.trim()) return { content, changed: false };

  const system =
    "Editás el JSON de contenido de un sitio de aniversario según la instrucción " +
    "del usuario. Devolvés SOLO el objeto JSON completo y válido del contenido, " +
    "con el MISMO shape que recibís, aplicando el cambio pedido. No inventes campos.";
  const user = JSON.stringify({ instruccion: instruction, contenidoActual: content });

  const out = await callJSON(system, user);
  if (!out || typeof out !== "object") return { content, changed: false };
  return { content: out as Content, changed: true };
}
