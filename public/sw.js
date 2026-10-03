/* קן · service worker — app shell + static assets cache. Data is cached by the app (IndexedDB). */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "kan-" + V;
const ROUTES = ["/", "/timeline", "/tests", "/documents", "/tasks", "/questions", "/more", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(ROUTES.map((r) => c.add(r).catch(() => null)))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("kan-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

const put = (req, res) => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations + RSC payloads: network first, cached copy when offline.
  if (req.mode === "navigate" || url.searchParams.has("_rsc") || req.headers.get("RSC")) {
    e.respondWith(
      fetch(req).then((res) => put(req, res)).catch(async () =>
        (await caches.match(req, { ignoreSearch: true })) ||
        (await caches.match(url.pathname, { ignoreSearch: true })) ||
        (req.mode === "navigate" ? (await caches.match("/offline")) : Response.error()),
      ),
    );
    return;
  }

  // Immutable build assets, fonts, icons: cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pwa-icon") || /\.(?:woff2?|png|svg|ico|webmanifest)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
  }
});
