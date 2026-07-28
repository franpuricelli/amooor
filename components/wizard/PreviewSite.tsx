"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PreviewSite.tsx — renderiza el sitio de un draft (WP-3, paso Review) con el
//  content + theme generados, sin ser un tenant real. Reusa el mismo render que
//  la home (SECTION_REGISTRY) envuelto en su propio TenantProvider + paleta local.
// ─────────────────────────────────────────────────────────────────────────────

import SmoothScroll from "@/components/SmoothScroll";
import RevealInit from "@/components/RevealInit";
import LightboxProvider from "@/components/Lightbox";
import Footer from "@/components/Footer";
import { TenantProvider } from "@/lib/tenant";
import { SECTION_REGISTRY } from "@/components/sections/registry";
import { resolvePalette, paletteVars } from "@/lib/theme";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";

export default function PreviewSite({
  content,
  theme,
}: {
  content: Content;
  theme: Theme;
}) {
  const paletteStyle = paletteVars(resolvePalette(theme)) as React.CSSProperties;

  return (
    <div style={paletteStyle}>
      <TenantProvider content={content}>
        <SmoothScroll>
          <LightboxProvider>
            <RevealInit />
            <main>
              {content.layout
                .filter((s) => s.enabled)
                .map((s) => {
                  const Section = SECTION_REGISTRY[s.type];
                  return Section ? <Section key={s.id} id={s.id} /> : null;
                })}
            </main>
            <Footer />
          </LightboxProvider>
        </SmoothScroll>
      </TenantProvider>
    </div>
  );
}
