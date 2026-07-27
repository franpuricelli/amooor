import { config } from "@/lib/config";
import DrawingFlip from "@/components/DrawingFlip";

export default function Footer() {
  return (
    <footer className="footer section-dark">
      <DrawingFlip />
      <h2 className="h2 reveal" style={{ "--reveal-delay": "0.08s" } as React.CSSProperties}>
        Feliz aniversario, mi amor
      </h2>
      <p className="footer-line reveal" style={{ "--reveal-delay": "0.14s" } as React.CSSProperties}>
        {config.dates.anniversaryYears} años · 26.07.2022 → ∞
      </p>
      <p className="footer-credit reveal" style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>
        hecho por Puri, con amor (y un poco de código) ❤️
      </p>
    </footer>
  );
}
