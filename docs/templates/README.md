# Templates (skins) — `docs/templates/`

A **template** is a *skin* of the tenant site: it changes typography, borders,
surface treatment and the overall "feel" of the layout, while keeping the SAME
sections, the same `content`, and the uploaded photos. The user picks it in the
chooser above the plan (`components/chat/TemplateChooser.tsx`); it shows live in
the preview (upload + editor) and on the published tenant.

**Convention:** every template has a `.md` in this folder. When you add a new
template, add its `.md` here (same shape as the existing ones).

## How it works (task 2-B)

The template is a dimension of `Theme`, separate from the palette:

```ts
// lib/template.ts
type Theme = { palette: PaletteId; template?: string; overrides?: Partial<Palette> }
```

- **Persisted** inside `draft.theme.template` (Convex). State lives in
  `lib/use-conversation.ts` (`template` / `setTemplate`, modelled on `palette`),
  mirrored to `localStorage[amooor_template]` for the no-backend flow
  (`skip wizard`).
- **Applied** as a `data-template="<id>"` attribute on the render root:
  `<html>` for the real tenant (`app/layout.tsx`) and the root `<div>` of the
  preview (`components/wizard/PreviewSite.tsx`). No template → base `romantic`.
- The **CSS** for each skin lives in `app/globals.css`, under
  `[data-template="<id>"]`. `romantic` is the base (`:root`, no block). That block
  holds the *treatment* (typography, borders, radii, shadows, photo filters) plus
  **fallback** colors.
- The skin's **colors follow the chosen palette**: `templateVars()` (`lib/theme.ts`)
  derives each skin's surface tokens (canvas, ink, glass, `--pop`, panel tints…)
  from the palette's accent and ships them as inline vars on the render root, next
  to `paletteVars()` — both come from `themeVars(theme)`. So the template decides
  *how* the site feels and the palette decides *what color* it is. Never re-add
  `!important` color declarations to a skin block: that's exactly what made a
  chosen palette do nothing on editorial/brutalist (QA, ago-2026).
- **Fonts** load in `app/fonts.ts` (a shared module) and their `.variable`
  rides in the render root's className (`fontVariables`), so the skin renders the
  same on desktop (in-tree) and inside the mobile `<iframe>` (portal) of
  `SitePreviewFrame`. Note: `font-family: var(--font-x), ...` is invalid as a
  whole if `--font-x` isn't defined (it does NOT fall through to the next name) —
  so the font must be loaded, or the template won't render its typography.

Current approach = **style-skin** over the single `SECTION_REGISTRY`. There are
NO per-template section components yet; if a future variant needs a different
layout/structure, that's the jump to a real multi-template system (each one
implementing the `TemplateManifest` contract in `lib/template.ts`) — keep the
`section id == category` invariant so the upload/editor scroll-sync doesn't break.

## Checklist to add a new template

1. **Catalog:** add its `TemplateOption` in `lib/templates-catalog.ts`
   (`id`, `label`, `blurb`, `previewHref`, `vibe`). The `id` is the key to
   everything.
2. **Fonts:** if it brings new families, load them in `app/fonts.ts` and add
   them to `fontVariables`.
3. **CSS:** add the `[data-template="<id>"] { … }` block in `app/globals.css`
   (next to the other skins) with the treatment + fallback colors — **no
   `!important` on color tokens**. If the skin needs its own color identity,
   derive it from the palette in `templateVars()` (`lib/theme.ts`) so it follows
   whatever palette the couple picked.
4. **Standalone preview (optional):** if you want the card's "view", export the
   static build to `public/template/<id>/` (see `app/template/<id>/page.tsx`).
5. **Doc:** create `docs/templates/<id>.md` (copy the shape used here).
6. **Verify:** `/comenzar` → `skip wizard` → pick the template → **Aprobar** →
   the upload preview should look different. `npx tsc --noEmit`.

Nothing else touches the pipeline: `data-template` flows on its own from
`theme.template` through `PreviewSite` / `app/layout.tsx`.

## Templates

- [romantic](./romantic.md) — the warm base (Puri & Ivi).
- [editorial](./editorial.md) — light fine-art, low chroma (tinted by the palette).
- [brutalist](./brutalist.md) — neo-brutalist, blocks and contrast (accent = palette).
- [matcha](./matcha.md) — a **different structure** (story timeline / travel /
  wall of love), not a skin; renders via `MatchaSite` + the content adapter. See
  also `components/templates/editorial.md`.
