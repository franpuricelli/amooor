// ─────────────────────────────────────────────────────────────────────────────
//  app/sign-in/[[...sign-in]] — página de login propia (catch-all).
//  Sin esto, Clerk manda el callback de OAuth (Google) al Account Portal
//  `accounts.<dominio>`, un host aparte que depende de su propio CNAME + su
//  certificado: si todavía no está emitido, el login muere con
//  ERR_CONNECTION_CLOSED. Alojando el flujo acá, el callback (#/sso-callback)
//  aterriza en nuestra app y no depende de ese host.
// ─────────────────────────────────────────────────────────────────────────────

import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
      }}
    >
      <SignIn />
    </main>
  );
}
