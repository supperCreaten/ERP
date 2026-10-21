// Service Worker：静态资源缓存，提升重复访问速度
const STATIC_CACHE = "erp-static-v2";
const DYNAMIC_CACHE = "erp-dynamic-v2";

const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

function cachePut(request, response) {
  if (!response || response.status !== 200 || response.type !== "basic") {
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
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }
    return fetch(request).then((response) => {
      cachePut(request, response);
      return response;
    });
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const accept = event.request.headers.get("accept") ?? "";
  const isHtml = event.request.mode === "navigate" || accept.includes("text/html");
  const isHashedAsset =
    url.pathname.includes("/assets/") &&
    /\.[a-f0-9]{8,}\.(js|css|woff2?|png|jpe?g|svg|webp|gif)$/i.test(url.pathname);

  // HTML：network-first，避免发版后命中旧壳
  if (isHtml) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // 带 hash 的构建产物：cache-first，加速二次打开
  if (isHashedAsset) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(() => {
      if (isHtml) {
        return caches.match("/index.html");
      }
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
