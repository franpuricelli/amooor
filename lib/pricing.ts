// ─────────────────────────────────────────────────────────────────────────────
//  pricing.ts — la oferta del producto (WP-3/§0 del PLAN). Pago ÚNICO por sitio,
//  sin suscripción. El plan `pro` (US$150) incluye edición con IA. El dominio
//  `.love` propio es un upsell aparte (lo cobra/renueva el usuario).
//
//  Fuente única de precios: la usa el paywall (Rebill), la landing (WP-5) y el
//  wizard. Montos en centavos de USD para evitar floats.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanId = "basic" | "plus" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number; // dólares (display)
  amount: number; // centavos (para el cobro)
  currency: "USD";
  tagline: string;
  features: string[];
  aiEditing: boolean; // el pro incluye edición con IA por prompt
  highlight?: boolean; // el destacado en la grilla de precios
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    name: "Cupido",
    priceUsd: 50,
    amount: 5000,
    currency: "USD",
    tagline: "El primer sitio de su historia.",
    features: [
      "Sitio completo con tu historia",
      "Onboarding asistido",
      "Secciones personalizables",
      "Subdominio incluido (nombre.amooor.com)",
      "Hasta 150 fotos",
      "Música y contador en vivo",
      "Video propio",
    ],
    aiEditing: false,
  },
  plus: {
    id: "plus",
    name: "Nuestra Historia",
    priceUsd: 90,
    amount: 9000,
    currency: "USD",
    tagline: "Con video y todas sus fotos.",
    features: [
      "Todo lo de Cupido",
      "Fotos ilimitadas",
      "Hasta 3 cambios personalizables",
      "Soporte prioritario",
    ],
    aiEditing: false,
    highlight: true,
  },
  pro: {
    id: "pro",
    name: "Para Siempre",
    priceUsd: 150,
    amount: 15000,
    currency: "USD",
    tagline: "Creá y editá tu propio sitio.",
    features: [
      "Todo lo de Nuestra Historia",
      "Cambios ilimitados",
      "Editás lo que quieras, escribiendo",
      "Elementos ad-hoc generados a pedido",
      "Prioridad máxima",
    ],
    aiEditing: true,
  },
};

export const PLAN_ORDER: PlanId[] = ["basic", "plus", "pro"];

/** El upsell del dominio `.love` propio (el usuario paga la renovación anual). */
export const DOMAIN_UPSELL = {
  priceUsd: 20,
  currency: "USD" as const,
  note: "Dominio .love propio: primer año incluido, renovación ~US$20/año a tu cargo.",
};

export const getPlan = (id: PlanId): Plan => PLANS[id];

/** ¿Este plan habilita la edición con IA (agente Claude Sonnet sobre el tenant)? */
export const planHasAiEditing = (id: PlanId | undefined): boolean =>
  id ? PLANS[id].aiEditing : false;
