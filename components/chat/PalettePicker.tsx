"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PalettePicker.tsx — selector de paleta del PlanCard. Feedback aplicado:
//   - Swatches CUADRADOS; cada frame muestra su color principal (no un tinte pálido).
//   - Hover → popover con TODOS los colores de esa paleta, ordenados de más oscuro
//     a más claro, con el nombre alineado a la izquierda.
//   - Botón "+" para crear una paleta propia: el creador aparece ENCIMA del icono,
//     como un popover minimalista (no un panel invasivo abajo).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { palettes, paletteLabels, type PaletteId } from "@/lib/theme";
import {
  recommendPalette,
  normalizeHex,
  hexToHsl,
  type Swatch,
} from "@/lib/palette-gen";

const BUILTIN: Swatch[] = (Object.keys(palettes) as PaletteId[]).map((id) => {
  const p = palettes[id];
  return {
    id,
    label: paletteLabels[id],
    canvas: p.canvas,
    accent: p.accentStrong,
    chips: [p.canvas, p.canvasDeep, p.pink, p.accentStrong, p.accent],
  };
});

/** L (luminosidad HSL) de un hex — para ordenar los chips de oscuro a claro. */
function lightness(hex: string): number {
  try {
    return hexToHsl(hex)[2];
  } catch {
    return 50;
  }
}

function SwatchButton({
  sw,
  selected,
  onSelect,
}: {
  sw: Swatch;
  selected: boolean;
  onSelect: () => void;
}) {
  // Cada cuadrado muestra un solo color: el principal de la paleta.
  // Chips (hover) de oscuro → claro.
  const chips = [...sw.chips].sort((a, b) => lightness(a) - lightness(b));
  return (
    <div className="ch-swatch-wrap">
      <button
        type="button"
        className={`ch-swatch ${selected ? "on" : ""}`}
        style={{ background: sw.accent }}
        aria-label={sw.label}
        onClick={onSelect}
      />
      <div className="ch-swatch-pop" role="tooltip">
        <span className="ch-swatch-pop-name">{sw.label}</span>
        <span className="ch-swatch-chips">
          {chips.map((c, i) => (
            <span key={i} style={{ background: c }} />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function PalettePicker({
  value,
  custom,
  onSelect,
  onCreate,
}: {
  value: string;
  custom: Swatch[];
  onSelect: (id: string) => void;
  onCreate: (sw: Swatch) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [base, setBase] = useState("#df2d72");

  const all = [...BUILTIN, ...custom];
  const preview = recommendPalette(base, "preview", "Nueva");
  const previewChips = [...preview.chips].sort((a, b) => lightness(a) - lightness(b));

  const create = () => {
    const hex = normalizeHex(base);
    if (!hex) return;
    const id = `custom-${Date.now().toString(36)}`;
    const sw = recommendPalette(hex, id, "Personalizada");
    onCreate(sw);
    onSelect(id);
    setCreating(false);
  };

  return (
    <div className="ch-palette">
      <span className="ch-palette-label">Paleta</span>
      <div className="ch-palette-row">
        {all.map((sw) => (
          <SwatchButton
            key={sw.id}
            sw={sw}
            selected={value === sw.id}
            onSelect={() => onSelect(sw.id)}
          />
        ))}

        {/* "+" → creador flotante encima del icono (minimalista) */}
        <div className="ch-swatch-wrap">
          <button
            type="button"
            className={`ch-swatch add ${creating ? "on" : ""}`}
            aria-label="Crear paleta"
            aria-expanded={creating}
            onClick={() => setCreating((v) => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {creating && (
            <div className="ch-palette-maker" role="dialog" aria-label="Crear paleta">
              <div className="ch-palette-maker-row">
                <input
                  type="color"
                  className="ch-color-input"
                  value={normalizeHex(base) ?? "#df2d72"}
                  onChange={(e) => setBase(e.target.value)}
                  aria-label="Color principal"
                />
                <input
                  type="text"
                  className="ch-hex-input"
                  value={base}
                  spellCheck={false}
                  onChange={(e) => setBase(e.target.value)}
                  aria-label="Código hex"
                />
                <button
                  type="button"
                  className="ch-btn primary sm"
                  onClick={create}
                  disabled={!normalizeHex(base)}
                >
                  Agregar
                </button>
              </div>
              <span className="ch-palette-maker-chips">
                {previewChips.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
