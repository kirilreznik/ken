// node scripts/ralph/qa/names-pwa/shot.mjs <path> <out.png> [--state N] [--viewport WxH]
//   [--port P] [--reduced-motion] [--offline] [--bg fabric|notebook|nursery]
// Opens the page in Chromium (he-IL, Asia/Jerusalem, DPR 2) and saves a full-page screenshot.
// A relative <out.png> without a directory goes to shots/.
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { authFile } from "./login.mjs";

const SHOTS = fileURLToPath(new URL("./shots/", import.meta.url));

function parseArgs(argv) {
  const opts = { viewport: "390x844", port: "3000", reducedMotion: false, offline: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--state") opts.state = argv[++i];
    else if (arg === "--viewport") opts.viewport = argv[++i];
    else if (arg === "--port") opts.port = argv[++i];
    else if (arg === "--bg") opts.bg = argv[++i];
    else if (arg === "--reduced-motion") opts.reducedMotion = true;
    else if (arg === "--offline") opts.offline = true;
    else rest.push(arg);
  }
  [opts.path, opts.out] = rest;
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.path || !opts.out) {
  console.error("usage: node shot.mjs <path> <out.png> [--state N] [--viewport WxH] [--port P] [--reduced-motion] [--offline] [--bg name]");
  process.exit(2);
}
const [width, height] = opts.viewport.split("x").map(Number);
const url = /^https?:/.test(opts.path) ? opts.path : `http://localhost:${opts.port}${opts.path.startsWith("/") ? "" : "/"}${opts.path}`;
const out = opts.out.includes("/") ? resolve(opts.out) : resolve(SHOTS, opts.out);

let storageState;
if (opts.state) {
  storageState = authFile(opts.state);
  if (!existsSync(storageState)) {
    console.error(`no storageState for user ${opts.state}; run login.mjs ${opts.state} first`);
    process.exit(1);
  }
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
    reducedMotion: opts.reducedMotion ? "reduce" : "no-preference",
    storageState,
  });
  if (opts.bg) {
    // Background preference lives under nest-names:{userId}:background (PRD 3.2.8).
    await context.addInitScript((bg) => {
      try {
        const session = JSON.parse(localStorage.getItem("nest-names-auth") ?? "null");
        const id = session?.user?.id;
        if (id) localStorage.setItem(`nest-names:${id}:background`, JSON.stringify(bg));
      } catch {}
    }, opts.bg);
  }
  const page = await context.newPage();
  if (opts.offline) {
    // Load once online so a service worker can take over, then go offline and reload.
    await page.goto(url, { waitUntil: "networkidle" });
    await context.setOffline(true);
    await page.reload({ waitUntil: "load" }).catch(() => {});
  } else {
    await page.goto(url, { waitUntil: "networkidle" });
  }
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, fullPage: true });
  console.log(`saved ${basename(out)} (${width}x${height} @2x) from ${new URL(url).pathname}`);
} finally {
  await browser.close();
}
