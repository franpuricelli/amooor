// ─────────────────────────────────────────────────────────────────────────────
//  app/api/checkout/route.ts — inicia un pago único con Rebill (WP-4).
//
//  Necesita:
//    NEXT_PUBLIC_CONVEX_URL  → URL del backend Convex
//    NEXT_PUBLIC_APP_URL     → URL base de la app (ej: https://amooor.com)
//    REBILL_SECRET_KEY       → clave secreta de Rebill
//    REBILL_API_BASE         → (opcional) base URL de la API de Rebill
//
//  POST /api/checkout
//  Body: { draftToken: string, plan: PlanId, email?: string }
//  → 200 { checkoutUrl: string }
//  → 400 { error } si faltan campos o el plan no existe
//  → 500 { error } si falla Convex o Rebill
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PLANS, type PlanId } from "@/lib/pricing";
import { createCheckout } from "@/lib/rebill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function convex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL no configurado");
  return new ConvexHttpClient(url);
}

function appUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (!u) throw new Error("NEXT_PUBLIC_APP_URL no configurado");
  return u.replace(/\/$/, "");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Parsear y validar el body ──────────────────────────────────────────────
  let body: { draftToken?: string; plan?: string; email?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { draftToken, plan: planRaw, email } = body;

  if (!draftToken) {
    return NextResponse.json(
      { error: "draftToken requerido" },
      { status: 400 }
    );
  }
  if (!planRaw) {
    return NextResponse.json({ error: "plan requerido" }, { status: 400 });
  }

  // Validar que el plan sea uno de los conocidos.
  const validPlans: PlanId[] = ["basic", "plus", "pro"];
  if (!validPlans.includes(planRaw as PlanId)) {
    return NextResponse.json(
      { error: `plan inválido: ${planRaw}. Opciones: ${validPlans.join(", ")}` },
      { status: 400 }
    );
  }
  const plan = planRaw as PlanId;
  const { amount, currency } = PLANS[plan];

  try {
    const c = convex();
    const base = appUrl();

    // ── Crear la orden en Convex ───────────────────────────────────────────────
    const orderId = await c.mutation(api.orders.create, {
      draftToken,
      plan,
      amount,
      currency,
      ...(email ? { email } : {}),
      provider: "rebill",
    });

    // ── Construir URLs de retorno ──────────────────────────────────────────────
    const successUrl = `${base}/comenzar/listo?draft=${draftToken}`;
    const cancelUrl = `${base}/comenzar?step=review`;

    // ── Crear el checkout en Rebill ────────────────────────────────────────────
    const { checkoutUrl, providerId } = await createCheckout({
      draftToken,
      plan,
      amount,
      currency,
      email,
      orderId,
      successUrl,
      cancelUrl,
    });

    // ── Asociar el providerId de Rebill a la orden ────────────────────────────
    await c.mutation(api.orders.attachProvider, {
      id: orderId,
      providerId,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al crear checkout";
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
