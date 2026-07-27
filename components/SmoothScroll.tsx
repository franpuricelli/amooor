"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay perfectly in sync (no jitter on pinned/scrubbed sections).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
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
  }, []);

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
