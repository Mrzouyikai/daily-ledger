// SW v6b - stale-while-revalidate
const CACHE = "daily-recon-v6";
const FILES = ["./index.html", "./manifest.json"];

self.addEventListener("install", function(e) {
  console.log("SW v6b installing");
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return Promise.all(FILES.map(function(x) {
      return c.add(x)["catch"](function(){});
    }));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(k) {
    return Promise.all(k.filter(function(x) {
      return x !== CACHE;
    }).map(function(x) { return caches["delete"](x); }));
  }).then(function() { return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e) {
  if (!e.request.url.startsWith("http")) return;
  e.respondWith(caches.match(e.request).then(function(cached) {
    var fetchPromise = fetch(e.request).then(function(resp) {
      if (resp.ok) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return resp;
    })["catch"](function() { return cached; });
    return cached || fetchPromise;
  })["catch"](function() { return fetch(e.request); }));
});