// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/video/route.ts — inicia la subida de un video a Convex file
//  storage (sección "watch", post-aprobación). Devuelve una URL de subida directa
//  de un solo uso; el cliente hace POST del blob a esa URL y recibe un storageId,
//  que después registra en /api/upload/video/complete.
//
//  Convex es Images-only vía Cloudflare (fotos); el video reusa `_storage` para no
//  sumar vendor/billing (Cloudflare Stream no está configurado).
//
//  POST /api/upload/video → 200 { uploadURL } | 500 { error }
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
    const uploadURL = await client.mutation(api.videos.generateUploadUrl, {});
    return NextResponse.json({ uploadURL });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al iniciar la subida del video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
