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

  /* ---------- Botão "Instalar" ----------
     Aparece sempre no celular (e no PC quando o navegador oferece).
     Se o navegador tiver o pedido automático de instalação, usa ele;
     se não tiver, abre o passo a passo certo para o aparelho. */
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const inApp = /instagram|fban|fbav|fb_iab|line\/|tiktok|musical_ly|snapchat|twitter|linkedinapp|; wv\)/i.test(ua);
  const isSamsung = /samsungbrowser/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const iosSafari = isIOS && !/crios|fxios|edgios|opios/i.test(ua);
  let deferredPrompt = null;

  if (isIOS || isAndroid) root.classList.add('can-install');

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

  /** Passo a passo para quando o navegador não abre a instalação sozinho */
  function steps() {
    if (inApp) return {
      title: 'Abra no navegador',
      items: [
        'Este link abriu dentro de outro app, e por aqui não dá para instalar.',
        `Toque nos três pontinhos (ou no ícone de compartilhar) e escolha "Abrir no ${isIOS ? 'Safari' : 'Chrome'}".`,
        'Lá, toque em "Instalar" de novo.',
      ],
    };
    if (isIOS) return {
      title: 'Instalar no iPhone',
      items: iosSafari ? [
        'Toque em Compartilhar (o quadrado com a seta para cima), na barra do Safari.',
        'Role e escolha "Adicionar à Tela de Início".',
        'Toque em "Adicionar". O LIVRE aparece com ícone próprio.',
      ] : [
        'Toque em Compartilhar (o quadrado com a seta para cima), perto da barra de endereço.',
        'Escolha "Adicionar à Tela de Início". Se não aparecer, abra esta página no Safari e faça por lá.',
        'Toque em "Adicionar". O LIVRE aparece com ícone próprio.',
      ],
    };
    if (isSamsung) return {
      title: 'Instalar no Android',
      items: ['Toque no menu (as três linhas) embaixo.', 'Escolha "Adicionar página a" e depois "Tela inicial".', 'Confirme. O LIVRE aparece com ícone próprio.'],
    };
    if (isFirefox) return {
      title: 'Instalar no Android',
      items: ['Toque nos três pontinhos.', 'Escolha "Instalar" ou "Adicionar à tela inicial".', 'Confirme. O LIVRE aparece com ícone próprio.'],
    };
    if (isAndroid) return {
      title: 'Instalar no Android',
      items: ['Se tiver um X no canto de cima (a página abriu por outro app), toque nos três pontinhos e em "Abrir no Chrome" primeiro.', 'No Chrome, toque nos três pontinhos, no canto de cima.', 'Escolha "Instalar app" (ou "Adicionar à tela inicial" e depois "Instalar"). O LIVRE aparece com ícone próprio.'],
    };
    return {
      title: 'Instalar no computador',
      items: ['No Chrome ou no Edge, clique no ícone de instalar no fim da barra de endereço.', 'Ou abra o menu do navegador e escolha "Instalar LIVRE".'],
    };
  }

  document.addEventListener('click', async e => {
    if (!e.target.closest('[data-install]')) return;
    e.preventDefault();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') root.classList.remove('can-install');
      return;
    }
    const dlg = document.getElementById('dlgIos');
    if (!dlg) return;
    const s = steps();
    dlg.querySelector('#iosTitle').textContent = s.title;
    dlg.querySelector('.steps').innerHTML = s.items.map(t => `<li>${t}</li>`).join('');
    dlg.showModal();
  });
})();
