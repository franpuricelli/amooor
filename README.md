# Puri & Ivi — 4 años 💘

Una web de una sola página, estilo **framer.com** (rosa como color principal,
negro secundario con efecto glass, tipografía Inter): hero con la foto de
Bariloche y *hover* sobre cada uno para ver sus "main character traits",
contador en vivo, capítulos por escenario (facu, viajes por país con banderas,
almuerzos & cenas, momentos, pelis) y un mural final con **todas** las fotos.

Hecho con **Next.js 15 + Lenis**. Listo para **Vercel**.

---

## ✏️ Lo único que tenés que editar: `lib/config.ts`

- **Nombres y fechas** (`names`, `dates`) — el contador se calcula solo.
- **Hero** (`hero`) — qué foto se usa de portada (categoría + slug).
- **People** (`people`) — los traits y artistas que aparecen al hacer hover
  sobre Ivi y Fran en el hero (avatares en `public/brand/artists/`).
- **Escenarios** (`viajes`, `momentos`) — título, bandera/emoji de cada carpeta.
- **Watchlist** (`watchlist`) y **TikTok** (`tiktok`).

---

## 📸 Fotos: una carpeta = un escenario

Los originales viven en `~/Downloads/Fotos aniversario`, **una subcarpeta por
evento** (Bariloche, Chile, México, Uruguay, San valentin, Mundial, …). Para
reprocesar después de agregar/mover fotos:

```bash
bash tools/build-categorized.sh       # thumbs 480px + fulls 1280px por categoría
node tools/gen-photos-manifest.mjs    # regenera lib/photos.ts
```

Es *resumible*: solo procesa lo nuevo. Los originales nunca se tocan.
Salida: `public/thumbs/<categoria>/` y `public/photos/<categoria>/`.

---

## 🚀 Deploy en Vercel

**Opción A — desde la web (más fácil):**
1. Subí este repo a GitHub.
2. [vercel.com](https://vercel.com) → *Add New Project* → importá el repo.
3. Framework: **Next.js** (lo detecta solo). Deploy.
4. Te da una URL tipo `puri-e-ivi.vercel.app` → esa se la mandás a Ivi. 📲

**Opción B — desde la terminal:**
```bash
npm i -g vercel
vercel        # seguí los pasos; luego `vercel --prod`
```

> **Nota sobre el TikTok:** el embed carga más confiable en el dominio real de
> Vercel que en `localhost`. Después de deployar, confirmá que se ve en Pelis.

---

## 🖥️ Correr local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
```

⚠️ No corras `npm run build` mientras `npm run dev` está corriendo — se pisa
`.next` y el server devuelve 404/500. Si pasa: matá el server, `rm -rf .next`,
rebuild.

---

## 🗺️ Estructura

```
app/                  layout (Inter), page, globals.css (design system), icon.svg
components/           Nav, Hero (hover de personas), Stats, Lightbox,
                      PhotoStrip/PhotoGrid, RevealInit, Footer (dibujo)
components/sections/  Historia, Viajes, Cocina, Momentos, Pelis, Galeria
lib/config.ts         👉 el archivo que editás
lib/photos.ts         manifiesto de fotos (generado)
public/thumbs|photos/ fotos por categoría · public/brand/ artistas + banderas
public/drawing.png    el dibujo del final
tools/                pipeline de fotos + screenshots (node tools/shots.mjs)
```

Feliz aniversario ❤️
