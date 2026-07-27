import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { resolvePalette, paletteVars } from "@/lib/theme";
import { TenantProvider } from "@/lib/tenant";
import { resolveSite } from "@/lib/site-server";

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

// Metadata + viewport are per-tenant: they read the same (request-cached) site
// as the layout, so each host gets its own title/OG/theme-color.
export async function generateMetadata(): Promise<Metadata> {
  const { content } = await resolveSite();
  return {
    title: content.site.title,
    description: content.site.description,
    openGraph: {
      title: content.site.ogTitle,
      description: content.site.ogDescription,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { content } = await resolveSite();
  return {
    themeColor: content.site.themeColor,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { content, theme } = await resolveSite();
  // The tenant's palette becomes CSS variables on <html> — the whole site
  // re-themes from data, per host.
  const paletteStyle = paletteVars(resolvePalette(theme)) as React.CSSProperties;

  return (
    <html
      lang={content.site.locale}
      className={`${inter.variable} ${caveat.variable}`}
      style={paletteStyle}
    >
      <body>
        <TenantProvider content={content}>{children}</TenantProvider>
      </body>
    </html>
  );
}
