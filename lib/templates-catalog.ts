// ─────────────────────────────────────────────────────────────────────────────
//  templates-catalog.ts — el catálogo de PLANTILLAS que el usuario elige en el
//  chooser que vive arriba del plan (components/chat/TemplateChooser.tsx).
//
//  ⚠️ SCAFFOLD (task 2-A): hoy elegir una plantilla SOLO guarda la preferencia;
//  el sitio del tenant se sigue renderizando siempre con PreviewSite +
//  SECTION_REGISTRY + paleta. Cada `previewHref` apunta al export estático
//  standalone en `/template/<id>` (app/template/<id>/page.tsx), que se abre en una
//  pestaña nueva. Conectar la elección al render real (que la plantilla cambie el
//  sitio generado) es task 2-B — ver `.context/task-2b-template-integration.md`.
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplateOption {
  id: string;
  label: string;
  /** una línea de "de qué va" el estilo */
  blurb: string;
  /** preview standalone (export estático) — se abre en pestaña nueva */
  previewHref: string;
  /** estilo del mini-mock del card (solo estético, no cambia el sitio) */
  vibe: "romantic" | "editorial" | "brutalist";
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
];

export const DEFAULT_TEMPLATE_ID = TEMPLATE_OPTIONS[0].id;

/** Galería con TODAS las plantillas (destino de "ver todos" en el chooser). */
export const TEMPLATES_GALLERY_HREF = "/template";

/** clave de localStorage donde guardamos la plantilla elegida (scaffold). */
export const TEMPLATE_STORAGE_KEY = "amooor_template";
