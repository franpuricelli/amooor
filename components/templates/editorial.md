# Story template guide (`Historia` / `Romántica`)

How to adapt the editorial storytelling template to a new amooor couple. Written
for agents: read this, then produce a filled `content.ts` (+ `content.en.ts`) and,
if wanted, a new palette skin — nothing else needs to change.

The template ships **couple-agnostic**: the component + styles + a self-contained
plain skeleton (`content.plain.ts`) that renders placeholder copy and a single
placeholder image. Adapting to a couple = author a filled content module of the
same shape (`EditorialContent`, `content-schema.ts`) and point the registry at it.

## What it is

One self-contained, full-page template that tells a couple's story, structured
like the Boty editorial reference but reframed as a narrative (not commercial).
It ships as **two skins of the same component**:

- **`/template/editorial`** — "Historia": warm cream + olive, elegant serif.
- **`/template/romantic`** — "Romántica": blush + rose/wine, italic accents.
- **`/template/plain`** — the empty skeleton (placeholder copy, no photos).

English twins live at `/en/template/<slug>`. Until a couple's content is wired,
all three render the plain skeleton.

## Design system — do's & don'ts

The look is *editorial*: warm neutral bands, one deep accent, a high-contrast
serif over a clean sans, generous whitespace, soft-rounded photo cards. Keep new
work inside these rules so both skins (and future ones) stay coherent.

### Colour

- **Do** drive every colour from the `--ed-*` tokens (`--ed-cream`,
  `--ed-sand`, `--ed-olive` accent, `--ed-ink`, `--ed-muted`, `--ed-card`, …).
  New colour? Add it as a token, then set it per skin.
- **Do** keep exactly **one** deep accent (`--ed-olive`) — used for eyebrows,
  buttons, the accent bento card, chips, the flip-card back. Restraint is the look.
- **Don't** hard-code hex values in section/component CSS. The only exception is a
  **neutral** scrim (e.g. `rgba(24,22,16,.9)`) that must read on every skin.
  Hard-coded greens in the dark `watch` section are exactly what forced per-skin
  overrides in `.ed--romantic` — avoid creating more of those.
- **Don't** use pure `#000`/`#fff` for text or surfaces — use `--ed-ink` and the
  cream tokens.

### Type

- **Do** use **Fraunces** (`.ed-serif` / `var(--ed-serif)`) for display headings
  and the `&`; **Inter** for body/labels; **Caveat** *only* for the handwritten
  dedication message.
- **Do** keep the scale contrast dramatic: huge serif headings vs. small muted
  body. Eyebrows are short, UPPERCASE, letter-spaced, accent-coloured
  (`.ed-eyebrow`).
- **Do** keep the hero headline two short lines — plain `line1` + *italic*
  `line2` — for impact.
- **Don't** add a fourth font family, mix serif/sans within one role, or write
  paragraph-length eyebrows/headlines.

### Layout & rhythm

- **Do** preserve the alternating background bands (cream → cream-soft → sand …)
  so sections read as distinct beats, with **one** dark section (`watch`) as the
  single high-contrast moment.
- **Do** keep section padding on the existing `clamp()` scale (lots of
  whitespace) and card radii consistent (~22–28px within a section).
- **Don't** add a second dark section, cram sections edge-to-edge, or mix wildly
  different corner radii in one area.

### Imagery

- **Do** render every photo through `<Ph>` and use `object-fit: cover` with a
  fixed aspect ratio (cards 3/4, destinations 4/5, collage tilts). Photos are the
  content — let them be big and clean.
- **Do** place text over a photo **only** with a scrim (`::after` gradient), as in
  the hero, `bento-green`, and `bento-light` — never raw text on a busy image.
- **Don't** stretch/distort photos, rely on an image happening to be dark, or
  re-introduce the removed moment-card badges (cards stay clean; a click opens the
  lightbox).

### Scoping & parity

- **Do** keep every selector under `.ed` (skins under `.ed--romantic`) and prefix
  classes `ed-`, so styles never leak into the tenant site (`globals.css`) or the
  marketing landing (`.mk-`).
- **Don't** ship a change to `content.ts` without mirroring it in `content.en.ts`,
  and don't add global (unscoped) selectors.

## File map

```
app/template/[slug]/page.tsx            ES route  → registry.render("es")
app/en/template/[slug]/page.tsx         EN route  → registry.render("en")
components/templates/registry.tsx       slug → element (wire a couple's content here)
components/templates/editorial/
  ├─ EditorialTemplate.tsx   presentational component (all sections + music hook)
  ├─ EditorialLightbox.tsx   self-contained photo viewer (carousel+filmstrip+grid)
  ├─ content-schema.ts       the EditorialContent type (the contract, no data)
  ├─ content.plain.ts        the empty skeleton — ships with the template (DEFAULT)
  ├─ content.ts              a couple's ES copy + photos (adaptation; optional)
  ├─ content.en.ts           EN twin — SAME shape (EditorialContent)
  └─ editorial.css           all styles, scoped .ed / skin under .ed--romantic
```

The component is **purely presentational**: it reads everything from a `content`
object (`EditorialContent`, defined in `content-schema.ts`) and defaults to
`content.plain.ts`. To adapt to a couple you author `content.ts` (+ `content.en.ts`)
of the same shape and point the registry's `editorial`/`romantic` entries at it —
nothing else changes.

## Sections (order) and what to fill

Each maps to a real part of the couple's story:

1. **nav** — the couple name (pill). Clicking it plays `music.src`.
2. **hero** — full-bleed photo, eyebrow, two-line headline (`line1` + italic
   `line2`), `lede`.
3. **facts** — 4 icon + number + label stats (years, trips, photos, etc.).
   `icon` ∈ `calendar | plane | home | infinity | heart | spark | leaf`.
4. **story** — the origin beats (how they met → fell in love → …). Each beat is
   a `kicker` + `title` + `text` + a **photo collage** (`photos: string[]`, 3
   shown tilted, all open in the lightbox).
5. **moments** — tabbed categories (Valentine's, anniversaries, …). Each tab has
   visible `items` (card `img`/`title`/`sub`) + `more` (extra photos). Clicking a
   card opens the lightbox over the **whole tab album** (`items ++ more`).
6. **travel** — destination cards: `title`, `place`, `flag` (or `emoji`), `img`,
   `count`.
7. **dining** (bento) — a big photo + an accent card with a `checklist` + a
   full-image card. Rename copy to any "shared ritual" theme.
8. **why** — split: portrait photo + 4 value cards (`icon`+`title`+`sub`).
9. **watch** — dark section: 3 `favs` (title/kind/note) + a `titles` chip cloud.
10. **counter** — live time since `counter.since` (ISO date) + stat `chips`.
11. **gallery** — "Wall of love": `photos: string[]` drift in columns; click →
    lightbox over all.
12. **dedication** — a **flip card** (drawing front → `message`/`from` back),
    `title`, `line`, and the footer `credit`.

Unused-but-present fields: `scrollLabel` (scroll cue was removed) — safe to leave.

## Images

Photos are referenced by URL. Helpers in `content.ts`:

```ts
THUMB(cat, slug)  // https://<host>/thumbs/<cat>/<slug>.jpg   (grid/cards/collage)
FULL(cat, slug)   // https://<host>/photos/<cat>/<slug>.jpg   (hero only, hi-res)
FLAG(code)        // https://<host>/brand/flags/<code>.png
DRAWING           // https://<host>/drawing.png
```

The current sample points at `www.purivi.love` (a real deployed tenant). **When
adapting to a new user**, change `BASE` to that tenant's host (or use absolute
URLs to their Cloudflare/R2 assets) and swap the `cat`/`slug` pairs.

- **Verify slugs exist** before shipping — a live deployment's photo set can
  differ from `lib/photos.ts`. Scrape the target site's HTML for
  `/(thumbs|photos)/<cat>/<slug>.jpg` and only use paths that return `200`.
- Every photo renders through `<Ph>`, which falls back to a tasteful gradient
  block if a URL 404s — so a wrong slug degrades gracefully, never a broken icon.
- Only the hero has a `FULL` (hi-res) variant on purivi; everything else is a
  thumb. The lightbox passes `{src: thumb, thumb}` so thumbs are fine.

## Music

The nav pill is a play/pause toggle for `content.music.src` (an mp3 URL). The
sample uses the tenant's Convex-hosted song. Point `music.src` at the user's
track. The heart beats (CSS) while playing.

## Locales

`content.ts` is the default (Spanish); `content.en.ts` is an English twin with
the **exact same shape**. Keep them in sync — when you add/remove a field or
change structure, edit both. Photos are shared via the imported helpers, so image
URLs live in one place.

## Adapting to a new user — checklist

1. Gather: couple names, key dates, the story beats, trip list, favorite
   shows/movies, and their photos (grouped by category).
2. Copy the `editorial/` folder to a new template dir (or reuse it) and fill
   `content.ts`: `couple`, `hero`, `facts`, `story.beats`, `moments.tabs`,
   `travel.destinations`, `dining`, `why`, `watch`, `counter` (set `since` to
   their anniversary ISO date), `gallery.photos`, `closing`, `music.src`.
3. Mirror the copy into `content.en.ts` (translate strings; keep image slugs).
4. Point `BASE`/URLs at the user's photo host and verify every slug is `200`.
5. Pick a skin: `variant="editorial"` (default) or `"romantic"`, or add a new
   one (below).
6. `npx tsc --noEmit` and eyeball both `/template/<slug>` and `/en/template/<slug>`.

## Adding a new skin (palette)

Skins are pure CSS — no new component. In `editorial.css`, add a modifier block
that overrides the `--ed-*` variables (see `.ed--romantic` for the full list),
plus any hard-coded accent overrides in the dark `watch` section. Then:

- pass `variant="<name>"` from `EditorialTemplate` (extend the union type), and
- register it in `registry.tsx` with its own slug.

The 13-ish tokens to set: `--ed-cream`, `--ed-cream-soft`, `--ed-sand`,
`--ed-sand-deep`, `--ed-olive` (accent), `--ed-olive-soft`, `--ed-ink` (text +
dark sections), `--ed-muted`, `--ed-line`, `--ed-card`, `--ed-badge`.

## Registering a template

`components/templates/registry.tsx`:

```tsx
myslug: {
  slug: "myslug",
  name: "Display name",
  description: "One-line description.",
  render: (locale) => <EditorialTemplate content={locale === "en" ? en : es} variant="myskin" />,
},
```

It's then served at `/template/myslug` and `/en/template/myslug` automatically.
