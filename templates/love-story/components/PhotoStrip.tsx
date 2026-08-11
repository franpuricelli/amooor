"use client";

import { useMemo } from "react";
import { full, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";

/** Horizontal scroll-snap row of photos; click opens the lightbox slideshow. */
export default function PhotoStrip({
  cat,
  slugs,
  caption,
}: {
  cat: string;
  slugs: string[];
  caption?: string;
}) {
  const { open } = useLightbox();
  const items = useMemo(
    () => slugs.map((s) => ({ src: full(cat, s), thumb: thumb(cat, s), caption })),
    [cat, slugs, caption]
  );

  return (
    <div className="strip">
      {slugs.map((slug, i) => (
        <button
          key={slug}
          className="tile"
          onClick={() => open(items, i)}
          aria-label={`${caption ?? "Foto"} ${i + 1}`}
        >
          <img src={thumb(cat, slug)} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  );
}
