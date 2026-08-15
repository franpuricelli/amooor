# Template: `editorial`

**Light, calm fine-art** — "Big type, air and calm." A wedding-magazine look:
warm cream, charcoal ink, hairline rules, monochrome.

- **id:** `editorial` · **vibe:** `editorial`
- **CSS:** `[data-template="editorial"]` block in `app/globals.css`.
- **Standalone preview:** `public/template/editorial/` (source in
  `templates/love-story/`, built with `NEXT_PUBLIC_THEME=editorial`). The live
  preview skin was ported from there.

## Identity

- **Canvas:** cream/greige `#f3f0ea` (fixed — ignores the user palette via
  `!important`). A couple of warm radials in the corners.
- **Ink:** charcoal `#2a251f`. It's monochrome — the "accent" is charcoal.
- **Typography:** an editorial trio —
  - display/hero: **Parisienne** (script) — `--font-script`
  - h2/h3/numbers: **Cormorant Garamond** (serif) — `--font-serif`
  - eyebrows/buttons/labels: **Montserrat**, uppercase with `.22em` tracking — `--font-sans`
- **Surfaces:** flat light panels (no blur/shadow), 1px hairline borders.
  Squared outline buttons that fill on hover.
- **Corners:** squared (`--r-*: 0`).
- **Photos:** near-monochrome (`grayscale(.9)`); hero in `grayscale(1)`.
- **Hidden:** floating hearts, hearts above the heads, hero scrim, heart cursor.
  Content emojis → monochrome.

## Fonts (app/fonts.ts)

`montserrat` (`--font-montserrat`), `cormorant` (`--font-cormorant`),
`parisienne` (`--font-parisienne`).
