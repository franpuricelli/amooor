"use client";

import SectionHead from "@/components/SectionHead";
import WatchVideo from "@/components/WatchVideo";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import { EditableText } from "@/lib/edit-context";

// Cuántos títulos "sueltos" se muestran en la grilla (el resto queda en el
// "…y las que faltan"). Mantiene la sección compacta sin importar cuántos cargue
// el tenant.
const GRID_MAX = 10;

export default function Pelis({ id }: { id: string }) {
  const { watch } = useContent();
  const list = watch.list;
  const video = watch.video;
  const featured = list.filter((m) => m.note);
  const rest = list.filter((m) => !m.note).slice(0, GRID_MAX);
  const hasVideo = video.provider === "video" ? Boolean(video.src) : Boolean(video.videoId);

  return (
    <section id={id} className="section-pad section-dark sheet-top">
      <SectionHead
        kicker={fill(watch.kicker, { count: list.length })}
        title={<EditableText path="watch.title" value={watch.title} />}
        lede={<EditableText as="span" path="watch.lede" value={watch.lede} />}
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
        {hasVideo && (
          <div className="watch-video-card glass-card reveal">
            <p className="watch-video-label">{video.label}</p>
            <WatchVideo />
          </div>
        )}
      </div>
    </section>
  );
}
