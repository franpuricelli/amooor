"use client";

import { useState } from "react";
import { content } from "@/lib/content";

/** Hand-drawn card in the footer: click to flip it over and reveal the message. */
export default function DrawingFlip() {
  const [flipped, setFlipped] = useState(false);
  const { drawing } = content;

  // NOTE: the `reveal` class lives on a wrapper whose className never changes,
  // so React doesn't wipe the `in` class that RevealInit adds to the DOM.
  return (
    <div className="reveal drawing-flip-wrap">
      <button
        className="drawing-flip"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? drawing.backAria : drawing.frontAria}
      >
        <span className={`drawing-flip-inner ${flipped ? "flipped" : ""}`}>
          <span className="drawing-card drawing-face drawing-front">
            <img src={drawing.src} alt={drawing.alt} />
          </span>
          <span className="drawing-card drawing-face drawing-back" aria-hidden={!flipped}>
            <span className="drawing-back-msg">{drawing.message}</span>
            <span className="drawing-back-from">{drawing.from}</span>
          </span>
        </span>
      </button>
    </div>
  );
}
