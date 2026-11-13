// Offline rad: svi fajlovi igre se čuvaju na telefonu posle prvog otvaranja.
// Kad objaviš novu verziju igre, promeni broj (v1 -> v2) da bi se telefon osvežio.
const NAZIV = 'superm-offline-v2';
const FAJLOVI = ['./', './index.html', './style.css', './game.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(NAZIV).then(c => c.addAll(FAJLOVI)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(k => Promise.all(k.filter(x => x !== NAZIV).map(x => caches.delete(x))))
  .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(c => c || fetch(e.request)));
});
