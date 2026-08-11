"use client";

import { useEffect } from "react";

/**
 * Observes every `.reveal` element once and flips it to `.in` when it enters
 * the viewport. Stagger via inline `--reveal-delay`. Keeps sections free to be
 * server components — they only need the class.
 */
export default function RevealInit() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      )
    );
    const io = new IntersectionObserver(
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

  return null;
}
