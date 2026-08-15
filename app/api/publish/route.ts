import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { slugifyCouple, isReserved } from "@/lib/subdomain";
import type { Theme } from "@/lib/template";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/publish — publica / actualiza / pausa el sitio de un draft SIN pago.
//    action "publish" (default) → crea/actualiza el site LIVE desde el content ya
//      editado del draft (nunca re-genera) y devuelve el link. Sirve también de
//      "Actualizar" (refresca content) y "Reactivar" (vuelve de paused a live).
//    action "pause" → deja el site en `paused` (el host cae a la landing).
//  Identidad: el `draftToken` (secreto en localStorage) autoriza la acción.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function convex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL no configurado");
  return new ConvexHttpClient(url);
}

/** Un subdominio libre a partir de la pareja (agrega -2, -3… si choca). */
async function uniqueSubdomain(
  c: ConvexHttpClient,
  couple: string,
  preferred?: string
): Promise<string> {
  let base = (preferred || slugifyCouple(couple)).toLowerCase();
  if (isReserved(base)) base = `${base}-1`;
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { available } = await c.query(api.generate.checkSubdomain, {
      subdomain: candidate,
    });
    if (available) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Base pública del deploy actual (p.ej. https://amooor-gamma.vercel.app). En
 *  `*.vercel.app` no hay wildcard de subdominios, así que el tenant se sirve por
 *  cookie vía el link `/s/<slug>`. Con un dominio propio + wildcard, el subdominio
 *  resuelve solo (getByHost) y este link sigue funcionando igual. */
function appBaseUrl(req: NextRequest): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  let body: { draftToken?: string; action?: "publish" | "pause" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const draftToken = body.draftToken;
  const action = body.action ?? "publish";
  if (!draftToken) {
    return NextResponse.json({ error: "draftToken requerido" }, { status: 400 });
  }

  const c = convex();
  const draft = await c.query(api.drafts.get, { token: draftToken });
  if (!draft) {
    return NextResponse.json({ error: "draft no encontrado" }, { status: 404 });
  }

  // ── pausar ──────────────────────────────────────────────────────────────────
  if (action === "pause") {
    try {
      const { subdomain, status } = await c.mutation(api.sites.pauseSite, {
        draftToken,
      });
      return NextResponse.json({
        status,
        subdomain,
        url: `${appBaseUrl(req)}/s/${subdomain}`,
      });
    } catch {
      return NextResponse.json({ error: "el sitio no existe todavía" }, { status: 404 });
    }
  }

  // ── publicar / actualizar / reactivar ─────────────────────────────────────────
  const content = draft.content as { couple?: string } | undefined;
  if (!content) {
    return NextResponse.json(
      { error: "el sitio todavía no fue generado" },
      { status: 400 }
    );
  }

  // Si ya existe un site para este draft, mantenemos su subdominio (URL estable);
  // si no, calculamos uno libre desde la pareja / el sugerido en el draft.
  const existing = await c.query(api.generate.siteByDraft, { draftToken });
  const subdomain =
    existing?.subdomain ??
    (await uniqueSubdomain(c, content.couple ?? "", draft.subdomain));

  const theme = draft.theme as Theme;
  const { status } = await c.mutation(api.sites.publishFromDraft, {
    draftToken,
    subdomain,
    templateSlug: draft.templateSlug ?? "anniversary",
    productSlug: draft.productSlug ?? "anniversary",
    content: draft.content,
    theme,
    plan: draft.plan ?? undefined,
    email: draft.email ?? undefined,
  });

  return NextResponse.json({
    status,
    subdomain,
    url: `${appBaseUrl(req)}/s/${subdomain}`,
  });
}
