"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Wizard.tsx — el orquestador del onboarding (WP-3, §2). Maneja el paso actual,
//  la navegación, el autosave (useDraft) y el paso final Review → paywall (Rebill).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import "./wizard.css";
import { useDraft } from "@/lib/use-draft";
import RebillCheckout from "./RebillCheckout";
import { PLAN_ORDER, PLANS, DOMAIN_UPSELL, type PlanId } from "@/lib/pricing";
import {
  StepNames,
  StepPeople,
  StepStory,
  StepSections,
  StepPhotos,
  StepMedia,
  StepPalette,
  StepDomain,
  type StepProps,
} from "./steps";

interface StepDef {
  key: string;
  Comp: (p: StepProps) => React.JSX.Element;
}

const STEPS: StepDef[] = [
  { key: "names", Comp: StepNames },
  { key: "people", Comp: StepPeople },
  { key: "story", Comp: StepStory },
  { key: "sections", Comp: StepSections },
  { key: "photos", Comp: StepPhotos },
  { key: "media", Comp: StepMedia },
  { key: "palette", Comp: StepPalette },
  { key: "domain", Comp: StepDomain },
  { key: "review", Comp: () => <div /> }, // el Review se renderiza aparte
];

export default function Wizard() {
  const d = useDraft();
  const [step, setStep] = useState(0);

  // preselección de plan desde el CTA de marketing (/comenzar?plan=plus)
  useEffect(() => {
    if (!d.ready) return;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan") as PlanId | null;
    if (plan && PLANS[plan] && !d.meta.plan) d.setMeta({ plan });
    const s = params.get("step");
    if (s === "review") setStep(STEPS.length - 1);
    else if (typeof d.meta.lastStep === "number" && d.meta.lastStep > 0)
      setStep(Math.min(d.meta.lastStep, STEPS.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.ready]);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(next, STEPS.length - 1));
    setStep(clamped);
    d.setMeta({ lastStep: clamped });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isReview = step === STEPS.length - 1;
  const Current = STEPS[step].Comp;

  if (!d.ready) {
    return (
      <div className="wz">
        <div className="wz-center">
          <div className="wz-spin" />
          Cargando tu borrador…
        </div>
      </div>
    );
  }

  return (
    <div className="wz">
      <header className="wz-top">
        <a className="wz-brand" href="/">
          amooor
        </a>
        <span className="wz-save">{d.saving ? "Guardando…" : "Guardado ✓"}</span>
      </header>

      <div className="wz-progress" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={i === step ? "active" : i < step ? "done" : ""}
          />
        ))}
      </div>

      <main className="wz-body">
        {isReview ? <ReviewStep d={d} goTo={go} /> : <Current d={d} />}
      </main>

      {!isReview && (
        <nav className="wz-nav">
          <button
            className="wz-btn ghost"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            ← Atrás
          </button>
          <div className="spacer" />
          <button className="wz-btn" onClick={() => go(step + 1)}>
            {step === STEPS.length - 2 ? "Revisar →" : "Siguiente →"}
          </button>
        </nav>
      )}
    </div>
  );
}

// ── Review + paywall ─────────────────────────────────────────────────────────
function ReviewStep({
  d,
  goTo,
}: {
  d: ReturnType<typeof useDraft>;
  goTo: (n: number) => void;
}) {
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{
    orderId: string;
    name: string;
    amountUsd: number;
    currency: string;
  } | null>(null);
  const plan: PlanId = d.meta.plan ?? "plus";

  const previewUrl = useMemo(
    () => `/comenzar/preview?draft=${d.token}&v=${previewKey}`,
    [d.token, previewKey]
  );

  const openPreview = async () => {
    await d.saveNow();
    setShowPreview(true);
    setPreviewKey((k) => k + 1);
  };

  const startCheckout = async () => {
    setErr(null);
    if (!d.meta.email) {
      setErr("Necesitamos tu email para mandarte el sitio.");
      return;
    }
    setPaying(true);
    try {
      await d.saveNow();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftToken: d.token, plan, email: d.meta.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo iniciar el pago.");
      setCheckout(json); // { orderId, name, amountUsd, currency } → monta el widget
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPaying(false);
    }
  };

  const onPaid = () => {
    window.location.href = `/comenzar/listo?draft=${d.token}`;
  };

  return (
    <div>
      <div className="wz-kicker">Último paso</div>
      <h2 className="wz-h">Revisá y generá tu sitio</h2>
      <p className="wz-sub">
        Mirá cómo quedó, elegí tu plan y listo. Pago único, sin suscripción.
      </p>

      <button className="wz-btn ghost" onClick={openPreview} style={{ marginBottom: "1rem" }}>
        {showPreview ? "↻ Regenerar preview" : "👀 Ver mi sitio"}
      </button>

      {showPreview && (
        <div className="wz-review-card">
          <iframe
            key={previewUrl}
            className="wz-review-frame"
            src={previewUrl}
            title="Preview de tu sitio"
          />
        </div>
      )}

      <h3 className="wz-label" style={{ fontSize: "1rem", margin: "1.5rem 0 0.6rem" }}>
        Elegí tu plan
      </h3>
      <div className="wz-plans">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          return (
            <div
              key={id}
              className={`wz-plan ${plan === id ? "on" : ""}`}
              onClick={() => d.setMeta({ plan: id })}
            >
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div className="price">US${p.priceUsd}</div>
              <ul>
                {p.features.slice(0, 4).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="wz-hint" style={{ marginTop: "0.6rem" }}>
        {DOMAIN_UPSELL.note}
      </p>

      {err && (
        <p style={{ color: "#c0244a", marginTop: "1rem", fontSize: "0.9rem" }}>{err}</p>
      )}

      {checkout ? (
        <div style={{ marginTop: "1.6rem" }}>
          <h3 className="wz-label" style={{ fontSize: "1rem" }}>
            Pagá de forma segura
          </h3>
          <p className="wz-hint" style={{ marginBottom: "0.8rem" }}>
            Plan {PLANS[plan].name} · US${PLANS[plan].priceUsd} · pago único, sin
            suscripción
          </p>
          <RebillCheckout
            name={checkout.name}
            amountUsd={checkout.amountUsd}
            currency={checkout.currency}
            draftToken={d.token}
            orderId={checkout.orderId}
            email={d.meta.email}
            onPaid={onPaid}
          />
          <p className="wz-hint" style={{ marginTop: "0.9rem" }}>
            ¿Ya pagaste?{" "}
            <a href={`/comenzar/listo?draft=${d.token}`} style={{ color: "var(--accent-strong)" }}>
              Ver mi sitio →
            </a>
          </p>
        </div>
      ) : (
        <nav className="wz-nav">
          <button className="wz-btn ghost" onClick={() => goTo(STEPS.length - 2)}>
            ← Atrás
          </button>
          <div className="spacer" />
          <button className="wz-btn" onClick={startCheckout} disabled={paying}>
            {paying ? "Cargando…" : `Ir a pagar · US$${PLANS[plan].priceUsd}`}
          </button>
        </nav>
      )}
    </div>
  );
}
