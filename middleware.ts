import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Soft gate: we do NOT call `auth.protect()`. The middleware only makes auth
// available to hooks/components and serves Clerk's proxy handshake. Every public
// surface — the marketing landing, the tenant sites, and /comenzar — stays
// public; the /comenzar chat is gated client-side in Chat.tsx (first send opens
// the sign-in modal). Server-side enforcement of /api/chat is deferred.
//
// We also expose the request pathname as `x-amooor-path` so `currentHost()`
// (lib/site-server) can serve a tenant BY PATH (`/s/<slug>`) on the single deploy
// host (no wildcard), instead of a global cookie that would hijack the whole app.
export default clerkMiddleware((_auth, req) => {
  const headers = new Headers(req.headers);
  headers.set("x-amooor-path", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|avif|woff2?|ttf|otf|eot|mp3|mp4|webm|txt|xml|map)).*)",
    // Always run for API routes and Clerk's proxy handshake.
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
