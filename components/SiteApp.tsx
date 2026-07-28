"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SiteApp.tsx — el render del sitio de un tenant (lo que antes vivía en page.tsx).
//  Camina content.layout y renderiza cada sección vía SECTION_REGISTRY. El content
//  del tenant lo provee el TenantProvider del layout (resuelto por host).
// ─────────────────────────────────────────────────────────────────────────────

import SmoothScroll from "@/components/SmoothScroll";
import RevealInit from "@/components/RevealInit";
import LightboxProvider from "@/components/Lightbox";
import HeartCursor from "@/components/HeartCursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/tenant";
import { SECTION_REGISTRY } from "@/components/sections/registry";

export default function SiteApp() {
  const content = useContent();

  return (
    <SmoothScroll>
      <LightboxProvider>
        <RevealInit />
        <HeartCursor />
        <Nav />
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
  );
}
