// Sube un archivo de audio a Convex file storage y lo registra como asset
// kind="audio". Se sirve por convex/http.ts en /audio/<cat>/<slug>.mp3.
//
//   CONVEX_URL=https://<deployment>.convex.cloud ASSET_SECRET=<secret> \
//   FILE=/ruta/al.mp3 CAT=music SLUG=when-i-was-your-man \
//   node scripts/upload-audio.mjs

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFile } from "node:fs/promises";

const { CONVEX_URL, ASSET_SECRET, FILE, CAT, SLUG } = process.env;
if (!CONVEX_URL || !ASSET_SECRET || !FILE || !CAT || !SLUG) {
  console.error("faltan env: CONVEX_URL, ASSET_SECRET, FILE, CAT, SLUG");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const uploadUrl = await client.mutation(api.assets.generateUploadUrl, { secret: ASSET_SECRET });
const body = await readFile(FILE);
const res = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": "audio/mpeg" },
  body,
});
if (!res.ok) throw new Error(`upload: ${res.status}`);
const { storageId } = await res.json();
await client.mutation(api.assets.record, {
  secret: ASSET_SECRET,
  kind: "audio",
  cat: CAT,
  slug: SLUG,
  storageId,
});
console.log(`listo: audio ${CAT}/${SLUG} → ${storageId}`);
