// ─────────────────────────────────────────────────────────────────────────────
//  app/api/checkout/route.ts — prepara el pago único (WP-4).
//
//  El checkout de Rebill es un WIDGET de front (ver components/wizard/RebillCheckout
//  + lib/rebill.ts). Este endpoint sólo crea la ORDEN (pending) y devuelve los datos
//  que el widget necesita (nombre, monto en dólares, moneda). El webhook la marca
//  paid y dispara la generación.
//
//  POST /api/checkout  Body: { draftToken, plan, email? }
//  → 200 { orderId, name, amountUsd, currency }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PLANS, type PlanId } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function convex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL no configurado");
  return new ConvexHttpClient(url);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { draftToken?: string; plan?: string; email?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { draftToken, plan: planRaw, email } = body;
  if (!draftToken) {
    return NextResponse.json({ error: "draftToken requerido" }, { status: 400 });
  }
  const validPlans: PlanId[] = ["basic", "plus", "pro"];
  if (!planRaw || !validPlans.includes(planRaw as PlanId)) {
    return NextResponse.json(
      { error: `plan inválido: ${planRaw}. Opciones: ${validPlans.join(", ")}` },
      { status: 400 }
    );
  }
  const plan = planRaw as PlanId;
  const { name, amount, priceUsd, currency } = PLANS[plan];

  try {
    const c = convex();
    // guardamos el plan elegido en el draft (para el finalize post-pago).
    await c.mutation(api.drafts.save, { token: draftToken, plan, email });
    const orderId = await c.mutation(api.orders.create, {
      draftToken,
      plan,
      amount,
      currency,
      ...(email ? { email } : {}),
      provider: "rebill",
    });
    return NextResponse.json({
      orderId,
      name: `amooor · plan ${name}`,
      amountUsd: priceUsd,
      currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear la orden";
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
