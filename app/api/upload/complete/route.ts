// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/complete/route.ts — registra en Convex una foto ya subida a
//  Cloudflare Images (WP-4). El cliente llama a este endpoint después de hacer
//  PUT al uploadURL obtenido en /api/upload.
//
//  Necesita: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, NEXT_PUBLIC_CONVEX_URL
//
//  POST /api/upload/complete
//  body: { draftToken: string, category: string, id: string, caption?: string }
//  → 200 { cloudflareId, thumbUrl, fullUrl, category }
//  → 400 { error } si faltan campos requeridos
//  → 500 { error } en errores de Cloudflare o Convex
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { resolveUrls } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CompleteBody {
  draftToken?: unknown;
  category?: unknown;
  id?: unknown;
  caption?: unknown;
  filename?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parsear y validar el body
  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { draftToken, category, id, caption, filename } = body;

  if (!draftToken || typeof draftToken !== "string") {
    return NextResponse.json(
      { error: "Falta draftToken (string requerido)" },
      { status: 400 }
    );
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "Falta category (string requerido)" },
      { status: 400 }
    );
  }
  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Falta id (cloudflare image id, string requerido)" },
      { status: 400 }
    );
  }
  const captionStr =
    caption && typeof caption === "string" ? caption : undefined;
  const filenameStr =
    filename && typeof filename === "string" ? filename : undefined;

  // Resolver URLs de entrega desde Cloudflare
  let cloudflareId: string;
  let thumbUrl: string | null;
  let fullUrl: string | null;

  try {
    ({ cloudflareId, thumbUrl, fullUrl } = await resolveUrls(id));
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error al resolver URLs de Cloudflare";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Validar que tenemos URLs (pueden ser null si la imagen aún no procesó variantes)
  if (!thumbUrl || !fullUrl) {
    return NextResponse.json(
      {
        error:
          "La imagen aún no tiene variantes disponibles en Cloudflare. Reintentá en unos segundos.",
      },
      { status: 500 }
    );
  }

  // Registrar en Convex
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL no está configurada" },
      { status: 500 }
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.photos.recordDraftPhoto, {
      draftToken,
      category,
      cloudflareId,
      thumbUrl,
      fullUrl,
      caption: captionStr,
      filename: filenameStr,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al registrar foto en Convex";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ cloudflareId, thumbUrl, fullUrl, category });
}
