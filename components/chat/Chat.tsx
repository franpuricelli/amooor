"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Chat.tsx — orquestador del intake conversacional (reemplaza al Wizard).
//  Saludo + ideas de arranque → thread (agente en el lienzo, usuario en burbujas)
//  → tarjeta de plan (secciones editables + paleta) con Refinar/Aprobar en la barra.
//  Feedback: scroll pineado + flechita para bajar + puntitos flotantes al scrollear
//  arriba mientras escribe; panel derecho de "compartido"; "Guardar" pide login.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import "./chat.css";
import { useConversation, type Message } from "@/lib/use-conversation";
import { GREETING_SUBLINE, STARTER_IDEAS } from "@/lib/intake-prompt";
import { parsePlan } from "@/lib/plan";
import { PURIVI_PLAN, SKIP_WIZARD_TRIGGER } from "@/lib/demo-plan";
import { parseDeepen, deriveShared } from "@/lib/chat-format";
import type { Swatch } from "@/lib/palette-gen";
import ChatMessages from "./ChatMessages";
import ChatComposer, { type SendOpts } from "./ChatComposer";
import PlanCard from "./PlanCard";
import ProfileMenu from "./ProfileMenu";
import SharedPanel from "./SharedPanel";
import SelectionReply from "./SelectionReply";
import PostApprove, { type Step } from "./postapprove/PostApprove";
import StatusDot, { type DotStatus } from "./postapprove/StatusDot";
import { api } from "@/convex/_generated/api";
import { convexClient, isConvexConfigured } from "@/lib/convex-browser";
import { registerContext, track } from "@/lib/analytics";

// etapas del flujo /comenzar (para el stepper del header)
const STAGES = [
  { key: "historia", label: "Historia" },
  { key: "plan", label: "Plan" },
  { key: "fotos", label: "Fotos" },
  { key: "sitio", label: "Tu sitio" },
] as const;


function StepCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarterIcon({ name }: { name: string }) {
  const p: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 12h18M12 8v13M12 8s-1.5-4-4-4-2.5 4 0 4M12 8s1.5-4 4-4 2.5 4 0 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    ring: (
      <>
        <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 5h6l-3 4-3-4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </>
    ),
    spark: (
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    ),
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {p[name] ?? p.spark}
    </svg>
  );
}

// Ritmo de tipeo del agente: el texto llega tan rápido como Kimi lo streamea, pero
// lo MOSTRAMOS a ~la mitad de esa velocidad para que se lea humano y pausado (no un
// golpe de texto). Tuneable: subilo para tipear más rápido, bajalo para más calma.
const TYPE_CHARS_PER_SEC = 45;

function ArrowDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export default function Chat() {
  const convo = useConversation();
  // Soft gate: el hero carga para todos, pero el primer envío al bot abre el
  // modal de Clerk. useUser().isSignedIn puede ser undefined mientras carga.
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [loginHint, setLoginHint] = useState(false);
  // Estado de publicación del sitio (lo trae `siteByDraft` del draft actual).
  // Convex acá es imperativo (sin provider reactivo), así que refrescamos a mano
  // tras cada acción. La burbuja del botón: idle=gris (sin publicar / pausado),
  // busy=amarillo (en curso), ready=verde (live).
  const [siteStatus, setSiteStatus] = useState<"none" | "live" | "paused">("none");
  const [siteSub, setSiteSub] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);
  const [publishErr, setPublishErr] = useState<string | null>(null);
  // card "Publicado" (popover del header): thumbnail + Ver sitio / Publicar
  const [pubCardOpen, setPubCardOpen] = useState(false);
  const pubGroupRef = useRef<HTMLDivElement | null>(null);
  const publishStatus: DotStatus = publishing
    ? "busy"
    : siteStatus === "live"
      ? "ready"
      : "idle";
  const [paStep, setPaStep] = useState<Step | null>(null);
  const [refining, setRefining] = useState(false);
  const [refLabels, setRefLabels] = useState<Record<string, string>>({});
  const mainRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef(true);
  const insertRef = useRef<((t: string) => void) | null>(null);
  const quoteRef = useRef<((t: string) => void) | null>(null);
  const openProfileRef = useRef<(() => void) | null>(null);
  // PostApprove registra acá cómo saltar a un paso (para volver a "Fotos")
  const paGotoRef = useRef<((s: Step) => void) | null>(null);
  const registerPaGoto = useCallback((fn: (s: Step) => void) => {
    paGotoRef.current = fn;
  }, []);
  // correcciones de supuestos pendientes de avisarle al agente en el próximo refine
  const correctionsRef = useRef<string[]>([]);

  const hasPlan = !!convo.plan && !approved;

  // task 2-A/2-B: la plantilla elegida vive en el draft (convo.template) — se
  // persiste dentro de `theme.template` y fluye al render (ver PreviewSite).

  // ── analytics ───────────────────────────────────────────────────────────────
  // El `draft_token` es la clave que une el embudo entero (anónimo → logueado →
  // publicado), así que va como super-propiedad antes de cualquier evento.
  useEffect(() => {
    if (convo.token) registerContext({ draft_token: convo.token });
  }, [convo.token]);

  // `builder_opened` una sola vez, cuando el draft ya se hidrató (si no, todas
  // las visitas parecerían nuevas mientras carga).
  const openedRef = useRef(false);
  useEffect(() => {
    if (!convo.ready || openedRef.current) return;
    openedRef.current = true;
    const plan = new URLSearchParams(window.location.search).get("plan");
    track("builder_opened", {
      returning: convo.messages.length > 0 || !!convo.plan,
      ...(plan ? { plan } : {}),
    });
  }, [convo.ready, convo.messages.length, convo.plan]);

  // nombres editables de las referencias (persisten en localStorage)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("amooor_ref_labels");
      if (raw) setRefLabels(JSON.parse(raw));
    } catch {}
  }, []);
  const renameRef = useCallback((id: string, name: string) => {
    setRefLabels((prev) => {
      const next = { ...prev, [id]: name };
      try {
        window.localStorage.setItem("amooor_ref_labels", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Corregir un supuesto = edición LOCAL e instantánea: lo sacamos del plan (no
  // re-sintetizamos, así no vuelve a aparecer ni hay que esperar) y guardamos el
  // dato para avisarle al agente en el próximo refine real.
  const correctAssumption = useCallback(
    (oldText: string, newText: string) => {
      if (!convo.plan) return;
      convo.setPlan({
        ...convo.plan,
        assumptions: convo.plan.assumptions.filter((a) => a !== oldText),
      });
      correctionsRef.current.push(
        `En vez de "${oldText}" → ${newText}. Es un hecho confirmado, no lo listes como supuesto.`
      );
      track("plan_assumption_corrected", {
        remaining: convo.plan.assumptions.length - 1,
      });
    },
    [convo]
  );

  // Eliminar una sección = edición LOCAL e instantánea (la saca del plan) + nota
  // para que el agente no la vuelva a incluir en el próximo refine.
  const removeSection = useCallback(
    (index: number) => {
      if (!convo.plan) return;
      const gone = convo.plan.sections[index];
      if (!gone) return;
      convo.setPlan({
        ...convo.plan,
        sections: convo.plan.sections.filter((_, i) => i !== index),
      });
      correctionsRef.current.push(
        `El usuario eliminó la sección "${gone.title}" (${gone.kind}): no la incluyas en el plan.`
      );
      track("plan_section_removed", {
        kind: gone.kind,
        remaining: convo.plan.sections.length - 1,
      });
    },
    [convo]
  );

  // Corregir los datos duros del plan (aniversario / quién de los dos arma el
  // sitio) = edición LOCAL: el sitio los necesita sí o sí y no vale la pena una
  // re-síntesis. La nota queda para que el agente no los vuelva a suponer.
  const correctFacts = useCallback(
    (facts: { you?: string; together?: string }) => {
      if (!convo.plan) return;
      const next = { ...convo.plan };
      if (facts.you !== undefined) next.you = facts.you;
      if (facts.together !== undefined) {
        next.dates = { ...convo.plan.dates, together: facts.together };
      }
      convo.setPlan(next);
      if (facts.you !== undefined) {
        correctionsRef.current.push(
          `De la pareja, quien arma el sitio es ${facts.you}. Es un hecho confirmado.`
        );
        track("plan_narrator_set", {});
      }
      if (facts.together !== undefined) {
        correctionsRef.current.push(
          `El aniversario (desde cuándo están juntos) es ${facts.together}. Es un hecho confirmado.`
        );
        track("plan_anniversary_set", { had_date: !!convo.plan.dates.together });
      }
    },
    [convo]
  );

  // Aplicar paleta: una custom viaja con su paleta completa (overrides) para que
  // el sitio la tematice; una built-in va sin overrides (los limpia).
  const applyPalette = useCallback(
    (id: string, sw?: Swatch) => {
      const overrides = sw && id.startsWith("custom-") ? sw.palette : undefined;
      convo.setPalette(id, overrides);
      track("palette_changed", { palette: id, custom: !!overrides, surface: "plan" });
      registerContext({ palette: id });
    },
    [convo]
  );

  // La plantilla se elige desde la PlanCard (mismo setter que el draft).
  const applyTemplate = useCallback(
    (id: string) => {
      convo.setTemplate(id);
      track("template_changed", { template: id, surface: "plan" });
      registerContext({ template: id });
    },
    [convo]
  );

  // ── publicar / pausar el sitio ──────────────────────────────────────────────
  // El sitio vive en Convex (`sites`), no en el draft. Lo traemos con siteByDraft
  // y lo refrescamos tras cada acción (Convex acá es imperativo, sin provider).
  const refreshSite = useCallback(async () => {
    if (!convo.token || !isConvexConfigured()) return;
    try {
      const s = await convexClient().query(api.generate.siteByDraft, {
        draftToken: convo.token,
      });
      if (s && (s.status === "live" || s.status === "paused")) {
        setSiteStatus(s.status);
        setSiteSub(s.subdomain);
      } else {
        setSiteStatus("none");
        setSiteSub(s?.subdomain ?? null);
      }
    } catch {
      /* sin backend / error → dejamos el estado como está */
    }
  }, [convo.token]);

  // publish = crear / actualizar / reactivar (todo el mismo POST); pause = pausar.
  const runPublish = useCallback(
    async (action: "publish" | "pause") => {
      if (!convo.token || publishing) return;
      setPublishing(true);
      setPublishErr(null);
      // "republish" = ya existía un sitio (actualizar o reactivar), no el alta.
      const republish = siteStatus !== "none";
      const t0 = Date.now();
      track("site_publish_started", { action, republish });
      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftToken: convo.token, action }),
        });
        if (!res.ok) {
          const { error } = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(error ?? "No se pudo publicar");
        }
        const data = (await res.json()) as {
          status: "live" | "paused";
          subdomain: string;
          url: string;
        };
        setSiteStatus(data.status);
        setSiteSub(data.subdomain);
        setPublishNotice(
          action === "pause" ? "Tu sitio quedó pausado." : "¡Tu sitio está publicado!"
        );
        if (action === "pause") track("site_paused", { subdomain: data.subdomain });
        else
          track("site_published", {
            subdomain: data.subdomain,
            republish,
            ms: Date.now() - t0,
          });
        if (action === "publish") setPubCardOpen(true);
        return data;
      } catch (e) {
        const reason = e instanceof Error ? e.message : "Algo salió mal";
        setPublishErr(reason);
        track("site_publish_failed", { action, reason });
        return null;
      } finally {
        setPublishing(false);
      }
    },
    [convo.token, publishing, siteStatus]
  );

  // Publicar y abrir el sitio en una pestaña nueva. Abrimos la pestaña en blanco
  // SINCRÓNICAMENTE dentro del click (así el navegador no la bloquea) y le
  // seteamos la URL cuando el publish resuelve.
  const publishAndOpen = useCallback(() => {
    if (publishing) return;
    const w = typeof window !== "undefined" ? window.open("", "_blank") : null;
    void runPublish("publish").then((data) => {
      const url = data?.url || (data?.subdomain ? `/s/${data.subdomain}` : null);
      if (!w) return;
      if (url) w.location.href = url;
      else w.close();
    });
  }, [publishing, runPublish]);

  // Al entrar al editor (aprobado) traemos el estado del sitio (si ya existe).
  useEffect(() => {
    if (approved) void refreshSite();
  }, [approved, refreshSite]);

  // Cerrar la card "Publicado" al hacer click afuera.
  useEffect(() => {
    if (!pubCardOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (pubGroupRef.current && !pubGroupRef.current.contains(e.target as Node)) {
        setPubCardOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pubCardOpen]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const onScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const b = dist < 90;
    atBottomRef.current = b;
    setAtBottom(b);
  }, []);

  // Auto-scroll SOLO si el usuario ya está abajo (no lo arrancamos si scrolleó arriba).
  // Incluimos `sending`: al terminar el stream aparecen las opciones/chips y hay que
  // bajar para mostrarlas (antes solo scrolleaba el texto del agente).
  useEffect(() => {
    if (atBottomRef.current) scrollToBottom(false);
  }, [convo.messages, thinking, sending, convo.plan, approved, scrollToBottom]);

  const consumeSSE = useCallback(
    async (body: ReadableStream<Uint8Array>) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantStarted = false;

      const ensureAssistant = () => {
        if (assistantStarted) return;
        assistantStarted = true;
        convo.setMessages((prev) => [...prev, { role: "assistant", content: "", activities: [] }]);
      };
      const updateLast = (fn: (m: Message) => Message) =>
        convo.setMessages((prev) => {
          const next = prev.slice();
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "assistant") {
              next[i] = fn(next[i]);
              break;
            }
          }
          return next;
        });

      // Typewriter: acumulamos TODO lo que llega y avanzamos lo MOSTRADO a un ritmo
      // constante (~la mitad de la velocidad natural). Si el modelo va más rápido,
      // el display queda atrás a propósito; si va más lento, lo alcanza y espera.
      let received = "";
      let shown = 0;
      let streamDone = false;
      let typer: Promise<void> | null = null;
      const step = Math.max(1, Math.round((TYPE_CHARS_PER_SEC * 25) / 1000));
      const runTyper = () =>
        new Promise<void>((resolve) => {
          const id = window.setInterval(() => {
            if (shown < received.length) {
              shown = Math.min(received.length, shown + step);
              const text = received.slice(0, shown);
              updateLast((m) => ({ ...m, content: text }));
            } else if (streamDone) {
              window.clearInterval(id);
              resolve();
            }
          }, 25);
        });
      const pushText = (v: string) => {
        received += v;
        if (!typer) typer = runTyper();
      };

      const handle = (evt: any) => {
        if (evt.type === "activity") {
          setThinking(false);
          ensureAssistant();
          updateLast((m) => {
            const acts = (m.activities ?? []).slice();
            const idx = acts.findIndex((a) => a.id === evt.activity.id);
            if (idx >= 0) acts[idx] = evt.activity;
            else acts.push(evt.activity);
            return { ...m, activities: acts };
          });
        } else if (evt.type === "token") {
          setThinking(false);
          ensureAssistant();
          pushText(evt.value);
        } else if (evt.type === "plan") {
          setThinking(false);
          const p = parsePlan(evt.plan);
          if (p) {
            convo.setPlan(p);
            // `refined` distingue el primer plan (fin de la entrevista) de cada
            // iteración posterior — son dos pasos distintos del embudo.
            track("plan_generated", {
              sections: p.sections.length,
              kinds: p.sections.map((s) => s.kind),
              refined: hasPlan,
            });
          }
          setRefining(false); // llegó el plan nuevo → expandimos de nuevo
        } else if (evt.type === "error") {
          setThinking(false);
          setError(evt.message ?? "Algo salió mal.");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            handle(JSON.parse(line.slice(5).trim()));
          } catch {
            /* frame malformado */
          }
        }
      }

      // El stream terminó: dejamos que el typewriter termine de mostrar lo que quede
      // en cola antes de cerrar el turno (así el fallback ve el content final real).
      streamDone = true;
      if (typer) await typer;

      // Un turno que sólo produjo plan (sin tokens) deja el mensaje del asistente
      // vacío → Kimi rechaza el próximo request ("assistant must not be empty").
      // Le damos un texto mínimo de confirmación.
      if (assistantStarted) {
        updateLast((m) =>
          m.content.trim() ? m : { ...m, content: "Listo, actualicé el plan." }
        );
      }
    },
    [convo, hasPlan]
  );

  const send = useCallback(
    async (text: string, opts?: SendOpts) => {
      if (sending || !convo.token || !text.trim()) return;

      // Atajo de dev: "skip wizard" → carga la historia de Puri & Ivi (purivi.love)
      // y dropea su plan directo, sin pasar por la entrevista.
      if (text.trim().toLowerCase() === SKIP_WIZARD_TRIGGER) {
        setError(null);
        convo.setMessages((prev) => [
          ...prev,
          { role: "user", content: text },
          {
            role: "assistant",
            content:
              "Listo: cargué la historia de **Puri & Ivi** (purivi.love) como ejemplo. Acá tenés el plan, podés refinarlo o aprobarlo.",
          },
        ]);
        convo.setPalette("rosa");
        convo.setPlan(PURIVI_PLAN);
        // Marcamos la sesión como demo: sirve para excluirla de los embudos.
        track("demo_plan_loaded", {});
        atBottomRef.current = true;
        setAtBottom(true);
        requestAnimationFrame(() => scrollToBottom(true));
        return;
      }

      // Soft gate: cualquier envío real al bot exige sesión. Va DESPUÉS del atajo
      // "skip wizard" (que no toca la red y debe seguir andando) y antes de tocar
      // los mensajes. Cubre chips de arranque, composer, deepen y refine porque
      // todos pasan por acá.
      if (!isSignedIn) {
        track("signup_gate_shown", { at: "chat_send" });
        openSignIn();
        return;
      }

      const converse = opts?.converse ?? false;
      // plan a la vista → cada mensaje refina (el plan se muestra directo, sin gate).
      const refine = !converse && hasPlan;
      setError(null);
      // Con un plan a la vista (refine o converse), lo colapsamos y la nueva
      // conversación va DEBAJO — así el usuario ve lo que escribe el agente y el
      // plan no ocupa toda la pantalla. Se re-expande al terminar / al llegar el
      // plan nuevo.
      if (hasPlan) setRefining(true);

      const userMsg: Message = {
        role: "user",
        content: text,
        ...(opts?.attachments?.length ? { attachments: opts.attachments } : {}),
        ...(opts?.refs?.length ? { refs: opts.refs } : {}),
        ...(opts?.quotes?.length ? { quotes: opts.quotes } : {}),
      };
      const base = [...convo.messages, userMsg];
      convo.setMessages(() => base);
      setSending(true);
      setThinking(true);
      // Nunca mandamos el texto: sólo su largo y qué adjuntó (sin PII).
      const mode = converse ? "converse" : refine ? "refine" : "chat";
      const t0 = Date.now();
      track("chat_message_sent", {
        mode,
        length: text.trim().length,
        has_attachments: !!opts?.attachments?.length,
        has_refs: !!opts?.refs?.length,
        has_quotes: !!opts?.quotes?.length,
      });
      // el propio usuario mandó algo → lo llevamos abajo
      atBottomRef.current = true;
      setAtBottom(true);
      requestAnimationFrame(() => scrollToBottom(true));

      // Nunca mandamos mensajes vacíos (Kimi los rechaza).
      const outMessages = base.map((m) => ({
        role: m.role,
        content: m.content?.trim() ? m.content : "Listo, actualicé el plan.",
      }));
      // Al refinar, sumamos las correcciones de supuestos acumuladas como contexto.
      if (refine && correctionsRef.current.length && outMessages.length) {
        const note =
          "\n\nAclaraciones del usuario (tratá como hechos confirmados, no como supuestos):\n" +
          correctionsRef.current.map((c) => `- ${c}`).join("\n");
        const last = outMessages[outMessages.length - 1];
        outMessages[outMessages.length - 1] = { ...last, content: last.content + note };
        correctionsRef.current = [];
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            token: convo.token,
            messages: outMessages,
            refine,
            converse,
            previousPlan: refine ? convo.plan : undefined,
          }),
        });
        if (!res.ok || !res.body) {
          throw new Error(
            res.status === 429
              ? "Demasiados mensajes seguidos. Esperá unos segundos."
              : "No pude conectar con el asistente. Probá de nuevo."
          );
        }
        await consumeSSE(res.body);
        track("chat_reply_received", { mode, ms: Date.now() - t0 });
      } catch (e) {
        setError((e as Error).message);
        track("chat_reply_failed", {
          mode,
          ms: Date.now() - t0,
          reason: (e as Error).message,
        });
      } finally {
        setSending(false);
        setThinking(false);
        setRefining(false);
      }
    },
    [sending, convo, hasPlan, consumeSSE, scrollToBottom, isSignedIn, openSignIn]
  );

  const empty = convo.messages.length === 0 && !convo.plan && !approved;

  const lastMsg = convo.messages[convo.messages.length - 1];
  const deepenOptions =
    !sending && !hasPlan && lastMsg?.role === "assistant" ? parseDeepen(lastMsg.content) : [];

  const shared = deriveShared(convo.messages, hasPlan, convo.plan?.title, refLabels);

  // Punto de corte para colapsar el plan al refinar: el último mensaje del usuario
  // (la instrucción de refinamiento). Todo lo anterior es historial; el plan
  // colapsado se inserta ahí y la nueva conversación queda debajo.
  let refineSplit = convo.messages.length;
  for (let i = convo.messages.length - 1; i >= 0; i--) {
    if (convo.messages[i].role === "user") {
      refineSplit = i;
      break;
    }
  }

  const composer = (centered: boolean) => (
    <ChatComposer
      onSend={send}
      disabled={sending}
      centered={centered}
      mode={hasPlan ? "plan" : "chat"}
      busy={sending}
      planBusy={sending}
      onApprove={() => {
        track("plan_approved", {
          sections: convo.plan?.sections.length ?? 0,
          palette: convo.palette,
          template: convo.template,
        });
        setApproved(true);
      }}
      onRefineEmpty={() =>
        send(
          "Quiero refinar el plan pero no sé bien por dónde. Preguntame qué puedo ajustar: secciones, tono, orden o qué falta.",
          { converse: true }
        )
      }
      deepenOptions={deepenOptions}
      mentions={shared}
      registerInsert={(fn) => (insertRef.current = fn)}
      registerQuote={(fn) => (quoteRef.current = fn)}
    />
  );

  // etapa actual del flujo (para el stepper del header): Historia → Plan → Fotos
  // → Tu sitio. Antes de aprobar sale del estado del intake; después, del paso de
  // PostApprove (upload = Fotos; build/edit = Tu sitio).
  const stageIndex = !approved
    ? hasPlan
      ? 1
      : 0
    : paStep === "build" || paStep === "edit"
      ? 3
      : 2;

  // Navegación por el stepper: solo se puede VOLVER a una etapa ya completada.
  //  Historia/Plan → salir del post-approve (el plan vuelve a la vista; la media
  //  queda guardada en el draft y se recarga al re-aprobar). Fotos → volver a la
  //  subida desde el editor (rebind, sin regenerar). No permitimos saltar adelante.
  const goToStage = (i: number) => {
    if (i >= stageIndex) return;
    if (approved) {
      if (i <= 1) setApproved(false); // → Plan / Historia
      else if (i === 2) {
        track("photos_step_reopened", {});
        paGotoRef.current?.("upload"); // Tu sitio → Fotos
      }
    } else if (i === 0) {
      // ya estamos en el plan: llevamos la charla (arriba) a la vista
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={`ch-root mk-root ${approved ? "ch-editing" : ""}`}>
      <header className="ch-top">
        <a className="ch-brand" href="/">
          amooor
        </a>
        {convo.ready && !empty && (
          <ol className="ch-steps" aria-label="Etapas">
            {STAGES.map((st, i) => {
              const done = i < stageIndex;
              const on = i === stageIndex;
              // una etapa completada es clickeable para volver a ella
              const nav = done;
              return (
                <li
                  key={st.key}
                  className={`ch-step ${done ? "done" : ""} ${on ? "on" : ""} ${nav ? "stepnav" : ""}`}
                  aria-current={on ? "step" : undefined}
                  {...(nav
                    ? {
                        role: "button",
                        tabIndex: 0,
                        title: `Volver a ${st.label}`,
                        onClick: () => goToStage(i),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToStage(i);
                          }
                        },
                      }
                    : {})}
                >
                  <span
                    className={`ch-step-dot ${on && (sending || thinking) ? "busy" : ""}`}
                    aria-hidden
                  >
                    {done ? <StepCheck /> : i + 1}
                  </span>
                  <span className="ch-step-label">{st.label}</span>
                </li>
              );
            })}
          </ol>
        )}
        {approved ? (
          <div className="pa-publish-group" ref={pubGroupRef}>
            {siteStatus === "none" ? (
              // primer publish → botón directo (abre el sitio en pestaña nueva)
              <button
                type="button"
                className="ch-save-btn pa-publish-btn"
                onClick={publishAndOpen}
                disabled={publishing}
                title="Publicar tu sitio"
              >
                <StatusDot status={publishStatus} />
                {publishing ? "Publicando…" : "Publicar"}
              </button>
            ) : (
              // ya publicado → ícono de pausa translúcido (afuera, a la izq) + pill
              <div className="pa-pub-trigger">
                {siteStatus === "live" && (
                  <button
                    type="button"
                    className="pa-pub-pause"
                    onClick={() => void runPublish("pause")}
                    disabled={publishing}
                    data-tip="Pausar tu sitio — queda fuera de línea hasta que lo publiques de nuevo"
                    aria-label="Pausar el sitio"
                  >
                    <PauseIcon />
                  </button>
                )}
                <button
                  type="button"
                  className="ch-save-btn pa-publish-btn"
                  onClick={() => setPubCardOpen((o) => !o)}
                  title="Tu sitio publicado"
                >
                  <StatusDot status={publishStatus} />
                  {siteStatus === "paused" ? "Pausado" : "Publicado"}
                </button>
              </div>
            )}

            {pubCardOpen && siteSub && siteStatus !== "none" && (
              <div className="pa-pub-card" role="dialog" aria-label="Tu sitio publicado">
                <a
                  className="pa-pub-thumb"
                  href={`/s/${siteSub}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir tu sitio"
                >
                  <iframe
                    // ?preview=<token> → muestra TU sitio aunque esté pausado
                    // (resolveSite lo resuelve por draftToken, no la landing).
                    src={`/s/${siteSub}?preview=${encodeURIComponent(convo.token)}`}
                    title="Vista previa del sitio"
                    tabIndex={-1}
                    scrolling="no"
                    aria-hidden="true"
                  />
                </a>
                <div className="pa-pub-actions">
                  <a
                    className="ch-save-btn"
                    href={`/s/${siteSub}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("published_site_opened", { subdomain: siteSub })}
                  >
                    Ver sitio
                  </a>
                  <button
                    type="button"
                    className="ch-save-btn pa-publish-btn"
                    onClick={publishAndOpen}
                    disabled={publishing}
                    title={
                      siteStatus === "paused"
                        ? "Publicar de nuevo y abrir tu sitio"
                        : "Actualizar y abrir tu sitio"
                    }
                  >
                    {publishing
                      ? "Publicando…"
                      : siteStatus === "paused"
                        ? "Publicar"
                        : "Actualizar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // "Guardar" sólo tiene sentido sin sesión (pide login). Con sesión ya
          // iniciada desaparece.
          !isSignedIn && convo.messages.length > 0 && (
            <button
              type="button"
              className="ch-save-btn"
              onClick={() => {
                setLoginHint(true);
                openProfileRef.current?.();
              }}
              title="Guardá tu historia iniciando sesión"
            >
              {convo.saving ? "Guardando…" : "Guardar"}
            </button>
          )
        )}
      </header>

      {approved ? (
        <PostApprove convo={convo} onStep={setPaStep} registerGoto={registerPaGoto} />
      ) : (
      <>
      <div className="ch-main" ref={mainRef} onScroll={onScroll}>
        <div className="ch-inner">
          {!convo.ready ? (
            <div className="ch-spin" />
          ) : empty ? (
            <div className="ch-hero">
              <h1 className="ch-hero-title">
                Contame la historia de <em>ustedes dos.</em>
              </h1>
              <p className="ch-hero-sub">{GREETING_SUBLINE}</p>

              <div className="ch-starters">
                {STARTER_IDEAS.map((s) => (
                  <button key={s.icon} className="ch-starter" onClick={() => send(s.prompt)}>
                    <span className="ch-starter-ic">
                      <StarterIcon name={s.icon} />
                    </span>
                    <span className="ch-starter-label">{s.label}</span>
                  </button>
                ))}
              </div>

              {composer(true)}
              {error && <div className="ch-error">{error}</div>}
            </div>
          ) : (
            <>
              {refining && convo.plan ? (
                // Refinando: el plan anterior colapsa como "historial" y la nueva
                // conversación (user + agente) queda DEBAJO de él.
                <>
                  <ChatMessages
                    messages={convo.messages.slice(0, refineSplit)}
                    streaming={false}
                    thinking={false}
                    onOption={send}
                  />
                  <PlanCard
                    plan={convo.plan}
                    template={convo.template}
                    onTemplate={applyTemplate}
                    palette={convo.palette}
                    customPalettes={convo.customPalettes}
                    onPalette={applyPalette}
                    onCreatePalette={convo.addCustomPalette}
                    onRefine={(instruction) => send(instruction)}
                    onAskMore={() => {}}
                    onCorrectAssumption={correctAssumption}
                    onRemoveSection={removeSection}
                    onFacts={correctFacts}
                    collapsed
                  />
                  <ChatMessages
                    messages={convo.messages.slice(refineSplit)}
                    streaming={sending}
                    thinking={thinking}
                    onOption={send}
                  />
                </>
              ) : (
                <>
                  <ChatMessages
                    messages={convo.messages}
                    streaming={sending}
                    thinking={thinking}
                    onOption={send}
                  />
                  {hasPlan && convo.plan && (
                    <PlanCard
                      plan={convo.plan}
                      template={convo.template}
                      onTemplate={applyTemplate}
                      palette={convo.palette}
                      customPalettes={convo.customPalettes}
                      onPalette={applyPalette}
                      onCreatePalette={convo.addCustomPalette}
                      onRefine={(instruction) => send(instruction)}
                      onAskMore={(sectionTitle) =>
                        send(
                          `Sobre la sección "${sectionTitle}": quiero darte más detalle. Hacé las preguntas que necesites para mejorarla.`,
                          { converse: true }
                        )
                      }
                      onCorrectAssumption={correctAssumption}
                      onRemoveSection={removeSection}
                      onFacts={correctFacts}
                    />
                  )}
                </>
              )}
              {error && <div className="ch-error">{error}</div>}
            </>
          )}
        </div>
      </div>

      {/* composer SIEMPRE fijo abajo (fuera del scroller: nunca desaparece) */}
      {convo.ready && !empty && !approved && (
        <div className="ch-footer">
          {/* flecha para bajar cuando scrolleás arriba */}
          {!atBottom && (
            <button
              type="button"
              className="ch-jump"
              onClick={() => scrollToBottom(true)}
              aria-label="Bajar al final"
            >
              <ArrowDown />
            </button>
          )}
          {composer(false)}
        </div>
      )}

      {!empty && (
        <SharedPanel
          items={shared}
          onReference={(label) => insertRef.current?.(`@${label}`)}
          onRename={renameRef}
        />
      )}

      {/* seleccionar texto del agente → "Responder" flotante (cita en el composer) */}
      {!empty && !approved && <SelectionReply onReply={(t) => quoteRef.current?.(t)} />}
      </>
      )}

      {loginHint && (
        <div className="ch-toast" role="status" onAnimationEnd={() => setLoginHint(false)}>
          Iniciá sesión para guardar tu historia.
        </div>
      )}

      {publishNotice && (
        <div className="ch-toast" role="status" onAnimationEnd={() => setPublishNotice(null)}>
          {publishNotice}
        </div>
      )}

      {publishErr && (
        <div className="ch-toast" role="status" onAnimationEnd={() => setPublishErr(null)}>
          {publishErr}
        </div>
      )}

      <ProfileMenu registerOpen={(fn) => (openProfileRef.current = fn)} />
    </div>
  );
}
