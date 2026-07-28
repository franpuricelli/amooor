// ─────────────────────────────────────────────────────────────────────────────
//  convex/assets.ts — imágenes en Convex file storage (interim; ver convex/http.ts).
//  El upload está gateado por ASSET_SECRET (env de Convex) para que no cualquiera
//  pueda llenar el storage. En WP-3 esto pasa a estar detrás del auth del wizard.
// ─────────────────────────────────────────────────────────────────────────────

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function assertSecret(secret: string) {
  const expected = process.env.ASSET_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("unauthorized");
  }
}

/** URL de subida de un solo uso (el script sube el archivo directo al storage). */
export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertSecret(secret);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Registra (o actualiza) el mapeo kind/cat/slug → storageId. */
export const record = mutation({
  args: {
    secret: v.string(),
    kind: v.string(),
    cat: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { secret, kind, cat, slug, storageId }) => {
    assertSecret(secret);
    const existing = await ctx.db
      .query("assets")
      .withIndex("by_key", (q) => q.eq("kind", kind).eq("cat", cat).eq("slug", slug))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { storageId });
      return existing._id;
    }
    return await ctx.db.insert("assets", { kind, cat, slug, storageId });
  },
});

/** Resuelve el storageId de una imagen (lo usa el file server en http.ts). */
export const getByKey = query({
  args: { kind: v.string(), cat: v.string(), slug: v.string() },
  handler: async (ctx, { kind, cat, slug }) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_key", (q) => q.eq("kind", kind).eq("cat", cat).eq("slug", slug))
      .unique();
  },
});
