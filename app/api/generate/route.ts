import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { parseWizardState, type WizardState } from "@/lib/draft";
import { parsePlan } from "@/lib/plan";
import { planToWizardState, planSectionSlugs } from "@/lib/plan-to-state";
import { generateContent, mediaFromPhotos } from "@/lib/generate";
import { enhanceNarrative } from "@/lib/ai";
import { stylizeClosingDrawing, isFalImage } from "@/lib/fal";
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
// El content ya hace un pass de LLM (enhanceNarrative) y ahora, si hay foto de
// cierre, una edición image-to-image en FAL (gpt-image-2, ~20-60s). Subimos el
// límite para que no corte. (Vercel: Pro admite hasta 300; Hobby cap 60.)
export const maxDuration = 300;

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
  const rows = await c.query(api.photos.listDraftPhotos, { draftToken });
  // Música de fondo subida (mp3 del navbar) → content.media.audioUrl.
  const audioRow = await c.query(api.audio.getDraftAudio, { draftToken });
  // Siempre (aunque no haya subido nada): un sitio con `media` presente usa SUS
  // fotos — sin él caería al manifiesto estático de la demo (Puri & Ivi).
  const media = mediaFromPhotos(rows, audioRow?.src);

  // Rama chat-first: si el draft tiene `intakePlan` aprobado y NO tiene answers
  // del wizard viejo, generamos desde el plan (Plan → WizardState). Si no, se
  // mantiene intacto el flujo del wizard (parseWizardState(answers)).
  const intakePlan = draft.intakePlan ? parsePlan(draft.intakePlan) : null;
  const hasWizardAnswers =
    draft.answers && Object.keys(draft.answers).length > 0;
  let state: WizardState;
  let closingCategory: string | null = null;
  if (intakePlan && !hasWizardAnswers) {
    state = planToWizardState(intakePlan, draft.theme?.palette);
    closingCategory =
      planSectionSlugs(intakePlan).find((s) => s.section.kind === "closing")
        ?.category ?? null;
  } else {
    state = parseWizardState(draft.answers);
  }

  // Video subido (sección watch) → state.video (antes de generar el content).
  const videos = await c.query(api.videos.listDraftVideos, { draftToken });
  const vid = videos[0];
  if (vid) {
    state.video = {
      mode: "upload",
      src: vid.src,
      poster: vid.poster,
      caption: vid.caption ?? "",
    };
  }

  let content = generateContent({
    state,
    media,
    ...(closingCategory ? { closingCat: closingCategory } : {}),
  });
  content = await enhanceNarrative(content, state);

  // Imagen del cierre (el "dibujo" que se da vuelta) → content.drawing.src.
  // La foto real subida se convierte al estilo del dibujo hecho a mano vía FAL
  // (image-to-image). Si FAL no está configurado o falla, cae a la foto tal cual.
  if (closingCategory) {
    const closingPhoto = rows
      .filter((r) => r.category === closingCategory)
      .sort((a, b) => a.order - b.order)[0];
    if (closingPhoto) {
      // En finalize reusa el resultado ya estilizado del preview (no re-llama a FAL).
      const prior = (draft.content as { drawing?: { src?: string } } | undefined)
        ?.drawing?.src;
      let src = closingPhoto.fullUrl;
      if (mode === "finalize" && isFalImage(prior)) {
        src = prior!;
      } else {
        const styleUrl =
          process.env.FAL_DRAWING_STYLE_URL ??
          new URL(content.drawing.src, req.nextUrl.origin).toString();
        src =
          (await stylizeClosingDrawing({ photoUrl: closingPhoto.fullUrl, styleUrl })) ??
          closingPhoto.fullUrl;
      }
      content.drawing = { ...content.drawing, src };
    }
  }

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
