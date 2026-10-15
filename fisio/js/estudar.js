// Estudar: cartões com repetição espaçada (caixas de Leitner) + mnemônicos para decorar

import { $, esc, uid, toast, store, openSheet, closeSheet } from './util.js';

// [pergunta, resposta]
export const DECKS = {
  mnemonicos: {
    name: 'Mnemônicos',
    cards: [
      ['Ossos do carpo (proximal → distal, lateral → medial)', 'Era Sábado, Paulo Pediu: Traz Teu Carro Hoje\nEscafoide, Semilunar, Piramidal, Pisiforme,\nTrapézio, Trapezoide, Capitato, Hamato'],
      ['12 pares de nervos cranianos', 'Olha O Ovo, Tia Teresa! A Fome Vem, Gente, Vamos Almoçar Hoje!\nOlfatório, Óptico, Oculomotor, Troclear, Trigêmeo, Abducente, Facial, Vestibulococlear, Glossofaríngeo, Vago, Acessório, Hipoglosso'],
      ['Partes do plexo braquial (proximal → distal)', 'Rita Tem Dois Filhos Rebeldes\nRaízes, Troncos, Divisões, Fascículos, Ramos'],
      ['Músculos do manguito rotador', 'SIRS\nSupraespinal, Infraespinal, Redondo menor, Subescapular'],
      ['Músculos da pata de ganso (anterior → posterior)', 'Sempre Gosto de Sorvete\nSartório, Grácil, Semitendíneo'],
      ['Reflexos tendíneos e raízes', '1-2, amarra o sapato: aquileu S1–S2\n3-4, chuta a porta: patelar L3–L4\n5-6, pega os paus: bicipital/braquiorradial C5–C6\n7-8, fecha o portão: tricipital C7–C8'],
      ['Músculos isquiotibiais', 'Semitendíneo, semimembranáceo e bíceps femoral (cabeça longa)'],
      ['Componentes do quadríceps', 'Reto femoral, vasto lateral, vasto medial e vasto intermédio'],
      ['Sinais de insuficiência vertebrobasilar ("5 D e 3 N")', 'Dizziness (tontura), Diplopia, Disartria, Disfagia, Drop attacks (quedas)\nNáusea, Nistagmo, Numbness (dormência)'],
    ],
  },
  dermatomos: {
    name: 'Dermátomos e miótomos',
    cards: [
      ['Dermátomo C6', 'Polegar e borda lateral do antebraço'],
      ['Dermátomo C7', 'Dedo médio'],
      ['Dermátomo C8', 'Dedo mínimo e borda medial da mão'],
      ['Dermátomo T4', 'Linha dos mamilos'],
      ['Dermátomo T10', 'Umbigo'],
      ['Dermátomo L4', 'Face medial da perna e maléolo medial'],
      ['Dermátomo L5', 'Dorso do pé e hálux'],
      ['Dermátomo S1', 'Borda lateral do pé e calcanhar'],
      ['Miótomo C5', 'Abdução do ombro'],
      ['Miótomo C6', 'Flexão do cotovelo e extensão do punho'],
      ['Miótomo C7', 'Extensão do cotovelo e flexão do punho'],
      ['Miótomo C8', 'Flexão dos dedos'],
      ['Miótomo T1', 'Abdução dos dedos'],
      ['Miótomo L2', 'Flexão do quadril'],
      ['Miótomo L3', 'Extensão do joelho'],
      ['Miótomo L4', 'Dorsiflexão do tornozelo'],
      ['Miótomo L5', 'Extensão do hálux'],
      ['Miótomo S1', 'Flexão plantar / eversão'],
    ],
  },
  inervacao: {
    name: 'Inervação muscular',
    cards: [
      ['Deltoide', 'Nervo axilar (C5–C6)'],
      ['Redondo menor', 'Nervo axilar (C5–C6)'],
      ['Supraespinal e infraespinal', 'Nervo supraescapular (C5–C6)'],
      ['Subescapular', 'Nervos subescapulares superior e inferior (C5–C6)'],
      ['Serrátil anterior', 'Nervo torácico longo (C5–C7)'],
      ['Trapézio', 'Nervo acessório (NC XI)'],
      ['Latíssimo do dorso', 'Nervo toracodorsal (C6–C8)'],
      ['Bíceps braquial', 'Nervo musculocutâneo (C5–C6)'],
      ['Tríceps braquial', 'Nervo radial (C6–C8)'],
      ['Quadríceps femoral', 'Nervo femoral (L2–L4)'],
      ['Adutores do quadril', 'Principalmente nervo obturatório (L2–L4)'],
      ['Glúteo máximo', 'Nervo glúteo inferior (L5–S2)'],
      ['Glúteo médio e mínimo', 'Nervo glúteo superior (L4–S1)'],
      ['Isquiotibiais', 'Nervo isquiático (porção tibial); cabeça curta do bíceps femoral: porção fibular'],
      ['Tibial anterior', 'Nervo fibular profundo (L4–L5)'],
      ['Gastrocnêmio e sóleo', 'Nervo tibial (S1–S2)'],
    ],
  },
  lesoes: {
    name: 'Lesões e sinais clássicos',
    cards: [
      ['Mão caída (punho caído)', 'Lesão do nervo radial'],
      ['Mão em garra', 'Lesão do nervo ulnar'],
      ['Mão de bênção / de pregador', 'Lesão do nervo mediano (alta)'],
      ['Pé caído e marcha escarvante', 'Lesão do nervo fibular comum (ou raiz L5)'],
      ['Escápula alada medial', 'Lesão do nervo torácico longo (serrátil anterior)'],
      ['Sinal de Trendelenburg positivo', 'Fraqueza do glúteo médio (abdutores) do lado de apoio'],
      ['Marcha ceifante', 'Hemiparesia espástica (ex.: pós-AVC)'],
      ['Marcha festinante / em bloco', 'Doença de Parkinson'],
      ['Fases da marcha', 'Apoio (~60%): contato inicial, resposta à carga, médio apoio, apoio terminal, pré-balanço\nBalanço (~40%): inicial, médio, terminal'],
    ],
  },
  testes: {
    name: 'Testes especiais',
    cards: [
      ['Teste de Lachman', 'Integridade do ligamento cruzado anterior (LCA)'],
      ['Gaveta posterior do joelho', 'Ligamento cruzado posterior (LCP)'],
      ['Teste de McMurray', 'Lesão de menisco'],
      ['Estresse em valgo do joelho', 'Ligamento colateral medial'],
      ['Teste de Thompson', 'Ruptura do tendão do calcâneo (Aquiles)'],
      ['Gaveta anterior do tornozelo', 'Ligamento talofibular anterior'],
      ['Testes de Neer e Hawkins-Kennedy', 'Dor subacromial (impacto)'],
      ['Teste de Jobe (lata vazia)', 'Supraespinal'],
      ['Teste de Speed', 'Cabeça longa do bíceps'],
      ['Teste de apreensão do ombro', 'Instabilidade anterior do ombro'],
      ['Teste de Spurling', 'Radiculopatia cervical'],
      ['Lasègue (elevação da perna estendida)', 'Tensão neural / radiculopatia lombar (raízes L5–S1)'],
      ['Teste de Slump', 'Mecanossensibilidade neural'],
      ['Teste de Thomas', 'Encurtamento dos flexores do quadril'],
      ['FABER (Patrick)', 'Quadril ou articulação sacroilíaca'],
      ['FADIR', 'Impacto femoroacetabular / lesão labral'],
      ['Teste de Ober', 'Encurtamento do trato iliotibial'],
      ['Phalen e Tinel no punho', 'Síndrome do túnel do carpo (nervo mediano)'],
      ['Teste de Finkelstein', 'Tenossinovite de De Quervain'],
    ],
  },
};

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]; // caixa 1 a 5 (índice 0 não usado)
const DAY = 86_400_000;

let deckKey = store.get('deck', 'mnemonicos');
let current = null;
let showAnswer = false;

function allDecks() {
  const custom = store.get('customCards', []);
  return { ...DECKS, meus: { name: 'Meus cartões', cards: custom.map(c => [c.q, c.a, c.id]) } };
}

// id estável de cada cartão = deck + índice (ou id do cartão criado)
const cardId = (deck, card, i) => card[2] || `${deck}:${i}`;

function progress() { return store.get('leitner', {}); }

function dueCards(deck) {
  const p = progress();
  const now = Date.now();
  return allDecks()[deck].cards
    .map((c, i) => ({ q: c[0], a: c[1], id: cardId(deck, c, i), st: p[cardId(deck, c, i)] || { box: 1, due: 0 } }))
    .filter(c => c.st.due <= now)
    .sort((a, b) => a.st.box - b.st.box || a.st.due - b.st.due);
}

function boxCounts(deck) {
  const p = progress();
  const counts = [0, 0, 0, 0, 0];
  allDecks()[deck].cards.forEach((c, i) => { counts[(p[cardId(deck, c, i)]?.box || 1) - 1]++; });
  return counts;
}

export function renderEstudar(root) {
  const decks = allDecks();
  if (!decks[deckKey]) deckKey = 'mnemonicos';
  const due = dueCards(deckKey);
  current = due[0] || null;
  showAnswer = false;
  const counts = boxCounts(deckKey);

  root.innerHTML = `
    <h1>Estudar e decorar</h1>
    <p class="muted">Cartões com repetição espaçada: o que você erra volta logo, o que você acerta volta depois de alguns dias.</p>
    <div class="chips" id="deckChips">
      ${Object.entries(decks).map(([k, d]) => `<button type="button" class="chip ${k === deckKey ? 'on' : ''}" data-d="${k}">${esc(d.name)} (${d.cards.length})</button>`).join('')}
    </div>

    <div class="boxes" aria-label="Cartões por caixa">
      ${counts.map((n, i) => `<span><b>${n}</b>${i === 0 ? 'Novos/errados' : i === 4 ? 'Dominados' : 'Caixa ' + (i + 1)}</span>`).join('')}
    </div>

    <div class="card flash" id="flash" style="margin-top:12px" tabindex="0" role="button" aria-label="Virar cartão"></div>
    <div class="row" id="answerBtns" style="justify-content:center"></div>
    <p class="muted" style="text-align:center;font-size:.85rem" id="dueInfo"></p>

    <div class="row" style="margin-top:8px">
      <button type="button" class="soft" id="newCard">＋ Criar cartão</button>
      <button type="button" class="ghost small" id="resetDeck">Recomeçar este baralho</button>
    </div>

    <h2>Dicas para decorar de verdade</h2>
    <div class="card">
      <ul>
        <li><b>Teste-se</b> em vez de só reler: tentar lembrar é o que fixa (prática de recuperação).</li>
        <li><b>Espace</b> as revisões: 15 min por dia vencem 3 h na véspera.</li>
        <li><b>Palpe em você</b> ou em um colega cada músculo que estudar: origem, inserção e ação no corpo vivo.</li>
        <li><b>Desenhe</b> plexos e trajetos nervosos de memória e confira depois.</li>
        <li><b>Explique em voz alta</b> como se fosse para um paciente (técnica Feynman).</li>
        <li><b>Misture</b> os assuntos na revisão (intercalação) em vez de estudar um bloco só.</li>
      </ul>
    </div>
  `;

  $('#deckChips').onclick = e => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    deckKey = b.dataset.d;
    store.set('deck', deckKey);
    renderEstudar(root);
  };
  $('#flash').onclick = flip;
  $('#flash').onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
  $('#newCard').onclick = () => openNewCard(root);
  $('#resetDeck').onclick = () => {
    if (!confirm('Voltar todos os cartões deste baralho para a caixa 1?')) return;
    const p = progress();
    allDecks()[deckKey].cards.forEach((c, i) => delete p[cardId(deckKey, c, i)]);
    store.set('leitner', p);
    renderEstudar(root);
  };
  drawCard(root);

  function flip() {
    if (!current) return;
    showAnswer = !showAnswer;
    drawCard(root);
  }
}

function drawCard(root) {
  const flash = $('#flash');
  const btns = $('#answerBtns');
  const total = allDecks()[deckKey].cards.length;
  const due = dueCards(deckKey).length;
  $('#dueInfo').textContent = total ? `${due} para revisar agora` : '';

  if (!total) {
    flash.innerHTML = `<p class="muted">Nenhum cartão aqui ainda.<br>Crie os seus com o botão abaixo — ótimo para conteúdo da sua prova.</p>`;
    btns.innerHTML = '';
    return;
  }
  if (!current) {
    const p = progress();
    const next = Math.min(...allDecks()[deckKey].cards.map((c, i) => p[cardId(deckKey, c, i)]?.due || 0));
    flash.innerHTML = `<div class="q">Tudo revisado! 🎉</div><p class="muted">Próxima revisão ${next ? 'em ' + new Date(next).toLocaleDateString('pt-BR') : 'quando quiser'}.</p>`;
    btns.innerHTML = '';
    return;
  }
  flash.innerHTML = `<div class="q">${esc(current.q)}</div>${showAnswer ? `<div class="a">${esc(current.a)}</div>` : '<p class="muted" style="margin-top:12px">Toque para ver a resposta</p>'}`;
  btns.innerHTML = showAnswer
    ? `<button type="button" class="danger" data-ans="0">Errei</button><button type="button" class="soft" data-ans="1">Quase</button><button type="button" data-ans="2">Acertei</button>`
    : '';
  btns.onclick = e => {
    const b = e.target.closest('[data-ans]');
    if (!b) return;
    const p = progress();
    const st = p[current.id] || { box: 1, due: 0 };
    const ans = Number(b.dataset.ans);
    st.box = ans === 0 ? 1 : ans === 1 ? Math.max(1, st.box) : Math.min(5, st.box + 1);
    st.due = Date.now() + INTERVAL_DAYS[st.box] * DAY;
    // errado volta ainda nesta sessão, alguns segundos depois
    if (ans === 0) st.due = Date.now() + 30_000;
    p[current.id] = st;
    store.set('leitner', p);
    renderEstudar(root);
  };
}

function openNewCard(root) {
  const body = openSheet('Novo cartão', `
    <form id="cardForm">
      <label for="cQ">Frente (pergunta)</label>
      <textarea id="cQ" required placeholder="Ex.: Origem do músculo sartório"></textarea>
      <label for="cA">Verso (resposta)</label>
      <textarea id="cA" required placeholder="Ex.: Espinha ilíaca anterossuperior (EIAS)"></textarea>
      <button type="submit" style="width:100%;margin-top:12px">Salvar em "Meus cartões"</button>
    </form>`);
  $('#cardForm', body).onsubmit = e => {
    e.preventDefault();
    const q = $('#cQ', body).value.trim();
    const a = $('#cA', body).value.trim();
    if (!q || !a) return;
    const list = store.get('customCards', []);
    list.push({ id: 'meu:' + uid(), q, a });
    store.set('customCards', list);
    deckKey = 'meus';
    store.set('deck', deckKey);
    closeSheet();
    toast('Cartão criado');
    renderEstudar(root);
  };
}
