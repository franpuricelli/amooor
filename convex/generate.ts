// ─────────────────────────────────────────────────────────────────────────────
//  convex/generate.ts — alta del `site` a partir de un draft pagado (WP-3).
//  El content ya viene generado (lib/generate.ts, en el server, con la mejora IA
//  opcional de lib/ai.ts). Acá sólo persistimos: creamos/actualizamos el tenant,
//  copiamos sus fotos y marcamos el draft como pagado. Idempotente por subdominio.
// ─────────────────────────────────────────────────────────────────────────────

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { themeValidator, planId } from "./schema";

/** ¿El subdominio está libre? (para sugerir/validar en el wizard). */
export const checkSubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    const existing = await ctx.db
      .query("sites")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    return { available: !existing };
  },
});

/** El site ya generado desde un draft (idempotencia del webhook de pago). */
export const siteByDraft = query({
  args: { draftToken: v.string() },
  handler: async (ctx, { draftToken }) => {
    return await ctx.db
      .query("sites")
      .withIndex("by_draft", (q) => q.eq("draftToken", draftToken))
      .unique();
  },
});

/**
 * Crea (o actualiza) el tenant desde el draft. Copia las fotos del draft a
 * `photos` (por siteId) y marca el draft `paid`. Devuelve el subdominio final.
 */
export const finalizeSite = mutation({
  args: {
    draftToken: v.string(),
    subdomain: v.string(),
    templateSlug: v.string(),
    productSlug: v.optional(v.string()),
    content: v.any(),
    theme: themeValidator,
    plan: planId,
    email: v.optional(v.string()),
    domain: v.optional(v.string()),
    showcase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // idempotencia: si ya existe un site para este draft, sólo lo actualizamos.
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
      productSlug: args.productSlug ?? "anniversary",
      templateSlug: args.templateSlug,
      subdomain: args.subdomain,
      domain: args.domain,
      domainStatus: args.domain ? ("pending" as const) : undefined,
      plan: args.plan,
      draftToken: args.draftToken,
      ownerEmail: args.email,
      content: args.content,
      theme: args.theme,
      status: "live" as const,
      showcase: args.showcase ?? false,
      updatedAt: now,
    };

    let siteId;
    if (existing) {
      await ctx.db.patch(existing._id, doc);
      siteId = existing._id;
    } else {
      siteId = await ctx.db.insert("sites", { ...doc, createdAt: now });
    }

    // copiar draftPhotos → photos (para gestión/edición futura del tenant).
    const already = await ctx.db
      .query("photos")
      .withIndex("by_site", (q) => q.eq("siteId", siteId))
      .collect();
    if (already.length === 0) {
      const draftPhotos = await ctx.db
        .query("draftPhotos")
        .withIndex("by_draft", (q) => q.eq("draftToken", args.draftToken))
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

    // marcar el draft pagado.
    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_token", (q) => q.eq("token", args.draftToken))
      .unique();
    if (draft) {
      await ctx.db.patch(draft._id, {
        status: "paid",
        subdomain: args.subdomain,
        plan: args.plan,
        updatedAt: now,
      });
    }

    return { siteId, subdomain: args.subdomain };
  },
});
