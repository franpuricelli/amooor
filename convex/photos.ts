// ─────────────────────────────────────────────────────────────────────────────
//  convex/photos.ts — fotos subidas contra un draft (WP-3/WP-4).
//  El endpoint de upload (app/api/upload) sube a Cloudflare Images y después
//  registra acá el mapeo categoría → id/urls. El wizard lista/borra/recategoriza.
//  Categoría "all" = bucket de no categorizadas (§2.5); se recategoriza desde ahí.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Registra una foto subida (idempotente por draftToken + cloudflareId). */
export const recordDraftPhoto = mutation({
  args: {
    draftToken: v.string(),
    category: v.string(),
    cloudflareId: v.string(),
    thumbUrl: v.string(),
    fullUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("draftPhotos")
      .withIndex("by_draft", (q) => q.eq("draftToken", args.draftToken))
      .collect();
    const dup = existing.find((p) => p.cloudflareId === args.cloudflareId);
    if (dup) {
      await ctx.db.patch(dup._id, {
        category: args.category,
        thumbUrl: args.thumbUrl,
        fullUrl: args.fullUrl,
        caption: args.caption,
      });
      return dup._id;
    }
    return await ctx.db.insert("draftPhotos", {
      draftToken: args.draftToken,
      category: args.category,
      cloudflareId: args.cloudflareId,
      thumbUrl: args.thumbUrl,
      fullUrl: args.fullUrl,
      caption: args.caption,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

/** Todas las fotos de un draft, en orden. */
export const listDraftPhotos = query({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    const rows = await ctx.db
      .query("draftPhotos")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .collect();
    return rows.sort((a, b) => a.order - b.order);
  },
});

/** Cambia la categoría de una foto (recategorizar desde "Todas"). */
export const setCategory = mutation({
  args: { id: v.id("draftPhotos"), category: v.string() },
  handler: async (ctx, { id, category }) => {
    await ctx.db.patch(id, { category });
  },
});

/** Borra una foto del draft. */
export const deleteDraftPhoto = mutation({
  args: { id: v.id("draftPhotos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
