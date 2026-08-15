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
import editorialPlain from "./editorial/content.plain";

export type Locale = "es" | "en";

export interface TemplatePreview {
  slug: string;
  name: string;
  description: string;
  render: (locale: Locale) => ReactElement;
}

export const TEMPLATE_PREVIEWS: Record<string, TemplatePreview> = {
  editorial: {
    slug: "editorial",
    name: "Historia",
    description:
      "Plantilla editorial narrativa para contar la historia de una pareja. Serif elegante, neutros cálidos y acento oliva.",
    render: () => <EditorialTemplate content={editorialPlain} />,
  },
  romantic: {
    slug: "romantic",
    name: "Romántica",
    description:
      "Misma estructura narrativa que Historia, con una piel romántica: fondos blush, acento rosa/vino y detalles en itálica.",
    render: () => <EditorialTemplate content={editorialPlain} variant="romantic" />,
  },
  plain: {
    slug: "plain",
    name: "Historia (plantilla vacía)",
    description:
      "El esqueleto del template: misma estructura y diseño, con copy placeholder y sin fotos (bloques neutros). Para ver el diseño sin el contenido de una pareja.",
    render: () => <EditorialTemplate content={editorialPlain} />,
  },
};

export const getTemplatePreview = (slug: string): TemplatePreview | undefined =>
  TEMPLATE_PREVIEWS[slug];
