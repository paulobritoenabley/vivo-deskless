// Mede a página num celular lento simulado: tela de iPhone (390x844, dpr 3),
// processador N vezes mais lento, e um gesto de rolagem de toque de verdade
// (CDP synthesizeScrollGesture, sem JavaScript por passo, que roubaria o
// processador da página). Conta quantos quadros cada efeito chegou a desenhar.
// Uso: node perf.mjs <rotulo> [cpu=6] [velocidade px/s=1400] [porta=4500]
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");

const rotulo = process.argv[2] || "base";
const CPU = +(process.argv[3] || 6);
const VEL = +(process.argv[4] || 1400);
const PORTA = process.argv[5] || "4500";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await page.goto(`http://localhost:${PORTA}/index.html?direto`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" + (process.argv[6] || "") });
await page.waitForTimeout(1500);
const fim = await page.evaluate(() => { const a = ScrollCraft.instances[0].acts.find((x) => x.el.id === "virada"); return a.top + a.height; });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });

// Registro por quadro: tempo e o progresso que a cena mostra.
await page.evaluate(() => {
  const acts = ScrollCraft.instances[0].acts;
  const pal = acts.find((a) => a.el.id === "palco"), vir = acts.find((a) => a.el.id === "virada");
  const v = () => window.__cenaVista || { palco: pal.p, virada: vir.p };
  window.__q = [];
  (function f(t) { window.__q.push([t, v().palco, v().virada]); requestAnimationFrame(f); })(performance.now());
});

const t0 = Date.now();
// Em trechos, como um dedo: arrasta, solta, arrasta de novo.
for (let feito = 0; feito < fim; feito += 1200) {
  await cdp.send("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -Math.min(1200, fim - feito), speed: VEL, gestureSourceType: "mouse", preventFling: true, repeatCount: 1 });
  // (o gesto "touch" não rola nada no Chrome sem tela, nem numa página vazia)
}
const duracao = (Date.now() - t0) / 1000;
await page.waitForTimeout(600);
const q = await page.evaluate(() => window.__q);
const yFinal = await page.evaluate(() => scrollY);

const dts = q.slice(1).map((r, i) => r[0] - q[i][0]).filter((d) => d < 3000).sort((a, b) => a - b);
const med = dts[dts.length >> 1], p95 = dts[Math.floor(dts.length * 0.95)], max = dts[dts.length - 1];
const janela = (col, a, b) => new Set(q.filter((r) => r[col] > a && r[col] < b).map((r) => r[col].toFixed(3))).size;
const res = {
  rotulo, cpu: CPU, velocidade: VEL, rolagem_s: +duracao.toFixed(1), chegou_ao_fim: yFinal >= fim - 900,
  fps_mediano: +(1000 / med).toFixed(1), quadro_ms: { mediano: +med.toFixed(1), p95: +p95.toFixed(1), pior: +max.toFixed(1) },
  quadros_por_efeito: {
    "mergulho 1": janela(1, 0.12, 0.29), "continência": janela(1, 0.27, 0.45), "mergulho 2": janela(1, 0.42, 0.59),
    "aceno": janela(1, 0.57, 0.74), "recuo": janela(1, 0.71, 0.84), "computador": janela(1, 0.84, 0.94),
    "trilhas no celular": janela(2, 0.04, 0.46),
  },
};
fs.mkdirSync("perf", { recursive: true });
fs.writeFileSync(`perf/${rotulo}.json`, JSON.stringify(res, null, 2));
console.log(JSON.stringify(res));
await browser.close();
