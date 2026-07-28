// ─────────────────────────────────────────────────────────────────────────────
//  lib/rebill.ts — cliente REST de Rebill para pagos únicos (WP-4, LATAM).
//
//  Necesita:
//    REBILL_SECRET_KEY      → clave secreta (Bearer token para la API)
//    REBILL_WEBHOOK_SECRET  → secreto HMAC para verificar webhooks
//    REBILL_API_BASE        → (opcional) base URL; default https://api.rebill.to/v2
//
//  ⚠️  PENDIENTE CONFIRMAR CON DASHBOARD/SANDBOX DE REBILL:
//    1. Ruta exacta para crear pago único: /payment-links (asumida)
//    2. Campos del request body: amount, currency, metadata, successUrl, cancelUrl
//       (asumidos por analogía con Stripe/MercadoPago; Rebill puede usar snake_case)
//    3. Campos de la respuesta: id + url|paymentUrl|link (normalizados defensivamente)
//    4. Header de firma en webhooks: 'rebill-signature' (asumido; alternativas en webhook route)
//    5. Tipos de eventos: 'payment.approved'|'payment.paid'|'charge.approved' (asumidos)
//    6. Algoritmo de firma: HMAC-SHA256 hex (asumido; estándar de la industria)
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "node:crypto";

// ── Configuración ─────────────────────────────────────────────────────────────

/** Base URL configurable por env var. Confirmar con el dashboard de Rebill. */
const BASE = process.env.REBILL_API_BASE ?? "https://api.rebill.to/v2";

function getSecretKey(): string {
  const key = process.env.REBILL_SECRET_KEY;
  if (!key) throw new Error("REBILL_SECRET_KEY no configurado");
  return key;
}

// ── Tipos internos ─────────────────────────────────────────────────────────────

interface RebillPaymentLinkRequest {
  /** Monto en centavos (ej: 5000 = USD 50.00). ⚠️ Confirmar si Rebill acepta centavos o entero. */
  amount: number;
  currency: string;
  /** URL de retorno en pago exitoso. */
  successUrl: string;
  /** URL de retorno si el usuario cancela. */
  cancelUrl: string;
  /** Metadatos libres para recuperar en el webhook. */
  metadata: Record<string, string>;
  /** Email del comprador (prefill en el checkout). */
  email?: string;
}

/** Respuesta cruda de Rebill (múltiples variantes defensivas). */
interface RebillPaymentLinkRaw {
  id?: string;
  paymentId?: string;
  url?: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  link?: string;
  payment_url?: string;
  checkout_url?: string;
  // Rebill puede anidar en data
  data?: {
    id?: string;
    url?: string;
    checkoutUrl?: string;
    paymentUrl?: string;
    link?: string;
  };
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  providerId: string;
}

// ── createCheckout ─────────────────────────────────────────────────────────────

/**
 * Crea un link de pago único en Rebill.
 *
 * Endpoint asumido: POST ${BASE}/payment-links
 * ⚠️ Confirmar la ruta exacta, los campos del body y los nombres en la respuesta
 *    contra el dashboard/sandbox de Rebill antes de ir a producción.
 */
export async function createCheckout({
  draftToken,
  plan,
  amount,
  currency,
  email,
  orderId,
  successUrl,
  cancelUrl,
}: {
  draftToken: string;
  plan: string;
  amount: number;
  currency: string;
  email?: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CreateCheckoutResult> {
  const secretKey = getSecretKey();

  const body: RebillPaymentLinkRequest = {
    amount,
    currency,
    successUrl,
    cancelUrl,
    metadata: {
      draftToken,
      orderId,
      plan,
    },
    ...(email ? { email } : {}),
  };

  // ⚠️ Ruta asumida: /payment-links. Alternativas frecuentes: /checkout, /payments
  const res = await fetch(`${BASE}/payment-links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(sin cuerpo)");
    throw new Error(
      `Rebill createCheckout falló: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const raw: RebillPaymentLinkRaw = (await res.json()) as RebillPaymentLinkRaw;

  // Normalización defensiva: buscar el ID y la URL en varios campos posibles.
  const nested = raw.data;
  const providerId =
    raw.id ??
    raw.paymentId ??
    nested?.id ??
    null;

  const checkoutUrl =
    raw.url ??
    raw.checkoutUrl ??
    raw.paymentUrl ??
    raw.link ??
    raw.payment_url ??
    raw.checkout_url ??
    nested?.url ??
    nested?.checkoutUrl ??
    nested?.paymentUrl ??
    nested?.link ??
    null;

  if (!providerId || !checkoutUrl) {
    throw new Error(
      `Rebill devolvió una respuesta inesperada (sin id o url): ${JSON.stringify(raw)}`
    );
  }

  return { checkoutUrl, providerId };
}

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
