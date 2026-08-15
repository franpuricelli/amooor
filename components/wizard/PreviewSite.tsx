"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PreviewSite.tsx — renderiza el sitio de un draft (WP-3, paso Review) con el
//  content + theme generados, sin ser un tenant real. Reusa el mismo render que
//  la home (SECTION_REGISTRY) envuelto en su propio TenantProvider + paleta local.
// ─────────────────────────────────────────────────────────────────────────────

import SmoothScroll from "@/components/SmoothScroll";
import RevealInit from "@/components/RevealInit";
import LightboxProvider from "@/components/Lightbox";
import Footer from "@/components/Footer";
import { TenantProvider } from "@/lib/tenant";
import { EditProvider, type EditAPI } from "@/lib/edit-context";
import { SECTION_REGISTRY } from "@/components/sections/registry";
import { resolvePalette, paletteVars } from "@/lib/theme";
import { fontVariables } from "@/app/fonts";
import type { Content } from "@/lib/content";
import type { Theme } from "@/lib/template";

export default function PreviewSite({
  content,
  theme,
  edit,
  framed = false,
}: {
  content: Content;
  theme: Theme;
  /** si viene, el sitio se renderiza en modo edición (copy editable + click imagen) */
  edit?: EditAPI;
  /** el preview vive dentro de un contenedor con scroll propio (SitePreviewFrame):
   *  desactiva Lenis para usar el scroll nativo del contenedor. */
  framed?: boolean;
}) {
  const paletteStyle = paletteVars(resolvePalette(theme)) as React.CSSProperties;

  const tree = (
    <TenantProvider content={content}>
      {/* Dentro de un frame con scroll propio (.pa-frame-body) desactivamos Lenis y
          usamos el scroll nativo: Lenis con `root` toma el scroll del documento y
          pelea con ese contenedor anidado (el trackpad rompe el scroll). */}
      <SmoothScroll enabled={!edit && !framed}>
        <LightboxProvider>
          <RevealInit />
          <main>
            {content.layout
              .filter((s) => s.enabled)
              .map((s) => {
                const Section = SECTION_REGISTRY[s.type];
                return Section ? <Section key={s.id} id={s.id} /> : null;
              })}
          </main>
          <Footer />
        </LightboxProvider>
      </SmoothScroll>
    </TenantProvider>
  );

  // La plantilla elegida (task 2-B) se aplica como `[data-template]` sobre este
  // root: su CSS (app/globals.css) re-estiliza tipografía/bordes/tratamiento. Las
  // vars de fuente viajan con el div, así el skin rinde igual en escritorio
  // (in-tree) y en el <iframe> celular (portal) de SitePreviewFrame.
  return (
    <div
      className={fontVariables}
      data-template={theme.template ?? "romantic"}
      style={paletteStyle}
    >
      {edit ? <EditProvider value={edit}>{tree}</EditProvider> : tree}
    </div>
  );
}
