// ─────────────────────────────────────────────────────────────────────────────
//  plan.ts — el PLAN de ejecución que dropea el agente de intake (chat-first).
//
//  Es la salida del "thinking pass" (síntesis) del agente y lo que renderiza la
//  tarjeta de plan (components/chat/PlanCard.tsx) con las CTAs Refinar/Aprobar.
//  Se persiste en `drafts.intakePlan` (Convex). En v2 este plan se mapea a
//  `zWizardState` → `generateContent()` → checkout (ver stub del paywall).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

/**
 * Tipos de sección que el template de aniversario sabe renderizar. Los primeros 7
 * son las secciones de `layout` (FUENTE DE VERDAD: lib/content.ts SectionType,
 * líneas 15-22 — en sync con lib/template.ts, lib/draft.ts). `closing` es el
 * CIERRE del sitio (componente Footer + DrawingFlip): va SIEMPRE al final, con un
 * dibujo/imagen customizable por pareja que se da vuelta y revela un mensaje, más
 * el saludo de aniversario y el contador de años. El plan del intake se piensa
 * SOBRE este repertorio fijo (adaptamos el template, no inventamos secciones).
 */
export const SECTION_KINDS = [
  "hero",
  "story",
  "travel",
  "moments",
  "watch",
  "stats",
  "gallery",
  "closing",
] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];
export const zSectionKind = z.enum(SECTION_KINDS);

/** Etiqueta legible (ES) por tipo de sección — la muestra la tarjeta del plan. */
export const SECTION_KIND_LABELS: Record<SectionKind, string> = {
  hero: "Portada",
  story: "Historia",
  travel: "Viajes",
  moments: "Momentos",
  watch: "Pelis y series",
  stats: "Contador",
  gallery: "Galería",
  closing: "Cierre",
};

/** Una sección propuesta del sitio: mapeada a un bloque del template. */
export const zPlanSection = z.object({
  /** tipo de bloque del template al que se adapta esta sección */
  kind: zSectionKind.default("story").catch("story"),
  title: z.string().min(1),
  intent: z.string().min(1),
});
export type PlanSection = z.infer<typeof zPlanSection>;

/** El plan estructurado que el agente propone tras entender la historia. */
export const zPlan = z.object({
  /** nombres de las dos personas (para personalizar el título del plan) */
  names: z.array(z.string()).default([]),
  /** título/ángulo editorial del sitio (voz de la pareja) */
  title: z.string().min(1),
  /** el ángulo narrativo en 1–2 frases: de qué va este sitio */
  angle: z.string().min(1),
  /** el tono emocional / vibe (p.ej. "cálido y divertido, sin cursilería") */
  tone: z.string().min(1),
  /** lista ordenada de secciones con su intención */
  sections: z.array(zPlanSection).min(1),
  /** supuestos que asumió el agente (se muestran para que el usuario los corrija) */
  assumptions: z.array(z.string()).default([]),
});
export type Plan = z.infer<typeof zPlan>;

/** Valida/normaliza un plan (venga del LLM o rehidratado del draft). null si no es válido. */
export function parsePlan(data: unknown): Plan | null {
  const res = zPlan.safeParse(data);
  return res.success ? res.data : null;
}
