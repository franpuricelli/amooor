import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
//  middleware.ts (WP-2) — punto único de resolución de host. Normaliza el Host
//  y lo reenvía como `x-tenant-host` para que el server (site-server.ts) resuelva
//  el tenant. WP-5 agregará acá la bifurcación apex → landing de marketing.
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-host", host);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Todo excepto assets internos, la API y archivos estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
