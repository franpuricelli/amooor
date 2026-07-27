"use client";

import SectionHead from "@/components/SectionHead";
import PhotoStrip from "@/components/PhotoStrip";
import { useLightbox } from "@/components/Lightbox";
import { config } from "@/lib/config";
import { full, photos, thumb } from "@/lib/photos";

/**
 * Each country is a full-screen panel. Panels are sticky, so while you scroll
 * the next country slides up and covers the previous one (deck effect).
 */
export default function Viajes() {
  const { open } = useLightbox();

  return (
    <section id="viajes">
      <div className="section-pad" style={{ paddingBottom: "clamp(2rem, 5vh, 3rem)" }}>
        <SectionHead
          kicker="con la valija lista"
          title="Viajamos"
          lede="Bariloche fue el primero. Después cruzamos la cordillera, un trópico y un charco. En todos lados, la misma foto: nosotros."
        />
      </div>

      <div className="paises">
        {config.viajes.map((v) => {
          const slugs = photos(v.cat);
          if (!slugs.length) return null;
          const items = slugs.map((s) => ({
            src: full(v.cat, s),
            thumb: thumb(v.cat, s),
            caption: v.title,
          }));
          return (
            <div key={v.cat} className="pais-panel">
              <div className="pais-inner">
                <div className="pais-head reveal">
                  {"flag" in v && v.flag ? (
                    <img className="flag" src={v.flag} alt={v.place} />
                  ) : (
                    <span className="flag-emoji" aria-hidden>
                      {"emoji" in v ? v.emoji : "📍"}
                    </span>
                  )}
                  <h3 className="h2">{v.title}</h3>
                  <span className="destino-place">{v.place}</span>
                  <button
                    className="chip chip-ink chip-btn"
                    onClick={() => open(items, 0)}
                    aria-label={`Ver las ${slugs.length} fotos de ${v.title}`}
                  >
                    {slugs.length} fotos
                  </button>
                </div>
                <div className="reveal" style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}>
                  <PhotoStrip cat={v.cat} slugs={slugs} caption={v.title} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
