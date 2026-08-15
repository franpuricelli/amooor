// ─────────────────────────────────────────────────────────────────────────────
//  Template registry for the standalone template previews (WP-6).
//
//  Each entry is a self-contained, full-page template design rendered under
//  `app/template/[slug]/page.tsx` (español, default) and
//  `app/en/template/[slug]/page.tsx` (English). `render(locale)` returns the
//  fully-wired element for the active locale, so the routes stay generic and
//  each template picks its own per-locale content (mirrors the es ↔ en split
//  used by the marketing landing).
//
//  The editorial template ships wired to its PLAIN skeleton (content.plain.ts) —
//  a couple-agnostic demo. A per-couple adaptation (e.g. Puri & Ivi) lands its
//  own `content.ts` / `content.en.ts` and repoints the `editorial`/`romantic`
//  entries at it; see components/templates/editorial.md.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactElement } from "react";
import EditorialTemplate from "./editorial/EditorialTemplate";
import editorialEs from "./editorial/content";
import editorialEn from "./editorial/content.en";
import editorialPlain from "./editorial/content.plain";

export type Locale = "es" | "en";

export interface TemplatePreview {
  slug: string;
  name: string;
  description: string;
  render: (locale: Locale) => ReactElement;
}

export const TEMPLATE_PREVIEWS: Record<string, TemplatePreview> = {
  // "Matcha" — the story-structure template (its own option in the gallery,
  // distinct from the love-story skins romantic/editorial/brutalist). The
  // standalone preview shows the Puri & Ivi example (cream + matcha-green).
  matcha: {
    slug: "matcha",
    name: "Matcha",
    description:
      "Su historia completa: línea de tiempo, viajes, mural de fotos y dedicatoria. Neutros cálidos y acento verde matcha.",
    render: (locale) => (
      <EditorialTemplate content={locale === "en" ? editorialEn : editorialEs} />
    ),
  },
  plain: {
    slug: "plain",
    name: "Matcha (plantilla vacía)",
    description:
      "El esqueleto del template: misma estructura y diseño, con copy placeholder y sin fotos (bloques neutros). Para ver el diseño sin el contenido de una pareja.",
    render: () => <EditorialTemplate content={editorialPlain} />,
  },
};

export const getTemplatePreview = (slug: string): TemplatePreview | undefined =>
  TEMPLATE_PREVIEWS[slug];
