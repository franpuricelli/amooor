"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  EditorialTemplate — the "Historia" template.
//
//  A storytelling template for amooor couples, inspired by the Boty editorial
//  reference but reframed to *tell a couple's story*. Sections (mirrors
//  purivi.love): hero → facts → story timeline → moments (tabs) → travel →
//  dining bento → why-us → binge/watch → live counter → wall-of-love → dedication.
//
//  Presentational: all copy + photos come from a `content` prop matching
//  `EditorialContent` (content-schema.ts). It defaults to the self-contained
//  plain skeleton (content.plain.ts); a per-couple adaptation passes its own
//  filled content. Photo viewing reuses the tenant lightbox logic via the
//  self-contained <EditorialLightboxProvider>. Remote photos degrade to a
//  gradient block (<Ph>) if a load fails.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import editorialPlain from "./content.plain";
import type { EditorialContent } from "./content-schema";
import EditorialLightboxProvider, { useEditorialLightbox, type LBPhoto } from "./EditorialLightbox";
import "./editorial.css";

// ── Line icons (Lucide-style, 24×24, stroke = currentColor) ──────────────────
function Icon({ name }: { name: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "calendar":
      return (<svg viewBox="0 0 24 24" {...p}><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>);
    case "plane":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M10.2 9 3 11l2.4 2.2L4.6 17l2.6-1 2 2.4 2-7.2 6.5 3.6c1.2.7 2.3-.9 1.3-1.9L14.4 6l1-4.2-3.1 1.7-5.6-1.9c-1.3-.4-2 1.3-.9 2z" /></svg>);
    case "home":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></svg>);
    case "infinity":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M7 8.5c-2 0-3.5 1.6-3.5 3.5S5 15.5 7 15.5c2.5 0 3.8-2.5 5-3.5 1.2-1 2.5-3.5 5-3.5 2 0 3.5 1.6 3.5 3.5S19 15.5 17 15.5c-2.5 0-3.8-2.5-5-3.5" /></svg>);
    case "spark":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z" /><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>);
    case "leaf":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M20 4C10 4 4 9 4 17c0 1 0 2 .5 3C6 14 11 11 18 10c-6 2-10 5-12 11" /></svg>);
    case "check":
      return (<svg viewBox="0 0 24 24" {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>);
    case "heart":
      return (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.4 4.5c2 0 3.4 1.3 4.1 2.6l1.5 0c.7-1.3 2.1-2.6 4.1-2.6 3.4 0 5.1 3.5 3.6 6.5C19 15.4 12 20 12 20z" /></svg>);
    case "play":
      return (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5z" /></svg>);
    default:
      return null;
  }
}

// ── Photo with graceful fallback ─────────────────────────────────────────────
function Ph({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`ed-img is-fallback ${className ?? ""}`} role="img" aria-label={alt} />;
  return <img className={`ed-img ${className ?? ""}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function Brand({ a, b }: { a: string; b: string }) {
  return (<>{a}<span className="ed-amp">&amp;</span>{b}</>);
}

const toItems = (urls: string[], caption?: string): LBPhoto[] =>
  urls.map((u) => ({ src: u, thumb: u, caption }));

// ── Live "together since" counter ────────────────────────────────────────────
function useElapsed(sinceISO: string) {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const since = new Date(sinceISO).getTime();
    const tick = () => {
      const diff = Math.max(0, Date.now() - since);
      const s = Math.floor(diff / 1000);
      setT({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sinceISO]);
  return t;
}
const pad = (n: number) => String(n).padStart(2, "0");

// ── Music: the nav pill toggles the song (ported from tenant MusicToggle) ────
function useMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };
  return { playing, toggle };
}

const WALL_COLS = 5;

function EditorialInner({ content, variant }: { content: EditorialContent; variant: string }) {
  const c = content;
  const { open } = useEditorialLightbox();
  const [tab, setTab] = useState<string>(c.moments.tabs[0]?.key ?? "");
  const [flipped, setFlipped] = useState(false);
  const activeTab = c.moments.tabs.find((t) => t.key === tab) ?? c.moments.tabs[0];
  const elapsed = useElapsed(c.counter.since);
  const music = useMusic(c.music.src);

  // Full album the moments lightbox opens over: visible cards first, then extras.
  const tabAlbum = useMemo(
    () => (activeTab ? toItems([...activeTab.items.map((i) => i.img), ...activeTab.more]) : []),
    [activeTab]
  );

  // Wall of love: distribute photos across drifting columns, keeping the global
  // index so a click opens the lightbox at the right photo.
  const wallItems = useMemo(() => toItems(c.gallery.photos), [c.gallery.photos]);
  const wallCols = useMemo(() => {
    const cols: { src: string; i: number }[][] = Array.from({ length: WALL_COLS }, () => []);
    c.gallery.photos.forEach((src, i) => cols[i % WALL_COLS].push({ src, i }));
    return cols;
  }, [c.gallery.photos]);

  return (
    <div className={`ed${variant === "romantic" ? " ed--romantic" : ""}`}>
      {/* ── Nav (compact pill — click toggles the music) ──────────────────── */}
      <nav className="ed-nav" aria-label="Navegación">
        <button
          className={`ed-navpill ${music.playing ? "is-playing" : ""}`}
          onClick={music.toggle}
          aria-label={music.playing ? c.music.pauseLabel : c.music.playLabel}
          title={music.playing ? c.music.pauseLabel : c.music.playLabel}
        >
          <span className="ed-navpill-heart" aria-hidden><Icon name="heart" /></span>
          <span className="ed-navpill-brand"><Brand a={c.couple.a} b={c.couple.b} /></span>
        </button>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header className="ed-hero" id="historia">
        <div className="ed-hero-media"><Ph src={c.hero.img} alt={c.hero.alt} /></div>
        <div className="ed-shell ed-hero-inner">
          <div className="ed-hero-copy">
            <span className="ed-eyebrow ed-hero-eyebrow">{c.hero.eyebrow}</span>
            <h1>
              <span className="ed-line-1">{c.hero.line1}</span>
              <span className="ed-line-2">{c.hero.line2}</span>
            </h1>
            <p className="ed-hero-lede">{c.hero.lede}</p>
          </div>
        </div>
      </header>

      {/* ── Facts strip ───────────────────────────────────────────────────── */}
      <section className="ed-facts">
        <div className="ed-shell ed-facts-grid">
          {c.facts.map((f) => (
            <div className="ed-fact" key={f.title}>
              <div className="ed-fact-ico"><Icon name={f.icon} /></div>
              <h3 className="ed-serif">{f.title}</h3>
              <p>{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story timeline (alternating, tilted collage) ──────────────────── */}
      <section className="ed-story">
        <div className="ed-shell">
          <div className="ed-center">
            <span className="ed-eyebrow">{c.story.eyebrow}</span>
            <h2>{c.story.title}</h2>
            <p>{c.story.lede}</p>
          </div>
          <div className="ed-beats">
            {c.story.beats.map((b, i) => {
              const items = toItems(b.photos);
              return (
                <article className={`ed-beat ${i % 2 ? "is-flip" : ""}`} key={b.title}>
                  <div className="ed-collage">
                    {b.photos.slice(0, 3).map((src, j) => (
                      <button
                        key={src}
                        className={`ed-collage-tile ct-${j + 1}`}
                        onClick={() => open(items, j)}
                        aria-label={c.ui.photoView}
                      >
                        <Ph src={src} alt={b.alt} />
                      </button>
                    ))}
                  </div>
                  <div className="ed-beat-copy">
                    <span className="ed-beat-kicker">{b.kicker}</span>
                    <h3 className="ed-serif">{b.title}</h3>
                    <p>{b.text}</p>
                    <button className="ed-textlink" onClick={() => open(items, 0)}>
                      {c.ui.seeAll} ({b.photos.length})
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Moments (tabs; click → album lightbox) ────────────────────────── */}
      <section className="ed-moments" id="momentos">
        <div className="ed-shell">
          <div className="ed-center">
            <span className="ed-eyebrow">{c.moments.eyebrow}</span>
            <h2>{c.moments.title}</h2>
            <p>{c.moments.lede}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="ed-tabs" role="tablist" aria-label={c.moments.title}>
              {c.moments.tabs.map((t) => (
                <button key={t.key} role="tab" aria-selected={tab === t.key} className={`ed-tab ${tab === t.key ? "is-on" : ""}`} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ed-cards ed-cards-center">
            {activeTab?.items.map((m, i) => (
              <button className="ed-card" key={m.title} onClick={() => open(tabAlbum, i)} aria-label={m.title}>
                <Ph src={m.img} alt={m.title} />
                <span className="ed-card-cap"><b>{m.title}</b><span>{m.sub}</span></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel ────────────────────────────────────────────────────────── */}
      <section className="ed-travel" id="viajes">
        <div className="ed-shell">
          <div className="ed-center">
            <span className="ed-eyebrow">{c.travel.eyebrow}</span>
            <h2>{c.travel.title}</h2>
            <p>{c.travel.lede}</p>
          </div>
          <div className="ed-dest-grid">
            {c.travel.destinations.map((d) => (
              <figure className="ed-dest" key={d.title}>
                <div className="ed-dest-img"><Ph src={d.img} alt={d.title} /></div>
                <div className="ed-dest-cap">
                  <span className="ed-dest-flag">
                    {d.flag ? <img src={d.flag} alt="" /> : <span aria-hidden>{d.emoji}</span>}
                  </span>
                  <div>
                    <b className="ed-serif">{d.title}</b>
                    <span>{d.place} · {d.count}</span>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dining bento ──────────────────────────────────────────────────── */}
      <section className="ed-bento">
        <div className="ed-shell ed-bento-grid">
          <div className="ed-bento-big">
            <Ph src={c.dining.big.img} alt={c.dining.big.title} />
            <div className="ed-bento-cap"><b>{c.dining.big.title}</b><span>{c.dining.big.text}</span></div>
          </div>
          <div className="ed-bento-green">
            <h3>{c.dining.green.titleLead}<br /><span>{c.dining.green.titleMuted}</span></h3>
            <ul className="ed-checklist">
              {c.dining.green.checklist.map((item) => (<li key={item}><Icon name="check" /> {item}</li>))}
            </ul>
            <div className="ed-bento-green-art"><Ph src={c.dining.green.art} alt="" /></div>
          </div>
          <div className="ed-bento-light ed-bento-light-full">
            <Ph src={c.dining.light.thumb} alt={c.dining.light.title} className="ed-bento-light-bg" />
            <div className="ed-bento-light-copy">
              <div className="ed-mini-eyebrow">{c.dining.light.eyebrow}</div>
              <h3 className="ed-serif">{c.dining.light.title}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why us (split) ────────────────────────────────────────────────── */}
      <section className="ed-why" id="nosotros">
        <div className="ed-shell ed-why-grid">
          <div className="ed-why-img"><Ph src={c.why.img} alt={`${c.couple.a} & ${c.couple.b}`} /></div>
          <div>
            <span className="ed-eyebrow">{c.why.eyebrow}</span>
            <h2>{c.why.titleLead} <span className="ed-em">{c.why.titleEm}</span></h2>
            <p className="ed-why-lede">{c.why.lede}</p>
            <div className="ed-why-cards">
              {c.why.cards.map((card) => (
                <div className="ed-why-card" key={card.title}>
                  <div className="ed-why-card-ico"><Icon name={card.icon} /></div>
                  <b>{card.title}</b><span>{card.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Binge / watch (dark) ──────────────────────────────────────────── */}
      <section className="ed-watch">
        <div className="ed-shell">
          <div className="ed-center ed-center-light">
            <span className="ed-eyebrow">{c.watch.eyebrow}</span>
            <h2>{c.watch.title}</h2>
            <p>{c.watch.lede}</p>
          </div>
          <div className="ed-watch-favs">
            {c.watch.favs.map((f) => (
              <div className="ed-watch-fav" key={f.title}>
                <span className="ed-watch-play"><Icon name="play" /></span>
                <div>
                  <b className="ed-serif">{f.title}</b>
                  <span className="ed-watch-kind">{f.kind}</span>
                  <span className="ed-watch-note">{f.note}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="ed-watch-more">
            <span className="ed-watch-more-label">{c.watch.moreLabel}</span>
            <div className="ed-watch-chips">
              {c.watch.titles.map((t) => (<span className="ed-watch-chip" key={t}>{t}</span>))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live counter ──────────────────────────────────────────────────── */}
      <section className="ed-counter">
        <div className="ed-shell ed-center">
          <span className="ed-eyebrow">{c.counter.eyebrow}</span>
          <div className="ed-count-grid" aria-live="off">
            {[
              { v: elapsed?.d, label: c.counter.labels.days, raw: true },
              { v: elapsed?.h, label: c.counter.labels.hours },
              { v: elapsed?.m, label: c.counter.labels.mins },
              { v: elapsed?.s, label: c.counter.labels.secs },
            ].map((u, i) => (
              <div className="ed-count-box" key={i}>
                <b className="ed-serif">{u.v == null ? "—" : u.raw ? u.v : pad(u.v)}</b>
                <span>{u.label}</span>
              </div>
            ))}
          </div>
          <div className="ed-count-chips">
            {c.counter.chips.map((chip) => (<span className="ed-count-chip" key={chip}>{chip}</span>))}
          </div>
          <p className="ed-count-met">{c.counter.metLead} <b>{c.counter.metDate}</b></p>
        </div>
      </section>

      {/* ── Wall of love (drifting columns; click → lightbox) ─────────────── */}
      <section className="ed-wall">
        <div className="ed-shell">
          <div className="ed-center">
            <span className="ed-eyebrow">{c.gallery.eyebrow}</span>
            <h2>{c.gallery.title}</h2>
            <p>{c.gallery.lede}</p>
          </div>
        </div>
        <div className="ed-wall-marquee">
          {wallCols.map((col, ci) => (
            <div className={`ed-wall-col ${ci % 2 ? "down" : "up"}`} key={ci} style={{ "--dur": `${90 + ci * 12}s` } as React.CSSProperties}>
              <div className="ed-wall-track">
                {[0, 1].map((copy) => (
                  <div className="ed-wall-half" key={copy} aria-hidden={copy === 1}>
                    {col.map((p) => (
                      <button
                        key={`${p.src}-${copy}`}
                        className="ed-wall-cell"
                        onClick={() => open(wallItems, p.i)}
                        tabIndex={copy ? -1 : 0}
                        aria-label={`Recuerdo ${p.i + 1}`}
                      >
                        <Ph src={p.src} alt="" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dedication (flip card) ────────────────────────────────────────── */}
      <section className="ed-dedication">
        <div className="ed-shell ed-dedication-inner">
          <button
            className="ed-flip"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? c.closing.backAria : c.closing.frontAria}
          >
            <span className={`ed-flip-inner ${flipped ? "flipped" : ""}`}>
              <span className="ed-flip-face ed-flip-front">
                <Ph src={c.closing.drawingSrc} alt={c.closing.drawingAlt} />
              </span>
              <span className="ed-flip-face ed-flip-back" aria-hidden={!flipped}>
                <span className="ed-flip-msg ed-serif">{c.closing.message}</span>
                <span className="ed-flip-from">{c.closing.from}</span>
              </span>
            </span>
          </button>
          <h2 className="ed-serif">{c.closing.title}</h2>
          <p className="ed-dedication-line">{c.closing.line}</p>
          <small className="ed-dedication-credit">{c.footer.credit}</small>
        </div>
      </section>
    </div>
  );
}

export default function EditorialTemplate({
  content = editorialPlain,
  variant = "editorial",
}: {
  content?: EditorialContent;
  /** Visual skin: "editorial" (warm/olive, default) or "romantic" (blush/rose). */
  variant?: "editorial" | "romantic";
}) {
  return (
    <EditorialLightboxProvider>
      <EditorialInner content={content} variant={variant} />
    </EditorialLightboxProvider>
  );
}
