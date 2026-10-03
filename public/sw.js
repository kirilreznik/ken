/* קן · service worker — app shell + static assets cache. Data is cached by the app (IndexedDB). */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "kan-" + V;
const ROUTES = ["/", "/share", "/timeline", "/tests", "/documents", "/tasks", "/questions", "/calendar", "/prep", "/birth", "/journal", "/plan", "/more", "/offline"];

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

// Android share target: stash what was shared, then open /share to process it.
const SHARE_CACHE = "kan-share";
async function stashShare(req) {
  const fd = await req.formData();
  const c = await caches.open(SHARE_CACHE);
  const meta = { title: fd.get("title") || "", text: fd.get("text") || "", url: fd.get("url") || "", at: Date.now() };
  await c.put("/__share/meta", new Response(JSON.stringify(meta), { headers: { "Content-Type": "application/json" } }));
  const f = fd.get("file");
  if (f && typeof f !== "string" && f.size) await c.put("/__share/file", new Response(f, { headers: { "Content-Type": f.type || "image/jpeg" } }));
  else await c.delete("/__share/file");
  return Response.redirect("/share?from=android", 303);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method === "POST" && new URL(req.url).pathname === "/share-target") { e.respondWith(stashShare(req)); return; }
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

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

// ───────────── Push notifications ─────────────
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "קן", {
    body: d.body || "",
    tag: d.tag,
    data: { url: d.url || "/" },
    dir: "rtl",
    lang: "he",
    icon: "/pwa-icon/192",
    badge: "/pwa-icon/96",
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.startsWith(self.location.origin) && "focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
