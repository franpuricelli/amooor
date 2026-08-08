// ─────────────────────────────────────────────────────────────────────────────
//  components/marketing/LegalPage.tsx — layout compartido de páginas legales
//  (privacidad, términos). Reutiliza el nav/footer y el sistema visual de la
//  landing para que /privacidad y /terminos no queden como 404 ni desentonen.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import "./marketing.css";
import type { MarketingContent } from "@/lib/marketing";
import { MarketingProvider } from "@/lib/marketing-context";
import { MkNav, MkFooter } from "./sections";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({
  content,
  marketing,
}: {
  content: LegalContent;
  marketing: MarketingContent;
}) {
  return (
    <MarketingProvider content={marketing}>
      <div className="mk-root">
        <MkNav />
        <main className="mk-legal">
        <div className="mk-legal-wrap">
          <header className="mk-legal-head">
            <h1 className="mk-legal-title">{content.title}</h1>
            <p className="mk-legal-updated">{content.updated}</p>
            <p className="mk-legal-intro">{content.intro}</p>
          </header>

          {content.sections.map((s, i) => (
            <section key={i} className="mk-legal-section">
              <h2 className="mk-legal-h2">{s.heading}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="mk-legal-p">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        </main>
        <MkFooter />
      </div>
    </MarketingProvider>
  );
}
