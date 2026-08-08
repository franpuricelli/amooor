# Design System — Landing de marketing de amooor

Guía del rediseño de la landing pública (`amooor.com` apex). Documenta la
dirección visual, los tokens, los componentes, las reglas de copy y el pipeline
de assets. Todo lo scopeado a la landing vive con prefijo `.mk-` en
`components/marketing/marketing.css` para no colisionar con `app/globals.css`
(que es el tema de los sitios de tenant).

Archivos clave:

- `components/marketing/Landing.tsx` — orquesta el orden de las secciones.
- `components/marketing/sections.tsx` — todos los componentes (`"use client"`).
- `components/marketing/marketing.css` — el sistema visual completo (`.mk-`).
- `components/marketing/LegalPage.tsx` — layout de `/privacidad` y `/terminos`.
- `lib/marketing.ts` — toda la copy y los datos de la landing.
- `lib/pricing.ts` — fuente única de precios y planes (la usa landing + wizard + checkout).
- `app/page.tsx` — router por host + `generateMetadata` de marketing.

---

## 1. Filosofía

**Colores de purivi + estructura/tipografía de Wispr Flow.** Base editorial
clara y cálida (crema blush), con el rosa de purivi como acento. Titulares en
sans bold con una palabra en **serif itálico** (patrón Wispr Flow). Nada de
"neón oscuro vibecoded".

Dirección en una línea: **editorial, romántico, premium, cálido. Menos es más.**

---

## 2. Tokens de color

Definidos en `.mk-root`. Superficies cálidas + tinta vino + rosa de purivi.

| Token | Valor | Uso |
|---|---|---|
| `--mk-bg` | `#faf4f0` | fondo crema base |
| `--mk-bg-alt` | `#f3e7e4` | blush para secciones alternas |
| `--mk-card` | `#fffcfa` | superficie de tarjeta |
| `--mk-ink` | `#2a0a18` | texto (vino profundo) |
| `--mk-ink-2` | `rgba(42,10,24,.62)` | texto secundario |
| `--mk-ink-3` | `rgba(42,10,24,.4)` | texto terciario / labels |
| `--mk-line` | `rgba(42,10,24,.12)` | bordes / hairlines |
| `--mk-line-soft` | `rgba(42,10,24,.08)` | bordes suaves |
| `--mk-rose` | `#ff5c99` | rosa de marca (fills, pills) |
| `--mk-rose-deep` | `#c15e88` | rosa para emphasis serif |
| `--mk-rose-text` | `#c02c68` | rosa legible sobre crema (labels/links) |
| `--mk-rose-btn` | `#df2d72` | relleno de botón (contraste AA con blanco) |
| `--mk-rose-soft` | `#ffe4ee` | fill rosa suave (chips hover, checks) |

**Regla de contraste:** sobre crema, el texto rosa usa `--mk-rose-text`
(#c02c68) y los botones `--mk-rose-btn` (#df2d72), no el `--mk-rose` puro
(#ff5c99), que no llega a AA con blanco.

Alternancia de secciones: `bg → alt → bg → alt …` (`.mk-section` vs
`.mk-section .mk-section-alt`).

---

## 3. Tipografía

- **Display / emphasis:** `Fraunces` (variable, ejes `opsz` + `SOFT`), cargada
  en `app/layout.tsx` como `--font-fraunces` → alias `--mk-serif`.
- **Cuerpo / UI:** `Inter` (`--font-sans`).
- **Firma manuscrita:** `Caveat` (`--font-caveat`) — solo la firma del "Sobre
  nosotros".

**Patrón de titular (clave del look Wispr Flow):** sans bold + una línea/palabra
en serif itálico coloreada en `--mk-rose-deep`.

```tsx
<h2 className="mk-h2">Un precio,<br /><em>para siempre.</em></h2>
```

`.mk-h2 em`, `.mk-hero-title em`, `.mk-footer-title em` comparten el estilo
serif-itálico. Los títulos se parten por `\n` en los datos y la segunda línea va
en `<em>`.

Otros usos del serif: números de precio (`.mk-plan-amount`), números de pasos
(`.mk-step-num`), valores de stats (`.mk-wall-stat-value`), nombre de la pareja
(`.mk-showcase-couple`) y los `h2` de legales.

---

## 4. Forma y movimiento

- Radios: `--mk-r-xl: 26px`, `--mk-r-lg: 18px`, `--mk-r-md: 12px`. Todo lo
  contenedor es redondeado **excepto los pills de plan**, que son rectos
  (`border-radius: 0`) por pedido, para contrastar con las cards.
- Botones y nav: pill (`border-radius: 999px`).
- Easing estándar: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Entrada del hero: `.mk-animate-in` (fade-up escalonado por `nth-child`).
- **Siempre** honrar `prefers-reduced-motion` (marquee, animaciones, spotlight).

---

## 5. Componentes

### Nav (`.mk-nav`)
Pill flotante fijo, glass fuerte (`background: rgba(255,252,250,.42)` +
`backdrop-filter: blur(34px) saturate(185%)`). `.mk-nav` es **flex column** para
que el menú mobile se apile debajo del pill (si es `row`, el panel se va al
costado — bug que tuvimos).

- **Spotlight que sigue al cursor:** `MkNav` setea `--mk-mx/--mk-my` en
  `onMouseMove`; `.mk-nav-inner::before` es un radial-gradient rosa difuminado
  posicionado ahí, `opacity` 0→1 en `:hover`. `.mk-nav-inner` necesita
  `position: relative; overflow: hidden` y `> * { position: relative; z-index: 1 }`.
  **No** tintar toda la barra: el efecto es local al mouse.
- **Links hover:** chip `--mk-rose-soft` + texto `--mk-rose-text`.
- **Mobile:** `.mk-nav-links` se ocultan <780px, aparece `.mk-nav-burger`
  (hamburguesa → X animada) y `.mk-nav-mobile` se despliega full-width debajo,
  ancho `min(1180px,100%)` (coincide con el pill), con `mk-menu-in` y divisores
  entre ítems.

### Hero (`.mk-hero`)
Eyebrow (label plano, **sin píldora**) + titular + subtítulo + CTA único +
`BrowserFrame` con el video demo. Fondo con radial rosa suave arriba.

### BrowserFrame
Marco de navegador (barra con 3 dots + URL) que envuelve el `<video>` demo
(`/demo/demo.mp4`, `autoPlay muted loop playsInline`). Reutilizado en hero y
showcase. `aspect-ratio: 16/10`, `object-fit: cover`.

### Cómo funciona (`.mk-steps`)
Grid de 4 cards con número serif-itálico (`01–04`), título y texto. Sin emojis.

### Showcase (`.mk-showcase`)
Una sola card destacada (Puri e Ivi): preview en vivo (BrowserFrame) + info
(tag, nombre serif, descripción, link) que enlaza a `https://purivi.love/`.
Regla: **cada ejemplo lleva foto/preview de la pareja del sitio real.**

### Muro "Lo que piensa la gente" (`.mk-wall`)
- **Social proof:** `.mk-wall-stats` (Views / Me gusta / Comentarios) en serif.
- **Marquee de 3 filas** con dirección alternada (`.mk-wall-track` +
  `.mk-wall-track-rev`), duraciones distintas, pausa en `:hover`, máscara de
  degradé en los bordes. Se pausa/desactiva con `prefers-reduced-motion`.
- Cards de **ancho y alto uniformes**: la imagen llena el ancho (`width:100%;
  height:auto`) y el alto fijo recorta prolijamente los comentarios largos
  (nombre + primeras líneas siempre visibles).

### Precios (`.mk-plan`)
Estilo Wispr Flow. Pill de plan **recto** y coloreado (peach / rosa / vino),
tagline, precio serif con `US$` en superíndice, features con `✓` y `+` para los
"Todo lo de …" heredados. La card destacada (`.mk-plan-hl`) lleva borde marcado
(`2px solid --mk-ink`) y CTA rosa. CTA siempre "Comenzar" (nunca palabra+ícono).

Nombres de plan creativos: **Cupido → Nuestra Historia → Para Siempre**
(escalera emocional). Definidos en `lib/pricing.ts` (fuente única; cambiar ahí
propaga a wizard/checkout/emails).

### Sobre nosotros (`.mk-about`)
Dos columnas: relato en primera persona (voz de Ivi y Puri) + el TikTok real
embebido (`@iviwang`, patrón blockquote + `https://www.tiktok.com/embed.js` via
`next/script`). `align-items: start` y el video es `position: sticky` para
acompañar el scroll del relato largo. Firma manuscrita en Caveat.

### FAQ (`.mk-faq-list`)
Acordeón `dt/dd` con ícono `+` que rota a `×`. Primer ítem abierto por defecto.

### Footer (`.mk-footer`)
Bloque CTA ("Armá el tuyo hoy.") + barra con logo, links legales y copyright.

### Legales (`LegalPage`)
`/privacidad` y `/terminos` reusan `MkNav`/`MkFooter` + prose con `h2`
serif-itálico. Nunca dejar los links del footer en 404.

---

## 6. Voz y reglas de copy

- **Español rioplatense (voseo):** "Pagás", "Elegí", "Editás", "Armá", "Regalá".
- **Evitar em dashes (`—`)** en toda la copy visible. Usar dos puntos, coma o
  punto. (Los comentarios de código pueden tener `—`, no se renderizan.)
- **`amor` → `amooor`** en superficies de marca (hero, firma, footer, meta,
  footers de email). En narrativa provista por el usuario se respeta lo que
  escribió. El brand siempre en minúscula: `amooor`.
- **CTA nunca es palabra + ícono.** Solo texto ("Comenzar"). Sin flechas.
- **Eyebrows sin píldoras/burbujas** que brillen. Label plano en mayúsculas con
  tracking, color `--mk-rose-text`.
- "Wizard" se dice **"Asistente"**.
- No duplicar el mismo texto en eyebrow + título de una sección.

---

## 7. Pipeline de assets

- **Video demo:** comprimir con ffmpeg (`scale=-2:900`, `libx264 crf 30`,
  `+faststart`, sin audio) → de ~29.5MB a ~3.6MB en `public/demo/demo.mp4`.
  Poster con `-ss <t> -frames:v 1` → `public/demo/poster.jpg`.
- **Muro de comentarios:** capturas en `public/wall/NN.png` (01–28). Varias
  venían con una **franja negra vertical** pegada al borde izquierdo (mal
  screenshoteadas): se detecta con `sharp` recortando columnas iniciales no
  blancas y se re-escribe la imagen.
- **Contact sheet** para inspeccionar los 28 de un vistazo: componer un grid con
  `sharp` (no hay ImageMagick en la máquina).

---

## 8. Datos y metadata

- Toda la copy y datos en `lib/marketing.ts` (tipado con `MarketingContent`).
  Secciones nuevas se agregan como campos (`about`, `wallStats`, etc.).
- `app/page.tsx` hace `generateMetadata`: si `resolveSite().found` es `false`
  (apex/marketing) devuelve título/OG propios de amooor; si hay tenant devuelve
  `{}` y manda el `generateMetadata` del layout (metadata por host).

---

## 9. Gotchas aprendidos (entorno)

- **Puerto del dev server:** `3111` ya lo ocupa otro proyecto ("Render a
  House"). Usar un puerto libre (ej. `3219`) y **verificar** que sirve amooor
  (`curl … | grep mk-root`), no otra app.
- **`next build` pisa el `.next` del dev server** y lo deja en 500. Si corrés un
  build con el dev prendido, reiniciá el dev después. Para validar sin romper el
  dev, usar `npx tsc --noEmit` (no toca `.next`).
- **Scripts de `sharp`/`puppeteer-core` deben correr desde el root del
  proyecto** (si no, `ERR_MODULE_NOT_FOUND`). Escribir el `.mjs` en el repo,
  correrlo, borrarlo.
- **Chrome para screenshots:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
  con `puppeteer-core`, `headless: "new"`. El `requestfailed` del `<video>` en
  puppeteer es un abort del stream, no un 404 real (verificar con `curl`).
- **TikTok embed** hidrata con `embed.js`; dar ~3.5s antes de screenshotear.
- **Salida de screenshots** (`tools/landing-shots/`) va gitignoreada; el script
  (`tools/landing-shots.mjs`) se puede versionar.

---

## 10. i18n (español + inglés)

La landing es bilingüe. Español es el default (`/`), inglés en `/en`.

- **Contenido por locale:** `lib/marketing.ts` (es) y `lib/marketing.en.ts` (en),
  ambos con la misma forma `MarketingContent`. **Todo** string visible vive en
  estos archivos (no hardcodear texto en los componentes).
- **Provider:** `lib/marketing-context.tsx` (`MarketingProvider` + `useMarketing()`).
  `Landing.tsx` recibe `content` y envuelve el árbol; cada sección hace
  `const m = useMarketing()`.
- **Rutas:** `app/page.tsx` (es) y `app/en/page.tsx` (en), cada una con su
  `generateMetadata` (title/OG/`alternates` hreflang). Legales: `/privacidad`,
  `/terminos` y `/en/privacy`, `/en/terms` (reusan `LegalPage`, que también
  envuelve en `MarketingProvider`).
- **Switch de idioma:** `.mk-nav-lang` en el nav; `content.ui.langHref`/`langLabel`
  apuntan al otro locale. Los links del nav son anclas (`#como-funciona`, etc.)
  con **ids que no cambian** entre locales, así funcionan en ambos.
- **Planes:** los montos salen de `lib/pricing.ts`; el TEXTO (name/tagline/features)
  sale de `content.plans` por locale. Los nombres se traducen: Cupido→Cupid,
  Nuestra Historia→Our Story, Para Siempre→Forever. El feature heredado se marca
  con `content.ui.inheritPrefix` ("Todo lo de" / "Everything in"), no con un
  string fijo.
- El wizard (`/comenzar`) sigue en español; los CTA de ambos locales apuntan ahí.

**Para agregar un string nuevo:** agregalo a `MarketingContent`, completá ambos
locales, y consumilo con `useMarketing()`. Nunca dejar texto suelto en el JSX.

## 11. Checklist para tocar la landing

1. ¿La copy respeta voseo, sin em dashes, `amor`→`amooor`, CTA sin ícono?
2. ¿Los titulares usan el patrón sans + serif itálico?
3. ¿Contraste AA (usar `--mk-rose-text` / `--mk-rose-btn`, no `--mk-rose`)?
4. ¿Alternancia `bg/alt` de secciones intacta?
5. ¿`prefers-reduced-motion` cubierto para animaciones nuevas?
6. `npx tsc --noEmit` limpio + screenshot de la sección tocada.
