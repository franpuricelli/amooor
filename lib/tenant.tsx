"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  tenant.tsx — el `content` activo por request, vía React context.
//  En multi-tenant cada host renderiza el content de SU tenant, así que los
//  componentes ya no importan el módulo `content`: llaman `useContent()`.
//  El default (Puri & Ivi) es el fallback cuando no hay tenant.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode } from "react";
import { content as defaultContent, type Content } from "@/lib/content";

const ContentContext = createContext<Content>(defaultContent);

export function TenantProvider({
  content,
  children,
}: {
  content: Content;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** El `content` del tenant activo (o el default fuera de un provider). */
export function useContent(): Content {
  return useContext(ContentContext);
}
