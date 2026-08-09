// ─────────────────────────────────────────────────────────────────────────────
//  convex-browser.ts — un ConvexHttpClient singleton para el navegador (wizard).
//  Evita envolver toda la app en <ConvexProvider>: el wizard llama queries/
//  mutations por HTTP con la URL pública (inlineada en build).
// ─────────────────────────────────────────────────────────────────────────────

import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

/** true si hay backend Convex configurado (URL pública inlineada en build). */
export function isConvexConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONVEX_URL;
}

export function convexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL no configurado");
  if (!client) client = new ConvexHttpClient(url);
  return client;
}
