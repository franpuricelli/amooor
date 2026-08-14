// gen-placeholders.mjs — generate the template's blank placeholder art.
// Uses sharp (a dependency) to rasterize small vector SVGs — no font deps.
// Three aspect ratios (portrait / square / landscape) so grids and collages
// read like a natural mix of photos instead of a flat wall.
// Run: node tools/gen-placeholders.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const ROSE_BG = "#F6EAF1";
const FRAME = "#E9CFDD";
const HEART = "#E4BBCF";
const HEART_FILL = "#EFD8E4";

const HEART_PATH =
  "M50 86 C 18 60, 8 39, 25 24 C 37 13.5, 50 21, 50 33 C 50 21, 63 13.5, 75 24 C 92 39, 82 60, 50 86 Z";

function card({ w, h, bg = ROSE_BG, heart = HEART, heartFill = HEART_FILL, frame = true }) {
  const s = Math.min(w, h);
  const hs = s * 0.24;
  const hx = (w - hs) / 2;
  const hy = (h - hs) / 2;
  const inset = Math.round(s * 0.055);
  const frameRect = frame
    ? `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${Math.round(
        s * 0.03
      )}" fill="none" stroke="${FRAME}" stroke-width="${Math.max(2, Math.round(s * 0.006))}"/>`
    : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
       <rect width="${w}" height="${h}" fill="${bg}"/>
       ${frameRect}
       <g transform="translate(${hx} ${hy}) scale(${hs / 100})">
         <path d="${HEART_PATH}" fill="${heartFill}" stroke="${heart}" stroke-width="3.2" stroke-linejoin="round"/>
       </g>
     </svg>`
  );
}

const jpg = (buf, out, q = 82) => sharp(buf).jpeg({ quality: q }).toFile(out);
const png = (buf, out) => sharp(buf).png().toFile(out);

// Shared blanks, served straight from /public — every empty photo slot and every
// placeholder artist avatar points here instead of getting its own identical
// copy (see tools/build-template-media.mjs and lib/config.ts).
mkdirSync("public/_blank", { recursive: true });

// [variant, fullW, fullH, thumbW, thumbH]
const VARIANTS = [
  ["a", 900, 1200, 480, 640], // portrait 3:4
  ["b", 1100, 1100, 560, 560], // square
  ["c", 1200, 900, 640, 480], // landscape 4:3
];

await Promise.all([
  ...VARIANTS.flatMap(([v, fw, fh, tw, th]) => [
    jpg(card({ w: fw, h: fh }), `public/_blank/full-${v}.jpg`),
    jpg(card({ w: tw, h: th }), `public/_blank/thumb-${v}.jpg`),
  ]),
  // one shared blank artist avatar (lib/config.ts points every artist at it)
  jpg(card({ w: 320, h: 320 }), "public/_blank/artist.jpg"),
  // footer drawing card
  png(card({ w: 900, h: 640 }), "public/drawing.png"),
  // favicon: brand pink with a white heart
  png(
    card({ w: 512, h: 512, bg: "#ff6fae", heart: "#ffffff", heartFill: "rgba(255,255,255,0.28)", frame: false }),
    "app/icon.png"
  ),
  // social cards
  png(card({ w: 1200, h: 630 }), "app/opengraph-image.png"),
  png(card({ w: 1200, h: 630 }), "app/twitter-image.png"),
]);

console.log("placeholders generated (3 aspect variants)");
