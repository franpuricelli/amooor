// ─────────────────────────────────────────────────────────────────────────────
//  lib/rebill.ts — integración de pagos con Rebill (WP-4, LATAM, pago único).
//
//  Modelo REAL de Rebill v3 (confirmado con sus repos de ejemplo,
//  github.com/rebillto/v2_example-sdk-using-nextjs): el checkout es un WIDGET de
//  FRONT embebido, NO un redirect server-side:
//    <script src="https://sdk.rebill.com/v3/rebill.js"></script>
//    const rebill = new window.Rebill(PUBLIC_KEY);         // pk_...
//    const form = rebill.checkout.create({ name, amount, currency, metadata });
//    form.mount("rebill");                                  // inserta el iframe
//  → lo maneja components/wizard/RebillCheckout.tsx. `amount` va en DÓLARES.
//
//  Este módulo (server) sólo cubre el WEBHOOK: verifica la firma con la clave
//  secreta y extrae el evento. Necesita:
//    REBILL_WEBHOOK_SECRET  → secreto HMAC para verificar webhooks
//    REBILL_SECRET_KEY      → (reservado) para consultar la API de pagos si hiciera falta
//
//  ⚠️  A CONFIRMAR CON EL DASHBOARD/SANDBOX DE REBILL (el resto ya es correcto):
//    - Header de firma del webhook (probamos 'rebill-signature'/'x-rebill-signature'/'x-signature').
//    - Algoritmo de firma (asumido HMAC-SHA256 hex).
//    - Strings de los eventos de pago exitoso (ver isPaymentSuccess).
//    - Que `checkout.create` acepte `metadata` (para recuperar el draftToken) — muy probable.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "node:crypto";

// ── verifyWebhook ──────────────────────────────────────────────────────────────

/**
 * Verifica la firma HMAC-SHA256 de un webhook de Rebill.
 *
 * ⚠️ Confirmar con Rebill:
 *   - El algoritmo (asumido: HMAC-SHA256 sobre el raw body, hex-encoded).
 *   - Si usan base64 en lugar de hex.
 *   - Si incluyen un prefijo tipo "sha256=" en el header.
 */
export function verifyWebhook(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.REBILL_WEBHOOK_SECRET;

  if (!secret) {
    // En desarrollo sin secreto configurado, permitir pero advertir.
    console.warn(
      "[rebill] REBILL_WEBHOOK_SECRET no configurado — omitiendo verificación de firma (solo dev)"
    );
    return true;
  }

  if (!signature) {
    console.warn("[rebill] Webhook recibido sin header de firma");
    return false;
  }

  // Algunos providers prefijan con "sha256="; normalizamos.
  const normalizedSig = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Comparación timing-safe para evitar timing attacks.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedSig, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    // timingSafeEqual lanza si los buffers tienen distinta longitud.
    return false;
  }
}

// ── parseWebhookEvent ──────────────────────────────────────────────────────────

export interface RebillWebhookEvent {
  /** Tipo de evento. Ej: 'payment.approved', 'payment.paid'. ⚠️ Confirmar nombres reales. */
  type: string;
  /** ID de la transacción/payment-link en Rebill (el providerId que guardamos). */
  providerId: string | null;
  /** draftToken recuperado de metadata. */
  draftToken: string | null;
  /** orderId recuperado de metadata. */
  orderId: string | null;
  /** Payload crudo para debugging. */
  raw: unknown;
}

/**
 * Parsea el payload de un webhook de Rebill de forma defensiva.
 *
 * ⚠️ La estructura exacta del payload debe confirmarse contra el dashboard de Rebill.
 *    Aquí se asumen los campos más probables basándonos en convenciones de la industria.
 */
export function parseWebhookEvent(body: unknown): RebillWebhookEvent {
  // Trabajamos con el objeto como Record<string, unknown> para acceso seguro.
  const payload = (body ?? {}) as Record<string, unknown>;

  // ── tipo del evento ─────────────────────────────────────────────────────────
  // Rebill puede usar: type, event, eventType, status
  const type = String(
    payload["type"] ??
    payload["event"] ??
    payload["eventType"] ??
    payload["status"] ??
    "unknown"
  );

  // ── providerId ─────────────────────────────────────────────────────────────
  // Puede estar en: id, paymentId, payment_id, transactionId, data.id
  const data = (payload["data"] ?? {}) as Record<string, unknown>;
  const providerId = String(
    payload["id"] ??
    payload["paymentId"] ??
    payload["payment_id"] ??
    payload["transactionId"] ??
    payload["transaction_id"] ??
    data["id"] ??
    data["paymentId"] ??
    data["payment_id"] ??
    ""
  ) || null;

  // ── metadata ──────────────────────────────────────────────────────────────
  // Metadatos que enviamos al crear el checkout.
  const meta = (
    payload["metadata"] ??
    payload["meta"] ??
    data["metadata"] ??
    data["meta"] ??
    {}
  ) as Record<string, unknown>;

  const draftToken = String(meta["draftToken"] ?? payload["draftToken"] ?? "") || null;
  const orderId = String(meta["orderId"] ?? payload["orderId"] ?? "") || null;

  return { type, providerId, draftToken, orderId, raw: body };
}

// ── isPaymentSuccess ───────────────────────────────────────────────────────────

/**
 * Determina si el evento es un pago exitoso.
 *
 * ⚠️ Confirmar los tipos de evento exactos en la documentación de Rebill.
 *    Nombres asumidos por convención (similares a Stripe/MercadoPago).
 */
export function isPaymentSuccess(type: string): boolean {
  return [
    "payment.approved",
    "payment.paid",
    "payment.completed",
    "charge.approved",
    "charge.succeeded",
    "transaction.approved",
    "transaction.completed",
    "approved",
    "paid",
    "completed",
  ].includes(type.toLowerCase());
}
