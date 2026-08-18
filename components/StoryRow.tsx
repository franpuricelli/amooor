"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import { useLightbox } from "@/components/Lightbox";
import { useEditableImgClass, usePhotoAction } from "@/lib/edit-context";

export interface StoryPhoto {
  cat: string;
  slug: string;
}

/**
 * One beat of the story: narrative text on one side, a small tilted photo
 * collage on the other. All copy is passed in from `content` by the section.
 */
export default function StoryRow({
  kicker,
  title,
  titleHeart = false,
  text,
  cats,
  picks,
  flip = false,
}: {
  kicker: ReactNode;
  title: ReactNode;
  titleHeart?: boolean;
  text: ReactNode;
  cats: string[]; // categories that make up this beat's full album
  picks: StoryPhoto[]; // the 2–4 photos shown in the collage
  flip?: boolean;
}) {
  const { open } = useLightbox();
  const content = useContent();
  const { full, photos, thumb } = usePhotos();
  // en el editor, tocar una foto del collage abre Multimedia en esa foto
  const photoClick = usePhotoAction();
  const editableImg = useEditableImgClass();
  const catsKey = cats.join(",");
  const album = useMemo(
    () => cats.flatMap((c) => photos(c).map((slug) => ({ cat: c, slug }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catsKey, photos]
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
    [album, full, thumb]
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
          {titleHeart && <span className="story-heart"> ❤</span>}
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
          {fill(content.ui.seeAllPhotos, { count: album.length })}
        </button>
      </div>

      <div className={`story-collage ${flip ? "reveal-left" : "reveal-right"}`}>
        {collage.map((p, i) => (
          <button
            key={`${p.cat}/${p.slug}`}
            className={`collage-tile ct-${i + 1} ${editableImg}`}
            onClick={photoClick(p.cat, p.slug, () => open(items, indexOf(p)))}
            aria-label={content.ui.photoView}
          >
            <img src={thumb(p.cat, p.slug)} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
