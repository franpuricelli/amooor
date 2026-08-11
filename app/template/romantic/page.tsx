import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Story — template preview",
  description: "Preview of the fill-in-the-blank love-story website template.",
};

/**
 * /template/romantic — previews the standalone love-story template.
 *
 * The template ships a full global CSS design system (and shares class names
 * like `.hero`, `.h2`, `.chip` with amooor's own globals), so we render it as a
 * self-contained static export (committed at public/template/romantic) inside a
 * full-screen iframe. That keeps its CSS/JS/fonts fully isolated from amooor.
 *
 * Source: templates/love-story/. Rebuild the bundle with:
 *   cd templates/love-story
 *   npm install
 *   EXPORT=1 NEXT_PUBLIC_BASE_PATH=/template/romantic npm run build
 *   rm -rf ../../public/template/romantic && mkdir -p ../../public/template/romantic
 *   cp -R out/. ../../public/template/romantic/
 */
export default function RomanticTemplatePage() {
  return (
    <iframe
      src="/template/romantic/index.html"
      title="Love Story website template"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 9999,
        background: "#fff",
      }}
    />
  );
}
