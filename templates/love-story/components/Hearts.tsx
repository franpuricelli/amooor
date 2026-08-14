"use client";

import { heartFills as fills } from "@/lib/theme-tokens";

/**
 * 8-bit pixel hearts drifting up behind the hero. Positions/timings are
 * derived from the index (no Math.random) so SSR and client render
 * identically — no hydration mismatch. Purely decorative.
 */
const COUNT = 18;

const hearts = Array.from({ length: COUNT }, (_, i) => {
  // spread across the width with a golden-ratio step so they don't line up
  const left = ((i * 61.8) % 100).toFixed(2);
  const size = 14 + ((i * 13) % 26); // 14–40px
  const delay = ((i * 0.77) % 7).toFixed(2); // 0–7s
  const dur = (8 + ((i * 1.9) % 8)).toFixed(2); // 8–16s
  const opacity = (0.25 + ((i * 7) % 30) / 100).toFixed(2); // 0.25–0.55
  const tone = i % 3; // 0 white-ish, 1 hot pink, 2 soft pink
  return { left, size, delay, dur, opacity, tone };
});

// Classic 8-bit heart on a 9×8 grid: per row, [x, width] runs of filled cells.
const ROWS: [number, number][][] = [
  [[1, 2], [6, 2]],
  [[0, 4], [5, 4]],
  [[0, 9]],
  [[0, 9]],
  [[1, 7]],
  [[2, 5]],
  [[3, 3]],
  [[4, 1]],
];

/** Reusable 8-bit heart sprite. */
export function PixelHeart({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 9 8" width="100%" height="100%" shapeRendering="crispEdges">
      {ROWS.flatMap((row, y) =>
        row.map(([x, w], j) => (
          <rect key={`${y}-${j}`} x={x} y={y} width={w} height={1} fill={fill} />
        ))
      )}
    </svg>
  );
}

export default function Hearts() {
  return (
    <div className="hearts" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="heart"
          style={
            {
              left: `${h.left}%`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.dur}s`,
              "--o": h.opacity,
            } as React.CSSProperties
          }
        >
          <PixelHeart fill={fills[h.tone]} />
        </span>
      ))}
    </div>
  );
}
