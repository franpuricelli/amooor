import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Story (Brutalist) — template preview",
  description:
    "Preview of the love-story website template in the bold neo-brutalist style.",
};

/**
 * /template/brutalist — previews the love-story template in the Brutalist style.
 *
 * Same content and components as /template/romantic; only the fonts and the
 * color tokens differ (built with NEXT_PUBLIC_THEME=brutalist). Rendered as a
 * self-contained static export (committed at public/template/brutalist) inside a
 * full-screen iframe so its global CSS stays isolated from amooor.
 *
 * Rebuild the bundle with:
 *   cd templates/love-story
 *   npm install
 *   EXPORT=1 NEXT_PUBLIC_THEME=brutalist NEXT_PUBLIC_BASE_PATH=/template/brutalist npm run build
 *   rm -rf ../../public/template/brutalist && mkdir -p ../../public/template/brutalist
 *   cp -R out/. ../../public/template/brutalist/
 */
export default function BrutalistTemplatePage() {
  return (
    <iframe
      src="/template/brutalist/index.html"
      title="Love Story website template — Brutalist"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 9999,
        background: "#f4efe1",
      }}
    />
  );
}
