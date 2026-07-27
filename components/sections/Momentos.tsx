"use client";

import SectionHead from "@/components/SectionHead";
import { config } from "@/lib/config";
import { full, photos, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";

export default function Momentos() {
  const { open } = useLightbox();

  return (
    <section id="momentos" className="section-pad">
      <SectionHead
        kicker="y en el medio…"
        title="Celebramos todo"
        lede="San Valentín, aniversarios, el Mundial que ganamos y todas las cositas cute del medio. Tocá una carta para verlas todas."
      />
      <div className="wrap bento">
        {config.momentos.map((m, i) => {
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
              aria-label={`Ver fotos de ${m.title}`}
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
                  {"flag" in m && m.flag ? (
                    <img className="flag" src={m.flag} alt="" />
                  ) : null}
                  <span aria-hidden>{m.emoji}</span> {m.title}
                </span>
                <span className="chip">{slugs.length} fotos</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
