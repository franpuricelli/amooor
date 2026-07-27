import type { ReactNode } from "react";

export default function SectionHead({
  eyebrow,
  kicker,
  title,
  lede,
}: {
  eyebrow?: string;
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="section-head">
      {eyebrow && <span className="eyebrow reveal">{eyebrow}</span>}
      {kicker && <span className="story-kicker reveal">{kicker}</span>}
      <h2 className="h2 reveal" style={{ "--reveal-delay": "0.06s" } as React.CSSProperties}>
        {title}
      </h2>
      {lede && (
        <p className="lede reveal" style={{ "--reveal-delay": "0.12s" } as React.CSSProperties}>
          {lede}
        </p>
      )}
    </header>
  );
}
