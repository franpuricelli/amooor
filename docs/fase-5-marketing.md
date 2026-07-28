# Fase 5 · Sitio de marketing de la empresa (WP-5)

> Deriva de [`PLAN.md`](./PLAN.md) §3 · WP-5. Objetivo: la landing institucional,
> misma onda que `purivi.love`, en el **apex** (`amooor.com`). Aceptación: landing
> responsive con showcase real y CTAs que entran al onboarding. ✅

## Estado

- [x] **Ruteo por host** (`app/page.tsx`): apex/desconocido → landing de marketing;
      subdominio/dominio propio → el sitio del tenant (`SiteApp`). Reusa `resolveSite`
      (request-cached) de WP-2. El render del tenant se extrajo a `components/SiteApp.tsx`.
- [x] **Landing** (`components/marketing/*`, `lib/marketing.ts`): navbar (marca +
      links + **CTA "Comenzar" arriba a la derecha** → `/comenzar`) · hero con valor +
      preview visual (gradientes, sin imágenes externas) · **cómo funciona** (4 pasos)
      · **showcase** (tenants `showcase` de Convex vía `sites.listShowcase`) · **precios**
      (US$50/US$90/US$150 desde `lib/pricing` + upsell `.love`) · testimonios · FAQ ·
      footer. Estilos scoped `.mk-*` (`marketing.css`) reusando las CSS vars de la paleta.
- [x] **CTAs**: "Comenzar" (nav + hero + cada plan) → `/comenzar` (los planes pasan
      `?plan=<id>` y el wizard lo preselecciona).

## Ruteo

```
Request Host
  amooor.com / localhost   → resolveSite() found=false → <Landing showcase={listShowcase()} />
  puri-e-ivi.amooor.com    → resolveSite() found=true  → <SiteApp /> (sitio del tenant)
```

## Showcase

`sites.listShowcase` (index `by_showcase`) → cards `{subdomain, couple, palette}`.
Cada card linkea a `https://{subdomain}.{APP_DOMAIN}`. Si no hay tenants showcase,
la landing muestra 2-3 cards demo.

## Verificación

```
curl / -H "Host: localhost"           # → landing (Comenzar, Cómo funciona, Precios, mk-root)
curl / -H "Host: puri-e-ivi.amooor…"  # → sitio del tenant (Nuestra historia, wall of love)
```

`next build`: `/` es `force-dynamic` (resuelve el host por request).

## Pendiente

- Poblar `showcase: true` en tenants reales (hoy el seed marca los 2 demo).
- Copy/testimonios definitivos (los actuales son placeholders creíbles).
- El apex necesita el dominio `amooor.com` conectado en Vercel (WP-4 infra).
