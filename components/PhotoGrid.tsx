"use client";

import { useMemo } from "react";
import { useLightbox } from "@/components/Lightbox";
import { usePhotos } from "@/lib/photos-context";

export interface GridPhoto {
  cat: string;
  slug: string;
}

/** Square-tile grid; click opens the lightbox slideshow over the whole set. */
export default function PhotoGrid({
  photos,
  caption,
}: {
  photos: GridPhoto[];
  caption?: string;
}) {
  const { open } = useLightbox();
  const { full, thumb } = usePhotos();
  const items = useMemo(
    () =>
      photos.map((p) => ({
        src: full(p.cat, p.slug),
        thumb: thumb(p.cat, p.slug),
        caption,
      })),
    [photos, caption, full, thumb]
  );

  return (
    <div className="photo-grid">
      {photos.map((p, i) => (
        <button
          key={`${p.cat}/${p.slug}`}
          className="tile"
          onClick={() => open(items, i)}
          aria-label={`${caption ?? "Foto"} ${i + 1}`}
        >
          <img
            src={thumb(p.cat, p.slug)}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </button>
      ))}
    </div>
  );
}
