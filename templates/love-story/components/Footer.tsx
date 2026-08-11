import { config } from "@/lib/config";
import DrawingFlip from "@/components/DrawingFlip";

// "2020-02-14" -> "14.02.2020"
function dotDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function Footer() {
  return (
    <footer className="footer section-dark">
      <DrawingFlip />
      <h2 className="h2 reveal" style={{ "--reveal-delay": "0.08s" } as React.CSSProperties}>
        Happy anniversary, my love · Feliz aniversario, mi amor
      </h2>
      <p className="footer-line reveal" style={{ "--reveal-delay": "0.14s" } as React.CSSProperties}>
        {config.dates.anniversaryYears} years · años · {dotDate(config.dates.together)} → ∞
      </p>
      <p className="footer-credit reveal" style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>
        made with love (and a bit of code) · hecho con amor (y un poco de código) ❤️
      </p>
    </footer>
  );
}
