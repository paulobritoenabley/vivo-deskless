// Fotografa o palco e a virada em posições exatas de progresso, e a página
// inteira em passos. Uso: node quadros.mjs <saida> [largura] [altura] [--reduz]
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");

const out = path.resolve(process.argv[2] || "quadros");
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const reduz = process.argv.includes("--reduz");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: W, height: H }, reducedMotion: reduz ? "reduce" : "no-preference" });
const erros = [];
page.on("pageerror", (e) => erros.push(e.message));
page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
await page.goto("http://localhost:4500/index.html?direto", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });

async function ir(id, p) {
  await page.evaluate(([id, p]) => {
    const a = ScrollCraft.instances[0].acts.find((x) => x.el.id === id);
    scrollTo(0, Math.round(a.top + p * (a.height - innerHeight)));
  }, [id, p]);
  await page.waitForTimeout(350);
}
const alvos = [
  ["palco", [0, 0.16, 0.21, 0.26, 0.36, 0.5, 0.55, 0.66, 0.76, 0.8, 0.9, 1]],
  ["virada", [0, 0.15, 0.3, 0.45, 0.7, 1]],
];
for (const [id, ps] of alvos) {
  for (const p of ps) {
    await ir(id, p);
    await page.screenshot({ path: path.join(out, `${id}-${String(Math.round(p * 100)).padStart(3, "0")}.png`) });
  }
}
// O resto da página, de tela em tela.
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const vir = await page.evaluate(() => { const a = ScrollCraft.instances[0].acts.find((x) => x.el.id === "virada"); return a.top + a.height; });
let n = 0;
for (let y = vir - H * 0.3; y < total; y += H * 0.7) {
  await page.evaluate((y) => scrollTo(0, y), Math.round(y));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, `resto-${String(n++).padStart(2, "0")}.png`) });
}
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, `resto-fim.png`) });
console.log(JSON.stringify({ erros, total, H }));
await browser.close();
