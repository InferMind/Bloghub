// Service Worker for caching static assets only (avoid caching HTML/app shell)
const CACHE_NAME = 'bloghub-cache-v3';
const urlsToCache = [
  '/favicon.ico',
  '/placeholder.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => cacheName !== CACHE_NAME ? caches.delete(cacheName) : undefined)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and extension requests
  if (event.request.method !== 'GET' ||
      event.request.url.startsWith('chrome-extension') ||
      event.request.url.includes('extension') ||
      !(event.request.url.startsWith('http'))) {
    return;
  }

  const url = new URL(event.request.url);

  // Do NOT cache HTML/navigation requests to avoid stale app shell
  const acceptHeader = event.request.headers.get('accept') || '';
  const isHTMLRequest = acceptHeader.includes('text/html');
  if (isHTMLRequest) return; // let browser handle normally

  // Avoid caching Next.js build assets to prevent hydration mismatches
  if (url.pathname.startsWith('/_next')) return;

  // For API requests, network first, then cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For images and other static assets, cache first then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});