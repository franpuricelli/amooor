// ─────────────────────────────────────────────────────────────────────────────
//  theme.ts — paletas del template. El 100% de los colores del sitio salen de
//  acá: `applyPalette()` inyecta estos tokens como CSS variables en <html>, y
//  `app/globals.css` sólo referencia `var(--token)`. Cambiar `theme.palette`
//  (o los valores de una paleta) re-tematiza el sitio entero sin tocar CSS.
//
//  El wizard (WP-3) deja al usuario elegir/editar una de estas 5 paletas; el
//  default es la paleta original de Puri & Ivi ("rosa").
// ─────────────────────────────────────────────────────────────────────────────

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
