"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Markdown.tsx — render de markdown para los mensajes del agente (H1–H3, bold,
//  itálica, listas, links, código, citas), estilado con el design system de
//  amooor (clases .ch-md, tipografía Inter, acentos rosa). Enfoque de
//  assistant-ui adaptado a nuestro CSS (sin Tailwind). Tolera markdown incompleto
//  mientras streamea, así que se puede renderizar en vivo.
// ─────────────────────────────────────────────────────────────────────────────

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="ch-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
