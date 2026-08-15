# Template: `matcha`

**A full story site** — "Their whole story: timeline, trips and photo wall."
Unlike `romantic` / `editorial` / `brutalist` (which are *skins* of the shared
tenant sections), Matcha is a **different structure**: hero → facts → story
timeline → moments (tabbed) → travel → dining bento → why-us → binge/watch →
live counter → wall-of-love → flip-card dedication.

- **id:** `matcha` · **vibe:** `matcha` · catalog entry has `previewIsRoute: true`.
- **Component:** `components/templates/editorial/EditorialTemplate.tsx` (default
  "editorial" variant — warm cream + matcha-green accent). Self-contained styles
  under `.ed` in `editorial.css`; it does NOT use a `[data-template]` block.
- **The template (empty):** `/template/matcha` — the reusable skeleton (structure
  + design, placeholder copy, neutral photo blocks). React route via the registry
  + `app/template/[slug]/page.tsx`.
- **Real examples (filled):** live under `/examples/<slug>` —
  `/examples/purivi-matcha` (Puri & Ivi in Matcha) and `/examples/purivi` (the
  original Puri & Ivi site). The gallery card previews the filled example.

## How the live render works (full integration)

Because it's a different structure, Matcha is not a CSS skin. When
`theme.template === "matcha"`, the render branches:

- **Live tenant:** `app/page.tsx` passes `theme.template` to `SiteApp`, which
  renders `<MatchaSite/>` instead of the section-registry tree.
- **Preview/editor:** `PreviewSite` renders `<MatchaSite/>` under the same branch.

`MatchaSite` (`components/templates/MatchaSite.tsx`) reads the tenant's
`useContent()` + `usePhotos()` and maps them to the template's `EditorialContent`
via `components/templates/editorial/adapt.ts` — so the SAME tenant data + uploaded
photos that drive the default site render as the Matcha story instead. Section
copy the tenant schema lacks (facts labels, dining/why headers) is synthesized in
the adapter.

## Identity

- **Canvas:** warm cream `#f4efe8` / sand bands; one deep **matcha-green** accent
  (`--ed-olive`) for eyebrows, the accent bento card, chips and the flip-card back.
- **Typography:** Fraunces (display serif + italic), Inter (body), Caveat (the
  handwritten dedication) — already loaded in `app/fonts.ts`.
- **Music:** the nav pill toggles the couple's song (`adapt` wires
  `content.media.audioUrl` / `music.audio`).

Full authoring/adaptation guide + design-system do's & don'ts:
`components/templates/editorial.md`.
