// Minimale service worker: de app-bestanden offline, data altijd vers (via de synccode).
const C = 'pt-app-20261022-1946';
const FILES = ['./index.html', './manifest.json', './icon.png', './icon-192.png', './apple-touch-icon.png', './logo.svg', './runner-purple.png', './gymrace-logo.png', './singelloop-beeldmerk.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.pathname.includes('/functions/v1/')) return;           // data: nooit cachen
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});

// ---- herinneringen via Web Push ----
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Trainer', { body: d.body || '', tag: d.tag || 'trainer', icon: './icon.png', badge: './icon.png', data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { const c = cs.find(x => 'focus' in x); if (c) { if (url !== './' && 'navigate' in c) c.navigate(url); return c.focus(); } return self.clients.openWindow(url); }));
});
