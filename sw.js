// Service worker: makes the site installable and lets pages you've opened work offline.
// Network first, so updates show up right away when online; cached copy when offline.
const CACHE = 'navaratri-2026-v1';
const CORE = [
  '/index.html',
  '/puja/day.html',
  '/puja/bhajans.html',
  '/puja/data.js',
  '/puja/common.js',
  '/puja/reader.css',
  '/assets/favicon-32.png',
  '/assets/icon-192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Our own files plus the Tailwind and Google Fonts CDNs the pages need
  const cacheable = url.origin === location.origin ||
    ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!cacheable) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: url.origin === location.origin && url.pathname.endsWith('.html') }))
  );
});
