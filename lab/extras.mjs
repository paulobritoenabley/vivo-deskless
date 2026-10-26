// Custo (computador e celular), tela de carregamento e abertura sem ?direto,
// e o palco com movimento reduzido.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");
const out = path.resolve("extras");
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const erros = [];

for (const [nome, w, h] of [["desk", 1440, 900], ["mob", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto("http://localhost:4500/index.html?direto", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById("custo").scrollIntoView());
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(out, `custo-${nome}.png`), fullPage: false });
  await page.evaluate(() => scrollBy(0, innerHeight * 0.8));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, `custo2-${nome}.png`) });
  await page.close();
}

// Abertura de verdade: carregando, folhas abrindo, entrada, aceno, rolagem presa.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => erros.push(e.message));
await page.goto("http://localhost:4500/index.html");
const tempos = [300, 1500, 2100, 3000, 4200, 5400, 6400];
let t0 = Date.now(), presa = [];
for (const t of tempos) {
  await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await page.screenshot({ path: path.join(out, `abertura-${t}.png`) });
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(80);
  presa.push([t, await page.evaluate(() => scrollY)]);
  await page.evaluate(() => scrollTo(0, 0));
}
await page.close();

const red = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
red.on("pageerror", (e) => erros.push(e.message));
await red.goto("http://localhost:4500/index.html");
await red.waitForTimeout(2600);
await red.screenshot({ path: path.join(out, `reduz-0.png`) });
for (const p of [0.25, 0.5, 0.8, 0.95]) {
  await red.evaluate((p) => { const a = ScrollCraft.instances[0].acts.find((x) => x.el.id === "palco"); scrollTo(0, a.top + p * (a.height - innerHeight)); }, p);
  await red.waitForTimeout(400);
  await red.screenshot({ path: path.join(out, `reduz-${Math.round(p * 100)}.png`) });
}
console.log(JSON.stringify({ erros, presa }));
await browser.close();
