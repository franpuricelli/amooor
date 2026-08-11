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

Each category is a folder in `public/photos/<category>/` (full size) **and**
`public/thumbs/<category>/` (small). The template ships blank placeholders named
`01.jpg`, `02.jpg`, … in a mix of aspect ratios. **Replace those files with your
own images** (keep the `.jpg` names, or add your own and update `lib/photos.ts`).

Regenerate the blank set / counts any time:

```bash
node tools/gen-placeholders.mjs      # (re)make the blank heart placeholders
node tools/build-template-media.mjs  # fill every folder + rewrite lib/photos.ts
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

Cada categoría es una carpeta en `public/photos/<categoría>/` (tamaño completo)
**y** `public/thumbs/<categoría>/` (chica). La plantilla trae placeholders en
blanco `01.jpg`, `02.jpg`, … en una mezcla de proporciones. **Reemplazá esos
archivos por tus imágenes** (mantené los nombres `.jpg`, o poné los tuyos y
actualizá `lib/photos.ts`).

Regenerá los blancos / las cantidades cuando quieras:

```bash
node tools/gen-placeholders.mjs      # (re)genera los placeholders con corazón
node tools/build-template-media.mjs  # llena cada carpeta + reescribe lib/photos.ts
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
EXPORT=1 NEXT_PUBLIC_BASE_PATH=/template npm run build   # → out/
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
public/photos|thumbs/ your photos per category · tus fotos por categoría
public/brand/artists/ favorite-artist avatars · avatares de artistas favoritos
tools/                gen-placeholders.mjs + build-template-media.mjs
```

Made with love (and a bit of code) ❤️ · Hecho con amor (y un poco de código) ❤️
