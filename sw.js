// Service Worker v6
const CACHE_NAME = 'daily-recon-v6';
const APP_FILES = ['./','./index.html','./manifest.json'];
self.addEventListener('install',(e)=>{console.log('SW v6');e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(APP_FILES).catch(function(){})}));self.skipWaiting();});
self.addEventListener('activate',(e)=>{e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE_NAME}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}));});
self.addEventListener('fetch',(e)=>{if(!e.request.url.startsWith('http'))return;e.respondWith(caches.match(e.request).then(function(cached){var fp=fetch(e.request).then(function(r){if(r.ok){var cl=r.clone();caches.open(CACHE_NAME).then(function(c){c.put(e.request,cl)})}return r}).catch(function(){return cached});return cached||fp}).catch(function(){return fetch(e.request)}));});