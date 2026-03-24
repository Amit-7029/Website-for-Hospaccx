const STATIC_CACHE = "hospaccx-static-v1";
const IMAGE_CACHE = "hospaccx-images-v1";
const STATIC_ASSET_PATTERN = /\.(?:js|css|woff2?|png|jpg|jpeg|webp|avif|svg|ico)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.destination === "image" || STATIC_ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function staleWhileRevalidate(request) {
  const cacheName = request.destination === "image" ? IMAGE_CACHE : STATIC_CACHE;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}
