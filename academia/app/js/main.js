// Livre Fit · app do aluno: rotas, moldura e boas-vindas
import { $, $$, esc, ic, SIMBOLO, toast, hojeISO } from './util.js';
import { carregar, S, mudar, naoLidas, ouvir } from './store.js';
import { UNIDADE, PARQ } from './data.js';
import * as inicio from './views/inicio.js';
import * as treino from './views/treino.js';
import * as aulas from './views/aulas.js';
import * as go from './views/go.js';
import * as evolucao from './views/evolucao.js';
import * as social from './views/social.js';
import * as conta from './views/conta.js';

carregar();
aplicarTema();

const ROTAS = [
  [/^inicio$/, inicio.tela, 'inicio'],
  [/^treino$/, treino.tela, 'treino'],
  [/^treino\/(\w+)\/(\w+)$/, treino.exercicio, 'treino'],
  [/^sessao$/, treino.sessao, 'treino'],
  [/^historico$/, treino.historico, 'treino'],
  [/^aulas$/, aulas.tela, 'aulas'],
  [/^go$/, go.tela, 'treino'],
  [/^evolucao$/, evolucao.tela, 'perfil'],
  [/^social$/, social.tela, 'social'],
  [/^perfil$/, conta.perfil, 'perfil'],
  [/^financeiro$/, conta.financeiro, 'perfil'],
  [/^servicos$/, conta.servicos, 'perfil'],
  [/^saude$/, conta.saude, 'perfil'],
  [/^unidade$/, conta.unidade, 'perfil'],
  [/^notificacoes$/, conta.notificacoes, 'inicio'],
  [/^ajustes$/, conta.ajustes, 'perfil'],
  [/^acesso$/, conta.acesso, 'inicio'],
  [/^vantagens$/, conta.vantagens, 'perfil'],
];
const ABAS = [['inicio', 'Início', 'casa'], ['treino', 'Treino', 'halter'], ['aulas', 'Aulas', 'agenda'], ['social', 'Social', 'pessoas'], ['perfil', 'Perfil', 'perfil']];

const app = $('#app');
let limpar = null, ultimaRota = null;

export function aplicarTema() {
  const t = S().prefs.tema;
  const escuro = t === 'escuro' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro';
  $('meta[name="theme-color"]')?.setAttribute('content', escuro ? '#0f1115' : '#f4f1ea');
}

function rota() {
  limpar?.(); limpar = null;
  if (!S().entrou) return boasVindas();
  const h = location.hash.replace(/^#\/?/, '') || 'inicio';
  const r = ROTAS.find(([re]) => re.test(h));
  if (!r) { location.replace('#/inicio'); return; }
  const [re, fn, aba] = r;
  const v = fn(...(h.match(re).slice(1)));
  const raiz = ABAS.some(a => a[0] === h);
  // redesenho da mesma tela (após uma ação): mantém a rolagem e não repete a animação de entrada
  const mesma = h === ultimaRota, y = scrollY;
  ultimaRota = h;
  if (!mesma) document.querySelectorAll('.fundo-folha, .player').forEach(el => el.remove());
  app.innerHTML = `
    <header class="topo">
      ${raiz ? `<span class="marca-mini">${SIMBOLO}</span>` : `<button class="icone-btn" data-voltar aria-label="Voltar">${ic('voltar')}</button>`}
      <h1>${esc(v.titulo)}</h1>
      ${v.acao || ''}
      <a class="icone-btn" href="#/acesso" aria-label="Check-in na catraca">${ic('qr')}</a>
      <a class="icone-btn" href="#/notificacoes" aria-label="Notificações">${ic('sino')}<span class="bolha" id="bolha" ${naoLidas() ? '' : 'hidden'}>${naoLidas()}</span></a>
    </header>
    <main><div class="${mesma ? '' : 'tela'}">${v.html}</div></main>
    <nav class="abas" aria-label="Seções">${ABAS.map(([id, nome, i]) => `<a href="#/${id}" ${id === aba ? 'aria-current="page"' : ''}>${ic(i)}<span>${nome}</span></a>`).join('')}</nav>`;
  $('[data-voltar]', app)?.addEventListener('click', () => history.length > 1 ? history.back() : (location.hash = '#/' + aba));
  limpar = v.ligar?.($('main', app)) || null;
  scrollTo(0, mesma ? y : 0);
  treino.mostrarCronometro();
}

// Atualiza o contador de notificações sem redesenhar a tela
ouvir(() => {
  const b = $('#bolha'); if (!b) return;
  const n = naoLidas(); b.hidden = !n; b.textContent = n;
});

addEventListener('hashchange', rota);
addEventListener('lf:tema', aplicarTema);
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', aplicarTema);

// ---------- Boas-vindas: cadastro, saúde (PAR-Q) e assinatura ----------
function boasVindas(passo = 0) {
  const s = S();
  const passos = `<div class="passos">${[0, 1, 2].map(i => `<i class="${i <= passo ? 'on' : ''}"></i>`).join('')}</div>`;
  if (passo === 0) {
    app.innerHTML = `<div class="boas">
      <div>
        <span class="marca-mini" style="width:44px;height:44px;display:block">${SIMBOLO}</span>
        <h1>Seu treino.<br><span>Sem amarras.</span></h1>
        <p class="sub">Ficha digital, aulas, check-in, evolução e sua conta da academia em um só lugar.</p>
      </div>
      <form id="f" novalidate>
        ${passos}
        <label class="campo"><span>Como podemos te chamar?</span><input class="inp" name="nome" required autocomplete="given-name" value="${esc(s.user.nome)}"></label>
        <label class="campo"><span>E-mail</span><input class="inp" name="email" type="email" required autocomplete="email" value="${esc(s.user.email)}"></label>
        <label class="campo"><span>Sua unidade</span><select class="inp" name="unidade"><option>${esc(UNIDADE.nome)}</option></select></label>
        <button class="btn bloco">Continuar</button>
        <p class="sub peq" style="text-align:center;margin-top:12px">Versão de demonstração: seus dados ficam só neste aparelho.</p>
      </form></div>`;
    $('#f').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      if (!f.nome.value.trim() || !f.email.checkValidity()) { toast('Preencha nome e um e-mail válido.'); return; }
      mudar(s => { s.user.nome = f.nome.value.trim(); s.user.email = f.email.value.trim(); });
      boasVindas(1);
    });
    return;
  }
  if (passo === 1) {
    app.innerHTML = `<div class="boas" style="justify-content:flex-start">
      ${passos}
      <h2 style="font-size:1.6rem;font-weight:900">Questionário de saúde</h2>
      <p class="sub">Obrigatório antes de começar. Responda com sinceridade: isso ajuda o professor a cuidar de você.</p>
      <form id="f">${PARQ.map((q, i) => `<div class="parq-q"><p style="margin:0">${i + 1}. ${esc(q)}</p>
        <div class="seg" role="radiogroup" aria-label="Resposta ${i + 1}"><button type="button" role="radio" aria-selected="false" data-q="${i}" data-v="nao">Não</button><button type="button" role="radio" aria-selected="false" data-q="${i}" data-v="sim">Sim</button></div></div>`).join('')}
        <button class="btn bloco" style="margin-top:18px">Continuar</button></form></div>`;
    const resp = {};
    $$('[data-q]').forEach(b => b.addEventListener('click', () => {
      resp[b.dataset.q] = b.dataset.v;
      $$(`[data-q="${b.dataset.q}"]`).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    }));
    $('#f').addEventListener('submit', e => {
      e.preventDefault();
      if (Object.keys(resp).length < PARQ.length) { toast('Responda todas as perguntas.'); return; }
      const alerta = Object.values(resp).includes('sim');
      mudar(s => { s.saude.parq = { data: hojeISO(), resp, alerta }; });
      if (alerta) toast('Você respondeu "sim" em alguma pergunta: traga um atestado médico na recepção.');
      boasVindas(2);
    });
    return;
  }
  app.innerHTML = `<div class="boas" style="justify-content:flex-start">
    ${passos}
    <h2 style="font-size:1.6rem;font-weight:900">Termo de adesão</h2>
    <div class="card" style="margin:12px 0;max-height:180px;overflow:auto;font-size:.86rem" tabindex="0">
      <p style="margin-top:0">Ao assinar, você confirma que leu as regras da unidade: uso de toalha nos aparelhos, devolução dos pesos ao lugar e respeito aos horários das aulas reservadas.</p>
      <p>O plano ${esc(s.user.plano)} pode ser cancelado pelo app com 30 dias de antecedência. As respostas do questionário de saúde são verdadeiras.</p>
      <p style="margin-bottom:0">Este é um termo de demonstração e não tem validade jurídica.</p>
    </div>
    <p class="sub peq">Assine com o dedo ou o mouse:</p>
    <canvas class="assinatura" id="ass" aria-label="Área de assinatura"></canvas>
    <div class="btns" style="margin-top:10px"><button class="btn sec" id="limpa">Limpar</button><button class="btn" id="ok">Assinar e entrar</button></div>
  </div>`;
  const cv = $('#ass'), c = cv.getContext('2d');
  const ajusta = () => { const r = cv.getBoundingClientRect(), k = devicePixelRatio || 1; cv.width = r.width * k; cv.height = r.height * k; c.scale(k, k); c.lineWidth = 2.5; c.lineCap = 'round'; c.strokeStyle = '#0f1115'; };
  ajusta();
  let des = false, tracos = 0;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { des = true; cv.setPointerCapture(e.pointerId); c.beginPath(); c.moveTo(...pos(e)); });
  cv.addEventListener('pointermove', e => { if (!des) return; c.lineTo(...pos(e)); c.stroke(); tracos++; });
  cv.addEventListener('pointerup', () => { des = false; });
  $('#limpa').onclick = () => { c.clearRect(0, 0, cv.width, cv.height); tracos = 0; };
  $('#ok').onclick = () => {
    if (tracos < 8) { toast('Faça sua assinatura no quadro.'); return; }
    mudar(s => { s.saude.termos = { data: hojeISO(), assinatura: cv.toDataURL('image/png') }; s.entrou = true; });
    location.hash = '#/inicio';
    rota();
    toast(`Bem-vindo(a), ${S().user.nome}!`);
  };
}

// Service worker do app (funciona offline)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

rota();
