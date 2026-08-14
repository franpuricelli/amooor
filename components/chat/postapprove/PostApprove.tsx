"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PostApprove.tsx — la máquina de pasos post-aprobación (reemplaza al ApprovedStub).
//  upload → build → edit. Reusa el header/brand/barra de progreso del chat (viven
//  en Chat.tsx); esto ocupa el área debajo del header.
//
//  Restauración al recargar (derivada del draft, spec §Additional states):
//    tiene `content` → edit;  aprobado sin `content` → upload.
//  Phase 3 (edit) arranca cuando el primer build termina; después el editor es el
//  home y se puede volver a "Agregar más fotos".
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type { UseConversation } from "@/lib/use-conversation";
import { convexClient, isConvexConfigured } from "@/lib/convex-browser";
import { api } from "@/convex/_generated/api";
import type { Content } from "@/lib/content";
import { parseContent, type Theme } from "@/lib/template";
import type { PaletteId } from "@/lib/theme";
import { mediaFromPhotos, rebindMedia } from "@/lib/generate";
import UploadStep from "./UploadStep";
import BuildStep from "./BuildStep";
import EditStep from "./EditStep";

export type Step = "upload" | "build" | "edit";

export default function PostApprove({
  convo,
  onStep,
}: {
  convo: UseConversation;
  /** avisa el paso actual al header (para el stepper de etapas) */
  onStep?: (step: Step | null) => void;
}) {
  const [step, setStep] = useState<Step | null>(null); // null = hidratando
  const [content, setContent] = useState<Content | null>(null);
  const [theme, setTheme] = useState<Theme>({ palette: convo.palette as PaletteId });

  useEffect(() => {
    onStep?.(step);
  }, [step, onStep]);

  // ── restauración del paso al montar ─────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!convo.token || !isConvexConfigured()) {
        if (alive) setStep("upload");
        return;
      }
      try {
        const draft = await convexClient().query(api.drafts.get, {
          token: convo.token,
        });
        if (!alive) return;
        if (draft?.content) {
          setContent(draft.content as Content);
          setTheme((draft.theme as Theme) ?? { palette: convo.palette as PaletteId });
          setStep("edit");
        } else {
          setStep("upload");
        }
      } catch {
        if (alive) setStep("upload");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convo.token]);

  const onBuilt = useCallback((c: Content, t: Theme) => {
    setContent(c);
    setTheme(t);
    setStep("edit");
  }, []);

  // Terminar la subida. Primer build → genera (build step). Si YA hay un build,
  // sólo RE-ATA las fotos (rebindMedia): nunca re-generamos, así el copy editado no
  // se pisa (spec: generateContent corre una sola vez).
  const finishUpload = useCallback(async () => {
    if (!content) {
      setStep("build");
      return;
    }
    if (convo.token && isConvexConfigured()) {
      try {
        const rows = await convexClient().query(api.photos.listDraftPhotos, {
          draftToken: convo.token,
        });
        const next = parseContent(rebindMedia(content, mediaFromPhotos(rows)));
        setContent(next as Content);
        await convexClient().mutation(api.drafts.save, {
          token: convo.token,
          content: next,
          status: "ready",
        });
      } catch (e) {
        console.error("[postapprove] rebind falló:", e);
      }
    }
    setStep("edit");
  }, [content, convo.token]);

  if (step === null) return <div className="pa-root" />;

  if (step === "upload") {
    return (
      <UploadStep convo={convo} onCreate={finishUpload} hasBuild={!!content} />
    );
  }

  if (step === "build") {
    return (
      <BuildStep
        token={convo.token}
        onBuilt={onBuilt}
        onRetry={() => setStep("upload")}
      />
    );
  }

  return (
    <EditStep
      convo={convo}
      content={content!}
      theme={theme}
      onContent={setContent}
      onTheme={setTheme}
      onAddMore={() => setStep("upload")}
    />
  );
}
