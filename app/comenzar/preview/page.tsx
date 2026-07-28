"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /comenzar/preview?draft=<token> — el preview del sitio de un draft (WP-3).
//  Se abre dentro de un <iframe> en el paso Review. Genera/lee el content del
//  draft y lo renderiza como si fuera el sitio final.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import PreviewSite from "@/components/wizard/PreviewSite";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";

export default function PreviewPage() {
  const [data, setData] = useState<{ content: Content; theme: Theme } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("draft");
    if (!token) {
      setError(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ draftToken: token, mode: "preview" }),
        });
        if (!res.ok) throw new Error("preview failed");
        const json = await res.json();
        setData({ content: json.content, theme: json.theme });
      } catch {
        setError(true);
      }
    })();
  }, []);

  if (error)
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        No se pudo cargar el preview. Volvé al wizard e intentá de nuevo.
      </div>
    );
  if (!data)
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>Generando tu sitio…</div>
    );

  return <PreviewSite content={data.content} theme={data.theme} />;
}
