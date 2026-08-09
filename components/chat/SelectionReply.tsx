"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SelectionReply.tsx — al seleccionar texto de un mensaje del agente aparece un
//  botón flotante "Responder" (como en Claude): cita ese fragmento en el composer.
//  Sólo se activa dentro de `.ch-agent` (no en burbujas del usuario).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

interface Pos {
  text: string;
  x: number;
  y: number;
}

function ReplyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h9a7 7 0 0 1 7 7v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SelectionReply({ onReply }: { onReply: (text: string) => void }) {
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => {
    const evaluate = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setPos(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
      if (!el || !el.closest(".ch-agent")) {
        setPos(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        setPos(null);
        return;
      }
      setPos({ text, x: rect.left + rect.width / 2, y: rect.top });
    };

    const onUp = () => requestAnimationFrame(evaluate);
    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) setPos(null);
    };
    const onScroll = () => setPos(null);

    document.addEventListener("mouseup", onUp);
    document.addEventListener("selectionchange", onSelChange);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("selectionchange", onSelChange);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  if (!pos) return null;

  return (
    <button
      type="button"
      className="ch-reply-float"
      style={{ left: pos.x, top: pos.y }}
      // mousedown no debe colapsar la selección antes de leerla
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        onReply(pos.text);
        window.getSelection()?.removeAllRanges();
        setPos(null);
      }}
    >
      Responder <ReplyIcon />
    </button>
  );
}
