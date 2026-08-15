# Plantilla: `editorial`

**Fine-art claro y calmo** — "Tipografía grande, aire y calma." Un look de
revista de bodas: crema cálido, tinta carbón, filetes finos, monocromo.

- **id:** `editorial` · **vibe:** `editorial`
- **CSS:** bloque `[data-template="editorial"]` en `app/globals.css`.
- **Preview standalone:** `public/template/editorial/` (fuente en
  `templates/love-story/`, build con `NEXT_PUBLIC_THEME=editorial`). El skin del
  preview vivo se portó de ahí.

## Identidad

- **Canvas:** crema/greige `#f3f0ea` (fijo, ignora la paleta del usuario vía
  `!important`). Un par de radiales cálidos en las esquinas.
- **Tinta:** carbón `#2a251f`. Es monocromo — "accent" = carbón.
- **Tipografía:** trío editorial —
  - display/hero: **Parisienne** (script) — `--font-script`
  - h2/h3/números: **Cormorant Garamond** (serif) — `--font-serif`
  - eyebrows/botones/labels: **Montserrat** en caps con tracking `.22em` — `--font-sans`
- **Superficies:** paneles claros PLANOS (sin blur/sombra), filetes de 1px.
  Botones outline recto que se rellenan en hover.
- **Esquinas:** rectas (`--r-*: 0`).
- **Fotos:** casi monocromas (`grayscale(.9)`); hero en `grayscale(1)`.
- **Se ocultan:** corazones flotantes, corazones sobre las cabezas, scrim del
  hero, cursor-corazón. Emojis de contenido → monocromos.

## Fuentes (app/fonts.ts)

`montserrat` (`--font-montserrat`), `cormorant` (`--font-cormorant`),
`parisienne` (`--font-parisienne`).
