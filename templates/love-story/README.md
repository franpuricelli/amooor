# 💘 Love Story — a one-page website template

A single-page, framer-style relationship / anniversary website: a full-bleed
hero with hover "main character" cards, a **live ES/EN switch**, a live counter,
story chapters, trips, a moments grid, a watchlist, and a final wall of all your
photos. Built with **Next.js 15 + Lenis**, ready for **Vercel**.

**This repo is a template.** Everything you see is a placeholder — fantasy names
(Orion & Sera), made-up favorites, blank photos. Swap in your own and it's yours.

> 🌐 **Bilingual.** A minimal **ES / EN** switch sits in the top-right corner.
> Fixed UI text lives in `lib/strings.ts` (both languages); your content lives in
> `lib/config.ts` (plain strings, or `{ en, es }` pairs where you want both).

---

## 🇬🇧 English

### The two files you edit

- **`lib/config.ts` — your content.** Names & dates (the counter is automatic),
  the hero cover, the two people (`people.left` / `people.right`) with their
  traits and favorite artists, your trips (`viajes`) and moments (`momentos`),
  the watchlist and the TikTok. Descriptive bits can be bilingual — write
  `{ en: "…", es: "…" }` — or a plain string used for both.
- **`lib/strings.ts` — the fixed UI text** (section titles, buttons, labels…) in
  `en` and `es`. Edit both columns, or change `DEFAULT_LANG` in `lib/i18n.tsx`.

### Photos: one folder = one section

The gallery is a list of slots per category in `lib/photos.ts`. Empty slots all
share **six blank placeholders** in `public/_blank/` (three aspect ratios, full
+ thumb) — so the repo carries six images, not one identical copy per slot.

**To use your own photo:** drop it at `public/photos/<category>/<slug>.jpg` and a
matching thumb at `public/thumbs/<category>/<slug>.jpg` (the `<slug>` is the
`01`, `02`, … from `lib/photos.ts`), then re-run the build script below. That
slot switches from the shared blank to your image; every other slot stays blank.

Regenerate the blanks / manifest any time:

```bash
node tools/gen-placeholders.mjs      # (re)make the six blank heart placeholders
node tools/build-template-media.mjs  # rewrite lib/photos.ts (detects your photos)
```

Edit the `CATEGORIES` list at the top of `tools/build-template-media.mjs` to
change category names or how many photos each section holds.

### Music & drawing

- Drop your song at `public/song.mp3` (a short silent placeholder ships with the
  template). Use a track you have the rights to.
- `public/drawing.png` is the flip-card drawing in the footer — replace it.

### Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

### Themes: romantic (default) · noir

Same content and layout, two looks. `NEXT_PUBLIC_THEME` picks the palette + fonts
at build time — `romantic` (rose pink, Inter) is the default; `noir` is dark +
warm gold, Space Grotesk. The theme touches only the color tokens in
`app/globals.css` (scoped under `html[data-theme="noir"]`), the fonts in
`app/layout.tsx`, the inline SVG heart fills in `lib/theme-tokens.ts`, and which
tinted blank set (`public/_blank/*` vs `*-noir`) empty slots use.

```bash
npm run dev                     # romantic
NEXT_PUBLIC_THEME=noir npm run dev   # noir
```

### Deploy on Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → *Add New Project* → import the repo →
   **Next.js** (auto-detected) → Deploy. Share the URL. 📲

> The TikTok embed loads more reliably on the real Vercel domain than on
> `localhost`.

---

## 🇪🇸 Español

### Los dos archivos que editás

- **`lib/config.ts` — tu contenido.** Nombres y fechas (el contador es
  automático), la portada del hero, las dos personas (`people.left` /
  `people.right`) con sus traits y artistas favoritos, tus viajes (`viajes`) y
  momentos (`momentos`), la watchlist y el TikTok. Los textos descriptivos pueden
  ser bilingües — poné `{ en: "…", es: "…" }` — o un string para ambos.
- **`lib/strings.ts` — el texto fijo de UI** (títulos de sección, botones,
  labels…) en `en` y `es`. Editá las dos columnas, o cambiá `DEFAULT_LANG` en
  `lib/i18n.tsx`.

### Fotos: una carpeta = una sección

La galería es una lista de slots por categoría en `lib/photos.ts`. Todos los
slots vacíos comparten **seis placeholders en blanco** en `public/_blank/` (tres
proporciones, full + thumb) — así el repo lleva seis imágenes, no una copia
idéntica por slot.

**Para usar tu propia foto:** dejala en `public/photos/<categoría>/<slug>.jpg` y
un thumb en `public/thumbs/<categoría>/<slug>.jpg` (el `<slug>` es el `01`, `02`,
… de `lib/photos.ts`), y re-corré el script de abajo. Ese slot pasa del blanco
compartido a tu imagen; los demás siguen en blanco.

Regenerá los blancos / el manifiesto cuando quieras:

```bash
node tools/gen-placeholders.mjs      # (re)genera los seis placeholders con corazón
node tools/build-template-media.mjs  # reescribe lib/photos.ts (detecta tus fotos)
```

Editá la lista `CATEGORIES` arriba de `tools/build-template-media.mjs` para
cambiar nombres de categoría o cuántas fotos tiene cada sección.

### Música y dibujo

- Poné tu canción en `public/song.mp3` (viene un placeholder mudo corto). Usá una
  que tengas permitido usar.
- `public/drawing.png` es el dibujo de la carta del footer — reemplazalo.

### Correr local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
```

### Deploy en Vercel

1. Subí este repo a GitHub.
2. [vercel.com](https://vercel.com) → *Add New Project* → importá el repo →
   **Next.js** (lo detecta solo) → Deploy. Mandá la URL. 📲

---

## 🔌 Embedding under a sub-path · Montarlo en un sub-path

EN · Every asset URL respects `NEXT_PUBLIC_BASE_PATH`, so the template can be
served under a sub-path (e.g. `/template` inside another app) with no code
changes. Build that bundle with:

```bash
EXPORT=1 NEXT_PUBLIC_BASE_PATH=/template/romantic npm run build   # → out/
```

ES · Cada URL de asset respeta `NEXT_PUBLIC_BASE_PATH`, así que el template se
puede servir bajo un sub-path (ej. `/template` dentro de otra app) sin tocar
código. Generá ese bundle con el comando de arriba.

---

## 🗺️ Structure · Estructura

```
app/                  layout (metadata + fonts), page (providers), globals.css
components/           Nav, Hero (person hover), Stats (counter), Lightbox,
                      PhotoStrip/PhotoGrid, DrawingFlip (footer), MusicToggle
components/sections/  Historia, Viajes, Cocina, Momentos, Pelis, Galeria
lib/config.ts         👉 your content · tu contenido
lib/strings.ts        👉 UI text (en/es) · texto de UI (en/es)
lib/i18n.tsx          language provider + top-right ES/EN switch
lib/photos.ts         photo manifest (generated) · manifiesto de fotos (generado)
public/_blank/        shared blank placeholders · placeholders en blanco compartidos
public/photos|thumbs/ your own photos per category · tus fotos por categoría
tools/                gen-placeholders.mjs + build-template-media.mjs
```

Made with love (and a bit of code) ❤️ · Hecho con amor (y un poco de código) ❤️
