# Fase 3 · Onboarding + generación IA + skills (WP-3)

> Deriva de [`PLAN.md`](./PLAN.md) §2 y §3 · WP-3. Objetivo: el **wizard completo**
> que arma un draft y, post-pago, genera el sitio live. Aceptación: un usuario arma
> un draft, paga y obtiene un sitio con su contenido. ✅ (verificado local sin pago;
> el pago real depende de WP-4 · Rebill).

## Estado

- [x] **Contrato del wizard** (`lib/draft.ts`): `WizardState` (Zod) — pareja, fechas,
      perfil por persona (apodo/personalidad/bandas), historia libre, secciones
      editables, categorías de fotos, destinos, watchlist, música, video, paleta,
      dominio. `defaultWizardState()` trae las **secciones recomendadas**.
- [x] **Wizard UI** (`components/wizard/*`, 9 pasos §2): nombres+fechas · perfil por
      persona · historia · **secciones** (agregar/quitar/renombrar/reordenar/editar
      por IA + asignar categorías) · **fotos** (upload + bucket "Todas" + recategorizar)
      · música/video · **5 paletas** · dominio+email · **Review → paywall**.
- [x] **Persistencia** (`lib/use-draft.ts` + `convex/drafts.ts`): identidad por
      `token` (uuid en localStorage, login opcional), **autosave con debounce**,
      rehidratación al volver (`drafts.save`/`drafts.get`).
- [x] **Generador determinista** (`lib/generate.ts`): `WizardState` + fotos →
      `Content` completo y válido (contentSchema). Nunca depende de la IA para
      producir un sitio coherente.
- [x] **Skills IA** (`lib/ai.ts`): `generar-narrativa` (reescribe hero.lede,
      taglines y textos de beats con la voz de la pareja) y `editar-contenido`
      (edición por prompt del plan `pro`). Runtime Claude Sonnet / Kimi. **Opcional**:
      sin API key, el generador determinista ya arma el sitio.
- [x] **Preview del sitio** (`/comenzar/preview` + `components/wizard/PreviewSite.tsx`):
      en el Review se ve el sitio real (mismo render que la home) antes de pagar.
- [x] **Generación** (`app/api/generate` + `convex/generate.ts`):
      `mode=preview` guarda el content en el draft; `mode=finalize` (post-pago,
      secret interno) crea el `site` LIVE, copia las fotos, asigna subdominio único
      y dispara emails.
- [x] **Precios** (`lib/pricing.ts`): 3 planes US$50/US$90/US$150; `pro` incluye
      edición IA; upsell de dominio `.love`. Pago único, sin suscripción.

## Flujo

```
/comenzar  → Wizard (autosave → drafts.save)
   Review  → POST /api/generate {mode:preview}  → content (determinista + IA) → draft.content
           → "Generar y pagar" → POST /api/checkout (Rebill, WP-4) → checkoutUrl
   [pago]  → webhook Rebill → POST /api/generate {mode:finalize,secret}
              → generate.finalizeSite: crea site (status live) + copia fotos + draft→paid
              → emails (gracias + "tu sitio está listo")
   /comenzar/listo → poll generate.siteByDraft → link al sitio
```

## Data model agregado (Convex)

- `drafts` (por `token`): `answers` (WizardState), `theme`, `subdomain?`, `plan?`,
  `content?` (preview), `email?`, `status` (editing→generating→ready→paid).
- `draftPhotos` (por `draftToken`): `category`, `cloudflareId`, `thumbUrl`, `fullUrl`,
  `order`, `caption?`. Categoría `all` = bucket de no categorizadas.
- `sites`: +`plan`, +`draftToken`, +`ownerEmail`, +`domain`/`domainStatus`.
- `orders` (Rebill, WP-4).

## Fotos per-tenant (refactor de render)

Antes las secciones importaban el manifiesto estático `lib/photos.ts` (las 468 de
Puri & Ivi). Ahora leen `usePhotos()` (`lib/photos-context.tsx`): si el tenant trae
`content.media` (fotos subidas), resuelve de ahí; si no, cae al estático. El
`MediaSet` se arma con `mediaFromPhotos()` desde `draftPhotos`.

## Verificación (local, sin pago)

```
# draft → preview → finalize (script de prueba)
node _test-gen.mjs
  ✓ preview: couple "Nico & Lu", palette menta, secciones [hero,historia,viajes,stats,galeria]
  ✓ finalize: subdomain nico-e-lu → https://nico-e-lu.amooor.com
curl -H "Host: nico-e-lu.amooor.com" /   # → sitio con paleta menta (--canvas #9ad9c0)
```

`next build` compila las 13 rutas. El wizard es `force-dynamic`.

## Pendiente

- **Pago real**: depende de WP-4 (Rebill V2 usa SDK de front `pk_` + precios en el
  dashboard; ver fase-4). El finalize ya está listo y se dispara desde el webhook.
- Emails de **bienvenida/re-activación**: las funciones existen (`lib/email`), falta
  el disparador (welcome al capturar email; reactivación vía cron de Convex).
- **Traits/artistas por hover**: hoy se derivan de personalidad+bandas; un editor de
  traits fino es mejora.
