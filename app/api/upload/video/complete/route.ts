// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/video/complete/route.ts — registra en Convex un video ya subido
//  a `_storage`. El cliente llama acá después de hacer POST del blob a la uploadURL
//  obtenida en /api/upload/video (que devuelve un storageId).
//
//  POST /api/upload/video/complete
//  body: { draftToken, storageId, category, poster?, caption? }
//  → 200 { src, slug, poster? } | 400 | 500 { error }
//
//  `src` es la URL de entrega servida por convex/http.ts en /video/<slug>.mp4
//  (dominio .convex.site). Se guarda en la fila y termina en content.watch.video.src.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CompleteBody {
  draftToken?: unknown;
  storageId?: unknown;
  category?: unknown;
  poster?: unknown;
  caption?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { draftToken, storageId, category, poster, caption } = body;
  if (!draftToken || typeof draftToken !== "string") {
    return NextResponse.json(
      { error: "Falta draftToken (string requerido)" },
      { status: 400 }
    );
  }
  if (!storageId || typeof storageId !== "string") {
    return NextResponse.json(
      { error: "Falta storageId (string requerido)" },
      { status: 400 }
    );
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "Falta category (string requerido)" },
      { status: 400 }
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL no está configurada" },
      { status: 500 }
    );
  }

  const site = convexUrl.replace(".convex.cloud", ".convex.site");
  const slug = crypto.randomUUID();
  const src = `${site}/video/${slug}.mp4`;
  const posterStr = poster && typeof poster === "string" ? poster : undefined;
  const captionStr = caption && typeof caption === "string" ? caption : undefined;

  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.videos.recordDraftVideo, {
      draftToken,
      slug,
      storageId: storageId as Id<"_storage">,
      src,
      category,
      poster: posterStr,
      caption: captionStr,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al registrar el video en Convex";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ src, slug, poster: posterStr });
}
