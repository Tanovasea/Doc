/* ============================================================
   Logos — paznicul offline (v2)
   ------------------------------------------------------------
   Ce s-a schimbat față de varianta veche și de ce:

   1. Numele cache-ului NU se mai schimbă la fiecare încărcare.
      Înainte, cache-ul se numea chiar VERSIUNE, iar la activare
      se ștergea „tot ce nu e VERSIUNE". Adică fiecare încărcare
      nouă pe GitHub arunca la gunoi copia offline care mergea
      și te obliga să intri iar online ca s-o refaci.

   2. Dacă instalarea nu poate aduce fișierele esențiale (ești
      offline, rețeaua e slabă, GitHub dă 404), instalarea
      EȘUEAZĂ intenționat. Înainte eroarea era înghițită de
      try/catch: instalarea „reușea" cu un cache gol, apoi
      activarea ștergea cache-ul vechi, bun. Rezultat: aplicație
      fără nimic offline. Acum paznicul vechi rămâne pe post,
      cu tot ce avea, până când rețeaua chiar e disponibilă.
   ============================================================ */

const VERSIUNE = 'logos-2026-08-15-1';   // ← schimbă asta la fiecare încărcare pe GitHub
const CACHE    = 'logos';                // ← numele acesta NU se schimbă NICIODATĂ

// Fără ele aplicația nu există offline: dacă nu vin, nu instalăm.
const ESENTIALE = [
  './',
  './index.html'
];

// Podoabe: iconițe, manifest. Lipsa lor nu justifică pierderea offline-ului.
const OPTIONALE = [
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', ev=>{
  ev.waitUntil((async ()=>{
    const cache = await caches.open(CACHE);

    // `cache:'reload'` ocolește cache-ul HTTP al browserului: vrem fișierele
    // de pe server, nu copii vechi ale lor.
    const raspunsuri = await Promise.all(
      ESENTIALE.map(u => fetch(new Request(u, {cache:'reload'})).catch(()=>null))
    );

    // Prima piatră care lipsește oprește tot. Aruncarea asta e intenționată:
    // instalarea eșuată înseamnă că versiunea veche rămâne activă, întreagă.
    raspunsuri.forEach((r,i)=>{
      if(!r || !r.ok) throw new Error('Logos sw: nu pot aduce ' + ESENTIALE[i]);
    });

    // Abia acum scriem în cache — după ce știm că avem tot ce trebuie.
    await Promise.all(ESENTIALE.map((u,i)=> cache.put(u, raspunsuri[i])));

    // Optionalele: fiecare pe cont propriu, eșecul lor nu doboară nimic.
    await Promise.all(OPTIONALE.map(async u=>{
      try{ await cache.add(new Request(u, {cache:'reload'})); }
      catch(e){ console.warn('Logos sw: n-am putut pune în cache', u, e); }
    }));

    // Ștampila versiunii, ca să poți vedea din pagină ce paznic te păzește.
    await cache.put('./__versiune', new Response(VERSIUNE, {
      headers:{'Content-Type':'text/plain; charset=utf-8'}
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', ev=>{
  ev.waitUntil((async ()=>{
    // Curățăm doar cache-urile vechi, cu nume învechite (logos-2026-...).
    // Cache-ul „logos" rămâne, oricâte versiuni ar trece peste el.
    const nume = await caches.keys();
    await Promise.all(nume.filter(n=>n!==CACHE).map(n=>caches.delete(n)));
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
    const cache = await caches.open(CACHE);
    const dinCache = await cache.match(cerere, {ignoreSearch:true});

    const dinRetea = fetch(cerere).then(rasp=>{
      if(rasp && rasp.ok && rasp.type==='basic'){
        cache.put(cerere, rasp.clone()).catch(()=>{});
      }
      return rasp;
    }).catch(()=>null);

    if(dinCache){
      ev.waitUntil(dinRetea);   // reîmprospătarea are voie să continue după răspuns
      return dinCache;
    }

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
