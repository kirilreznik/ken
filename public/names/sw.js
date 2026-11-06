// Service worker for the name swiper at /names (FR-W28). Hand-written, no build step.
// Registered from the names layout in production builds only, scope "/names"
// (served with Service-Worker-Allowed: /names, see next.config.ts).
//
// Strategies:
// - precache on install: the app shell pages and every /_next/static file their HTML
//   references (so a shell page never opened online still runs offline), the offline
//   fallback page, the hashed data files listed in
//   /names/data/manifest.json (names, content, details), the background photos, the Heebo fonts and the icons
// - cache-first: /_next/static/*, /_next/image, /landing/*, /names/data/* (hashed),
//   /names/icons/*, /names/brand/*
// - network-first with cache fallback: /names* page navigations (an uncached page falls
//   back to /names/offline), /names/data/manifest.json
// - never cached: /api/*, /names/auth/callback, other origins (Supabase), non-GET requests
//
// Bump VERSION when this file's caching rules change; activate deletes every
// cache that doesn't belong to the current version.

const VERSION = "v3";
const PREFIX = "nest-names-";
const SHELL_CACHE = `${PREFIX}shell-${VERSION}`;
const STATIC_CACHE = `${PREFIX}static-${VERSION}`;
const CURRENT = [SHELL_CACHE, STATIC_CACHE];

const OFFLINE_PAGE = "/names/offline";
const SHELL_PAGES = ["/names", "/names/welcome", "/names/lists", "/names/intro", "/names/sign-in/email", OFFLINE_PAGE];
// Script, style and font URLs in a page's HTML (also inside the escaped RSC payload).
const STATIC_REF = /\/_next\/static\/[^"'\s\\)]+/g;
const DATA_MANIFEST = "/names/data/manifest.json";
const STATIC_ASSETS = [
  "/landing/names-fabric.webp",
  "/landing/names-notebook.webp",
  "/landing/names-nursery.webp",
  "/landing/heebo-hebrew.woff2",
  "/landing/heebo-latin.woff2",
  "/names/icons/icon-192.png",
  "/names/icons/icon-512.png",
  "/names/icons/maskable-512.png",
  "/names/icons/apple-touch-icon-180.png",
  "/names/brand/favicon.svg",
  "/names/brand/nest-mark.svg",
  "/names/brand/google-g.svg",
];

const NEVER = [/^\/api\//, /^\/names\/auth\/callback(\/|$)/, /^\/names\/sw\.js$/];
const CACHE_FIRST = [
  /^\/_next\/static\//,
  /^\/_next\/image$/,
  /^\/landing\//,
  /^\/names\/data\//,
  /^\/names\/icons\//,
  /^\/names\/brand\//,
];

/** Caches the shell pages and the /_next/static files they load. */
async function precacheShell(shell, statics) {
  const refs = new Set();
  await Promise.all(
    SHELL_PAGES.map(async (url) => {
      const res = await fetch(new Request(url, { cache: "reload" }));
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      for (const ref of (await res.clone().text()).match(STATIC_REF) ?? []) refs.add(ref);
      await shell.put(url, res);
    }),
  );
  await statics.addAll([...refs]);
}

async function dataFiles() {
  const res = await fetch(DATA_MANIFEST, { cache: "no-store" });
  if (!res.ok) throw new Error(`data manifest ${res.status}`);
  const manifest = await res.clone().json();
  const shell = await caches.open(SHELL_CACHE);
  await shell.put(DATA_MANIFEST, res);
  return [manifest.names, manifest.content, manifest.details]
    .filter((file) => typeof file === "string" && file)
    .map((file) => `/names/data/${file}`);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      const statics = await caches.open(STATIC_CACHE);
      await Promise.all([
        precacheShell(shell, statics),
        statics.addAll(STATIC_ASSETS),
        dataFiles().then((files) => statics.addAll(files)),
      ]);
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && !CURRENT.includes(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

// The page asks a waiting worker to take over ("עדכון זמין" → "רענון").
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, key, fallback) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(request);
    // Only keep real pages: a redirect (e.g. a guard) or an error page would be
    // served offline in place of the screen.
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit =
      (await cache.match(key, { ignoreVary: true })) ??
      (fallback ? await cache.match(fallback, { ignoreVary: true }) : undefined);
    if (hit) return hit;
    throw err;
  }
}

function isNamesPath(pathname) {
  return pathname === "/names" || pathname.startsWith("/names/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  if (NEVER.some((re) => re.test(path))) return;

  if (request.mode === "navigate") {
    if (!isNamesPath(path)) return;
    // Pages are keyed by path: query strings (?sheet=, ?tab=) render the same shell.
    event.respondWith(networkFirst(request, path, OFFLINE_PAGE));
    return;
  }
  if (path === DATA_MANIFEST) {
    event.respondWith(networkFirst(request, DATA_MANIFEST));
    return;
  }
  if (CACHE_FIRST.some((re) => re.test(path))) event.respondWith(cacheFirst(request));
});
