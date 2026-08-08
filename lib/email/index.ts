// ─────────────────────────────────────────────────────────────────────────────
//  lib/email/index.ts — re-exporta las funciones de envío y los tipos de props
//  de las plantillas de email. Punto de entrada público del módulo.
// ─────────────────────────────────────────────────────────────────────────────

export {
  sendWelcome,
  sendReactivation,
  sendPurchaseThanks,
  sendSiteReady,
  sendAccessRecovery,
} from "./send";

export type { WelcomeProps } from "./templates/Welcome";
export type { ReactivationProps } from "./templates/Reactivation";
export type { PurchaseThanksProps } from "./templates/PurchaseThanks";
export type { SiteReadyProps } from "./templates/SiteReady";
export type { AccessRecoveryProps } from "./templates/AccessRecovery";
