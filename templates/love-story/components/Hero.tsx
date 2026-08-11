"use client";

import { useState } from "react";
import { config } from "@/lib/config";
import { full } from "@/lib/photos";
import Hearts, { PixelHeart } from "@/components/Hearts";

// Little hearts popping above their heads. Deterministic (index-derived, no
// Math.random) so SSR and client render identically.
const HEAD_HEART_FILLS = ["#ff2e8c", "#ffc7e2", "rgba(255,255,255,0.95)"];
const HEAD_HEARTS = Array.from({ length: 8 }, (_, i) => {
  const side = i % 2; // alternate: left head / right head
  const left = (side ? 52.5 : 42.5) + ((i * 2.3) % 5.5);
  const top = 24 + ((i * 3.1) % 8);
  const size = 13 + ((i * 5) % 11);
  const delay = ((i * 0.55) % 3.4).toFixed(2);
  const dur = (2.8 + ((i * 0.7) % 1.6)).toFixed(2);
  const tone = i % 3;
  return { left, top, size, delay, dur, tone };
});

interface Person {
  name: string;
  tagline: string;
  traits: readonly { icon: string; label: string }[];
  artists: readonly { name: string; img: string }[];
}
type Side = "left" | "right";

// "2020-02-14" -> "14 · 02 · 2020"
function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d} · ${m} · ${y}`;
}

function PersonCard({
  person,
  side,
  active,
}: {
  person: Person;
  side: Side;
  active: boolean;
}) {
  return (
    <aside
      className={`person-card glass-card ${side} ${active ? "on" : ""}`}
      aria-hidden={!active}
    >
      <div className="person-head">
        <span className="person-name">{person.name}</span>
        <span className="person-tag">{person.tagline}</span>
      </div>
      <div className="person-traits">
        {person.traits.map((t) => (
          <span className="chip" key={t.label}>
            <span aria-hidden>{t.icon}</span> {t.label}
          </span>
        ))}
      </div>
      <div className="person-artists">
        <span className="person-artists-label">Favorite artists · Artistas favoritos</span>
        {person.artists.map((a) => (
          <span className="artist-row" key={a.name}>
            <img src={a.img} alt="" loading="lazy" />
            {a.name}
          </span>
        ))}
      </div>
    </aside>
  );
}

export default function Hero() {
  const [active, setActive] = useState<Side | null>(null);
  const { left, right } = config.people;
  // The cover image. If a file is ever missing we fall back to the real
  // photo (cat/slug) so nothing renders broken.
  const pixelSrc = config.hero.pixelSrc;
  const realSrc = full(config.hero.cat, config.hero.slug);
  const [src, setSrc] = useState<string>(pixelSrc ?? realSrc);

  // Split "Orion & Sera" so the "&" can be styled, and still work if there's
  // no "&" in the couple name.
  const ampParts = config.names.couple.split(/\s*&\s*/);

  return (
    <section id="inicio" className="hero" onMouseLeave={() => setActive(null)}>
      {/* full-screen cover backdrop */}
      <img
        src={src}
        alt="Cover photo · Foto de portada"
        className="hero-bg"
        fetchPriority="high"
        onError={() => {
          if (src !== realSrc) setSrc(realSrc);
        }}
      />
      <span className="hero-scrim" aria-hidden />
      <Hearts />

      {/* hearts floating above their heads */}
      <div className="head-hearts" aria-hidden>
        {HEAD_HEARTS.map((h, i) => (
          <span
            key={i}
            className="head-heart"
            style={
              {
                left: `${h.left}%`,
                top: `${h.top}%`,
                width: `${h.size}px`,
                height: `${h.size}px`,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.dur}s`,
              } as React.CSSProperties
            }
          >
            <PixelHeart fill={HEAD_HEART_FILLS[h.tone]} />
          </span>
        ))}
      </div>

      <div className="hero-content">
        <span className="eyebrow hero-in" style={{ animationDelay: "0.05s" }}>
          {prettyDate(config.dates.together)} → ∞
        </span>
        <h1 className="display hero-in" style={{ animationDelay: "0.15s" }}>
          {ampParts.length === 2 ? (
            <>
              {ampParts[0]} <span className="hero-amp">&</span> {ampParts[1]}
            </>
          ) : (
            config.names.couple
          )}
        </h1>
        <p className="lede hero-in" style={{ animationDelay: "0.25s" }}>
          {/* EN · One line that sums up your story. · ES · Una línea que resume tu historia. */}
          Write the one line that sums up your story here. · Escribí acá la línea
          que resume su historia.
        </p>
      </div>

      {/* hover zones: left person on the left, right person on the right */}
      <button
        className="zone zone-l"
        aria-label={`Meet ${left.name} · Conocé a ${left.name}`}
        onMouseEnter={() => setActive("left")}
        onFocus={() => setActive("left")}
        onClick={() => setActive(active === "left" ? null : "left")}
      />
      <button
        className="zone zone-r"
        aria-label={`Meet ${right.name} · Conocé a ${right.name}`}
        onMouseEnter={() => setActive("right")}
        onFocus={() => setActive("right")}
        onClick={() => setActive(active === "right" ? null : "right")}
      />

      {/* visible affordances */}
      <span className={`person-pill glass left ${active === "left" ? "on" : ""}`}>
        {left.name}
      </span>
      <span className={`person-pill glass right ${active === "right" ? "on" : ""}`}>
        {right.name}
      </span>

      <PersonCard person={left} side="left" active={active === "left"} />
      <PersonCard person={right} side="right" active={active === "right"} />
    </section>
  );
}
