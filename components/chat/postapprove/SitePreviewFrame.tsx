"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SitePreviewFrame.tsx — chrome de navegador (3 puntitos + URL
//  <subdomain>.amooor.com) alrededor del PreviewSite vivo. Se renderiza in-tree
//  para que las ediciones locales re-rendericen al instante y SCROLLEA (pa-frame-
//  body con overflow). El `toolbar` (paleta) va en la barra; `edit` habilita la
//  edición inline del copy y el click en imágenes.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import PreviewSite from "@/components/wizard/PreviewSite";
import { fontVariables } from "@/app/fonts";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";
import type { EditAPI } from "@/lib/edit-context";

type Device = "desktop" | "mobile";

/** Ancho de viewport "escritorio" con el que se diseñó el sitio. El preview lo
 *  rinde a ESTE ancho y después lo escala para entrar en el panel: así el sitio ve
 *  un viewport de escritorio real y sale idéntico a la plantilla standalone. */
const DESIGN_WIDTH = 1280;

// Viewport REAL para el preview: un <iframe> es la única forma de darle al sitio un
// viewport propio. Sin él, `vw` y las media queries miden la VENTANA (p.ej. 1440px)
// y no el panel (~690px), así que el hero se calcula gigante y se desborda: el
// preview no se parece a la plantilla. Portaleamos el MISMO árbol de React adentro
// (así la edición inline y los contextos siguen funcionando) y clonamos las hojas de
// estilo del documento padre para que herede el CSS.
//
//  - `fit` (escritorio): el iframe mide DESIGN_WIDTH y se escala a `ancho/DESIGN_WIDTH`.
//  - sin `fit` (celular): el iframe mide su ancho natural (marco de teléfono).
function PreviewViewport({
  width,
  fit = false,
  title,
  className,
  onDoc,
  children,
}: {
  width: number;
  fit?: boolean;
  title: string;
  className?: string;
  /** el documento del iframe: es el que scrollea (scroll-spy / scrollTo) */
  onDoc?: (doc: Document | null) => void;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    const doc = node?.contentDocument;
    if (doc?.body) {
      doc.body.style.margin = "0";
      // Las CSS vars de fuente tienen que vivir en el ROOT del iframe: la base
      // (romantic) toma su tipografía de `body { font-family: var(--font-inter) }`,
      // y si la var sólo está en el div interno esa regla es inválida entera y el
      // sitio cae a Times. Con esto el skin base rinde su tipografía real.
      doc.documentElement.className = fontVariables;
      setBody(doc.body);
    }
  }, []);

  // clonamos el CSS del padre adentro del iframe (incluye @font-face de next/font)
  useEffect(() => {
    if (!body) return;
    const head = body.ownerDocument.head;
    const copied: Element[] = [];
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      const clone = node.cloneNode(true) as Element;
      head.appendChild(clone);
      copied.push(clone);
    });
    return () => copied.forEach((c) => c.remove());
  }, [body]);

  useEffect(() => {
    onDoc?.(body?.ownerDocument ?? null);
  }, [body, onDoc]);

  // medimos el panel para calcular la escala (y rehacerlo si cambia de tamaño)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !fit) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  // escala + alto compensado: tras el scale el iframe cubre exactamente el panel,
  // y el scroll queda adentro del iframe (su documento es el scroller).
  const k = fit && box.w ? box.w / width : 1;
  const style: React.CSSProperties = fit
    ? {
        width,
        height: box.h ? box.h / k : "100%",
        transform: `scale(${k})`,
        transformOrigin: "top left",
        border: 0,
        display: "block",
      }
    : {};

  const frame = (
    <iframe title={title} className={className} ref={setRef} style={style}>
      {body ? createPortal(children, body) : null}
    </iframe>
  );

  return fit ? (
    <div className="pa-fit" ref={wrapRef}>
      {frame}
    </div>
  ) : (
    frame
  );
}

function DesktopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MobileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function SitePreviewFrame({
  content,
  theme,
  subdomain,
  toolbar,
  edit,
  onVisibleSection,
  scrollTo,
}: {
  content: Content;
  theme: Theme;
  subdomain: string;
  toolbar?: ReactNode;
  edit?: EditAPI;
  /** al scrollear el preview, avisa qué sección (id = category) está a la vista,
   *  para que Multimedia siga al scroll. */
  onVisibleSection?: (id: string) => void;
  /** pedido de scroll DESDE Multimedia: llevá el preview a esta sección. El nonce
   *  fuerza re-scroll aunque se elija la misma sección dos veces. */
  scrollTo?: { cat: string; nonce: number } | null;
}) {
  // el documento del <iframe> del preview: es el que scrollea, así que scroll-spy y
  // scrollTo trabajan sobre él (antes era el div in-tree `.pa-frame-body`).
  const [doc, setDoc] = useState<Document | null>(null);
  // vista escritorio ↔ celular (el toggle de la barra del navegador del preview)
  const [device, setDevice] = useState<Device>("desktop");
  // cartel de "esto se edita acá" — se va al primer toque sobre el sitio o con la ✕
  const [hint, setHint] = useState(true);

  // ── scroll-spy: la sección cuyo tope ya pasó la línea de referencia (30% del
  //    alto visible) es la "activa". rAF para no disparar en cada píxel. ─────────
  useEffect(() => {
    if (!doc || !onVisibleSection) return;
    const win = doc.defaultView;
    if (!win) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = win.innerHeight * 0.3;
      // incluye el cierre (footer#closing), que no es un <section> del layout.
      const secs = doc.querySelectorAll<HTMLElement>("main section[id], footer[id]");
      let current: string | null = null;
      for (const el of secs) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      if (current) onVisibleSection(current);
    };
    const onScroll = () => {
      if (!raf) raf = win.requestAnimationFrame(compute);
    };
    win.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      win.removeEventListener("scroll", onScroll);
      if (raf) win.cancelAnimationFrame(raf);
    };
  }, [doc, onVisibleSection]);

  // Multimedia → preview: al elegir una sección en el panel, scrolleá el preview
  // hasta ella. Depende del nonce para reaccionar aunque sea la misma sección.
  useEffect(() => {
    if (!doc || !scrollTo) return;
    const win = doc.defaultView;
    const scroller = doc.scrollingElement;
    if (!win || !scroller) return;
    // el cierre vive en footer#closing (fuera de <main>): matcheamos por id suelto.
    const el = doc.querySelector<HTMLElement>(`[id="${CSS.escape(scrollTo.cat)}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scroller.scrollTop;
    win.scrollTo({ top, behavior: "smooth" });
  }, [doc, scrollTo]);

  return (
    <div className="pa-frame">
      <div className="pa-frame-bar">
        <span className="pa-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="pa-urlbar">{subdomain}.amooor.com</span>
        <div className="pa-frame-devices" role="group" aria-label="Tamaño de la vista">
          <button
            type="button"
            className={`pa-frame-device ${device === "desktop" ? "on" : ""}`}
            aria-pressed={device === "desktop"}
            aria-label="Vista escritorio"
            title="Escritorio"
            onClick={() => setDevice("desktop")}
          >
            <DesktopIcon />
          </button>
          <button
            type="button"
            className={`pa-frame-device ${device === "mobile" ? "on" : ""}`}
            aria-pressed={device === "mobile"}
            aria-label="Vista celular"
            title="Celular"
            onClick={() => setDevice("mobile")}
          >
            <MobileIcon />
          </button>
        </div>
        {toolbar && <div className="pa-frame-tools">{toolbar}</div>}
      </div>
      {/* La superficie es EDITABLE y no se nota: lo decimos una vez, arriba del
          sitio, hasta que la persona edite algo (o lo cierre). */}
      {edit && hint && (
        <div className="pa-edit-hint">
          <span>
            Tocá cualquier <b>texto</b> del sitio para editarlo, o una <b>foto</b> para
            cambiarla.
          </span>
          <button type="button" aria-label="Entendido" onClick={() => setHint(false)}>
            ✕
          </button>
        </div>
      )}
      {/* Los eventos de un portal suben por el árbol de REACT, no por el DOM: un
          click adentro del <iframe> llega igual hasta acá, así que un solo handler
          en captura baja el cartel sin tener que envolver la API de edición. */}
      <div
        className={`pa-frame-body ${device === "mobile" ? "is-mobile" : ""}`}
        onClickCapture={hint ? () => setHint(false) : undefined}
      >
        {device === "mobile" ? (
          // la vista celular también edita: es el mismo árbol de React portaleado
          // dentro del iframe, así que el copy y las fotos responden igual.
          <PreviewViewport
            width={390}
            title="Vista celular"
            className="pa-mobile-iframe"
            onDoc={setDoc}
          >
            <PreviewSite content={content} theme={theme} edit={edit} framed />
          </PreviewViewport>
        ) : (
          // escritorio: se rinde a DESIGN_WIDTH y se escala al panel, así el sitio ve
          // un viewport de escritorio real y sale igual que la plantilla standalone.
          <PreviewViewport
            width={DESIGN_WIDTH}
            fit
            title="Vista escritorio"
            onDoc={setDoc}
          >
            <PreviewSite content={content} theme={theme} edit={edit} framed />
          </PreviewViewport>
        )}
      </div>
    </div>
  );
}
