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
