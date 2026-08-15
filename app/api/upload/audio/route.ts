// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/audio/route.ts — inicia la subida de la música de fondo (mp3) a
//  Convex file storage. Devuelve una URL de subida directa de un solo uso; el
//  cliente hace POST del blob a esa URL y recibe un storageId, que después registra
//  en /api/upload/audio/complete. Paralelo a /api/upload/video.
//
//  POST /api/upload/audio → 200 { uploadURL } | 500 { error }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL no está configurada" },
      { status: 500 }
    );
  }
  try {
    const client = new ConvexHttpClient(url);
    const uploadURL = await client.mutation(api.audio.generateUploadUrl, {});
    return NextResponse.json({ uploadURL });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al iniciar la subida del audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
