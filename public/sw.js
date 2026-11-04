// The old Ken app is gone. Phones that installed it still run its service worker,
// which would keep serving the old cached pages. This replacement clears those
// caches, unregisters itself and reloads open tabs, so they get the current site.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
  })());
});
