// gen-placeholders.mjs — generate the template's blank placeholder art.
// Uses sharp (a dependency) to rasterize small vector SVGs, so there are no
// font dependencies. Run: node tools/gen-placeholders.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const ROSE_BG = "#F6EAF1";
const FRAME = "#E9CFDD";
const HEART = "#E4BBCF";
const HEART_FILL = "#EFD8E4";

// A heart path in a 0..100 box.
const HEART_PATH =
  "M50 86 C 18 60, 8 39, 25 24 C 37 13.5, 50 21, 50 33 C 50 21, 63 13.5, 75 24 C 92 39, 82 60, 50 86 Z";

function card({ w, h, bg = ROSE_BG, heart = HEART, heartFill = HEART_FILL, frame = true }) {
  const s = Math.min(w, h);
  const hs = s * 0.26; // heart size
  const hx = (w - hs) / 2;
  const hy = (h - hs) / 2;
  const inset = Math.round(s * 0.06);
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

mkdirSync("public/brand/artists", { recursive: true });
mkdirSync("tools/_blank", { recursive: true });

await Promise.all([
  // reusable photo blanks (copied into every category by build-template-media.mjs)
  jpg(card({ w: 1200, h: 1200 }), "tools/_blank/full.jpg"),
  jpg(card({ w: 600, h: 600 }), "tools/_blank/thumb.jpg"),
  // six square artist avatars
  ...[1, 2, 3, 4, 5, 6].map((n) =>
    jpg(card({ w: 320, h: 320 }), `public/brand/artists/artist-${n}.jpg`)
  ),
  // footer drawing card
  png(card({ w: 900, h: 640 }), "public/drawing.png"),
]);

// favicon + social images live in app/
await png(card({ w: 512, h: 512, bg: "#ff6fae", heart: "#ffffff", heartFill: "rgba(255,255,255,0.28)", frame: false }), "app/icon.png");
await png(card({ w: 1200, h: 630 }), "app/opengraph-image.png");
await png(card({ w: 1200, h: 630 }), "app/twitter-image.png");

console.log("placeholders generated");
