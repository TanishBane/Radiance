const CACHE_NAME = 'tanix-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ) /* fixed: was missing closing paren on Promise.all */
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => { /* fixed: was .then cached => { */
      const fetchPromise = fetch(e.request).then(response => { /* fixed: was "fetch Promise" with a space */
        const clone = response.clone();
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
      return cached || fetchPromise; /* fixed: was "fetch Promise" */
    }).catch(() => caches.match('/index.html'))
  );
});
