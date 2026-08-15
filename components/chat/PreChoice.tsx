"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PreChoice.tsx — el CHOOSER que va ANTES del plan (task 2-A). Un "form" en un
//  frame grande (más que las opciones inline del chat) donde el usuario elige:
//   1. la PLANTILLA del sitio — 3 cards con mini-preview + "ver" (abre el export
//      standalone) + "ver todos".
//   2. la PALETA de colores — reusa el mismo PalettePicker (hover → colores).
//  Al confirmar (Continuar) se revela el PlanCard. Elegir plantilla hoy solo
//  guarda la preferencia (scaffold); el render real es task 2-B.
// ─────────────────────────────────────────────────────────────────────────────

import type { Swatch } from "@/lib/palette-gen";
import {
  TEMPLATE_OPTIONS,
  TEMPLATES_GALLERY_HREF,
  type TemplateOption,
} from "@/lib/templates-catalog";
import PalettePicker from "./PalettePicker";

/** mini-mock del sitio dentro del card — solo estético, varía por "vibe". */
function TemplateMock({ vibe }: { vibe: TemplateOption["vibe"] }) {
  return (
    <span className={`ch-tpl-mock vibe-${vibe}`} aria-hidden>
      <span className="ch-tpl-mock-hero" />
      <span className="ch-tpl-mock-line lg" />
      <span className="ch-tpl-mock-line" />
      <span className="ch-tpl-mock-grid">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function PreChoice({
  coupleLabel,
  template,
  onTemplate,
  palette,
  customPalettes,
  onPalette,
  onCreatePalette,
  onContinue,
}: {
  /** nombres para el kicker ("Para Puri e Ivi"), opcional */
  coupleLabel?: string | null;
  template: string;
  onTemplate: (id: string) => void;
  palette: string;
  customPalettes: Swatch[];
  onPalette: (id: string, sw?: Swatch) => void;
  onCreatePalette: (sw: Swatch) => void;
  onContinue: () => void;
}) {
  return (
    <div className="ch-prechoice">
      <div className="ch-prechoice-head">
        <p className="ch-plan-kicker">
          {coupleLabel ? `Para ${coupleLabel}` : "Antes de armar el plan"}
        </p>
        <h2 className="ch-prechoice-title">Elegí el estilo de tu sitio</h2>
        <p className="ch-prechoice-sub">
          Una plantilla y una paleta para arrancar. Después vas a poder cambiarlas.
        </p>
      </div>

      {/* ── plantilla ─────────────────────────────────────────────────────── */}
      <section className="ch-choice-block">
        <div className="ch-choice-block-head">
          <h3 className="ch-choice-block-title">Plantilla</h3>
          <a
            className="ch-tpl-all"
            href={TEMPLATES_GALLERY_HREF}
            target="_blank"
            rel="noreferrer"
          >
            ver todos
          </a>
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
                    <TemplateMock vibe={t.vibe} />
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
      </section>

      {/* ── paleta (reusa el picker del plan) ─────────────────────────────── */}
      <section className="ch-choice-block">
        <div className="ch-choice-block-head">
          <h3 className="ch-choice-block-title">Colores</h3>
        </div>
        <PalettePicker
          value={palette}
          custom={customPalettes}
          onSelect={onPalette}
          onCreate={onCreatePalette}
        />
      </section>

      <div className="ch-prechoice-cta">
        <button type="button" className="ch-btn primary" onClick={onContinue}>
          Ver mi plan
        </button>
      </div>
    </div>
  );
}
