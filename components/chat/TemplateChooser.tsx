"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  TemplateChooser.tsx — el selector de PLANTILLA dentro del PlanCard. Muestra 3
//  cards inline (Romántica, Matcha, Editorial); cada card previewa el template
//  standalone REAL (escalado, no interactivo) + "ver" para abrirlo en grande.
//  "ver más" abre un modal con efecto glass que lista TODAS las plantillas.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { TEMPLATE_OPTIONS, type TemplateOption } from "@/lib/templates-catalog";

/** Las 3 plantillas que se muestran inline (el resto vive en "ver más"). */
const INLINE_IDS = ["romantic", "matcha", "editorial"];

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function TplCard({
  t,
  on,
  onSelect,
}: {
  t: TemplateOption;
  on: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`ch-tpl-card ${on ? "on" : ""}`}
      aria-pressed={on}
      onClick={() => onSelect(t.id)}
    >
      <span className="ch-tpl-preview">
        <iframe
          className="ch-tpl-shot"
          src={t.previewIsRoute ? t.previewHref : `${t.previewHref}/index.html`}
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
  );
}

export default function TemplateChooser({
  template,
  onTemplate,
}: {
  template: string;
  onTemplate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const inline = INLINE_IDS.map((id) => TEMPLATE_OPTIONS.find((t) => t.id === id)).filter(
    (t): t is TemplateOption => Boolean(t)
  );

  // lock background scroll while the "ver más" modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className="ch-choice-block">
      <div className="ch-choice-block-head">
        <h3 className="ch-choice-block-title">Plantilla</h3>
      </div>

      <ul className="ch-tpl-grid">
        {inline.map((t) => (
          <li key={t.id}>
            <TplCard t={t} on={template === t.id} onSelect={onTemplate} />
          </li>
        ))}
      </ul>

      <div className="ch-tpl-all-row">
        <button type="button" className="ch-tpl-all" onClick={() => setOpen(true)}>
          ver más
        </button>
      </div>

      {open && (
        <div
          className="ch-tpl-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Todas las plantillas"
          onClick={() => setOpen(false)}
        >
          <div className="ch-tpl-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ch-tpl-modal-head">
              <h3 className="ch-tpl-modal-title">Todas las plantillas</h3>
              <button
                type="button"
                className="ch-tpl-modal-close"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <ul className="ch-tpl-grid ch-tpl-grid-modal">
              {TEMPLATE_OPTIONS.map((t) => (
                <li key={t.id}>
                  <TplCard
                    t={t}
                    on={template === t.id}
                    onSelect={(id) => {
                      onTemplate(id);
                      setOpen(false);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
