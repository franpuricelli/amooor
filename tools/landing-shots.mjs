import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "tools/landing-shots";
const URL = process.env.URL ?? "http://localhost:3111";
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
await sleep(2000);

await page.screenshot({ path: `${OUT}/01-hero.jpg`, quality: 82, type: "jpeg" });

async function shotSel(name, sel, off = -110) {
  const ok = await page.evaluate((s, o) => {
    const el = document.querySelector(s);
    if (!el) return false;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + o);
    return true;
  }, sel, off);
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, quality: 82, type: "jpeg" });
  return ok;
}

await shotSel("02-como", "#como-funciona");
await shotSel("03-ejemplos", "#ejemplos");
await shotSel("04-wall", ".mk-wall", -260);
await shotSel("05-precios", "#precios");
await shotSel("06-faq", "#faq");
await shotSel("07-footer", ".mk-footer-cta", -120);

// full page stitch
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(400);
await page.screenshot({ path: `${OUT}/00-full.jpg`, quality: 70, type: "jpeg", fullPage: true });

// mobile
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
await sleep(1800);
await page.screenshot({ path: `${OUT}/m1-hero.jpg`, quality: 82, type: "jpeg" });
await shotSel("m2-precios", "#precios", -80);

const total = await page.evaluate(() => document.body.scrollHeight);
await browser.close();
console.log("page height:", total);
console.log("CONSOLE ISSUES:", errors.length ? [...new Set(errors)].slice(0, 12) : "none");
console.log("DONE");
