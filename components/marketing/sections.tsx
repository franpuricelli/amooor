// ─────────────────────────────────────────────────────────────────────────────
//  components/marketing/sections.tsx — sub-secciones de la landing pública.
//  Rediseño editorial (estructura tipo Wispr Flow) con la paleta rosa de purivi.
//  El contenido sale del locale activo (lib/marketing-context → es | en). Los
//  montos de los planes salen de lib/pricing.ts.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useRef, useState } from "react";
import Script from "next/script";
import { PLANS, PLAN_ORDER } from "@/lib/pricing";
import type { PlanId } from "@/lib/pricing";
import { useMarketing } from "@/lib/marketing-context";

// Parte un título "línea 1\nlínea 2" en {lead, em} para el patrón serif itálico.
function splitTitle(title: string): { lead: string; em: string } {
  const [lead, ...rest] = title.split("\n");
  return { lead, em: rest.join(" ") };
}

function Heading({ title, id }: { title: string; id?: string }) {
  const { lead, em } = splitTitle(title);
  return (
    <h2 className="mk-h2" id={id}>
      {lead}
      {em && (
        <>
          <br />
          <em>{em}</em>
        </>
      )}
    </h2>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkNav
// ─────────────────────────────────────────────────────────────────────────────
export function MkNav() {
  const m = useMarketing();
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  // Glow difuminado que sigue al cursor dentro de la barra (spotlight local).
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mk-mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--mk-my", `${e.clientY - r.top}px`);
  };

  return (
    <nav className="mk-nav" aria-label={m.ui.navAria}>
      <div className="mk-nav-inner" ref={innerRef} onMouseMove={handleMove}>
        <a href={m.home} className="mk-nav-brand">
          {m.brand}
        </a>

        <ul className="mk-nav-links" role="list">
          {m.navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="mk-nav-right">
          <a href={m.ui.langHref} className="mk-nav-lang" aria-label={m.ui.langLabel}>
            {m.ui.langLabel}
          </a>

          <a href="/comenzar" className="mk-nav-cta">
            {m.hero.ctaLabel}
          </a>

          <button
            type="button"
            className={`mk-nav-burger${open ? " mk-open" : ""}`}
            aria-label={open ? m.ui.closeMenu : m.ui.openMenu}
            aria-expanded={open}
            aria-controls="mk-nav-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="mk-nav-mobile"
        className={`mk-nav-mobile${open ? " mk-open" : ""}`}
        hidden={!open}
      >
        <ul role="list">
          {m.navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkHero — titular editorial + video demo (el screen-recording de purivi.love)
// ─────────────────────────────────────────────────────────────────────────────
export function MkHero() {
  const m = useMarketing();
  const { eyebrow, title, subtitle, ctaLabel, secondaryCta } = m.hero;
  const { lead, em } = splitTitle(title);

  return (
    <section className="mk-hero">
      <p className="mk-eyebrow mk-animate-in">{eyebrow}</p>

      <h1 className="mk-hero-title mk-animate-in">
        {lead}
        {em && (
          <>
            <br />
            <em>{em}</em>
          </>
        )}
      </h1>

      <p className="mk-hero-sub mk-animate-in">{subtitle}</p>

      <div className="mk-hero-actions mk-animate-in">
        <a href="/comenzar" className="mk-btn-primary">
          {ctaLabel}
        </a>
        <a href="#ejemplos" className="mk-btn-text">
          {secondaryCta}
        </a>
      </div>

      <div className="mk-hero-demo mk-animate-in">
        <BrowserFrame url={m.showcaseCard.previewUrl} ariaLabel={m.ui.previewAria} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BrowserFrame — marco de navegador con el video demo autoreproducido en loop.
// ─────────────────────────────────────────────────────────────────────────────
function BrowserFrame({ url, ariaLabel }: { url: string; ariaLabel: string }) {
  return (
    <div className="mk-frame">
      <div className="mk-frame-bar">
        <span className="mk-frame-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="mk-frame-url">{url}</span>
      </div>
      <div className="mk-frame-screen">
        <video
          className="mk-frame-video"
          src="/demo/demo.mp4"
          poster="/demo/poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkHowItWorks
// ─────────────────────────────────────────────────────────────────────────────
export function MkHowItWorks() {
  const m = useMarketing();
  return (
    <section
      id="como-funciona"
      className="mk-section mk-section-alt"
      aria-labelledby="mk-how-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <p className="mk-eyebrow">{m.howIntro.eyebrow}</p>
          <Heading title={m.howIntro.title} id="mk-how-title" />
        </header>

        <ol className="mk-steps" role="list">
          {m.howItWorks.map((step, i) => (
            <li key={i} className="mk-step">
              <span className="mk-step-num">{String(i + 1).padStart(2, "0")}</span>
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
// MkShowcase — un único sitio destacado (Puri e Ivi): preview en vivo + link.
// ─────────────────────────────────────────────────────────────────────────────
export function MkShowcase() {
  const m = useMarketing();
  const card = m.showcaseCard;

  return (
    <section
      id="ejemplos"
      className="mk-section"
      aria-labelledby="mk-showcase-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <p className="mk-eyebrow">{m.showcaseIntro.eyebrow}</p>
          <Heading title={m.showcaseIntro.title} id="mk-showcase-title" />
          <p className="mk-subtitle">{m.showcaseIntro.subtitle}</p>
        </header>

        <a
          className="mk-showcase"
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={card.ariaView}
        >
          <div className="mk-showcase-preview">
            <BrowserFrame url={card.previewUrl} ariaLabel={m.ui.previewAria} />
          </div>

          <div className="mk-showcase-info">
            <span className="mk-showcase-tag">{card.tag}</span>
            <h3 className="mk-showcase-couple">{card.couple}</h3>
            <p className="mk-showcase-desc">{card.description}</p>
            <span className="mk-showcase-link">
              {card.linkLabel}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 17 17 7M17 7H9M17 7v8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkWall — muro social: stats + marquee de 3 filas, dirección alternada.
// ─────────────────────────────────────────────────────────────────────────────
const WALL_COUNT = 28;
const WALL_IMAGES = Array.from(
  { length: WALL_COUNT },
  (_, i) => `/wall/${String(i + 1).padStart(2, "0")}.png`,
);

// Repartimos las imágenes en 3 filas.
const WALL_ROWS: string[][] = [[], [], []];
WALL_IMAGES.forEach((src, i) => WALL_ROWS[i % 3].push(src));

function WallRow({
  images,
  reverse,
  alt,
}: {
  images: string[];
  reverse: boolean;
  alt: string;
}) {
  // Duplicamos la fila para un loop continuo sin costuras.
  const loop = [...images, ...images];
  return (
    <div className="mk-wall-row">
      <div
        className={`mk-wall-track${reverse ? " mk-wall-track-rev" : ""}`}
        aria-hidden={reverse ? "true" : undefined}
      >
        {loop.map((src, i) => (
          <figure key={i} className="mk-wall-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function MkWall() {
  const m = useMarketing();

  return (
    <section className="mk-section mk-section-alt" aria-labelledby="mk-wall-title">
      <div className="mk-wrap">
        <header className="mk-section-head">
          <p className="mk-eyebrow">{m.wallIntro.eyebrow}</p>
          <Heading title={m.wallIntro.title} id="mk-wall-title" />
          <p className="mk-subtitle">{m.wallIntro.subtitle}</p>

          <dl className="mk-wall-stats" aria-label={m.ui.statsAria}>
            {m.wallStats.map((s) => (
              <div key={s.label} className="mk-wall-stat">
                <dt className="mk-wall-stat-value">{s.value}</dt>
                <dd className="mk-wall-stat-label">{s.label}</dd>
              </div>
            ))}
          </dl>
        </header>
      </div>

      <div className="mk-wall" role="list" aria-label={m.ui.commentsAria}>
        <WallRow images={WALL_ROWS[0]} reverse={false} alt={m.ui.wallImgAlt} />
        <WallRow images={WALL_ROWS[1]} reverse={true} alt={m.ui.wallImgAlt} />
        <WallRow images={WALL_ROWS[2]} reverse={false} alt={m.ui.wallImgAlt} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkAbout — "Sobre nosotros": la historia de la pareja + el video de Ivi.
// ─────────────────────────────────────────────────────────────────────────────
// Párrafos siempre visibles; del 3ro en adelante quedan tras "leer más".
const ABOUT_LEAD_PARAGRAPHS = 2;

export function MkAbout() {
  const m = useMarketing();
  const { eyebrow, title, paragraphs, signature, video } = m.about;
  const [expanded, setExpanded] = useState(false);

  const lead = paragraphs.slice(0, ABOUT_LEAD_PARAGRAPHS);
  const rest = paragraphs.slice(ABOUT_LEAD_PARAGRAPHS);
  const collapsible = rest.length > 0;

  return (
    <section
      id="sobre-nosotros"
      className="mk-section mk-about"
      aria-labelledby="mk-about-title"
    >
      <div className="mk-wrap mk-about-inner">
        <div className="mk-about-body">
          <p className="mk-eyebrow">{eyebrow}</p>
          <div className="mk-about-h2">
            <Heading title={title} id="mk-about-title" />
          </div>

          {lead.map((p, i) => (
            <p key={i} className="mk-about-p">
              {p}
            </p>
          ))}

          {collapsible && !expanded && (
            <button
              type="button"
              className="mk-about-more"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
            >
              {m.ui.readMore}
            </button>
          )}

          {(!collapsible || expanded) && (
            <>
              {rest.map((p, i) => (
                <p key={ABOUT_LEAD_PARAGRAPHS + i} className="mk-about-p">
                  {p}
                </p>
              ))}
              <p className="mk-about-sign">{signature}</p>
            </>
          )}
        </div>

        <figure className="mk-about-media">
          <blockquote
            className="tiktok-embed"
            cite={video.url}
            data-video-id={video.videoId}
            style={{ maxWidth: "340px", minWidth: "260px", margin: 0 }}
          >
            <section>
              <a target="_blank" rel="noreferrer" href={video.url}>
                {video.caption}
              </a>
            </section>
          </blockquote>
          <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
          <figcaption className="mk-about-cap">{video.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkPricing — tarjetas estilo Wispr Flow: pill de plan, precio serif, checks.
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_PILL: Record<PlanId, string> = {
  basic: "mk-pill-basic",
  plus: "mk-pill-plus",
  pro: "mk-pill-pro",
};

export function MkPricing() {
  const m = useMarketing();

  return (
    <section
      id="precios"
      className="mk-section"
      aria-labelledby="mk-pricing-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <p className="mk-eyebrow">{m.pricingIntro.eyebrow}</p>
          <Heading title={m.pricingIntro.title} id="mk-pricing-title" />
          <p className="mk-subtitle">{m.pricingIntro.subtitle}</p>
        </header>

        <div className="mk-pricing-grid">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const disp = m.plans[id];
            return (
              <article
                key={id}
                className={`mk-plan${plan.highlight ? " mk-plan-hl" : ""}`}
                aria-label={`${m.ui.planLabel} ${disp.name}`}
              >
                <span className={`mk-plan-pill ${PLAN_PILL[id]}`}>
                  {disp.name}
                </span>

                <p className="mk-plan-tagline">{disp.tagline}</p>

                <div
                  className="mk-plan-price"
                  aria-label={`${m.ui.currency}${plan.priceUsd}, ${m.ui.once}`}
                >
                  <span className="mk-plan-amount">
                    <span className="mk-plan-currency">{m.ui.currency}</span>
                    {plan.priceUsd}
                  </span>
                  <span className="mk-plan-once">{m.ui.once}</span>
                </div>

                <ul className="mk-plan-features" role="list">
                  {disp.features.map((feat) => {
                    const inherit = feat.startsWith(m.ui.inheritPrefix);
                    return (
                      <li key={feat} className="mk-plan-feature">
                        <span
                          className={`mk-plan-mark${inherit ? " mk-plan-mark-plus" : ""}`}
                          aria-hidden="true"
                        >
                          {inherit ? "+" : "✓"}
                        </span>
                        {feat}
                      </li>
                    );
                  })}
                </ul>

                <a
                  href={`/comenzar?plan=${id}`}
                  className="mk-plan-cta"
                  aria-label={`${m.ui.startWith} ${disp.name}`}
                >
                  {m.hero.ctaLabel}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MkFaq
// ─────────────────────────────────────────────────────────────────────────────
export function MkFaq() {
  const m = useMarketing();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section
      id="faq"
      className="mk-section mk-section-alt"
      aria-labelledby="mk-faq-title"
    >
      <div className="mk-wrap">
        <header className="mk-section-head">
          <p className="mk-eyebrow">{m.faqIntro.eyebrow}</p>
          <Heading title={m.faqIntro.title} id="mk-faq-title" />
        </header>

        <dl className="mk-faq-list">
          {m.faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`mk-faq-item${isOpen ? " mk-open" : ""}`}>
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
// MkFooter
// ─────────────────────────────────────────────────────────────────────────────
export function MkFooter() {
  const m = useMarketing();
  const { lead, em } = splitTitle(m.footerCta.title);

  return (
    <footer className="mk-footer" role="contentinfo">
      <div className="mk-footer-cta">
        <h2 className="mk-footer-title">
          {lead}
          {em && (
            <>
              {" "}
              <em>{em}</em>
            </>
          )}
        </h2>
        <a href="/comenzar" className="mk-btn-primary">
          {m.hero.ctaLabel}
        </a>
      </div>

      <div className="mk-footer-bar">
        <a href={m.home} className="mk-footer-logo">
          {m.brand}
        </a>

        <nav aria-label={m.ui.footerAria}>
          <ul className="mk-footer-links" role="list">
            {m.footer.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mk-footer-copy">
          © 2026 {m.brand}. {m.footer.tagline}
        </p>
      </div>
    </footer>
  );
}
