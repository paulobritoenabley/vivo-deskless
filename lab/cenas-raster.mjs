// Gera as versões em imagem dos cenários (assets/cenas/*.webp), a partir do
// mesmo desenho de cenas.js. O palco continua em SVG vivo (os braços mexem);
// as letras gigantes e as miniaturas do celular usam imagem, que o celular
// decodifica uma vez e só compõe, em vez de redesenhar centenas de formas.
// Precisa do servidor local na porta 4500 e do ffmpeg.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");

const dir = path.resolve("../assets/cenas");
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const trabalhos = [
  // inteira: fundo das letras gigantes (P9)
  { sufixo: "", w: 1600, h: 1000, dpr: 1.25, opcoes: { inteira: true, acenando: true }, q: 78 },
  // recorte na pessoa: miniaturas das trilhas no celular
  { sufixo: "-mini", w: 480, h: 300, dpr: 1, opcoes: { acenando: true }, q: 82 },
];
for (const nome of ["estoque", "posto", "loja"]) {
  for (const t of trabalhos) {
    const page = await browser.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: t.dpr });
    await page.goto("http://localhost:4500/lab/teste-cenas.html");
    await page.evaluate(([nome, op]) => {
      document.body.innerHTML = Cenas.plana(nome, "x", op);
      document.body.style.cssText = "margin:0;display:block";
      const s = document.querySelector("svg");
      s.style.cssText = "display:block;width:100vw;height:100vh";
    }, [nome, t.opcoes]);
    await page.waitForTimeout(200);
    const png = path.join(dir, `${nome}${t.sufixo}.png`);
    await page.screenshot({ path: png });
    const webp = png.replace(/\.png$/, ".webp");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", String(t.q), webp]);
    fs.unlinkSync(png);
    console.log(path.basename(webp), Math.round(fs.statSync(webp).size / 1024) + " KB");
    await page.close();
  }
}
await browser.close();
