// ─────────────────────────────────────────────────────────────────────────────
//  templates-catalog.ts — el catálogo de PLANTILLAS que el usuario elige en el
//  chooser que vive arriba del plan (components/chat/TemplateChooser.tsx).
//
//  La elección SÍ cambia el render (task 2-B): `id` se guarda en
//  `draft.theme.template` y se aplica como `[data-template="<id>"]` sobre el
//  sitio (skin de tipografía/superficies en app/globals.css). Ver el flujo y el
//  checklist para agregar plantillas en `docs/templates/README.md`; cada
//  plantilla tiene su `docs/templates/<id>.md`. Cada `previewHref` apunta además
//  al export estático standalone en `/template/<id>` (app/template/<id>/page.tsx).
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplateOption {
  id: string;
  label: string;
  /** una línea de "de qué va" el estilo */
  blurb: string;
  /** preview standalone — se abre en pestaña nueva */
  previewHref: string;
  /** estilo del mini-mock del card + id del skin `[data-template]` que aplica */
  vibe: "romantic" | "editorial" | "brutalist" | "matcha";
  /** true = `previewHref` es una ruta React (se embebe/abre directo), no un
   *  export estático servido en `<previewHref>/index.html`. Lo usa "matcha", que
   *  es una plantilla de OTRA estructura (no un skin), no un export estático. */
  previewIsRoute?: boolean;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "romantic",
    label: "Romántica",
    blurb: "Cálida y suave, la de Puri & Ivi.",
    previewHref: "/template/romantic",
    vibe: "romantic",
  },
  {
    id: "editorial",
    label: "Editorial",
    blurb: "Tipografía grande, aire y calma.",
    previewHref: "/template/editorial",
    vibe: "editorial",
  },
  {
    id: "brutalist",
    label: "Brutalista",
    blurb: "Contraste fuerte, bloques y borde.",
    previewHref: "/template/brutalist",
    vibe: "brutalist",
  },
  {
    id: "matcha",
    label: "Matcha",
    blurb: "Su historia completa: línea de tiempo, viajes y mural.",
    // The chooser/gallery preview the TEMPLATE itself (empty skeleton), not a
    // specific couple. Filled examples live at /examples/<slug>.
    previewHref: "/template/matcha",
    vibe: "matcha",
    previewIsRoute: true,
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATE_OPTIONS[0].id;

/** Galería con TODAS las plantillas (destino de "ver todos" en el chooser). */
export const TEMPLATES_GALLERY_HREF = "/template";

/** clave de localStorage donde guardamos la plantilla elegida (scaffold). */
export const TEMPLATE_STORAGE_KEY = "amooor_template";
