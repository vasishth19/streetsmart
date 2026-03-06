// StreetSmart Service Worker v1
// Enables offline mode + app-like caching

const CACHE_NAME    = 'streetsmart-v1';
const STATIC_ASSETS = [
  '/',
  '/map',
  '/dashboard',
  '/report',
  '/login',
  '/signup',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install: cache all static assets ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first with cache fallback ──────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external APIs (routing, geocoding)
  if (request.method !== 'GET') return;
  if (url.hostname.includes('osrm')       ||
      url.hostname.includes('nominatim')  ||
      url.hostname.includes('mapbox')     ||
      url.hostname.includes('openrouteservice')) return;

  // For API calls to our backend — network only
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return the cached home page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ── Background sync for reports submitted offline ─────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncOfflineReports());
  }
});

async function syncOfflineReports() {
  const cache = await caches.open('offline-reports');
  const keys  = await cache.keys();
  for (const key of keys) {
    try {
      const response = await cache.match(key);
      const data     = await response.json();
      await fetch('/api/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      await cache.delete(key);
      console.log('[SW] Synced offline report:', key.url);
    } catch (e) {
      console.warn('[SW] Failed to sync report:', e);
    }
  }
}

// ── Push notifications (future use) ──────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'StreetSmart', {
      body:    data.body ?? 'Safety alert in your area',
      icon:    '/icons/icon-192x192.png',
      badge:   '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url ?? '/map' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/map')
  );
});