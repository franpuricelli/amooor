// ─────────────────────────────────────────────────────────────────────────────
//  app/api/upload/route.ts — genera un direct-upload URL de Cloudflare Images
//  (WP-4). El cliente sube la foto directamente a Cloudflare; nunca pasa por
//  nuestros servidores.
//
//  Necesita: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
//
//  POST /api/upload
//  → 200 { id, uploadURL }
//  → 500 { error } si faltan env vars o falla Cloudflare
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ensureVariants, createDirectUpload } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  try {
    // Asegura que las variantes thumb/full existan (best-effort, no bloquea)
    await ensureVariants();

    const { id, uploadURL } = await createDirectUpload();

    return NextResponse.json({ id, uploadURL });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al crear upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
