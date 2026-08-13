/* ============================================================
   Logos — paznicul offline
   ------------------------------------------------------------
   VERSIUNE se schimbă la fiecare încărcare pe GitHub.
   Fără asta, browserul îți servește la nesfârșit fișierele vechi
   din cache și pare că modificările n-au ajuns niciodată.
   Reguli: la instalare aduce fișierele PROASPETE de pe rețea,
   la activare șterge tot ce e din versiunile trecute.
   ============================================================ */

const VERSIUNE = 'logos-2026-08-13-ip4';   // ← schimbă asta la fiecare încărcare

const FISIERE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', ev=>{
  ev.waitUntil((async ()=>{
    const cache = await caches.open(VERSIUNE);
    // `cache:'reload'` ocolește cache-ul HTTP al browserului: vrem fișierele
    // de pe server, nu copii vechi ale lor.
    await Promise.all(FISIERE.map(async u=>{
      try{ await cache.add(new Request(u, {cache:'reload'})); }
      catch(e){ console.warn('Logos sw: n-am putut pune în cache', u, e); }
    }));
    await self.skipWaiting();          // versiunea nouă preia imediat
  })());
});

self.addEventListener('activate', ev=>{
  ev.waitUntil((async ()=>{
    const nume = await caches.keys();
    await Promise.all(nume.filter(n=>n!==VERSIUNE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', ev=>{
  const cerere = ev.request;
  if(cerere.method!=='GET') return;                       // scrierile trec direct
  const adr = new URL(cerere.url);
  if(adr.origin!==self.location.origin) return;           // rețeaua străină nu ne privește
  if(cerere.headers.has('range')) return;                 // cereri parțiale: lăsate în pace

  // Răspundem din cache ca să meargă offline și instantaneu, dar reîmprospătăm
  // în fundal, ca următoarea deschidere să aibă versiunea nouă.
  ev.respondWith((async ()=>{
    const cache = await caches.open(VERSIUNE);
    const dinCache = await cache.match(cerere, {ignoreSearch:true});

    const dinRetea = fetch(cerere).then(rasp=>{
      if(rasp && rasp.ok && rasp.type==='basic'){
        cache.put(cerere, rasp.clone()).catch(()=>{});
      }
      return rasp;
    }).catch(()=>null);

    if(dinCache) return dinCache;

    const rasp = await dinRetea;
    if(rasp) return rasp;

    // offline și nimic în cache: pentru navigări dăm măcar coaja aplicației
    if(cerere.mode==='navigate'){
      const coaja = await cache.match('./index.html');
      if(coaja) return coaja;
    }
    return new Response('Logos este offline și fișierul nu e în cache.', {
      status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}
    });
  })());
});
