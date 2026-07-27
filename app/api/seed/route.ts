import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { content as defaultContent } from "@/lib/content";
import { parseContent, anniversaryTemplate } from "@/lib/template";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/seed?secret=... — siembra dos tenants demo para verificar el
//  multi-tenant (WP-2). Idempotente (upsert por subdominio). Protegido por
//  SEED_SECRET. Es una utilidad de dev; el alta real la hace WP-3 post-pago.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL not set" }, { status: 500 });
  }
  const client = new ConvexHttpClient(url);

  // Tenant 1 — Puri & Ivi (el default del template), paleta rosa.
  const puri = parseContent(defaultContent);

  // Tenant 2 — otra pareja, paleta lavanda. Prueba que content + theme mandan.
  const demo = parseContent({
    ...defaultContent,
    couple: "Mati & Sofi",
    site: {
      ...defaultContent.site,
      title: "Mati & Sofi",
      ogTitle: "Mati & Sofi ❤️",
    },
    hero: {
      ...defaultContent.hero,
      nameStart: "Mati",
      nameEnd: "Sofi",
      eyebrow: "14 · 02 · 2021 → ∞",
    },
    footer: { ...defaultContent.footer, credit: "hecho con amor ❤️" },
  });

  const tenants = [
    { subdomain: "puri-e-ivi", content: puri, palette: "rosa" },
    { subdomain: "demo", content: demo, palette: "lavanda" },
  ] as const;

  const ids = [];
  for (const t of tenants) {
    ids.push(
      await client.mutation(api.sites.upsertBySubdomain, {
        subdomain: t.subdomain,
        templateSlug: anniversaryTemplate.id,
        content: t.content,
        theme: { palette: t.palette },
        status: "live",
        showcase: true,
      })
    );
  }

  return NextResponse.json({ ok: true, seeded: tenants.map((t) => t.subdomain), ids });
}
