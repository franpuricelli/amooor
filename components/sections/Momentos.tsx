"use client";

import SectionHead from "@/components/SectionHead";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { full, photos, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";

export default function Momentos({ id }: { id: string }) {
  const { open } = useLightbox();
  const { moments, ui } = useContent();

  return (
    <section id={id} className="section-pad">
      <SectionHead kicker={moments.kicker} title={moments.title} lede={moments.lede} />
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
              className={`moment-card reveal-scale span-${i < 2 ? 3 : 2}`}
              style={{ "--reveal-delay": `${(i % 3) * 0.07}s` } as React.CSSProperties}
              onClick={() => open(items, 0)}
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
                  {m.emoji ? <span aria-hidden>{m.emoji}</span> : null} {m.title}
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
