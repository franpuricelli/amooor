"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SitePreviewFrame.tsx — chrome de navegador (3 puntitos + URL
//  <subdomain>.amooor.com) alrededor del PreviewSite vivo. Se renderiza in-tree
//  para que las ediciones locales re-rendericen al instante y SCROLLEA (pa-frame-
//  body con overflow). El `toolbar` (paleta) va en la barra; `edit` habilita la
//  edición inline del copy y el click en imágenes.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
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
}: {
  content: Content;
  theme: Theme;
  subdomain: string;
  toolbar?: ReactNode;
  edit?: EditAPI;
}) {
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
      <div className="pa-frame-body">
        <PreviewSite content={content} theme={theme} edit={edit} />
      </div>
    </div>
  );
}
