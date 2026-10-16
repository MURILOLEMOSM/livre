/* =========================================================
   CAMPUS · Service Worker
   - Arquivos do app: cache primeiro (funciona offline)
   - Three.js (CDN): guardado na primeira vez que o Atlas abre
   Ao mudar qualquer arquivo do app, suba o número da versão.
   ========================================================= */

const VERSAO = 'campus-v1';
const CACHE_APP = `${VERSAO}-app`;
const CACHE_CDN = `${VERSAO}-cdn`;

const ARQUIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './js/cursos.js',
  './js/perguntas.js',
  './js/acervo.js',
  './js/diagramas.js',
  './js/atlas3d.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_APP).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Apaga só os caches antigos do CAMPUS (o app da raiz tem os dele)
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('campus-') && !k.startsWith(VERSAO)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Abrir o app: rede primeiro, index do cache quando offline
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }

  // Three.js e outras libs do CDN: cache primeiro, rede depois
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.open(CACHE_CDN).then(async cache => {
        const salvo = await cache.match(request);
        if (salvo) return salvo;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // Arquivos do app: cache primeiro e atualiza em segundo plano
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_APP).then(async cache => {
        const salvo = await cache.match(request, { ignoreSearch: true });
        const rede = fetch(request).then(res => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => salvo);
        return salvo || rede;
      })
    );
  }
});
