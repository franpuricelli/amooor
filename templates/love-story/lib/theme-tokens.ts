// theme-tokens.ts — the few colors that live in JS (SVG fills drawn inline),
// which CSS variables can't reach. Everything else themes through globals.css.
//
// EN · Chosen at build time by NEXT_PUBLIC_THEME. "romantic" (default) is the
//      rose-pink system; "noir" is dark + warm gold.
// ES · Elegido en build por NEXT_PUBLIC_THEME. "romantic" (default) es el
//      sistema rosa; "noir" es oscuro + dorado cálido.
export const isNoir = (process.env.NEXT_PUBLIC_THEME ?? "romantic") === "noir";

// Floating hero hearts (Hearts.tsx) — [white-ish, accent, soft accent].
export const heartFills = isNoir
  ? ["rgba(255,255,255,0.9)", "#d9b25f", "rgba(201,162,75,0.55)"]
  : ["rgba(255,255,255,0.95)", "#ff2e8c", "#ffc7e2"];

// Hearts popping above the heads (Hero.tsx) — [accent, soft accent, white].
export const headHeartFills = isNoir
  ? ["#d9b25f", "rgba(201,162,75,0.6)", "rgba(255,255,255,0.95)"]
  : ["#ff2e8c", "#ffc7e2", "rgba(255,255,255,0.95)"];
