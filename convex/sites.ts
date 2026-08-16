// ─────────────────────────────────────────────────────────────────────────────
//  convex/sites.ts — resolución de tenant por host + alta/actualización.
//  El render multi-tenant (middleware + layout/page) usa `getByHost`.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { siteStatus, themeValidator, planId } from "./schema";

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
 *
 * Sólo sirve sitios `live`: un sitio `paused` (o `draft`/`paid`) devuelve `null`,
 * así el host cae a la landing (el dueño lo pausó desde el editor).
 */
export const getByHost = query({
  args: { host: v.string() },
  handler: async (ctx, { host }) => {
    const normalized = normalizeHost(host);

    const byDomain = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", normalized))
      .unique();
    if (byDomain) return byDomain.status === "live" ? byDomain : null;

    const sub = subdomainOf(host);
    const bySub = await ctx.db
      .query("sites")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", sub))
      .unique();
    return bySub && bySub.status === "live" ? bySub : null;
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

/** Copia las fotos del draft a `photos` (por siteId), sólo si el site aún no
 *  tiene ninguna. Mismo criterio que `generate.finalizeSite`. */
async function copyDraftPhotos(
  ctx: MutationCtx,
  siteId: Id<"sites">,
  draftToken: string
) {
  const already = await ctx.db
    .query("photos")
    .withIndex("by_site", (q) => q.eq("siteId", siteId))
    .collect();
  if (already.length > 0) return;
  const draftPhotos = await ctx.db
    .query("draftPhotos")
    .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
    .collect();
  for (const p of draftPhotos) {
    await ctx.db.insert("photos", {
      siteId,
      category: p.category,
      cloudflareId: p.cloudflareId,
      thumbUrl: p.thumbUrl,
      fullUrl: p.fullUrl,
      order: p.order,
      caption: p.caption,
    });
  }
}

/**
 * Publica (o re-publica / reactiva) el sitio de un draft desde el editor, SIN
 * pago. A diferencia de `generate.finalizeSite`, usa el `content`/`theme` ya
 * editados del draft (no re-genera) y no marca el draft como `paid`. Idempotente
 * por `by_draft` → `by_subdomain`. Sirve para el primer "Publicar", el
 * "Actualizar" (refresca content) y el "Reactivar" (vuelve de `paused` a `live`).
 */
export const publishFromDraft = mutation({
  args: {
    draftToken: v.string(),
    subdomain: v.string(),
    templateSlug: v.string(),
    productSlug: v.optional(v.string()),
    content: v.any(),
    theme: themeValidator,
    plan: v.optional(planId),
    email: v.optional(v.string()),
    showcase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingByDraft = await ctx.db
      .query("sites")
      .withIndex("by_draft", (q) => q.eq("draftToken", args.draftToken))
      .unique();
    const existingBySub = await ctx.db
      .query("sites")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .unique();
    const existing = existingByDraft ?? existingBySub;

    const doc = {
      productSlug: args.productSlug ?? existing?.productSlug ?? "anniversary",
      templateSlug: args.templateSlug,
      subdomain: args.subdomain,
      // en "actualizar" no pisamos datos ya seteados con undefined (patch los borraría).
      plan: args.plan ?? existing?.plan,
      draftToken: args.draftToken,
      ownerEmail: args.email ?? existing?.ownerEmail,
      content: args.content,
      theme: args.theme,
      status: "live" as const,
      showcase: args.showcase ?? existing?.showcase ?? false,
      updatedAt: now,
    };

    let siteId: Id<"sites">;
    if (existing) {
      await ctx.db.patch(existing._id, doc);
      siteId = existing._id;
    } else {
      siteId = await ctx.db.insert("sites", { ...doc, createdAt: now });
    }

    await copyDraftPhotos(ctx, siteId, args.draftToken);

    return { siteId, subdomain: args.subdomain, status: "live" as const };
  },
});

/** Pausa el sitio de un draft: `live` → `paused` (el host cae a la landing).
 *  Reactivar = volver a llamar `publishFromDraft`. */
export const pauseSite = mutation({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    const site = await ctx.db
      .query("sites")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .unique();
    if (!site) throw new Error("site not found");
    await ctx.db.patch(site._id, { status: "paused", updatedAt: Date.now() });
    return { siteId: site._id, subdomain: site.subdomain, status: "paused" as const };
  },
});
