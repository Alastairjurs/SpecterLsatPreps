const CACHE_NAME = 'specter-lsat-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/']))));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
