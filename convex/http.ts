// ─────────────────────────────────────────────────────────────────────────────
//  convex/http.ts — sirve los `assets` desde Convex file storage:
//    GET /img/<full|thumb>/<cat>/<slug>.jpg   → image/jpeg
//    GET /audio/<cat>/<slug>.mp3              → audio/mpeg
//  URLs estables y cacheadas; `lib/photos.ts` sólo antepone la base `.convex.site`.
// ─────────────────────────────────────────────────────────────────────────────

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

async function serve(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  kind: string,
  cat: string,
  slug: string,
  contentType: string
) {
  const asset = await ctx.runQuery(api.assets.getByKey, { kind, cat, slug });
  if (!asset) return new Response("Not found", { status: 404 });
  const blob = await ctx.storage.get(asset.storageId);
  if (!blob) return new Response("Not found", { status: 404 });
  return new Response(blob, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

const serveImage = httpAction(async (ctx, req) => {
  const m = new URL(req.url).pathname.match(
    /^\/img\/(full|thumb)\/([^/]+)\/(.+?)(?:\.jpg)?$/
  );
  if (!m) return new Response("Not found", { status: 404 });
  const [, kind, cat, slug] = m;
  return serve(ctx, kind, cat, decodeURIComponent(slug), "image/jpeg");
});

const serveAudio = httpAction(async (ctx, req) => {
  const m = new URL(req.url).pathname.match(/^\/audio\/([^/]+)\/(.+?)(?:\.mp3)?$/);
  if (!m) return new Response("Not found", { status: 404 });
  const [, cat, slug] = m;
  return serve(ctx, "audio", cat, decodeURIComponent(slug), "audio/mpeg");
});

const http = httpRouter();
http.route({ pathPrefix: "/img/", method: "GET", handler: serveImage });
http.route({ pathPrefix: "/audio/", method: "GET", handler: serveAudio });

export default http;
