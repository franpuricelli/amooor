// ─────────────────────────────────────────────────────────────────────────────
//  palette-gen.ts — genera una paleta armónica a partir de UN color principal.
//  Lo usa el selector de paleta del PlanCard: el usuario elige un color base y le
//  recomendamos canvas + acentos coherentes (mismo espíritu que las 5 paletas de
//  theme.ts, pero derivadas en vivo). Client-safe, sin deps.
// ─────────────────────────────────────────────────────────────────────────────

import type { Palette } from "./theme";

export interface Swatch {
  /** id estable (paleta built-in o "custom-…") */
  id: string;
  label: string;
  /** fondo principal (claro) */
  canvas: string;
  /** acento saturado (marca) */
  accent: string;
  /** colores de muestra para el popover de hover (chips) */
  chips: string[];
  /** paleta COMPLETA (13 tokens) — lo que el sitio tematiza de verdad. Sin esto,
   *  una paleta custom no se aplicaba (resolvePalette caía a la default). */
  palette: Palette;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function hexToHsl(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        hue = ((g - b) / d) % 6;
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      default:
        hue = (r - g) / d + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  s = clamp(s) / 100;
  l = clamp(l) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const col = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * col)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Normaliza a #rrrggbb; devuelve null si no es un hex válido. */
export function normalizeHex(input: string): string | null {
  const m = input.trim().replace(/^#?/, "");
  if (!/^[0-9a-fA-F]{3}$/.test(m) && !/^[0-9a-fA-F]{6}$/.test(m)) return null;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return `#${full.toLowerCase()}`;
}

/**
 * Deriva una paleta COMPLETA (13 tokens del template) a partir de un color
 * principal, con el mismo espíritu que las 5 paletas built-in de theme.ts. Al
 * cambiar el color base cambian TODOS los tonos (respeta la saturación del base:
 * un gris queda gris, un color vivo queda vivo).
 */
export function paletteFromHex(baseHex: string): Palette {
  const [h, s] = hexToHsl(baseHex);
  const sat = clamp(s, 8, 95);
  const H = (ss: number, ll: number) => hslToHex(h, clamp(ss, 0, 100), clamp(ll, 0, 100));
  return {
    canvas: H(sat * 0.5, 82),
    canvasSoft: H(sat * 0.42, 88),
    canvasDeep: H(sat * 0.65, 68),
    pink: H(sat * 0.82, 57),
    accent: H(sat * 0.9, 74),
    accentStrong: H(sat, 62),
    accentMid: H(sat, 68),
    ink: H(clamp(sat, 22, 85), 9),
    dark: H(clamp(sat, 22, 85), 4),
    gradA: H(sat * 0.5, 84),
    gradB: H(sat * 0.55, 82),
    heart1: H(clamp(sat, 55, 100), 58),
    heart2: H(sat * 0.7, 85),
  };
}

/**
 * Recomienda una paleta coherente a partir de un color principal.
 * canvas = tinte claro del color; accent = el color saturado; y un set de chips
 * (tintes/sombras) para el preview de hover. Incluye la paleta completa que el
 * sitio tematiza.
 */
export function recommendPalette(baseHex: string, id: string, label: string): Swatch {
  const palette = paletteFromHex(baseHex);
  return {
    id,
    label,
    canvas: palette.canvas,
    accent: palette.accentStrong,
    chips: [palette.canvas, palette.canvasDeep, palette.pink, palette.accentStrong, palette.accent],
    palette,
  };
}
