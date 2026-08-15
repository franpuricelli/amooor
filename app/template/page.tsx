import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATE_OPTIONS } from "@/lib/templates-catalog";
import "./gallery.css";

export const metadata: Metadata = {
  title: "Plantillas — amooor",
  description:
    "Explorá todas las plantillas para tu sitio de aniversario y elegí el estilo que más los represente.",
};

/**
 * /template — la galería de TODAS las plantillas (a la que apunta "ver todos" del
 * chooser). Cada card muestra el export standalone real (escalado como miniatura)
 * y linkea a su preview a pantalla completa en `/template/<id>`.
 */
export default function TemplatesGalleryPage() {
  return (
    <main className="tpl-gallery">
      <header className="tpl-gallery-head">
        <Link href="/comenzar" className="tpl-back">
          ← volver
        </Link>
        <h1 className="tpl-gallery-title">Todas las plantillas</h1>
        <p className="tpl-gallery-sub">
          Elegí el estilo que más los represente. Después vas a poder cambiarlo y
          ajustar los colores.
        </p>
      </header>

      <ul className="tpl-gallery-grid">
        {TEMPLATE_OPTIONS.map((t) => (
          <li key={t.id} className="tpl-card">
            <a
              className="tpl-card-frame"
              href={t.previewHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver la plantilla ${t.label} en grande`}
            >
              <span className="tpl-card-bar" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="tpl-card-shot">
                <iframe
                  src={`${t.previewHref}/index.html`}
                  title={`Plantilla ${t.label}`}
                  loading="lazy"
                  scrolling="no"
                  tabIndex={-1}
                />
              </span>
              <span className="tpl-card-open">Ver en grande ↗</span>
            </a>
            <div className="tpl-card-meta">
              <h2 className="tpl-card-name">{t.label}</h2>
              <p className="tpl-card-blurb">{t.blurb}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
