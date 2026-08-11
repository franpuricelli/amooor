import SectionHead from "@/components/SectionHead";
import TikTokEmbed from "@/components/TikTokEmbed";
import { config } from "@/lib/config";

export default function Pelis() {
  const list = config.watchlist;
  const featured = list.filter((m) => m.note);
  const rest = list.filter((m) => !m.note);

  return (
    <section id="pelis" className="section-pad section-dark sheet-top">
      <SectionHead
        kicker={`At night · De noche · ${list.length} titles · títulos`}
        title="We binged · Maratoneamos"
        lede="Movies, series and «just one more episode» nights. Your own lineup. · Pelis, series y madrugadas de «un capítulo más». Tu propia programación."
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

        <p className="watch-more reveal">…and the rest · …y las que faltan</p>

        {/* la película sin fin */}
        <div className="tiktok-card glass-card reveal">
          <p className="tiktok-label">and our never-ending movie · y nuestra película sin fin ↓</p>
          <TikTokEmbed />
        </div>
      </div>
    </section>
  );
}
