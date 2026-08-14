import type { Metadata, Viewport } from "next";
import {
  Inter,
  Caveat,
  Parisienne,
  Cormorant_Garamond,
  Montserrat,
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

// Theme is chosen at build time via NEXT_PUBLIC_THEME. "romantic" (default) is
// the rose-pink system; "editorial" is the light, elegant fine-art variant.
// Both themes share every component, string and photo — only the fonts and the
// color tokens in globals.css (scoped under html[data-theme="editorial"]) differ.
const THEME = process.env.NEXT_PUBLIC_THEME ?? "romantic";
const isEditorial = THEME === "editorial";

// Attach only the active theme's fonts, so the other theme's fonts never load.
const fontVars = isEditorial
  ? `${parisienne.variable} ${cormorant.variable} ${montserrat.variable}`
  : `${inter.variable} ${caveat.variable}`;

export const metadata: Metadata = {
  title: config.names.couple,
  description: "Our story, in photos · Nuestra historia, en fotos ❤️",
  openGraph: {
    title: `${config.names.couple} ❤️`,
    description: "Our story, in photos · Nuestra historia, en fotos",
  },
};

export const viewport: Viewport = {
  themeColor: isEditorial ? "#f3f0ea" : "#ff6fae",
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
    <html
      lang="es"
      data-theme={isEditorial ? "editorial" : undefined}
      className={fontVars}
    >
      <body>{children}</body>
    </html>
  );
}
