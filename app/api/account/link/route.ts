// ─────────────────────────────────────────────────────────────────────────────
//  app/api/account/link/route.ts — al iniciar sesión, vincula el draft local a la
//  cuenta Clerk y devuelve el token que el cliente debe usar. La identidad la pone
//  Clerk en el server (`auth()`), no el cliente → nadie puede reclamar el token de
//  otro. Convex se llama con ASSET_SECRET (server-only).
//
//  Necesita: NEXT_PUBLIC_CONVEX_URL, ASSET_SECRET (+ Clerk configurado).
//
//  POST /api/account/link
//  body: { token: string }   (token local actual del cliente)
//  → 200 { token, adopted }  (token a usar; adopted=true si viene de la cuenta)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.ASSET_SECRET;
  if (!url || !secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let token: unknown;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    undefined;

  try {
    const client = new ConvexHttpClient(url);
    const res = await client.mutation(api.account.linkToUser, {
      secret,
      token,
      clerkUserId: userId,
      email,
    });
    return NextResponse.json(res);
  } catch (e) {
    console.error("[account/link] falló:", e);
    return NextResponse.json({ error: "link_failed" }, { status: 500 });
  }
}
