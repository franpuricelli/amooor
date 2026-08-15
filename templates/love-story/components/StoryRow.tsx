"use client";

import { useEffect, useMemo, useState } from "react";
import { full, photos, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";
import { useI18n } from "@/lib/i18n";

export interface StoryPhoto {
  cat: string;
  slug: string;
}

/**
 * One beat of the story: narrative text on one side, a small tilted photo
 * collage on the other. The photos are a complement — the full album lives
 * behind the button / the collage clicks (lightbox).
 */
export default function StoryRow({
  kicker,
  title,
  text,
  cats,
  picks,
  flip = false,
}: {
  kicker: string;
  title: React.ReactNode;
  text: React.ReactNode;
  cats: string[]; // categories that make up this beat's full album
  picks: StoryPhoto[]; // the 2–4 photos shown in the collage
  flip?: boolean;
}) {
  const { open } = useLightbox();
  const { t } = useI18n();
  const catsKey = cats.join(",");
  const album = useMemo(
    () => cats.flatMap((c) => photos(c).map((slug) => ({ cat: c, slug }))),
    [catsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Collage photos are randomized per visit. SSR renders the curated picks,
  // then we shuffle on the client after hydration (no mismatch).
  const [collage, setCollage] = useState(picks);
  useEffect(() => {
    const pool = [...album];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setCollage(pool.slice(0, picks.length));
  }, [album, picks.length]);
  const items = useMemo(
    () => album.map((p) => ({ src: full(p.cat, p.slug), thumb: thumb(p.cat, p.slug) })),
    [album]
  );
  const indexOf = (p: StoryPhoto) =>
    Math.max(0, album.findIndex((a) => a.cat === p.cat && a.slug === p.slug));

  return (
    <div className={`story-row ${flip ? "flip" : ""}`}>
      <div className="story-text">
        <span className="story-kicker reveal">{kicker}</span>
        <h2
          className="h2 reveal"
          style={{ "--reveal-delay": "0.06s" } as React.CSSProperties}
        >
          {title}
        </h2>
        <p
          className="lede reveal"
          style={{ "--reveal-delay": "0.12s" } as React.CSSProperties}
        >
          {text}
        </p>
        <button
          className="btn reveal"
          style={{ "--reveal-delay": "0.18s" } as React.CSSProperties}
          onClick={() => open(items, 0)}
        >
          {t.story.seePhotos.replace("{n}", String(album.length))} →
        </button>
      </div>

      <div className={`story-collage ${flip ? "reveal-left" : "reveal-right"}`}>
        {collage.map((p, i) => (
          <button
            key={`${p.cat}/${p.slug}`}
            className={`collage-tile ct-${i + 1}`}
            onClick={() => open(items, indexOf(p))}
            aria-label="Ver foto"
          >
            <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
