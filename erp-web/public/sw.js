// Service Worker for caching and performance optimization
const STATIC_CACHE = 'finance-static-v1';
const DYNAMIC_CACHE = 'finance-dynamic-v1';

// 仅缓存生产环境存在的入口资源（勿写 /src/* 开发路径，否则 install 会失败）
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
          return caches.delete(cacheName);
        }
      }),
    )),
  );
  self.clients.claim();
});

function cachePut(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  const clone = response.clone();
  caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      cachePut(request, response);
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((response) => {
          cachePut(request, response);
          return response;
        });
    });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const accept = event.request.headers.get('accept') ?? '';
  const isHtml = event.request.mode === 'navigate' || accept.includes('text/html');
  const isHashedJs = url.pathname.startsWith('/assets/js/') && url.pathname.endsWith('.js');

  // HTML 与带 hash 的 JS chunk：network-first，避免发版后命中旧缓存/404
  if (isHtml || isHashedJs) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(() => {
      if (isHtml) {
        return caches.match('/index.html');
      }
    }),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
