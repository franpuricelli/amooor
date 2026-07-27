"use client";

import { useState } from "react";
import { config } from "@/lib/config";
import { full } from "@/lib/photos";
import Hearts, { PixelHeart } from "@/components/Hearts";

// Little hearts popping above their heads in the 8-bit art. Deterministic
// (index-derived, no Math.random) so SSR and client render identically.
const HEAD_HEART_FILLS = ["#ff2e8c", "#ffc7e2", "rgba(255,255,255,0.95)"];
const HEAD_HEARTS = Array.from({ length: 8 }, (_, i) => {
  const side = i % 2; // alternate: Ivi's head / Fran's head
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
type Side = "ivi" | "fran";

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
        <span className="person-artists-label">Artistas favoritos</span>
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
  const { ivi, fran } = config.people;
  // The 8-bit hero art. If the file is ever missing we fall back to the real
  // Bariloche photo so nothing renders broken.
  const pixelSrc = config.hero.pixelSrc;
  const realSrc = full(config.hero.cat, config.hero.slug);
  const [src, setSrc] = useState<string>(pixelSrc ?? realSrc);

  return (
    <section id="inicio" className="hero" onMouseLeave={() => setActive(null)}>
      {/* full-screen 8-bit backdrop */}
      <img
        src={src}
        alt="Puri e Ivi, en 8-bit"
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
          26 · 07 · 2022 → ∞
        </span>
        <h1 className="display hero-in" style={{ animationDelay: "0.15s" }}>
          Puri <span className="hero-amp">&</span> Ivi
        </h1>
        <p className="lede hero-in" style={{ animationDelay: "0.25s" }}>
          Cuatro años de nosotros. Esta es nuestra historia, desde el día que
          nos cruzamos en la facu hasta hoy.
        </p>
      </div>

      {/* hover zones: Ivi is on the left, Fran on the right */}
      <button
        className="zone zone-l"
        aria-label="Conocé a Ivi"
        onMouseEnter={() => setActive("ivi")}
        onFocus={() => setActive("ivi")}
        onClick={() => setActive(active === "ivi" ? null : "ivi")}
      />
      <button
        className="zone zone-r"
        aria-label="Conocé a Fran"
        onMouseEnter={() => setActive("fran")}
        onFocus={() => setActive("fran")}
        onClick={() => setActive(active === "fran" ? null : "fran")}
      />

      {/* visible affordances */}
      <span className={`person-pill glass left ${active === "ivi" ? "on" : ""}`}>
        {ivi.name}
      </span>
      <span className={`person-pill glass right ${active === "fran" ? "on" : ""}`}>
        {fran.name}
      </span>

      <PersonCard person={ivi} side="ivi" active={active === "ivi"} />
      <PersonCard person={fran} side="fran" active={active === "fran"} />
    </section>
  );
}
