# Templates (skins) — `docs/templates/`

Una **plantilla** es un *skin* del sitio del tenant: cambia tipografía, bordes,
tratamiento de superficies y "sensación" del layout, manteniendo las MISMAS
secciones, el mismo `content` y las fotos subidas. El usuario la elige en el
chooser arriba del plan (`components/chat/TemplateChooser.tsx`) y se ve en vivo
en el preview (upload + editor) y en el tenant publicado.

**Convención:** cada plantilla tiene un `.md` en esta carpeta. Al agregar una
plantilla nueva, sumá su `.md` acá (mismo formato que los existentes).

## Cómo funciona (task 2-B)

La plantilla es una dimensión del `Theme`, aparte de la paleta:

```ts
// lib/template.ts
type Theme = { palette: PaletteId; template?: string; overrides?: Partial<Palette> }
```

- Se **persiste** dentro de `draft.theme.template` (Convex). El estado vive en
  `lib/use-conversation.ts` (`template` / `setTemplate`, calcado de `palette`),
  con espejo en `localStorage[amooor_template]` para el flujo sin backend
  (`skip wizard`).
- Se **aplica** como atributo `data-template="<id>"` en el root del render:
  `<html>` en el tenant real (`app/layout.tsx`) y el `<div>` raíz del preview
  (`components/wizard/PreviewSite.tsx`). Sin plantilla → base `romantic`.
- El **CSS** de cada skin vive en `app/globals.css`, bajo `[data-template="<id>"]`.
  `romantic` es la base (`:root`, sin bloque). Los 6 tokens de paleta que el
  render inyecta inline sobre el mismo elemento (`--canvas`, `--canvas-soft`,
  `--canvas-deep`, `--pink`, `--ink`, `--dark`) llevan `!important` en el bloque
  del skin para ganarle al `style` inline.
- Las **fuentes** se cargan en `app/fonts.ts` (un módulo compartido) y su
  `.variable` viaja en el className del root (`fontVariables`), así el skin
  rinde igual en escritorio (in-tree) y en el `<iframe>` celular (portal) de
  `SitePreviewFrame`. Ojo: `font-family: var(--font-x), ...` es inválida entera
  si `--font-x` no está definida (no cae al siguiente nombre) → hay que cargar
  la fuente sí o sí.

Enfoque actual = **style-skin** sobre el único `SECTION_REGISTRY`. NO hay
componentes de sección por plantilla todavía; si en el futuro una variante
necesita otro layout/estructura, ese es el salto a un multi-template real
(cada uno implementando el contrato `TemplateManifest` de `lib/template.ts`) —
mantené el invariante `id de sección == categoría` para no romper el scroll-sync
del upload/editor.

## Checklist para agregar una plantilla nueva

1. **Catálogo:** agregá su `TemplateOption` en `lib/templates-catalog.ts`
   (`id`, `label`, `blurb`, `previewHref`, `vibe`). El `id` es la clave de todo.
2. **Fuentes:** si trae familias nuevas, cargalas en `app/fonts.ts` y sumalas a
   `fontVariables`.
3. **CSS:** agregá el bloque `[data-template="<id>"] { … }` en `app/globals.css`
   (junto a los otros skins). `!important` en los 6 tokens de paleta inline.
4. **Preview standalone (opcional):** si querés el "ver" del card, exportá el
   estático a `public/template/<id>/` (ver `app/template/<id>/page.tsx`).
5. **Doc:** creá `docs/templates/<id>.md` (copiá el formato de acá).
6. **Verificá:** `/comenzar` → `skip wizard` → elegí la plantilla → **Aprobar**
   → el preview del upload debe verse distinto. `npx tsc --noEmit`.

Nada más toca el pipeline: `data-template` fluye solo desde `theme.template` a
través de `PreviewSite` / `app/layout.tsx`.

## Plantillas

- [romantic](./romantic.md) — la base cálida (Puri & Ivi).
- [editorial](./editorial.md) — fine-art claro, monocromo.
- [brutalist](./brutalist.md) — neo-brutalista, bloques y contraste.
