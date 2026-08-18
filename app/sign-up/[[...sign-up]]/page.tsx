// ─────────────────────────────────────────────────────────────────────────────
//  app/sign-up/[[...sign-up]] — página de registro propia (catch-all).
//  Misma razón que /sign-in: mantiene el flujo (y el callback de OAuth) dentro
//  de nuestra app en vez del Account Portal `accounts.<dominio>`.
// ─────────────────────────────────────────────────────────────────────────────

import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
      }}
    >
      <SignUp />
    </main>
  );
}
