"use client";

import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
import DrawingFlip from "@/components/DrawingFlip";

export default function Footer() {
  const content = useContent();
  const { footer, dates } = content;
  return (
    <footer className="footer section-dark">
      <DrawingFlip />
      <h2 className="h2 reveal" style={{ "--reveal-delay": "0.08s" } as React.CSSProperties}>
        {footer.title}
      </h2>
      <p className="footer-line reveal" style={{ "--reveal-delay": "0.14s" } as React.CSSProperties}>
        {fill(footer.line, { years: dates.anniversaryYears })}
      </p>
      <p className="footer-credit reveal" style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>
        {footer.credit}
      </p>
    </footer>
  );
}
