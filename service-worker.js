/* Bump this version whenever you change app files or add photos,
   so her phone picks up the new content. */
const CACHE = "rose-v9";

const SHELL = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "content.js",
  "photos.js",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Network-first for the editable data files, so changes show up.
  if (path.endsWith("content.js") || path.endsWith("photos.js")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Photos: serve from cache if seen before, otherwise fetch and remember,
  // so days she's already opened keep working offline (without precaching all).
  if (path.includes("/photos/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
            return res;
          })
      )
    );
    return;
  }

  // App shell: cache-first.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
