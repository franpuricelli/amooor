import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
//  middleware.ts (WP-2) — punto único de resolución de host. Normaliza el Host
//  y lo reenvía como `x-tenant-host` para que el server (site-server.ts) resuelva
//  el tenant. WP-5 agregará acá la bifurcación apex → landing de marketing.
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const rawHost = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];

  // Preview sin dominio propio: `?tenant=<subdominio>` fuerza un tenant sin
  // necesitar un subdominio real. Útil en `*.vercel.app` antes de tener un
  // dominio wildcard (WP-4). En producción con dominios reales, se ignora.
  const override = req.nextUrl.searchParams.get("tenant");
  const host = override ? override.toLowerCase() : rawHost;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-host", host);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Todo excepto assets internos, la API y archivos estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
