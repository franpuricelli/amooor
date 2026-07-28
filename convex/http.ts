// ─────────────────────────────────────────────────────────────────────────────
//  convex/http.ts — sirve las imágenes de `assets` en
//  `GET /img/<kind>/<cat>/<slug>.jpg` (kind = full|thumb). URLs estables y
//  cacheadas, así `lib/photos.ts` sólo antepone la base `.convex.site`.
// ─────────────────────────────────────────────────────────────────────────────

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const serveImage = httpAction(async (ctx, req) => {
  const { pathname } = new URL(req.url);
  const m = pathname.match(/^\/img\/(full|thumb)\/([^/]+)\/(.+?)(?:\.jpg)?$/);
  if (!m) return new Response("Not found", { status: 404 });

  const [, kind, cat, slugRaw] = m;
  const slug = decodeURIComponent(slugRaw);

  const asset = await ctx.runQuery(api.assets.getByKey, { kind, cat, slug });
  if (!asset) return new Response("Not found", { status: 404 });

  const blob = await ctx.storage.get(asset.storageId);
  if (!blob) return new Response("Not found", { status: 404 });

  return new Response(blob, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

const http = httpRouter();
http.route({ pathPrefix: "/img/", method: "GET", handler: serveImage });

export default http;
