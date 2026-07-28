# Fase 4 · Integraciones: pagos, storage, dominios, email (WP-4)

> Deriva de [`PLAN.md`](./PLAN.md) §3/§4/§5 · WP-4. Objetivo: conectar los
> proveedores. Estado: **código completo y verificado donde la cuenta lo permite**;
> dos integraciones quedan a la espera de setup de cuenta (ver "Bloqueos").

## Estado

- [x] **Storage — Cloudflare Images** (`lib/storage.ts`, `app/api/upload`,
      `app/api/upload/complete`): `direct_upload` (URL de un uso) → el browser sube →
      variants `thumb` (w480) / `full` (w1280) → registra `draftPhotos`. Delivery por
      `imagedelivery.net/bXvil24p_Ugo-yywAGj3kQ/<id>/<variant>`. **Token OK**, Images
      **habilitado** en la cuenta. ⚠️ falta cupo (ver Bloqueos).
- [x] **Pagos — Rebill** (embebido, modelo REAL): checkout **widget de front**
      (`components/wizard/RebillCheckout.tsx`) con el SDK `sdk.rebill.com/v3/rebill.js`
      + clave pública `pk_`: `rebill.checkout.create({name, amount(USD), currency,
      metadata:{draftToken}}).mount()`. `app/api/checkout` crea el `order` pending y
      devuelve `{orderId, name, amountUsd, currency}`. El **webhook** (`app/api/webhooks/rebill`,
      `lib/rebill.ts`) verifica firma HMAC, matchea el order por `draftToken`, marca
      `paid` (idempotente) y dispara el finalize. ⚠️ ver Bloqueos.
- [x] **Dominios — Vercel** (`lib/domains.ts`, `app/api/domains`): agrega el `.love`
      al proyecto (`POST /v10/projects/{id}/domains`), lee la config DNS (CNAME
      `cname.vercel-dns.com` / A `76.76.21.21`) y verifica. SSL automático.
- [x] **Dominios — Namecheap** (`lib/namecheap.ts`): **stub documentado** (compra +
      DNS). Falta credenciales/saldo de API (§5). Cada función tira error claro si no
      está configurado; los comandos XML reales están documentados listos para llenar.
- [x] **Email — Resend + React Email** (`lib/email/*`): 5 plantillas (bienvenida,
      re-activación, gracias por la compra, "tu sitio está listo", recuperación de
      acceso) + wrapper `send.ts` (no throwea; si no hay `RESEND_API_KEY`, saltea).
      Los emails de compra + "sitio listo" se disparan desde el finalize.

## Contrato de env (ver `.env.example`)

`REBILL_SECRET_KEY`, `NEXT_PUBLIC_REBILL_PUBLIC_KEY`, `REBILL_WEBHOOK_SECRET` ·
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (+ `R2_*` de fallback) ·
`RESEND_API_KEY`, `RESEND_FROM` · `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`,
`VERCEL_TEAM_ID` · `NAMECHEAP_*` (pendiente) · `INTERNAL_SECRET`.

## Verificación

```
POST /api/upload                     # ✓ 200 → {id, uploadURL} (Cloudflare acepta el token)
   → complete resuelve thumb/full    # ✓ URLs imagedelivery.net/bXvil24p…/<id>/{thumb,full}
   → PUT bytes a Cloudflare          # ⚠️ 5453 "service limit (0)" — falta plan de Images
POST /api/checkout                   # ✓ 200 → {orderId, name, amountUsd, currency} (widget)
GET  sdk.rebill.com/v3/rebill.js     # ✓ 200 (el SDK del checkout embebido está vivo)
```

## Bloqueos (setup de cuenta requerido)

1. **Cloudflare Images: falta el plan/cupo.** Ya está **habilitado** (el `5403 "not
   authorized"` desapareció), pero el upload real devuelve `5453 "account has reached
   a service limit (0). Upgrade your plan"`: la cuenta no tiene el add-on de Images
   contratado (cupo 0). → **Contratar Cloudflare Images** (~US$5/mes) en el dashboard
   (Billing). El código ya funciona (verificado: crea upload URLs + arma las URLs de
   delivery correctas, hash `bXvil24p_Ugo-yywAGj3kQ`). Alternativa: migrar `lib/storage.ts`
   a **R2** (creds ya provistas; requiere bucket + URL pública + resize de variantes).

2. **Rebill: integración corregida al modelo real (SDK embebido).** El checkout es un
   widget de front (`sdk.rebill.com/v3/rebill.js` + `pk_`), NO un redirect server-REST
   (por eso `api.rebill.to/v2` 503eaba). Ya implementado. Falta **verificar en el
   sandbox de Rebill** (con las test keys): (a) que `checkout.create` acepte `metadata`
   para recuperar el `draftToken`; (b) el nombre del evento de éxito del SDK
   (`success`/`payment_success` — hay fallback por postMessage); (c) el header + firma
   + strings de evento del **webhook** (para el finalize autoritativo). Configurar la
   URL del webhook `POST /api/webhooks/rebill` en el dashboard.

3. **Namecheap**: sin credenciales/saldo de API (≈US$50 para habilitarla). Stub listo.
