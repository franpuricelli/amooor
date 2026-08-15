// ─────────────────────────────────────────────────────────────────────────────
//  fonts.ts — todas las familias tipográficas del sitio, en un módulo compartido
//  (server-eval) para que layout.tsx (tenant real) Y PreviewSite (editor client)
//  apliquen las MISMAS CSS vars de fuente.
//
//  Base (romantic): Inter / Caveat / Fraunces.
//  Plantillas (task 2-B): cada skin `[data-template]` referencia estas vars —
//    editorial → Parisienne (script) · Cormorant (serif) · Montserrat (sans)
//    brutalist → Bricolage Grotesque (display) · Space Mono (mono) · Archivo (sans)
//  Sin la var definida, `font-family: var(--font-x), ...` es inválida entera (no
//  cae al siguiente nombre), así que la plantilla no rendería su tipografía. Por
//  eso las cargamos acá y su `.variable` viaja en el className del root del render.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Inter,
  Caveat,
  Fraunces,
  Montserrat,
  Cormorant_Garamond,
  Parisienne,
  Bricolage_Grotesque,
  Space_Mono,
  Archivo,
} from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

// Fraunces — la serif editorial de los títulos + énfasis itálico del landing.
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

// ── plantilla "editorial" ────────────────────────────────────────────────────
export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});

export const parisienne = Parisienne({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-parisienne",
});

// ── plantilla "brutalist" ────────────────────────────────────────────────────
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

/** El className con TODAS las CSS vars de fuente — lo comparten <html> (layout)
 *  y el root del PreviewSite, así el skin de plantilla siempre tiene sus fuentes. */
export const fontVariables = [
  inter.variable,
  caveat.variable,
  fraunces.variable,
  montserrat.variable,
  cormorant.variable,
  parisienne.variable,
  bricolage.variable,
  spaceMono.variable,
  archivo.variable,
].join(" ");
