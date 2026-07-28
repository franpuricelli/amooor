// ─────────────────────────────────────────────────────────────────────────────
//  template.ts — el contrato del template de aniversario (WP-1).
//  `TemplateManifest` es lo que la plataforma multi-tenant (WP-2) consume para
//  renderizar cualquier tenant: valida su `content` con `contentSchema`, aplica
//  su `theme` (paleta) y renderiza las secciones declaradas en `content.layout`.
//
//  Un template nuevo (WP-6) implementa este mismo contrato con otro schema,
//  paletas, secciones y renderer.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { content, type Content, type SectionType } from "./content";
import {
  palettes,
  defaultPaletteId,
  type Palette,
  type PaletteId,
} from "./theme";

// ── contentSchema (Zod) ──────────────────────────────────────────────────────
const trait = z.object({ icon: z.string(), label: z.string() });
const artist = z.object({ name: z.string(), img: z.string().optional() });
const person = z.object({
  name: z.string(),
  tagline: z.string(),
  zoneLabel: z.string(),
  traits: z.array(trait),
  artists: z.array(artist),
});
const storyBeat = z.object({
  kicker: z.string(),
  title: z.string(),
  titleHeart: z.boolean().optional(),
  text: z.string(),
  cats: z.array(z.string()),
  picks: z.array(z.tuple([z.string(), z.number()])),
  flip: z.boolean().optional(),
});
const sectionType: z.ZodType<SectionType> = z.enum([
  "hero",
  "story",
  "travel",
  "moments",
  "watch",
  "stats",
  "gallery",
]);
const watchItem = z.object({
  title: z.string(),
  kind: z.enum(["peli", "serie"]),
  fav: z.boolean(),
  note: z.string().optional(),
});

export const contentSchema = z.object({
  site: z.object({
    locale: z.string(),
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    themeColor: z.string(),
  }),
  couple: z.string(),
  dates: z.object({
    together: z.string(),
    met: z.string(),
    anniversaryYears: z.number(),
  }),
  layout: z.array(
    z.object({ type: sectionType, id: z.string(), enabled: z.boolean() })
  ),
  hero: z.object({
    eyebrow: z.string(),
    nameStart: z.string(),
    nameEnd: z.string(),
    lede: z.string(),
    bgAlt: z.string(),
    pixelSrc: z.string().nullable(),
    cat: z.string(),
    slug: z.string(),
  }),
  people: z.object({
    artistsLabel: z.string(),
    left: person,
    right: person,
  }),
  story: z.record(z.object({ beats: z.array(storyBeat) })),
  travel: z.object({
    kicker: z.string(),
    title: z.string(),
    lede: z.string(),
    destinations: z.array(
      z.object({
        cat: z.string(),
        title: z.string(),
        place: z.string(),
        flag: z.string().optional(),
        emoji: z.string().optional(),
      })
    ),
  }),
  moments: z.object({
    kicker: z.string(),
    title: z.string(),
    lede: z.string(),
    cards: z.array(
      z.object({
        cat: z.string(),
        title: z.string(),
        emoji: z.string().optional(),
        flag: z.string().optional(),
      })
    ),
  }),
  watch: z.object({
    kicker: z.string(),
    title: z.string(),
    lede: z.string(),
    moreLabel: z.string(),
    video: z.object({
      provider: z.enum(["tiktok", "video"]),
      label: z.string(),
      url: z.string(),
      videoId: z.string(),
      caption: z.string(),
      src: z.string().nullable(),
      poster: z.string().nullable(),
    }),
    list: z.array(watchItem),
  }),
  stats: z.object({
    kicker: z.string(),
    labels: z.object({
      days: z.string(),
      hours: z.string(),
      mins: z.string(),
      secs: z.string(),
    }),
    chips: z.array(z.string()),
    metLead: z.string(),
    metDate: z.string(),
    metAgoPrefix: z.string(),
    metAgoSuffix: z.string(),
  }),
  gallery: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    cta: z.string(),
    closeLabel: z.string(),
  }),
  footer: z.object({
    title: z.string(),
    line: z.string(),
    credit: z.string(),
  }),
  drawing: z.object({
    src: z.string(),
    alt: z.string(),
    frontAria: z.string(),
    backAria: z.string(),
    message: z.string(),
    from: z.string(),
  }),
  music: z.object({
    cat: z.string(),
    slug: z.string(),
    playLabel: z.string(),
    pauseLabel: z.string(),
  }),
  ui: z.object({
    photosCount: z.string(),
    seeAllPhotos: z.string(),
    photoAria: z.string(),
    albumAria: z.string(),
    momentAria: z.string(),
    photoView: z.string(),
    close: z.string(),
    photoN: z.string(),
    prev: z.string(),
    next: z.string(),
    seeAllGrid: z.string(),
    backFromGrid: z.string(),
  }),
});

/** El `theme` de un tenant: una paleta base + overrides opcionales. */
export const themeSchema = z.object({
  palette: z.enum(["rosa", "durazno", "lavanda", "menta", "cielo"]),
  overrides: z.record(z.string()).optional(),
});
export type Theme = { palette: PaletteId; overrides?: Partial<Palette> };

// ── TemplateManifest ─────────────────────────────────────────────────────────
export interface TemplateManifest {
  id: string;
  name: string;
  contentSchema: typeof contentSchema;
  themeSchema: typeof themeSchema;
  palettes: Record<PaletteId, Palette>;
  sectionTypes: SectionType[];
  defaultContent: Content;
  defaultTheme: Theme;
}

export const anniversaryTemplate: TemplateManifest = {
  id: "anniversary",
  name: "Aniversario",
  contentSchema,
  themeSchema,
  palettes,
  sectionTypes: ["hero", "story", "travel", "moments", "watch", "stats", "gallery"],
  defaultContent: content,
  defaultTheme: { palette: defaultPaletteId },
};

/** El tipo de un `content` validado (inferido del schema). */
export type ParsedContent = z.infer<typeof contentSchema>;

/** Valida un content de tenant contra el schema (lanza si no cumple). */
export const parseContent = (data: unknown): ParsedContent => contentSchema.parse(data);
