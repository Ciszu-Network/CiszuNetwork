/* CISZU NETWORK — PWA Service Worker (canónico)
 * Fase PWA (ago 2026). Copiado a public/pwa/sw.js de cada website
 * por scripts/sync-pwa-assets.js. Estrategia:
 *   - precache del shell + iconos
 *   - navegación: network-first con fallback offline
 *   - estáticos CDN/_next/iconos: stale-while-revalidate
 *   - /api/ y POST/PUT/DELETE: solo red
 */
const VERSION = '1.0.0';
const CACHE = `ciszu-pwa-${VERSION}`;
const PRECACHE = ['/', '/pwa/icon-192.png', '/pwa/icon-512.png', '/pwa/icon-maskable-512.png'];
const SWR_PREFIXES = ['/_next/static', '/pwa/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navegación: network-first con fallback al shell cacheado
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match('/');
          if (shell) return shell;
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // Estáticos (JS/CSS con hash) e iconos PWA: stale-first con revalidación de fondo
  if (SWR_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        const refresh = fetch(request)
          .then((res) => {
            if (res && res.ok) {
              cache.put(request, res.clone());
            }
            return res;
          })
          .catch(() => hit);
        return hit || refresh;
      })()
    );
  }
});