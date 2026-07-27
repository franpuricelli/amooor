// ─────────────────────────────────────────────────────────────────────────────
//  convex/sites.ts — resolución de tenant por host + alta/actualización.
//  El render multi-tenant (middleware + layout/page) usa `getByHost`.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { siteStatus, themeValidator } from "./schema";

/** Quita el puerto y pasa a minúsculas ("Sub.amooor.com:3000" → "sub.amooor.com"). */
function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0];
}

/** La primera etiqueta de un host es el subdominio ("puri.amooor.com" → "puri"). */
function subdomainOf(host: string): string {
  return normalizeHost(host).split(".")[0];
}

/**
 * Resuelve un Host a su sitio. Primero intenta un dominio propio (.love), y si
 * no, toma la primera etiqueta como subdominio. Devuelve `null` si no hay tenant
 * (el apex/desconocido → la landing de marketing, WP-5).
 */
export const getByHost = query({
  args: { host: v.string() },
  handler: async (ctx, { host }) => {
    const normalized = normalizeHost(host);

    const byDomain = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", normalized))
      .unique();
    if (byDomain) return byDomain;

    const sub = subdomainOf(host);
    return await ctx.db
      .query("sites")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", sub))
      .unique();
  },
});

/** Sitios marcados como showcase, para la landing (WP-5). */
export const listShowcase = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sites")
      .withIndex("by_showcase", (q) => q.eq("showcase", true))
      .collect();
  },
});

/**
 * Alta o actualización idempotente por subdominio. La usa el seed (WP-2) y el
 * flujo de generación post-pago (WP-3). El `content` se valida contra el schema
 * del template antes de llamar acá (del lado de la app).
 */
export const upsertBySubdomain = mutation({
  args: {
    subdomain: v.string(),
    templateSlug: v.string(),
    content: v.any(),
    theme: themeValidator,
    status: siteStatus,
    domain: v.optional(v.string()),
    productSlug: v.optional(v.string()),
    showcase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("sites")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("sites", { ...args, createdAt: now, updatedAt: now });
  },
});
