"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  StatusDot.tsx — el puntito de estado compartido del post-aprobación:
//   gray  = no listo, yellow (pulso on/off) = armando/guardando, green = listo.
//  Lo usan el header/"Previsualizar" (mobile) y el toolbar del editor.
// ─────────────────────────────────────────────────────────────────────────────

export type DotStatus = "idle" | "busy" | "ready";

const LABELS: Record<DotStatus, string> = {
  idle: "No listo",
  busy: "Trabajando…",
  ready: "Listo",
};

export default function StatusDot({ status }: { status: DotStatus }) {
  return <span className={`pa-dot ${status}`} role="status" aria-label={LABELS[status]} />;
}
