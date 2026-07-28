import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/preview?tenant=<subdominio> — utilidad de preview (WP-2).
//  Setea la cookie `amooor_tenant` y redirige a `/`, para ver un tenant puntual
//  sin dominio wildcard (en `*.vercel.app`). Sin `tenant` (o vacío) la limpia.
//  Con dominios reales (WP-4) no hace falta: el host resuelve el tenant solo.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant")?.trim().toLowerCase();
  const res = NextResponse.redirect(new URL("/", req.url));

  if (tenant) {
    res.cookies.set("amooor_tenant", tenant, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: "lax",
    });
  } else {
    res.cookies.delete("amooor_tenant");
  }
  return res;
}
