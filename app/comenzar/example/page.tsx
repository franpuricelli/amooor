"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /comenzar/example?section=<ancla>&palette=<id> — render VIVO del template
//  (Puri & Ivi, el default de la codebase) para usar de EJEMPLO por sección en el
//  paso de subida. Se embebe en un <iframe> y se scrollea a la sección activa.
//  Las fotos del ejemplo viven en el deployment de purivi.love (no en el repo), así
//  que acá caen a un placeholder suave (ver example.css) sin romper el layout.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import PreviewSite from "@/components/wizard/PreviewSite";
import { content as defaultContent } from "@/lib/content";
import type { Theme } from "@/lib/template";
import type { PaletteId } from "@/lib/theme";
import "./example.css";

export const dynamic = "force-dynamic";

const PALETTES = ["rosa", "durazno", "lavanda", "menta", "cielo"];

export default function ExamplePage() {
  const [palette, setPalette] = useState<PaletteId>("rosa");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pal = p.get("palette");
    if (pal && PALETTES.includes(pal)) setPalette(pal as PaletteId);
    const sec = p.get("section");
    if (sec) {
      // dejamos pintar el primer frame antes de scrollear a la sección
      requestAnimationFrame(() => {
        const el = document.getElementById(sec);
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
        else if (sec === "footer") window.scrollTo(0, document.body.scrollHeight);
      });
    }
  }, []);

  const theme: Theme = { palette };
  return (
    <div className="pa-example-page">
      <PreviewSite content={defaultContent} theme={theme} />
    </div>
  );
}
