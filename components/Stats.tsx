"use client";

import { useEffect, useState } from "react";
import { fill } from "@/lib/content";
import { useContent } from "@/lib/tenant";
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
const NUM_LOCALE = "es-AR";

export default function Stats({ id }: { id: string }) {
  const content = useContent();
  const { stats, dates, watch } = content;
  const together = new Date(`${dates.together}T00:00:00`);
  const met = new Date(`${dates.met}T00:00:00`);

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
    { v: t ? t.days.toLocaleString(NUM_LOCALE) : "···", l: stats.labels.days },
    { v: t ? pad(t.hours) : "--", l: stats.labels.hours },
    { v: t ? pad(t.mins) : "--", l: stats.labels.mins },
    { v: t ? pad(t.secs) : "--", l: stats.labels.secs },
  ];

  const chips = stats.chips.map((c) =>
    fill(c, { photos: totalPhotos, titles: watch.list.length })
  );

  return (
    <section id={id} className="section-pad">
      <div className="wrap">
        <div className="stats-band glass-card reveal-scale">
          <p className="stats-kicker">{stats.kicker}</p>
          <div className="stats-grid">
            {cells.map((c) => (
              <div key={c.l} className="stats-cell">
                <span className="stats-num">{c.v}</span>
                <span className="stats-label">{c.l}</span>
              </div>
            ))}
          </div>
          <div className="stats-chips">
            {chips.map((e) => (
              <span className="chip" key={e}>
                {e}
              </span>
            ))}
          </div>
          <p className="stats-met">
            {stats.metLead}
            <strong>{stats.metDate}</strong>
            {daysMet !== null && (
              <>
                , {stats.metAgoPrefix} {daysMet.toLocaleString(NUM_LOCALE)}{" "}
                {stats.metAgoSuffix}
              </>
            )}
            .
          </p>
        </div>
      </div>
    </section>
  );
}
