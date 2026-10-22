/* =========================================================
   LIDO · PWA
   1. Registra o service worker (offline)
   2. Mostra os botões "Instalar" quando o navegador permite
   3. No iPhone, mostra o passo a passo (o Safari não tem prompt)
   ========================================================= */

(() => {
  const root = document.documentElement;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err =>
        console.warn('[LIDO] Service worker não registrado:', err));
    });

    // Recarrega só quando uma versão NOVA assume, e nunca no meio de uma sessão
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded || state.active) return;
      reloaded = true;
      window.location.reload();
    });
  }

  if (isStandalone) return;

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    root.classList.add('can-install');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    root.classList.remove('can-install');
    toast('LIDO instalado na sua tela inicial.', true);
  });

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
    } else {
      toast('Use o menu do navegador e escolha "Instalar app".');
    }
  });
})();
