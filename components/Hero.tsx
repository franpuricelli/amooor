"use client";

import { useState } from "react";
import type { Person } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import { useEdit, EditableText } from "@/lib/edit-context";
import Hearts, { PixelHeart } from "@/components/Hearts";

// Little hearts popping above their heads in the 8-bit art. Deterministic
// (index-derived, no Math.random) so SSR and client render identically. The
// fills come from the active palette (theme tokens), so they re-theme too.
const HEAD_HEART_FILLS = ["var(--heart-1)", "var(--heart-2)", "rgba(255,255,255,0.95)"];
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

type Side = "left" | "right";

function PersonCard({
  person,
  side,
  active,
  onReveal,
}: {
  person: Person;
  side: Side;
  active: boolean;
  /** mantener la tarjeta abierta al pasar el mouse por encima (para editarla) */
  onReveal: () => void;
}) {
  const content = useContent();
  return (
    <aside
      className={`person-card glass-card ${side} ${active ? "on" : ""}`}
      aria-hidden={!active}
      onMouseEnter={onReveal}
    >
      <div className="person-head">
        <EditableText
          as="span"
          className="person-name"
          path={`people.${side}.name`}
          value={person.name}
        />
        <EditableText
          as="span"
          className="person-tag"
          path={`people.${side}.tagline`}
          value={person.tagline}
        />
      </div>
      <div className="person-traits">
        {person.traits.map((t, i) => (
          <span className="chip" key={i}>
            <span aria-hidden>{t.icon}</span>{" "}
            <EditableText as="span" path={`people.${side}.traits.${i}.label`} value={t.label} />
          </span>
        ))}
      </div>
      <div className="person-artists">
        <span className="person-artists-label">{content.people.artistsLabel}</span>
        {person.artists.map((a, i) => (
          <span className="artist-row" key={i}>
            {a.img ? (
              <img className="artist-avatar" src={a.img} alt="" loading="lazy" />
            ) : (
              <span className="artist-avatar artist-avatar-fallback" aria-hidden>
                {a.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <EditableText as="span" path={`people.${side}.artists.${i}.name`} value={a.name} />
          </span>
        ))}
      </div>
    </aside>
  );
}

export default function Hero({ id }: { id: string }) {
  const content = useContent();
  const { full } = usePhotos();
  const edit = useEdit();
  const [active, setActive] = useState<Side | null>(null);
  const { left, right } = content.people;
  const { hero } = content;
  // The 8-bit hero art. If the file is ever missing we fall back to the real
  // photo so nothing renders broken.
  const realSrc = full(hero.cat, hero.slug);
  const [src, setSrc] = useState<string>(hero.pixelSrc ?? realSrc);

  return (
    <section
      id={id}
      className={`hero ${edit?.editing ? "pa-hero-editing" : ""}`}
      onMouseLeave={() => {
        // en edición: no cerrar la tarjeta si estás editando un campo adentro
        if (
          edit?.editing &&
          (document.activeElement as HTMLElement | null)?.closest?.(".person-card")
        )
          return;
        setActive(null);
      }}
    >
      {/* full-screen backdrop */}
      <img
        src={src}
        alt={hero.bgAlt}
        className={`hero-bg ${edit?.editing ? "pa-img-editable" : ""}`}
        fetchPriority="high"
        onError={() => {
          if (src !== realSrc) setSrc(realSrc);
        }}
        onClick={edit?.editing ? () => edit.onPickImage(hero.cat, hero.slug) : undefined}
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
        <EditableText
          as="span"
          className="eyebrow hero-in"
          style={{ animationDelay: "0.05s" }}
          path="hero.eyebrow"
          value={hero.eyebrow}
        />
        <h1 className="display hero-in" style={{ animationDelay: "0.15s" }}>
          <EditableText as="span" path="hero.nameStart" value={hero.nameStart} />{" "}
          <span className="hero-amp">&</span>{" "}
          <EditableText as="span" path="hero.nameEnd" value={hero.nameEnd} />
        </h1>
        <EditableText
          as="p"
          className="lede hero-in"
          style={{ animationDelay: "0.25s" }}
          path="hero.lede"
          value={hero.lede}
        />
      </div>

      {/* hover zones: left person on the left, right person on the right */}
      <button
        className="zone zone-l"
        aria-label={left.zoneLabel}
        onMouseEnter={() => setActive("left")}
        onFocus={() => setActive("left")}
        onClick={() => setActive(active === "left" ? null : "left")}
      />
      <button
        className="zone zone-r"
        aria-label={right.zoneLabel}
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

      <PersonCard
        person={left}
        side="left"
        active={active === "left"}
        onReveal={() => setActive("left")}
      />
      <PersonCard
        person={right}
        side="right"
        active={active === "right"}
        onReveal={() => setActive("right")}
      />
    </section>
  );
}
