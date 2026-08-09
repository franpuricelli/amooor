"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PlanCard.tsx — la tarjeta del PLAN. Feedback aplicado:
//   - Kicker personalizado con los nombres ("Plan para Martín e Ivi").
//   - Cada sección se expande, se puede COMENTAR (el agente la edita) o pedir que
//     el agente HAGA MÁS PREGUNTAS sobre ella para dar más detalle.
//   - Tono customizable con opciones (como la paleta).
//   - Supuestos COLAPSADOS y editables (cada uno se puede corregir).
//   - Selector de paleta con hover + creación de paleta propia (PalettePicker).
//   - Reveal por sección al scrollear. Los CTA Refinar/Aprobar viven en la barra.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import type { Plan } from "@/lib/plan";
import type { Swatch } from "@/lib/palette-gen";
import PalettePicker from "./PalettePicker";

// Opciones de tono como KEYWORDS (no frases), se eligen como la paleta.
const TONE_PRESETS = [
  "Cálido",
  "Íntimo",
  "Divertido",
  "Elegante",
  "Épico",
  "Nostálgico",
  "Real",
];

/** "e" antes de sonido i (Ivi, Inés), "y" en el resto. */
function coupleLine(names: string[]): string | null {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length < 2) return null;
  const [a, b] = clean;
  const norm = b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const conj = norm.startsWith("i") || norm.startsWith("hi") ? "e" : "y";
  return `${a} ${conj} ${b}`;
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12a7 7 0 0 1-9.7 6.5L5 20l1.5-4.3A7 7 0 1 1 20 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function AskIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.7.3-.9.7-.9 1.4v.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function SectionComment({
  title,
  onRefine,
  onAskMore,
}: {
  title: string;
  onRefine: (instruction: string) => void;
  onAskMore: (sectionTitle: string) => void;
}) {
  const [commenting, setCommenting] = useState(false);
  const [text, setText] = useState("");
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onRefine(`Sobre la sección "${title}": ${t}`);
    setText("");
    setCommenting(false);
  };
  return (
    <div className="ch-sec-tools">
      {!commenting ? (
        <div className="ch-sec-actions">
          <button type="button" className="ch-sec-act" onClick={() => setCommenting(true)}>
            <CommentIcon /> Comentar
          </button>
          <button type="button" className="ch-sec-act" onClick={() => onAskMore(title)}>
            <AskIcon /> Dar más detalle
          </button>
        </div>
      ) : (
        <div className="ch-sec-comment">
          <textarea
            className="ch-sec-input"
            rows={2}
            autoFocus
            value={text}
            placeholder={`¿Qué cambiarías de "${title}"?`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="ch-sec-comment-cta">
            <button type="button" className="ch-btn ghost sm" onClick={() => setCommenting(false)}>
              Cancelar
            </button>
            <button type="button" className="ch-btn primary sm" onClick={send} disabled={!text.trim()}>
              Enviar cambio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Assumption({
  text,
  onRefine,
}: {
  text: string;
  onRefine: (instruction: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const save = () => {
    const v = value.trim();
    setEditing(false);
    if (v && v !== text) onRefine(`Corregí este supuesto: en vez de "${text}", ${v}.`);
  };
  if (!editing)
    return (
      <li>
        <span>{text}</span>
        <button
          type="button"
          className="ch-assum-edit"
          onClick={() => {
            setValue(text);
            setEditing(true);
          }}
        >
          Corregir
        </button>
      </li>
    );
  return (
    <li className="editing">
      <input
        className="ch-sec-input"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <div className="ch-sec-comment-cta">
        <button type="button" className="ch-btn ghost sm" onClick={() => setEditing(false)}>
          Cancelar
        </button>
        <button type="button" className="ch-btn primary sm" onClick={save}>
          Corregir
        </button>
      </div>
    </li>
  );
}

export default function PlanCard({
  plan,
  palette,
  customPalettes,
  onPalette,
  onCreatePalette,
  onRefine,
  onAskMore,
  collapsed = false,
}: {
  plan: Plan;
  palette: string;
  customPalettes: Swatch[];
  onPalette: (id: string) => void;
  onCreatePalette: (sw: Swatch) => void;
  onRefine: (instruction: string) => void;
  onAskMore: (sectionTitle: string) => void;
  /** durante un refinamiento el plan anterior queda colapsado como "historial". */
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [toneOpen, setToneOpen] = useState(false);
  const [assumOpen, setAssumOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const couple = coupleLine(plan.names ?? []);

  // Colapsado: sólo una tira con el título del plan anterior + "actualizando…".
  if (collapsed) {
    return (
      <div className="ch-plan collapsed" aria-label="Plan anterior (actualizando)">
        <div className="ch-plan-collapsed">
          <div className="ch-plan-collapsed-txt">
            <p className="ch-plan-kicker">
              {couple ? `Plan para ${couple}` : "Plan de tu sitio"}
            </p>
            <h2 className="ch-plan-collapsed-title">{plan.title}</h2>
          </div>
          <span className="ch-plan-updating">
            <span className="ch-typing" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            Actualizando…
          </span>
        </div>
      </div>
    );
  }

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".ch-plan-sec");
    const io = new IntersectionObserver(
      (entries) => {
        const add: number[] = [];
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) add.push(idx);
            io.unobserve(e.target);
          }
        }
        if (add.length)
          setRevealed((prev) => {
            const n = new Set(prev);
            add.forEach((x) => n.add(x));
            return n;
          });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [plan]);

  return (
    <div className="ch-plan" ref={cardRef}>
      <p className="ch-plan-kicker">
        {couple ? `Plan para ${couple}` : "Plan de tu sitio"}
      </p>
      <h2 className="ch-plan-title">{plan.title}</h2>
      <p className="ch-plan-angle">{plan.angle}</p>

      {/* tono customizable — mismo formato de label que la paleta */}
      <div className="ch-tone">
        <p className="ch-plan-tone">
          <span className="ch-tone-label">Tono</span> {plan.tone}
          <button type="button" className="ch-tone-change" onClick={() => setToneOpen((v) => !v)}>
            {toneOpen ? "cerrar" : "cambiar"}
          </button>
        </p>
        {toneOpen && (
          <div className="ch-tone-opts">
            {TONE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                className="ch-tone-opt"
                onClick={() => {
                  onRefine(`Ajustá el tono del sitio a algo más ${t.toLowerCase()}.`);
                  setToneOpen(false);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <PalettePicker
        value={palette}
        custom={customPalettes}
        onSelect={onPalette}
        onCreate={onCreatePalette}
      />

      <ul className="ch-plan-sections">
        {plan.sections.map((s, i) => {
          const isOpen = open.has(i);
          return (
            <li
              className={`ch-plan-sec ${isOpen ? "open" : ""} ${revealed.has(i) ? "in" : ""}`}
              data-idx={i}
              key={i}
            >
              <button
                type="button"
                className="ch-plan-sec-head"
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
              >
                <span className="ch-plan-sec-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ch-plan-sec-title">{s.title}</span>
                <span className={`ch-plan-sec-chev ${isOpen ? "open" : ""}`}>
                  <Chevron />
                </span>
              </button>
              <div className="ch-plan-sec-detail">
                <p>{s.intent}</p>
                <SectionComment title={s.title} onRefine={onRefine} onAskMore={onAskMore} />
              </div>
            </li>
          );
        })}
      </ul>

      {plan.assumptions.length > 0 && (
        <div className={`ch-plan-assum ${assumOpen ? "open" : ""}`}>
          <button
            type="button"
            className="ch-plan-assum-head"
            aria-expanded={assumOpen}
            onClick={() => setAssumOpen((v) => !v)}
          >
            <span>Supuestos</span>
            <span className="ch-assum-count">{plan.assumptions.length}</span>
            <span className={`ch-plan-sec-chev ${assumOpen ? "open" : ""}`}>
              <Chevron />
            </span>
          </button>
          {assumOpen && (
            <ul>
              {plan.assumptions.map((a, i) => (
                <Assumption key={i} text={a} onRefine={onRefine} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
