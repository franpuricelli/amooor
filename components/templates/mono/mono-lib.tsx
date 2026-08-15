"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  mono-lib — small shared pieces for the MONO template: a scroll-reveal
//  wrapper, a minimal lightbox, and a spec-sheet section header. Kept separate
//  so the section files stay about layout, not plumbing.
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

// ── Reveal — fades sections in as they enter the viewport ────────────────────
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      // threshold 0 so even very tall blocks (the 468-tile gallery) reveal as
      // soon as their top edge crosses in — a fractional threshold can never be
      // met by an element taller than the viewport.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={ref}
      className={`mn-reveal ${seen ? "is-in" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Lightbox — a bare full-screen viewer shared by the gallery ───────────────
type LBItem = { src: string; alt?: string };
type LBApi = { open: (items: LBItem[], index: number) => void };
const LightboxCtx = createContext<LBApi>({ open: () => {} });
export const useMonoLightbox = () => useContext(LightboxCtx);

export function MonoLightbox({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LBItem[] | null>(null);
  const [i, setI] = useState(0);

  const open = useCallback((list: LBItem[], index: number) => {
    setItems(list);
    setI(index);
  }, []);
  const close = useCallback(() => setItems(null), []);

  useEffect(() => {
    if (!items) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % items.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [items, close]);

  const cur = items?.[i];

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      {cur && (
        <div className="mn-lb" role="dialog" aria-modal="true" onClick={close}>
          <button className="mn-lb-close" onClick={close}>
            Cerrar ✕
          </button>
          <button
            className="mn-lb-nav mn-lb-prev"
            aria-label="Anterior"
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v - 1 + items!.length) % items!.length);
            }}
          >
            ‹
          </button>
          <img src={cur.src} alt={cur.alt ?? ""} onClick={(e) => e.stopPropagation()} />
          <button
            className="mn-lb-nav mn-lb-next"
            aria-label="Siguiente"
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v + 1) % items!.length);
            }}
          >
            ›
          </button>
        </div>
      )}
    </LightboxCtx.Provider>
  );
}

// ── Section header — the mono "spec sheet" heading (index · label · note) ────
export function MonoHead({
  idx,
  title,
  note,
}: {
  idx: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="mn-head">
      <span className="mn-head-idx">{idx}</span>
      <h2 className="mn-head-title">{title}</h2>
      {note && <span className="mn-head-note">{note}</span>}
    </div>
  );
}
