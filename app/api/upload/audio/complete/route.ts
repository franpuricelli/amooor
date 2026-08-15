// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/audio/complete/route.ts — registra en Convex la música ya subida
//  a `_storage`. El cliente llama acá después de hacer POST del blob a la uploadURL
//  obtenida en /api/upload/audio (que devuelve un storageId).
//
//  POST /api/upload/audio/complete
//  body: { draftToken, storageId, filename? }
//  → 200 { src, slug } | 400 | 500 { error }
//
//  `src` es la URL de entrega servida por convex/http.ts en /track/<slug>.mp3
//  (dominio .convex.site). Termina en content.media.audioUrl (lo toca MusicToggle).
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
  filename?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { draftToken, storageId, filename } = body;
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

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL no está configurada" },
      { status: 500 }
    );
  }

  const site = convexUrl.replace(".convex.cloud", ".convex.site");
  const slug = crypto.randomUUID();
  const src = `${site}/track/${slug}.mp3`;
  const filenameStr =
    filename && typeof filename === "string" ? filename : undefined;

  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.audio.recordDraftAudio, {
      draftToken,
      slug,
      storageId: storageId as Id<"_storage">,
      src,
      filename: filenameStr,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al registrar el audio en Convex";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ src, slug });
}
