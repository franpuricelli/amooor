import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
//  GET /s/<slug> — link público y compartible de un sitio publicado.
//  Setea la cookie `amooor_tenant` (= <slug>) y redirige a `/`, para servir el
//  tenant en el host único del deploy (en `*.vercel.app` no hay wildcard de
//  subdominios). `currentHost()` (lib/site-server) lee esa cookie, así layout +
//  page resuelven el mismo tenant y el sitio renderiza con su theme.
//  Si el sitio está pausado / no existe, `getByHost` devuelve null → landing.
//  Con un dominio propio + wildcard, el subdominio real resuelve solo y este
//  link sigue andando igual.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tenant = slug.trim().toLowerCase();
  const res = NextResponse.redirect(new URL("/", req.url));

  if (tenant) {
    res.cookies.set("amooor_tenant", tenant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      sameSite: "lax",
    });
  } else {
    res.cookies.delete("amooor_tenant");
  }
  return res;
}
