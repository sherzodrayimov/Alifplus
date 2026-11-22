const CACHE_NAME = 'alifplus-v20261122j';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/alifbo.html',
  '/konverter.html',
  '/hujjatlar.html',
  '/mashq.html',
  '/ilovalar.html',
  '/ishonch.html',
  '/icon.png',
  '/manifest.webmanifest',
  '/core/alif-core.js',
  '/web/converter.css?v=20261122j',
  '/web/scroll-fx.css?v=20261122j',
  '/web/theme-variants.css?v=20261122j',
  '/web/nav-drawer.js?v=20261122j',
  '/web/telegram-compat.js?v=20261122j'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // HTML sahifalar uchun Network-First (har doim yangi versiya, oflaynda kesh)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          return resp;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Statik resurslar uchun Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const netFetch = fetch(event.request)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || netFetch;
    })
  );
});
