// ─────────────────────────────────────────────────────────────────────────────
//  app/api/domains/route.ts — endpoint interno para gestionar dominios custom
//  en el upsell `.love` (WP-4).
//
//  POST /api/domains
//    Body: { draftToken: string, domain: string, action?: 'add'|'verify'|'config' }
//
//  Autenticación (cualquiera de las dos):
//    - Header `x-internal-secret` === process.env.INTERNAL_SECRET  (server-to-server)
//    - draftToken no vacío (llamado desde el wizard en el upsell del usuario)
//
//  Acciones:
//    'add'    (default): agrega el dominio a Vercel + obtiene su config DNS
//    'verify': dispara la verificación DNS en Vercel
//    'config': sólo consulta el config DNS sin agregar
//
//  Env vars requeridas (delegadas a lib/domains.ts):
//    VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID (opcional)
//    INTERNAL_SECRET (opcional, para auth server-to-server)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import {
  addDomain,
  getDomainConfig,
  verifyDomain,
  vercelDnsInstructions,
} from "@/lib/domains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Tipos ────────────────────────────────────────────────────────────────────

type Action = "add" | "verify" | "config";

interface RequestBody {
  draftToken?: string;
  domain?: string;
  action?: Action;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  const { draftToken, domain, action = "add" } = body;

  // ── Autenticación ──────────────────────────────────────────────────────────
  const internalSecret = process.env.INTERNAL_SECRET;
  const headerSecret = req.headers.get("x-internal-secret");
  const isServerAuth = internalSecret
    ? headerSecret === internalSecret
    : false;
  const isUserAuth = typeof draftToken === "string" && draftToken.trim() !== "";

  if (!isServerAuth && !isUserAuth) {
    return NextResponse.json(
      { error: "No autorizado. Se requiere x-internal-secret o draftToken." },
      { status: 401 }
    );
  }

  // ── Validación del dominio ─────────────────────────────────────────────────
  if (!domain || typeof domain !== "string" || domain.trim() === "") {
    return NextResponse.json(
      { error: "El campo `domain` es requerido." },
      { status: 400 }
    );
  }

  const cleanDomain = domain.trim().toLowerCase();

  // ── Lógica por acción ─────────────────────────────────────────────────────
  try {
    if (action === "add") {
      const [addResult, config] = await Promise.all([
        addDomain(cleanDomain),
        getDomainConfig(cleanDomain),
      ]);

      return NextResponse.json({
        ok: true,
        domain: addResult,
        config,
        instructions: vercelDnsInstructions(),
      });
    }

    if (action === "verify") {
      const result = await verifyDomain(cleanDomain);
      return NextResponse.json({ ok: true, result });
    }

    if (action === "config") {
      const config = await getDomainConfig(cleanDomain);
      return NextResponse.json({
        ok: true,
        config,
        instructions: vercelDnsInstructions(),
      });
    }

    return NextResponse.json(
      { error: `Acción desconocida: '${String(action)}'. Usar 'add', 'verify' o 'config'.` },
      { status: 400 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    console.error("[api/domains] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
