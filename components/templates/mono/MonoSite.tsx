"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  MonoSite — the MONO template's top-level renderer. A drop-in alternative to
//  <SiteApp>: same tenant data (useContent/usePhotos via TenantProvider), a
//  completely different, editorial, story-first surface. Wire it behind a
//  template switch later; for now it renders standalone at /mono.
// ─────────────────────────────────────────────────────────────────────────────

import { useContent } from "@/lib/tenant";
import { MonoLightbox } from "./mono-lib";
import {
  MonoHero,
  MonoManifesto,
  MonoStory,
  MonoTravel,
  MonoStats,
  MonoGallery,
  MonoClosing,
} from "./sections";

const NAV = [
  { href: "#sobre", label: "Historia" },
  { href: "#viajes", label: "Viajes" },
  { href: "#datos", label: "Datos" },
  { href: "#galeria", label: "Archivo" },
];

function MonoNav() {
  const { hero } = useContent();
  return (
    <nav className="mn-nav">
      <a href="#inicio" className="mn-nav-brand">
        {hero.nameStart} <span className="mn-accent">&amp;</span> {hero.nameEnd}
      </a>
      <div className="mn-nav-links">
        {NAV.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function MonoFooter() {
  const { couple, dates, footer } = useContent();
  return (
    <footer className="mn-footer">
      <div className="mn-footer-brand">{couple}</div>
      <div className="mn-footer-meta">
        {footer.line.replace("{years}", String(dates.anniversaryYears))}
        <br />
        {footer.credit}
      </div>
    </footer>
  );
}

export default function MonoSite() {
  return (
    <div className="mn-root">
      <MonoLightbox>
        <MonoNav />
        <main>
          <MonoHero />
          <MonoManifesto />
          <MonoStory />
          <MonoTravel />
          <MonoStats />
          <MonoGallery />
          <MonoClosing />
        </main>
        <MonoFooter />
      </MonoLightbox>
    </div>
  );
}
