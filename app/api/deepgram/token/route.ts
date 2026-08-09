import { type NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/deepgram/token — mintea un token EFÍMERO de Deepgram (grant/scoped,
//  TTL corto) para que el browser abra el WS de STT directo SIN exponer la key
//  real (Q15 del plan: browser-direct por latencia + seguridad). La
//  DEEPGRAM_API_KEY nunca llega al cliente; sólo viaja este access_token de ~30s.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_SECONDS = 30;

export async function POST(req: NextRequest) {
  if (!rateLimit(`dg:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY no configurado" },
      { status: 500 }
    );
  }

  // ⚠️ FALLBACK SÓLO PARA DEV/LOCAL (DEEPGRAM_ALLOW_RAW_KEY=1): devuelve la key
  // REAL al browser para keys restringidas que no pueden mintear tokens efímeros
  // (grant/keys API sin scope). EXPONE la key en el cliente: NUNCA en producción,
  // y ROTAR la key después. La ruta segura por defecto (abajo) usa /auth/grant.
  const allowRaw =
    process.env.DEEPGRAM_ALLOW_RAW_KEY === "1" ||
    process.env.DEEPGRAM_ALLOW_RAW_KEY === "true";
  if (allowRaw) {
    console.warn(
      "[deepgram/token] DEV: sirviendo la key REAL al browser (DEEPGRAM_ALLOW_RAW_KEY). No usar en prod."
    );
    return NextResponse.json({ access_token: key, expires_in: 0, dev_raw_key: true });
  }

  try {
    const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: TTL_SECONDS }),
    });
    if (!res.ok) {
      // La key no tiene permiso para mintear tokens (scope insuficiente): en prod
      // hace falta una key con grant/keys:write, o el fallback de proxy del stream.
      return NextResponse.json(
        { error: "deepgram_grant_failed", detail: await res.text().catch(() => "") },
        { status: 502 }
      );
    }
    const data = await res.json();
    // La API devuelve { access_token, expires_in }. Sólo eso llega al browser.
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in ?? TTL_SECONDS,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "deepgram_error", detail: String(e) },
      { status: 500 }
    );
  }
}
