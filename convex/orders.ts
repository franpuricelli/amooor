// ─────────────────────────────────────────────────────────────────────────────
//  convex/orders.ts — pagos (Rebill, WP-4). Un order por intento de compra.
//  Flujo: el paywall crea un order `pending` + un checkout en Rebill → el webhook
//  de pago (app/api/webhooks/rebill) marca `paid` y dispara la generación.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { planId, orderStatus } from "./schema";

export const create = mutation({
  args: {
    draftToken: v.string(),
    plan: planId,
    amount: v.number(),
    currency: v.string(),
    email: v.optional(v.string()),
    provider: v.optional(v.string()),
    providerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("orders", {
      draftToken: args.draftToken,
      email: args.email,
      plan: args.plan,
      amount: args.amount,
      currency: args.currency,
      provider: args.provider ?? "rebill",
      providerId: args.providerId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Asocia el id del pago/checkout de Rebill (para poder recuperarlo en el webhook). */
export const attachProvider = mutation({
  args: { id: v.id("orders"), providerId: v.string() },
  handler: async (ctx, { id, providerId }) => {
    await ctx.db.patch(id, { providerId, updatedAt: Date.now() });
  },
});

export const getByProviderId = query({
  args: { providerId: v.string() },
  handler: async (ctx, { providerId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_provider_id", (q) => q.eq("providerId", providerId))
      .unique();
  },
});

export const getByDraft = query({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .collect();
  },
});

/** Marca el estado de un order. Idempotente: si ya está `paid`, no re-dispara. */
export const setStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus, providerId: v.optional(v.string()) },
  handler: async (ctx, { id, status, providerId }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("order not found");
    const already = order.status === "paid";
    await ctx.db.patch(id, {
      status,
      ...(providerId ? { providerId } : {}),
      updatedAt: Date.now(),
    });
    return { alreadyPaid: already };
  },
});
