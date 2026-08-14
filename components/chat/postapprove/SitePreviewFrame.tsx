"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SitePreviewFrame.tsx — chrome de navegador (3 puntitos + URL
//  <subdomain>.amooor.com) alrededor del PreviewSite vivo. Se renderiza in-tree
//  para que las ediciones locales re-rendericen al instante y SCROLLEA (pa-frame-
//  body con overflow). El `toolbar` (paleta) va en la barra; `edit` habilita la
//  edición inline del copy y el click en imágenes.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, type ReactNode } from "react";
import PreviewSite from "@/components/wizard/PreviewSite";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";
import type { EditAPI } from "@/lib/edit-context";

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

  // ── scroll-spy: la sección cuyo tope ya pasó la línea de referencia (30% del
  //    alto visible) es la "activa". rAF para no disparar en cada píxel. ─────────
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !onVisibleSection) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = body.getBoundingClientRect().top + body.clientHeight * 0.3;
      const secs = body.querySelectorAll<HTMLElement>("main section[id]");
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
    const el = body.querySelector<HTMLElement>(
      `main section[id="${CSS.escape(scrollTo.cat)}"]`
    );
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
        {toolbar && <div className="pa-frame-tools">{toolbar}</div>}
      </div>
      <div className="pa-frame-body" ref={bodyRef}>
        <PreviewSite content={content} theme={theme} edit={edit} />
      </div>
    </div>
  );
}
