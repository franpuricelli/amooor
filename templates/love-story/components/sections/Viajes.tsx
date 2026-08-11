"use client";

import SectionHead from "@/components/SectionHead";
import PhotoStrip from "@/components/PhotoStrip";
import { config } from "@/lib/config";
import { photos } from "@/lib/photos";

/**
 * Each country is a full-screen panel. Panels are sticky, so while you scroll
 * the next country slides up and covers the previous one (deck effect).
 */
export default function Viajes() {
  return (
    <section id="viajes">
      <div className="section-pad" style={{ paddingBottom: "clamp(2rem, 5vh, 3rem)" }}>
        <SectionHead
          kicker="Bags packed · Con la valija lista"
          title="We traveled · Viajamos"
          lede="Every place you went, same photo: the two of you. List your trips in lib/config.ts. · Cada lugar al que fueron, la misma foto: ustedes dos. Cargá tus viajes en lib/config.ts."
        />
      </div>

      <div className="paises">
        {config.viajes.map((v) => {
          const slugs = photos(v.cat);
          if (!slugs.length) return null;
          return (
            <div key={v.cat} className="pais-panel">
              <div className="pais-inner">
                <div className="pais-head reveal">
                  {/* Optional flag image; falls back to the emoji. · Imagen de bandera opcional; usa el emoji si no hay. */}
                  {(v as { flag?: string }).flag ? (
                    <img className="flag" src={(v as { flag?: string }).flag} alt={v.place} />
                  ) : (
                    <span className="flag-emoji" aria-hidden>
                      {(v as { emoji?: string }).emoji ?? "📍"}
                    </span>
                  )}
                  <h3 className="h2">{v.title}</h3>
                  <span className="destino-place">{v.place}</span>
                  <span className="chip chip-ink">{slugs.length} 📷</span>
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
