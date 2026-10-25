// Site de consultation hors ligne une fois chargé (SPEC §8).
// Modèle complété à la construction (server/siteFiles.ts) avec l'identifiant de la
// publication et la liste de ses scripts, styles et polices.
// Page : réseau d'abord (pour voir une nouvelle publication), cache à défaut.
// Fichiers versionnés (scripts, images) : cache d'abord.
// Chaque publication a son propre cache ; ceux des publications précédentes sont
// supprimés à l'activation, pour ne pas accumuler de fichiers sur le téléphone.
const PREFIX = 'fantasy-f1';
const CACHE = `${PREFIX}-f597d9c752`;
const PRECACHE = ["./assets/archivo-latin-ext-wdth-normal-7khWdh9v.woff2","./assets/archivo-latin-wdth-normal-DY7AcnAa.woff2","./assets/archivo-vietnamese-wdth-normal-rJmnGBSt.woff2","./assets/index-BPE1kTWQ.js","./assets/index-D3mvQd0L.css"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(['./', ...PRECACHE]))
      .catch(() => {
        /* hors ligne pendant l'installation : le cache se remplira à l'usage */
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const store = (res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  };
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(store)
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./'))),
    );
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(store)));
});
