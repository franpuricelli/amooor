// ─────────────────────────────────────────────────────────────────────────────
//  send.ts — wrapper de Resend para los 5 emails transaccionales de amooor.
//
//  Vars de entorno requeridas:
//    RESEND_API_KEY  → clave secreta de Resend (obtener en resend.com/api-keys)
//    RESEND_FROM     → dirección de envío, ej. "amooor <hola@amooor.com>"
//                      (default: "amooor <onboarding@resend.dev>")
//
//  Si RESEND_API_KEY no está definida, las funciones loguean un warning y
//  devuelven { skipped: true } sin romper al llamador. Los errores de envío
//  también se absorben y se devuelven como { error }.
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from "resend";
import * as React from "react";

import Welcome, { type WelcomeProps } from "./templates/Welcome";
import Reactivation, { type ReactivationProps } from "./templates/Reactivation";
import PurchaseThanks, { type PurchaseThanksProps } from "./templates/PurchaseThanks";
import SiteReady, { type SiteReadyProps } from "./templates/SiteReady";
import AccessRecovery, { type AccessRecoveryProps } from "./templates/AccessRecovery";

// ── inicialización lazy ───────────────────────────────────────────────────────

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM =
  process.env.RESEND_FROM ?? "amooor <onboarding@resend.dev>";

// ── tipos de retorno ──────────────────────────────────────────────────────────

type SendResult =
  | { skipped: true }
  | { error: unknown }
  | Awaited<ReturnType<Resend["emails"]["send"]>>;

// ── helper interno ────────────────────────────────────────────────────────────

async function send(
  to: string,
  subject: string,
  react: React.ReactElement,
): Promise<SendResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada — email omitido:", subject);
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, react });
    return result;
  } catch (error) {
    console.error("[email] Error al enviar email:", subject, error);
    return { error };
  }
}

// ── funciones públicas ────────────────────────────────────────────────────────

/** Bienvenida / activación: el usuario inició un draft. */
export async function sendWelcome(
  to: string,
  props: WelcomeProps,
): Promise<SendResult> {
  return send(
    to,
    "¡Tu sitio de aniversario te espera! 💕",
    React.createElement(Welcome, props),
  );
}

/** Draft abandonado: recordatorio para retomar el wizard. */
export async function sendReactivation(
  to: string,
  props: ReactivationProps,
): Promise<SendResult> {
  return send(
    to,
    "¿Seguimos? Tu sitio de aniversario está guardado 🌹",
    React.createElement(Reactivation, props),
  );
}

/** Confirmación de pago exitoso. */
export async function sendPurchaseThanks(
  to: string,
  props: PurchaseThanksProps,
): Promise<SendResult> {
  return send(
    to,
    "Pago confirmado — tu sitio está en camino ✨",
    React.createElement(PurchaseThanks, props),
  );
}

/** Sitio listo para visitar. */
export async function sendSiteReady(
  to: string,
  props: SiteReadyProps,
): Promise<SendResult> {
  return send(
    to,
    "¡Tu sitio de aniversario ya está en línea! 🎊",
    React.createElement(SiteReady, props),
  );
}

/** Recuperación de acceso: link mágico para volver al dashboard/draft. */
export async function sendAccessRecovery(
  to: string,
  props: AccessRecoveryProps,
): Promise<SendResult> {
  return send(
    to,
    "Tu enlace de acceso a amooor 🔑",
    React.createElement(AccessRecovery, props),
  );
}
