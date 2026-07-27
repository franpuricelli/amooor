"use client";

import { useState } from "react";

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
        aria-label={flipped ? "Ver el dibujo" : "Dar vuelta la carta"}
      >
        <span className={`drawing-flip-inner ${flipped ? "flipped" : ""}`}>
          <span className="drawing-card drawing-face drawing-front">
            <img src="/drawing.png" alt="Nosotros dos, dibujados" />
          </span>
          <span className="drawing-card drawing-face drawing-back" aria-hidden={!flipped}>
            <span className="drawing-back-msg">Te amo</span>
            <span className="drawing-back-from">De: Fran</span>
          </span>
        </span>
      </button>
    </div>
  );
}
