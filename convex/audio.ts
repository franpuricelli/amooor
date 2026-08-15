// ─────────────────────────────────────────────────────────────────────────────
//  convex/audio.ts — la música de fondo subida contra un draft (opcional): el mp3
//  que suena al abrir el sitio (lo toca el ❤ del navbar, MusicToggle). Reusa Convex
//  file storage (`_storage`), igual que los videos:
//   - `generateUploadUrl` → URL de subida directa de un solo uso.
//   - `recordDraftAudio`  → registra draftToken → storageId + src (URL servida por
//     convex/http.ts en /track/<slug>.mp3). Un solo track por draft: si ya hay uno,
//     borra el blob viejo y lo reemplaza.
//   - `getDraftAudio` / `deleteDraftAudio` / `getBySlug` (este último lo usa el file
//     server de http.ts para resolver slug → storageId).
//  Modelado sobre convex/videos.ts (mismo par generateUploadUrl + record).
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
 * Registra (o reemplaza) el track del draft. Uno solo por draft: si ya existe,
 * borra el blob anterior y la fila vieja.
 */
export const recordDraftAudio = mutation({
  args: {
    draftToken: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
    src: v.string(),
    filename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("draftAudio")
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

    return await ctx.db.insert("draftAudio", {
      draftToken: args.draftToken,
      slug: args.slug,
      storageId: args.storageId,
      src: args.src,
      filename: args.filename,
      createdAt: Date.now(),
    });
  },
});

/** El track del draft (0 o 1). */
export const getDraftAudio = query({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    return await ctx.db
      .query("draftAudio")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .first();
  },
});

/** Borra el track del draft (y su blob). */
export const deleteDraftAudio = mutation({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    const rows = await ctx.db
      .query("draftAudio")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .collect();
    for (const row of rows) {
      try {
        await ctx.storage.delete(row.storageId);
      } catch {
        /* best-effort */
      }
      await ctx.db.delete(row._id);
    }
  },
});

/** Resuelve slug → fila (lo usa el file server de http.ts). */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("draftAudio")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});
