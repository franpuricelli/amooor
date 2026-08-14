import type { Metadata, Viewport } from "next";
import { Inter, Caveat, Space_Grotesk } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// Theme is chosen at build time via NEXT_PUBLIC_THEME. "romantic" (default) is
// the rose-pink system; "noir" is the dark + warm-gold variant. Both themes
// share every component, string and photo — only the fonts and the color tokens
// in globals.css (scoped under html[data-theme="noir"]) differ.
const THEME = process.env.NEXT_PUBLIC_THEME ?? "romantic";
const isNoir = THEME === "noir";

// Attach only the active theme's fonts, so the other theme's font never loads.
const fontVars = isNoir
  ? `${spaceGrotesk.variable} ${inter.variable}`
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
  themeColor: isNoir ? "#0c0c10" : "#ff6fae",
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
      data-theme={isNoir ? "noir" : undefined}
      className={fontVars}
    >
      <body>{children}</body>
    </html>
  );
}
