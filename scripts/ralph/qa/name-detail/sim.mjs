// iOS Simulator helper for the name detail run (PRD §10, notes in SIMULATOR.md).
//
//   import { boot, open, screenshot, tap, drag, type, back } from "./sim.mjs";
//   await open("http://localhost:3000/names/welcome");
//   await tap(201, 745);              // device points (screenshot px / 3)
//   await drag(300, 400, 100, 400);   // 200 pt to the left
//   await screenshot("us0xx-sim-after");
//
// CLI: node sim.mjs boot [device] | open <url> | shot <name> | tap <x> <y>
//      | drag <x1> <y1> <x2> <y2> [ms] | type <text> | back [--swipe] | geometry
//      | locate <path> <selector> [user] | serve-calib [port]
//
// Points are converted to Mac screen points from the device screen's rect (the Simulator
// window's first AXGroup, read with osascript before every gesture, so a moved or resized
// window still maps right). Gestures use cliclick dd:/dm:/du: (`m:` never reaches the app as a
// touch move). Never type a secret through the CLI: import type() and pass a variable.
// Screenshots go to ./shots/ unless QA_SHOTS_DIR names another folder (relative to the cwd).
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SHOTS = process.env.QA_SHOTS_DIR
  ? `${resolve(process.env.QA_SHOTS_DIR)}/`
  : fileURLToPath(new URL("./shots/", import.meta.url));
export const DEFAULT_DEVICE = "iPhone 17 Pro";

// Device screen size in points; screenshot() refreshes it from the PNG (pixels / 3).
let screenPt = { w: 402, h: 874 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" }).trim();
const osa = (script) => run("osascript", ["-e", script]);

function bootedDevice() {
  const out = run("xcrun", ["simctl", "list", "devices", "booted"]);
  const m = out.match(/^\s+(.+?) \(([0-9A-F-]{36})\) \(Booted\)/m);
  return m ? { name: m[1], udid: m[2] } : null;
}

/** Boots `device` (default iPhone 17 Pro) unless something is booted, and opens Simulator. */
export async function boot(device = DEFAULT_DEVICE) {
  if (!bootedDevice()) {
    run("xcrun", ["simctl", "boot", device]);
    run("xcrun", ["simctl", "bootstatus", device]);
  }
  run("open", ["-a", "Simulator"]);
  await sleep(1500);
  return bootedDevice();
}

/** Opens a URL in Mobile Safari on the booted device. */
export async function open(url, waitMs = 2500) {
  run("xcrun", ["simctl", "openurl", "booted", url]);
  await sleep(waitMs);
}

/** Saves SHOTS/<name>.png and returns its path. */
export async function screenshot(name) {
  mkdirSync(SHOTS, { recursive: true });
  const file = `${SHOTS}${basename(name).replace(/\.png$/, "")}.png`;
  execFileSync("xcrun", ["simctl", "io", "booted", "screenshot", file], { stdio: "ignore" });
  const png = readFileSync(file);
  screenPt = { w: Math.round(png.readUInt32BE(16) / 3), h: Math.round(png.readUInt32BE(20) / 3) };
  return file;
}

/** The device screen's rect on the Mac screen and the point scale. */
export function geometry() {
  const raw = osa(
    'tell application "System Events" to tell process "Simulator" to get {position, size} of group 1 of window 1',
  );
  const [x, y, w, h] = raw.split(",").map((n) => Number(n.trim()));
  return { x, y, w, h, scale: w / screenPt.w, screenPt: { ...screenPt } };
}

function toMac(px, py, g = geometry()) {
  return [Math.round(g.x + px * g.scale), Math.round(g.y + py * g.scale)];
}

function activate() {
  osa('tell application "Simulator" to activate');
}

/** Taps device point (x, y): down, 60 ms, up (one-shot `c:` was unreliable before). */
export async function tap(x, y) {
  activate();
  await sleep(250);
  const [mx, my] = toMac(x, y);
  run("cliclick", [`dd:${mx},${my}`, "w:60", `du:${mx},${my}`]);
  await sleep(400);
}

/**
 * Drags from (x1, y1) to (x2, y2) in device points over about `ms`, with 12+ drag-moves.
 * A 50 ms hold before the first move makes Safari start a pan, not a tap.
 */
export async function drag(x1, y1, x2, y2, ms = 500) {
  activate();
  await sleep(250);
  const g = geometry();
  const [ax, ay] = toMac(x1, y1, g);
  const steps = Math.max(12, Math.round(ms / 30));
  const wait = Math.max(10, Math.round(ms / steps));
  const args = [`dd:${ax},${ay}`, "w:50"];
  for (let i = 1; i <= steps; i++) {
    const [mx, my] = toMac(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, g);
    args.push(`dm:${mx},${my}`, `w:${wait}`);
  }
  const [bx, by] = toMac(x2, y2, g);
  args.push(`du:${bx},${by}`);
  run("cliclick", args);
  await sleep(500);
}

/** Types ASCII text into the focused field (tap the field first). */
export async function type(text) {
  activate();
  await sleep(250);
  execFileSync("cliclick", [`t:${text}`], { stdio: "ignore" });
  await sleep(300);
}

/**
 * Goes back one page by tapping Safari's toolbar back button (iOS 26 compact bar, bottom left;
 * the keyboard bar must be closed). `{ swipe: true }` tries the left-edge back gesture instead,
 * which cliclick did NOT trigger on this Mac (SIMULATOR.md).
 */
export async function back({ swipe = false } = {}) {
  if (swipe) await drag(0.5, screenPt.h / 2, screenPt.w * 0.8, screenPt.h / 2, 250);
  else await tap(57, screenPt.h - 59);
  await sleep(600);
}

// Mobile Safari on iPhone 17 Pro (iOS 26, compact tab bar, page not scrolled): the page viewport
// is 402x714 CSS px and starts 63 pt below the top of the screen (measured with calib.html).
export const SAFARI = { viewport: { width: 402, height: 714 }, top: 63 };

/** Page (CSS px) to device points, for a page in Mobile Safari that isn't scrolled. */
export const fromPage = (x, y) => [x, y + SAFARI.top];

/**
 * Finds `selector` on `path` in Playwright WebKit (iPhone 15 resized to Safari's viewport, same
 * user) and returns the device point of its center plus its rect, ready for tap()/drag().
 */
export async function locate(path, selector, { user = 1, port = 3000 } = {}) {
  const { openMobile } = await import("./mobile.mjs");
  const { browser, page } = await openMobile({ browser: "webkit", user, port });
  try {
    await page.setViewportSize(SAFARI.viewport);
    await page.goto(path);
    const el = page.locator(selector).first();
    await el.waitFor();
    const r = await el.boundingBox();
    const [x, y] = fromPage(r.x + r.width / 2, r.y + r.height / 2);
    return { x: Math.round(x), y: Math.round(y), rect: r };
  } finally {
    await browser.close();
  }
}

/** Serves calib.html on `port` (default 3199) so the Simulator can open it. */
export function serveCalib(port = 3199) {
  const html = readFileSync(new URL("./calib.html", import.meta.url));
  const server = createServer((_, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(html);
  });
  server.listen(port);
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...a] = process.argv.slice(2);
  const n = a.map(Number);
  const cmds = {
    boot: () => boot(a[0]),
    open: () => open(a[0]),
    shot: () => screenshot(a[0] ?? "sim"),
    tap: () => tap(n[0], n[1]),
    drag: () => drag(n[0], n[1], n[2], n[3], a[4] ? n[4] : undefined),
    type: () => type(a.join(" ")),
    back: () => back({ swipe: a[0] === "--swipe" }),
    geometry: () => geometry(),
    locate: () => locate(a[0], a[1], { user: a[2] ? n[2] : 1 }),
    "serve-calib": () => {
      const port = a[0] ? n[0] : 3199;
      serveCalib(port);
      return `calib on http://localhost:${port} (Ctrl-C to stop)`;
    },
  };
  if (!cmds[cmd]) {
    console.error("usage: node sim.mjs boot|open|shot|tap|drag|type|back|geometry|serve-calib …");
    process.exit(2);
  }
  const out = await cmds[cmd]();
  if (out !== undefined) console.log(typeof out === "string" ? out : JSON.stringify(out));
}
