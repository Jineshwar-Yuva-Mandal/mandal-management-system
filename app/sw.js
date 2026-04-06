/* Service Worker for Samanvay PWA */
const CACHE_NAME = 'samanvay-v1';
const PRECACHE_URLS = [
  '/launchpage.html',
  '/logo.png',
  '/manifest.webmanifest'
];

/* Install — precache shell assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* Activate — purge old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch — network-first for API/OData, cache-first for static assets */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always go to network for API / OData / auth requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/odata/') ||
    url.pathname.startsWith('/auth/') ||
    event.request.method !== 'GET'
  ) {
    return; // let the browser handle it normally
  }

  // Cache-first for static assets (UI5 resources, app files)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache hit but also update cache in background
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {}); // ignore network errors for background update
        return cached;
      }
      // No cache hit — fetch from network and cache the response
      return fetch(event.request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
