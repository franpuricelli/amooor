# CLAUDE.md — amooor

Project context for agents. Durable conventions and gotchas live here; the finer
product docs live in `docs/` (§References).

## What it is

amooor turns a conversation into an anniversary/couple website. One Next.js app,
three surfaces, routed by host in `app/page.tsx`:

- **Marketing landing** (`amooor.com` apex) — `components/marketing/*`, CSS prefix
  `.mk-`. See `docs/design-system-landing.md`.
- **Tenant site** (each couple's site, `<slug>.amooor.com`) — the *template*,
  rendered from `content` + `theme` by `SECTION_REGISTRY`
  (`components/sections/registry.tsx`). Site colors are CSS vars from the palette
  (`app/globals.css`).
- **Builder `/comenzar`** — the chat-first flow that replaced the wizard
  (`components/chat/*`). Most recent work lives here.

## Service → file map

Not obvious from `package.json`; the full env list is in `.env.example`.

- Persistence: **Convex** (`convex/`) — drafts, photos, videos, sites, orders.
- Photos: **Cloudflare Images**; assets/videos: **R2** — `lib/storage.ts`.
- Assistant LLM: **Kimi (Moonshot)** — `lib/llm.ts` (server-only).
- Voice dictation: **Deepgram** — `app/api/deepgram/token/route.ts`.
- Payments **Rebill**, domains **Vercel/Namecheap**, email **Resend**.

## `/comenzar` flow

`components/chat/Chat.tsx` drives: **intake** (chat builds a `Plan` via `/api/chat`
SSE) → **PlanCard** (refine, then **Aprobar**) → **PostApprove**
(`components/chat/postapprove/`): `upload → build → edit`.

- **BuildStep** — `POST /api/generate` (mode `preview`) → `{ content, theme }`.
  Runs **once**; later photo changes re-bind through `rebindMedia`, never
  regenerate (so edited copy survives).
- **EditStep** — the editor: sidebar (Chat | Multimedia) + live preview
  (`SitePreviewFrame` → `PreviewSite`), inline copy editing, palette in the
  preview's browser-bar.
- Dev shortcut: type **`skip wizard`** to load the Puri & Ivi plan
  (`lib/demo-plan.ts`) and skip the interview.

State persists in a Convex **draft** (token in `localStorage`,
`lib/use-conversation.ts`): `conversation`, `intakePlan`, `theme`, `content`,
`status`.

## Palette / theme

`Theme = { palette: PaletteId; overrides?: Partial<Palette> }` (`lib/template.ts`).
`resolvePalette()` / `paletteVars()` in `lib/theme.ts` expand it into the 13
CSS-var tokens every site color reads. Custom palettes derive from one hex
(`lib/palette-gen.ts:paletteFromHex`) and the full `Palette` must ride in
`theme.overrides` — otherwise `resolvePalette` falls back to the default and the
custom color silently does nothing.

## Media upload (3 hops)

`lib/media-client.ts`: `POST /api/upload` (Cloudflare direct-upload URL) → `PUT`
the file to Cloudflare → `POST /api/upload/complete` (register to the Convex
draft; `addDraftPhoto` in `convex/photos.ts` carries `filename`). Needs both the
Cloudflare creds and `NEXT_PUBLIC_CONVEX_URL`.

## Env: keys are Next-side

Almost every key is read by the **Next server** (`app/api/*`, `lib/llm.ts`,
`lib/storage.ts`), not Convex — locally in `.env.local` (gitignored), in prod on
**Vercel**. Setting them in the Convex dashboard does nothing for chat/upload;
the only var Convex functions read is **`ASSET_SECRET`** (`grep process.env
convex/`). `.env.example` is the versioned template; `.env*` is gitignored — keep
secrets out of commits.

## Convex deployments

dev `hallowed-kookabura-859` · prod `canny-pheasant-391` (project `amoor`).

- Push functions/schema to dev: `CONVEX_DEPLOY_KEY="<dev key>" npx convex dev --once`.
- Push to prod only at release, together with the frontend:
  `CONVEX_DEPLOY_KEY="<prod key>" npx convex deploy`. Deploying a branch's
  functions to prod on their own desyncs the live frontend from its backend.
- Deploy keys come from the dashboard (Settings → Deploy Keys); keep them out of
  versioned files. A `preview:` key can't provision from here (`TeamNotFound`) —
  use a `dev:`/`prod:` key. Optional fields (`v.optional`) are safe additive
  migrations.

## Gotchas

- **Dev server:** `PORT=3219 npm run dev`. Port `3111` is taken by another app,
  and `-p` gets swallowed by a proxy, so pass the port via `PORT`. Confirm it
  serves amooor (`curl localhost:3219 | grep -o amooor`), not the other app.
- **Fresh workspace:** may arrive without `node_modules` — `npm ci`.
- **Typecheck instead of build while dev runs:** `next build` overwrites the dev
  server's `.next` and 500s it; validate with `npx tsc --noEmit`.
- **Stale dev deployment:** a Convex validator rejecting a field the code sends
  (e.g. `filename`) means the deployment is behind the branch — push functions.
- **Deepgram:** restricted keys can't mint ephemeral tokens (`/v1/auth/grant` →
  403). For local dev, `DEEPGRAM_ALLOW_RAW_KEY=1` serves the real key to the
  browser; prod needs a key with `grant/keys:write`.
- **Editor screenshot:** `puppeteer-core` + Chrome
  (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `headless:
  "new"`), run the `.mjs` from repo root. Reach the editor via `/comenzar` →
  `skip wizard` → **Aprobar** → click the upload's primary CTA through to **Crear
  mi sitio** → build.
- The **"N" bubble bottom-right** in dev is the Next.js indicator, not the app.

## References (docs/)

- `design-system-landing.md` — the landing's visual system (`.mk-`).
- `PLAN.md`, `fase-1..5-*.md` — product plan and phases.
- `deploy-vercel.md` — deploy.
- `session-learnings.md` — per-session episode log (debugging narratives, open items).
