"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  EditStep.tsx — Phase 3: el editor.
//   Sidebar de íconos (Chat | Multimedia) → flujo a la IZQUIERDA; el PREVIEW queda
//   FIJO a la derecha y es la superficie de edición: el copy se edita inline (con
//   lápiz), y tocar una imagen abre Multimedia en esa sección/imagen. La paleta vive
//   en la barra del navegador del preview; "Publicar" va en el header (neutro).
//   Mobile: una pill "Previsualizar" alterna el flujo ↔ el preview.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseConversation, Message } from "@/lib/use-conversation";
import type { Activity } from "@/lib/chat-format";
import { convexClient, isConvexConfigured } from "@/lib/convex-browser";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { parseContent, type Theme } from "@/lib/template";
import type { Content } from "@/lib/content";
import type { PaletteId } from "@/lib/theme";
import { slugifyCouple } from "@/lib/subdomain";
import { planSectionSlugs } from "@/lib/plan-to-state";
import { mediaFromPhotos, rebindMedia } from "@/lib/generate";
import { uploadImage, uploadVideo } from "@/lib/media-client";
import type { EditAPI } from "@/lib/edit-context";
import ChatMessages from "../ChatMessages";
import ChatComposer from "../ChatComposer";
import PalettePicker from "../PalettePicker";
import SitePreviewFrame from "./SitePreviewFrame";

type Tool = "chat" | "media";
type MobilePane = "flow" | "preview";
interface MediaFocus {
  cat: string;
  slug?: string;
}

// ── set inmutable por path ("hero.lede", "story.historia.beats.0.title") ────────
function setByPath(root: Content, path: string, value: string): Content {
  const next = structuredClone(root) as Content;
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur = cur[/^\d+$/.test(k) ? Number(k) : k];
    if (cur == null) return root;
  }
  const last = parts[parts.length - 1];
  cur[/^\d+$/.test(last) ? Number(last) : last] = value;
  return next;
}

function ChatGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function MediaGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path d="M5 17l4-4 3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export default function EditStep({
  convo,
  content,
  theme,
  onContent,
  onTheme,
}: {
  convo: UseConversation;
  content: Content;
  theme: Theme;
  onContent: (c: Content) => void;
  onTheme: (t: Theme) => void;
  onAddMore?: () => void;
}) {
  const token = convo.token;
  const [tool, setTool] = useState<Tool>("chat");
  const [mediaFocus, setMediaFocus] = useState<MediaFocus | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>("flow");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subdomain = slugifyCouple(content.couple || "tu-sitio");

  // ── persistencia (validada) ─────────────────────────────────────────────────
  const saveContent = useCallback(
    async (c: Content) => {
      if (!token || !isConvexConfigured()) return;
      try {
        const valid = parseContent(c);
        await convexClient().mutation(api.drafts.save, { token, content: valid, status: "ready" });
      } catch (e) {
        console.error("[edit] guardado falló:", e);
      }
    },
    [token]
  );
  const scheduleSave = useCallback(
    (c: Content) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void saveContent(c), 700);
    },
    [saveContent]
  );

  // ── API de edición inline (copy + click imagen) ─────────────────────────────
  const editApi: EditAPI = {
    editing: true,
    onEditText: (path, value) => {
      const next = setByPath(content, path, value);
      onContent(next);
      scheduleSave(next);
    },
    onPickImage: (cat, slug) => {
      setTool("media");
      setMediaFocus({ cat, slug });
      setMobilePane("flow");
    },
  };

  // ── rebind de media (reorder/agregar/borrar fotos → sin pisar copy) ─────────
  const rebind = useCallback(async () => {
    if (!token || !isConvexConfigured()) return;
    try {
      const rows = await convexClient().query(api.photos.listDraftPhotos, { draftToken: token });
      const next = parseContent(rebindMedia(content, mediaFromPhotos(rows))) as Content;
      onContent(next);
      await convexClient().mutation(api.drafts.save, { token, content: next, status: "ready" });
    } catch (e) {
      console.error("[edit] rebind falló:", e);
    }
  }, [token, content, onContent]);

  // ── paleta (control directo del toolbar del navegador) ──────────────────────
  const onPalette = useCallback(
    (id: string) => {
      onTheme({ palette: id as PaletteId });
      convo.setPalette(id);
      if (token && isConvexConfigured()) {
        void convexClient().mutation(api.drafts.save, { token, theme: { palette: id } });
      }
    },
    [onTheme, convo, token]
  );

  const toolbar = (
    <div className="pa-tool-palette">
      <PalettePicker
        value={theme.palette}
        custom={convo.customPalettes}
        onSelect={onPalette}
        onCreate={convo.addCustomPalette}
      />
    </div>
  );

  return (
    <div className="pa-root pa-edit">
      {/* pill mobile para alternar flujo ↔ preview */}
      <div className="pa-mobilebar">
        <button
          type="button"
          className="pa-preview-toggle"
          onClick={() => setMobilePane((p) => (p === "flow" ? "preview" : "flow"))}
        >
          {mobilePane === "flow" ? "Previsualizar" : "Volver a editar"}
        </button>
      </div>

      <div className="pa-edit-body">
        {/* sidebar de íconos */}
        <nav className="pa-sidebar" aria-label="Herramientas">
          <button
            type="button"
            className={`pa-sidebar-btn ${tool === "chat" ? "on" : ""}`}
            onClick={() => {
              setTool("chat");
              setMobilePane("flow");
            }}
          >
            <ChatGlyph />
            <span>Chat</span>
          </button>
          <button
            type="button"
            className={`pa-sidebar-btn ${tool === "media" ? "on" : ""}`}
            onClick={() => {
              setTool("media");
              setMobilePane("flow");
            }}
          >
            <MediaGlyph />
            <span>Multimedia</span>
          </button>
        </nav>

        {/* flujo (izquierda) */}
        <div className={`pa-flow ${mobilePane === "flow" ? "show" : ""}`}>
          {tool === "chat" ? (
            <ChatFlow token={token} content={content} onContent={onContent} />
          ) : (
            <MediaFlow convo={convo} focus={mediaFocus} onRebind={rebind} />
          )}
        </div>

        {/* preview FIJO (derecha) — superficie de edición inline */}
        <div className={`pa-preview-fixed ${mobilePane === "preview" ? "show" : ""}`}>
          <SitePreviewFrame
            content={content}
            theme={theme}
            subdomain={subdomain}
            toolbar={toolbar}
            edit={editApi}
          />
        </div>
      </div>
    </div>
  );
}

// ── flujo CHAT (web-agent de estructura) ────────────────────────────────────────
function ChatFlow({
  token,
  content,
  onContent,
}: {
  token: string;
  content: Content;
  onContent: (c: Content) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);

  const consumeSSE = useCallback(
    async (bodyStream: ReadableStream<Uint8Array>) => {
      const reader = bodyStream.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const updateLast = (fn: (m: Message) => Message) =>
        setMessages((prev) => {
          const next = prev.slice();
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "assistant") {
              next[i] = fn(next[i]);
              break;
            }
          }
          return next;
        });
      const handle = (evt: { type: string; activity?: Activity; content?: Content; message?: string }) => {
        if (evt.type === "activity" && evt.activity) {
          const act = evt.activity;
          setThinking(false);
          updateLast((m) => {
            const acts = (m.activities ?? []).slice();
            const idx = acts.findIndex((a) => a.id === act.id);
            if (idx >= 0) acts[idx] = act;
            else acts.push(act);
            return { ...m, activities: acts };
          });
        } else if (evt.type === "content" && evt.content) {
          onContent(evt.content);
          updateLast((m) => ({ ...m, content: m.content.trim() ? m.content : "Listo, apliqué el cambio." }));
        } else if (evt.type === "error") {
          setThinking(false);
          updateLast((m) => ({ ...m, content: (m.content ? m.content + "\n\n" : "") + (evt.message ?? "Algo salió mal.") }));
        }
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            handle(JSON.parse(line.slice(5).trim()));
          } catch {
            /* frame malformado */
          }
        }
      }
    },
    [onContent]
  );

  const send = useCallback(
    async (text: string) => {
      if (sending || !token || !text.trim()) return;
      const base: Message[] = [
        ...messages,
        { role: "user", content: text },
        { role: "assistant", content: "", activities: [] },
      ];
      setMessages(base);
      setSending(true);
      setThinking(true);
      try {
        const res = await fetch("/api/site", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            token,
            messages: base.map((m) => ({ role: m.role, content: m.content || "…" })),
            content,
          }),
        });
        if (!res.ok || !res.body) throw new Error("No pude conectar con el editor.");
        await consumeSSE(res.body);
      } catch (e) {
        setMessages((prev) => {
          const next = prev.slice();
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "assistant") {
              next[i] = { ...next[i], content: (e as Error).message };
              break;
            }
          }
          return next;
        });
      } finally {
        setSending(false);
        setThinking(false);
      }
    },
    [sending, token, messages, content, consumeSSE]
  );

  return (
    <div className="pa-chat">
      <div className="pa-chat-scroll">
        {messages.length === 0 ? (
          <div className="pa-chat-hint">
            <p>
              Editá los <b>textos</b> tocándolos directo en el preview. Pedime acá los
              cambios de <b>estructura</b>: reordenar secciones, activar o desactivar una,
              cambiar destinos, la watchlist o la paleta.
            </p>
            <p className="pa-chat-egs">
              Probá: «desactivá la sección de viajes» · «poné la galería antes del cierre».
            </p>
          </div>
        ) : (
          <ChatMessages messages={messages} streaming={sending} thinking={thinking} onOption={send} />
        )}
      </div>
      <div className="pa-chat-footer">
        <ChatComposer onSend={send} disabled={sending} busy={sending} />
      </div>
    </div>
  );
}

// ── flujo MULTIMEDIA (reordenar / agregar / cambiar imágenes) ───────────────────
function MediaFlow({
  convo,
  focus,
  onRebind,
}: {
  convo: UseConversation;
  focus: MediaFocus | null;
  onRebind: () => Promise<void>;
}) {
  const token = convo.token;
  const sections = (convo.plan ? planSectionSlugs(convo.plan) : [])
    .filter((s) => s.section.kind !== "stats")
    .map((s) => ({ category: s.category, title: s.section.title, single: s.section.kind === "hero" || s.section.kind === "closing" }));

  const [rows, setRows] = useState<Doc<"draftPhotos">[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dragFrom = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !isConvexConfigured()) return;
    try {
      setRows(await convexClient().query(api.photos.listDraftPhotos, { draftToken: token }));
    } catch (e) {
      console.error("[media] refresh falló:", e);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // enfoque desde el click en el preview → seleccionar esa sección
  useEffect(() => {
    if (!focus || !sections.length) return;
    const idx = sections.findIndex((s) => s.category === focus.cat);
    if (idx >= 0) setActive(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  if (!sections.length) return <div className="pa-empty">No hay secciones.</div>;
  const s = sections[active];
  const photos = rows.filter((r) => r.category === s.category).sort((a, b) => a.order - b.order);

  const change = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
      await onRebind();
    } catch (e) {
      console.error("[media] cambio falló:", e);
    } finally {
      setBusy(false);
    }
  };

  const upload = (files: FileList) =>
    change(async () => {
      for (const f of Array.from(files)) {
        if (s.single) {
          for (const p of photos) await convexClient().mutation(api.photos.deleteDraftPhoto, { id: p._id });
        }
        if (f.type.startsWith("video/")) await uploadVideo(f, token, s.category);
        else await uploadImage(f, token, s.category);
        if (s.single) break;
      }
    });

  const del = (id: Id<"draftPhotos">) =>
    change(async () => {
      await convexClient().mutation(api.photos.deleteDraftPhoto, { id });
    });

  const reorder = (from: number, to: number) =>
    change(async () => {
      const arr = [...photos];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      await convexClient().mutation(api.photos.reorderDraftPhotos, { ids: arr.map((p) => p._id) });
    });

  return (
    <div className="pa-media">
      <div className="pa-media-tabs">
        {sections.map((sec, i) => (
          <button
            key={sec.category}
            type="button"
            className={`pa-media-tab ${i === active ? "on" : ""}`}
            onClick={() => setActive(i)}
          >
            {sec.title}
          </button>
        ))}
      </div>

      <div className="pa-media-body">
        <button type="button" className="pa-drop" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Trabajando…" : s.single ? "＋ Cambiar imagen o video" : "＋ Agregar fotos o video"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          multiple={!s.single}
          hidden
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />

        {photos.length > 0 && (
          <div className="pa-grid">
            {photos.map((p, i) => (
              <div
                key={p._id}
                className={`pa-thumb ${focus?.slug && p.cloudflareId === focus.slug ? "focused" : ""}`}
                draggable
                onDragStart={() => (dragFrom.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom.current != null) reorder(dragFrom.current, i);
                  dragFrom.current = null;
                }}
              >
                <span className="pa-thumb-num">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbUrl} alt="" loading="lazy" draggable={false} />
                <button type="button" className="pa-thumb-x" aria-label="Quitar" onClick={() => del(p._id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
