// Rastreia a rolagem inteira (gesto de roda, CPU 6x) e abre as tarefas mais
// longas da thread principal: o que rodou dentro de cada uma.
import { createRequire } from "node:module";
import path from "node:path";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await page.goto(`http://localhost:${process.argv[2] || 4500}/index.html?direto`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const fim = await page.evaluate(() => { const a = ScrollCraft.instances[0].acts.find((x) => x.el.id === "virada"); return a.top + a.height; });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
await page.evaluate(() => { window.__marca = []; (function f(t) { window.__marca.push([t, scrollY]); requestAnimationFrame(f); })(performance.now()); });
await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink", "cc", "gpu"] });
for (let feito = 0; feito < fim; feito += 1200) {
  await cdp.send("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -Math.min(1200, fim - feito), speed: 1400, gestureSourceType: "mouse", preventFling: true });
}
const tr = JSON.parse((await browser.stopTracing()).toString()).traceEvents;
const marcos = await page.evaluate(() => {
  const a = ScrollCraft.instances[0].acts; const o = {};
  a.forEach((x) => { if (x.el.id) o[x.el.id] = [Math.round(x.top), Math.round(x.top + x.height)]; });
  return o;
});
// Thread principal do renderizador: a que tem eventos "FireAnimationFrame".
const tid = (tr.find((e) => e.name === "FireAnimationFrame") || {}).tid;
const doMain = tr.filter((e) => e.tid === tid && e.ph === "X" && e.dur);
const longas = doMain.filter((e) => e.name === "RunTask" && e.dur > 250000).sort((a, b) => b.dur - a.dur).slice(0, 6);
const nomes = new Set(["FireAnimationFrame", "FunctionCall", "UpdateLayoutTree", "Layout", "PrePaint", "Paint", "Layerize", "Commit",
  "Decode Image", "ImageDecodeTask", "EventDispatch", "HitTest", "ScrollLayer", "UpdateLayer", "PaintImage", "RasterTask", "IntersectionObserverController::computeIntersections", "ParseAuthorStyleSheet", "TimerFire"]);
console.log(JSON.stringify(marcos));
for (const L of longas) {
  const dentro = {};
  doMain.forEach((e) => { if (e !== L && e.ts >= L.ts && e.ts + e.dur <= L.ts + L.dur && nomes.has(e.name)) dentro[e.name] = (dentro[e.name] || 0) + e.dur / 1000; });
  const ex = doMain.find((e) => e.name === "UpdateLayoutTree" && e.ts >= L.ts && e.ts <= L.ts + L.dur && e.args && e.args.elementCount);
  const fn = doMain.filter((e) => e.name === "FunctionCall" && e.ts >= L.ts && e.ts <= L.ts + L.dur && e.args && e.args.data)
    .map((e) => (e.args.data.functionName || "?") + "@" + (e.args.data.url || "").split("/").pop() + ":" + e.args.data.lineNumber + " " + Math.round(e.dur / 1000) + "ms").slice(0, 3);
  console.log("\ntarefa " + Math.round(L.dur / 1000) + " ms", ex ? "(estilo: " + ex.args.elementCount + " elementos)" : "",
    "\n  " + Object.entries(dentro).sort((a, b) => b[1] - a[1]).map(([n, d]) => n + " " + Math.round(d)).join(" · "), fn.length ? "\n  js: " + fn.join(" | ") : "");
}
await browser.close();
