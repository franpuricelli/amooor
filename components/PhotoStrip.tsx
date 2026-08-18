"use client";

import { useMemo } from "react";
import { useLightbox } from "@/components/Lightbox";
import { usePhotos } from "@/lib/photos-context";
import { useEditableImgClass, usePhotoAction } from "@/lib/edit-context";

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
  const { full, thumb } = usePhotos();
  // en el editor cada tile lleva a cambiar ESA foto (Multimedia), no al lightbox
  const photoClick = usePhotoAction();
  const editableImg = useEditableImgClass();
  const items = useMemo(
    () => slugs.map((s) => ({ src: full(cat, s), thumb: thumb(cat, s), caption })),
    [cat, slugs, caption, full, thumb]
  );

  return (
    <div className="strip">
      {slugs.map((slug, i) => (
        <button
          key={slug}
          className={`tile ${editableImg}`}
          onClick={photoClick(cat, slug, () => open(items, i))}
          aria-label={`${caption ?? "Foto"} ${i + 1}`}
        >
          <img src={thumb(cat, slug)} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  );
}
