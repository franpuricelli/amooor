import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Story (Noir) — template preview",
  description:
    "Preview of the love-story website template in the dark + gold Noir style.",
};

/**
 * /template/noir — previews the love-story template in the Noir style.
 *
 * Same content and components as /template/romantic; only the fonts and the
 * color tokens differ (built with NEXT_PUBLIC_THEME=noir). Like the romantic
 * preview it ships a full global CSS design system that shares class names with
 * amooor's own globals, so we render it as a self-contained static export
 * (committed at public/template/noir) inside a full-screen iframe.
 *
 * Source: templates/love-story/. Rebuild the bundle with:
 *   cd templates/love-story
 *   npm install
 *   EXPORT=1 NEXT_PUBLIC_THEME=noir NEXT_PUBLIC_BASE_PATH=/template/noir npm run build
 *   rm -rf ../../public/template/noir && mkdir -p ../../public/template/noir
 *   cp -R out/. ../../public/template/noir/
 */
export default function NoirTemplatePage() {
  return (
    <iframe
      src="/template/noir/index.html"
      title="Love Story website template — Noir"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 9999,
        background: "#0c0c10",
      }}
    />
  );
}
