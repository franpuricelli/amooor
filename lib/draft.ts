// ─────────────────────────────────────────────────────────────────────────────
//  draft.ts — el estado del wizard (WP-3, §2 del PLAN). Es el CONTRATO entre la
//  UI del wizard (components/wizard/*) y el generador (lib/generate.ts): el wizard
//  sólo captura lo que el usuario aporta; el generador lo expande a un `Content`
//  completo y válido (contentSchema) usando los defaults del template.
//
//  Se persiste tal cual en `drafts.answers` (Convex). Cambiar este shape sin migrar
//  rompe drafts guardados — es un contrato versionable.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { PaletteId } from "./theme";
import type { PlanId } from "./pricing";
import type { SectionType } from "./content";

// ── sub-schemas ──────────────────────────────────────────────────────────────
export const zTrait = z.object({ icon: z.string(), label: z.string() });

export const zPersonProfile = z.object({
  name: z.string(),
  nickname: z.string().default(""),
  /** género con el que se escribe a esta persona ("el" | "ella" | "elle"); "" =
   *  no se preguntó → el copy va en neutro. Viene del intake (`plan.pronouns`). */
  pronoun: z.string().default(""),
  /** personalidad en texto libre → insumo IA para las traits/narrativa */
  personality: z.string().default(""),
  bands: z.array(z.string()).default([]),
  traits: z.array(zTrait).default([]),
});
export type PersonProfile = z.infer<typeof zPersonProfile>;

export const zWizardSection = z.object({
  /** qué renderer del template usa esta sección */
  type: z.enum([
    "hero",
    "story",
    "travel",
    "moments",
    "watch",
    "stats",
    "gallery",
  ]),
  /** id estable (slug) — clave en content.story / ancla del nav */
  id: z.string(),
  /** título renombrable por el usuario */
  title: z.string(),
  enabled: z.boolean().default(true),
  /** "editar por texto con IA": qué quiere el usuario que diga la sección */
  aiPrompt: z.string().default(""),
  /** categorías de fotos que alimentan la sección */
  categories: z.array(z.string()).default([]),
});
export type WizardSection = z.infer<typeof zWizardSection>;

export const zWatchItem = z.object({
  title: z.string(),
  kind: z.enum(["peli", "serie"]),
  fav: z.boolean().default(false),
  note: z.string().optional(),
});

export const zDestination = z.object({
  cat: z.string(),
  title: z.string(),
  place: z.string(),
  flag: z.string().optional(),
  emoji: z.string().optional(),
});

export const zMusic = z.object({
  mode: z.enum(["library", "upload", "none"]).default("library"),
  cat: z.string().optional(),
  slug: z.string().optional(),
  libraryId: z.string().optional(),
  url: z.string().optional(), // subida propia (Cloudflare/Convex)
});

export const zVideo = z.object({
  mode: z.enum(["none", "tiktok", "upload"]).default("none"),
  url: z.string().optional(),
  videoId: z.string().optional(),
  src: z.string().optional(),
  poster: z.string().optional(),
  caption: z.string().default(""),
});

// ── WizardState ──────────────────────────────────────────────────────────────
export const zWizardState = z.object({
  couple: z.string().default(""),
  dates: z
    .object({
      together: z.string().default(""), // ISO yyyy-mm-dd (aniversario)
      met: z.string().default(""), // ISO yyyy-mm-dd (cómo se conocieron)
    })
    .default({ together: "", met: "" }),
  people: z
    .object({ left: zPersonProfile, right: zPersonProfile })
    .default({
      left: zPersonProfile.parse({ name: "" }),
      right: zPersonProfile.parse({ name: "" }),
    }),
  /** quién de los dos está armando el sitio (nombre): firma el cierre y el
   *  crédito del footer. Viene del intake (`plan.you`). */
  narrator: z.string().default(""),
  /** descripción libre de la historia → insumo IA */
  story: z.string().default(""),
  /** secciones editables (agregar/quitar/renombrar/reordenar/editar por IA) */
  sections: z.array(zWizardSection).default([]),
  /** categorías de fotos definidas por el usuario (una carpeta = una categoría) */
  categories: z.array(z.string()).default([]),
  destinations: z.array(zDestination).default([]),
  watchlist: z.array(zWatchItem).default([]),
  music: zMusic.default({ mode: "library" }),
  video: zVideo.default({ mode: "none" }),
  palette: z
    .enum(["rosa", "durazno", "lavanda", "menta", "cielo"])
    .default("rosa"),
  domainWish: z.string().default(""),
});
export type WizardState = z.infer<typeof zWizardState>;

// ── secciones recomendadas del template de aniversario ───────────────────────
/** Lo que trae por defecto el wizard en el paso "Secciones" (§2.4). El usuario
 *  agrega/quita/renombra/reordena sobre esta base. */
export const RECOMMENDED_SECTIONS: WizardSection[] = [
  { type: "hero", id: "hero", title: "Portada", enabled: true, aiPrompt: "", categories: [] },
  { type: "story", id: "historia", title: "Nuestra historia", enabled: true, aiPrompt: "", categories: [] },
  { type: "travel", id: "viajes", title: "Viajes", enabled: true, aiPrompt: "", categories: [] },
  { type: "story", id: "cocina", title: "Cocina", enabled: true, aiPrompt: "", categories: [] },
  { type: "moments", id: "momentos", title: "Momentos", enabled: true, aiPrompt: "", categories: [] },
  { type: "watch", id: "pelis", title: "Pelis & series", enabled: true, aiPrompt: "", categories: [] },
  { type: "stats", id: "stats", title: "Contador", enabled: true, aiPrompt: "", categories: [] },
  { type: "gallery", id: "galeria", title: "Todas las fotos", enabled: true, aiPrompt: "", categories: [] },
];

/** El bucket de fotos no categorizadas (§2.5). Siempre presente. */
export const ALL_CATEGORY = "all";

/** Un WizardState en blanco con las secciones recomendadas. */
export function defaultWizardState(): WizardState {
  return zWizardState.parse({
    sections: RECOMMENDED_SECTIONS.map((s) => ({ ...s })),
    categories: [ALL_CATEGORY],
  });
}

/** Valida/normaliza un draft persistido (aplica defaults a shapes viejos). */
export function parseWizardState(data: unknown): WizardState {
  return zWizardState.parse(data ?? {});
}

// Re-exports de conveniencia para la UI del wizard.
export type { PaletteId, PlanId, SectionType };
