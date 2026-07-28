"use client";

import SectionHead from "@/components/SectionHead";
import PhotoStrip from "@/components/PhotoStrip";
import { useLightbox } from "@/components/Lightbox";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";

/**
 * Each destination is a full-screen panel. Panels are sticky, so while you
 * scroll the next one slides up and covers the previous one (deck effect).
 */
export default function Viajes({ id }: { id: string }) {
  const { open } = useLightbox();
  const { travel, ui } = useContent();
  const { full, photos, thumb } = usePhotos();

  return (
    <section id={id}>
      <div className="section-pad" style={{ paddingBottom: "clamp(2rem, 5vh, 3rem)" }}>
        <SectionHead kicker={travel.kicker} title={travel.title} lede={travel.lede} />
      </div>

      <div className="paises">
        {travel.destinations.map((v) => {
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
                  {v.flag ? (
                    <img className="flag" src={v.flag} alt={v.place} />
                  ) : (
                    <span className="flag-emoji" aria-hidden>
                      {v.emoji ?? "📍"}
                    </span>
                  )}
                  <h3 className="h2">{v.title}</h3>
                  <span className="destino-place">{v.place}</span>
                  <button
                    className="chip chip-ink chip-btn"
                    onClick={() => open(items, 0)}
                    aria-label={fill(ui.albumAria, { count: slugs.length, title: v.title })}
                  >
                    {fill(ui.photosCount, { count: slugs.length })}
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
