/// <reference lib="webworker" />
/* Lightweight service worker for Prospecting! Tools
 * - Caches core shell & localized manifests for offline install
 * - Uses network-first runtime caching for HTML shell pages (cached for offline fallback)
 * - Avoids runtime caching of dynamic API/data responses to prevent stale content
 */

// Declaration of constant injected by Vite (define)
declare const __BUILD_HASH__: string;

// Bump version when changing CORE_ASSETS or build hash to ensure clients fetch fresh cache
const SW_VERSION: string = __BUILD_HASH__;
const CORE_CACHE = `core-${SW_VERSION}`;
const ASSET_CACHE = `assets-${SW_VERSION}`; // hashed /assets/* files (Vite output)
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/404.html',
  '/500.html',
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

// Typical assignment of self as ServiceWorkerGlobalScope for better intellisense
const swSelf = self as unknown as ServiceWorkerGlobalScope;

swSelf.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => swSelf.skipWaiting())
  );
});

swSelf.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => ![CORE_CACHE, ASSET_CACHE].includes(k)).map(k => caches.delete(k))
      ))
      .then(() => swSelf.clients.claim())
  );
});

// Network-first for HTML, cache-first for manifest & static icons
swSelf.addEventListener('fetch', (event: FetchEvent) => {
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
      fetch(req)
        .then(async r => {
          // 404: do not cache as shell; return generated /404.html (from cache or network)
          if (r.status === 404) {
            const notFound = await caches.match('/404.html') || await fetch('/404.html');
            return notFound;
          }
          const copy = r.clone();
          caches.open(CORE_CACHE).then(c => c.put(req, copy)).catch(()=>{});
          return r;
        })
        .catch(async () => {
          const cached = await caches.match('/offline.html');
          return cached ?? new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  if (isBuildAsset) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req)
          .then(r => {
            const copy = r.clone();
            caches.open(ASSET_CACHE).then(c => c.put(req, copy)).catch(()=>{});
            return r;
          })
          .catch(() => cached as Response | undefined || new Response('Asset unavailable', { status: 504 }));
      })
    );
    return;
  }

  if (isManifest || isIcon) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req)
          .then(r => {
            const copy = r.clone();
            caches.open(CORE_CACHE).then(c => c.put(req, copy)).catch(()=>{});
            return r;
          })
          .catch(() => cached as Response | undefined || new Response('Resource unavailable', { status: 504 }));
      })
    );
  }
});
