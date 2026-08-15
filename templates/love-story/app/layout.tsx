import type { Metadata, Viewport } from "next";
import {
  Inter,
  Caveat,
  Parisienne,
  Cormorant_Garamond,
  Montserrat,
  Bricolage_Grotesque,
  Space_Mono,
  Archivo,
} from "next/font/google";
import { config } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

// Noir type system — an editorial trio: a flowing script for the couple name,
// a high-contrast serif for headings, a light wide-tracked sans for labels/body.
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-parisienne",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-montserrat",
});

// Brutalist type system — a chunky characterful grotesque display, a monospace
// for tags/labels, and a sturdy sans for body.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-archivo",
});

// Theme is chosen at build time via NEXT_PUBLIC_THEME. "romantic" (default) is
// the rose-pink system; "editorial" is the light fine-art variant; "brutalist"
// is the bold neo-brutalist one. All share every component, string and photo —
// only the fonts and the color tokens in globals.css (scoped under
// html[data-theme="…"]) differ.
const THEME = process.env.NEXT_PUBLIC_THEME ?? "romantic";
const isEditorial = THEME === "editorial";
const isBrutalist = THEME === "brutalist";

// Attach only the active theme's fonts, so other themes' fonts never load.
const fontVars = isEditorial
  ? `${parisienne.variable} ${cormorant.variable} ${montserrat.variable}`
  : isBrutalist
    ? `${bricolage.variable} ${spaceMono.variable} ${archivo.variable}`
    : `${inter.variable} ${caveat.variable}`;

const themeAttr = isEditorial ? "editorial" : isBrutalist ? "brutalist" : undefined;

export const metadata: Metadata = {
  title: config.names.couple,
  description: "Our story, in photos · Nuestra historia, en fotos ❤️",
  openGraph: {
    title: `${config.names.couple} ❤️`,
    description: "Our story, in photos · Nuestra historia, en fotos",
  },
};

export const viewport: Viewport = {
  themeColor: isEditorial ? "#f3f0ea" : isBrutalist ? "#f5f0e4" : "#ff6fae",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The <html lang> is updated client-side by the language switch (lib/i18n).
  // data-theme is omitted for the default theme so its markup is unchanged.
  return (
    <html lang="es" data-theme={themeAttr} className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
