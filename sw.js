// Service Worker for 每日对账 · 热敏小票 PWA v3
// Cache-first strategy, offline support
// 关键：不自动清理旧缓存，保持 SW 稳定 → beforeinstallprompt 能触发

const CACHE_NAME = 'daily-recon-v5';
const APP_FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  console.log('🧾 SW installing...');
  // 预缓存核心文件
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES).catch((err) => {
        console.warn('SW precache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('🧾 SW activated — cleaning old caches');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // 跳过 chrome-extension 和非 http(s) 请求
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        if (resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return resp;
      });
    }).catch(() => {
      // 离线回退
      return caches.match(e.request);
    })
  );
});
