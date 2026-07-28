// ─────────────────────────────────────────────────────────────────────────────
//  components/marketing/Landing.tsx — la landing pública de amooor (WP-5).
//  Se renderiza desde app/page.tsx cuando no hay tenant activo.
//  Prop `showcase`: array de tenants de ejemplo para la sección Ejemplos.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import "./marketing.css";
import {
  MkNav,
  MkHero,
  MkHowItWorks,
  MkShowcase,
  MkPricing,
  MkTestimonials,
  MkFaq,
  MkFooter,
} from "./sections";

interface ShowcaseItem {
  subdomain: string;
  couple: string;
  palette: string;
}

interface LandingProps {
  showcase: ShowcaseItem[];
}

export default function Landing({ showcase }: LandingProps) {
  return (
    <div className="mk-root">
      <MkNav />
      <main>
        <MkHero />
        <MkHowItWorks />
        <MkShowcase showcase={showcase} />
        <MkPricing />
        <MkTestimonials />
        <MkFaq />
      </main>
      <MkFooter />
    </div>
  );
}
