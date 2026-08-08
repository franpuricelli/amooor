"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /comenzar/listo?draft=<token> — pantalla post-pago (WP-3). Rebill redirige acá
//  tras el pago; el webhook dispara la generación. Esta página espera a que el
//  site exista (poll a generate.siteByDraft) y muestra el link final.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex-browser";
import "@/components/wizard/wizard.css";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "amooor.com";

export default function ListoPage() {
  const [status, setStatus] = useState<"waiting" | "ready" | "timeout">("waiting");
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("draft");
    if (!token) {
      setStatus("timeout");
      return;
    }
    let tries = 0;
    let stop = false;
    const poll = async () => {
      if (stop) return;
      try {
        const site = await convexClient().query(api.generate.siteByDraft, {
          draftToken: token,
        });
        if (site?.subdomain) {
          setSubdomain(site.subdomain);
          setStatus("ready");
          return;
        }
      } catch {
        /* reintenta */
      }
      tries += 1;
      if (tries > 40) {
        setStatus("timeout");
        return;
      }
      setTimeout(poll, 2000);
    };
    void poll();
    return () => {
      stop = true;
    };
  }, []);

  const url = subdomain ? `https://${subdomain}.${APP_DOMAIN}` : null;

  return (
    <div className="wz">
      <div className="wz-center">
        {status === "waiting" && (
          <>
            <div className="wz-spin" />
            <h2 className="wz-h">Estamos armando su sitio…</h2>
            <p className="wz-sub">
              Generamos su historia con las fotos y la paleta que eligieron. Tarda
              unos segundos.
            </p>
          </>
        )}
        {status === "ready" && url && (
          <>
            <div style={{ fontSize: "3rem" }}>💘</div>
            <h2 className="wz-h">¡Su sitio está listo!</h2>
            <p className="wz-sub">Ya pueden verlo y compartirlo.</p>
            <a className="wz-btn" href={url}>
              Ver nuestro sitio →
            </a>
            <p className="wz-hint" style={{ marginTop: "1rem" }}>
              También les mandamos el link por email.
            </p>
          </>
        )}
        {status === "timeout" && (
          <>
            <h2 className="wz-h">Casi listo</h2>
            <p className="wz-sub">
              Estamos terminando de generar su sitio. Les avisamos por email apenas
              esté — o recargá esta página en un minuto.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
