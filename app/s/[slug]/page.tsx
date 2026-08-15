// ─────────────────────────────────────────────────────────────────────────────
//  /s/<slug> — link público y compartible de un sitio publicado.
//  Sirve el sitio del tenant EN ESTA RUTA, sobre el host único del deploy (sin
//  wildcard de subdominios). `currentHost()` (lib/site-server) lee el slug del
//  path — inyectado como `x-amooor-path` por middleware.ts — así `resolveSite()`
//  devuelve ESTE tenant tanto para el layout (tema/metadata) como para el render.
//  No usa cookie: no "secuestra" la landing ni /comenzar. Pausado/inexistente →
//  la landing (igual que el apex). Con un dominio propio + wildcard, el subdominio
//  real resuelve solo (app/page.tsx) y este link sigue andando igual.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { resolveSite } from "@/lib/site-server";
import SiteApp from "@/components/SiteApp";
import Landing from "@/components/marketing/Landing";
import marketing from "@/lib/marketing";

export const dynamic = "force-dynamic";

// Tenant encontrado → {} y manda el generateMetadata del layout (title/OG del
// tenant). Pausado/inexistente → mostramos la landing, así que su metadata.
export async function generateMetadata(): Promise<Metadata> {
  const { found } = await resolveSite();
  if (found) return {};
  return {
    title: "amooor: Tu amooor, hecho sitio",
    description: marketing.hero.subtitle,
  };
}

export default async function TenantByPath() {
  const { found } = await resolveSite();
  if (found) return <SiteApp />;
  return <Landing content={marketing} />;
}
