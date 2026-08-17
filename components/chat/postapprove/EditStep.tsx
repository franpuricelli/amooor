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
import type { PaletteId, Palette } from "@/lib/theme";
import { slugifyCouple } from "@/lib/subdomain";
import { planSectionSlugs } from "@/lib/plan-to-state";
import { mediaFromPhotos, rebindMedia } from "@/lib/generate";
import { uploadImage, uploadVideo } from "@/lib/media-client";
import type { Swatch } from "@/lib/palette-gen";
import type { EditAPI } from "@/lib/edit-context";
import { registerContext, track } from "@/lib/analytics";
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
function ChevronGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function GripGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}
function TrashGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
  // sección visible en el preview (id = category) → Multimedia la sigue al scroll
  const [previewCat, setPreviewCat] = useState<string | null>(null);
  // pedido inverso: al elegir una sección en Multimedia, scrollear el preview
  const [scrollTarget, setScrollTarget] = useState<{ cat: string; nonce: number } | null>(null);
  const pickSection = useCallback((cat: string) => {
    setScrollTarget((prev) => ({ cat, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subdomain = slugifyCouple(content.couple || "tu-sitio");

  // El editor es el "home" post-build: lo marcamos una sola vez por montaje.
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    track("editor_opened", { sections: content.layout?.length ?? 0 });
  }, [content.layout?.length]);

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
  // El guardado va debounceado; el evento de analytics viaja con él para no
  // mandar uno por tecla (sólo el path editado, nunca el texto).
  const scheduleSave = useCallback(
    (c: Content, path?: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (path) track("editor_text_edited", { path });
        void saveContent(c);
      }, 700);
    },
    [saveContent]
  );

  // ── API de edición inline (copy + click imagen) ─────────────────────────────
  const editApi: EditAPI = {
    editing: true,
    onEditText: (path, value) => {
      const next = setByPath(content, path, value);
      onContent(next);
      scheduleSave(next, path);
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
      const [rows, audioRow] = await Promise.all([
        convexClient().query(api.photos.listDraftPhotos, { draftToken: token }),
        convexClient().query(api.audio.getDraftAudio, { draftToken: token }),
      ]);
      const next = parseContent(rebindMedia(content, mediaFromPhotos(rows, audioRow?.src))) as Content;
      onContent(next);
      await convexClient().mutation(api.drafts.save, { token, content: next, status: "ready" });
    } catch (e) {
      console.error("[edit] rebind falló:", e);
    }
  }, [token, content, onContent]);

  // ── paleta (control directo del toolbar del navegador) ──────────────────────
  // custom → guardamos la paleta COMPLETA como overrides (si no, resolvePalette
  // cae a la default y el cambio no se aplica). built-in → sin overrides.
  const onPalette = useCallback(
    (id: string, sw?: Swatch) => {
      const overrides: Partial<Palette> | undefined =
        sw && id.startsWith("custom-") ? sw.palette : undefined;
      // preservá la plantilla elegida (task 2-B): el theme guardado la lleva.
      onTheme({ palette: id as PaletteId, template: theme.template, overrides });
      convo.setPalette(id, overrides);
      track("palette_changed", { palette: id, custom: !!overrides, surface: "editor" });
      registerContext({ palette: id });
      if (token && isConvexConfigured()) {
        void convexClient().mutation(api.drafts.save, {
          token,
          theme: {
            palette: id,
            ...(theme.template ? { template: theme.template } : {}),
            ...(overrides ? { overrides: overrides as Record<string, string> } : {}),
          },
        });
      }
    },
    [onTheme, convo, token, theme.template]
  );

  const toolbar = (
    <div className="pa-tool-palette">
      <PalettePicker
        value={theme.palette}
        custom={convo.customPalettes}
        onSelect={onPalette}
        onCreate={convo.addCustomPalette}
        compact
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
            aria-pressed={tool === "chat"}
            aria-label="Chat"
            onClick={() => {
              setTool("chat");
              setMobilePane("flow");
            }}
          >
            <span className="pa-sidebar-ic">
              <ChatGlyph />
            </span>
            <span className="pa-sidebar-lbl">Chat</span>
          </button>
          <button
            type="button"
            className={`pa-sidebar-btn ${tool === "media" ? "on" : ""}`}
            aria-pressed={tool === "media"}
            aria-label="Multimedia"
            onClick={() => {
              setTool("media");
              setMobilePane("flow");
            }}
          >
            <span className="pa-sidebar-ic">
              <MediaGlyph />
            </span>
            <span className="pa-sidebar-lbl">Multimedia</span>
          </button>
        </nav>

        {/* flujo (izquierda). Chat y Multimedia quedan SIEMPRE montados y se
            alternan con display:none — así el hilo del chat no se pierde al
            cambiar a Multimedia (su estado vive en ChatFlow). */}
        <div className={`pa-flow ${mobilePane === "flow" ? "show" : ""}`}>
          <ChatFlow
            token={token}
            content={content}
            onContent={onContent}
            visible={tool === "chat"}
          />
          <MediaFlow
            convo={convo}
            focus={mediaFocus}
            scrollCat={previewCat}
            onPickSection={pickSection}
            onRebind={rebind}
            visible={tool === "media"}
          />
        </div>

        {/* preview FIJO (derecha) — superficie de edición inline */}
        <div className={`pa-preview-fixed ${mobilePane === "preview" ? "show" : ""}`}>
          <SitePreviewFrame
            content={content}
            theme={theme}
            subdomain={subdomain}
            toolbar={toolbar}
            edit={editApi}
            onVisibleSection={setPreviewCat}
            scrollTo={scrollTarget}
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
  visible,
}: {
  token: string;
  content: Content;
  onContent: (c: Content) => void;
  /** montado siempre; se oculta con display:none cuando no es la herramienta activa */
  visible: boolean;
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
        } else if (evt.type === "message" && evt.message) {
          // el agente repregunta en vez de editar (instrucción ambigua)
          setThinking(false);
          updateLast((m) => ({ ...m, content: (m.content ? m.content + "\n\n" : "") + evt.message }));
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
      const t0 = Date.now();
      track("editor_message_sent", { length: text.trim().length });
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
        track("editor_reply_received", { ms: Date.now() - t0 });
      } catch (e) {
        track("editor_reply_failed", { ms: Date.now() - t0, reason: (e as Error).message });
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
    <div className={`pa-chat ${visible ? "" : "pa-hidden"}`}>
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

// ── flujo MULTIMEDIA (drawer de sección + lista reordenable con preview) ─────────
function MediaFlow({
  convo,
  focus,
  scrollCat,
  onPickSection,
  onRebind,
  visible,
}: {
  convo: UseConversation;
  focus: MediaFocus | null;
  /** sección a la vista en el preview (scroll-spy): Multimedia la sigue */
  scrollCat: string | null;
  /** al elegir una sección acá, pedirle al preview que scrollee hasta ella */
  onPickSection: (cat: string) => void;
  onRebind: () => Promise<void>;
  /** montado siempre; se oculta con display:none cuando no es la herramienta activa */
  visible: boolean;
}) {
  const token = convo.token;
  const sections = (convo.plan ? planSectionSlugs(convo.plan) : [])
    .filter((s) => s.section.kind !== "stats")
    .map((s) => ({
      category: s.category,
      title: s.section.title,
      single: s.section.kind === "hero" || s.section.kind === "closing",
    }));

  const [rows, setRows] = useState<Doc<"draftPhotos">[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // orden LOCAL de la sección activa: se reordena en vivo mientras arrastrás
  // (el componente se ve moviéndose), y se persiste al soltar.
  const [localPhotos, setLocalPhotos] = useState<Doc<"draftPhotos">[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // preview flotante (fixed) al hacer hover sobre una miniatura
  const [zoom, setZoom] = useState<{ url: string; x: number; y: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const dragFrom = useRef<number | null>(null);
  const orderRef = useRef<Doc<"draftPhotos">[] | null>(null);

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

  // scroll-spy: al scrollear el preview, seguir a la sección visible. Va ANTES
  // del efecto de foco para que un click en una imagen (foco explícito) gane si
  // ambos disparan al montar (el efecto declarado después corre último).
  useEffect(() => {
    if (!scrollCat || !sections.length) return;
    const idx = sections.findIndex((s) => s.category === scrollCat);
    if (idx >= 0) setActive(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollCat]);

  // enfoque desde el click en el preview → seleccionar esa sección
  useEffect(() => {
    if (!focus || !sections.length) return;
    const idx = sections.findIndex((s) => s.category === focus.cat);
    if (idx >= 0) setActive(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // cerrar el drawer al tocar afuera
  useEffect(() => {
    if (!drawer) return;
    const onDoc = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setDrawer(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  // sincronizar el orden local con la sección activa (fuera de un drag)
  useEffect(() => {
    const cat = sections[active]?.category;
    setLocalPhotos(
      rows.filter((r) => r.category === cat).sort((a, b) => a.order - b.order)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, active]);

  if (!sections.length)
    return <div className={`pa-empty ${visible ? "" : "pa-hidden"}`}>No hay secciones.</div>;
  const s = sections[active];
  const photos = rows.filter((r) => r.category === s.category).sort((a, b) => a.order - b.order);
  const countFor = (cat: string) => rows.filter((r) => r.category === cat).length;

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

  // mover en vivo dentro del orden local (se ve moverse mientras arrastrás)
  const moveLocal = (from: number, to: number) =>
    setLocalPhotos((arr) => {
      const next = [...arr];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      orderRef.current = next;
      return next;
    });

  const persistOrder = (arr: Doc<"draftPhotos">[]) =>
    change(async () => {
      await convexClient().mutation(api.photos.reorderDraftPhotos, { ids: arr.map((p) => p._id) });
    });

  const pick = () => fileRef.current?.click();

  // lista a mostrar: durante un drag, el orden local (en vivo); si no, el persistido
  const listPhotos = dragIdx !== null ? localPhotos : photos;

  // posición del preview flotante (clampeada al viewport)
  const zoomStyle: React.CSSProperties | undefined = zoom
    ? (() => {
        const W = 260;
        const H = 260;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        let left = zoom.x + 22;
        if (left + W > vw - 8) left = zoom.x - W - 22;
        let top = zoom.y - H / 2;
        top = Math.max(8, Math.min(top, vh - H - 8));
        return { left, top, width: W };
      })()
    : undefined;

  return (
    <div className={`pa-media ${visible ? "" : "pa-hidden"}`}>
      <div className="pa-media-head">
        {/* drawer de sección (una sola opción visible; se despliega al tocar) */}
        <div className="pa-media-drawer" ref={drawerRef}>
          <button
            type="button"
            className={`pa-media-drawer-btn ${drawer ? "open" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={drawer}
            onClick={() => setDrawer((v) => !v)}
          >
            <span className="pa-media-drawer-title">{s.title}</span>
            <ChevronGlyph />
          </button>
          {drawer && (
            <ul className="pa-media-drawer-menu" role="listbox">
              {sections.map((sec, i) => (
                <li key={sec.category}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`pa-media-drawer-item ${i === active ? "on" : ""}`}
                    onClick={() => {
                      setActive(i);
                      setDrawer(false);
                      onPickSection(sec.category); // scrollea el preview a la sección
                    }}
                  >
                    <span className="pa-media-drawer-item-title">{sec.title}</span>
                    <span className="pa-media-drawer-item-n">{countFor(sec.category)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* agregar: botón chico al lado del drawer (no un panel enorme) */}
        <button
          type="button"
          className="pa-media-add"
          onClick={pick}
          disabled={busy}
          title={s.single ? "Cambiar imagen o video" : "Agregar fotos o video"}
        >
          {busy ? <span className="ch-typing pa-load-dots" aria-hidden /> : <PlusGlyph />}
          <span>{s.single ? "Cambiar" : "Agregar"}</span>
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
      </div>

      <div className="pa-media-body">
        {photos.length === 0 ? (
          <div className="pa-media-empty">
            <p>
              Todavía no hay {s.single ? "imagen" : "fotos"} en <b>{s.title}</b>.
            </p>
            <button type="button" className="pa-media-empty-add" onClick={pick} disabled={busy}>
              {s.single ? "Elegir imagen o video" : "Agregar fotos o video"}
            </button>
          </div>
        ) : (
          <ul className="pa-medialist" onMouseLeave={() => setZoom(null)}>
            {listPhotos.map((p, i) => (
              <li
                key={p._id}
                className={`pa-mediarow ${
                  focus?.slug && p.cloudflareId === focus.slug ? "focused" : ""
                } ${dragIdx === i ? "dragging" : ""}`}
                draggable={!s.single}
                onDragStart={(e) => {
                  dragFrom.current = i;
                  orderRef.current = photos;
                  setLocalPhotos(photos);
                  setDragIdx(i);
                  setZoom(null);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnter={() => {
                  // reordenar en vivo: el ítem arrastrado se mueve a esta posición
                  if (dragFrom.current != null && dragFrom.current !== i) {
                    moveLocal(dragFrom.current, i);
                    dragFrom.current = i;
                    setDragIdx(i);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={() => {
                  const finalOrder = orderRef.current;
                  const changed =
                    finalOrder &&
                    finalOrder.some((row, idx) => row._id !== photos[idx]?._id);
                  dragFrom.current = null;
                  orderRef.current = null;
                  setDragIdx(null);
                  if (changed && finalOrder) persistOrder(finalOrder);
                }}
              >
                {!s.single && (
                  <span className="pa-mediarow-grip" aria-hidden>
                    <GripGlyph />
                    <em>{i + 1}</em>
                  </span>
                )}
                <span
                  className="pa-mediarow-thumb"
                  onMouseEnter={(e) => setZoom({ url: p.fullUrl, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setZoom({ url: p.fullUrl, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setZoom(null)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbUrl} alt="" loading="lazy" draggable={false} />
                </span>
                <span className="pa-mediarow-name" title={p.filename || undefined}>
                  {p.filename || p.caption || `Imagen ${i + 1}`}
                </span>
                <span className="pa-mediarow-actions">
                  <button
                    type="button"
                    className="pa-mediarow-del"
                    aria-label="Quitar"
                    onClick={() => del(p._id)}
                    disabled={busy}
                  >
                    <TrashGlyph />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* preview grande flotante (fixed → no lo recorta el scroll del panel) */}
      {zoom && (
        <div className="pa-media-zoom" style={zoomStyle} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom.url} alt="" />
        </div>
      )}
    </div>
  );
}
