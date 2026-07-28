# Fase 2 · Plataforma multi-tenant + Convex (WP-2)

> Deriva de [`PLAN.md`](./PLAN.md) §1 y §3 · WP-2. Objetivo: **un solo deploy sirve
> N sitios**. Aceptación: dos tenants seed renderizan en dos hosts distintos desde
> el mismo build. ✅

## Estado

- [x] Schema Convex (`convex/schema.ts`) — data model §1: `users`, `products`,
      `templates`, `sites`, `photos`. Deployado al deployment de dev.
- [x] Funciones (`convex/sites.ts`): `getByHost`, `listShowcase`, `upsertBySubdomain`.
- [x] Resolución de host server-side en `lib/site-server.ts` (`resolveSite`,
      memoizado con `cache`): lee `headers().host` (o la cookie de preview
      `amooor_tenant`) → `sites.getByHost`. Sin Edge middleware (evita el
      `__dirname` del runtime edge en Vercel).
- [x] Render por tenant: `app/layout.tsx` aplica el theme del tenant como CSS vars
      y provee su `content` vía `TenantProvider` (`lib/tenant.tsx`); los componentes
      leen `useContent()` en vez de importar el módulo `content`.
- [x] Metadata + viewport per-tenant (`generateMetadata`/`generateViewport`).
- [x] Fallback: sin tenant (apex o Convex caído) → `content`/`theme` default del
      template. Nunca rompe.
- [x] Seed (`app/api/seed`, protegido por `SEED_SECRET`): 2 tenants demo
      (`puri-e-ivi` rosa, `demo` lavanda).
- [ ] Deploy en Vercel for Platforms (necesita cuenta Pro + dominio — WP-4 lado infra).

## Arquitectura del render

```
Request (Host: puri-e-ivi.amooor.com)
  → app/layout.tsx       resolveSite() → headers().host → Convex sites.getByHost → { content, theme }
       ├─ <html style={paletteVars(resolvePalette(theme))}>   (re-tematiza por data)
       └─ <TenantProvider content={content}>
            → app/page.tsx  useContent() → renderiza content.layout vía SECTION_REGISTRY
```

## Contrato de datos (Convex)

`sites`: `{ ownerId?, productSlug?, templateSlug, subdomain, domain?, content (any,
validado por el contentSchema del template), theme {palette, overrides?}, status
(draft|paid|live), showcase?, createdAt, updatedAt }`. Índices: `by_subdomain`,
`by_domain`, `by_owner`, `by_showcase`. Las **secciones viven en `content.layout`**
(no hay tabla `sections`: fuente única = el content del template).

## Verificación

```
POST /api/seed?secret=$SEED_SECRET          # crea puri-e-ivi + demo
curl -H "Host: puri-e-ivi.amooor.com" /     # → "Purivi", Puri & Ivi, canvas #e0abc4
curl -H "Host: demo.amooor.com" /           # → "Mati & Sofi", canvas #c3abe0 (lavanda)
curl -H "Host: amooor.com" /                # → default (fallback)
```
`next build` compila; `/` es dinámica (server-rendered on demand).

## Variables de entorno (ver `.env.example`)

`CONVEX_DEPLOY_KEY` (secret), `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_APP_DOMAIN`,
`SEED_SECRET`. Las keys reales viven en `.env.local` (gitignoreado) y en el env del host.

## Pendiente para fases siguientes

- WP-3: el wizard produce `content`/`theme` y llama `upsertBySubdomain` post-pago.
- WP-4: `photos` se puebla con refs de Cloudflare; dominios propios vía Vercel/Namecheap.
- WP-5: el apex (`amooor.com`) sirve la landing; `listShowcase` alimenta el showcase.
