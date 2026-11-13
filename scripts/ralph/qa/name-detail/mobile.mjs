// Mobile browser helper for the name detail run (PRD §10).
//
//   import { openMobile, tap, drag, shot, axe } from "./mobile.mjs";
//   const { browser, page, network } = await openMobile({ browser: "webkit", user: 1 });
//
// CLI: node mobile.mjs <webkit|chromium> <path> <out-name> [--user N] [--port P]
//      [--reduced-motion] [--offline] [--dark]
//
// WebKit runs as an iPhone 15 and Chromium as a Pixel 7, both with touch, he-IL and
// Asia/Jerusalem. A signed-in user gets the storageState from ../names-pwa/.auth/ (written by
// login.mjs when missing). Never prints tokens, codes or emails.
//
// Screenshots go to ./shots/ unless QA_SHOTS_DIR names another folder (e.g. the polish run's
// scripts/ralph/qa/name-polish/shots), relative to the working directory.
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AxeBuilder } from "@axe-core/playwright";
import { chromium, devices, webkit } from "@playwright/test";
import { authFile, login, STORAGE_KEY } from "../names-pwa/login.mjs";

export const SHOTS = process.env.QA_SHOTS_DIR
  ? `${resolve(process.env.QA_SHOTS_DIR)}/`
  : fileURLToPath(new URL("./shots/", import.meta.url));

const ENGINES = { webkit, chromium };
const DEFAULT_DEVICE = { webkit: "iPhone 15", chromium: "Pixel 7" };

/**
 * Opens a mobile page. `user` 1|2|3 signs that QA user in (null: signed out). The intro and the
 * one-time prompts are marked seen so /names opens straight on the deck.
 * Returns { browser, context, page, network } where network collects {url, method, postData}.
 */
export async function openMobile({
  browser: engine = "webkit",
  device,
  user = 1,
  port = 3000,
  reducedMotion = false,
  offline = false,
  colorScheme = "light",
  skipIntro = true,
  serviceWorkers = "allow",
} = {}) {
  if (!ENGINES[engine]) throw new Error(`browser must be webkit or chromium, not ${engine}`);
  const name = device ?? DEFAULT_DEVICE[engine];
  if (!devices[name]) throw new Error(`unknown device ${name}`);
  let storageState;
  if (user) {
    storageState = authFile(user);
    if (!existsSync(storageState)) await login(String(user));
  }
  const browser = await ENGINES[engine].launch();
  const context = await browser.newContext({
    ...devices[name],
    hasTouch: true,
    isMobile: engine === "chromium" ? true : devices[name].isMobile,
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    colorScheme,
    storageState,
    serviceWorkers,
  });
  context.baseURL = `http://localhost:${port}`;
  if (skipIntro && user) {
    await context.addInitScript((key) => {
      try {
        const id = JSON.parse(localStorage.getItem(key) ?? "null")?.user?.id;
        if (!id) return;
        for (const pref of ["introSeen", "installHintDismissed", "invitePromptShown"]) {
          if (localStorage.getItem(`nest-names:${id}:${pref}`) === null) localStorage.setItem(`nest-names:${id}:${pref}`, "true");
        }
      } catch {}
    }, STORAGE_KEY);
  }
  // The dev server's "N" indicator sits over the undo button at the inline end of the action row.
  if (port === 3000) {
    await context.addInitScript(() => {
      const hide = () => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal{display:none!important}";
        document.head.append(style);
      };
      if (document.head) hide();
      else document.addEventListener("DOMContentLoaded", hide, { once: true });
    });
  }
  const network = [];
  context.on("request", (req) => network.push({ url: req.url(), method: req.method(), postData: req.postData() }));
  if (offline) await context.setOffline(true);
  const page = await context.newPage();
  const goto = page.goto.bind(page);
  // Relative paths go to the chosen port.
  page.goto = (url, opts) => goto(/^https?:/.test(url) ? url : `${context.baseURL}${url.startsWith("/") ? "" : "/"}${url}`, opts);
  return { browser, context, page, network };
}

async function center(target) {
  if (Array.isArray(target)) return { x: target[0], y: target[1] };
  if (typeof target?.x === "number" && typeof target?.y === "number" && !target.boundingBox) return target;
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("tap: target has no box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** A touch tap on a locator's center or on a point ({x, y} or [x, y]). */
export async function tap(page, target) {
  const { x, y } = await center(target);
  await page.touchscreen.tap(x, y);
}

/**
 * A touch drag on a locator: pointerdown at its center (or at `from`, a fraction {x, y} of its
 * box), `steps` (≥ 10) pointermoves over `ms`, then pointerup, all `pointerType: "touch"` and
 * `isPrimary: true`, dispatched on the element under the finger like a real touch. Synthetic
 * pointers aren't active, so setPointerCapture is told to ignore NotFoundError meanwhile.
 */
export async function drag(page, locator, { dx = 0, dy = 0, steps = 12, ms = 240, from } = {}) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("drag: target has no box");
  const x = box.x + box.width * (from?.x ?? 0.5);
  const y = box.y + box.height * (from?.y ?? 0.5);
  await page.evaluate(
    async ({ x, y, dx, dy, steps, ms }) => {
      const sleep = (t) => new Promise((r) => setTimeout(r, t));
      const target = document.elementFromPoint(x, y);
      if (!target) throw new Error("drag: nothing under the start point");
      const proto = Element.prototype;
      const capture = proto.setPointerCapture;
      const release = proto.releasePointerCapture;
      proto.setPointerCapture = function (id) {
        try {
          capture.call(this, id);
        } catch (e) {
          if (e?.name !== "NotFoundError") throw e;
        }
      };
      proto.releasePointerCapture = function (id) {
        try {
          release.call(this, id);
        } catch (e) {
          if (e?.name !== "NotFoundError") throw e;
        }
      };
      const pointerId = 9100 + Math.floor(Math.random() * 100);
      const send = (type, cx, cy, buttons) =>
        target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId,
            pointerType: "touch",
            isPrimary: true,
            clientX: cx,
            clientY: cy,
            button: type === "pointermove" ? -1 : 0,
            buttons,
            width: 20,
            height: 20,
            pressure: buttons ? 0.5 : 0,
          }),
        );
      try {
        send("pointerdown", x, y, 1);
        const n = Math.max(10, steps);
        for (let i = 1; i <= n; i++) {
          await sleep(ms / n);
          send("pointermove", x + (dx * i) / n, y + (dy * i) / n, 1);
        }
        await sleep(16);
        send("pointerup", x + dx, y + dy, 0);
      } finally {
        proto.setPointerCapture = capture;
        proto.releasePointerCapture = release;
      }
    },
    { x, y, dx, dy, steps, ms },
  );
}

/** Saves a viewport screenshot to SHOTS/<name>.png (or a path with a directory); returns the path. */
export async function shot(page, name, { fullPage = false } = {}) {
  const file = name.includes("/") ? resolve(name) : resolve(SHOTS, name.endsWith(".png") ? name : `${name}.png`);
  mkdirSync(dirname(file), { recursive: true });
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.screenshot({ path: file, fullPage });
  return file;
}

/** axe-core results for the page (or a selector with { include }). */
export async function axe(page, { include, disable } = {}) {
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  if (disable) builder = builder.disableRules(disable);
  return builder.analyze();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opts = { user: 1, port: 3000, reducedMotion: false, offline: false, colorScheme: "light" };
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--user") opts.user = args[++i] === "0" ? null : Number(args[i]);
    else if (a === "--port") opts.port = Number(args[++i]);
    else if (a === "--reduced-motion") opts.reducedMotion = true;
    else if (a === "--offline") opts.offline = true;
    else if (a === "--dark") opts.colorScheme = "dark";
    else rest.push(a);
  }
  const [engine, path, out] = rest;
  if (!ENGINES[engine] || !path || !out) {
    console.error("usage: node mobile.mjs <webkit|chromium> <path> <out-name> [--user N|0] [--port P] [--reduced-motion] [--offline] [--dark]");
    process.exit(2);
  }
  const { browser, page } = await openMobile({ ...opts, browser: engine, offline: false });
  try {
    await page.goto(path, { waitUntil: "networkidle" });
    if (opts.offline) {
      await page.context().setOffline(true);
      await page.reload({ waitUntil: "load" }).catch(() => {});
    }
    await page.waitForTimeout(400);
    const file = await shot(page, out);
    console.log(`saved ${basename(file)} (${engine}, ${DEFAULT_DEVICE[engine]}) from ${path}`);
  } catch (error) {
    console.error(`mobile.mjs failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
