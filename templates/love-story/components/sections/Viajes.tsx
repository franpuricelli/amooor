"use client";

import SectionHead from "@/components/SectionHead";
import PhotoStrip from "@/components/PhotoStrip";
import { config } from "@/lib/config";
import { full, photos, thumb } from "@/lib/photos";
import { useLightbox } from "@/components/Lightbox";
import { useI18n } from "@/lib/i18n";

/**
 * Each trip is a full-screen panel. Panels are sticky, so while you scroll the
 * next one slides up and covers the previous (deck effect). The "N photos" chip
 * opens the whole album in the lightbox.
 */
export default function Viajes() {
  const { open } = useLightbox();
  const { t, tr } = useI18n();

  return (
    <section id="viajes">
      <div className="section-pad" style={{ paddingBottom: "clamp(2rem, 5vh, 3rem)" }}>
        <SectionHead kicker={t.viajes.kicker} title={t.viajes.title} lede={t.viajes.lede} />
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
          const flag = (v as { flag?: string }).flag;
          return (
            <div key={v.cat} className="pais-panel">
              <div className="pais-inner">
                <div className="pais-head reveal">
                  {flag ? (
                    <img className="flag" src={flag} alt={tr(v.place)} />
                  ) : (
                    <span className="flag-emoji" aria-hidden>
                      {(v as { emoji?: string }).emoji ?? "📍"}
                    </span>
                  )}
                  <h3 className="h2">{v.title}</h3>
                  <span className="destino-place">{tr(v.place)}</span>
                  <button
                    className="chip chip-ink chip-btn"
                    onClick={() => open(items, 0)}
                    aria-label={`${t.story.seePhotos.replace("{n}", String(slugs.length))} — ${v.title}`}
                  >
                    {slugs.length} {t.photosWord}
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
