// ─────────────────────────────────────────────────────────────────────────────
//  plan.ts — el PLAN de ejecución que dropea el agente de intake (chat-first).
//
//  Es la salida del "thinking pass" (síntesis) del agente y lo que renderiza la
//  tarjeta de plan (components/chat/PlanCard.tsx) con las CTAs Refinar/Aprobar.
//  Se persiste en `drafts.intakePlan` (Convex). En v2 este plan se mapea a
//  `zWizardState` → `generateContent()` → checkout (ver stub del paywall).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

/** Una sección propuesta del sitio: título + intención en una línea. */
export const zPlanSection = z.object({
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
