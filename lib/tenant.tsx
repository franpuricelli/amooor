"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  tenant.tsx — el `content` activo por request, vía React context.
//  En multi-tenant cada host renderiza el content de SU tenant, así que los
//  componentes ya no importan el módulo `content`: llaman `useContent()`.
//  El default (Puri & Ivi) es el fallback cuando no hay tenant.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode } from "react";
import { content as defaultContent, type Content } from "@/lib/content";
import { PhotoProvider } from "@/lib/photos-context";

const ContentContext = createContext<Content>(defaultContent);

export function TenantProvider({
  content,
  placeholders = false,
  children,
}: {
  content: Content;
  /** preview del builder: las secciones sin fotos muestran marcos vacíos */
  placeholders?: boolean;
  children: ReactNode;
}) {
  // El content y las fotos del tenant viajan juntos: los componentes leen el copy
  // con useContent() y las fotos con usePhotos() (ambos por request/host).
  return (
    <ContentContext.Provider value={content}>
      <PhotoProvider media={content.media} placeholders={placeholders}>
        {children}
      </PhotoProvider>
    </ContentContext.Provider>
  );
}

/** El `content` del tenant activo (o el default fuera de un provider). */
export function useContent(): Content {
  return useContext(ContentContext);
}
