// ─────────────────────────────────────────────────────────────────────────────
//  app/page.tsx — el router por host (WP-2/WP-5).
//    · Host = tenant (subdominio/dominio propio) → renderiza SU sitio (SiteApp).
//    · Host = apex/desconocido (amooor.com, localhost) → la landing de marketing
//      (WP-5) con el showcase de sitios de clientes.
// ─────────────────────────────────────────────────────────────────────────────

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { resolveSite } from "@/lib/site-server";
import SiteApp from "@/components/SiteApp";
import Landing from "@/components/marketing/Landing";

export const dynamic = "force-dynamic";

interface ShowcaseCard {
  subdomain: string;
  couple: string;
  palette: string;
}

async function loadShowcase(): Promise<ShowcaseCard[]> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return [];
  try {
    const client = new ConvexHttpClient(url);
    const sites = await client.query(api.sites.listShowcase, {});
    return sites.map((s: any) => ({
      subdomain: s.subdomain,
      couple: s.content?.couple ?? s.subdomain,
      palette: s.theme?.palette ?? "rosa",
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const { found } = await resolveSite();
  if (found) return <SiteApp />;

  const showcase = await loadShowcase();
  return <Landing showcase={showcase} />;
}
