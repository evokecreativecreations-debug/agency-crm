// Cache only public offline assets. CRM pages, API responses and auth data
// always use the network and are never stored in this service worker's cache.
const CACHE_PREFIX = "agency-crm-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const OFFLINE_URL = "/offline.html";
const ASSETS = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(OFFLINE_URL)) || new Response("You are offline. Reconnect to use the CRM.", {
        status: 503, headers: { "Content-Type": "text/plain" },
      })
    ));
  } else if (ASSETS.includes(new URL(request.url).pathname)) {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(request)) || Response.error()
    ));
  }
});
