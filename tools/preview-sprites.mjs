// Render IVI & PURI to a PNG for quick visual iteration.
// Builders are duplicated from lib/sprites.ts (keep in sync while iterating).
import sharp from "sharp";
import { readFileSync } from "node:fs";

const src = readFileSync("lib/sprites.ts", "utf8");
const palMatch = src.match(/export const PALETTE[^{]*{([\s\S]*?)};/);
const PALETTE = { ".": "transparent" };
for (const line of palMatch[1].split("\n")) {
  const m = line.match(/^\s*([A-Za-z.]+):\s*"([^"]+)"/);
  if (m) PALETTE[m[1]] = m[2];
}

const GW = 24, GH = 32;
const newGrid = () => Array.from({ length: GH }, () => Array(GW).fill("."));
const R = (g, x, y, w, h, c) => { for (let j=0;j<h;j++) for (let i=0;i<w;i++){const X=x+i,Y=y+j; if(X>=0&&X<GW&&Y>=0&&Y<GH)g[Y][X]=c;} };
const P = (g, x, y, c) => { if(x>=0&&x<GW&&y>=0&&y<GH)g[y][x]=c; };
const toS = (g) => g.map(r=>r.join(""));

// Extract the two build function bodies from the TS source and run them.
function runBuilder(name) {
  const re = new RegExp(`function ${name}\\(\\)[^{]*{([\\s\\S]*?)\\n}`, "m");
  const m = src.match(re);
  let bodyText = m[1].replace(/return toS\(g\);/, "return toS(g);");
  const fn = new Function("newGrid","R","P","toS", bodyText);
  return fn(newGrid, R, P, toS);
}
const IVI = runBuilder("buildIvi");
const PURI = runBuilder("buildPuri");

const SCALE = 16, PAD = 20;
function toSvg(grid) {
  const w = grid[0].length * SCALE, h = grid.length * SCALE;
  let rects = "";
  for (let y=0;y<grid.length;y++) for (let x=0;x<grid[y].length;x++){
    const col = PALETTE[grid[y][x]];
    if (!col || col === "transparent") continue;
    rects += `<rect x="${x*SCALE}" y="${y*SCALE}" width="${SCALE}" height="${SCALE}" fill="${col}"/>`;
  }
  return { svg:`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`, w, h };
}
const a = toSvg(IVI), b = toSvg(PURI);
const W = a.w + b.w + PAD*3, H = Math.max(a.h,b.h) + PAD*2;
await sharp({ create:{ width:W, height:H, channels:3, background:"#b9cdd6" } })
  .composite([
    { input: Buffer.from(a.svg), left: PAD, top: PAD },
    { input: Buffer.from(b.svg), left: PAD*2 + a.w, top: PAD },
  ]).png().toFile("tools/shots/sprite-preview.png");
console.log("wrote tools/shots/sprite-preview.png");
