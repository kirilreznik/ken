// Service worker for the name swiper at /names (FR-W28). Hand-written, no build step.
// Registered from the names layout in production builds only, scope "/names"
// (served with Service-Worker-Allowed: /names, see next.config.ts).
//
// Strategies:
// - precache on install: the app shell pages, the hashed data files listed in
//   /names/data/manifest.json, the background photos, the Heebo fonts and the icons
// - cache-first: /_next/static/*, /_next/image, /landing/*, /names/data/* (hashed),
//   /names/icons/*, /names/brand/*
// - network-first with cache fallback: /names* page navigations, /names/data/manifest.json
// - never cached: /api/*, /names/auth/callback, other origins (Supabase), non-GET requests
//
// Bump VERSION when this file's caching rules change; activate deletes every
// cache that doesn't belong to the current version.

const VERSION = "v1";
const PREFIX = "nest-names-";
const SHELL_CACHE = `${PREFIX}shell-${VERSION}`;
const STATIC_CACHE = `${PREFIX}static-${VERSION}`;
const CURRENT = [SHELL_CACHE, STATIC_CACHE];

const SHELL_PAGES = ["/names", "/names/welcome", "/names/lists", "/names/intro"];
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

async function dataFiles() {
  const res = await fetch(DATA_MANIFEST, { cache: "no-store" });
  if (!res.ok) throw new Error(`data manifest ${res.status}`);
  const manifest = await res.clone().json();
  const shell = await caches.open(SHELL_CACHE);
  await shell.put(DATA_MANIFEST, res);
  return [manifest.names, manifest.content]
    .filter((file) => typeof file === "string" && file)
    .map((file) => `/names/data/${file}`);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      const statics = await caches.open(STATIC_CACHE);
      await Promise.all([
        shell.addAll(SHELL_PAGES.map((url) => new Request(url, { cache: "reload" }))),
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

async function networkFirst(request, key) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(request);
    // Only keep real pages: a redirect (e.g. a guard) or an error page would be
    // served offline in place of the screen.
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key, { ignoreVary: true });
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
    event.respondWith(networkFirst(request, path));
    return;
  }
  if (path === DATA_MANIFEST) {
    event.respondWith(networkFirst(request, DATA_MANIFEST));
    return;
  }
  if (CACHE_FIRST.some((re) => re.test(path))) event.respondWith(cacheFirst(request));
});
