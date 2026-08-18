import type { Metadata, Viewport } from "next";
import { Inter, Caveat, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";
import { fontVariables } from "./fonts";
import { themeVars } from "@/lib/theme";
import { TenantProvider } from "@/lib/tenant";
import { resolveSite } from "@/lib/site-server";
import PostHogProvider from "@/components/analytics/PostHogProvider";

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
  // re-themes from data, per host. `themeVars` adds the chosen template's own
  // surface tokens, derived from that same palette (lib/theme.ts).
  const paletteStyle = themeVars(theme) as React.CSSProperties;

  return (
    <html
      lang={content.site.locale}
      className={fontVariables}
      // la plantilla elegida re-estiliza el sitio vía CSS `[data-template]`
      // (app/globals.css). Sin ella → base "romantic".
      data-template={theme.template ?? "romantic"}
      style={paletteStyle}
    >
      <body>
        {/* ClerkProvider must live inside <body> (never around <html>), so
            <html> keeps its per-tenant palette style + font classes. Spanish
            localization matches the app voice. */}
        <ClerkProvider
          localization={esES}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          {/* PostHog va DENTRO de Clerk: identifica al usuario con useUser(). */}
          <PostHogProvider>
            <TenantProvider content={content}>{children}</TenantProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
