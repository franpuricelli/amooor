"use client";

import { useEffect, useRef } from "react";
import { isEditorial } from "@/lib/theme-tokens";

/**
 * Replaces the cursor with a pink glass pixel-heart on fine-pointer devices
 * (touch keeps the normal behavior). Follows the mouse with a soft lerp and
 * grows over anything clickable. Disabled in the editorial theme, which keeps
 * the native cursor.
 */
export default function HeartCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditorial) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    document.documentElement.classList.add("heart-cursor");

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let scale = 1;
    let pressed = false;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.3;
      y += (ty - y) * 0.3;
      const s = pressed ? scale * 0.82 : scale;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -55%) rotate(-25deg) scale(${s})`;
      raf = requestAnimationFrame(loop);
    };

    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement | null;
      scale = t?.closest("a, button, [role='button']") ? 1.5 : 1;
    };
    const out = () => {
      el.style.opacity = "0";
    };
    const down = () => {
      pressed = true;
    };
    const up = () => {
      pressed = false;
    };

    // besito: clicking on a "random" spot (nothing clickable) blows a kiss
    const kiss = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, [role='button'], input, textarea")) return;
      const k = document.createElement("span");
      k.className = "kiss-pop";
      k.textContent = "💋";
      k.style.left = `${e.clientX}px`;
      k.style.top = `${e.clientY}px`;
      document.body.appendChild(k);
      k.addEventListener("animationend", () => k.remove());
      // the cursor puckers for a beat
      el.classList.add("smooch");
      setTimeout(() => el.classList.remove("smooch"), 450);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", out);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("click", kiss);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", out);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("click", kiss);
      document.documentElement.classList.remove("heart-cursor");
    };
  }, []);

  if (isEditorial) return null;

  return (
    <div ref={ref} className="cursor-heart" aria-hidden>
      <span className="cursor-heart-fill" />
    </div>
  );
}
