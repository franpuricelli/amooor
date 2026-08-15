// ─────────────────────────────────────────────────────────────────────────────
//  app/page.tsx — el router por host (WP-2/WP-5).
//    · Host = tenant (subdominio/dominio propio) → renderiza SU sitio (SiteApp).
//    · Host = apex/desconocido (amooor.com, localhost) → la landing de marketing
//      (WP-5) con el showcase de sitios de clientes.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { resolveSite } from "@/lib/site-server";
import SiteApp from "@/components/SiteApp";
import Landing from "@/components/marketing/Landing";
import marketing from "@/lib/marketing";

export const dynamic = "force-dynamic";

// Metadata propia de la landing de marketing (apex/host desconocido). Cuando el
// host resuelve a un tenant devolvemos {} y manda el generateMetadata del layout.
export async function generateMetadata(): Promise<Metadata> {
  const { found } = await resolveSite();
  if (found) return {};

  const title = "amooor: Tu amooor, hecho sitio";
  const description = marketing.hero.subtitle;
  const image = "/demo/poster.jpg";

  return {
    title,
    description,
    alternates: { canonical: "/", languages: { es: "/", en: "/en" } },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "amooor",
      locale: "es_AR",
      images: [{ url: image, width: 1663, height: 900, alt: "amooor" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Home() {
  const { found, theme } = await resolveSite();
  if (found) return <SiteApp template={theme.template} />;

  return <Landing content={marketing} />;
}
