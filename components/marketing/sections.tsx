// ─────────────────────────────────────────────────────────────────────────────
//  components/marketing/sections.tsx — sub-secciones de la landing pública
//  (WP-5). Cada componente es autocontenido; los datos vienen de lib/marketing
//  y lib/pricing. Sin dependencias externas nuevas.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import marketing from "@/lib/marketing";
import { PLANS, PLAN_ORDER, DOMAIN_UPSELL } from "@/lib/pricing";
import { palettes } from "@/lib/theme";
import type { PaletteId } from "@/lib/theme";

// APP_DOMAIN para los links del showcase
const APP_DOMAIN =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "amooor.com")
    : "amooor.com";

// ─────────────────────────────────────────────────────────────────────────────
// MkNav
// ─────────────────────────────────────────────────────────────────────────────
export function MkNav() {
  return (
    <nav className="mk-nav" aria-label="Navegación principal">
      <div className="mk-nav-inner">
        <a href="/" className="mk-nav-brand">
          <span className="mk-nav-heart">♥</span>
          {marketing.brand}
        </a>

        <ul className="mk-nav-links" role="list">
          {marketing.navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <a href="/comenzar" className="mk-nav-cta">
          {marketing.hero.ctaLabel} →
        </a>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkHero
// ─────────────────────────────────────────────────────────────────────────────
export function MkHero() {
  const { eyebrow, title, subtitle, ctaLabel, secondaryCta } = marketing.hero;

  // Resaltamos la palabra "amor" con gradiente si aparece en el título
  const parts = title.split(",");
  const titleFirst = parts[0] ?? title;
  const titleRest = parts.slice(1).join(",");

  return (
    <section className="mk-hero">
      {/* Orbes decorativos */}
      <span className="mk-hero-orb mk-hero-orb-a" aria-hidden="true" />
      <span className="mk-hero-orb mk-hero-orb-b" aria-hidden="true" />
      <span className="mk-hero-orb mk-hero-orb-c" aria-hidden="true" />

      <span className="mk-eyebrow mk-animate-in">{eyebrow}</span>

      <h1 className="mk-hero-title mk-animate-in">
        {titleFirst}
        {titleRest && (
          <>
            ,<em>{titleRest}</em>
          </>
        )}
      </h1>

      <p className="mk-hero-sub mk-animate-in">{subtitle}</p>

      <div className="mk-hero-actions mk-animate-in">
        <a href="/comenzar" className="mk-btn-primary">
          {ctaLabel} →
        </a>
        <a href="#ejemplos" className="mk-btn-secondary">
          {secondaryCta}
        </a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkHowItWorks
// ─────────────────────────────────────────────────────────────────────────────
export function MkHowItWorks() {
  return (
    <section
      id="como-funciona"
      className="mk-section mk-section-mid"
      aria-labelledby="mk-how-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <span className="mk-eyebrow">Cómo funciona</span>
          <h2 className="mk-h2" id="mk-how-title">
            De cero a sitio
            {"\n"}en cuatro pasos.
          </h2>
        </header>

        <ol className="mk-steps" role="list">
          {marketing.howItWorks.map((step, i) => (
            <li key={i} className="mk-step">
              <span className="mk-step-num">Paso {i + 1}</span>
              <span className="mk-step-icon" aria-hidden="true">
                {step.icon}
              </span>
              <strong className="mk-step-title">{step.title}</strong>
              <p className="mk-step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkShowcase
// ─────────────────────────────────────────────────────────────────────────────

interface ShowcaseItem {
  subdomain: string;
  couple: string;
  palette: string;
}

// Cards de demo cuando no hay tenants reales
const DEMO_CARDS: ShowcaseItem[] = [
  { subdomain: "puri-e-ivi", couple: "Puri & Ivi", palette: "rosa" },
  { subdomain: "caro-y-lucas", couple: "Caro & Lucas", palette: "lavanda" },
  { subdomain: "sofi-y-nacho", couple: "Sofi & Nacho", palette: "menta" },
];

export function MkShowcase({ showcase }: { showcase: ShowcaseItem[] }) {
  const cards = showcase.length > 0 ? showcase : DEMO_CARDS;

  return (
    <section
      id="ejemplos"
      className="mk-section mk-section-dark"
      aria-labelledby="mk-showcase-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <span className="mk-eyebrow">Ejemplos reales</span>
          <h2 className="mk-h2" id="mk-showcase-title">
            Sitios que ya
            {"\n"}cuentan su historia.
          </h2>
          <p className="mk-subtitle">
            Cada sitio es distinto — paleta, secciones y contenido a medida de
            cada pareja.
          </p>
        </header>

        <div className="mk-showcase-grid">
          {cards.map((card) => {
            const palette = palettes[card.palette as PaletteId] ?? palettes.rosa;
            const swatchColor = palette.pink;
            const href =
              showcase.length > 0
                ? `https://${card.subdomain}.${APP_DOMAIN}`
                : `/api/preview?tenant=${card.subdomain}`;

            return (
              <a
                key={card.subdomain}
                href={href}
                className="mk-showcase-card"
                target={showcase.length > 0 ? "_blank" : undefined}
                rel={showcase.length > 0 ? "noopener noreferrer" : undefined}
                aria-label={`Ver el sitio de ${card.couple}`}
              >
                {/* orbe de color decorativo */}
                <span
                  className="mk-showcase-swatch-bg"
                  style={{ background: swatchColor }}
                  aria-hidden="true"
                />

                <div className="mk-showcase-meta">
                  <span
                    className="mk-showcase-swatch"
                    style={{ background: swatchColor }}
                    aria-label={`Paleta ${card.palette}`}
                  />
                  <span className="mk-showcase-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                <span className="mk-showcase-couple">{card.couple}</span>
                <span className="mk-showcase-link">
                  {card.subdomain}.amooor.com
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkPricing
// ─────────────────────────────────────────────────────────────────────────────
export function MkPricing() {
  const { eyebrow, title, subtitle } = marketing.pricingIntro;

  return (
    <section
      id="precios"
      className="mk-section mk-section-mid"
      aria-labelledby="mk-pricing-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <span className="mk-eyebrow">{eyebrow}</span>
          <h2 className="mk-h2" id="mk-pricing-title">
            {title}
          </h2>
          <p className="mk-subtitle">{subtitle}</p>
        </header>

        <div className="mk-pricing-grid">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            return (
              <article
                key={id}
                className={`mk-pricing-card${plan.highlight ? " mk-highlight" : ""}`}
                aria-label={`Plan ${plan.name}`}
              >
                {plan.highlight && (
                  <span className="mk-pricing-badge" aria-label="Más popular">
                    Más popular
                  </span>
                )}

                <header>
                  <h3 className="mk-plan-name">{plan.name}</h3>
                  <p className="mk-plan-tagline">{plan.tagline}</p>
                </header>

                <div className="mk-plan-price" aria-label={`US$${plan.priceUsd} pago único`}>
                  <span className="mk-plan-currency">US$</span>
                  <span className="mk-plan-amount">{plan.priceUsd}</span>
                  <span className="mk-plan-once">pago único</span>
                </div>

                <ul className="mk-plan-features" role="list">
                  {plan.features.map((feat) => (
                    <li key={feat} className="mk-plan-feature">
                      <span className="mk-plan-feature-check" aria-hidden="true">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/comenzar?plan=${id}`}
                  className="mk-pricing-cta"
                  aria-label={`Comenzar con el plan ${plan.name}`}
                >
                  Comenzar con {plan.name}
                </a>
              </article>
            );
          })}
        </div>

        {/* Upsell dominio .love */}
        <div className="mk-domain-upsell" role="note" aria-label="Upsell dominio .love">
          <span className="mk-domain-upsell-icon" aria-hidden="true">
            🌐
          </span>
          <p className="mk-domain-upsell-text">
            <strong>¿Querés tu propio dominio .love?</strong>{" "}
            {DOMAIN_UPSELL.note}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkFaq
// ─────────────────────────────────────────────────────────────────────────────
export function MkFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section
      id="faq"
      className="mk-section mk-section-dark"
      aria-labelledby="mk-faq-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <span className="mk-eyebrow">Preguntas frecuentes</span>
          <h2 className="mk-h2" id="mk-faq-title">
            Todo lo que
            {"\n"}necesitás saber.
          </h2>
        </header>

        <dl className="mk-faq-list">
          {marketing.faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`mk-faq-item${isOpen ? " mk-open" : ""}`}
              >
                <dt>
                  <button
                    className="mk-faq-q"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={`mk-faq-a-${i}`}
                    type="button"
                  >
                    {item.q}
                    <span className="mk-faq-icon" aria-hidden="true">
                      +
                    </span>
                  </button>
                </dt>
                <dd id={`mk-faq-a-${i}`} className="mk-faq-a" hidden={!isOpen}>
                  {item.a}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkTestimonials (componente auxiliar, no exportado en la spec pero útil)
// ─────────────────────────────────────────────────────────────────────────────
export function MkTestimonials() {
  return (
    <section
      className="mk-section mk-section-mid"
      aria-labelledby="mk-testimonials-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <span className="mk-eyebrow">Lo que dicen</span>
          <h2 className="mk-h2" id="mk-testimonials-title">
            Parejas que ya
            {"\n"}tienen su sitio.
          </h2>
        </header>

        <div className="mk-testimonials">
          {marketing.testimonials.map((t, i) => (
            <blockquote key={i} className="mk-testimonial">
              <p className="mk-testimonial-stars" aria-label="5 estrellas">
                ★★★★★
              </p>
              <p className="mk-testimonial-quote">"{t.quote}"</p>
              <footer className="mk-testimonial-author">— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkFooter
// ─────────────────────────────────────────────────────────────────────────────
export function MkFooter() {
  return (
    <footer className="mk-footer" role="contentinfo">
      <div className="mk-footer-brand">
        <a href="/" className="mk-footer-logo">
          <span aria-hidden="true">♥</span>
          {marketing.brand}
        </a>
        <p className="mk-footer-tagline">{marketing.footer.tagline}</p>
      </div>

      <nav aria-label="Footer">
        <ul className="mk-footer-links" role="list">
          {marketing.footer.links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mk-footer-copy">
        © 2026 {marketing.brand}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
