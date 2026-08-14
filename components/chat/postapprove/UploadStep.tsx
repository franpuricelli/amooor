"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  UploadStep.tsx — Phase 1: subida de media sección por sección.
//  Rail de secciones (del plan) + uploader de la sección activa. Cambios de UX:
//   - Subidas NO bloqueantes: podés cambiar de sección y seguir cargando; cada
//     sección muestra puntitos que saltan mientras sube.
//   - Cualquier sección acepta FOTOS o VIDEO (se recomienda video donde el plan lo
//     pensó, kind "watch"). hero/closing = un solo slot de imagen.
//   - Grilla reordenable (drag) con NÚMERO de orden visible; la primera va primero.
//   - CTA contextual: "Siguiente" hasta la última sección, después "Crear mi sitio"
//     (sin flecha; design-system: CTA sin ícono).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseConversation } from "@/lib/use-conversation";
import { convexClient, isConvexConfigured } from "@/lib/convex-browser";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { planSectionSlugs } from "@/lib/plan-to-state";
import { uploadImage, uploadVideo } from "@/lib/media-client";
import type { SectionKind } from "@/lib/plan";

type Mode = "single" | "multi";
interface SectionDesc {
  category: string;
  kind: SectionKind;
  title: string;
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
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const didInit = useRef(false);

  const refresh = useCallback(async () => {
    if (!token || !isConvexConfigured()) {
      setReady(true);
      return;
    }
    try {
      const c = convexClient();
      const [p, v] = await Promise.all([
        c.query(api.photos.listDraftPhotos, { draftToken: token }),
        c.query(api.videos.listDraftVideos, { draftToken: token }),
      ]);
      setRows(p);
      setVideos(v);
    } catch (e) {
      console.error("[upload] refresh falló:", e);
    } finally {
      setReady(true);
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

  useEffect(() => {
    if (!ready || didInit.current || !sections.length) return;
    didInit.current = true;
    const idx = sections.findIndex((s) => countOf(s) === 0);
    setActive(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sections]);

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
  const s = sections[active];
  const isLast = active === sections.length - 1;

  return (
    <div className="pa-root pa-up">
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
                  onClick={() => setActive(i)}
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
      </nav>

      <div className="pa-panel">
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
            <button
              type="button"
              className="ch-btn primary"
              onClick={() => setActive((a) => Math.min(a + 1, sections.length - 1))}
            >
              Siguiente
            </button>
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
  const accept = single ? "image/*,video/mp4,video/quicktime,video/webm" : "image/*,video/mp4,video/quicktime,video/webm";

  const intent =
    section.kind === "hero"
      ? "La foto (o video) de portada, lo primero que se ve."
      : section.kind === "closing"
        ? "El dibujo o imagen del cierre (se da vuelta y revela tu mensaje)."
        : "Subí fotos o un video. Arrastrá para reordenar: la primera aparece primero.";

  const pickFiles = () => fileRef.current?.click();

  return (
    <div className="pa-uploader">
      <div className="pa-uploader-head">
        <h2 className="pa-uploader-title">{section.title}</h2>
        <p className="pa-uploader-sub">{intent}</p>
        {section.recommendVideo && (
          <p className="pa-reco">Se recomienda un video en esta sección.</p>
        )}
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
            className={`pa-drop ${single ? "pa-drop-hero" : ""} ${dropZoneOver ? "over" : ""}`}
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
