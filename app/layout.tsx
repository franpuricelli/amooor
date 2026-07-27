import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { content } from "@/lib/content";
import { anniversaryTemplate } from "@/lib/template";
import { resolvePalette, paletteVars } from "@/lib/theme";

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

export const metadata: Metadata = {
  title: content.site.title,
  description: content.site.description,
  openGraph: {
    title: content.site.ogTitle,
    description: content.site.ogDescription,
  },
};

export const viewport: Viewport = {
  themeColor: content.site.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The tenant's palette becomes CSS variables on <html>, so the whole site
  // re-themes from data (WP-2 will resolve theme per host; here we use the default).
  const paletteStyle = paletteVars(
    resolvePalette(anniversaryTemplate.defaultTheme)
  ) as React.CSSProperties;

  return (
    <html
      lang={content.site.locale}
      className={`${inter.variable} ${caveat.variable}`}
      style={paletteStyle}
    >
      <body>{children}</body>
    </html>
  );
}
