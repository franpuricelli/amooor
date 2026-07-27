import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "tools/shots";
const URL = process.env.URL ?? "http://localhost:3000";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push("PAGEERR: " + e.message));
page.on("requestfailed", (r) => {
  const u = r.url();
  if (u.includes("localhost")) errors.push("LOCAL404: " + u);
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
await sleep(1800);

async function shotId(name, id, offset = -80) {
  await page.evaluate((sel, off) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
  }, id, offset);
  await sleep(1300);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, quality: 80, type: "jpeg" });
}

// hero + person hover states
await page.screenshot({ path: `${OUT}/01-hero.jpg`, quality: 80, type: "jpeg" });
await page.hover(".zone-l");
await sleep(700);
await page.screenshot({ path: `${OUT}/02-hero-ivi.jpg`, quality: 80, type: "jpeg" });
await page.hover(".zone-r");
await sleep(700);
await page.screenshot({ path: `${OUT}/03-hero-fran.jpg`, quality: 80, type: "jpeg" });

await shotId("04-stats", ".stats-band", -200);
await shotId("05-historia", "#historia");
await shotId("06-viajes", "#viajes");
await shotId("07-cocina", "#cocina");
await shotId("08-momentos", "#momentos");
await shotId("09-pelis", "#pelis");
await shotId("10-galeria", "#galeria");

// lightbox
await page.click("#galeria .tile");
await sleep(1200);
await page.screenshot({ path: `${OUT}/11-lightbox.jpg`, quality: 80, type: "jpeg" });
await page.keyboard.press("Escape");
await sleep(400);

await shotId("12-footer", ".footer", -200);

const total = await page.evaluate(() => document.body.scrollHeight);

// mobile
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
await sleep(1800);
await page.screenshot({ path: `${OUT}/m1-hero.jpg`, quality: 80, type: "jpeg" });
await page.evaluate(() => window.scrollTo(0, 900));
await sleep(900);
await page.screenshot({ path: `${OUT}/m2-hero-cards.jpg`, quality: 80, type: "jpeg" });
await shotId("m3-viajes", "#viajes");
await shotId("m4-momentos", "#momentos");

await browser.close();
console.log("page height:", total);
console.log("CONSOLE ISSUES:", errors.length ? [...new Set(errors)].slice(0, 12) : "none");
console.log("DONE");
