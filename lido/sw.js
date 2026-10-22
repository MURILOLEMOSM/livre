/* =========================================================
   LIDO · Service Worker
   - App shell: cache primeiro, rede depois
   - Lucide e fontes: usa o cache e atualiza em segundo plano
   Ao mudar qualquer arquivo do app, suba o número da versão.
   ========================================================= */

const VERSION = 'lido-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const CDN_CACHE = `${VERSION}-cdn`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/lido.css',
  './js/config.js',
  './js/cloud.js',
  './js/core.js',
  './js/views.js',
  './js/main.js',
  './js/pwa.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

const CDN_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const CDN_FILES = [
  'https://unpkg.com/lucide@1.52.0/dist/umd/lucide.min.js',
  ...['app', 'auth', 'firestore'].map(m => `https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-${m}-compat.js`),
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL_FILES);
    const cdn = await caches.open(CDN_CACHE);
    await Promise.allSettled(CDN_FILES.map(async url => cdn.put(url, await fetch(url, { mode: 'no-cors' }))));
    await self.skipWaiting();
  })());
});

/* Apaga só caches antigos do LIDO (o LIVRE mora no mesmo domínio) */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('lido-') && !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(res => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
