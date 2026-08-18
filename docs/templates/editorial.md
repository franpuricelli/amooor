# Template: `editorial`

**Light, calm fine-art** — "Big type, air and calm." A wedding-magazine look:
an almost-neutral canvas, deep ink, hairline rules, air. The hue comes from the
palette the couple picked; the treatment (flat, squared, hairlines) is the skin.

- **id:** `editorial` · **vibe:** `editorial`
- **CSS:** `[data-template="editorial"]` block in `app/globals.css`.
- **Standalone preview:** `public/template/editorial/` (source in
  `templates/love-story/`, built with `NEXT_PUBLIC_THEME=editorial`). The live
  preview skin was ported from there.

## Identity

- **Canvas:** a very light, low-chroma tint of the palette accent (≈ L 95%, ~16%
  of its saturation), with two soft radials in the corners. Derived in
  `templateVars()` (`lib/theme.ts`); the `#f3f0ea` cream in the CSS block is only
  the fallback.
- **Ink:** near-black in the same hue (≈ L 12%). Almost monochrome, but the
  accents (`--pink`: nav heart, hero `&`, notes) keep the palette color, so the
  chosen palette is visible.
- **Typography:** an editorial trio —
  - display/hero: **Parisienne** (script) — `--font-script`
  - h2/h3/numbers: **Cormorant Garamond** (serif) — `--font-serif`
  - eyebrows/buttons/labels: **Montserrat**, uppercase with `.22em` tracking — `--font-sans`
- **Surfaces:** flat light panels (no blur/shadow), 1px hairline borders.
  Squared outline buttons that fill on hover.
- **Corners:** squared (`--r-*: 0`).
- **Photos:** near-monochrome (`grayscale(.9)`); hero in `grayscale(1)` — the
  photo treatment is part of the skin and does NOT follow the palette.
- **Hidden:** floating hearts, hearts above the heads, hero scrim, heart cursor.
  Content emojis → monochrome.

## Fonts (app/fonts.ts)

`montserrat` (`--font-montserrat`), `cormorant` (`--font-cormorant`),
`parisienne` (`--font-parisienne`).
