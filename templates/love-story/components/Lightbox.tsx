"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLenis } from "lenis/react";
import { useI18n } from "@/lib/i18n";

/**
 * Fixed-size stage for the carousel. The (already-cached) thumb renders
 * instantly and sizes the frame; the full-res image fades in on top when it
 * finishes loading — no empty gap, no layout jump.
 */
function Stage({ photo }: { photo: LightboxPhoto }) {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(false), [photo.src]);

  return (
    <div className="lightbox-stage">
      <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.thumb ?? photo.src}
          alt=""
          aria-hidden
          className="lightbox-img"
          decoding="async"
        />
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.caption ?? ""}
          className={`lightbox-img-hi ${ready ? "ready" : ""}`}
          onLoad={() => setReady(true)}
          ref={(el) => {
            // onLoad can miss cache hits that complete before hydration
            if (el?.complete && el.naturalWidth) setReady(true);
          }}
          decoding="async"
        />
      </div>
    </div>
  );
}

/** Dimmed thumbnail strip under the carousel: preview of the whole group. */
function Filmstrip({
  photos,
  index,
  jumpTo,
}: {
  photos: LightboxPhoto[];
  index: number;
  jumpTo: (i: number) => void;
}) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();

  // keep the active thumb centered as you navigate
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  return (
    <div className="lightbox-strip" onClick={(e) => e.stopPropagation()}>
      {photos.map((p, i) => (
        <button
          key={p.src}
          ref={i === index ? currentRef : undefined}
          className={`lightbox-strip-thumb ${i === index ? "current" : ""}`}
          onClick={() => jumpTo(i)}
          aria-label={`${t.lightbox.photo} ${i + 1}`}
          aria-current={i === index}
        >
          <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  );
}

export interface LightboxPhoto {
  src: string;
  thumb?: string; // small version used by the grid view
  caption?: string;
}

interface LightboxState {
  photos: LightboxPhoto[];
  index: number;
  grid: boolean;
}

const Ctx = createContext<{
  open: (photos: LightboxPhoto[], index: number) => void;
} | null>(null);

export function useLightbox() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
  return ctx;
}

export default function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const lenis = useLenis();
  const { t } = useI18n();

  const open = useCallback((photos: LightboxPhoto[], index: number) => {
    setState({ photos, index, grid: false });
  }, []);

  const close = useCallback(() => setState(null), []);

  const step = useCallback((dir: 1 | -1) => {
    setState((s) =>
      s
        ? { ...s, index: (s.index + dir + s.photos.length) % s.photos.length }
        : s
    );
  }, []);

  const toggleGrid = useCallback(() => {
    setState((s) => (s ? { ...s, grid: !s.grid } : s));
  }, []);

  const jumpTo = useCallback((i: number) => {
    setState((s) => (s ? { ...s, index: i, grid: false } : s));
  }, []);

  // scroll lock + keyboard
  useEffect(() => {
    if (!state) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [state ? true : false, close, step, lenis]); // eslint-disable-line react-hooks/exhaustive-deps

  // preload the neighbours so arrowing through feels instant
  useEffect(() => {
    if (!state || state.photos.length < 2) return;
    [1, -1].forEach((d) => {
      const p =
        state.photos[(state.index + d + state.photos.length) % state.photos.length];
      const img = new Image();
      img.src = p.src;
    });
  }, [state?.index, state?.photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = state?.photos[state.index];

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          {state.grid ? (
            /* gallery view: every photo of the group at once */
            <div
              className="lightbox-grid"
              onClick={(e) => e.stopPropagation()}
            >
              {state.photos.map((p, i) => (
                <button
                  key={p.src}
                  className={`lightbox-grid-tile ${i === state.index ? "current" : ""}`}
                  onClick={() => jumpTo(i)}
                  aria-label={`${t.lightbox.photo} ${i + 1}`}
                >
                  <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : (
            <Stage photo={current} />
          )}

          {!state.grid && state.photos.length > 1 && (
            <Filmstrip photos={state.photos} index={state.index} jumpTo={jumpTo} />
          )}

          <div className="lightbox-caption glass" onClick={(e) => e.stopPropagation()}>
            {current.caption && <span>{current.caption}</span>}
            <span className="lightbox-count">
              {state.index + 1} / {state.photos.length}
            </span>
            {state.photos.length > 1 && (
              <button className="lightbox-grid-toggle" onClick={toggleGrid}>
                {state.grid ? t.lightbox.back : t.lightbox.seeAll}
              </button>
            )}
          </div>
          <button
            className="lightbox-btn lightbox-close glass"
            aria-label={t.lightbox.close}
            onClick={close}
          >
            ✕
          </button>
          {!state.grid && state.photos.length > 1 && (
            <>
              <button
                className="lightbox-btn lightbox-prev glass"
                aria-label={t.lightbox.prev}
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                ‹
              </button>
              <button
                className="lightbox-btn lightbox-next glass"
                aria-label={t.lightbox.next}
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}
