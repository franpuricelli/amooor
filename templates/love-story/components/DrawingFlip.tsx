"use client";

import { useState } from "react";
import { BASE } from "@/lib/base";

/** Hand-drawn card in the footer: click to flip it over and reveal the message. */
export default function DrawingFlip() {
  const [flipped, setFlipped] = useState(false);

  // NOTE: the `reveal` class lives on a wrapper whose className never changes,
  // so React doesn't wipe the `in` class that RevealInit adds to the DOM.
  return (
    <div className="reveal drawing-flip-wrap">
      <button
        className="drawing-flip"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "See the drawing · Ver el dibujo" : "Flip the card · Dar vuelta la carta"}
      >
        <span className={`drawing-flip-inner ${flipped ? "flipped" : ""}`}>
          <span className="drawing-card drawing-face drawing-front">
            <img src={`${BASE}/drawing.png`} alt="A drawing of the two of you · Un dibujo de ustedes dos" />
          </span>
          <span className="drawing-card drawing-face drawing-back" aria-hidden={!flipped}>
            <span className="drawing-back-msg">I love you · Te amo</span>
            <span className="drawing-back-from">From · De: {"{your name}"}</span>
          </span>
        </span>
      </button>
    </div>
  );
}
