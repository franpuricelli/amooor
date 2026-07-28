// ─────────────────────────────────────────────────────────────────────────────
//  app/api/webhooks/rebill/route.ts — receptor de webhooks de Rebill (WP-4).
//
//  Necesita:
//    NEXT_PUBLIC_CONVEX_URL  → URL del backend Convex
//    NEXT_PUBLIC_APP_URL     → URL base de la app (para llamar a /api/generate)
//    REBILL_WEBHOOK_SECRET   → secreto para verificar la firma HMAC-SHA256
//    INTERNAL_SECRET         → secreto interno para /api/generate (mode finalize)
//
//  POST /api/webhooks/rebill
//  → 200 siempre que el evento sea procesado (Rebill necesita 200 para no reintentar)
//  → 401 si la firma no es válida
//
//  ⚠️  PENDIENTE CONFIRMAR CON REBILL:
//    - Header exacto de firma: probamos 'rebill-signature', 'x-rebill-signature',
//      'x-signature' en ese orden.
//    - Tipos de evento que representan pago exitoso (ver lib/rebill.ts isPaymentSuccess).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import {
  verifyWebhook,
  parseWebhookEvent,
  isPaymentSuccess,
} from "@/lib/rebill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function convex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL no configurado");
  return new ConvexHttpClient(url);
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Leer el body crudo (necesario para verificar HMAC) ────────────────────
  const rawBody = await req.text();

  // ── Obtener la firma del header (varios nombres posibles) ─────────────────
  // ⚠️ Confirmar el nombre exacto del header con el dashboard de Rebill.
  const signature =
    req.headers.get("rebill-signature") ??
    req.headers.get("x-rebill-signature") ??
    req.headers.get("x-signature") ??
    null;

  // ── Verificar firma HMAC-SHA256 ───────────────────────────────────────────
  if (!verifyWebhook(rawBody, signature)) {
    console.warn("[webhook/rebill] firma inválida o ausente");
    return NextResponse.json({ error: "firma inválida" }, { status: 401 });
  }

  // ── Parsear el payload ────────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    console.warn("[webhook/rebill] body no es JSON válido");
    // Devolvemos 200 para que Rebill no reintente un payload malformado.
    return NextResponse.json({ ok: false, reason: "json inválido" });
  }

  const event = parseWebhookEvent(parsed);
  console.log("[webhook/rebill] evento recibido:", event.type, event.providerId);

  // ── Solo actuar en pagos exitosos ─────────────────────────────────────────
  if (!isPaymentSuccess(event.type)) {
    // Acuse de recibo sin acción (evita reintentos innecesarios de Rebill).
    return NextResponse.json({ ok: true, reason: "evento ignorado" });
  }

  const { providerId, draftToken, orderId } = event;

  if (!providerId) {
    console.warn("[webhook/rebill] pago exitoso sin providerId:", event.raw);
    return NextResponse.json({ ok: false, reason: "sin providerId" });
  }

  try {
    const c = convex();

    // ── Buscar la orden por providerId ────────────────────────────────────────
    const order = await c.query(api.orders.getByProviderId, { providerId });
    if (!order) {
      console.warn(
        `[webhook/rebill] orden no encontrada para providerId=${providerId}; ignorando`
      );
      return NextResponse.json({ ok: true, reason: "orden no encontrada" });
    }

    // ── Marcar como pagada (idempotente) ──────────────────────────────────────
    const { alreadyPaid } = await c.mutation(api.orders.setStatus, {
      id: order._id,
      status: "paid",
      providerId,
    });

    if (alreadyPaid) {
      console.log(
        `[webhook/rebill] orden ya pagada (idempotente): ${order._id}`
      );
      return NextResponse.json({ ok: true, reason: "ya pagada" });
    }

    // ── Recuperar el draftToken (de metadata o de la orden) ───────────────────
    // order.draftToken existe en el schema (ver convex/orders.ts).
    const token: string = draftToken ?? order.draftToken ?? "";

    if (!token) {
      console.error(
        "[webhook/rebill] no hay draftToken en metadata ni en la orden"
      );
      // Igual 200: el pago se marcó, el site se puede generar manualmente.
      return NextResponse.json({ ok: true, reason: "sin draftToken" });
    }

    // ── Disparar la generación del sitio (fire-and-forget) ───────────────────
    // La respuesta de Rebill no espera a que el sitio esté listo.
    // Un error aquí no debe hacer que Rebill reintente (por eso el 200 incondicional).
    try {
      const base = appUrl();
      await fetch(`${base}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftToken: token,
          mode: "finalize",
          secret: process.env.INTERNAL_SECRET,
        }),
      });
    } catch (genErr) {
      console.error("[webhook/rebill] error al llamar /api/generate:", genErr);
      // No propagamos: el pago ya quedó registrado; el admin puede re-generar.
    }

    console.log(`[webhook/rebill] pago procesado OK: orderId=${orderId ?? order._id}, draft=${token}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/rebill] error interno:", err);
    // Devolvemos 200 a Rebill para no disparar reintentos que podrían duplicar pagos.
    // El error quedó logueado para revisión manual.
    return NextResponse.json({ ok: false, reason: "error interno" });
  }
}
