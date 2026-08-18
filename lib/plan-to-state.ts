// ─────────────────────────────────────────────────────────────────────────────
//  plan-to-state.ts — puente entre el PLAN del intake (lib/plan.ts) y el
//  WizardState (lib/draft.ts) que consume el generador determinista
//  (lib/generate.ts). Es lo que corre en el paso "build" post-aprobación:
//  Plan → WizardState → generateContent().
//
//  Reglas (spec §Phase 2):
//   - `plan.names` → couple + people.left.name / people.right.name.
//   - `plan.title`/`angle`/`tone` → `story` (alimenta el hero lede + beats).
//   - cada `plan.sections[]` → WizardSection { type: kind, id: slug(title),
//     title, aiPrompt: intent, categories: [slug(title)] }.
//   - la sección `closing` NO es un bloque de layout (es el Footer + DrawingFlip):
//     se DROPEA del WizardState. Igual le calculamos su categoría (para poder
//     mapear la imagen del dibujo → content.drawing.src en la ruta de generate).
//   - `categories[]` = los slugs por sección (para que generateContent ate fotos).
//
//  El slug de cada sección (= su categoría de fotos) se calcula UNA sola vez, con
//  dedupe estable, sobre TODAS las secciones del plan (incluido `closing`), así el
//  cliente de upload y el server usan exactamente la misma clave (`planSectionSlugs`).
// ─────────────────────────────────────────────────────────────────────────────

import { planNarrator, type Plan, type PlanSection } from "./plan";
import { zWizardState, type WizardState, type WizardSection } from "./draft";
import { slugifyCouple } from "./subdomain";

const PALETTES = ["rosa", "durazno", "lavanda", "menta", "cielo"] as const;
type PaletteName = (typeof PALETTES)[number];

/** Una sección del plan con su categoría de fotos (slug estable, deduplicado). */
export interface PlanSectionSlug {
  section: PlanSection;
  category: string;
}

/**
 * Calcula el slug/categoría de CADA sección del plan (incluye `closing`), con
 * dedupe estable en orden (si dos secciones colapsan al mismo slug, la 2ª recibe
 * `-2`, etc.). Fuente única de verdad de las categorías para upload + generate.
 */
export function planSectionSlugs(plan: Plan): PlanSectionSlug[] {
  const used = new Set<string>();
  return plan.sections.map((section) => {
    const base = slugifyCouple(section.title); // [a-z0-9-], sin acentos
    let category = base;
    let n = 2;
    while (used.has(category)) category = `${base}-${n++}`;
    used.add(category);
    return { section, category };
  });
}

/**
 * La categoría de fotos de la sección `closing` — de ahí sale la imagen del
 * dibujo del cierre (`content.drawing.src`). Vive acá, con el resto del mapeo
 * plan → estado, para que el cliente (paso de fotos) y el server (alta) no la
 * deriven cada uno por su cuenta.
 */
export function planClosingCategory(plan: Plan): string | undefined {
  return planSectionSlugs(plan).find((s) => s.section.kind === "closing")?.category;
}

/** ¿Está `p` entre las 5 paletas del template? Si no, cae a "rosa". */
function safePalette(p: string | undefined): PaletteName {
  return (PALETTES as readonly string[]).includes(p ?? "")
    ? (p as PaletteName)
    : "rosa";
}

/**
 * Plan (aprobado) → WizardState determinista para `generateContent`.
 * `palette` viene del draft (draft.theme.palette); default "rosa".
 */
export function planToWizardState(plan: Plan, palette?: string): WizardState {
  const names = plan.names.filter((n) => n && n.trim());
  const leftName = names[0] ?? "";
  const rightName = names[1] ?? "";
  const couple = names.length ? names.join(" & ") : "";

  const slugs = planSectionSlugs(plan);
  const sections: WizardSection[] = [];
  const categories: string[] = [];
  for (const { section, category } of slugs) {
    // `closing` no es un bloque de layout (Footer + DrawingFlip): no va al wizard.
    if (section.kind === "closing") continue;
    sections.push({
      type: section.kind, // narrowed: uno de los 7 tipos de layout
      id: category,
      title: section.title,
      enabled: true,
      aiPrompt: section.intent,
      categories: [category],
    });
    categories.push(category);
  }

  // El "story" libre alimenta el hero lede + el primer beat: usamos el ángulo
  // editorial del plan (título + de qué va + tono) como semilla de texto.
  const story = [plan.title, plan.angle, plan.tone]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(". ");

  return zWizardState.parse({
    couple,
    people: {
      left: { name: leftName },
      right: { name: rightName },
    },
    // El aniversario sale del intake (skills/orchestrator lo pregunta): alimenta
    // el contador, el eyebrow del hero y la línea del cierre. Sin él, esos campos
    // quedan vacíos — NUNCA con la fecha de la demo.
    dates: { together: plan.dates.together, met: plan.dates.met },
    narrator: planNarrator(plan).you,
    story,
    sections,
    categories,
    palette: safePalette(palette),
  });
}
