const CACHE_NAME = "goeventify-cache-v4";

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
  if (!event.request.url.startsWith("http")) return;
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isDynamicApiPath =
    requestUrl.pathname.startsWith("/api") ||
    /^\/(User|Vendor|Service|Subservice|Booking|bookings|bookings-v2|admin|notification|otp|reviews|shift-availability|dashboard|manual-reservations|subscription|contact|test)(\/|$)/.test(
      requestUrl.pathname
    );

  // Never cache API/dynamic calls or any cross-origin requests.
  // This avoids stale dashboard data after create/update operations.
  if (!isSameOrigin || isDynamicApiPath || event.request.url.includes("onrender.com")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          if (event.request.method === "GET") {
            const clone = response.clone();
            event.waitUntil(
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clone))
                .catch(() => {})
            );
          }

          return response;
        })
      );
    })
  );
});
