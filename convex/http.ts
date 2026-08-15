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

// Video subido de un draft (sección watch): GET /video/<slug>.mp4 → video/mp4.
// Soporta el header Range (206 Partial Content) para que el <video> pueda buscar.
const serveVideo = httpAction(async (ctx, req) => {
  const m = new URL(req.url).pathname.match(/^\/video\/(.+?)(?:\.mp4)?$/);
  if (!m) return new Response("Not found", { status: 404 });
  const slug = decodeURIComponent(m[1]);
  const row = await ctx.runQuery(api.videos.getBySlug, { slug });
  if (!row) return new Response("Not found", { status: 404 });
  const blob = await ctx.storage.get(row.storageId);
  if (!blob) return new Response("Not found", { status: 404 });

  const size = blob.size;
  const common: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("Range") ?? req.headers.get("range");
  const rm = range && /bytes=(\d*)-(\d*)/.exec(range);
  if (rm) {
    let start = rm[1] ? parseInt(rm[1], 10) : 0;
    let end = rm[2] ? parseInt(rm[2], 10) : size - 1;
    if (!Number.isFinite(start) || start < 0) start = 0;
    if (!Number.isFinite(end) || end >= size) end = size - 1;
    if (start > end) start = 0;
    const chunk = blob.slice(start, end + 1, "video/mp4");
    return new Response(chunk, {
      status: 206,
      headers: {
        ...common,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  return new Response(blob, {
    status: 200,
    headers: { ...common, "Content-Length": String(size) },
  });
});

// Música de fondo subida de un draft (el mp3 del navbar): GET /track/<slug>.mp3 →
// audio/mpeg. Soporta Range (206) para que el <audio> pueda buscar. Paralelo a
// serveVideo; el /audio/ de arriba es la librería estática (tabla `assets`).
const serveTrack = httpAction(async (ctx, req) => {
  const m = new URL(req.url).pathname.match(/^\/track\/(.+?)(?:\.mp3)?$/);
  if (!m) return new Response("Not found", { status: 404 });
  const slug = decodeURIComponent(m[1]);
  const row = await ctx.runQuery(api.audio.getBySlug, { slug });
  if (!row) return new Response("Not found", { status: 404 });
  const blob = await ctx.storage.get(row.storageId);
  if (!blob) return new Response("Not found", { status: 404 });

  const size = blob.size;
  const common: Record<string, string> = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("Range") ?? req.headers.get("range");
  const rm = range && /bytes=(\d*)-(\d*)/.exec(range);
  if (rm) {
    let start = rm[1] ? parseInt(rm[1], 10) : 0;
    let end = rm[2] ? parseInt(rm[2], 10) : size - 1;
    if (!Number.isFinite(start) || start < 0) start = 0;
    if (!Number.isFinite(end) || end >= size) end = size - 1;
    if (start > end) start = 0;
    const chunk = blob.slice(start, end + 1, "audio/mpeg");
    return new Response(chunk, {
      status: 206,
      headers: {
        ...common,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  return new Response(blob, {
    status: 200,
    headers: { ...common, "Content-Length": String(size) },
  });
});

const http = httpRouter();
http.route({ pathPrefix: "/img/", method: "GET", handler: serveImage });
http.route({ pathPrefix: "/audio/", method: "GET", handler: serveAudio });
http.route({ pathPrefix: "/video/", method: "GET", handler: serveVideo });
http.route({ pathPrefix: "/track/", method: "GET", handler: serveTrack });

export default http;
