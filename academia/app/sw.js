// Service worker do app do aluno: funciona offline com os arquivos em cache
const CACHE = 'livrefit-app-v1';
const ARQUIVOS = [
  './', './index.html', './app.css', './manifest.webmanifest', './icone-192.png', './icone-512.png', '../marca/icone-app.svg',
  './js/main.js', './js/util.js', './js/store.js', './js/data.js', './js/demo.js',
  './js/views/inicio.js', './js/views/treino.js', './js/views/aulas.js', './js/views/go.js',
  './js/views/evolucao.js', './js/views/social.js', './js/views/conta.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('livrefit-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro, cache como reserva (assim atualizações chegam logo)
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    // fontes do Google: cache primeiro
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      e.respondWith(caches.match(request).then(r => r || fetch(request).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(request, c)); return res; })));
    }
    return;
  }
  e.respondWith(
    fetch(request).then(res => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(request, c)); }
      return res;
    }).catch(() => caches.match(request).then(r => r || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
