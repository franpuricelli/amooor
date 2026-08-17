"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PostHogProvider.tsx — arranca PostHog y mantiene la identidad del usuario.
//
//  Vive en app/layout.tsx DENTRO de <ClerkProvider> (usa useUser). Se encarga de:
//   1. init una sola vez (no-op sin NEXT_PUBLIC_POSTHOG_KEY),
//   2. `$pageview` por navegación (App Router no recarga la página),
//   3. `surface` como super-propiedad (marketing | builder | tenant),
//   4. identify contra la cuenta de Clerk + `user_signed_up` / `user_signed_in`,
//      y reset al desloguear (si no, los eventos siguientes le quedan pegados a
//      la cuenta anterior en la misma máquina).
//
//  El catálogo de eventos y el resto de los helpers están en lib/analytics.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  capturePageview,
  identifyUser,
  initAnalytics,
  isAnalyticsEnabled,
  registerContext,
  resetAnalytics,
  track,
  type Surface,
} from "@/lib/analytics";

/** Una cuenta creada hace menos de esto cuenta como alta, no como login. */
const SIGNUP_WINDOW_MS = 5 * 60 * 1000;
/** Marca por sesión de browser para no repetir el evento de login en cada tab-load. */
const AUTH_SEEN_KEY = "amooor_ph_auth_seen";

/** marketing (apex) | builder (/comenzar) | tenant (sitio de la pareja). */
function detectSurface(pathname: string): Surface {
  if (pathname.startsWith("/comenzar")) return "builder";
  if (pathname.startsWith("/s/")) return "tenant";
  const host = typeof window === "undefined" ? "" : window.location.hostname;
  const apex = process.env.NEXT_PUBLIC_APP_DOMAIN || "amooor.com";
  // <slug>.amooor.com → tenant; amooor.com / www / localhost → marketing.
  if (host.endsWith(`.${apex}`) && !host.startsWith("www.")) return "tenant";
  return "marketing";
}

function PageviewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    registerContext({ surface: detectSurface(pathname) });
    capturePageview();
  }, [pathname, search]);

  return null;
}

function IdentityTracker() {
  const { isLoaded, isSignedIn, user } = useUser();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      // Se deslogueó dentro de esta pestaña → cortamos la sesión de analytics.
      if (lastUserId.current) {
        resetAnalytics();
        lastUserId.current = null;
        try {
          window.sessionStorage.removeItem(AUTH_SEEN_KEY);
        } catch {}
      }
      return;
    }

    if (lastUserId.current === user.id) return;
    lastUserId.current = user.id;

    identifyUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
    });

    // Alta vs. login: una cuenta recién creada entra por primera vez. La marca
    // por sesión evita repetir el evento en cada recarga.
    let seen: string | null = null;
    try {
      seen = window.sessionStorage.getItem(AUTH_SEEN_KEY);
    } catch {}
    if (seen === user.id) return;
    try {
      window.sessionStorage.setItem(AUTH_SEEN_KEY, user.id);
    } catch {}

    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    const isNew = createdAt > 0 && Date.now() - createdAt < SIGNUP_WINDOW_MS;
    track(isNew ? "user_signed_up" : "user_signed_in", { method: "clerk" });
  }, [isLoaded, isSignedIn, user]);

  return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  if (!isAnalyticsEnabled()) return <>{children}</>;

  return (
    <>
      {/* useSearchParams necesita un límite de Suspense en el App Router. */}
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <IdentityTracker />
      {children}
    </>
  );
}
