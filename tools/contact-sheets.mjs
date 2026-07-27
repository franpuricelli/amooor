// contact-sheets.mjs — composite the 320px thumbs into labelled grid montages
// so a curation agent can review ~35 photos in a single image read.
// Each cell is labelled with its slug so the agent can reference photos by name.
//
//   node tools/contact-sheets.mjs
//   -> tools/sheets/sheet-01.jpg ... plus tools/sheets/index.json
import sharp from "sharp";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const THUMBS = "public/thumbs";
const OUT = "tools/sheets";
mkdirSync(OUT, { recursive: true });

const slugs = readdirSync(THUMBS)
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.replace(/\.jpg$/, ""))
  .sort();

const CELL = 240; // rendered cell size in the sheet
const PAD = 8;
const LABEL_H = 22;
const COLS = 6;
const ROWS = 6;
const PER_SHEET = COLS * ROWS;

function svgLabel(text, w) {
  return Buffer.from(
    `<svg width="${w}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#1a1a1a"/>` +
      `<text x="4" y="15" font-family="monospace" font-size="12" fill="#fff">${text}</text></svg>`
  );
}

const sheets = [];
for (let s = 0; s * PER_SHEET < slugs.length; s++) {
  const batch = slugs.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const rows = Math.ceil(batch.length / COLS);
  const cellW = CELL + PAD;
  const cellH = CELL + LABEL_H + PAD;
  const W = COLS * cellW + PAD;
  const H = rows * cellH + PAD;

  const composites = [];
  for (let i = 0; i < batch.length; i++) {
    const slug = batch[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * cellW;
    const y = PAD + row * cellH;
    const img = await sharp(join(THUMBS, `${slug}.jpg`))
      .resize(CELL, CELL, { fit: "cover" })
      .jpeg()
      .toBuffer();
    composites.push({ input: img, left: x, top: y });
    composites.push({ input: svgLabel(slug, CELL), left: x, top: y + CELL });
  }

  const name = `sheet-${String(s + 1).padStart(2, "0")}.jpg`;
  await sharp({
    create: { width: W, height: H, channels: 3, background: "#2a2a2a" },
  })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(join(OUT, name));
  sheets.push({ sheet: name, slugs: batch });
  console.log(`  ${name}: ${batch.length} photos`);
}

const { writeFileSync } = await import("node:fs");
writeFileSync(join(OUT, "index.json"), JSON.stringify(sheets, null, 2));
console.log(`DONE: ${sheets.length} sheets, ${slugs.length} photos`);
