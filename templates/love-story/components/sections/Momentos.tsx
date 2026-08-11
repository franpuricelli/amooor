"use client";

import SectionHead from "@/components/SectionHead";
import { config } from "@/lib/config";
import { full, photos, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";
import { useI18n } from "@/lib/i18n";

export default function Momentos() {
  const { open } = useLightbox();
  const { t, tr } = useI18n();

  return (
    <section id="momentos" className="section-pad">
      <SectionHead kicker={t.momentos.kicker} title={t.momentos.title} lede={t.momentos.lede} />
      <div className="wrap bento">
        {config.momentos.map((m, i) => {
          const slugs = photos(m.cat);
          if (!slugs.length) return null;
          const title = tr(m.title);
          const items = slugs.map((s) => ({
            src: full(m.cat, s),
            thumb: thumb(m.cat, s),
            caption: title,
          }));
          const flag = (m as { flag?: string }).flag;
          return (
            <button
              key={m.cat}
              className={`moment-card reveal-scale span-${i < 2 ? 3 : 2}`}
              style={{ "--reveal-delay": `${(i % 3) * 0.07}s` } as React.CSSProperties}
              onClick={() => open(items, 0)}
              aria-label={`${t.momentos.title}: ${title}`}
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
                  {flag ? <img className="flag" src={flag} alt="" /> : null}
                  <span aria-hidden>{m.emoji}</span> {title}
                </span>
                <span className="chip">
                  {slugs.length} {t.photosWord}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
