# Template: `brutalist`

**Neo-brutalist** — "Strong contrast, blocks and border." Warm paper, near-black
ink, electric blue + yellow, chunky type and hard shadows.

- **id:** `brutalist` · **vibe:** `brutalist`
- **CSS:** `[data-template="brutalist"]` block in `app/globals.css`.
- **Standalone preview:** `public/template/brutalist/` (source in
  `templates/love-story/`, built with `NEXT_PUBLIC_THEME=brutalist`). The live
  preview skin was ported from there.

## Identity

- **Canvas:** paper `#f4efe1` (fixed — ignores the palette via `!important`) with
  a faint 30px engineering grid.
- **Ink:** near-black `#141210`. **Pops:** electric blue `#2f27e0` + yellow
  `#ffcf2e`.
- **Typography:**
  - display/headings: **Bricolage Grotesque** 700–800, negative tracking, hard
    colored shadow — `--font-display`
  - tags/labels/buttons: **Space Mono**, uppercase — `--font-mono`
  - body: **Archivo** — `--font-sans`
- **Surfaces:** solid white boxes, `2px` ink border, hard offset shadow
  (`5px 5px 0`), no blur. Blue buttons that "press" on hover.
- **Corners:** squared (`--r-*: 0`).
- **Details:** eyebrow = yellow mono tag with border+shadow; `section-dark` =
  solid black block; blue hero-amp with stroke; countries deck in
  blue/yellow/paper blocks; photos boxed with a hard shadow.
- **Hidden:** floating hearts / hearts above heads, hero scrim, heart cursor.

## Fonts (app/fonts.ts)

`bricolage` (`--font-bricolage`), `spaceMono` (`--font-space-mono`),
`archivo` (`--font-archivo`).
