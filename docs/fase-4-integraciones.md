# Fase 4 · Integraciones: pagos, storage, dominios, email (WP-4)

> Deriva de [`PLAN.md`](./PLAN.md) §3/§4/§5 · WP-4. Objetivo: conectar los
> proveedores. Estado: **código completo y verificado donde la cuenta lo permite**;
> dos integraciones quedan a la espera de setup de cuenta (ver "Bloqueos").

## Estado

- [x] **Storage — Cloudflare Images** (`lib/storage.ts`, `app/api/upload`,
      `app/api/upload/complete`): `direct_upload` (URL de un uso) → el browser sube →
      variants `thumb` (w480) / `full` (w1280) → registra `draftPhotos`. Delivery por
      `imagedelivery.net/<hash>/<id>/<variant>`. **El token funciona** (crea upload
      URLs y resuelve las URLs de delivery). ⚠️ ver Bloqueos.
- [x] **Pagos — Rebill** (`lib/rebill.ts`, `app/api/checkout`,
      `app/api/webhooks/rebill`): crea checkout con `metadata {draftToken, orderId}`,
      guarda el `order`, verifica la firma del webhook (HMAC-SHA256), marca `paid`
      (idempotente) y dispara el finalize. ⚠️ ver Bloqueos.
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
   → complete resuelve thumb/full    # ✓ URLs imagedelivery.net/<hash>/<id>/{thumb,full}
POST /api/checkout                   # error limpio (no crashea) — falta base/SDK de Rebill
```

## Bloqueos (setup de cuenta requerido)

1. **Cloudflare Images no está habilitado en la cuenta.** El upload real devuelve
   `5403 "account not authorized to access this service"`. La cuenta tiene **R2**
   provisto (endpoint S3 + access keys), no Images. Opciones:
   - **(a)** Habilitar Cloudflare Images en el dashboard → el código ya funciona
     tal cual (verificado: crea upload URLs + arma las URLs de delivery correctas,
     account hash `bXvil24p_Ugo-yywAGj3kQ`).
   - **(b)** Migrar a **R2** (creds ya provistas). Requiere: nombre de bucket + URL
     pública (r2.dev o dominio propio) + subida S3 presignada + resize de variantes
     (client-side o Worker de Image Resizing). `lib/storage.ts` está aislado para
     cambiar el backend sin tocar el wizard.
   - Interino disponible: Convex file storage (ya usado para las fotos del default).

2. **Rebill V2 es integración de SDK (front) + precios en el dashboard.** El intento
   server-REST a `api.rebill.to/v2` devuelve 503: la base/endpoint no es esa. Los
   repos de Rebill (`rebillto/v2_example_sdk`, `v2_example-sdk-using-nextjs`) muestran
   un flujo con **`pk_` en el front** apuntando a un producto/precio creado con `sk_`.
   Falta: confirmar base URL + crear el producto/precios en el dashboard + cablear el
   SDK de checkout. `lib/rebill.ts` degrada con error claro mientras tanto; el webhook
   ya está listo (verificación de firma + idempotencia + disparo del finalize).

3. **Namecheap**: sin credenciales/saldo de API (≈US$50 para habilitarla). Stub listo.
