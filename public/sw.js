// Minimal service worker — Phase 0 scope only.
// This caches the app "shell" so it opens instantly and doesn't show a
// browser error if the connection briefly drops. It does NOT cache or
// sync your actual CRM data offline — that's a future improvement, not
// built yet, and would need careful planning around data conflicts.

const CACHE_NAME = "agency-crm-shell-v1";
const SHELL_ASSETS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first for everything — we always want fresh CRM data.
  // Falls back to cache only if the network request fails.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
