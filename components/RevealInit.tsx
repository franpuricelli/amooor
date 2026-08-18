"use client";

import { useEffect, useRef } from "react";

/**
 * Observes every `.reveal` element once and flips it to `.in` when it enters
 * the viewport. Stagger via inline `--reveal-delay`. Keeps sections free to be
 * server components — they only need the class.
 *
 * OJO con el preview del builder: ahí el sitio se renderiza DENTRO de un <iframe>
 * (portal de React, ver SitePreviewFrame). Si buscáramos los `.reveal` en
 * `document` —el documento PADRE— no encontraríamos ninguno y ninguna sección se
 * revelaría nunca: el preview se veía como bloques de color vacíos. Por eso el
 * ancla: nos da el documento donde estamos montados de verdad, y el observer se
 * crea con ESA ventana (si no, su viewport sería el del padre y nada intersecta).
 */
export default function RevealInit() {
  const anchor = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const doc = anchor.current?.ownerDocument ?? document;
    const win = doc.defaultView ?? window;
    const els = Array.from(
      doc.querySelectorAll<HTMLElement>(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      )
    );
    const io = new win.IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <span ref={anchor} hidden aria-hidden="true" />;
}
