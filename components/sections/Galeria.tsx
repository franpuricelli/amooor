"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHead from "@/components/SectionHead";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import { useLightbox } from "@/components/Lightbox";
import { useLenis } from "lenis/react";
import { EditableText, useEditableImgClass, usePhotoAction } from "@/lib/edit-context";

const COLS = 8;
// Con pocas fotos, tantas columnas quedan cortas y el marquee se ve "colapsado"
// (huecos negros al hacer loop). Reducimos columnas y repetimos cada columna
// hasta este mínimo de tiles para que el alto siempre quede lleno.
const MIN_PER_COL = 12;

/**
 * Wall of love: columns of memories drifting up/down in a loop (no infinite
 * page scroll). The number of columns adapts to how many photos there are so it
 * never collapses with few images. The CTA opens a full-screen overlay with
 * every photo.
 */
export default function Galeria({ id }: { id: string }) {
  const { open } = useLightbox();
  const lenis = useLenis();
  const [showAll, setShowAll] = useState(false);
  const { gallery, ui } = useContent();
  const { allPhotos, full, thumb, totalPhotos } = usePhotos();
  // en el editor, tocar una foto del muro abre Multimedia en esa foto
  const photoClick = usePhotoAction();
  const editableImg = useEditableImgClass();

  const items = useMemo(
    () => allPhotos.map((p) => ({ src: full(p.cat, p.slug), thumb: thumb(p.cat, p.slug) })),
    [allPhotos, full, thumb]
  );
  // Menos fotos → menos columnas (cada una más ancha y con más tiles).
  const colCount = Math.max(1, Math.min(COLS, Math.ceil(allPhotos.length / 2)));
  const columns = useMemo(() => {
    const cols = Array.from(
      { length: colCount },
      () => [] as { cat: string; slug: string; i: number }[]
    );
    allPhotos.forEach((p, i) => cols[i % colCount].push({ ...p, i }));
    // Repetimos los tiles de cada columna hasta llenar el alto del marquee, así
    // el loop no deja huecos cuando hay pocas fotos.
    return cols.map((col) => {
      if (col.length === 0) return col;
      const times = Math.ceil(MIN_PER_COL / col.length);
      return Array.from({ length: times }, () => col).flat();
    });
  }, [allPhotos, colCount]);

  // lock page scroll while the full-screen overlay is open
  useEffect(() => {
    if (showAll) lenis?.stop();
    else lenis?.start();
    return () => {
      lenis?.start();
    };
  }, [showAll, lenis]);

  const photoAria = (i: number) => fill(ui.photoAria, { n: i + 1, total: totalPhotos });

  const tile = (
    p: { cat: string; slug: string; i: number },
    key: string,
    interactive: boolean
  ) => (
    <button
      key={key}
      className={`wol-tile ${editableImg}`}
      onClick={photoClick(p.cat, p.slug, () => open(items, p.i))}
      tabIndex={interactive ? 0 : -1}
      aria-label={photoAria(p.i)}
    >
      <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
    </button>
  );

  return (
    <section id={id} className="section-pad section-dark">
      <SectionHead
        eyebrow={fill(gallery.eyebrow, { count: totalPhotos })}
        title={<EditableText path="gallery.title" value={gallery.title} />}
        lede={<EditableText as="span" path="gallery.lede" value={gallery.lede} />}
      />

      <div className="wrap">
        <div
          className="wol-marquee reveal"
          style={
            {
              "--cols": colCount,
              "--cols-m": Math.min(colCount, 4),
            } as React.CSSProperties
          }
        >
          {columns.map((col, ci) => (
            <div
              key={ci}
              className={`wol-col ${ci % 2 ? "down" : "up"}`}
              style={{ "--dur": `${110 + ci * 14}s` } as React.CSSProperties}
            >
              <div className="wol-track">
                {/* two copies for a seamless loop */}
                <div className="wol-half">
                  {col.map((p, ti) => tile(p, `${p.cat}/${p.slug}/${ti}`, true))}
                </div>
                <div className="wol-half" aria-hidden>
                  {col.map((p, ti) => tile(p, `b/${p.cat}/${p.slug}/${ti}`, false))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="wol-actions reveal">
          <button className="btn" onClick={() => setShowAll(true)}>
            {fill(gallery.cta, { count: totalPhotos })}
          </button>
        </div>
      </div>

      {showAll && (
        <div className="wol-overlay" role="dialog" aria-modal="true" data-lenis-prevent>
          <button
            className="lightbox-btn wol-close glass"
            aria-label={gallery.closeLabel}
            onClick={() => setShowAll(false)}
          >
            ✕
          </button>
          <div className="wol-overlay-head">
            <span className="eyebrow">{fill(gallery.eyebrow, { count: totalPhotos })}</span>
          </div>
          <div className="wall wall-mini">
            {allPhotos.map((p, i) => (
              <button
                key={`${p.cat}/${p.slug}`}
                className="tile"
                onClick={() => open(items, i)}
                aria-label={photoAria(i)}
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
