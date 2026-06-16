// Visual-capture helper (visual half of the hybrid /goal check).
// Boots nothing itself — assumes `npm run dev` is already running on :3000.
// Captures the live app to .loop/current.png so the loop can visually
// compare it against reference.png each iteration.
//
//   usage:  npm run shot            (full page, default viewport)
//           npm run shot -- 1440 900
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const [, , wArg, hArg] = process.argv;
const width = Number(wArg) || 1280;
const height = Number(hArg) || 800;
const url = process.env.APP_URL || "http://localhost:3000";

await mkdir(".loop", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: ".loop/current.png", fullPage: true });
await browser.close();

console.log(`captured .loop/current.png @ ${width}x${height} from ${url}`);
