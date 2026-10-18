// Minimale service worker: de app-bestanden offline, data altijd vers (via de synccode).
const C = 'pt-app-20261018-1021';
const FILES = ['./index.html', './manifest.json', './icon.png', './runner-purple.png', './gymrace-logo.png', './singelloop-beeldmerk.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.pathname.includes('/functions/v1/')) return;           // data: nooit cachen
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
