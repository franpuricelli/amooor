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
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";
import type { EditAPI } from "@/lib/edit-context";

type Device = "desktop" | "mobile";

// Vista celular REAL: un <iframe> le da al sitio un viewport angosto de verdad, así
// se disparan sus propias media queries (≤700/860/900px) — angostar el ancho a mano
// no alcanza (el hero usa vw y queda gigante). Portaleamos el MISMO árbol de React
// adentro y clonamos las hojas de estilo del documento padre para que herede el CSS.
function MobileFrame({ children }: { children: ReactNode }) {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    const doc = node?.contentDocument;
    if (doc?.body) {
      doc.body.style.margin = "0";
      doc.documentElement.style.height = "100%";
      setBody(doc.body);
    }
  }, []);
  useEffect(() => {
    if (!body) return;
    const head = body.ownerDocument.head;
    const copied: Element[] = [];
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => {
        const clone = node.cloneNode(true) as Element;
        head.appendChild(clone);
        copied.push(clone);
      });
    return () => copied.forEach((c) => c.remove());
  }, [body]);
  return (
    <iframe title="Vista celular" className="pa-mobile-iframe" ref={setRef}>
      {body ? createPortal(children, body) : null}
    </iframe>
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
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // vista escritorio ↔ celular (el toggle de la barra del navegador del preview)
  const [device, setDevice] = useState<Device>("desktop");

  // ── scroll-spy: la sección cuyo tope ya pasó la línea de referencia (30% del
  //    alto visible) es la "activa". rAF para no disparar en cada píxel. ─────────
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !onVisibleSection) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = body.getBoundingClientRect().top + body.clientHeight * 0.3;
      // incluye el cierre (footer#closing), que no es un <section> del layout.
      const secs = body.querySelectorAll<HTMLElement>("main section[id], footer[id]");
      let current: string | null = null;
      for (const el of secs) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      if (current) onVisibleSection(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    body.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      body.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onVisibleSection]);

  // Multimedia → preview: al elegir una sección en el panel, scrolleá el preview
  // hasta ella. Depende del nonce para reaccionar aunque sea la misma sección.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !scrollTo) return;
    // el cierre vive en footer#closing (fuera de <main>): matcheamos por id suelto.
    const el = body.querySelector<HTMLElement>(`[id="${CSS.escape(scrollTo.cat)}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
    body.scrollTo({ top, behavior: "smooth" });
  }, [scrollTo]);

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
      <div className={`pa-frame-body ${device === "mobile" ? "is-mobile" : ""}`} ref={bodyRef}>
        {device === "mobile" ? (
          // en mobile el preview es view-only (se edita en escritorio)
          <MobileFrame>
            <PreviewSite content={content} theme={theme} framed />
          </MobileFrame>
        ) : (
          <PreviewSite content={content} theme={theme} edit={edit} framed />
        )}
      </div>
    </div>
  );
}
