// This is a basic service worker for caching assets.
const CACHE_NAME = 'online-menu-cache-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets here, e.g., fonts, images
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for caching; pass through others
  if (event.request.method !== 'GET') {
    return; // Let the browser handle non-GET normally
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((response) => {
        // Valid same-origin, successful response only
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
