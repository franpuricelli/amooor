// ─────────────────────────────────────────────────────────────────────────────
//  analytics.ts — catálogo de eventos de usuario + wrapper de PostHog (browser).
//
//  Todo es no-op sin `NEXT_PUBLIC_POSTHOG_KEY`: el producto anda igual en local y
//  en previews sin ensuciar el proyecto de analytics. La inicialización la hace
//  <PostHogProvider> (components/analytics/PostHogProvider.tsx), no este módulo.
//
//  Convenciones:
//   - nombres en snake_case, objeto_verbo en pasado (`site_published`).
//   - propiedades en snake_case, sin PII libre (nunca el texto del chat ni el
//     copy del sitio: sólo longitudes, cantidades y flags).
//   - los eventos del funnel se unen por `draft_token` (super-propiedad), así una
//     sesión anónima que después se loguea sigue siendo el mismo embudo.
//
//  El catálogo vive en `EventProps`: agregar un evento = agregar una fila ahí.
//  Doc para producto/marketing: docs/analytics.md.
// ─────────────────────────────────────────────────────────────────────────────

import posthog from "posthog-js";

/** Superficie del producto (misma app, tres caras — ver CLAUDE.md). */
export type Surface = "marketing" | "builder" | "tenant";

/** Catálogo tipado: nombre del evento → propiedades que lo acompañan. */
export interface EventProps {
  // ── marketing (amooor.com) ────────────────────────────────────────────────
  landing_cta_clicked: {
    location: "nav" | "hero" | "pricing" | "closing";
    /** id del plan cuando el CTA sale de la grilla de precios */
    plan?: string;
  };

  // ── cuenta (Clerk) ────────────────────────────────────────────────────────
  /** primer login de una cuenta recién creada (createdAt < 5 min) */
  user_signed_up: { method: "clerk" };
  /** login de una cuenta existente (una vez por sesión de browser) */
  user_signed_in: { method: "clerk" };
  /** el soft gate abrió el modal de Clerk en vez de mandar el mensaje */
  signup_gate_shown: { at: "chat_send" };

  // ── /comenzar: entrevista ─────────────────────────────────────────────────
  builder_opened: { returning: boolean; plan?: string };
  chat_message_sent: {
    mode: "chat" | "refine" | "converse";
    /** largo del mensaje en caracteres (nunca el texto) */
    length: number;
    has_attachments: boolean;
    has_refs: boolean;
    has_quotes: boolean;
  };
  chat_reply_received: { mode: "chat" | "refine" | "converse"; ms: number };
  chat_reply_failed: { mode: "chat" | "refine" | "converse"; ms: number; reason: string };
  /** el agente devolvió un plan (primero o refinado) */
  plan_generated: { sections: number; kinds: string[]; refined: boolean };
  /** llegó un "plan" que no pasa el contrato (zPlan) → la UI avisa en vez de callar */
  plan_invalid: Record<string, never>;
  plan_section_removed: { kind: string; remaining: number };
  plan_assumption_corrected: { remaining: number };
  /** la pareja corrigió a mano los datos duros del plan (tarjeta del plan) */
  plan_narrator_set: Record<string, never>;
  /** corrigieron a mano el género de una de las dos personas */
  plan_pronoun_set: { had_pronoun: boolean };
  plan_anniversary_set: { had_date: boolean };
  plan_approved: { sections: number; palette: string; template: string };
  /** atajo de dev "skip wizard" — sirve para excluir sesiones internas */
  demo_plan_loaded: Record<string, never>;

  // ── /comenzar: fotos y música ─────────────────────────────────────────────
  media_upload_started: { category: string; kind: "image" | "video"; count: number };
  media_uploaded: { category: string; kind: "image" | "video"; ms: number };
  media_upload_failed: { category: string; kind: "image" | "video"; reason: string };
  media_deleted: { kind: "image" | "video" };
  music_uploaded: { ms: number };
  music_removed: Record<string, never>;
  /** el usuario cerró el paso de fotos (CTA "Crear mi sitio" / "Listo") */
  photos_step_completed: { photos: number; videos: number; has_music: boolean; first_build: boolean };
  /** volvió a fotos desde el editor ("Agregar más fotos") */
  photos_step_reopened: Record<string, never>;

  // ── /comenzar: build ──────────────────────────────────────────────────────
  site_build_started: Record<string, never>;
  site_build_succeeded: { ms: number; sections: number };
  site_build_failed: { ms: number; reason: string };

  // ── /comenzar: editor ─────────────────────────────────────────────────────
  editor_opened: { sections: number };
  /** una edición de copy inline, ya debounceada (no por tecla) */
  editor_text_edited: { path: string };
  editor_message_sent: { length: number };
  editor_reply_received: { ms: number };
  editor_reply_failed: { ms: number; reason: string };
  palette_changed: { palette: string; custom: boolean; surface: "plan" | "editor" };
  template_changed: { template: string; surface: "plan" | "editor" };

  // ── publicación ───────────────────────────────────────────────────────────
  site_publish_started: { action: "publish" | "pause"; republish: boolean };
  site_published: { subdomain: string; republish: boolean; ms: number };
  site_paused: { subdomain: string };
  site_publish_failed: { action: "publish" | "pause"; reason: string };
  /** abrió el sitio publicado desde la card del header */
  published_site_opened: { subdomain: string };
}

export type EventName = keyof EventProps;

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let started = false;

/** ¿Hay key? Sin ella todo el módulo es no-op (y el provider no monta nada). */
export function isAnalyticsEnabled(): boolean {
  return !!KEY;
}

/** Arranca PostHog una sola vez, en el browser. Idempotente. */
export function initAnalytics(): void {
  if (started || !KEY || typeof window === "undefined") return;
  started = true;
  posthog.init(KEY, {
    api_host: HOST,
    // App Router: los pageviews los mandamos a mano en el provider (el init sólo
    // ve la primera URL, y las navegaciones client-side no recargan la página).
    capture_pageview: false,
    capture_pageleave: true,
    // Los sitios de las parejas son públicos: sin perfil de persona para visitas
    // anónimas, sólo para quien se loguea a construir.
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    defaults: "2025-05-24",
  });
}

/** Manda un evento del catálogo. No-op si PostHog no arrancó. */
export function track<E extends EventName>(event: E, props?: EventProps[E]): void {
  if (!started) return;
  posthog.capture(event, props);
}

/** `$pageview` manual (una por navegación del App Router). */
export function capturePageview(): void {
  if (!started) return;
  posthog.capture("$pageview");
}

/**
 * Super-propiedades que viajan en TODOS los eventos siguientes. `draft_token` es
 * la que une el embudo entero (anónimo → logueado → publicado).
 */
export function registerContext(props: {
  surface?: Surface;
  draft_token?: string;
  template?: string;
  palette?: string;
}): void {
  if (!started) return;
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null));
  if (Object.keys(clean).length) posthog.register(clean);
}

/** Asocia los eventos a la cuenta de Clerk (y setea las props de la persona). */
export function identifyUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
}): void {
  if (!started) return;
  posthog.identify(user.id, {
    ...(user.email ? { email: user.email } : {}),
    ...(user.name ? { name: user.name } : {}),
  });
}

/** Logout: cortá la sesión de PostHog para no pegarle eventos a la cuenta vieja. */
export function resetAnalytics(): void {
  if (!started) return;
  posthog.reset();
}
