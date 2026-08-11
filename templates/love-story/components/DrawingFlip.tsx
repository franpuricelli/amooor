"use client";

import { useState } from "react";
import { BASE } from "@/lib/base";
import { config } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

/** Hand-drawn card in the footer: click to flip it over and reveal the message. */
export default function DrawingFlip() {
  const { t } = useI18n();
  const [flipped, setFlipped] = useState(false);

  // NOTE: the `reveal` class lives on a wrapper whose className never changes,
  // so React doesn't wipe the `in` class that RevealInit adds to the DOM.
  return (
    <div className="reveal drawing-flip-wrap">
      <button
        className="drawing-flip"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? t.drawing.toDrawing : t.drawing.toMessage}
      >
        <span className={`drawing-flip-inner ${flipped ? "flipped" : ""}`}>
          <span className="drawing-card drawing-face drawing-front">
            <img src={`${BASE}/drawing.png`} alt={t.drawing.alt} />
          </span>
          <span className="drawing-card drawing-face drawing-back" aria-hidden={!flipped}>
            <span className="drawing-back-msg">{t.drawing.msg}</span>
            <span className="drawing-back-from">{t.drawing.from.replace("{name}", config.names.right)}</span>
          </span>
        </span>
      </button>
    </div>
  );
}
