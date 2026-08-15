# Plantilla: `brutalist`

**Neo-brutalista** — "Contraste fuerte, bloques y borde." Papel cálido, tinta
casi negra, azul eléctrico + amarillo, tipografía chunky y sombras duras.

- **id:** `brutalist` · **vibe:** `brutalist`
- **CSS:** bloque `[data-template="brutalist"]` en `app/globals.css`.
- **Preview standalone:** `public/template/brutalist/` (fuente en
  `templates/love-story/`, build con `NEXT_PUBLIC_THEME=brutalist`). El skin del
  preview vivo se portó de ahí.

## Identidad

- **Canvas:** papel `#f4efe1` (fijo, ignora la paleta vía `!important`) con una
  grilla de ingeniería tenue de 30px.
- **Tinta:** casi negra `#141210`. **Pops:** azul eléctrico `#2f27e0` +
  amarillo `#ffcf2e`.
- **Tipografía:**
  - display/headings: **Bricolage Grotesque** 700–800, tracking negativo,
    sombra dura de color — `--font-display`
  - tags/labels/botones: **Space Mono** en caps — `--font-mono`
  - body: **Archivo** — `--font-sans`
- **Superficies:** cajas blancas sólidas, borde `2px` tinta, sombra dura
  offset (`5px 5px 0`), sin blur. Botones azules que "se hunden" en hover.
- **Esquinas:** rectas (`--r-*: 0`).
- **Detalles:** eyebrow = tag mono amarillo con borde+sombra; `section-dark` =
  bloque negro sólido; hero-amp azul con contorno; deck de países en bloques
  azul/amarillo/papel; fotos encajadas con sombra dura.
- **Se ocultan:** corazones flotantes / sobre cabezas, scrim del hero,
  cursor-corazón.

## Fuentes (app/fonts.ts)

`bricolage` (`--font-bricolage`), `spaceMono` (`--font-space-mono`),
`archivo` (`--font-archivo`).
