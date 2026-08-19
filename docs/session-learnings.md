# Session learnings

Per-session episode log: what happened, what's still open. Durable rules and
gotchas live in `CLAUDE.md`; this file records the episodes that produced them
and the work left unfinished. No secrets (values live in gitignored `.env.local`).

---

## 2026-08-10/11 — branch `fix-design-system-landing` (PR #4)

### Shipped (`/comenzar`)

1. **Palette apply** — custom palettes now ride in `theme.overrides`, not just an
   id (CLAUDE.md §Palette). Files: `lib/palette-gen.ts`, `EditStep`,
   `Chat.applyPalette`, `use-conversation.setPalette`.
2. **Hero hover zones** — person cards reveal only over the outer 10% of each edge
   (`.zone { width:10% }`) and hide on leave (`closeCard` wired to the zone, card,
   and hero `onMouseLeave`, `components/Hero.tsx`). First attempt moved the card
   instead — reverted.
3. **Upload** — removed the broken example `<aside className="pa-example">` from
   `UploadStep.tsx`.
4. **Preview ↔ Multimedia** — bidirectional: preview scroll drives the active
   section (scroll-spy in `SitePreviewFrame`); picking a section scrolls the
   preview (`scrollTo={cat,nonce}`).
5. **Stage stepper** — the header progress bar became a Historia → Plan → Fotos →
   Tu sitio stepper (`Chat.tsx` + `chat.css`); `PostApprove` reports its step via
   `onStep`.

`npx tsc --noEmit` and `npx next lint` clean.

### Config episode (→ CLAUDE.md §Env, §Convex)

The Conductor workspace arrived without `.env.local`, so everything failed on
missing env vars. Symptom → cause:

- "No se pudo iniciar la subida." → missing Cloudflare creds (`lib/storage.ts`).
- Photo register `ArgumentValidationError: extra field 'filename'` → the dev
  Convex deployment ran functions from before `fcf1670` added `filename`; pushing
  current functions fixed it.
- "falta KIMI_API_KEY" → read by `lib/llm.ts` (Next), not Convex.
- Deepgram token 502 → the restricted key can't grant; it transcribes fine, so
  local dev uses `DEEPGRAM_ALLOW_RAW_KEY=1`.

The root lesson (keys are Next-side, not Convex) is now in CLAUDE.md. The
`~/.convex` token lacked project access, so pushes needed a dashboard deploy key;
a `preview:` key gave `TeamNotFound` — a `dev:` key worked.

### Open

- **118×1488 left-edge crop** (attachment): the editor's left border — sidebar +
  frame borders + the `.ch-profile` circle. Unresolved: confirm with the user
  what to remove (the circle, the divider lines, or the whole column → full-bleed
  preview). Not in PR #4.

---

## 2026-08-17 — branch `delhi` — 4 hallazgos de QA del builder

QA sobre `/comenzar`: (1) al elegir template + paleta el template no tomaba el
color, (2) el preview de "Fotos" mostraba fotos y datos de Puri & Ivi en vez de la
plantilla elegida, (3) el bot nunca preguntó la fecha de aniversario ni quién de
los dos es la persona que habla, (4) "en Tu sitio no puedo editar desde el
preview".

### 1. La paleta no llegaba a la plantilla

Dos causas, las dos verificadas en el navegador:

- Los skins `[data-template="editorial"|"brutalist"]` fijaban sus colores con
  `!important` justamente para ganarle a las vars inline de la paleta → elegir
  paleta no cambiaba NADA en esas plantillas. Ahora los colores del skin los
  **deriva de la paleta** `templateVars()` (`lib/theme.ts`) y viajan inline con
  `themeVars()`; el CSS quedó con el tratamiento + colores de fallback, sin
  `!important`. Regla nueva en `docs/templates/README.md`.
- En el preview, el fondo lo pintaba `body { background: … }` del iframe, pero las
  vars viven en el `<div>` raíz portaleado adentro → el lienzo caía al gradiente
  rosa de `:root` aun con otra paleta. El root del preview ahora lleva
  `.site-canvas` (mismas reglas que `body`), y el gradiente de `body` usa tokens
  de paleta en vez de rgba rosas fijos.
- De paso: `--ink-70/--ink-50` salían de `:root` (rosa) — ahora los deriva
  `paletteVars()` de `palette.ink`.

### 2. "Purivi" filtrado en el preview

`lib/content.ts` es el content de la DEMO y `generateContent` lo usaba como
fallback campo por campo: fotos (938 imágenes del manifiesto estático), fecha
(26·07·2022), pelis (The Notebook…), momentos, el lede de viajes ("Bariloche fue
el primero…"), el dibujo `/drawing.png`, la canción `when-i-was-your-man` y el
crédito "hecho por Puri". Ahora el esqueleto sólo aporta chrome (labels, aria) y
todo dato personal sale del plan o va vacío. Además:

- `content.media` se setea SIEMPRE (aunque no haya fotos): su presencia es lo que
  le dice a `PhotoProvider` "este sitio tiene SUS fotos". Sin él caía al
  manifiesto estático (también en `/api/generate`, que sólo lo mandaba con fotos).
- El preview del builder pide `placeholders`: las secciones sin fotos muestran
  marcos vacíos (SVG neutro) en vez de nada — se ve dónde van a entrar.
- **`RevealInit` no funcionaba dentro del iframe del preview**: buscaba los
  `.reveal` en `document` (el padre) y creaba el IntersectionObserver con la
  ventana del padre, así que ninguna sección se revelaba nunca y el preview se
  veía como bloques de color vacíos. Ahora usa el documento donde está montado.

### 3. Fecha de aniversario + quién sos

El `Plan` no tenía dónde guardarlos, así que el intake no los pedía y el sitio
inventaba (fecha de la demo, firma "De: Fran"). Ahora `zPlan` tiene
`dates{together,met}` (normalizadas desde varios formatos) y `you`; el
`orchestrator` los pide temprano y son BLOQUEANTES en el checklist oculto
(`lib/intake-prompt.ts`); `prepare-plan`/`adapt`/`edit` los llevan en el contrato
JSON. Viajan por `planToWizardState` → `WizardState.dates` + `narrator` → contador,
eyebrow del hero, línea del cierre, firma del dibujo y crédito del footer. La
tarjeta del plan los muestra y deja corregirlos sin re-sintetizar (`PlanFacts`).

### 4. "No puedo editar desde el preview"

El camino de escritorio SÍ funcionaba (verificado con clicks reales: foco, tipeo y
commit en blur, con el iframe escalado). Lo que estaba roto/faltaba:

- La **vista celular** del preview no recibía `edit` → era view-only en silencio.
- Sólo la foto de PORTADA abría Multimedia; el resto abría el lightbox. Ahora
  todas las fotos del preview (collage de historia, viajes, momentos, muro) usan
  `usePhotoAction()` (`lib/edit-context.tsx`): en edición abren Multimedia en esa
  foto, fuera de edición el lightbox de siempre.
- No había ninguna pista de que el preview se editara: cartel `pa-edit-hint` arriba
  del sitio, que se va con la primera edición.

**Ojo al testear con puppeteer:** el iframe del preview está escalado con
`transform: scale(k)`, y `frame.click(selector)` de puppeteer calcula mal las
coordenadas (aterriza en otro elemento). Hay que mapear a mano:
`page.mouse.click(rect.x + x*k, rect.y + y*k)`. Un click de usuario real funciona
bien. Los eventos de React SÍ llegan dentro del iframe (React engancha los
listeners en el contenedor del portal).

### Abierto

- La `watch.list` queda vacía en el pase determinista (el plan no la trae y
  `enhanceNarrative` no la escribe): la sección de pelis se ve sin títulos hasta
  que la pareja los pida por el chat del editor. Candidato: sumarla al plan.
- `Stats` no tiene copy editable inline (el resto de las secciones sí).

---

## 2026-08-19 — branch `claude/amooor-feedback-bugs-umkh7k`

Feedback de una prueba real del intake. Cuatro bugs, cuatro causas distintas:

### 1. "Asumió que somos lesbianas"

El género salía deducido del nombre. Ahora es un DATO del intake, igual que el
nombre: `orchestrator` lo pide en el PRIMER mensaje junto con los nombres y el
"cuál de los dos sos vos" (única excepción a un-movimiento-por-turno), es
BLOQUEANTE en el checklist oculto, y viaja por el contrato: `plan.pronouns`
(`{ nombre: "el"|"ella"|"elle" }`, tolerante — un valor raro se descarta en vez de
tirar el plan entero) → `WizardState.people.*.pronoun` → payload de
`enhanceNarrative`, con la regla en `skills/website`: sin género, se escribe en
neutro, nunca deducido. La tarjeta del plan (`PlanFacts`) muestra un chip por
persona para corregirlo antes de aprobar.

### 2. "Asumió que estamos en 2024"

Al modelo nunca se le decía qué día es hoy, así que usaba el año de su
entrenamiento. `lib/today.ts` arma el bloque de contexto temporal (en zona AR: el
server corre en UTC y de noche la fecha se iba un día) y `composeSystem` lo mete en
TODO system prompt; el clasificador del checklist lo recibe aparte.

### 3. "Me puso 'cuando esté listo el borrador te aviso' y no pasó nada"

El agente prometía trabajo futuro que no puede hacer (no tiene forma de volver). El
skill ahora lo prohíbe explícito y exige cerrar cada turno con una pregunta o un
empujoncito. Además, dos salidas nuevas para que la entrevista termine siempre:
`userAsksForPlan()` (si la persona pide el plan, se dropea forzado) y un techo por
default de 30 turnos (`MAX_USER_TURNS`, antes ilimitado). Forzado = lo que falta
viaja en `assumptions` y se corrige en la tarjeta.

### 4. "Me puso 'plan listo' y no estaba listo"

`/api/chat` marcaba el paso del timeline como "done" antes de saber si había plan:
si la síntesis fallaba, la UI cantaba "Plan listo" y seguía charlando. Ahora el
paso sólo pasa a "done" con un plan válido en la mano, y si no, queda en `error`
(estado nuevo de `Activity`) con el motivo. `synthesizePlan` además reintenta una
vez en instant si la pasada deep no devuelve JSON válido (y el deep pasó de 6k a 9k
tokens: el reasoning cuenta y se truncaba). Si el plan llega pero no pasa `zPlan`,
el cliente avisa en vez de tragárselo en silencio (`plan_invalid`).

### Abierto

- El género no se propaga al skill `edit` del sitio: una edición por chat puede
  reintroducir concordancia equivocada si el content ya la tenía.
- El evento SSE `progress` sigue sin consumirse en el cliente (la barra del header
  no usa el progreso real del checklist).
