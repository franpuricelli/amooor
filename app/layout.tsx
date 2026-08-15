import type { Metadata, Viewport } from "next";
import { Inter, Caveat, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
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

// Fraunces — the editorial serif that carries the display headings and the
// italic emphasis (Wispr Flow-style typography) on the marketing landing.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
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
      className={`${inter.variable} ${caveat.variable} ${fraunces.variable}`}
      style={paletteStyle}
    >
      <body>
        {/* ClerkProvider must live inside <body> (never around <html>), so
            <html> keeps its per-tenant palette style + font classes. Spanish
            localization matches the app voice. */}
        <ClerkProvider localization={esES}>
          <TenantProvider content={content}>{children}</TenantProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
