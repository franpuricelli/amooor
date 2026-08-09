import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
//  rate-limit.ts — un token-bucket en memoria (freno de COSTO, no seguridad).
//  Clave = `${token}:${ip}` u similar. Se resetea en cold start del server, lo
//  cual es aceptable para v0: es una protección barata contra loops/abuso, no un
//  control de acceso. Es independiente del cap de iteraciones del agente.
// ─────────────────────────────────────────────────────────────────────────────

const buckets = new Map<string, { count: number; resetAt: number }>();

/** true = permitido; false = excedido. `limit` requests por `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** IP del cliente detrás del proxy de Vercel (o "local" en dev). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "local";
}
