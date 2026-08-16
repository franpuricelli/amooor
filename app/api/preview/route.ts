import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/preview?tenant=<subdominio> — utilidad de preview (WP-2).
//  Redirige a `/s/<subdominio>`, que sirve el tenant por path en el host único del
//  deploy (sin wildcard). Ya NO usa cookie: una cookie global secuestraba la app
//  (landing/comenzar) hasta expirar. Sin `tenant` → a la landing. Con dominios
//  reales no hace falta: el host (`<slug>.amooor.com`) resuelve el tenant solo.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant")?.trim().toLowerCase();
  const dest = tenant ? `/s/${encodeURIComponent(tenant)}` : "/";
  return NextResponse.redirect(new URL(dest, req.url));
}
