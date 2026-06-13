// Service Worker for 姣忔棩瀵硅处 路 鐑晱灏忕エ PWA v3
// Cache-first strategy, offline support
// 鍏抽敭锛氫笉鑷姩娓呯悊鏃х紦瀛橈紝淇濇寔 SW 绋冲畾 鈫?beforeinstallprompt 鑳借Е鍙?
const CACHE_NAME = 'daily-recon-v5';
const APP_FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  console.log('馃Ь SW installing...');
  // 棰勭紦瀛樻牳蹇冩枃浠?  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES).catch((err) => {
        console.warn('SW precache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('馃Ь SW activated 鈥?cleaning old caches');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // 璺宠繃 chrome-extension 鍜岄潪 http(s) 璇锋眰
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) { if (resp.ok) { var clone = resp.clone(); caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); }); } return resp; }).then((resp) => {
        if (resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return resp;
      });
    }).catch(() => {
      // 绂荤嚎鍥為€€
      return caches.match(e.request);
    })
  );
});

