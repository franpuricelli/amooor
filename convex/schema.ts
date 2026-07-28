// ─────────────────────────────────────────────────────────────────────────────
//  Convex data model (WP-2) — ver docs/PLAN.md §1.
//  Un solo deploy sirve N sitios: `middleware.ts` resuelve el Host → un `site`,
//  y el template lo renderiza desde su `content` + `theme`.
//
//  Decisión de diseño: las secciones NO son una tabla aparte; viven dentro de
//  `site.content.layout` (fuente única de verdad, definida por el template en
//  WP-1). `photos` sí es tabla porque son refs externas (Cloudflare) por tenant.
// ─────────────────────────────────────────────────────────────────────────────

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Estados del ciclo de vida de un sitio: draft → paid → live. */
export const siteStatus = v.union(
  v.literal("draft"),
  v.literal("paid"),
  v.literal("live")
);

/** Theme de un tenant: id de paleta + overrides opcionales (ver lib/theme.ts). */
export const themeValidator = v.object({
  palette: v.string(),
  overrides: v.optional(v.record(v.string(), v.string())),
});

export default defineSchema({
  // Compradores (Better Auth los administra en WP-3; acá guardamos lo mínimo).
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Catálogo: un producto = una oferta/flujo (WP-6 agrega el #2).
  products: defineTable({
    slug: v.string(), // "anniversary"
    name: v.string(),
  }).index("by_slug", ["slug"]),

  // Catálogo: un template = un diseño+schema+renderer (mapea a lib/template.ts).
  templates: defineTable({
    slug: v.string(), // "anniversary"
    name: v.string(),
  }).index("by_slug", ["slug"]),

  // Un sitio/tenant: la instancia que se renderiza en un host.
  sites: defineTable({
    ownerId: v.optional(v.id("users")),
    productSlug: v.optional(v.string()),
    templateSlug: v.string(), // qué renderer del registry usar
    subdomain: v.string(), // "<subdomain>.<APP_DOMAIN>" (siempre presente)
    domain: v.optional(v.string()), // dominio propio (.love) — upsell
    content: v.any(), // validado por el contentSchema del template (Zod)
    theme: themeValidator,
    status: siteStatus,
    showcase: v.optional(v.boolean()), // se muestra en la landing (WP-5)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subdomain", ["subdomain"])
    .index("by_domain", ["domain"])
    .index("by_owner", ["ownerId"])
    .index("by_showcase", ["showcase"]),

  // Fotos por tenant: refs a Cloudflare Images (WP-4). Categoría "all" = bucket
  // de las no categorizadas.
  photos: defineTable({
    siteId: v.id("sites"),
    category: v.string(),
    cloudflareId: v.string(),
    order: v.number(),
  })
    .index("by_site", ["siteId"])
    .index("by_site_category", ["siteId", "category"]),

  // Imágenes en Convex file storage (interim antes de Cloudflare/WP-4). Se sirven
  // por `convex/http.ts` en `/img/<kind>/<cat>/<slug>`. `kind` = "full" | "thumb".
  assets: defineTable({
    kind: v.string(),
    cat: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
  }).index("by_key", ["kind", "cat", "slug"]),
});
