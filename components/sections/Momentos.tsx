"use client";

import SectionHead from "@/components/SectionHead";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import { useLightbox } from "@/components/Lightbox";
import { EditableText, useEditableImgClass, usePhotoAction } from "@/lib/edit-context";

export default function Momentos({ id }: { id: string }) {
  const { open } = useLightbox();
  const { moments, ui } = useContent();
  const { full, photos, thumb } = usePhotos();
  // en el editor, tocar la carta lleva a CAMBIAR esa foto (no al lightbox)
  const photoClick = usePhotoAction();
  const editableImg = useEditableImgClass();

  return (
    <section id={id} className="section-pad">
      <SectionHead
        kicker={<EditableText path="moments.kicker" value={moments.kicker} />}
        title={<EditableText path="moments.title" value={moments.title} />}
        lede={<EditableText as="span" path="moments.lede" value={moments.lede} />}
      />
      <div className="wrap bento">
        {moments.cards.map((m, i) => {
          const slugs = photos(m.cat);
          if (!slugs.length) return null;
          const items = slugs.map((s) => ({
            src: full(m.cat, s),
            thumb: thumb(m.cat, s),
            caption: m.title,
          }));
          return (
            <button
              key={m.cat}
              className={`moment-card reveal-scale span-${i < 2 ? 3 : 2} ${editableImg}`}
              style={{ "--reveal-delay": `${(i % 3) * 0.07}s` } as React.CSSProperties}
              onClick={photoClick(m.cat, slugs[0], () => open(items, 0))}
              aria-label={fill(ui.momentAria, { title: m.title })}
            >
              <img
                className="moment-cover"
                src={thumb(m.cat, slugs[0])}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="moment-overlay" aria-hidden />
              <span className="moment-meta">
                <span className="moment-title">
                  {m.flag ? <img className="flag" src={m.flag} alt="" /> : null}
                  {m.emoji ? <span aria-hidden>{m.emoji}</span> : null}{" "}
                  <EditableText path={`moments.cards.${i}.title`} value={m.title} />
                </span>
                <span className="chip">{fill(ui.photosCount, { count: slugs.length })}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
