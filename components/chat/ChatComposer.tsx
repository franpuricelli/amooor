"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  ChatComposer.tsx — el input. Feedback aplicado:
//   - Adjuntar / PEGAR imágenes: se ven como miniaturas antes de enviar.
//   - Audio INSTANTÁNEO: al tocar el micrófono la barra pasa a modo grabación de
//     inmediato (optimista); la conexión se abre en background.
//   - Autocompletar con "@": lista lo que compartiste antes para referenciarlo.
//   - Mientras el agente escribe (`busy`), el borde "vibra" recorriendo la paleta.
//   - En modo plan hospeda Refinar / Aprobar. "Refinar" sin texto pregunta qué
//     refinar. `registerInsert`: el panel de compartidos inyecta "@objeto".
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { startDeepgram, type DeepgramSession } from "@/lib/deepgram-client";
import type { Attachment, SharedItem } from "@/lib/chat-format";

const WAVE_BARS = 28;

export interface SendOpts {
  attachments?: Attachment[];
  refs?: string[];
  quotes?: string[];
  converse?: boolean;
}

function QuoteGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 7C4.8 8 3.6 9.9 3.6 12.4V17h5v-5H6.1c0-1.5.6-2.6 2-3.3L7 7zm9 0c-2.2 1-3.4 2.9-3.4 5.4V17h5v-5h-2.5c0-1.5.6-2.6 2-3.3L16 7z" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 15l6-6M8.5 12.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 11.5l2-2a3 3 0 0 0-4.2-4.2l-2 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11.5 12.5 19a4.5 4.5 0 0 1-6.36-6.36l7.6-7.6a3 3 0 0 1 4.24 4.24l-7.6 7.6a1.5 1.5 0 0 1-2.12-2.12l6.9-6.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `a-${Math.random().toString(36).slice(2)}`;
}

export default function ChatComposer({
  onSend,
  disabled,
  placeholder,
  centered,
  mode = "chat",
  busy,
  onApprove,
  onRefineEmpty,
  planBusy,
  deepenOptions,
  mentions,
  registerInsert,
  registerQuote,
}: {
  onSend: (text: string, opts?: SendOpts) => void;
  disabled?: boolean;
  placeholder?: string;
  centered?: boolean;
  mode?: "chat" | "plan";
  busy?: boolean;
  onApprove?: () => void;
  onRefineEmpty?: () => void;
  planBusy?: boolean;
  deepenOptions?: string[];
  mentions?: SharedItem[];
  registerInsert?: (fn: (text: string) => void) => void;
  registerQuote?: (fn: (text: string) => void) => void;
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [refs, setRefs] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [showDeepen, setShowDeepen] = useState(true);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIdx, setMentionIdx] = useState(0);

  const sessionRef = useRef<DeepgramSession | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const levels = useRef<number[]>([]);

  const isPlan = mode === "plan";

  const autoGrow = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  };

  const addRef = (label: string) =>
    setRefs((prev) => (prev.includes(label) ? prev : [...prev, label]));

  // El panel de compartidos inyecta "@objeto" como chip azul.
  useEffect(() => {
    if (!registerInsert) return;
    registerInsert((snippet: string) => {
      addRef(snippet.replace(/^@/, ""));
      requestAnimationFrame(() => taRef.current?.focus());
    });
  }, [registerInsert]);

  // "Responder" sobre una selección del agente → el fragmento entra como CHIP
  // rosado (como un adjunto), no como texto dentro del input.
  useEffect(() => {
    if (!registerQuote) return;
    registerQuote((quoted: string) => {
      const clean = quoted.replace(/\s+/g, " ").trim();
      if (!clean) return;
      setQuotes((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      requestAnimationFrame(() => taRef.current?.focus());
    });
  }, [registerQuote]);

  const hasContent =
    !!text.trim() || attachments.length > 0 || refs.length > 0 || quotes.length > 0;

  // ── autocompletar "@" ────────────────────────────────────────────────────────
  const mentionList = mentions ?? [];
  const filteredMentions =
    mentionQuery === null
      ? []
      : mentionList.filter((m) =>
          m.label.toLowerCase().includes(mentionQuery.toLowerCase())
        );
  const mentionOpen = mentionQuery !== null && filteredMentions.length > 0;

  const detectMention = (val: string, caret: number) => {
    const upto = val.slice(0, caret);
    const m = upto.match(/(?:^|\s)@([^\s@]*)$/);
    setMentionQuery(m ? m[1] : null);
    setMentionIdx(0);
  };

  const applyMention = (label: string) => {
    // el "@query" tipeado se saca del texto y pasa a ser un chip azul
    const ta = taRef.current;
    const caret = ta ? ta.selectionStart : text.length;
    const upto = text.slice(0, caret).replace(/(?:^|\s)@([^\s@]*)$/, (m) =>
      m.startsWith("@") ? "" : m[0]
    );
    const rest = text.slice(caret);
    setText(upto + rest);
    addRef(label);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = upto.length;
        autoGrow();
      }
    });
  };

  const submit = () => {
    if (!hasContent || disabled) return;
    const t = text.trim();
    const parts = [t];
    if (quotes.length)
      parts.push(`Respondo a: ${quotes.map((q) => `"${q}"`).join(" · ")}.`);
    if (refs.length) parts.push(`Referencias: ${refs.map((r) => `@${r}`).join(", ")}.`);
    if (attachments.length)
      parts.push(`Adjunté como referencia: ${attachments.map((a) => a.name).join(", ")}.`);
    const payload = parts.filter(Boolean).join("\n\n");
    onSend(payload, {
      ...(attachments.length ? { attachments } : {}),
      ...(refs.length ? { refs } : {}),
      ...(quotes.length ? { quotes } : {}),
    });
    setText("");
    setAttachments([]);
    setRefs([]);
    setQuotes([]);
    setErr(null);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = "auto";
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIdx((i) => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIdx((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick = filteredMentions[mentionIdx] ?? filteredMentions[0];
        if (pick) applyMention(pick.label);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // ── adjuntos (subir + pegar) ─────────────────────────────────────────────────
  const addFiles = (files: File[]) => {
    const next: Attachment[] = [];
    for (const f of files) {
      const isImg = f.type.startsWith("image/");
      next.push({
        id: uid(),
        kind: isImg ? "image" : "file",
        name: f.name || (isImg ? "imagen.png" : "archivo"),
        url: isImg ? URL.createObjectURL(f) : undefined,
      });
    }
    if (next.length) setAttachments((prev) => [...prev, ...next].slice(0, 6));
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imgs = Array.from(e.clipboardData.items)
      .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
      .map((it) => it.getAsFile())
      .filter((f): f is File => !!f);
    if (imgs.length) {
      e.preventDefault();
      addFiles(imgs);
    }
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => {
      const gone = prev.find((a) => a.id === id);
      if (gone?.url) URL.revokeObjectURL(gone.url);
      return prev.filter((a) => a.id !== id);
    });

  // ── waveform loop ────────────────────────────────────────────────────────────
  const startWave = () => {
    if (rafRef.current) return;
    const loop = () => {
      const lvl = sessionRef.current?.getLevel?.() ?? 0;
      levels.current.push(lvl);
      if (levels.current.length > WAVE_BARS) levels.current.shift();
      const el = waveRef.current;
      if (el) {
        const bars = el.children;
        const buf = levels.current;
        for (let i = 0; i < bars.length; i++) {
          const v = buf[buf.length - bars.length + i] ?? 0;
          (bars[i] as HTMLElement).style.transform = `scaleY(${0.14 + v * 0.86})`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };
  const stopWave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    levels.current = [];
  };
  useEffect(() => () => stopWave(), []);

  const deepenKey = (deepenOptions ?? []).join("|");
  useEffect(() => {
    setShowDeepen(true);
  }, [deepenKey]);

  // ── grabación: la UI cambia YA; la conexión se abre en background ────────────
  const startRec = async () => {
    setErr(null);
    setRecording(true); // instantáneo, sin espera percibida
    startWave();
    try {
      const session = await startDeepgram({
        onError: (m) => {
          setErr(m);
          setRecording(false);
          stopWave();
        },
        onOpen: () => {
          /* ya estamos en modo grabación; el waveform empieza a reaccionar */
        },
        onStop: (reason, finalText) => {
          setRecording(false);
          stopWave();
          sessionRef.current = null;
          if (reason !== "cancel") {
            const t = finalText.trim();
            if (t) onSend(t);
            else if (reason !== "error") setErr("No te escuché bien. Probá de nuevo.");
          }
        },
      });
      sessionRef.current = session;
    } catch (e) {
      setErr((e as Error).message);
      setRecording(false);
      stopWave();
    }
  };
  const finishRec = () => {
    if (sessionRef.current) sessionRef.current.finish();
    else {
      setRecording(false);
      stopWave();
    }
  };
  const cancelRec = () => {
    if (sessionRef.current) sessionRef.current.cancel();
    else {
      setRecording(false);
      stopWave();
    }
  };

  // ── render: estado grabando ──────────────────────────────────────────────────
  if (recording) {
    return (
      <div className={`ch-composer-wrap ${centered ? "centered" : ""}`}>
        <div className="ch-composer recording ch-rec-in">
          <div className="ch-wave" ref={waveRef} aria-label="Grabando">
            {Array.from({ length: WAVE_BARS }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <button type="button" className="ch-iconbtn ch-cancel" aria-label="Cancelar" onClick={cancelRec}>
            <CloseIcon />
          </button>
          <button type="button" className="ch-mic-finish" aria-label="Terminar y enviar" onClick={finishRec}>
            <MicIcon />
          </button>
        </div>
        {err && <div className="ch-error">{err}</div>}
      </div>
    );
  }

  // ── render: barra normal / modo plan ─────────────────────────────────────────
  const showDeepenPanel = !isPlan && showDeepen && !!deepenOptions && deepenOptions.length > 0;

  return (
    <div className={`ch-composer-wrap ${centered ? "centered" : ""}`}>
      {showDeepenPanel && (
        <div className="ch-deepen">
          <p className="ch-deepen-label">¿Por dónde querés profundizar?</p>
          <div className="ch-deepen-opts">
            {deepenOptions!.map((o, i) => (
              <button key={i} type="button" className="ch-deepen-opt" disabled={disabled} onClick={() => onSend(o)}>
                {o}
              </button>
            ))}
            <button
              type="button"
              className="ch-deepen-opt otro"
              onClick={() => {
                setShowDeepen(false);
                requestAnimationFrame(() => taRef.current?.focus());
              }}
            >
              <PlusIcon /> Otro
            </button>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="ch-attachments">
          {attachments.map((a) => (
            <span className={`ch-attach-chip ${a.kind === "image" ? "img" : ""}`} key={a.id}>
              {a.kind === "image" && a.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt={a.name} className="ch-attach-thumb" />
              ) : (
                <span className="ch-attach-name">{a.name}</span>
              )}
              <button type="button" aria-label="Quitar" onClick={() => removeAttachment(a.id)}>
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      )}

      {mentionOpen && (
        <div className="ch-mentions" role="listbox">
          {filteredMentions.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={i === mentionIdx}
              className={`ch-mention ${i === mentionIdx ? "on" : ""}`}
              onMouseEnter={() => setMentionIdx(i)}
              onClick={() => applyMention(m.label)}
            >
              <span className={`ch-mention-thumb ${m.kind}`}>
                {m.kind === "image" && m.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumb} alt={m.label} />
                ) : m.kind === "link" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 15l6-6M8.5 12.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 11.5l2-2a3 3 0 0 0-4.2-4.2l-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="ch-mention-label">{m.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`ch-composer ${busy ? "streaming" : ""}`}>
        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple hidden onChange={onFiles} />
        <button
          type="button"
          className="ch-iconbtn ch-attach"
          aria-label="Adjuntar referencia"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          <ClipIcon />
        </button>

        <div className="ch-input-col">
          {quotes.length > 0 && (
            <div className="ch-refs">
              {quotes.map((q, i) => (
                <span className="ch-quote-chip" key={`q-${i}`} title={q}>
                  <QuoteGlyph />
                  <span className="ch-quote-text">{q}</span>
                  <button
                    type="button"
                    aria-label="Quitar cita"
                    onClick={() => setQuotes((prev) => prev.filter((_, x) => x !== i))}
                  >
                    <CloseIcon />
                  </button>
                </span>
              ))}
            </div>
          )}
          {refs.length > 0 && (
            <div className="ch-refs">
              {refs.map((r) => (
                <span className="ch-ref-chip" key={r}>
                  <LinkGlyph />
                  {r}
                  <button
                    type="button"
                    aria-label="Quitar referencia"
                    onClick={() => setRefs((prev) => prev.filter((x) => x !== r))}
                  >
                    <CloseIcon />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            ref={taRef}
            className="ch-textarea"
            rows={1}
            value={text}
            placeholder={placeholder ?? (isPlan ? "¿Qué querés cambiar?" : "Escribí, pegá una imagen o grabá…")}
            onChange={(e) => {
              setText(e.target.value);
              autoGrow();
              detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
            }}
            onKeyUp={(e) => detectMention(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)}
            onClick={(e) => detectMention(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={() => setTimeout(() => setMentionQuery(null), 120)}
          />
        </div>

        {isPlan ? (
          <>
            <button
              type="button"
              className="ch-btn ghost sm"
              onClick={() => (hasContent ? submit() : onRefineEmpty?.())}
              disabled={disabled || planBusy}
            >
              Refinar
            </button>
            <button type="button" className="ch-btn primary sm" onClick={onApprove} disabled={planBusy}>
              Aprobar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="ch-iconbtn ch-mic"
              aria-label="Grabar audio"
              disabled={disabled}
              onClick={startRec}
            >
              <MicIcon />
            </button>
            <button
              type="button"
              className="ch-send"
              aria-label="Enviar"
              disabled={disabled || !hasContent}
              onClick={submit}
            >
              <SendIcon />
            </button>
          </>
        )}
      </div>

      {err && <div className="ch-error">{err}</div>}
    </div>
  );
}
