/* DocCăutare — lucrătorul de serviciu (service worker)
   Ține aplicația în memoria browserului, ca să pornească și fără internet.
   Când urci o versiune nouă pe GitHub, schimbă numărul de mai jos —
   asta e tot ce trebuie ca telefoanele să ia versiunea nouă. */

const VERSIUNE = 'doccautare-2.10.2';

const FISIERE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png',
  './favicon-64.png'
];

// La instalare: punem deoparte tot ce trebuie pentru pornire.
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSIUNE).then(function (c) {
      // fiecare separat: dacă un fișier lipsește, restul tot se salvează
      return Promise.all(FISIERE.map(function (f) {
        return c.add(new Request(f, { cache: 'reload' })).catch(function (err) {
          console.warn('Nu s-a putut salva', f, err);
        });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

// La activare: ștergem versiunile vechi, ca să nu se adune.
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chei) {
      return Promise.all(chei.map(function (k) {
        return k === VERSIUNE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// La cerere: întâi din memorie (pornire instantanee), apoi de pe rețea.
self.addEventListener('fetch', function (e) {
  const cerere = e.request;

  if (cerere.method !== 'GET') return;
  if (new URL(cerere.url).origin !== self.location.origin) return;

  // Deschiderea aplicației (navigare): dăm pagina salvată, chiar și offline.
  if (cerere.mode === 'navigate') {
    e.respondWith(
      fetch(cerere)
        .then(function (r) {
          const copie = r.clone();
          caches.open(VERSIUNE).then(function (c) { c.put('./index.html', copie); });
          return r;
        })
        .catch(function () {
          return caches.match('./index.html', { ignoreSearch: true })
            .then(function (r) { return r || caches.match('./'); });
        })
    );
    return;
  }

  // Restul (iconițe, manifest): din memorie, iar în fundal reîmprospătăm.
  e.respondWith(
    caches.match(cerere, { ignoreSearch: true }).then(function (dinMemorie) {
      const dePeRetea = fetch(cerere).then(function (r) {
        if (r && r.status === 200 && r.type === 'basic') {
          const copie = r.clone();
          caches.open(VERSIUNE).then(function (c) { c.put(cerere, copie); });
        }
        return r;
      }).catch(function () { return dinMemorie; });
      return dinMemorie || dePeRetea;
    })
  );
});
