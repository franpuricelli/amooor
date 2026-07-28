// Sube las fotos (full + thumb) desde un directorio local a Convex file storage
// y las registra en la tabla `assets`. Idempotente (record hace upsert).
//
//   CONVEX_URL=https://<deployment>.convex.cloud \
//   ASSET_SECRET=<secret> \
//   PHOTOS_DIR=/ruta/a/public \
//   node scripts/upload-photos.mjs
//
// PHOTOS_DIR debe tener subcarpetas `photos/<cat>/<slug>.jpg` y `thumbs/<cat>/<slug>.jpg`.

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const URL = process.env.CONVEX_URL;
const SECRET = process.env.ASSET_SECRET;
const SRC = process.env.PHOTOS_DIR;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 8);

if (!URL || !SECRET || !SRC) {
  console.error("faltan env: CONVEX_URL, ASSET_SECRET, PHOTOS_DIR");
  process.exit(1);
}
const client = new ConvexHttpClient(URL);

async function collect() {
  const jobs = [];
  for (const [kind, dir] of [
    ["full", "photos"],
    ["thumb", "thumbs"],
  ]) {
    const base = path.join(SRC, dir);
    let cats;
    try {
      cats = await readdir(base);
    } catch {
      continue;
    }
    for (const cat of cats) {
      const catDir = path.join(base, cat);
      let files;
      try {
        files = await readdir(catDir);
      } catch {
        continue;
      }
      for (const f of files) {
        if (!f.toLowerCase().endsWith(".jpg")) continue;
        jobs.push({ kind, cat, slug: f.replace(/\.jpg$/i, ""), file: path.join(catDir, f) });
      }
    }
  }
  return jobs;
}

async function uploadOne(j) {
  const uploadUrl = await client.mutation(api.assets.generateUploadUrl, { secret: SECRET });
  const body = await readFile(j.file);
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body,
  });
  if (!res.ok) throw new Error(`upload ${j.file}: ${res.status}`);
  const { storageId } = await res.json();
  await client.mutation(api.assets.record, {
    secret: SECRET,
    kind: j.kind,
    cat: j.cat,
    slug: j.slug,
    storageId,
  });
}

const jobs = await collect();
console.log(`subiendo ${jobs.length} archivos @ concurrencia ${CONCURRENCY}`);
let done = 0;
let failed = 0;
async function worker(queue) {
  while (queue.length) {
    const j = queue.pop();
    try {
      await uploadOne(j);
    } catch (e) {
      failed++;
      console.error(e.message);
    }
    if (++done % 50 === 0) console.log(`${done}/${jobs.length}`);
  }
}
const queue = [...jobs];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log(`listo: ${done} procesados, ${failed} fallidos`);
