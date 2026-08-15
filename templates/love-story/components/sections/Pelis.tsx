"use client";

import SectionHead from "@/components/SectionHead";
import TikTokEmbed from "@/components/TikTokEmbed";
import { config } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

export default function Pelis() {
  const { t, tr } = useI18n();
  const list = config.watchlist;
  const featured = list.filter((m) => m.note);
  const rest = list.filter((m) => !m.note);

  return (
    <section id="pelis" className="section-pad section-dark sheet-top">
      <SectionHead
        kicker={`${t.pelis.kicker} · ${list.length} ${t.pelis.titlesWord}`}
        title={t.pelis.title}
        lede={t.pelis.lede}
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
              <span className={`kind-pill ${m.kind}`}>{t.pelis.kind[m.kind]}</span>
              <span className="watch-feature-title">{m.title}</span>
              {m.note && <span className="watch-feature-note">{tr(m.note)}</span>}
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

        <p className="watch-more reveal">{t.pelis.more}</p>

        {/* the never-ending movie */}
        <div className="tiktok-card glass-card reveal">
          <p className="tiktok-label">{t.pelis.tiktokLabel}</p>
          <TikTokEmbed />
        </div>
      </div>
    </section>
  );
}
