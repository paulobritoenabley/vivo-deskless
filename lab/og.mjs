// Gera assets/og.jpg (1200x630), a imagem da prévia de compartilhamento.
// Precisa do servidor local na porta 4500 servindo a pasta landing-page.
import { createRequire } from "node:module";
import path from "node:path";
const { chromium } = createRequire(path.join(process.cwd(), "package.json"))("playwright-core");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto("http://localhost:4500/lab/og.html", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: path.resolve("../assets/og.jpg"), type: "jpeg", quality: 86 });
await browser.close();
