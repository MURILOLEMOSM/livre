/* =========================================================
   LIVRE · PWA
   1. Registra o service worker (offline)
   2. Mostra os botões "Instalar" quando o navegador permite
   3. No iPhone, mostra o passo a passo (o Safari não tem prompt)
   ========================================================= */

(() => {
  const root = document.documentElement;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  /* ---------- Service worker ---------- */
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err =>
        console.warn('[LIVRE] Service worker não registrado:', err));
    });

    // Recarrega só quando uma versão NOVA assume (na primeira visita, não)
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }

  if (isStandalone) return; // já instalado: nada de botão

  /* ---------- Android / Chrome / Edge ---------- */
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    root.classList.add('can-install');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    root.classList.remove('can-install');
    toast('LIVRE instalado. Ele já está na sua tela inicial.', true);
  });

  /* ---------- iPhone / iPad ---------- */
  if (isIOS) root.classList.add('can-install');

  document.addEventListener('click', async e => {
    if (!e.target.closest('[data-install]')) return;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      root.classList.remove('can-install');
    } else if (isIOS) {
      document.getElementById('dlgIos').showModal();
    }
  });
})();
