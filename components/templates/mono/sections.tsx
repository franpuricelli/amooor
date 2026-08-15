"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  sections — the MONO template body. Every section reads the SAME tenant data
//  as the pink "Purivi" template (useContent / usePhotos), so this file is a
//  pure re-interpretation of the couple's story in an editorial register.
//  No new content shape is invented; nothing here is commercial.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import { Reveal, MonoHead, useMonoLightbox } from "./mono-lib";

const NUM = "es-AR";

// pick up to `n` slugs across the given categories, in order, skipping empties
function pickPhotos(
  photos: (cat: string) => string[],
  cats: string[],
  n: number
): { cat: string; slug: string }[] {
  const out: { cat: string; slug: string }[] = [];
  for (const cat of cats) {
    for (const slug of photos(cat)) {
      out.push({ cat, slug });
      if (out.length >= n) return out;
    }
  }
  return out;
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export function MonoHero() {
  const { hero, dates } = useContent();
  const { photos, thumb, full } = usePhotos();

  const shots = useMemo(
    () => pickPhotos(photos, [hero.cat, "primer-a-no-juntis", "bariloche"], 3),
    [photos, hero.cat]
  );

  return (
    <header id="inicio" className="mn-hero mn-wrap">
      <div className="mn-hero-top">
        <p className="mn-label">{hero.eyebrow}</p>
        <p className="mn-label">Est. {dates.together.slice(0, 4)}</p>
      </div>
      <Reveal as="h1" className="mn-hero-h1">
        {hero.nameStart} <span className="amp">&amp;</span> {hero.nameEnd}
      </Reveal>
      <Reveal as="p" className="mn-hero-lede">
        {hero.lede}
      </Reveal>
      <Reveal className="mn-hero-media">
        {shots.map((p, i) => (
          <figure key={`${p.cat}/${p.slug}`}>
            <img
              src={i === 0 ? full(p.cat, p.slug) : thumb(p.cat, p.slug)}
              alt={hero.bgAlt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </figure>
        ))}
      </Reveal>
    </header>
  );
}

// ── Manifesto — three story lines + a paragraph (editorial values block) ─────
export function MonoManifesto() {
  const { hero, story, footer } = useContent();
  const beats = story.historia?.beats ?? [];
  const lines = beats.slice(0, 3).map((b) => b.title);

  return (
    <section id="sobre" className="mn-section mn-wrap">
      <MonoHead idx="00" title="La historia" note="En resumen" />
      <Reveal className="mn-manifesto">
        <div className="mn-manifesto-labels">
          {lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="mn-manifesto-body">
          <p>{hero.lede}</p>
          <p>{footer.credit}</p>
        </div>
      </Reveal>
    </section>
  );
}

// ── Story — narrative beats, alternating text / photo collage ────────────────
export function MonoStory() {
  const { story } = useContent();
  const { photos, thumb, full } = usePhotos();
  const { open } = useMonoLightbox();

  // flatten every "story" section (historia, cocina, …) into one beat stream
  const beats = useMemo(
    () => Object.values(story).flatMap((s) => s.beats),
    [story]
  );

  return (
    <section id="historia" className="mn-section mn-wrap">
      <MonoHead idx="01" title="Capítulos" note={`${beats.length} momentos`} />
      {beats.map((beat, bi) => {
        const shots = beat.picks
          .map(([cat, i]) => ({ cat, slug: photos(cat)[i] }))
          .filter((p) => p.slug);
        const shown = shots.length ? shots : pickPhotos(photos, beat.cats, 3);
        const lbItems = shown.map((p) => ({ src: full(p.cat, p.slug) }));
        return (
          <Reveal
            key={bi}
            className={`mn-beat ${beat.flip ? "flip" : ""}`}
          >
            <div className="mn-beat-copy">
              <p className="mn-beat-kicker">{beat.kicker}</p>
              <h3 className="mn-beat-title">{beat.title}</h3>
              <p className="mn-beat-text">{beat.text}</p>
            </div>
            <div className="mn-beat-media">
              {shown.slice(0, 3).map((p, i) => (
                <figure
                  key={`${p.cat}/${p.slug}`}
                  onClick={() => open(lbItems, i)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}

// ── Travel — captioned, full-bleed destinations ──────────────────────────────
export function MonoTravel() {
  const { travel } = useContent();
  const { photos, full } = usePhotos();

  const cells = travel.destinations
    .map((d) => ({ ...d, slug: photos(d.cat)[0] }))
    .filter((d) => d.slug);

  return (
    <section id="viajes" className="mn-section mn-wrap">
      <MonoHead idx="02" title="Viajes" note={travel.kicker} />
      <Reveal className="mn-travel-grid">
        {cells.map((d) => (
          <figure key={d.cat} className="mn-travel-cell" style={{ margin: 0 }}>
            <img src={full(d.cat, d.slug!)} alt={d.title} loading="lazy" decoding="async" />
            <figcaption className="mn-travel-cap">
              <span>{d.title}</span>
              <span>{d.place}</span>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}

// ── Stats — a spec-sheet of the relationship ─────────────────────────────────
export function MonoStats() {
  const { dates, travel, watch, stats } = useContent();
  const { totalPhotos } = usePhotos();

  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const from = new Date(`${dates.together}T00:00:00`).getTime();
    setDays(Math.floor((Date.now() - from) / 86400000));
  }, [dates.together]);

  const cells = [
    { num: days === null ? "···" : days.toLocaleString(NUM), label: "días juntos" },
    { num: String(travel.destinations.length), label: "destinos" },
    { num: totalPhotos.toLocaleString(NUM), label: "recuerdos" },
    { num: String(watch.list.length), label: "títulos vistos" },
  ];

  return (
    <section id="datos" className="mn-section mn-wrap">
      <MonoHead idx="03" title="Los números" note="A la fecha" />
      <Reveal>
        <div className="mn-stats-grid">
          {cells.map((c) => (
            <div key={c.label} className="mn-stat">
              <span className="mn-stat-num">{c.num}</span>
              <span className="mn-stat-label">{c.label}</span>
            </div>
          ))}
        </div>
        <p className="mn-stats-foot">
          {stats.metLead}
          {stats.metDate}.
        </p>
      </Reveal>
    </section>
  );
}

// ── Gallery — a quiet grid of every memory ───────────────────────────────────
export function MonoGallery() {
  const { gallery } = useContent();
  const { allPhotos, thumb, full, totalPhotos } = usePhotos();
  const { open } = useMonoLightbox();

  const items = useMemo(
    () => allPhotos.map((p) => ({ src: full(p.cat, p.slug) })),
    [allPhotos, full]
  );

  return (
    <section id="galeria" className="mn-section mn-wrap">
      <MonoHead idx="04" title="Archivo" note={`${totalPhotos} fotos`} />
      <Reveal className="mn-gallery-grid">
        {allPhotos.map((p, i) => (
          <button
            key={`${p.cat}/${p.slug}`}
            className="mn-gallery-tile"
            onClick={() => open(items, i)}
            aria-label={`Foto ${i + 1} de ${totalPhotos}`}
          >
            <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </Reveal>
      <p className="mn-label" style={{ marginTop: "1.5rem" }}>
        {gallery.lede}
      </p>
    </section>
  );
}

// ── Closing — the love statement ─────────────────────────────────────────────
export function MonoClosing() {
  const { footer, drawing } = useContent();
  return (
    <section className="mn-closing mn-wrap">
      <Reveal>
        <p className="mn-closing-mark">∞</p>
        <p className="mn-closing-title">
          {footer.title.replace(/,.*/, "")}
          {footer.title.includes(",") && (
            <>
              , <em>{footer.title.split(",").slice(1).join(",").trim()}</em>
            </>
          )}
        </p>
        <p className="mn-closing-sig">{drawing.message} · {drawing.from}</p>
      </Reveal>
    </section>
  );
}
