"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { totalPhotos } from "@/lib/photos";
import { useI18n } from "@/lib/i18n";

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

// "2020-02-14" -> "14 · 02 · 2020"
const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d} · ${m} · ${y}`;
};

export default function Stats() {
  const { t, lang } = useI18n();
  const locale = lang === "es" ? "es-AR" : "en-US";
  const together = new Date(`${config.dates.together}T00:00:00`);
  const met = new Date(`${config.dates.met}T00:00:00`);

  // SSR renders placeholders; live values fill in after mount (no hydration
  // mismatch on the clock).
  const [clock, setClock] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setClock(diff(together, new Date()));
    const id = setInterval(() => setClock(diff(together, new Date())), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysMet = clock ? Math.floor((Date.now() - met.getTime()) / 86400000) : null;

  const cells = [
    { v: clock ? clock.days.toLocaleString(locale) : "···", l: t.stats.days },
    { v: clock ? pad(clock.hours) : "--", l: t.stats.hours },
    { v: clock ? pad(clock.mins) : "--", l: t.stats.mins },
    { v: clock ? pad(clock.secs) : "--", l: t.stats.secs },
  ];

  const extra = [
    `${totalPhotos} ${t.stats.photos}`,
    `${config.viajes.length} ${t.stats.places}`,
    `${config.watchlist.length} ${t.stats.titles}`,
    `∞ ${t.stats.moments}`,
  ];

  return (
    <section className="section-pad">
      <div className="wrap">
        <div className="stats-band glass-card reveal-scale">
          <p className="stats-kicker">
            {t.stats.sinceKicker} {fmt(config.dates.together)}
          </p>
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
            {t.stats.metPre} <strong>{fmt(config.dates.met)}</strong>
            {daysMet !== null && (
              <>, {t.stats.daysAgo.replace("{n}", daysMet.toLocaleString(locale))}</>
            )}
            .
          </p>
        </div>
      </div>
    </section>
  );
}
