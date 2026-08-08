import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { parseWizardState } from "@/lib/draft";
import { generateContent, mediaFromPhotos } from "@/lib/generate";
import { enhanceNarrative } from "@/lib/ai";
import { parseContent, type Theme } from "@/lib/template";
import { slugifyCouple, isReserved } from "@/lib/subdomain";
import { PLANS, type PlanId } from "@/lib/pricing";
import { sendPurchaseThanks, sendSiteReady } from "@/lib/email";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/generate — genera el content de un draft (WP-3).
//    mode "preview"  → arma el content y lo guarda en el draft (para el Review).
//    mode "finalize" → (post-pago; secret interno) crea el site LIVE + emails.
//  El content sale del generador determinista (lib/generate) + mejora IA opcional
//  (lib/ai). Nunca depende de la IA para producir un sitio válido.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "amooor.com";

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

export async function POST(req: NextRequest) {
  let body: { draftToken?: string; mode?: string; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { draftToken, mode } = body;
  if (!draftToken) {
    return NextResponse.json({ error: "draftToken requerido" }, { status: 400 });
  }

  const c = convex();
  const draft = await c.query(api.drafts.get, { token: draftToken });
  if (!draft) {
    return NextResponse.json({ error: "draft no encontrado" }, { status: 404 });
  }

  // Genera el content (determinista + mejora IA opcional).
  const state = parseWizardState(draft.answers);
  const rows = await c.query(api.photos.listDraftPhotos, { draftToken });
  const media = rows.length ? mediaFromPhotos(rows) : undefined;

  let content = generateContent({ state, media });
  content = await enhanceNarrative(content, state);

  // Valida contra el contentSchema del template (nunca persistir algo roto).
  try {
    content = parseContent(content);
  } catch (e) {
    return NextResponse.json(
      { error: "content inválido", detail: String(e) },
      { status: 500 }
    );
  }

  const theme: Theme = (draft.theme as Theme) ?? { palette: state.palette };

  // ── preview: guarda el content en el draft y lo devuelve ────────────────────
  if (mode !== "finalize") {
    await c.mutation(api.drafts.save, {
      token: draftToken,
      content,
      theme,
      status: "ready",
    });
    return NextResponse.json({ content, theme });
  }

  // ── finalize: sólo server-to-server (post-pago) ─────────────────────────────
  if (body.secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const plan: PlanId = (draft.plan as PlanId) ?? "basic";
  const subdomain = await uniqueSubdomain(c, content.couple, draft.subdomain);

  const { siteId } = await c.mutation(api.generate.finalizeSite, {
    draftToken,
    subdomain,
    templateSlug: draft.templateSlug ?? "anniversary",
    productSlug: draft.productSlug ?? "anniversary",
    content,
    theme,
    plan,
    email: draft.email ?? undefined,
    domain: draft.domainWish ? undefined : undefined, // el .love se conecta aparte (upsell)
  });

  const siteUrl = `https://${subdomain}.${APP_DOMAIN}`;

  // Emails post-compra (no bloqueantes: si fallan, el sitio igual quedó live).
  if (draft.email) {
    try {
      await sendPurchaseThanks(draft.email, {
        planName: PLANS[plan].name,
        amountUsd: PLANS[plan].priceUsd,
      });
      await sendSiteReady(draft.email, { siteUrl, couple: content.couple });
    } catch (e) {
      console.error("[generate] email post-compra falló:", e);
    }
  }

  return NextResponse.json({ ok: true, siteId, subdomain, url: siteUrl });
}
