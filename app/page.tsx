"use client";

import SmoothScroll from "@/components/SmoothScroll";
import RevealInit from "@/components/RevealInit";
import LightboxProvider from "@/components/Lightbox";
import HeartCursor from "@/components/HeartCursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/tenant";
import { SECTION_REGISTRY } from "@/components/sections/registry";

export default function Home() {
  const content = useContent();

  return (
    <SmoothScroll>
      <LightboxProvider>
        <RevealInit />
        <HeartCursor />
        <Nav />
        <main>
          {/* Sections render in the order declared by content.layout — reorder,
              enable or disable them by data, no code change. */}
          {content.layout
            .filter((s) => s.enabled)
            .map((s) => {
              const Section = SECTION_REGISTRY[s.type];
              return <Section key={s.id} id={s.id} />;
            })}
        </main>
        <Footer />
      </LightboxProvider>
    </SmoothScroll>
  );
}
