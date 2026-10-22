/* =========================================================
   LIVRE · Service Worker
   - App shell (arquivos locais): cache primeiro, rede depois
   - Libs externas (Lucide, Firebase e fontes): usa o cache e
     atualiza em segundo plano (stale-while-revalidate)
   Ao mudar qualquer arquivo do app, suba o número da versão.
   ========================================================= */

const VERSION = 'livre-v11';
const SHELL_CACHE = `${VERSION}-shell`;
const CDN_CACHE = `${VERSION}-cdn`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './privacidade.html',
  './manifest-discreto.webmanifest',
  './icons/discreto-192.png',
  './icons/discreto-512.png',
  './icons/discreto-apple.png',
  './css/style.css',
  './js/config.js',
  './js/core.js',
  './js/cloud.js',
  './js/social.js',
  './js/rules.js',
  './js/art.js',
  './js/views.js',
  './js/views2.js',
  './js/lock.js',
  './js/dock.js',
  './js/main.js',
  './js/pwa.js',
  './netlify/lib/reminder.mjs',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Libs que a página carrega por <script>; já ficam guardadas na instalação
const CDN_FILES = [
  'https://unpkg.com/lucide@1.52.0/dist/umd/lucide.min.js',
  'https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-app-compat.js',
  'https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-auth-compat.js',
  'https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-firestore-compat.js',
];

/* Instalação: guarda o app shell e as libs principais */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL_FILES);

    // Sem internet na instalação? Tudo bem, elas entram no cache na próxima visita
    const cdn = await caches.open(CDN_CACHE);
    await Promise.allSettled(CDN_FILES.map(async url => {
      const res = await fetch(url, { mode: 'no-cors' });
      await cdn.put(url, res);
    }));

    await self.skipWaiting();
  })());
});

/* Ativação: apaga caches de versões antigas */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('livre-') && !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navegação (abrir o app): tenta a rede, cai para o index em cache offline
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

  // Bibliotecas e fontes externas (as APIs do Firebase passam direto, sem cache)
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Arquivos do próprio app
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(res => {
      // respostas "opaque" (status 0) de scripts externos também servem offline
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);

  return cached || network;
}

/* =========================================================
   Lembrete diário (push)
   A função agendada no Netlify manda { title, body, url }.
   ========================================================= */
self.addEventListener('push', event => {
  let msg = { title: 'LIVRE', body: 'Abra o app e confira seus dias livres.', url: './#/hoje' };
  try { msg = { ...msg, ...event.data.json() }; } catch { /* sem conteúdo: usa o padrão */ }

  event.waitUntil(self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: 'icons/icon-192.png',
    tag: 'livre-diario',      // um lembrete novo substitui o de ontem
    renotify: true,
    data: { url: msg.url },
  }));
});

/* Tocar na notificação abre (ou traz para frente) o app */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.registration.scope).href;

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = wins.find(w => w.url.startsWith(self.registration.scope));
    if (open) {
      await open.focus();
      if ('navigate' in open) await open.navigate(target).catch(() => {});
      return;
    }
    await self.clients.openWindow(target);
  })());
});
