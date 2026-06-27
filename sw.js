const CACHE = 'formsignale-v1';
const PRECACHE = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
];

// Installation: statische Assets cachen
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Aktivierung: alten Cache löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first für App-Dateien, Network-first für OSM-Kacheln
self.addEventListener('fetch', e => {
  if (e.request.url.includes('openstreetmap.org')) {
    // Kartenkacheln: versuche Netz, falle auf Cache zurück
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // App-Dateien: Cache-first
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});
