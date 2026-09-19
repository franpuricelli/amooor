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

/**
 * Normaliza una fecha del LLM a ISO `yyyy-mm-dd`. Acepta lo que suele dropear:
 * ISO, `dd/mm/yyyy`, `dd-mm-yyyy` y `yyyy-mm` (→ día 1). Cualquier otra cosa
 * (incluido "no sé") queda como "" y el sitio simplemente no muestra la fecha.
 */
export function normalizePlanDate(input: unknown): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return "";
  const iso = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(raw);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, "0")}-${(d ?? "1").padStart(2, "0")}`;
  }
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(raw);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

const zPlanDates = z
  .object({
    /** aniversario: desde cuándo están juntos (ancla del contador y del hero) */
    together: z.unknown().transform(normalizePlanDate).default(""),
    /** el día que se conocieron (opcional, alimenta el bloque del contador) */
    met: z.unknown().transform(normalizePlanDate).default(""),
  })
  .default({ together: "", met: "" });

/**
 * Género de una persona, tal como lo dijo quien arma el sitio. Es un dato del
 * intake (nunca deducido del nombre); "elle" cubre lo no binario. Un valor que no
 * sea uno de estos se descarta y esa persona se escribe en neutro.
 */
export const PRONOUNS = ["el", "ella", "elle"] as const;
export type Pronoun = (typeof PRONOUNS)[number];

/** Etiqueta legible de cada género — la muestran los chips de la tarjeta del plan. */
export const PRONOUN_LABELS: Record<Pronoun, string> = {
  el: "él",
  ella: "ella",
  elle: "elle",
};

/** Normaliza lo que dropee el modelo ("Él", "she", "masculino") a un Pronoun. */
function normalizePronoun(input: unknown): Pronoun | null {
  const raw = (typeof input === "string" ? input : "").trim().toLowerCase();
  const alias: Record<string, Pronoun> = {
    el: "el",
    "él": "el",
    he: "el",
    him: "el",
    masculino: "el",
    varon: "el",
    "varón": "el",
    hombre: "el",
    ella: "ella",
    she: "ella",
    her: "ella",
    femenino: "ella",
    mujer: "ella",
    elle: "elle",
    they: "elle",
    them: "elle",
    "no binarie": "elle",
    "no binario": "elle",
  };
  return alias[raw] ?? null;
}

/**
 * El mapa nombre → género, tolerante: descarta las entradas que no reconoce en vez
 * de invalidar el plan entero (perder el plan por un pronombre raro sería peor que
 * escribir a esa persona en neutro).
 */
const zPronouns = z
  .unknown()
  .transform((raw) => {
    const out: Record<string, Pronoun> = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
        const key = name.trim();
        const p = normalizePronoun(value);
        if (key && p) out[key] = p;
      }
    }
    return out;
  })
  .default({});

/** El plan estructurado que el agente propone tras entender la historia. */
export const zPlan = z
  .object({
    /** nombres de las dos personas (para personalizar el título del plan) */
    names: z.array(z.string()).default([]),
    /** cuál de los dos es la persona que está armando el sitio (su nombre tal
     *  cual aparece en `names`). Firma el cierre y el crédito del footer. */
    you: z.string().default(""),
    /** género de cada persona, por nombre: { "Ivi": "ella" }. Se PREGUNTA en el
     *  intake y nunca se deduce del nombre (skills/orchestrator): con esto se
     *  escribe el copy del sitio, así que suponerlo lo rompe entero. Falta el de
     *  alguien → esa persona se escribe en neutro. */
    pronouns: zPronouns,
    /** las fechas de la pareja (aniversario + cuándo se conocieron) */
    dates: zPlanDates,
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
  })
  // Invariantes de estructura del template (el skill `adapt` los exige en prosa; acá
  // los garantizamos): el sitio SIEMPRE abre con un único `hero` y cierra con un único
  // `closing`. Si el modelo dropea algo mal formado, `parsePlan` devuelve null y la
  // ruta sigue la charla en vez de construir un sitio roto.
  .superRefine((plan, ctx) => {
    const kinds = plan.sections.map((s) => s.kind);
    const heroes = kinds.filter((k) => k === "hero").length;
    const closings = kinds.filter((k) => k === "closing").length;
    if (heroes !== 1 || kinds[0] !== "hero") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El plan debe empezar con exactamente un 'hero'.",
        path: ["sections"],
      });
    }
    if (closings !== 1 || kinds[kinds.length - 1] !== "closing") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El plan debe terminar con exactamente un 'closing'.",
        path: ["sections"],
      });
    }
  });
export type Plan = z.infer<typeof zPlan>;

/** Valida/normaliza un plan (venga del LLM o rehidratado del draft). null si no es válido. */
export function parsePlan(data: unknown): Plan | null {
  const res = zPlan.safeParse(data);
  return res.success ? res.data : null;
}

/**
 * El género de una persona del plan, por nombre (tolerante a mayúsculas y
 * espacios). "" si no se preguntó: quien escriba tiene que ir a neutro.
 */
export function planPronoun(plan: Plan, name: string): Pronoun | "" {
  const want = name.trim().toLowerCase();
  if (!want) return "";
  const hit = Object.entries(plan.pronouns).find(
    ([n]) => n.trim().toLowerCase() === want
  );
  return hit ? hit[1] : "";
}

/**
 * El nombre de quien arma el sitio y el de su pareja, según `plan.you`. Si el
 * plan no lo trae (o no matchea), asumimos el primero de `names` — pero el
 * intake lo pregunta explícitamente (skills/orchestrator).
 */
export function planNarrator(plan: Plan): { you: string; partner: string } {
  const names = plan.names.map((n) => n.trim()).filter(Boolean);
  const norm = (s: string) => s.toLowerCase();
  const i = plan.you ? names.findIndex((n) => norm(n) === norm(plan.you.trim())) : -1;
  const idx = i >= 0 ? i : 0;
  return { you: names[idx] ?? "", partner: names[idx === 0 ? 1 : 0] ?? "" };
}
