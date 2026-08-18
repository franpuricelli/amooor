"use client";

import { useState } from "react";
import { useContent } from "@/lib/tenant";
import { PLACEHOLDER_PHOTO } from "@/lib/photos-context";
import { EditableText } from "@/lib/edit-context";

/** Hand-drawn card in the footer: click to flip it over and reveal the message. */
export default function DrawingFlip() {
  const [flipped, setFlipped] = useState(false);
  const { drawing } = useContent();

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
            {/* sin foto de cierre todavía → marco vacío (el dibujo lo genera el
                alta a partir de la foto que suba la pareja) */}
            <img src={drawing.src || PLACEHOLDER_PHOTO} alt={drawing.alt} />
          </span>
          <span className="drawing-card drawing-face drawing-back" aria-hidden={!flipped}>
            <span className="drawing-back-msg">
              <EditableText path="drawing.message" value={drawing.message} />
            </span>
            <span className="drawing-back-from">
              <EditableText path="drawing.from" value={drawing.from} />
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
