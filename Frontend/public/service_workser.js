const CACHE_NAME = "goeventify-cache-v2";

const OFFLINE_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/pwa-192.png",
  "/pwa-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip caching for API requests and external resources
  if (
    event.request.url.includes("/api") ||
    event.request.url.includes("onrender.com") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // For navigation requests (page loads), try network first, fall back to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // For other GET requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache GET requests (method check done earlier but being explicit)
            if (event.request.method === "GET") {
              cache.put(event.request, clone);
            }
          });
          return response;
        })
      );
    })
  );
});
