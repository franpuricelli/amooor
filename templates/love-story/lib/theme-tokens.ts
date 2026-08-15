// theme-tokens.ts — the few colors that live in JS (SVG fills drawn inline),
// which CSS variables can't reach. Everything else themes through globals.css.
//
// EN · Chosen at build time by NEXT_PUBLIC_THEME. "romantic" (default) is the
//      rose-pink system; "editorial" is the light, elegant fine-art variant
//      (its playful pixel hearts are hidden via CSS, so these are only fallbacks).
// ES · Elegido en build por NEXT_PUBLIC_THEME. "romantic" (default) es el
//      sistema rosa; "editorial" es la variante clara y elegante (sus corazones
//      pixelados se ocultan por CSS, así que esto es sólo fallback).
const THEME = process.env.NEXT_PUBLIC_THEME ?? "romantic";
export const isEditorial = THEME === "editorial";
export const isBrutalist = THEME === "brutalist";
// Themes that drop the playful pixel-heart cursor for a calmer/bolder feel.
export const hidesHeartCursor = isEditorial || isBrutalist;

// Floating hero hearts (Hearts.tsx) — [white-ish, accent, soft accent].
export const heartFills = isEditorial
  ? ["rgba(43,40,36,0.5)", "rgba(43,40,36,0.35)", "rgba(43,40,36,0.2)"]
  : ["rgba(255,255,255,0.95)", "#ff2e8c", "#ffc7e2"];

// Hearts popping above the heads (Hero.tsx) — [accent, soft accent, white].
export const headHeartFills = isEditorial
  ? ["rgba(43,40,36,0.5)", "rgba(43,40,36,0.3)", "rgba(43,40,36,0.4)"]
  : ["#ff2e8c", "#ffc7e2", "rgba(255,255,255,0.95)"];
