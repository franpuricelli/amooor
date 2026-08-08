// ─────────────────────────────────────────────────────────────────────────────
//  lib/marketing-context.tsx — provee el contenido del locale activo (es | en)
//  a los componentes de la landing sin prop-drilling. Landing.tsx envuelve el
//  árbol con <MarketingProvider content={...}> y cada sección usa useMarketing().
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { createContext, useContext } from "react";
import type { MarketingContent } from "./marketing";

const MarketingContext = createContext<MarketingContent | null>(null);

export function MarketingProvider({
  content,
  children,
}: {
  content: MarketingContent;
  children: React.ReactNode;
}) {
  return (
    <MarketingContext.Provider value={content}>
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing(): MarketingContent {
  const ctx = useContext(MarketingContext);
  if (!ctx) {
    throw new Error("useMarketing debe usarse dentro de <MarketingProvider>");
  }
  return ctx;
}
