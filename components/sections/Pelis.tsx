"use client";

import SectionHead from "@/components/SectionHead";
import TikTokEmbed from "@/components/TikTokEmbed";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";

export default function Pelis({ id }: { id: string }) {
  const { watch } = useContent();
  const list = watch.list;
  const featured = list.filter((m) => m.note);
  const rest = list.filter((m) => !m.note);

  return (
    <section id={id} className="section-pad section-dark sheet-top">
      <SectionHead
        kicker={fill(watch.kicker, { count: list.length })}
        title={watch.title}
        lede={watch.lede}
      />

      <div className="wrap">
        {/* ⭐ the special ones */}
        <div className="watch-featured">
          {featured.map((m, i) => (
            <div
              key={m.title}
              className="watch-feature glass-card reveal"
              style={{ "--reveal-delay": `${i * 0.08}s` } as React.CSSProperties}
            >
              <span className={`kind-pill ${m.kind}`}>{m.kind}</span>
              <span className="watch-feature-title">{m.title}</span>
              {m.note && <span className="watch-feature-note">{m.note}</span>}
            </div>
          ))}
        </div>

        {/* the whole watchlist */}
        <div className="watch-grid reveal">
          {rest.map((m) => (
            <span key={m.title} className="watch-chip">
              <span className={`kind-dot ${m.kind}`} aria-hidden />
              {m.title}
            </span>
          ))}
        </div>

        <p className="watch-more reveal">{watch.moreLabel}</p>

        {/* the never-ending movie */}
        <div className="tiktok-card glass-card reveal">
          <p className="tiktok-label">{watch.video.label}</p>
          <TikTokEmbed />
        </div>
      </div>
    </section>
  );
}
