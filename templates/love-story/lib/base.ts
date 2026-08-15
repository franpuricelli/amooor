// base.ts — path prefix for static assets.
//
// EN · Empty by default (site served at the domain root). When mounted under a
//      sub-path (e.g. /template inside another app), set NEXT_PUBLIC_BASE_PATH
//      at build time and every asset URL is prefixed automatically.
// ES · Vacío por defecto (sitio en la raíz). Cuando se monta bajo un sub-path
//      (ej. /template dentro de otra app), poné NEXT_PUBLIC_BASE_PATH al
//      buildear y cada URL de asset se prefija sola.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
