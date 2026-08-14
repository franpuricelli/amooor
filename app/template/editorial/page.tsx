import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Story (Editorial) — template preview",
  description:
    "Preview of the love-story website template in the light, fine-art Editorial style.",
};

/**
 * /template/editorial — previews the love-story template in the Editorial style.
 *
 * Same content and components as /template/romantic; only the fonts and the
 * color tokens differ (built with NEXT_PUBLIC_THEME=editorial). Like the
 * romantic preview it ships a full global CSS design system that shares class
 * names with amooor's own globals, so we render it as a self-contained static
 * export (committed at public/template/editorial) inside a full-screen iframe.
 *
 * Source: templates/love-story/. Rebuild the bundle with:
 *   cd templates/love-story
 *   npm install
 *   EXPORT=1 NEXT_PUBLIC_THEME=editorial NEXT_PUBLIC_BASE_PATH=/template/editorial npm run build
 *   rm -rf ../../public/template/editorial && mkdir -p ../../public/template/editorial
 *   cp -R out/. ../../public/template/editorial/
 */
export default function EditorialTemplatePage() {
  return (
    <iframe
      src="/template/editorial/index.html"
      title="Love Story website template — Editorial"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 9999,
        background: "#f3f0ea",
      }}
    />
  );
}
