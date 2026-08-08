"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  RebillCheckout.tsx — el checkout embebido de Rebill (WP-4). Carga el SDK v3,
//  lo inicializa con la clave PÚBLICA y monta el iframe de pago. Al aprobarse el
//  pago dispara `onPaid`; el webhook (server) es la fuente autoritativa que crea
//  el sitio. `amount` va en DÓLARES (ver el ejemplo oficial de Rebill).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

const SDK_SRC = "https://sdk.rebill.com/v3/rebill.js";
const MOUNT_ID = "rebill-checkout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Rebill?: any;
  }
}

/** Carga el script del SDK una sola vez y resuelve cuando window.Rebill existe. */
function loadSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Rebill) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("SDK error")));
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar el SDK de Rebill"));
    document.head.appendChild(s);
  });
}

export default function RebillCheckout({
  name,
  amountUsd,
  currency = "USD",
  draftToken,
  orderId,
  email,
  onPaid,
}: {
  name: string;
  amountUsd: number;
  currency?: string;
  draftToken: string;
  orderId?: string;
  email?: string;
  onPaid: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const mounted = useRef(false);
  const paidRef = useRef(false);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_REBILL_PUBLIC_KEY;
    if (!pk) {
      setErr("Falta NEXT_PUBLIC_REBILL_PUBLIC_KEY.");
      return;
    }

    const paid = () => {
      if (paidRef.current) return;
      paidRef.current = true;
      onPaid();
    };

    let cancelled = false;
    loadSdk()
      .then(() => {
        if (cancelled || mounted.current || !window.Rebill) return;
        try {
          const rebill = new window.Rebill(pk);
          const form = rebill.checkout.create({
            name,
            amount: amountUsd, // Rebill toma el monto en dólares
            currency,
            // metadata para que el webhook recupere el draft (a confirmar en el dashboard)
            metadata: { draftToken, ...(orderId ? { orderId } : {}) },
            ...(email ? { customer: { email } } : {}),
          });
          // Detección de éxito, defensiva sobre varias convenciones del SDK.
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.on?.("success", () => paid());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.on?.("payment_success", () => paid());
          } catch {
            /* el SDK puede no exponer .on */
          }
          form.mount(MOUNT_ID);
          mounted.current = true;
        } catch (e) {
          setErr(String(e));
        }
      })
      .catch((e) => setErr(String(e)));

    // Fallback: el iframe puede emitir el éxito por postMessage.
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data as unknown;
      const t =
        typeof d === "string"
          ? d
          : (d as { type?: string; event?: string; status?: string })?.type ??
            (d as { event?: string })?.event ??
            (d as { status?: string })?.status;
      if (typeof t === "string" && /success|approved|paid|completed/i.test(t)) paid();
    };
    window.addEventListener("message", onMsg);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMsg);
    };
  }, [name, amountUsd, currency, draftToken, orderId, email, onPaid]);

  if (err)
    return (
      <p style={{ color: "#c0244a", fontSize: "0.9rem" }}>
        No se pudo cargar el pago: {err}
      </p>
    );

  return <div id={MOUNT_ID} className="wz-rebill" />;
}
