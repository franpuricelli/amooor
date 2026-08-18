// ─────────────────────────────────────────────────────────────────────────────
//  theme.ts — paletas del template. El 100% de los colores del sitio salen de
//  acá: `applyPalette()` inyecta estos tokens como CSS variables en <html>, y
//  `app/globals.css` sólo referencia `var(--token)`. Cambiar `theme.palette`
//  (o los valores de una paleta) re-tematiza el sitio entero sin tocar CSS.
//
//  El wizard (WP-3) deja al usuario elegir/editar una de estas 5 paletas; el
//  default es la paleta original de Puri & Ivi ("rosa").
// ─────────────────────────────────────────────────────────────────────────────

import { hexToHsl, hslToHex } from "./palette-gen";

/** Los ~13 tokens de color que definen una paleta. */
export interface Palette {
  canvas: string; // fondo principal
  canvasSoft: string; // tinte claro del fondo
  canvasDeep: string; // tinte oscuro del fondo (base del gradiente)
  pink: string; // color de marca sobre el canvas
  accent: string; // realce brillante (links, kickers)
  accentStrong: string; // realce más saturado
  accentMid: string; // realce intermedio
  ink: string; // texto sobre el canvas
  dark: string; // paneles/secciones oscuras
  gradA: string; // stop de gradiente decorativo
  gradB: string; // stop de gradiente decorativo
  heart1: string; // corazones decorativos (hero)
  heart2: string;
}

export type PaletteId = "rosa" | "durazno" | "lavanda" | "menta" | "cielo";

export const palettes: Record<PaletteId, Palette> = {
  // default — la de Puri & Ivi.
  rosa: {
    canvas: "#e0abc4",
    canvasSoft: "#efcfdd",
    canvasDeep: "#d58eab",
    pink: "#c15e88",
    accent: "#ff9dc9",
    accentStrong: "#ff5c99",
    accentMid: "#ff7ab5",
    ink: "#1c0512",
    dark: "#0e0309",
    gradA: "#eac4d5",
    gradB: "#e4bad0",
    heart1: "#ff2e8c",
    heart2: "#ffc7e2",
  },
  durazno: {
    canvas: "#f0b79a",
    canvasSoft: "#fbdcc7",
    canvasDeep: "#e79a74",
    pink: "#c1785e",
    accent: "#ffb38c",
    accentStrong: "#ff8a5c",
    accentMid: "#ff9d70",
    ink: "#2b1205",
    dark: "#120a03",
    gradA: "#f2c9ad",
    gradB: "#f0c2a5",
    heart1: "#ff7a3c",
    heart2: "#ffd2b8",
  },
  lavanda: {
    canvas: "#c3abe0",
    canvasSoft: "#ddcfef",
    canvasDeep: "#a98ed5",
    pink: "#8560c1",
    accent: "#c79dff",
    accentStrong: "#a35cff",
    accentMid: "#b47aff",
    ink: "#150524",
    dark: "#0a0312",
    gradA: "#d0c4ea",
    gradB: "#cdbae4",
    heart1: "#a34cff",
    heart2: "#d6c7ff",
  },
  menta: {
    canvas: "#9ad9c0",
    canvasSoft: "#c7efdf",
    canvasDeep: "#74d5ab",
    pink: "#3f9e78",
    accent: "#5fd6a8",
    accentStrong: "#22b183",
    accentMid: "#43c495",
    ink: "#05241a",
    dark: "#03120c",
    gradA: "#adead6",
    gradB: "#a5e4cf",
    heart1: "#12c88a",
    heart2: "#b8ffe0",
  },
  cielo: {
    canvas: "#9ab7e0",
    canvasSoft: "#c7d9ef",
    canvasDeep: "#74a0d5",
    pink: "#5e82c1",
    accent: "#8cb3ff",
    accentStrong: "#5c8aff",
    accentMid: "#709dff",
    ink: "#05122b",
    dark: "#030a18",
    gradA: "#adc9f2",
    gradB: "#a5c2f0",
    heart1: "#3c7aff",
    heart2: "#b8d2ff",
  },
};

export const defaultPaletteId: PaletteId = "rosa";

/** Nombres legibles para el wizard. */
export const paletteLabels: Record<PaletteId, string> = {
  rosa: "Rosa",
  durazno: "Durazno",
  lavanda: "Lavanda",
  menta: "Menta",
  cielo: "Cielo",
};

/** rgba() de un hex (#rrggbb) con alfa — para los tokens derivados de la paleta. */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** token camelCase → nombre de CSS variable. */
const CSS_VAR: Record<keyof Palette, string> = {
  canvas: "--canvas",
  canvasSoft: "--canvas-soft",
  canvasDeep: "--canvas-deep",
  pink: "--pink",
  accent: "--accent",
  accentStrong: "--accent-strong",
  accentMid: "--accent-mid",
  ink: "--ink",
  dark: "--dark",
  gradA: "--grad-a",
  gradB: "--grad-b",
  heart1: "--heart-1",
  heart2: "--heart-2",
};

/** Convierte una paleta en el objeto de CSS variables para `style={...}` en <html>. */
export function paletteVars(p: Palette): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(CSS_VAR) as (keyof Palette)[]).forEach((k) => {
    out[CSS_VAR[k]] = p[k];
  });
  // Derivados de `ink` (los defaults de :root son los de la paleta rosa: sin
  // esto, el texto secundario seguía tirando a rosa en cualquier otra paleta).
  out["--ink-70"] = rgba(p.ink, 0.7);
  out["--ink-50"] = rgba(p.ink, 0.5);
  return out;
}

/** Resuelve un theme (id de paleta + overrides opcionales) a una Palette concreta.
 *  Si la paleta no existe (dato de un tenant), cae a la default en vez de romper. */
export function resolvePalette(theme: {
  palette: PaletteId | string;
  overrides?: Partial<Palette>;
}): Palette {
  const base = palettes[theme.palette as PaletteId] ?? palettes[defaultPaletteId];
  return { ...base, ...(theme.overrides ?? {}) };
}

// ── Tokens de los SKINS (plantillas) ─────────────────────────────────────────
//  Cada plantilla (`[data-template]`) tiene su tratamiento de superficies: crema
//  plano y filetes en "editorial", papel + bloques duros en "brutalist". Antes esos
//  colores estaban HARDCODEADOS en app/globals.css con `!important` (para ganarle a
//  las vars inline de la paleta), así que elegir una paleta no cambiaba nada en esas
//  plantillas. Ahora se DERIVAN de la paleta elegida: la plantilla aporta el
//  tratamiento (claro/plano, papel/duro) y la paleta aporta el color.
const clampN = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Los tokens de color que necesita el skin `template`, derivados de `p`.
 * Devuelve {} para la base ("romantic") y para plantillas sin skin de color.
 */
export function templateVars(p: Palette, template?: string): Record<string, string> {
  if (template !== "editorial" && template !== "brutalist") return {};
  const [h, s] = hexToHsl(p.accentStrong);
  // un acento ilegible (dato viejo de un tenant) no puede romper el sitio: sin
  // tono usable dejamos que el skin use sus colores de fallback (globals.css).
  if (!Number.isFinite(h) || !Number.isFinite(s)) return {};
  const sat = clampN(s, 8, 95);
  /** mismo tono que la paleta, con la saturación bajada al `k` del original. */
  const tone = (l: number, k: number) => hslToHex(h, clampN(sat * k, 3, 60), l);

  if (template === "editorial") {
    // fine-art claro: lienzo crema tintado por la paleta, tinta casi negra del
    // mismo tono, y el acento del usuario intacto (es "su" color en el sitio).
    const canvas = tone(95, 0.3);
    const ink = tone(12, 0.3);
    const dark = tone(89, 0.34);
    return {
      "--canvas": canvas,
      "--canvas-soft": tone(92, 0.32),
      "--canvas-deep": tone(89, 0.34),
      "--pink": p.accentStrong,
      "--ink": ink,
      "--ink-70": rgba(ink, 0.66),
      "--ink-50": rgba(ink, 0.46),
      // en esta plantilla no hay bloques oscuros: "blanco sobre oscuro" pasa a
      // ser "tinta sobre claro" (la base usa --white para el texto ahí).
      "--white": ink,
      "--white-70": rgba(ink, 0.66),
      "--white-45": rgba(ink, 0.46),
      "--dark": dark,
      "--glass": tone(97, 0.22),
      "--glass-strong": tone(94, 0.26),
      "--glass-border": rgba(ink, 0.16),
      "--glass-border-soft": rgba(ink, 0.1),
      // gradiente del lienzo + escalones del deck de países
      "--skin-wash-a": tone(98, 0.18),
      "--skin-wash-b": tone(91, 0.36),
      // los stops decorativos de la base también tienen que ser del skin (si no,
      // el sitio publicado pinta el wash rosado de la paleta sobre el crema).
      "--grad-a": tone(97, 0.22),
      "--grad-b": tone(93, 0.28),
      "--skin-panel-a": tone(91, 0.32),
      "--skin-panel-b": tone(88, 0.36),
      "--skin-panel-c": tone(94, 0.26),
      "--skin-tint-1": rgba(ink, 0.04),
      "--skin-tint-2": rgba(ink, 0.07),
    };
  }

  // brutalist — papel cálido, tinta casi negra, el acento de la paleta como
  // "pop" (antes azul eléctrico fijo) y un realce claro del mismo tono (antes
  // amarillo fijo). Los bordes/sombras duros los sigue poniendo el CSS.
  const ink = tone(8, 0.25);
  const [, , accentL] = hexToHsl(p.accentStrong);
  return {
    "--canvas": tone(93, 0.3),
    "--canvas-soft": tone(90, 0.32),
    "--canvas-deep": tone(87, 0.34),
    "--pink": p.accentStrong,
    "--ink": ink,
    "--ink-70": rgba(ink, 0.72),
    "--ink-50": rgba(ink, 0.5),
    "--white": "#ffffff",
    "--white-70": "rgba(255, 255, 255, 0.74)",
    "--white-45": "rgba(255, 255, 255, 0.5)",
    "--dark": ink,
    "--glass": tone(99, 0.08),
    "--glass-strong": tone(99, 0.08),
    "--glass-border": ink,
    "--glass-border-soft": ink,
    "--grad-a": tone(95, 0.28),
    "--grad-b": tone(91, 0.3),
    "--pop": p.accentStrong,
    // texto sobre el bloque de acento: blanco si el acento es oscuro, tinta si no.
    "--on-pop": accentL > 68 ? ink : "#ffffff",
    "--pop-soft": hslToHex(h, clampN(sat, 55, 95), 78),
    "--skin-panel-a": hslToHex(h, clampN(sat * 0.7, 20, 90), 85),
    "--skin-panel-b": hslToHex(h, clampN(sat, 45, 95), 80),
    "--skin-grid": rgba(ink, 0.05),
  };
}

/** Todas las CSS vars de un theme: paleta + tokens del skin elegido. */
export function themeVars(theme: {
  palette: PaletteId | string;
  template?: string;
  overrides?: Partial<Palette>;
}): Record<string, string> {
  const p = resolvePalette(theme);
  return { ...paletteVars(p), ...templateVars(p, theme.template) };
}
