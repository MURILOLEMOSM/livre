// FisioPalma · roteador das telas, service worker e botão de instalar

import { $, $$, closeSheet } from './util.js';
import { renderEstante } from './estante.js';
import { renderAtender } from './atender.js';
import { renderEstudar } from './estudar.js';
import { renderFerramentas } from './ferramentas.js';
import { renderClinica } from './clinica.js';

const ROUTES = {
  estante: renderEstante,
  atender: renderAtender,
  estudar: renderEstudar,
  ferramentas: renderFerramentas,
  clinica: renderClinica,
};

async function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  // link de relatório que o paciente mandou: importa e mostra a evolução
  if (parts[0] === 'relatorio' && parts[1]) {
    sessionStorage.setItem('fp:pendingReport', parts[1]);
    history.replaceState(null, '', '#/clinica/exercicios');
    return route();
  }
  // endereço antigo da aba de exercícios
  if (parts[0] === 'casa') {
    history.replaceState(null, '', '#/clinica/exercicios');
    return route();
  }
  const name = parts[0] || 'estante';
  const render = ROUTES[name] || ROUTES.estante;
  closeSheet();
  $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.nav === name));
  const view = $('#view');
  await render(view, parts[1], parts[2]);
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
