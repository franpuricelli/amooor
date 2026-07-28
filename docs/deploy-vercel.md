# Deploy en Vercel (proyecto `amooor-bbfefad8`)

Sin dominio propio todavía: se usa la URL `*.vercel.app` y se previsualizan los
tenants con `?tenant=<subdominio>` (los subdominios reales llegan en WP-4 con un
dominio wildcard).

## Setup (una vez)

1. **Env vars** del proyecto (Settings → Environment Variables, scope *Production*):
   - `CONVEX_DEPLOY_KEY` = la **prod deploy key** de Convex (`prod:canny-pheasant-391|…`). Secreto.
   - `SEED_SECRET` = cualquier string aleatorio (protege `/api/seed`).
   - `NEXT_PUBLIC_CONVEX_URL` **NO** hace falta setearla a mano: el build la inyecta
     `npx convex deploy` (ver `vercel.json`), apuntando a la deployment de prod.
   - (opcional, más adelante) `NEXT_PUBLIC_APP_DOMAIN` = `amooor.com`.
2. **Conectar el repo** `franpuricelli/amooor` al proyecto (Git integration). Root
   directory = raíz del repo. Framework: Next.js (autodetectado).
   - Build command ya viene de `vercel.json`: `npx convex deploy --cmd 'npm run build'`
     → deploya las funciones Convex a prod y buildea Next con la URL correcta.

## Después del primer deploy

1. **Seed de prod** (una vez): `POST https://<deployment>.vercel.app/api/seed?secret=<SEED_SECRET>`
   → crea los tenants demo `puri-e-ivi` y `demo` en la deployment de prod.
2. **Ver el multi-tenant** (sin dominio propio, vía cookie de preview):
   - `https://<deployment>.vercel.app/` → default (Puri & Ivi, paleta rosa)
   - `https://<deployment>.vercel.app/api/preview?tenant=demo` → setea la cookie y
     redirige a `/` → Mati & Sofi (lavanda)
   - `https://<deployment>.vercel.app/api/preview?tenant=puri-e-ivi` → Puri & Ivi (rosa)
   - `https://<deployment>.vercel.app/api/preview` (sin `tenant`) → limpia la cookie

## Con dominio propio (WP-4, cuando lo tengas)

- Agregar `amooor.com` y **`*.amooor.com`** (wildcard) al proyecto en Vercel.
- Ahí `<subdominio>.amooor.com` resuelve solo (`resolveSite` lee el host) y la
  cookie de preview deja de hacer falta.

## Estado actual

- Funciones Convex **ya deployadas a prod** (`canny-pheasant-391`); falta el seed de
  datos (paso post-deploy de arriba).
- Deploy key de dev/prod fuera del repo (viven en `.env.local` local y en el env de
  Vercel). Repo público → nunca commitear keys.
