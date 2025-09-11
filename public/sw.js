/* Lightweight service worker for Prospecting! Tools
 * - Caches core shell & localized manifests for offline install
 * - Avoids aggressive runtime caching of dynamic data to prevent stale content
 */

// Bump version when changing CORE_ASSETS to ensure clients fetch fresh cache
const SW_VERSION = 'v1';
const CORE_CACHE = `core-${SW_VERSION}`;
const ASSET_CACHE = `assets-${SW_VERSION}`; // hashed /assets/* files (Vite output)
const CORE_ASSETS = [
  '/',
  '/offline.html',
  // Manifests (default + locale variants)
  '/manifest.webmanifest',
  '/manifest-pl.webmanifest',
  '/manifest-id.webmanifest',
  '/manifest-pt.webmanifest',
  // Icons & images required for install / sharing
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![CORE_CACHE, ASSET_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for manifest & static icons
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  const isHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const isManifest = url.pathname.endsWith('.webmanifest');
  const isIcon = /favicon|apple-touch-icon|og-image/.test(url.pathname);
  const isBuildAsset = url.pathname.startsWith('/assets/') && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'));

  if (isHtml) {
    event.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CORE_CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  if (isBuildAsset) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(r => {
        const copy = r.clone();
        caches.open(ASSET_CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => cached))
    );
    return;
  }

  if (isManifest || isIcon) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CORE_CACHE).then(c => c.put(req, copy));
        return r;
      }))
    );
  }
});
