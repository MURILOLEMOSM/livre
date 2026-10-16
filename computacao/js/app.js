// CodePalma · roteador das telas, service worker e botão de instalar

import { $, $$, closeSheet } from './util.js';
import { renderEstante } from './estante.js';
import { renderCarreira } from './carreira.js';
import { renderEstudar } from './estudar.js';
import { renderFerramentas } from './ferramentas.js';
import { renderPraticar } from './praticar.js';

const ROUTES = {
  estante: renderEstante,
  carreira: renderCarreira,
  estudar: renderEstudar,
  ferramentas: renderFerramentas,
  praticar: renderPraticar,
};

async function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const name = ROUTES[parts[0]] ? parts[0] : 'estante';
  closeSheet();
  $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.nav === name));
  const view = $('#view');
  await ROUTES[name](view, parts[1], parts[2]);
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

// Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Instalar como app (Android/Chrome)
let deferred;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  $('#installBtn').hidden = false;
});
$('#installBtn').onclick = async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  $('#installBtn').hidden = true;
};
