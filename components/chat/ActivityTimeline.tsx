"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  ActivityTimeline.tsx — muestra lo que el agente HACE en un turno (razona,
//  busca en la web, arma el plan) para que el usuario entienda. Timeline con
//  íconos + conector punteado; el paso "Pensó" se expande para ver el razonamiento.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Activity, ActivityKind } from "@/lib/chat-format";

function KindIcon({ kind }: { kind: ActivityKind }) {
  const paths: Record<ActivityKind, React.ReactNode> = {
    // chispa centrada en (12,12)
    think: (
      <path d="M12 4l1.5 5L18 12l-4.5 1.5L12 20l-1.5-6.5L6 12l4.5-1.5L12 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M19.5 19.5l-3.6-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    browse: (
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
    read: (
      <>
        <path d="M12 6c-1.8-1.2-4-1.6-6-1.4A1 1 0 0 0 5 5.6v11a1 1 0 0 0 1.1 1c1.9-.2 4 .2 5.9 1.4 1.9-1.2 4-1.6 5.9-1.4a1 1 0 0 0 1.1-1v-11a1 1 0 0 0-1-1c-2-.2-4.2.2-6 1.4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 6v12" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    write: (
      <>
        <path d="M5 19l1-4L15.5 5.5a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L9 18l-4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    plan: (
      <>
        <path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

/** Paso fallido: el ícono cambia a una cruz (no mentimos con un check/ícono ok). */
function FailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function ChevD() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ActivityTimeline({
  activities,
}: {
  activities: Activity[];
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  if (!activities?.length) return null;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="ch-activity">
      {activities.map((a) => {
        const expandable = a.kind === "think" && !!a.detail;
        const isOpen = open.has(a.id);
        return (
          <div className={`ch-act-row ${a.status}`} key={a.id}>
            <span className={`ch-act-ic ${a.status === "running" ? "spin" : ""}`}>
              {a.status === "error" ? <FailIcon /> : <KindIcon kind={a.kind} />}
            </span>
            <div className="ch-act-body">
              <button
                type="button"
                className="ch-act-head"
                disabled={!expandable}
                onClick={() => expandable && toggle(a.id)}
              >
                <span className="ch-act-label">{a.label}</span>
                {a.detail && a.kind !== "think" && (
                  <span className="ch-act-meta">{a.detail}</span>
                )}
                {expandable && (
                  <span className={`ch-act-chev ${isOpen ? "open" : ""}`}>
                    <ChevD />
                  </span>
                )}
              </button>
              {expandable && isOpen && (
                <div className="ch-act-detail">{a.detail}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
