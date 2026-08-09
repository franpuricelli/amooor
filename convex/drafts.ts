// ─────────────────────────────────────────────────────────────────────────────
//  convex/drafts.ts — el estado del wizard (WP-3) antes de pagar.
//  Identidad = `token` (uuid en localStorage del cliente); login opcional. El
//  wizard guarda cada paso con `save` (upsert idempotente por token). Al pagar,
//  `generate.finalizeSite` crea el `site` a partir de este draft.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { themeValidator, planId, draftStatus } from "./schema";

/** El draft de un token (o null si es nuevo). */
export const get = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return await ctx.db
      .query("drafts")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
  },
});

/** Upsert idempotente por token. Sólo pisa los campos provistos (patch parcial). */
export const save = mutation({
  args: {
    token: v.string(),
    productSlug: v.optional(v.string()),
    templateSlug: v.optional(v.string()),
    answers: v.optional(v.any()),
    theme: v.optional(themeValidator),
    subdomain: v.optional(v.string()),
    domainWish: v.optional(v.string()),
    email: v.optional(v.string()),
    plan: v.optional(planId),
    content: v.optional(v.any()),
    // Intake conversacional (chat-first). El patch parcial ya ignora `undefined`,
    // así que estos conviven con el flujo del wizard sin pisarse.
    conversation: v.optional(v.any()),
    intakePlan: v.optional(v.any()),
    status: v.optional(draftStatus),
    lastStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { token, ...rest } = args;
    // sólo los campos definidos (patch parcial)
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, val]) => val !== undefined)
    );

    const existing = await ctx.db
      .query("drafts")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...patch, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("drafts", {
      token,
      productSlug: args.productSlug ?? "anniversary",
      templateSlug: args.templateSlug ?? "anniversary",
      answers: args.answers ?? {},
      theme: args.theme ?? { palette: "rosa" },
      status: args.status ?? "editing",
      ...patch,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Marca el status del draft (p.ej. "generating" → "ready"). */
export const setStatus = mutation({
  args: { token: v.string(), status: draftStatus },
  handler: async (ctx, { token, status }) => {
    const d = await ctx.db
      .query("drafts")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!d) throw new Error("draft not found");
    await ctx.db.patch(d._id, { status, updatedAt: Date.now() });
  },
});
