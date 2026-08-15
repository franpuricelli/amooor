"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  UploadStep.tsx — Phase 1: subida de media sección por sección.
//  Layout de dos paneles (como el editor):
//   - IZQUIERDA: rail de secciones + el uploader de UNA sección a la vez (la
//     activa). Subidas NO bloqueantes: podés cambiar de sección y seguir cargando.
//   - DERECHA: el PREVIEW VIVO del sitio (SitePreviewFrame), generado de forma
//     determinista desde el plan + las fotos ya subidas + la paleta elegida. Al
//     navegar una sección (rail o "Siguiente") el preview scrollea hasta ella, y al
//     scrollear el preview se resalta la sección en el rail.
//   - hero/closing = un solo slot de imagen; el resto acepta varias fotos o video.
//   - Mobile: una pill "Previsualizar" alterna el uploader ↔ el preview.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseConversation } from "@/lib/use-conversation";
import { convexClient, isConvexConfigured } from "@/lib/convex-browser";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { planSectionSlugs, planToWizardState } from "@/lib/plan-to-state";
import { generateContent, mediaFromPhotos } from "@/lib/generate";
import { uploadImage, uploadVideo, uploadAudio } from "@/lib/media-client";
import { slugifyCouple } from "@/lib/subdomain";
import type { SectionKind } from "@/lib/plan";
import type { Theme } from "@/lib/template";
import type { PaletteId } from "@/lib/theme";
import SitePreviewFrame from "./SitePreviewFrame";

type Mode = "single" | "multi";
interface SectionDesc {
  category: string;
  kind: SectionKind;
  title: string;
  /** la intención de la sección del plan (qué muestra y por qué) */
  intent: string;
  mode: Mode;
  /** el plan pensó esta sección para un video (se recomienda) */
  recommendVideo: boolean;
}

function buildSections(convo: UseConversation): SectionDesc[] {
  if (!convo.plan) return [];
  const out: SectionDesc[] = [];
  for (const { section, category } of planSectionSlugs(convo.plan)) {
    if (section.kind === "stats") continue; // stats no lleva media
    const single = section.kind === "hero" || section.kind === "closing";
    out.push({
      category,
      kind: section.kind,
      title: section.title,
      intent: section.intent,
      mode: single ? "single" : "multi",
      recommendVideo: section.kind === "watch",
    });
  }
  return out;
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4 10-11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LoadDots() {
  return (
    <span className="ch-typing pa-load-dots" aria-label="subiendo">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function UploadStep({
  convo,
  onCreate,
  hasBuild = false,
}: {
  convo: UseConversation;
  onCreate: () => void;
  hasBuild?: boolean;
}) {
  const token = convo.token;
  const sections = useMemo(() => buildSections(convo), [convo]);
  const [rows, setRows] = useState<Doc<"draftPhotos">[]>([]);
  const [videos, setVideos] = useState<Doc<"draftVideos">[]>([]);
  // música de fondo del sitio (mp3 opcional que toca el ❤ del navbar)
  const [audio, setAudio] = useState<Doc<"draftAudio"> | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"upload" | "preview">("upload");
  // pedido de scroll para el preview (nonce fuerza re-scroll a la misma sección)
  const [scrollTarget, setScrollTarget] = useState<{ cat: string; nonce: number } | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !isConvexConfigured()) return;
    try {
      const c = convexClient();
      const [p, v, a] = await Promise.all([
        c.query(api.photos.listDraftPhotos, { draftToken: token }),
        c.query(api.videos.listDraftVideos, { draftToken: token }),
        c.query(api.audio.getDraftAudio, { draftToken: token }),
      ]);
      setRows(p);
      setVideos(v);
      setAudio(a);
    } catch (e) {
      console.error("[upload] refresh falló:", e);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const photosOf = useCallback(
    (cat: string) => rows.filter((r) => r.category === cat).sort((a, b) => a.order - b.order),
    [rows]
  );
  const videoOf = useCallback(
    (cat: string) => videos.find((v) => v.category === cat) ?? null,
    [videos]
  );
  const countOf = useCallback(
    (s: SectionDesc) => photosOf(s.category).length + (videoOf(s.category) ? 1 : 0),
    [photosOf, videoOf]
  );

  // ── preview vivo (derecha) ──────────────────────────────────────────────────
  //  Content determinista desde el plan + las fotos ya subidas + la paleta. Sin
  //  fotos, cae al template de muestra; a medida que subís, tus fotos lo llenan.
  //  Los ids de sección del layout generado = las categorías del rail → el scroll
  //  y el resaltado quedan sincronizados.
  const media = useMemo(
    () =>
      mediaFromPhotos(
        rows.map((r) => ({
          category: r.category,
          cloudflareId: r.cloudflareId,
          thumbUrl: r.thumbUrl,
          fullUrl: r.fullUrl,
          order: r.order,
        })),
        audio?.src
      ),
    [rows, audio]
  );
  const previewContent = useMemo(() => {
    if (!convo.plan) return null;
    return generateContent({ state: planToWizardState(convo.plan, convo.palette), media });
  }, [convo.plan, convo.palette, media]);
  const theme: Theme = useMemo(() => {
    const overrides = convo.palette.startsWith("custom-")
      ? convo.customPalettes.find((s) => s.id === convo.palette)?.palette
      : undefined;
    return { palette: convo.palette as PaletteId, overrides };
  }, [convo.palette, convo.customPalettes]);
  const subdomain = slugifyCouple(
    (convo.plan?.names ?? []).filter(Boolean).join(" & ") || "tu-sitio"
  );

  // el cierre no es una <section> del layout: vive en footer#closing.
  const scrollIdOf = (s: SectionDesc) => (s.kind === "closing" ? "closing" : s.category);

  // navegar a la sección i: resalta el rail y scrollea el preview hasta ella
  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= sections.length) return;
      setActive(i);
      setScrollTarget((prev) => ({ cat: scrollIdOf(sections[i]), nonce: (prev?.nonce ?? 0) + 1 }));
    },
    [sections]
  );
  // preview → rail: al scrollear el preview, seguir la sección visible
  const onVisibleSection = useCallback(
    (id: string) => {
      const i =
        id === "closing"
          ? sections.findIndex((s) => s.kind === "closing")
          : sections.findIndex((s) => s.category === id);
      if (i >= 0) setActive(i);
    },
    [sections]
  );

  // ── subida NO bloqueante ────────────────────────────────────────────────────
  const bump = (cat: string, d: number) =>
    setPending((p) => ({ ...p, [cat]: Math.max(0, (p[cat] ?? 0) + d) }));

  const uploadFiles = useCallback(
    (files: FileList | File[], category: string, single: boolean) => {
      setErr(null);
      const list = Array.from(files);
      (async () => {
        // slot único: reemplazar (borrar lo previo) antes de subir el nuevo
        if (single) {
          const f = list[0];
          if (!f) return;
          bump(category, 1);
          try {
            for (const p of photosOf(category))
              await convexClient().mutation(api.photos.deleteDraftPhoto, { id: p._id });
            const v = videoOf(category);
            if (v) await convexClient().mutation(api.videos.deleteDraftVideo, { id: v._id });
            if (f.type.startsWith("video/")) await uploadVideo(f, token, category);
            else await uploadImage(f, token, category);
          } catch (e) {
            setErr((e as Error).message);
          } finally {
            bump(category, -1);
            await refresh();
          }
          return;
        }
        // multi: cada archivo en paralelo, sin bloquear la UI
        for (const f of list) {
          bump(category, 1);
          const job = f.type.startsWith("video/")
            ? uploadVideo(f, token, category)
            : uploadImage(f, token, category);
          job
            .catch((e) => setErr((e as Error).message))
            .finally(async () => {
              bump(category, -1);
              await refresh();
            });
        }
      })();
    },
    [photosOf, videoOf, token, refresh]
  );

  const del = async (id: Id<"draftPhotos">) => {
    await convexClient().mutation(api.photos.deleteDraftPhoto, { id });
    await refresh();
  };
  const delVideo = async (id: Id<"draftVideos">) => {
    await convexClient().mutation(api.videos.deleteDraftVideo, { id });
    await refresh();
  };

  // ── música de fondo (mp3): subir / quitar ───────────────────────────────────
  const pickAudio = () => audioRef.current?.click();
  const onAudioFile = useCallback(
    (file: File) => {
      setErr(null);
      setAudioBusy(true);
      (async () => {
        try {
          await uploadAudio(file, token);
        } catch (e) {
          setErr((e as Error).message);
        } finally {
          setAudioBusy(false);
          await refresh();
        }
      })();
    },
    [token, refresh]
  );
  const removeAudio = useCallback(async () => {
    if (!isConvexConfigured()) return;
    setAudioBusy(true);
    try {
      await convexClient().mutation(api.audio.deleteDraftAudio, { draftToken: token });
    } catch (e) {
      console.error("[upload] quitar música falló:", e);
    } finally {
      setAudioBusy(false);
      await refresh();
    }
  }, [token, refresh]);

  const reorder = async (cat: string, from: number, to: number) => {
    const arr = photosOf(cat);
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    const orderById = new Map(arr.map((p, i) => [p._id, i]));
    setRows((prev) =>
      prev.map((r) => (orderById.has(r._id) ? { ...r, order: orderById.get(r._id)! } : r))
    );
    try {
      await convexClient().mutation(api.photos.reorderDraftPhotos, { ids: arr.map((p) => p._id) });
    } catch (e) {
      console.error("[upload] reorder falló:", e);
      await refresh();
    }
  };

  if (!sections.length) {
    return (
      <div className="pa-root">
        <div className="pa-empty">No hay plan cargado. Volvé al chat.</div>
      </div>
    );
  }

  const withMedia = sections.filter((s) => countOf(s) > 0).length;
  const isLast = active === sections.length - 1;
  const s = sections[active];

  return (
    <div className="pa-root pa-up">
      {/* pill mobile para alternar uploader ↔ preview */}
      <div className="pa-mobilebar">
        <button
          type="button"
          className="pa-preview-toggle"
          onClick={() => setMobilePane((p) => (p === "upload" ? "preview" : "upload"))}
        >
          {mobilePane === "upload" ? "Previsualizar" : "Volver a subir"}
        </button>
      </div>

      <div className="pa-up-body">
        <nav className="pa-rail" aria-label="Secciones">
          <p className="pa-rail-title">Tu sitio, por secciones</p>
          <ul className="pa-rail-list">
            {sections.map((sec, i) => {
              const n = countOf(sec);
              const loading = (pending[sec.category] ?? 0) > 0;
              return (
                <li key={sec.category}>
                  <button
                    type="button"
                    className={`pa-rail-row ${i === active ? "on" : ""}`}
                    onClick={() => goTo(i)}
                  >
                    <span className="pa-rail-label">{sec.title}</span>
                    {loading ? (
                      <LoadDots />
                    ) : (
                      <>
                        {n > 0 && <span className="pa-badge">{n}</span>}
                        {n > 0 && (
                          <span className="pa-rail-check" aria-label="con media">
                            <Check />
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* música de fondo del sitio: el mp3 que toca el ❤ del navbar al abrir */}
          <div className="pa-rail-music">
            <p className="pa-rail-music-title">Música de fondo</p>
            <p className="pa-rail-music-sub">
              Un MP3 que suena al abrir el sitio, en el ❤ del navbar.
            </p>
            {audio ? (
              <div className="pa-rail-music-has">
                <div className="pa-rail-music-file">
                  <span className="pa-rail-music-name" title={audio.filename || undefined}>
                    🎵 {audio.filename || "tu-cancion.mp3"}
                  </span>
                  <button
                    type="button"
                    className="pa-rail-music-x"
                    aria-label="Quitar la música"
                    onClick={removeAudio}
                    disabled={audioBusy}
                  >
                    ✕
                  </button>
                </div>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio className="pa-rail-music-player" src={audio.src} controls preload="none" />
              </div>
            ) : (
              <button
                type="button"
                className="pa-rail-music-add"
                onClick={pickAudio}
                disabled={audioBusy}
              >
                {audioBusy ? <LoadDots /> : "＋ Subir MP3"}
              </button>
            )}
            <input
              ref={audioRef}
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAudioFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </nav>

        {/* izquierda: el uploader de la sección activa (una a la vez) */}
        <div className={`pa-panel pa-pane-left ${mobilePane === "upload" ? "show" : ""}`}>
          <div className="pa-panel-scroll">
            <ActiveUploader
              key={s.category}
              section={s}
              photos={photosOf(s.category)}
              video={videoOf(s.category)}
              uploading={(pending[s.category] ?? 0) > 0}
              onFiles={(files) => uploadFiles(files, s.category, s.mode === "single")}
              onDelete={del}
              onDeleteVideo={delVideo}
              onReorder={(from, to) => reorder(s.category, from, to)}
            />
            {err && <div className="ch-error">{err}</div>}
          </div>

          <div className="pa-cta">
            <span className="pa-cta-progress">
              {withMedia} de {sections.length} secciones con media
            </span>
            {isLast ? (
              <button type="button" className="ch-btn primary" onClick={onCreate}>
                {hasBuild ? "Volver al editor" : "Crear mi sitio"}
              </button>
            ) : (
              <button type="button" className="ch-btn primary" onClick={() => goTo(active + 1)}>
                Siguiente
              </button>
            )}
          </div>
        </div>

        {/* derecha: el preview vivo del sitio */}
        <div className={`pa-up-preview pa-pane-right ${mobilePane === "preview" ? "show" : ""}`}>
          {previewContent && (
            <SitePreviewFrame
              content={previewContent}
              theme={theme}
              subdomain={subdomain}
              scrollTo={scrollTarget}
              onVisibleSection={onVisibleSection}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── uploader de una sección ────────────────────────────────────────────────────
function ActiveUploader({
  section,
  photos,
  video,
  uploading,
  onFiles,
  onDelete,
  onDeleteVideo,
  onReorder,
}: {
  section: SectionDesc;
  photos: Doc<"draftPhotos">[];
  video: Doc<"draftVideos"> | null;
  uploading: boolean;
  onFiles: (files: FileList | File[]) => void;
  onDelete: (id: Id<"draftPhotos">) => void;
  onDeleteVideo: (id: Id<"draftVideos">) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dropZoneOver, setDropZoneOver] = useState(false);

  const single = section.mode === "single";
  const accept = "image/*,video/mp4,video/quicktime,video/webm";

  // copy = la intención de la sección del plan (qué es y qué mostrar). Si el plan no
  // la trae, caemos a un texto por tipo de bloque.
  const fallbackByKind =
    section.kind === "hero"
      ? "La portada: la foto (o video) principal, lo primero que se ve."
      : section.kind === "closing"
        ? "El cierre del sitio: una foto de ustedes para el final."
        : section.kind === "gallery"
          ? "Todas las fotos que quieras sumar al muro de recuerdos."
          : "Las fotos (o un video) que cuentan esta parte de la historia.";
  const desc = section.intent?.trim() || fallbackByKind;

  const pickFiles = () => fileRef.current?.click();

  return (
    <div className="pa-uploader" data-cat={section.category}>
      <div className="pa-uploader-head">
        <div className="pa-uploader-headtext">
          <h2 className="pa-uploader-title">{section.title}</h2>
          <p className="pa-uploader-sub">{desc}</p>
          {section.recommendVideo && (
            <p className="pa-reco">📹 Se recomienda un video en esta sección.</p>
          )}
          {section.kind === "closing" && (
            <p className="pa-reco">
              ✏️ Con esta foto creamos un dibujo (estilo ilustración) para el cierre, que
              se da vuelta y revela tu mensaje.
            </p>
          )}
        </div>
      </div>

      {single && (photos[0] || video) ? (
        <div className="pa-hero-slot">
          {video ? (
            <video className="pa-video" src={video.src} poster={video.poster ?? undefined} controls playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[0].fullUrl} alt="" className="pa-hero-img" />
          )}
          <button
            type="button"
            className="pa-thumb-x"
            aria-label="Quitar"
            onClick={() => (video ? onDeleteVideo(video._id) : onDelete(photos[0]._id))}
          >
            ✕
          </button>
          <div className="pa-slot-actions">
            <button type="button" className="ch-btn ghost sm" onClick={pickFiles}>
              Reemplazar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`pa-drop pa-drop-sm ${single ? "pa-drop-hero" : ""} ${dropZoneOver ? "over" : ""}`}
            role="button"
            tabIndex={0}
            onClick={pickFiles}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pickFiles()}
            onDragOver={(e) => {
              e.preventDefault();
              setDropZoneOver(true);
            }}
            onDragLeave={() => setDropZoneOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDropZoneOver(false);
              if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
            }}
          >
            {uploading ? (
              <span className="pa-drop-loading">
                Subiendo <LoadDots />
              </span>
            ) : single ? (
              "＋ Subí una foto o video"
            ) : (
              "＋ Elegí o arrastrá fotos o un video"
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            multiple={!single}
            hidden
            onChange={(e) => {
              if (e.target.files?.length) onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </>
      )}

      {/* grilla de fotos (multi) con número de orden + reorder */}
      {!single && photos.length > 0 && (
        <div className="pa-grid">
          {photos.map((p, i) => (
            <div
              key={p._id}
              className={`pa-thumb ${dragOver === i ? "drop-target" : ""}`}
              draggable
              onDragStart={(e) => {
                dragFrom.current = i;
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(i);
              }}
              onDragLeave={() => setDragOver((cur) => (cur === i ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom.current != null) onReorder(dragFrom.current, i);
                dragFrom.current = null;
                setDragOver(null);
              }}
              onDragEnd={() => {
                dragFrom.current = null;
                setDragOver(null);
              }}
            >
              <span className="pa-thumb-num">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbUrl} alt="" loading="lazy" draggable={false} />
              <button type="button" className="pa-thumb-x" aria-label="Quitar" onClick={() => onDelete(p._id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* video de la sección (multi) — además de las fotos */}
      {!single && video && (
        <div className="pa-video-slot pa-video-inline">
          <video className="pa-video" src={video.src} poster={video.poster ?? undefined} controls playsInline />
          <div className="pa-slot-actions">
            <button type="button" className="ch-btn ghost sm" onClick={() => onDeleteVideo(video._id)}>
              Quitar video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
