"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  TemplateChooser.tsx — el selector de PLANTILLA (3 cards) que va dentro del
//  PlanCard. Cada card muestra el export standalone REAL (escalado como preview,
//  no interactivo) + "ver" para abrirlo en grande; "ver todos" abre la galería
//  completa (/template) DEBAJO de la grilla.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TEMPLATE_OPTIONS,
  TEMPLATES_GALLERY_HREF,
} from "@/lib/templates-catalog";

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function TemplateChooser({
  template,
  onTemplate,
}: {
  template: string;
  onTemplate: (id: string) => void;
}) {
  return (
    <section className="ch-choice-block">
      <div className="ch-choice-block-head">
        <h3 className="ch-choice-block-title">Plantilla</h3>
      </div>
      <ul className="ch-tpl-grid">
        {TEMPLATE_OPTIONS.map((t) => {
          const on = template === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                className={`ch-tpl-card ${on ? "on" : ""}`}
                aria-pressed={on}
                onClick={() => onTemplate(t.id)}
              >
                <span className="ch-tpl-preview">
                  <iframe
                    className="ch-tpl-shot"
                    src={`${t.previewHref}/index.html`}
                    title={`Plantilla ${t.label}`}
                    loading="lazy"
                    scrolling="no"
                    tabIndex={-1}
                  />
                  <a
                    className="ch-tpl-view"
                    href={t.previewHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EyeIcon /> ver
                  </a>
                </span>
                <span className="ch-tpl-meta">
                  <span className="ch-tpl-name">{t.label}</span>
                  <span className="ch-tpl-blurb">{t.blurb}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="ch-tpl-all-row">
        <a
          className="ch-tpl-all"
          href={TEMPLATES_GALLERY_HREF}
          target="_blank"
          rel="noreferrer"
        >
          ver todos
        </a>
      </div>
    </section>
  );
}
