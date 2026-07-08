// cYcleBOSS offline service worker
// Caches every page (and the Google Fonts it uses) the first time it's visited,
// then serves from cache instantly — with a background refresh when online.
const CACHE = 'cycleboss-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Never intercept the workout videos picked from the phone (blob: URLs)
  if (req.url.startsWith('blob:')) return;

  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(resp => {
        // Cache successful responses, including opaque ones (Google Fonts)
        if (resp && (resp.ok || resp.type === 'opaque')) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
      // Serve cached copy immediately if we have one; refresh happens in background
      return cached || network;
    })
  );
});
