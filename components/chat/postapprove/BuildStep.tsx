"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  BuildStep.tsx — Phase 2: pantalla transicional del build.
//  POSTea /api/generate (mode preview) → { content, theme }; muestra "Armando tu
//  sitio…" con las etapas (ícono propio + puntitos que saltan en la activa),
//  frases románticas rotando, y corazoncitos/avioncitos flotando de fondo para
//  entretener. Sin puntito de estado. Auto-avanza al editor (onBuilt).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";

// ── etapas (ícono propio + label) ──────────────────────────────────────────────
const STAGES: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Leyendo tu plan",
    icon: (
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    label: "Ordenando tus fotos",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
        <path d="M5 17l4-4 3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: "Escribiendo los textos",
    icon: (
      <path d="M5 19l1-4L16 5a2 2 0 0 1 3 3L9 18l-4 1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    label: "Armando las secciones",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="4" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
];

// frases románticas de autores/obras clásicas (rotan mientras arma el sitio)
const QUOTES: { text: string; who: string }[] = [
  { text: "De lo que sea que estén hechas las almas, la de él y la mía son la misma.", who: "Emily Brontë" },
  { text: "Mi generosidad es tan inmensa como el mar, mi amor tan profundo: cuanto más te doy, más tengo.", who: "Romeo y Julieta" },
  { text: "Te amo como se aman ciertas cosas oscuras, en secreto, entre la sombra y el alma.", who: "Pablo Neruda" },
  { text: "Te quiero no por lo que sos, sino por lo que soy cuando estoy con vos.", who: "Gabriel García Márquez" },
  { text: "El amor no se mira con los ojos, sino con el alma.", who: "Shakespeare" },
  { text: "Y de repente, sin buscarlo, apareciste vos.", who: "Julio Cortázar" },
];

function Dots() {
  return (
    <span className="ch-typing pa-load-dots" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

// corazoncitos + avioncitos flotando de fondo
const FLOATERS = Array.from({ length: 14 }, (_, i) => i);
function Floaters() {
  return (
    <div className="pa-floaters" aria-hidden>
      {FLOATERS.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.9;
        const dur = 7 + (i % 5) * 1.6;
        const plane = i % 3 === 0;
        return (
          <span
            key={i}
            className={`pa-floater ${plane ? "plane" : "heart"}`}
            style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
          >
            {plane ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 4L3 11l6 2 2 6 3-5 7-10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M9 13l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 5 3.6 3.3 7-2.3 4.4-9.3 9-9.3 9z" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function BuildStep({
  token,
  onBuilt,
  onRetry,
}: {
  token: string;
  onBuilt: (content: Content, theme: Theme) => void;
  onRetry: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [qi, setQi] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const stepTimer = setInterval(
      () => setTick((x) => Math.min(x + 1, STAGES.length - 1)),
      1400
    );
    const quoteTimer = setInterval(() => setQi((x) => (x + 1) % QUOTES.length), 4200);
    (async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ draftToken: token, mode: "preview" }),
        });
        if (!res.ok) throw new Error("build failed");
        const json = await res.json();
        onBuilt(json.content as Content, json.theme as Theme);
      } catch {
        setError("No pudimos armar tu sitio. Probá de nuevo.");
      } finally {
        clearInterval(stepTimer);
        clearInterval(quoteTimer);
      }
    })();
    return () => {
      clearInterval(stepTimer);
      clearInterval(quoteTimer);
    };
  }, [token, onBuilt]);

  const quote = QUOTES[qi];

  return (
    <div className="pa-root pa-build">
      {!error && <Floaters />}
      <div className="pa-build-card">
        {error ? (
          <>
            <h2 className="pa-build-title">Algo salió mal</h2>
            <p className="pa-build-err">{error}</p>
            <button type="button" className="ch-btn primary" onClick={onRetry}>
              Volver a las fotos
            </button>
          </>
        ) : (
          <>
            <h2 className="pa-build-title">Armando tu sitio…</h2>
            <ul className="pa-build-steps">
              {STAGES.map((s, i) => {
                const done = i < tick;
                const active = i === tick;
                return (
                  <li key={i} className={active ? "on" : done ? "done" : ""}>
                    <span className="pa-stage-ic">
                      {done ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4 10-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          {s.icon}
                        </svg>
                      )}
                    </span>
                    <span className="pa-stage-label">{s.label}</span>
                    {active && <Dots />}
                  </li>
                );
              })}
            </ul>
            <figure className="pa-quote">
              <blockquote>{quote.text}</blockquote>
              <figcaption>— {quote.who}</figcaption>
            </figure>
          </>
        )}
      </div>
    </div>
  );
}
