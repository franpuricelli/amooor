"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHead from "@/components/SectionHead";
import { allPhotos, full, thumb, totalPhotos } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";
import { useLenis } from "lenis/react";

const COLS = 8;

/**
 * Wall of love: 8 columns of memories drifting up/down in a loop (no infinite
 * page scroll). "Ver todas" opens a full-screen overlay with every photo.
 */
export default function Galeria() {
  const { open } = useLightbox();
  const lenis = useLenis();
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(
    () => allPhotos.map((p) => ({ src: full(p.cat, p.slug), thumb: thumb(p.cat, p.slug) })),
    []
  );
  const columns = useMemo(() => {
    const cols = Array.from(
      { length: COLS },
      () => [] as { cat: string; slug: string; i: number }[]
    );
    allPhotos.forEach((p, i) => cols[i % COLS].push({ ...p, i }));
    return cols;
  }, []);

  // lock page scroll while the full-screen overlay is open
  useEffect(() => {
    if (showAll) lenis?.stop();
    else lenis?.start();
    return () => {
      lenis?.start();
    };
  }, [showAll, lenis]);

  const tile = (p: { cat: string; slug: string; i: number }, extra?: number) => (
    <button
      key={`${p.cat}/${p.slug}/${extra ?? 0}`}
      className="wol-tile"
      onClick={() => open(items, p.i)}
      tabIndex={extra ? -1 : 0}
      aria-label={`Foto ${p.i + 1} de ${totalPhotos}`}
    >
      <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
    </button>
  );

  return (
    <section id="galeria" className="section-pad section-dark">
      <SectionHead
        eyebrow={`❤ wall of love · ${totalPhotos} recuerdos`}
        title="Wall of love"
        lede="Todos los recuerdos, juntitos. Cada foto es un día que elegimos estar juntos. Tocá cualquiera para verla grande."
      />

      <div className="wrap">
        <div className="wol-marquee reveal">
          {columns.map((col, ci) => (
            <div
              key={ci}
              className={`wol-col ${ci % 2 ? "down" : "up"}`}
              style={{ "--dur": `${110 + ci * 14}s` } as React.CSSProperties}
            >
              <div className="wol-track">
                {/* two copies for a seamless loop */}
                <div className="wol-half">{col.map((p) => tile(p))}</div>
                <div className="wol-half" aria-hidden>
                  {col.map((p) => tile(p, 1))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="wol-actions reveal">
          <button className="btn" onClick={() => setShowAll(true)}>
            Ver todas las {totalPhotos} fotos →
          </button>
        </div>
      </div>

      {showAll && (
        <div className="wol-overlay" role="dialog" aria-modal="true" data-lenis-prevent>
          <button
            className="lightbox-btn wol-close glass"
            aria-label="Cerrar"
            onClick={() => setShowAll(false)}
          >
            ✕
          </button>
          <div className="wol-overlay-head">
            <span className="eyebrow">❤ wall of love · {totalPhotos} recuerdos</span>
          </div>
          <div className="wall wall-mini">
            {allPhotos.map((p, i) => (
              <button
                key={`${p.cat}/${p.slug}`}
                className="tile"
                onClick={() => open(items, i)}
                aria-label={`Foto ${i + 1} de ${totalPhotos}`}
              >
                <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
