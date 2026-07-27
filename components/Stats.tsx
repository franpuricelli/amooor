"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { totalPhotos } from "@/lib/photos";

function diff(from: Date, to: Date) {
  let ms = to.getTime() - from.getTime();
  const day = 86400000;
  const days = Math.floor(ms / day);
  ms -= days * day;
  const hours = Math.floor(ms / 3600000);
  ms -= hours * 3600000;
  const mins = Math.floor(ms / 60000);
  ms -= mins * 60000;
  const secs = Math.floor(ms / 1000);
  return { days, hours, mins, secs };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Stats() {
  const together = new Date(`${config.dates.together}T00:00:00`);
  const met = new Date(`${config.dates.met}T00:00:00`);

  // SSR renders placeholders; live values fill in after mount (no hydration
  // mismatch on the clock).
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(together, new Date()));
    const id = setInterval(() => setT(diff(together, new Date())), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysMet = t ? Math.floor((Date.now() - met.getTime()) / 86400000) : null;

  const cells = [
    { v: t ? t.days.toLocaleString("es-AR") : "···", l: "días" },
    { v: t ? pad(t.hours) : "--", l: "horas" },
    { v: t ? pad(t.mins) : "--", l: "min" },
    { v: t ? pad(t.secs) : "--", l: "seg" },
  ];

  const extra = [
    `${totalPhotos} fotos`,
    "5 países",
    `${config.watchlist.length} títulos vistos`,
    "∞ mates",
  ];

  return (
    <section className="section-pad">
      <div className="wrap">
        <div className="stats-band glass-card reveal-scale">
          <p className="stats-kicker">…y acá estamos: juntos desde el 26 · 07 · 2022</p>
          <div className="stats-grid">
            {cells.map((c) => (
              <div key={c.l} className="stats-cell">
                <span className="stats-num">{c.v}</span>
                <span className="stats-label">{c.l}</span>
              </div>
            ))}
          </div>
          <div className="stats-chips">
            {extra.map((e) => (
              <span className="chip" key={e}>
                {e}
              </span>
            ))}
          </div>
          <p className="stats-met">
            …y contando. Nos conocimos el <strong>15 · 03 · 2022</strong>
            {daysMet !== null && <>, hace {daysMet.toLocaleString("es-AR")} días</>}.
          </p>
        </div>
      </div>
    </section>
  );
}
