import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
//  site-server.ts — resuelve el tenant del request (por host) desde Convex,
//  del lado del servidor. Lo usan `app/layout.tsx` y `app/page.tsx`.
//  Si no hay tenant (o Convex no está configurado), cae al content/theme default
//  del template — así el sitio nunca renderiza roto.
// ─────────────────────────────────────────────────────────────────────────────

import { cache } from "react";
import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { content as defaultContent, type Content } from "@/lib/content";
import { anniversaryTemplate, type Theme } from "@/lib/template";

export interface ResolvedSite {
  content: Content;
  theme: Theme;
  found: boolean;
}

const DEFAULT_SITE: ResolvedSite = {
  content: defaultContent,
  theme: anniversaryTemplate.defaultTheme,
  found: false,
};

/** El "host" con el que resolvemos el tenant. En un dominio real cada sitio vive
 *  en su subdominio (`<slug>.amooor.com`) y alcanza con el header Host. En el host
 *  único del deploy (sin wildcard, p.ej. `*.vercel.app`) servimos el tenant por
 *  PATH: `/s/<slug>` → devolvemos `<slug>`. El pathname llega como `x-amooor-path`
 *  (lo inyecta middleware.ts). Evitamos una cookie global: secuestraría toda la
 *  app (landing/comenzar) hasta que expire. Ver app/s/[slug]/page.tsx. */
export async function currentHost(): Promise<string | null> {
  const h = await headers();
  const path = h.get("x-amooor-path") ?? "";
  const m = path.match(/^\/s\/([^/?#]+)/);
  if (m) return decodeURIComponent(m[1]).trim().toLowerCase();
  return h.get("host");
}

/** Resuelve el tenant del request actual. Memoizado por request (`cache`), así
 *  layout + generateMetadata + generateViewport comparten una sola query. */
export const resolveSite = cache(async (): Promise<ResolvedSite> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return DEFAULT_SITE;

  try {
    const client = new ConvexHttpClient(url);

    // Preview del dueño (thumbnail del editor): /s/<slug>?preview=<draftToken>.
    // `siteByDraft` trae el sitio SIN importar su estado (live/paused) y sólo el
    // dueño tiene el token, así el thumbnail siempre muestra SU sitio — no la
    // landing — aunque esté pausado. Ver middleware.ts (x-amooor-preview).
    const previewToken = (await headers()).get("x-amooor-preview");
    if (previewToken) {
      const owned = await client.query(api.generate.siteByDraft, {
        draftToken: previewToken,
      });
      if (owned) {
        return {
          content: owned.content as Content,
          theme: owned.theme as Theme,
          found: true,
        };
      }
    }

    const host = await currentHost();
    if (!host) return DEFAULT_SITE;
    const site = await client.query(api.sites.getByHost, { host });
    if (!site) return DEFAULT_SITE;
    return {
      content: site.content as Content,
      theme: site.theme as Theme,
      found: true,
    };
  } catch {
    // Convex inalcanzable / mal configurado → default, nunca romper el render.
    return DEFAULT_SITE;
  }
});
