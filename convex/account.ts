// ─────────────────────────────────────────────────────────────────────────────
//  convex/account.ts — vincula un draft a una cuenta Clerk para reanudar en otro
//  dispositivo. El `token` (uuid en localStorage) sigue siendo la clave del draft
//  y de sus medios (draftPhotos/Videos/Audio); acá sólo mapeamos ese token a un
//  `clerkUserId`. Al loguearse, el cliente llama /api/account/link, que corre esto
//  con ASSET_SECRET (server-only): sólo el server, con el userId ya verificado por
//  Clerk, puede vincular — un cliente no puede reclamar el token de otro.
// ─────────────────────────────────────────────────────────────────────────────

import { mutation } from "./_generated/server";
import { v } from "convex/values";

function assertSecret(secret: string) {
  const expected = process.env.ASSET_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("unauthorized");
  }
}

/**
 * Vincula el draft del cliente a la cuenta y devuelve el token que el cliente
 * debe usar de acá en más.
 *
 * Opción A (decidida con el usuario): si la cuenta YA tiene un draft, ese gana
 * → el cliente adopta su token (reanuda su historia en cualquier dispositivo).
 * Si no, se reclama el token local actual para la cuenta.
 */
export const linkToUser = mutation({
  args: {
    secret: v.string(),
    token: v.string(), // token local actual del cliente
    clerkUserId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { secret, token, clerkUserId, email }) => {
    assertSecret(secret);
    const now = Date.now();

    // ¿La cuenta ya tiene draft(s) vinculado(s)? Tomamos el más reciente.
    const owned = await ctx.db
      .query("drafts")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();
    owned.sort((a, b) => b.updatedAt - a.updatedAt);
    const accountDraft = owned[0];

    if (accountDraft && accountDraft.token !== token) {
      // El draft de la cuenta manda → el cliente adopta ese token.
      if (email && accountDraft.email !== email) {
        await ctx.db.patch(accountDraft._id, { email, updatedAt: now });
      }
      return { token: accountDraft.token, adopted: true as const };
    }

    // Sin draft de cuenta (o ya es el mismo token) → reclamamos el token actual.
    const current = await ctx.db
      .query("drafts")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (current) {
      await ctx.db.patch(current._id, {
        clerkUserId,
        ...(email ? { email } : {}),
        updatedAt: now,
      });
    } else {
      // Todavía no hay draft para ese token (el usuario no escribió nada). Creamos
      // uno mínimo ya vinculado, así el próximo dispositivo puede adoptarlo; el
      // autosave (drafts.save, por token) le va cargando el contenido después.
      await ctx.db.insert("drafts", {
        token,
        clerkUserId,
        ...(email ? { email } : {}),
        productSlug: "anniversary",
        templateSlug: "anniversary",
        answers: {},
        theme: { palette: "rosa" },
        status: "editing",
        createdAt: now,
        updatedAt: now,
      });
    }
    return { token, adopted: false as const };
  },
});
