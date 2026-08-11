// base.ts — path prefix for static assets.
//
// EN · Empty by default (site served at the domain root). When the site is
//      mounted under a sub-path (e.g. as /template inside another app), set
//      NEXT_PUBLIC_BASE_PATH=/template at build time and every asset URL
//      (photos, drawing, song, artist avatars) is prefixed automatically.
// ES · Vacío por defecto (sitio servido en la raíz). Cuando se monta bajo un
//      sub-path (ej. como /template dentro de otra app), poné
//      NEXT_PUBLIC_BASE_PATH=/template al buildear y cada URL de asset (fotos,
//      dibujo, canción, avatares) se prefija sola.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
