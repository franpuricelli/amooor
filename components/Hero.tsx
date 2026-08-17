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
  onHide,
  onClose,
}: {
  person: Person;
  side: Side;
  active: boolean;
  /** mantener la tarjeta abierta al pasar el mouse por encima (para editarla) */
  onReveal: () => void;
  /** ocultar al sacar el mouse de la tarjeta (si no estás editando adentro) */
  onHide: () => void;
  /** cerrarla desde la ✕ (sólo en mobile, donde la tarjeta es un overlay) */
  onClose: () => void;
}) {
  const content = useContent();
  return (
    <aside
      id={`person-card-${side}`}
      className={`person-card glass-card ${side} ${active ? "on" : ""}`}
      /* No `aria-hidden` here: the closed card is taken out of the a11y tree
         AND the tab order by `visibility: hidden` in CSS, which is evaluated
         per-viewport — correctly so inside the editor's preview iframe, where
         a JS `window.matchMedia` would measure the parent window instead. */
      onMouseEnter={onReveal}
      onMouseLeave={onHide}
    >
      {/* sólo visible en mobile: ahí la tarjeta es un overlay sobre el hero */}
      <button className="person-close" aria-label={content.ui.close} onClick={onClose}>
        <span aria-hidden>✕</span>
      </button>
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

  // Cerrar la tarjeta. En edición NO la cerramos si estás editando un campo
  // adentro (si no, se cierra mientras escribís).
  const closeCard = () => {
    if (
      edit?.editing &&
      (document.activeElement as HTMLElement | null)?.closest?.(".person-card")
    )
      return;
    setActive(null);
  };

  const toggleCard = (side: Side) => setActive((cur) => (cur === side ? null : side));
  const onNameKey = (e: React.KeyboardEvent, side: Side) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCard(side);
    }
  };
  // Qué tarjeta abre cada nombre del título. `hero.nameStart/nameEnd` y
  // `people.left/right` los genera el LLM por separado, así que pueden venir en
  // otro orden (o con otro nombre: el título dice "Puri" y la persona se llama
  // "Fran, aka Puri"). Los resolvemos DE A PAR: el que matchea manda, y el otro
  // se queda con la persona que sobra; si no matchea ninguno, orden posicional.
  const norm = (s: string) => s.trim().toLowerCase();
  const matchSide = (titleName: string): Side | null => {
    if (norm(titleName) === norm(left.name)) return "left";
    if (norm(titleName) === norm(right.name)) return "right";
    return null;
  };
  const other = (s: Side): Side => (s === "left" ? "right" : "left");
  const startMatch = matchSide(hero.nameStart);
  const endMatch = matchSide(hero.nameEnd);
  let startSide: Side = "left";
  let endSide: Side = "right";
  if (startMatch && endMatch && startMatch !== endMatch) {
    startSide = startMatch;
    endSide = endMatch;
  } else if (startMatch && !endMatch) {
    startSide = startMatch;
    endSide = other(startMatch);
  } else if (!startMatch && endMatch) {
    endSide = endMatch;
    startSide = other(endMatch);
  }

  return (
    <section
      id={id}
      className={`hero ${edit?.editing ? "pa-hero-editing" : ""}`}
      onMouseLeave={closeCard}
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
        {/* Los nombres del título SON el disparador de cada tarjeta: en mobile
            no hay hover ni nada más sobre el hero, así que tocar un nombre abre
            la tarjeta de ESA persona (ver el emparejamiento arriba). */}
        <h1 className="display hero-in" style={{ animationDelay: "0.15s" }}>
          <span
            className="hero-name"
            role="button"
            tabIndex={0}
            aria-expanded={active === startSide}
            aria-controls={`person-card-${startSide}`}
            onClick={() => toggleCard(startSide)}
            onKeyDown={(e) => onNameKey(e, startSide)}
          >
            <EditableText as="span" path="hero.nameStart" value={hero.nameStart} />
          </span>{" "}
          <span className="hero-amp">&</span>{" "}
          <span
            className="hero-name"
            role="button"
            tabIndex={0}
            aria-expanded={active === endSide}
            aria-controls={`person-card-${endSide}`}
            onClick={() => toggleCard(endSide)}
            onKeyDown={(e) => onNameKey(e, endSide)}
          >
            <EditableText as="span" path="hero.nameEnd" value={hero.nameEnd} />
          </span>
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
        onMouseLeave={closeCard}
        onFocus={() => setActive("left")}
        onClick={() => setActive(active === "left" ? null : "left")}
      />
      <button
        className="zone zone-r"
        aria-label={right.zoneLabel}
        onMouseEnter={() => setActive("right")}
        onMouseLeave={closeCard}
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

      {/* fondo que cierra la tarjeta al tocar afuera. Sólo existe en mobile
          (en escritorio es display:none, así que no se come ningún hover). */}
      {active ? (
        <button
          className="person-scrim"
          aria-label={content.ui.close}
          onClick={() => setActive(null)}
        />
      ) : null}

      <PersonCard
        person={left}
        side="left"
        active={active === "left"}
        onReveal={() => setActive("left")}
        onHide={closeCard}
        onClose={() => setActive(null)}
      />
      <PersonCard
        person={right}
        side="right"
        active={active === "right"}
        onReveal={() => setActive("right")}
        onHide={closeCard}
        onClose={() => setActive(null)}
      />
    </section>
  );
}
