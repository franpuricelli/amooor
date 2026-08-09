"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  ChatMessages.tsx — el thread. Feedback aplicado:
//   - SÓLO los mensajes del usuario son burbujas; el agente va sobre el lienzo.
//   - El agente se renderiza en markdown (design system amooor) con streaming suave.
//   - Respuestas rápidas seleccionables (chips) cuando el agente ofrece opciones.
//   - Acción de copiar en cada mensaje del agente.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Message } from "@/lib/use-conversation";
import { splitOptions, displayText } from "@/lib/chat-format";
import Markdown from "./Markdown";
import ActivityTimeline from "./ActivityTimeline";

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="ch-msg-action"
      aria-label="Copiar"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
    >
      {done ? "Copiado" : <CopyIcon />}
    </button>
  );
}

export default function ChatMessages({
  messages,
  streaming,
  thinking,
  onOption,
}: {
  messages: Message[];
  streaming: boolean;
  thinking: boolean;
  onOption: (text: string) => void;
}) {
  return (
    <div className="ch-thread">
      {messages.map((m, i) => {
        const isLast = i === messages.length - 1;

        if (m.role === "user") {
          const imgs = (m.attachments ?? []).filter((a) => a.kind === "image" && a.url);
          const files = (m.attachments ?? []).filter((a) => a.kind !== "image");
          const refs = m.refs ?? [];
          // sacamos del texto las notas auto-generadas (se muestran como chips/thumbs)
          const body = m.content
            .replace(/^\s*Referencias:.*$/gim, "")
            .replace(/^\s*Adjunté como referencia:.*$/gim, "")
            .trim();
          return (
            <div className="ch-msg user" key={i}>
              <div className="ch-bubble">
                {imgs.length > 0 && (
                  <div className="ch-bubble-imgs">
                    {imgs.map((a) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={a.id} src={a.url} alt={a.name} className="ch-bubble-img" />
                    ))}
                  </div>
                )}
                {files.length > 0 && (
                  <div className="ch-bubble-files">
                    {files.map((a) => (
                      <span key={a.id} className="ch-bubble-file">
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                {refs.length > 0 && (
                  <div className="ch-bubble-refs">
                    {refs.map((r) => (
                      <span key={r} className="ch-ref-chip sm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 15l6-6M8.5 12.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 11.5l2-2a3 3 0 0 0-4.2-4.2l-2 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
                {body && <span className="ch-bubble-text">{body}</span>}
              </div>
            </div>
          );
        }

        // Agente: sobre el lienzo, en markdown.
        const streamingThis = streaming && isLast;
        const text = displayText(m.content);
        const options = streamingThis ? [] : splitOptions(m.content).options;

        return (
          <div className="ch-msg assistant ch-fade-in" key={i}>
            {m.activities && m.activities.length > 0 && (
              <ActivityTimeline activities={m.activities} />
            )}
            {(text || streamingThis) && (
              <div className="ch-agent">
                <Markdown>{text}</Markdown>
                {streamingThis && <span className="ch-caret" aria-hidden />}
              </div>
            )}

            {!streamingThis && text && (
              <div className="ch-msg-actions">
                <CopyButton text={text} />
              </div>
            )}

            {isLast && options.length > 0 && (
              <div className="ch-options">
                {options.map((o, idx) => (
                  <button
                    key={idx}
                    className="ch-option"
                    onClick={() => onOption(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {thinking && (
        <div className="ch-msg assistant">
          <div className="ch-agent">
            <span className="ch-typing" aria-label="pensando">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
