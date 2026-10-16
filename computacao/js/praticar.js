// Praticar: radar das plataformas de exercícios, diário de problemas com revisão espaçada e trilha de estudos

import { $, $$, esc, uid, toast, store, openSheet, closeSheet } from './util.js';

// [nome, url, categoria, preço, idioma, para quem / o que tem de bom]
const APPS = [
  ['Beecrowd', 'https://judge.beecrowd.com', 'Lógica e algoritmos', 'Grátis', 'PT', 'Juiz online brasileiro (antigo URI). Milhares de problemas em português, do iniciante à maratona. Ótimo para Programação I e Algoritmos.'],
  ['LeetCode', 'https://leetcode.com', 'Entrevistas', 'Grátis + Premium', 'EN', 'Referência para entrevista técnica de big techs. Listas por empresa e por padrão; Premium libera problemas e soluções exclusivas.'],
  ['NeetCode', 'https://neetcode.io', 'Entrevistas', 'Grátis + Pro', 'EN', 'Roteiro "NeetCode 150" organizado por padrão, com vídeo explicando cada problema. Bom para não se perder no LeetCode.'],
  ['HackerRank', 'https://www.hackerrank.com', 'Entrevistas e certificados', 'Grátis', 'EN', 'Trilhas de SQL, regex, linguagens e estruturas de dados. Certificados gratuitos e muito usado por empresas em processo seletivo.'],
  ['Codeforces', 'https://codeforces.com', 'Programação competitiva', 'Grátis', 'EN/RU', 'Competições semanais com ranking (rating). Para quem quer maratona de programação.'],
  ['AtCoder', 'https://atcoder.jp', 'Programação competitiva', 'Grátis', 'EN/JA', 'Contests semanais "Beginner" com enunciados limpos; ótima escada de dificuldade.'],
  ['CSES Problem Set', 'https://cses.fi/problemset', 'Algoritmos', 'Grátis', 'EN', '300 problemas clássicos organizados por tema (grafos, DP, árvores). Acompanha o livro gratuito "Competitive Programmer’s Handbook".'],
  ['Neps Academy', 'https://neps.academy', 'Lógica e OBI', 'Grátis + pago', 'PT', 'Cursos e problemas em português, com foco na OBI e maratonas.'],
  ['Exercism', 'https://exercism.org', 'Linguagens', 'Grátis', 'EN', 'Mais de 70 linguagens, com mentoria humana voluntária revisando seu código. Ótimo para aprender o "jeito certo" de uma linguagem.'],
  ['Codewars', 'https://www.codewars.com', 'Lógica', 'Grátis', 'EN', 'Desafios curtos ("katas") e você vê as soluções dos outros depois de resolver — aprende muitos truques.'],
  ['freeCodeCamp', 'https://www.freecodecamp.org/portuguese', 'Web e certificados', 'Grátis', 'PT/EN', 'Currículo completo de web, JavaScript, Python e dados, com projetos e certificados gratuitos.'],
  ['The Odin Project', 'https://www.theodinproject.com', 'Web full stack', 'Grátis', 'EN', 'Trilha de projetos reais (HTML, CSS, JS, Node ou Rails), comunidade ativa no Discord.'],
  ['CS50 (Harvard)', 'https://cs50.harvard.edu', 'Fundamentos', 'Grátis', 'EN (legendas PT)', 'O curso de introdução à computação mais famoso do mundo; listas com corretor automático.'],
  ['roadmap.sh', 'https://roadmap.sh', 'Trilhas de carreira', 'Grátis', 'EN', 'Mapas do que estudar para back-end, front-end, DevOps, dados, IA... com links e projetos sugeridos.'],
  ['SQLBolt / SQL Murder Mystery', 'https://sqlbolt.com', 'Banco de dados', 'Grátis', 'EN', 'Exercícios interativos de SQL no navegador; o "Murder Mystery" ensina SQL resolvendo um crime.'],
  ['Kaggle Learn', 'https://www.kaggle.com/learn', 'Dados e IA', 'Grátis', 'EN', 'Microcursos práticos de Python, pandas, ML e SQL, com notebooks prontos e competições.'],
  ['TryHackMe', 'https://tryhackme.com', 'Segurança', 'Grátis + Premium', 'EN', 'Laboratórios guiados de cibersegurança no navegador, do zero ao pentest (sempre em ambiente autorizado).'],
  ['Advent of Code', 'https://adventofcode.com', 'Desafios sazonais', 'Grátis', 'EN', 'Um quebra-cabeça por dia de 1 a 25 de dezembro. Divertido para treinar uma linguagem nova.'],
  ['OBI / Maratona SBC', 'https://olimpiada.ic.unicamp.br', 'Competições', 'Grátis', 'PT', 'Olimpíada Brasileira de Informática e Maratona de Programação da SBC: provas antigas com gabarito são ótimas listas.'],
  ['DIO / Alura / Rocketseat', 'https://www.dio.me', 'Cursos BR', 'Grátis + pago', 'PT', 'Plataformas brasileiras com bootcamps (DIO tem muitos gratuitos com empresas), trilhas e comunidade em português.'],
];

const DIFICULDADE = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const PADROES = ['Vetores e strings', 'Hash map', 'Dois ponteiros', 'Janela deslizante', 'Pilha / fila', 'Busca binária', 'Lista ligada', 'Árvores', 'Heap', 'Grafos (BFS/DFS)', 'Caminho mínimo', 'Backtracking', 'Programação dinâmica', 'Guloso', 'Intervalos', 'Matemática', 'Bits', 'SQL', 'Outro'];
const REVISAO_DIAS = [3, 7, 21, 60]; // resolveu de novo sem olhar → próxima revisão mais longe
const DAY = 86_400_000;

const TRILHA = [
  ['Fundamentos', ['Lógica: variáveis, condições e laços', 'Funções e recursão', 'Vetores, matrizes e strings', 'Ponteiros e memória (C)', 'Git básico: commit, branch, push, PR', 'Terminal: navegar, editar, rodar']],
  ['Estruturas e algoritmos', ['Big-O e análise de complexidade', 'Ordenação (merge, quick, counting)', 'Pilha, fila, lista ligada', 'Hash map e conjuntos', 'Árvores binárias e ABB', 'Heap e fila de prioridade', 'Grafos: BFS, DFS, Dijkstra', 'Programação dinâmica básica']],
  ['Engenharia e sistemas', ['POO e SOLID', 'Testes automatizados', 'SQL e modelagem de dados', 'HTTP, APIs REST e JSON', 'Redes: TCP/IP e DNS', 'Sistemas operacionais: processos, threads, memória', 'Docker básico', 'Segurança: OWASP Top 10']],
  ['Portfólio e carreira', ['1 projeto completo publicado (com README)', 'Currículo de 1 página revisado', 'LinkedIn e GitHub atualizados', '50 problemas resolvidos (Beecrowd/LeetCode)', '3 histórias STAR prontas', '2 entrevistas simuladas com colega', 'Contribuição em open source ou extensão/IC']],
];

let sub = 'diario';
let appFilter = 'todos';

export function renderPraticar(root, part) {
  if (part && ['diario', 'radar', 'trilha'].includes(part)) sub = part;
  root.innerHTML = `
    <h1>Praticar</h1>
    <p class="muted">Programação se aprende resolvendo problema. Aqui ficam os sites de exercícios, o seu diário de problemas e a trilha de estudo.</p>
    <div class="chips" id="subTabs">
      <a class="chip ${sub === 'diario' ? 'on' : ''}" href="#/praticar/diario">📒 Diário</a>
      <a class="chip ${sub === 'radar' ? 'on' : ''}" href="#/praticar/radar">🛰️ Radar de sites</a>
      <a class="chip ${sub === 'trilha' ? 'on' : ''}" href="#/praticar/trilha">🗺️ Trilha</a>
    </div>
    <div id="subView"></div>`;
  ({ diario, radar, trilha })[sub]($('#subView'));
}

/* ---------------- Diário de problemas ---------------- */

const problems = () => store.get('problems', []);
const saveProblems = list => store.set('problems', list);

function diario(el) {
  const list = problems();
  const now = Date.now();
  const due = list.filter(p => p.next && p.next <= now).sort((a, b) => a.next - b.next);
  const solved = list.filter(p => p.status === 'resolvido');
  const byPattern = {};
  solved.forEach(p => { byPattern[p.pattern || 'Outro'] = (byPattern[p.pattern || 'Outro'] || 0) + 1; });
  const week = list.filter(p => p.createdAt > now - 7 * DAY).length;
  const maxPat = Math.max(1, ...Object.values(byPattern));

  el.innerHTML = `
    <div class="grid3">
      <div class="card stat"><small>Resolvidos</small><div class="result">${solved.length}</div></div>
      <div class="card stat"><small>Nesta semana</small><div class="result">${week}</div></div>
      <div class="card stat"><small>Para revisar</small><div class="result">${due.length}</div></div>
    </div>
    <button type="button" id="addProb" style="width:100%">＋ Registrar problema</button>

    ${due.length ? `<h2>🔁 Revisar hoje</h2>
      <p class="muted">Tente resolver de novo <b>sem olhar</b> a sua solução. É isso que faz o padrão grudar.</p>
      ${due.map(probCard).join('')}` : ''}

    ${Object.keys(byPattern).length ? `<h2>Padrões que você já treinou</h2>
      <div class="card">${Object.entries(byPattern).sort((a, b) => b[1] - a[1]).map(([k, n]) => `
        <div class="row" style="flex-wrap:nowrap;margin:4px 0"><span style="width:150px;flex:none;font-size:.85rem">${esc(k)}</span>
        <div class="progress" style="flex:1"><i style="width:${(n / maxPat) * 100}%"></i></div><b style="width:24px;text-align:right">${n}</b></div>`).join('')}
        <p class="muted" style="font-size:.8rem;margin-top:8px">Faltando: ${PADROES.filter(p => !byPattern[p] && p !== 'Outro' && p !== 'SQL').slice(0, 6).map(esc).join(', ') || 'nada, parabéns!'}</p>
      </div>` : ''}

    <h2>Histórico</h2>
    <input type="search" id="probSearch" placeholder="Buscar por nome, site ou padrão" />
    <div id="probList" style="margin-top:8px"></div>
    <p class="muted" style="font-size:.8rem">Dica: anote em uma frase a ideia-chave ("hash do complemento", "BFS a partir de todos os zeros"). É ela que você revisa, não o código.</p>`;

  const drawList = () => {
    const q = $('#probSearch', el).value.trim().toLowerCase();
    const shown = list.filter(p => !q || [p.name, p.site, p.pattern, p.idea].some(v => String(v || '').toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt - a.createdAt);
    $('#probList', el).innerHTML = shown.length ? shown.map(probCard).join('')
      : `<div class="card empty"><div class="big">📒</div><p>${list.length ? 'Nada com essa busca.' : 'Nenhum problema ainda. Resolveu um exercício da lista ou do Beecrowd? Registre aqui.'}</p></div>`;
  };
  $('#probSearch', el).oninput = drawList;
  drawList();
  $('#addProb', el).onclick = () => openProblem();
  el.onclick = e => {
    const b = e.target.closest('[data-prob]');
    if (b) openProblem(list.find(p => p.id === b.dataset.prob));
  };
}

function probCard(p) {
  const tag = p.status === 'resolvido' ? 'ok' : p.status === 'travei' ? 'bad' : 'warn';
  const label = { resolvido: 'Resolvido', travei: 'Travei', tentando: 'Tentando' }[p.status];
  return `<button type="button" class="card prob" data-prob="${esc(p.id)}">
    <span><b>${esc(p.name)}</b><br><small>${esc([p.site, DIFICULDADE[p.diff], p.pattern].filter(Boolean).join(' · '))}</small>
    ${p.idea ? `<br><small class="idea">💡 ${esc(p.idea)}</small>` : ''}</span>
    <span class="tag ${tag}">${label}</span>
  </button>`;
}

function openProblem(existing) {
  const p = existing ? { ...existing } : { id: uid(), status: 'resolvido', diff: 'facil', createdAt: Date.now(), reviews: 0 };
  const isDue = existing && p.next && p.next <= Date.now();
  const body = openSheet(existing ? p.name : 'Registrar problema', `
    <form id="probForm" autocomplete="off">
      ${isDue ? `<div class="notice">Revisão: tente de novo sem olhar a solução e marque como foi.</div>
        <div class="row" style="margin-bottom:10px">
          <button type="button" data-rev="ok">Resolvi sem olhar</button>
          <button type="button" class="soft" data-rev="dica">Precisei de dica</button>
          <button type="button" class="danger" data-rev="nao">Não consegui</button>
        </div>` : ''}
      <label for="pName">Nome ou número do problema *</label>
      <input id="pName" required value="${esc(p.name || '')}" placeholder="Ex.: 1. Two Sum / Beecrowd 1001" />
      <div class="field2">
        <div><label for="pSite">Site / lista</label><input id="pSite" list="siteList" value="${esc(p.site || '')}" placeholder="Beecrowd, LeetCode, Lista 3..." />
          <datalist id="siteList">${APPS.map(a => `<option value="${esc(a[0])}">`).join('')}</datalist></div>
        <div><label for="pDiff">Dificuldade</label><select id="pDiff">${Object.entries(DIFICULDADE).map(([k, v]) => `<option value="${k}" ${p.diff === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div><label for="pPat">Padrão</label><select id="pPat"><option value="">—</option>${PADROES.map(x => `<option ${p.pattern === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div><label for="pStatus">Situação</label><select id="pStatus">
          <option value="resolvido" ${p.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
          <option value="tentando" ${p.status === 'tentando' ? 'selected' : ''}>Tentando</option>
          <option value="travei" ${p.status === 'travei' ? 'selected' : ''}>Travei / vi a solução</option></select></div>
      </div>
      <label for="pUrl">Link</label>
      <input id="pUrl" type="url" value="${esc(p.url || '')}" placeholder="https://..." />
      <label for="pIdea">Ideia-chave em uma frase</label>
      <input id="pIdea" value="${esc(p.idea || '')}" placeholder="Ex.: hash map guardando o complemento" />
      <label for="pTime">Tempo gasto (min)</label>
      <input id="pTime" type="number" min="0" value="${esc(p.time || '')}" style="max-width:120px" />
      <label for="pNotes">Anotações / erro que cometi</label>
      <textarea id="pNotes" placeholder="Esqueci o caso do vetor vazio; estourou int, usei long long...">${esc(p.notes || '')}</textarea>
      <button type="submit" style="width:100%;margin-top:14px">Salvar</button>
      ${existing ? `<div class="row" style="margin-top:8px">
        ${p.url ? `<a class="btn ghost" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Abrir problema</a>` : ''}
        <button type="button" class="ghost" id="pDel" style="color:var(--bad);border-color:var(--bad)">Apagar</button></div>` : ''}
      ${p.next ? `<p class="muted" style="font-size:.8rem">Próxima revisão: ${new Date(p.next).toLocaleDateString('pt-BR')} · revisado ${p.reviews || 0}x</p>` : ''}
    </form>`);

  const persist = () => {
    const list = problems().filter(x => x.id !== p.id);
    list.push(p);
    saveProblems(list);
    closeSheet();
    renderPraticar($('#view'));
  };

  body.onclick = e => {
    const b = e.target.closest('[data-rev]');
    if (!b) return;
    const r = b.dataset.rev;
    p.reviews = (p.reviews || 0) + 1;
    p.level = r === 'ok' ? Math.min((p.level || 0) + 1, REVISAO_DIAS.length - 1) : r === 'dica' ? (p.level || 0) : 0;
    p.next = Date.now() + (r === 'nao' ? 1 : REVISAO_DIAS[p.level]) * DAY;
    toast(r === 'ok' ? 'Boa! Revisão mais espaçada.' : r === 'nao' ? 'Volta amanhã. Revise a ideia-chave.' : 'Mantido no mesmo intervalo');
    persist();
  };

  $('#probForm', body).onsubmit = e => {
    e.preventDefault();
    const v = id => $(id, body).value.trim();
    const before = p.status;
    Object.assign(p, {
      name: v('#pName'), site: v('#pSite'), diff: v('#pDiff'), pattern: v('#pPat'), status: v('#pStatus'),
      url: v('#pUrl'), idea: v('#pIdea'), time: Number(v('#pTime')) || '', notes: v('#pNotes'),
    });
    if (!p.name) return;
    // primeira revisão: travou → amanhã; resolveu → em 3 dias
    if (!p.next || before !== p.status) {
      p.level = 0;
      p.next = p.status === 'tentando' ? 0 : Date.now() + (p.status === 'travei' ? 1 : REVISAO_DIAS[0]) * DAY;
    }
    toast(existing ? 'Atualizado' : 'Registrado no diário ✔');
    persist();
  };
  const del = $('#pDel', body);
  if (del) del.onclick = () => {
    if (!confirm('Apagar este problema do diário?')) return;
    saveProblems(problems().filter(x => x.id !== p.id));
    closeSheet();
    renderPraticar($('#view'));
  };
}

/* ---------------- Radar ---------------- */

function radar(el) {
  const cats = ['todos', 'PT', 'Grátis', ...new Set(APPS.map(a => a[2]))];
  el.innerHTML = `
    <div class="notice">Levantamento dos sites mais citados por estudantes e devs. Preços e planos mudam: confira no site antes de assinar. Para começar do zero, prefira Beecrowd, Exercism ou CS50; para entrevista, NeetCode + LeetCode.</div>
    <div class="chips" id="appFilter">${cats.map(c => `<button type="button" class="chip ${appFilter === c ? 'on' : ''}" data-c="${esc(c)}">${c === 'todos' ? 'Todos' : c === 'PT' ? 'Em português' : c === 'Grátis' ? '100% grátis' : esc(c)}</button>`).join('')}</div>
    <div id="appList" class="grid2"></div>`;
  const draw = () => {
    const shown = APPS.filter(a => appFilter === 'todos'
      || (appFilter === 'PT' && a[4].includes('PT'))
      || (appFilter === 'Grátis' && a[3] === 'Grátis')
      || a[2] === appFilter);
    $('#appList', el).innerHTML = shown.map(([name, url, cat, price, lang, desc]) => `
      <div class="card app-card">
        <h3>${esc(name)}</h3>
        <div class="meta">${esc(cat)} · ${esc(price)} · ${esc(lang)}</div>
        <p>${esc(desc)}</p>
        <a class="btn soft small" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir site ↗</a>
      </div>`).join('');
  };
  $('#appFilter', el).onclick = e => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    appFilter = b.dataset.c;
    $$('#appFilter .chip', el).forEach(c => c.classList.toggle('on', c === b));
    draw();
  };
  draw();
}

/* ---------------- Trilha ---------------- */

function trilha(el) {
  const done = new Set(store.get('trilha', []));
  const total = TRILHA.reduce((a, [, items]) => a + items.length, 0);
  el.innerHTML = `
    <div class="card">
      <div class="row between"><b>Seu progresso</b><span id="trCount">${done.size} de ${total}</span></div>
      <div class="progress" style="margin-top:6px"><i id="trBar" style="width:${(done.size / total) * 100}%"></i></div>
    </div>
    ${TRILHA.map(([stage, items], s) => {
      const n = items.filter((_, i) => done.has(`${s}:${i}`)).length;
      return `<details class="acc" ${n < items.length && s === TRILHA.findIndex((st, k) => st[1].some((_, i) => !done.has(`${k}:${i}`))) ? 'open' : ''}>
        <summary>${s + 1}. ${esc(stage)} <small class="muted" data-stage="${s}">${n}/${items.length}</small></summary>
        <div class="acc-body">${items.map((it, i) => `<label style="display:flex;gap:10px;font-weight:500;margin:8px 0">
          <input type="checkbox" data-k="${s}:${i}" ${done.has(`${s}:${i}`) ? 'checked' : ''} style="width:20px;height:20px;flex:none" />${esc(it)}</label>`).join('')}</div>
      </details>`;
    }).join('')}
    <p class="muted" style="font-size:.8rem">Para trilhas detalhadas por área (back-end, dados, DevOps...), veja o roadmap.sh no Radar.</p>`;
  el.onchange = e => {
    const k = e.target.dataset.k;
    if (!k) return;
    e.target.checked ? done.add(k) : done.delete(k);
    store.set('trilha', [...done]);
    if (e.target.checked && done.size === total) toast('Trilha completa! 🚀');
    const s = Number(k.split(':')[0]);
    $(`[data-stage="${s}"]`, el).textContent = `${TRILHA[s][1].filter((_, i) => done.has(`${s}:${i}`)).length}/${TRILHA[s][1].length}`;
    $('#trCount', el).textContent = `${done.size} de ${total}`;
    $('#trBar', el).style.width = `${(done.size / total) * 100}%`;
  };
}
