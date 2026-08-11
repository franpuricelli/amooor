# 💘 Love Story — a one-page website template

A single-page, framer-style anniversary/relationship website: a full-bleed hero
with hover "main character" cards, a live counter, story chapters, trips, a
moments grid, a watchlist, and a final wall of all your photos. Built with
**Next.js 15 + Lenis**, ready for **Vercel**.

**This repo is a template.** Everything you see is a placeholder — fantasy names
(Orion & Sera), made-up favorites, and blank photos. Swap in your own story and
photos and you have your site.

> 🇬🇧 English below · 🇪🇸 Español más abajo · the site itself is bilingual (EN · ES)
> everywhere, so translate or delete whichever half you don't need.

> 📦 This template lives at `templates/love-story/` inside the repo. It's a
> **standalone Next.js app** — copy the folder out to its own repo, or point
> Vercel's *Root Directory* at `templates/love-story`. All commands below run
> from inside this folder. · Esta plantilla vive en `templates/love-story/`
> dentro del repo. Es una app Next.js independiente — copiá la carpeta a su
> propio repo, o apuntá el *Root Directory* de Vercel a `templates/love-story`.
> Todos los comandos de abajo se corren desde esta carpeta.

🔗 Live preview: deploy it (see below) and share your own URL.

---

## 🇬🇧 English

### The only file you really edit: `lib/config.ts`

- **Names & dates** (`names`, `dates`) — the live counter is computed on its own.
- **Hero** (`hero`) — which photo is the cover (folder + slug).
- **People** (`people.left`, `people.right`) — the traits and favorite artists
  that appear when you hover each person in the hero. Left person on the left,
  right person on the right. Artist images live in `public/brand/artists/`.
- **Trips** (`viajes`) & **Moments** (`momentos`) — title + emoji (or a `flag`
  image path) for each photo folder.
- **Watchlist** (`watchlist`) and **TikTok** (`tiktok`).

### Photos: one folder = one section

Each category is a folder in `public/photos/<category>/` (full size) **and**
`public/thumbs/<category>/` (small). The template ships blank placeholders named
`01.jpg`, `02.jpg`, … To use it, **replace those files with your own images**
(keep the `.jpg` names, or add your own and update `lib/photos.ts`).

Regenerate the blank set / counts at any time:

```bash
node tools/gen-placeholders.mjs      # (re)make the blank heart placeholders
node tools/build-template-media.mjs  # fill every folder + rewrite lib/photos.ts
```

Edit the `CATEGORIES` list at the top of `tools/build-template-media.mjs` to
change category names or how many photos each section holds.

### Copy that lives in components (not in config)

To keep `config.ts` small, the narrative text sits next to where it renders:

- `components/Hero.tsx` — the hero one-liner.
- `components/sections/Historia.tsx` — the three story chapters.
- `components/sections/Cocina.tsx` — the "we ate well" chapter.
- Section intros — `Viajes.tsx`, `Momentos.tsx`, `Pelis.tsx`, `Galeria.tsx`.
- `components/Footer.tsx` and `components/DrawingFlip.tsx` — the closing message.

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

> ⚠️ Don't run `npm run build` while `npm run dev` is running — they fight over
> `.next`. If it breaks: stop the server, `rm -rf .next`, rebuild.

### Deploy on Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → *Add New Project* → import the repo.
3. Framework: **Next.js** (auto-detected). Deploy. Share the URL. 📲

> The TikTok embed loads more reliably on the real Vercel domain than on
> `localhost`.

---

## 🇪🇸 Español

### El único archivo que de verdad editás: `lib/config.ts`

- **Nombres y fechas** (`names`, `dates`) — el contador en vivo se calcula solo.
- **Hero** (`hero`) — qué foto es la portada (carpeta + slug).
- **Personas** (`people.left`, `people.right`) — los traits y artistas favoritos
  que aparecen al pasar el mouse por cada persona en el hero. La de la izquierda
  a la izquierda, la de la derecha a la derecha. Las imágenes de artistas están
  en `public/brand/artists/`.
- **Viajes** (`viajes`) y **Momentos** (`momentos`) — título + emoji (o una ruta
  de imagen `flag`) para cada carpeta de fotos.
- **Watchlist** (`watchlist`) y **TikTok** (`tiktok`).

### Fotos: una carpeta = una sección

Cada categoría es una carpeta en `public/photos/<categoría>/` (tamaño completo)
**y** `public/thumbs/<categoría>/` (chica). La plantilla trae placeholders en
blanco llamados `01.jpg`, `02.jpg`, … Para usarla, **reemplazá esos archivos por
tus imágenes** (mantené los nombres `.jpg`, o poné los tuyos y actualizá
`lib/photos.ts`).

Regenerá el set de blancos / las cantidades cuando quieras:

```bash
node tools/gen-placeholders.mjs      # (re)genera los placeholders con corazón
node tools/build-template-media.mjs  # llena cada carpeta + reescribe lib/photos.ts
```

Editá la lista `CATEGORIES` arriba de `tools/build-template-media.mjs` para
cambiar los nombres de categoría o cuántas fotos tiene cada sección.

### Texto que vive en los componentes (no en config)

Para que `config.ts` quede chico, el texto narrativo está al lado de donde se
renderiza:

- `components/Hero.tsx` — la frase del hero.
- `components/sections/Historia.tsx` — los tres capítulos de la historia.
- `components/sections/Cocina.tsx` — el capítulo "comimos rico".
- Intros de sección — `Viajes.tsx`, `Momentos.tsx`, `Pelis.tsx`, `Galeria.tsx`.
- `components/Footer.tsx` y `components/DrawingFlip.tsx` — el mensaje de cierre.

### Música y dibujo

- Poné tu canción en `public/song.mp3` (viene un placeholder mudo corto). Usá
  una que tengas permitido usar.
- `public/drawing.png` es el dibujo de la carta que se da vuelta en el footer —
  reemplazalo.

### Correr local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
```

> ⚠️ No corras `npm run build` mientras `npm run dev` está corriendo — se pisan
> en `.next`. Si se rompe: pará el server, `rm -rf .next`, rebuild.

### Deploy en Vercel

1. Subí este repo a GitHub.
2. [vercel.com](https://vercel.com) → *Add New Project* → importá el repo.
3. Framework: **Next.js** (lo detecta solo). Deploy. Mandá la URL. 📲

> El embed de TikTok carga más confiable en el dominio real de Vercel que en
> `localhost`.

---

## 🗺️ Structure · Estructura

```
app/                  layout (metadata + fonts), page, globals.css
components/           Nav, Hero (person hover), Stats (counter), Lightbox,
                      PhotoStrip/PhotoGrid, DrawingFlip (footer), MusicToggle
components/sections/  Historia, Viajes, Cocina, Momentos, Pelis, Galeria
lib/config.ts         👉 the file you edit · el archivo que editás
lib/photos.ts         photo manifest (generated) · manifiesto de fotos (generado)
public/photos|thumbs/ your photos per category · tus fotos por categoría
public/brand/artists/ favorite-artist avatars · avatares de artistas favoritos
public/drawing.png    footer flip-card drawing · dibujo de la carta del footer
public/song.mp3       background song placeholder · placeholder de la canción
tools/                gen-placeholders.mjs + build-template-media.mjs
```

Made with love (and a bit of code) ❤️ · Hecho con amor (y un poco de código) ❤️
