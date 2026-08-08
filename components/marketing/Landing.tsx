// ─────────────────────────────────────────────────────────────────────────────
//  components/marketing/Landing.tsx — la landing pública de amooor.
//  Recibe el contenido del locale (es | en) y lo provee vía contexto.
//  Rediseño editorial: paleta rosa de purivi + estructura tipo Wispr Flow.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import "./marketing.css";
import type { MarketingContent } from "@/lib/marketing";
import { MarketingProvider } from "@/lib/marketing-context";
import {
  MkNav,
  MkHero,
  MkHowItWorks,
  MkShowcase,
  MkWall,
  MkAbout,
  MkFaq,
  MkPricing,
  MkFooter,
} from "./sections";

export default function Landing({ content }: { content: MarketingContent }) {
  return (
    <MarketingProvider content={content}>
      <div className="mk-root">
        <MkNav />
        <main>
          <MkHero />
          <MkHowItWorks />
          <MkShowcase />
          <MkWall />
          <MkAbout />
          <MkFaq />
          <MkPricing />
        </main>
        <MkFooter />
      </div>
    </MarketingProvider>
  );
}
