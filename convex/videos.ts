// ─────────────────────────────────────────────────────────────────────────────
//  convex/videos.ts — videos subidos contra un draft (post-aprobación, sección
//  "watch"). Reusa Convex file storage (`_storage`), no un vendor nuevo:
//   - `generateUploadUrl` → URL de subida directa de un solo uso (el cliente
//     hace POST del blob a esa URL y recibe un storageId).
//   - `recordDraftVideo`  → registra draftToken → storageId + src (URL servida
//     por convex/http.ts en /video/<slug>.mp4). Un solo video por draft: si ya
//     hay uno, borra el blob viejo y lo reemplaza.
//   - `listDraftVideos` / `deleteDraftVideo` / `getBySlug` (este último lo usa el
//     file server de http.ts para resolver slug → storageId).
//  Modelado sobre convex/assets.ts (mismo par generateUploadUrl + record).
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** URL de subida directa de un solo uso al file storage de Convex. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Registra (o reemplaza) el video del draft. Un solo video por draft: si ya
 * existe, borra el blob anterior y patchea la fila.
 */
export const recordDraftVideo = mutation({
  args: {
    draftToken: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
    src: v.string(),
    category: v.string(),
    poster: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("draftVideos")
      .withIndex("by_draft", (q) => q.eq("draftToken", args.draftToken))
      .collect();

    // Reemplazo: borramos los blobs viejos (evita huérfanos en el storage).
    for (const row of existing) {
      try {
        await ctx.storage.delete(row.storageId);
      } catch {
        /* best-effort */
      }
      await ctx.db.delete(row._id);
    }

    return await ctx.db.insert("draftVideos", {
      draftToken: args.draftToken,
      slug: args.slug,
      storageId: args.storageId,
      src: args.src,
      category: args.category,
      poster: args.poster,
      caption: args.caption,
      createdAt: Date.now(),
    });
  },
});

/** Los videos de un draft (0 o 1). */
export const listDraftVideos = query({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    return await ctx.db
      .query("draftVideos")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .collect();
  },
});

/** Borra el video del draft (y su blob). */
export const deleteDraftVideo = mutation({
  args: { id: v.id("draftVideos") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (row) {
      try {
        await ctx.storage.delete(row.storageId);
      } catch {
        /* best-effort */
      }
      await ctx.db.delete(id);
    }
  },
});

/** Resuelve slug → fila (lo usa el file server de http.ts). */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("draftVideos")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});
