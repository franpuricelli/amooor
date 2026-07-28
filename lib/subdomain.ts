// ─────────────────────────────────────────────────────────────────────────────
//  subdomain.ts — genera un subdominio válido a partir del nombre de la pareja.
//  Reservados/colisiones se resuelven en el server (checkSubdomain + sufijo).
// ─────────────────────────────────────────────────────────────────────────────

/** "Puri & Ivi" → "puri-e-ivi". Sólo [a-z0-9-], sin acentos, 2-40 chars. */
export function slugifyCouple(couple: string): string {
  const base = (couple || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos (marcas diacríticas)
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/\+/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "sitio";
}

/** Subdominios que no se pueden usar (chocan con la plataforma). */
export const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "amooor",
  "mail",
  "blog",
  "dashboard",
  "comenzar",
  "checkout",
  "preview",
]);

export const isReserved = (sub: string): boolean => RESERVED.has(sub);
