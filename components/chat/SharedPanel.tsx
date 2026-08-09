"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SharedPanel.tsx — columna derecha con lo que el usuario compartió: imágenes,
//  enlaces y el plan. Feedback aplicado:
//   - Diseño más prolijo: miniaturas redondeadas, tira limpia colapsada.
//   - Colapsado = miniaturas; al abrir se expande sin tapar el chat.
//   - Al tocar un objeto se referencia en el chat como @objeto.
//   - Se puede EDITAR el nombre de cada referencia (lápiz → input).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import type { SharedItem } from "@/lib/chat-format";

function KindGlyph({ kind }: { kind: SharedItem["kind"] }) {
  if (kind === "link")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 15l6-6M8.5 12.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 11.5l2-2a3 3 0 0 0-4.2-4.2l-2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "plan")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path d="M5 17l4-4 3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19l1-4L15.5 5.5a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L9 18l-4 1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb({ item }: { item: SharedItem }) {
  return (
    <span className={`ch-shared-ic ${item.kind}`}>
      {item.kind === "image" && item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumb} alt={item.label} />
      ) : (
        <KindGlyph kind={item.kind} />
      )}
    </span>
  );
}

function Row({
  item,
  onReference,
  onRename,
}: {
  item: SharedItem;
  onReference: (label: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.label);

  const save = () => {
    const v = value.trim();
    setEditing(false);
    if (v && v !== item.label) onRename(item.id, v);
  };

  if (editing)
    return (
      <div className="ch-shared-item editing">
        <Thumb item={item} />
        <input
          className="ch-shared-input"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={save}
        />
      </div>
    );

  return (
    <div className="ch-shared-item">
      <button
        type="button"
        className="ch-shared-open"
        onClick={() => onReference(item.label)}
        title={`Referenciar @${item.label}`}
      >
        <Thumb item={item} />
        <span className="ch-shared-label">{item.label}</span>
      </button>
      <button
        type="button"
        className="ch-shared-edit"
        aria-label="Renombrar"
        title="Renombrar"
        onClick={() => {
          setValue(item.label);
          setEditing(true);
        }}
      >
        <PencilIcon />
      </button>
    </div>
  );
}

export default function SharedPanel({
  items,
  onReference,
  onRename,
}: {
  items: SharedItem[];
  onReference: (label: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <aside className={`ch-shared ${open ? "open" : ""}`} aria-label="Contexto">
      <button
        type="button"
        className="ch-shared-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={open ? "Cerrar" : "Ver el contexto"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={open ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {open && <span>Contexto</span>}
      </button>

      <div className="ch-shared-list">
        {open
          ? items.map((it) => (
              <Row key={it.id} item={it} onReference={onReference} onRename={onRename} />
            ))
          : items.map((it) => (
              <button
                key={it.id}
                type="button"
                className="ch-shared-mini"
                onClick={() => onReference(it.label)}
                title={`Referenciar @${it.label}`}
              >
                <Thumb item={it} />
              </button>
            ))}
      </div>
    </aside>
  );
}
