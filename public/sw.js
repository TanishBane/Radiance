// Radiance Privacy-Safe Service Worker
// Version: 1.0.0
const CACHE_VERSION = 'radiance-v1';
const PRECACHE_SHELL = 'radiance-shell-v1';
const RUNTIME_CACHE = 'radiance-runtime-v1';

// Static App Shell assets precached on install
const PRECACHE_MANIFEST = [
  '/',
  '/chat',
  '/offline',
  '/manifest.webmanifest',
  '/icon.svg',
  '/brand/radiance-symbol.svg',
  '/brand/radiance-wordmark.svg',
  '/brand/radiance-lockup.svg',
];

// Sensitive or dynamic routes that MUST NEVER BE CACHED
const NON_CACHEABLE_PATTERNS = [
  /\/api\//i,
  /\/auth\//i,
  /supabase\.co/i,
  /analytics/i,
  /speed-insights/i,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_SHELL).then((cache) => {
      return cache.addAll(PRECACHE_MANIFEST).catch((err) => {
        console.warn('[SW] Precache partial fallback:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = [PRECACHE_SHELL, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. STRICT PRIVACY GUARD: Bypass all non-GET, API routes, and auth requests
  if (
    request.method !== 'GET' ||
    request.headers.has('authorization') ||
    NON_CACHEABLE_PATTERNS.some((pattern) => pattern.test(url.pathname) || pattern.test(url.hostname))
  ) {
    if (url.pathname.startsWith('/api/chat') || url.pathname.startsWith('/api/image')) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({
              error: 'Offline Mode: AI inference requires an active internet connection. Your local conversation history remains safe.',
              code: 'OFFLINE_DISCONNECTED',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );
      return;
    }
    // Normal pass-through for other non-cacheable requests
    return;
  }

  // 2. Next.js Immutable Static Chunks: Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // 3. Static Media, Fonts, and Brand Assets: Stale-While-Revalidate
  if (
    url.pathname.startsWith('/brand/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. HTML Navigation Requests (App Shell): Network-First with Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(PRECACHE_SHELL).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(request);
          if (cachedNavigate) return cachedNavigate;
          // Fallback to cached /chat workspace or /offline page
          const cachedChat = await caches.match('/chat');
          if (cachedChat) return cachedChat;
          const cachedOffline = await caches.match('/offline');
          if (cachedOffline) return cachedOffline;
          return new Response('<h1>Radiance Offline</h1><p>Please reconnect to the internet.</p>', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }
});
