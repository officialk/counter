const version = "counter-4";

const assets = [
  "/counter/index.html",
  "/counter/favicon.ico",
  "/counter/manifest.json",
  "/counter/js/app.js",
  "/counter/css/app.css",
  "/counter/images/icons/icon-128x128.png",
  "/counter/images/icons/icon-144x144.png",
  "/counter/images/icons/icon-152x152.png",
  "/counter/images/icons/icon-192x192.png",
  "/counter/images/icons/icon-384x384.png",
  "/counter/images/icons/icon-512x512.png",
  "/counter/images/icons/icon-72x72.png",
  "/counter/images/icons/icon-96x96.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(version).then(ch => {
      ch.addAll(assets);
    })
  );
});

self.addEventListener("activate", evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(
        keys.filter(key => key !== version).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(cache => {
      return cache || fetch(evt.request);
    })
  );
});
