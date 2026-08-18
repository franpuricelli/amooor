# Template: `brutalist`

**Neo-brutalist** — "Strong contrast, blocks and border." Warm paper, near-black
ink, chunky type and hard shadows. The "pop" color is the couple's palette
accent (it was a fixed electric blue until the palette started driving it).

- **id:** `brutalist` · **vibe:** `brutalist`
- **CSS:** `[data-template="brutalist"]` block in `app/globals.css`.
- **Standalone preview:** `public/template/brutalist/` (source in
  `templates/love-story/`, built with `NEXT_PUBLIC_THEME=brutalist`). The live
  preview skin was ported from there.

## Identity

- **Canvas:** paper tinted with the palette hue (≈ L 93%, ~30% of its
  saturation) + a faint 30px engineering grid. Derived in `templateVars()`
  (`lib/theme.ts`); the `#f4efe1` in the CSS block is the fallback.
- **Ink:** near-black in the same hue. **Pops:** `--pop` = the palette accent,
  `--pop-soft` = a light, saturated tint of it (the eyebrow tag / hover), and
  `--on-pop` = the readable text color over `--pop`.
- **Typography:**
  - display/headings: **Bricolage Grotesque** 700–800, negative tracking, hard
    colored shadow — `--font-display`
  - tags/labels/buttons: **Space Mono**, uppercase — `--font-mono`
  - body: **Archivo** — `--font-sans`
- **Surfaces:** solid white boxes, `2px` ink border, hard offset shadow
  (`5px 5px 0`), no blur. Blue buttons that "press" on hover.
- **Corners:** squared (`--r-*: 0`).
- **Details:** eyebrow = mono tag in `--pop-soft` with border+shadow;
  `section-dark` = solid ink block; hero-amp in `--pop` with an ink stroke;
  countries deck in palette-derived blocks (`--skin-panel-a/-b`) + paper; photos
  boxed with a hard shadow.
- **Hidden:** floating hearts / hearts above heads, hero scrim, heart cursor.

## Fonts (app/fonts.ts)

`bricolage` (`--font-bricolage`), `spaceMono` (`--font-space-mono`),
`archivo` (`--font-archivo`).
