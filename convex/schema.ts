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

/** Planes de compra (pago único). El "pro" incluye edición con IA. Ver lib/pricing.ts. */
export const planId = v.union(
  v.literal("basic"), // US$50
  v.literal("plus"), //  US$90
  v.literal("pro") //   US$150 (edición IA)
);

/** Estado de un draft del wizard (WP-3), previo al pago. */
export const draftStatus = v.union(
  v.literal("editing"), //    el usuario está armando el sitio
  v.literal("generating"), // se está generando el content (IA)
  v.literal("ready"), //      generado, esperando pago
  v.literal("paid") //        pagado → ya existe el `site`
);

/** Estado de un pago (Rebill, WP-4). */
export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed")
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
    ownerEmail: v.optional(v.string()), // comprador (sin cuenta) — para emails
    productSlug: v.optional(v.string()),
    templateSlug: v.string(), // qué renderer del registry usar
    subdomain: v.string(), // "<subdomain>.<APP_DOMAIN>" (siempre presente)
    domain: v.optional(v.string()), // dominio propio (.love) — upsell
    domainStatus: v.optional(
      v.union(v.literal("pending"), v.literal("verified"), v.literal("error"))
    ),
    plan: v.optional(planId), // plan comprado (pro = edición IA)
    draftToken: v.optional(v.string()), // draft del que nació (WP-3)
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
    .index("by_draft", ["draftToken"])
    .index("by_showcase", ["showcase"]),

  // Draft del wizard (WP-3): el estado que arma el usuario ANTES de pagar.
  // Anónimo por defecto (identidad = `token` generado en el cliente); `ownerId`
  // se completa si hay login (Better Auth, opcional). Al pagar → se crea el `site`.
  drafts: defineTable({
    token: v.string(), // uuid del cliente (localStorage) — identidad del draft
    ownerId: v.optional(v.id("users")),
    email: v.optional(v.string()), // para re-activación + recibo (Resend, WP-4)
    productSlug: v.string(),
    templateSlug: v.string(),
    answers: v.any(), // respuestas del wizard (lib/draft.ts → WizardState)
    theme: themeValidator,
    subdomain: v.optional(v.string()), // sugerido/elegido
    domainWish: v.optional(v.string()), // idea de dominio .love (upsell)
    plan: v.optional(planId),
    content: v.optional(v.any()), // content generado (preview) — validado por el template
    // Intake conversacional (chat-first, reemplaza al wizard). Aditivo: no rompe
    // drafts viejos. `conversation` = mensajes [{ role, content }] del chat;
    // `intakePlan` = el plan de ejecución que dropea el agente (lib/plan.ts).
    // OJO: `plan` (arriba) es el plan de PAGO (pricing). El plan del intake va en
    // `intakePlan` para no colisionar con ese campo.
    conversation: v.optional(v.any()),
    intakePlan: v.optional(v.any()),
    status: draftStatus,
    lastStep: v.optional(v.number()), // para reanudar el wizard
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_owner", ["ownerId"])
    .index("by_email", ["email"]),

  // Fotos subidas contra un draft (WP-3/WP-4). Al pagar se copian a `photos`
  // (por siteId). `all` = bucket de no categorizadas (se recategoriza en el wizard).
  draftPhotos: defineTable({
    draftToken: v.string(),
    category: v.string(),
    cloudflareId: v.string(), // id de Cloudflare Images
    thumbUrl: v.string(), // variante `thumb`
    fullUrl: v.string(), // variante `full`
    order: v.number(),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_draft", ["draftToken"])
    .index("by_draft_category", ["draftToken", "category"]),

  // Videos subidos contra un draft (post-aprobación, sección "watch"). A
  // diferencia de las fotos (Cloudflare Images), el video vive en Convex file
  // storage (`_storage`) y se sirve por `convex/http.ts` en `/video/<slug>.mp4`.
  // `slug` = id estable en la URL; `src` = URL de entrega ya resuelta (.convex.site).
  draftVideos: defineTable({
    draftToken: v.string(),
    slug: v.string(),
    storageId: v.id("_storage"),
    src: v.string(),
    category: v.string(), // categoría de la sección watch (para el binding)
    poster: v.optional(v.string()),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_draft", ["draftToken"])
    .index("by_slug", ["slug"]),

  // Pagos (Rebill, WP-4). Un order por intento de compra de un draft.
  orders: defineTable({
    draftToken: v.string(),
    email: v.optional(v.string()),
    plan: planId,
    amount: v.number(), // en centavos de USD
    currency: v.string(), // "USD"
    provider: v.string(), // "rebill"
    providerId: v.optional(v.string()), // id del pago/checkout en Rebill
    status: orderStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_draft", ["draftToken"])
    .index("by_provider_id", ["providerId"]),

  // Fotos por tenant: refs a Cloudflare Images (WP-4). Categoría "all" = bucket
  // de las no categorizadas. Se copian desde `draftPhotos` al pagar.
  photos: defineTable({
    siteId: v.id("sites"),
    category: v.string(),
    cloudflareId: v.string(),
    thumbUrl: v.string(),
    fullUrl: v.string(),
    order: v.number(),
    caption: v.optional(v.string()),
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
