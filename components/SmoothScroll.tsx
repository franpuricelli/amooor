"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay perfectly in sync (no jitter on pinned/scrubbed sections).
 *
 * `enabled=false` renderiza el árbol SIN Lenis: usado por el preview del editor,
 * que vive dentro de un contenedor con `overflow` propio. Lenis con `root` toma
 * el scroll del documento y pelea con ese contenedor anidado (el trackpad rompe
 * el scroll); ahí queremos el scroll nativo del `.pa-frame-body`. `useLenis()` en
 * las secciones devuelve undefined sin provider y ya usan `?.`, así que es seguro.
 */
export default function SmoothScroll({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (!enabled) return;
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    // let images/layout settle, then recalc trigger positions
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
      clearTimeout(t);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ lerp: 0.09, smoothWheel: true, autoRaf: false, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}
