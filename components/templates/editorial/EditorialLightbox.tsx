"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  EditorialLightbox — a self-contained port of the tenant site's Lightbox
//  (components/Lightbox.tsx) for the standalone "Historia" template. Same logic
//  (carousel + filmstrip + grid toggle + keyboard nav + neighbour preload) but
//  with no tenant contexts (useContent/useLenis) and `.edlb-` scoped styles, so
//  it works inside /template/<slug>. Wrap the template subtree in
//  <EditorialLightboxProvider>; call open(items, index) from anywhere below.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface LBPhoto {
  src: string;
  thumb?: string;
  caption?: string;
}
interface LBState {
  photos: LBPhoto[];
  index: number;
  grid: boolean;
}

/** Thumbnail strip under the carousel (ported from the tenant Lightbox): keeps
 *  the active thumb centered as you navigate. */
function Filmstrip({ photos, index, jumpTo }: { photos: LBPhoto[]; index: number; jumpTo: (i: number) => void }) {
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);
  return (
    <div className="edlb-strip" onClick={(e) => e.stopPropagation()}>
      {photos.map((p, i) => (
        <button
          key={`${p.src}-${i}`}
          ref={i === index ? currentRef : undefined}
          className={`edlb-strip-thumb ${i === index ? "current" : ""}`}
          onClick={() => jumpTo(i)}
          aria-current={i === index}
          aria-label={`Foto ${i + 1}`}
        >
          <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  );
}

const Ctx = createContext<{ open: (photos: LBPhoto[], index: number) => void } | null>(null);

export function useEditorialLightbox() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEditorialLightbox must be used inside EditorialLightboxProvider");
  return ctx;
}

export default function EditorialLightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LBState | null>(null);

  const open = useCallback((photos: LBPhoto[], index: number) => {
    setState({ photos, index, grid: false });
  }, []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback((dir: 1 | -1) => {
    setState((s) => (s ? { ...s, index: (s.index + dir + s.photos.length) % s.photos.length } : s));
  }, []);
  const toggleGrid = useCallback(() => setState((s) => (s ? { ...s, grid: !s.grid } : s)), []);
  const jumpTo = useCallback((i: number) => setState((s) => (s ? { ...s, index: i, grid: false } : s)), []);

  // body scroll lock + keyboard
  useEffect(() => {
    if (!state) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state ? true : false, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // preload neighbours
  useEffect(() => {
    if (!state || state.photos.length < 2) return;
    [1, -1].forEach((d) => {
      const p = state.photos[(state.index + d + state.photos.length) % state.photos.length];
      const img = new Image();
      img.src = p.src;
    });
  }, [state?.index, state?.photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = state?.photos[state.index];

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && current && (
        <div className="edlb" role="dialog" aria-modal="true" onClick={close}>
          {state.grid ? (
            <div className="edlb-grid" onClick={(e) => e.stopPropagation()}>
              {state.photos.map((p, i) => (
                <button
                  key={`${p.src}-${i}`}
                  className={`edlb-grid-tile ${i === state.index ? "current" : ""}`}
                  onClick={() => jumpTo(i)}
                  aria-label={`Foto ${i + 1}`}
                >
                  <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : (
            <div className="edlb-viewer" onClick={(e) => e.stopPropagation()}>
              <div className="edlb-stage">
                <img key={current.src} src={current.src} alt={current.caption ?? ""} className="edlb-img" decoding="async" />
              </div>
              {state.photos.length > 1 && (
                <Filmstrip photos={state.photos} index={state.index} jumpTo={jumpTo} />
              )}
            </div>
          )}

          <div className="edlb-caption" onClick={(e) => e.stopPropagation()}>
            {current.caption && <span>{current.caption}</span>}
            <span className="edlb-count">{state.index + 1} / {state.photos.length}</span>
            {state.photos.length > 1 && (
              <button className="edlb-grid-toggle" onClick={toggleGrid}>
                {state.grid ? "Volver" : "Ver todas"}
              </button>
            )}
          </div>

          <button className="edlb-btn edlb-close" aria-label="Cerrar" onClick={close}>✕</button>

          {!state.grid && state.photos.length > 1 && (
            <>
              <button
                className="edlb-btn edlb-prev"
                aria-label="Anterior"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
              >‹</button>
              <button
                className="edlb-btn edlb-next"
                aria-label="Siguiente"
                onClick={(e) => { e.stopPropagation(); step(1); }}
              >›</button>
            </>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}
