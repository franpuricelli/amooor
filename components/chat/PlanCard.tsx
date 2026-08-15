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
import { SECTION_KIND_LABELS, type Plan } from "@/lib/plan";
import type { Swatch } from "@/lib/palette-gen";
import PalettePicker from "./PalettePicker";
import TemplateChooser from "./TemplateChooser";

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

function ReplyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h9a7 7 0 0 1 7 7v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionComment({
  title,
  intent,
  onRefine,
  onAskMore,
}: {
  title: string;
  intent: string;
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
    <>
      {/* la intención + los botones fluyen en la misma línea (inline, al lado del texto) */}
      <p className="ch-plan-sec-intent">
        {intent}
        {!commenting && (
          <span className="ch-sec-inline">
            <button type="button" className="ch-sec-act" onClick={() => setCommenting(true)}>
              <ReplyIcon /> Responder
            </button>
            <button type="button" className="ch-sec-act" onClick={() => onAskMore(title)}>
              <AskIcon /> Dar más detalle
            </button>
          </span>
        )}
      </p>
      {commenting && (
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
    </>
  );
}

function Assumption({
  text,
  onCorrect,
}: {
  text: string;
  /** (viejoSupuesto, textoCorregido) → lo saca de la lista y avisa al agente */
  onCorrect: (oldText: string, newText: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const save = () => {
    const v = value.trim();
    setEditing(false);
    if (v) onCorrect(text, v); // corregido → sale de la lista + avisa
  };
  if (!editing)
    return (
      <li>
        <span>{text}</span>
        <button
          type="button"
          className="ch-assum-edit"
          onClick={() => {
            setValue("");
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
        placeholder={text}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
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

function ToneXIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// Tono como keywords: clic aplica, doble clic edita, la X quita, "+ Agregar" suma.
// Cada cambio en el tono activo dispara un refinamiento.
function ToneEditor({ onRefine }: { onRefine: (instruction: string) => void }) {
  const [words, setWords] = useState<string[]>(() => [...TONE_PRESETS]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const apply = (w: string) => {
    setSelected(w);
    onRefine(`Ajustá el tono del sitio a algo más ${w.toLowerCase()}.`);
  };
  const remove = (i: number) => {
    setWords((prev) => prev.filter((_, x) => x !== i));
    if (words[i] === selected) setSelected(null);
  };
  const startEdit = (i: number) => {
    setAdding(false);
    setDraft(words[i]);
    setEditingIdx(i);
  };
  const saveEdit = () => {
    if (editingIdx === null) return;
    const v = draft.trim();
    const old = words[editingIdx];
    if (v && v !== old && !words.includes(v)) {
      setWords((prev) => prev.map((w, x) => (x === editingIdx ? v : w)));
      if (old === selected) apply(v); // reflejar el cambio del tono activo
    }
    setEditingIdx(null);
    setDraft("");
  };
  const addWord = () => {
    const v = draft.trim();
    if (v && !words.includes(v)) setWords((prev) => [...prev, v]);
    setAdding(false);
    setDraft("");
  };

  return (
    <div className="ch-tone">
      <span className="ch-tone-label">Tono</span>
      <div className="ch-tone-opts">
        {words.map((w, i) =>
          editingIdx === i ? (
            <input
              key={`edit-${i}`}
              className="ch-tone-edit"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditingIdx(null);
                  setDraft("");
                }
              }}
              onBlur={saveEdit}
            />
          ) : (
            <span key={w} className={`ch-tone-opt ${selected === w ? "on" : ""}`}>
              <button
                type="button"
                className="ch-tone-word"
                onClick={() => apply(w)}
                onDoubleClick={() => startEdit(i)}
                title="Clic para aplicar · doble clic para editar"
              >
                {w}
              </button>
              <button
                type="button"
                className="ch-tone-x"
                aria-label={`Quitar ${w}`}
                onClick={() => remove(i)}
              >
                <ToneXIcon />
              </button>
            </span>
          )
        )}

        {adding ? (
          <input
            className="ch-tone-edit"
            autoFocus
            placeholder="Nueva palabra"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addWord();
              if (e.key === "Escape") {
                setAdding(false);
                setDraft("");
              }
            }}
            onBlur={addWord}
          />
        ) : (
          <button
            type="button"
            className="ch-tone-add"
            onClick={() => {
              setDraft("");
              setAdding(true);
            }}
          >
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}

export default function PlanCard({
  plan,
  template,
  onTemplate,
  palette,
  customPalettes,
  onPalette,
  onCreatePalette,
  onRefine,
  onAskMore,
  onCorrectAssumption,
  onRemoveSection,
  collapsed = false,
}: {
  plan: Plan;
  /** plantilla elegida (task 2-A) — el chooser vive arriba del plan */
  template: string;
  onTemplate: (id: string) => void;
  palette: string;
  customPalettes: Swatch[];
  onPalette: (id: string, sw?: Swatch) => void;
  onCreatePalette: (sw: Swatch) => void;
  onRefine: (instruction: string) => void;
  onAskMore: (sectionTitle: string) => void;
  /** corregir un supuesto: lo saca del plan al instante (sin re-sintetizar). */
  onCorrectAssumption: (oldText: string, newText: string) => void;
  /** eliminar una sección: la saca del plan al instante. */
  onRemoveSection: (index: number) => void;
  /** durante un refinamiento el plan anterior queda colapsado como "historial". */
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [assumOpen, setAssumOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const couple = coupleLine(plan.names ?? []);

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

  // Colapsado (durante un refinamiento): sólo una tira con el título del plan
  // anterior + "actualizando…". Va DESPUÉS de todos los hooks para no romper el
  // orden de hooks de React ("Rendered fewer hooks than expected").
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

  return (
    <div className="ch-plan" ref={cardRef}>
      <p className="ch-plan-kicker">
        {couple ? `Plan para ${couple}` : "Plan de tu sitio"}
      </p>
      <h2 className="ch-plan-title">{plan.title}</h2>
      <p className="ch-plan-angle">{plan.angle}</p>

      {/* estilo: plantilla (previews reales) + paleta, arriba del plan */}
      <TemplateChooser template={template} onTemplate={onTemplate} />

      <PalettePicker
        value={palette}
        custom={customPalettes}
        onSelect={onPalette}
        onCreate={onCreatePalette}
      />

      {/* tono como keywords editables (quitar / editar / agregar) */}
      <ToneEditor onRefine={onRefine} />

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
                <span className="ch-plan-sec-kind">{SECTION_KIND_LABELS[s.kind]}</span>
                <span className={`ch-plan-sec-chev ${isOpen ? "open" : ""}`}>
                  <Chevron />
                </span>
              </button>
              <div className="ch-plan-sec-detail">
                <SectionComment
                  title={s.title}
                  intent={s.intent}
                  onRefine={onRefine}
                  onAskMore={onAskMore}
                />
                <button
                  type="button"
                  className="ch-sec-delete"
                  aria-label={`Eliminar la sección "${s.title}"`}
                  title="Eliminar sección"
                  onClick={() => onRemoveSection(i)}
                >
                  <TrashIcon />
                </button>
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
              {plan.assumptions.map((a) => (
                <Assumption key={a} text={a} onCorrect={onCorrectAssumption} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
