// Casa: radar de apps de exercícios domiciliares + montador de ficha para mandar ao paciente

import { $, esc, uid, toast, store, openSheet, closeSheet, shareText, copyText } from './util.js';

// Conferido em out/2026. Preços e recursos mudam: o app mostra a data e o link oficial.
const RADAR = [
  { n: 'Physitrack + PhysiApp', tipo: 'Prescrição', site: 'https://www.physitrack.com', para: 'Clínicas e autônomos', plat: 'Web · iOS · Android', preco: 'Pago (teste grátis de 14 dias)', pt: true,
    d: 'Biblioteca com milhares de vídeos de exercícios, o paciente recebe o programa no app PhysiApp, registra o que fez e a dor. Tem telessaúde e questionários.' },
  { n: 'MedBridge', tipo: 'Prescrição', site: 'https://www.medbridge.com', para: 'Clínicas (foco nos EUA)', plat: 'Web · iOS · Android', preco: 'Pago (assinatura anual)', pt: false,
    d: 'Programa de exercícios domiciliares junto com cursos de educação continuada na mesma assinatura.' },
  { n: 'Wibbi', tipo: 'Prescrição', site: 'https://www.wibbi.com', para: 'Autônomos e clínicas pequenas', plat: 'Web · iOS · Android', preco: 'Pago (mensal)', pt: false,
    d: 'Grande biblioteca de exercícios e integrações com prontuários. Prescrição simples.' },
  { n: 'HEP2go', tipo: 'Prescrição', site: 'https://www.hep2go.com', para: 'Estudantes e autônomos', plat: 'Navegador', preco: 'Gratuito (versão Pro paga)', pt: false,
    d: 'O mais barato: monta e imprime/manda fichas com imagens. Recursos mais simples e sem integração com prontuário.' },
  { n: 'Rehab My Patient', tipo: 'Prescrição', site: 'https://www.rehabmypatient.com', para: 'Autônomos', plat: 'Web · iOS · Android', preco: 'Pago (com período de teste)', pt: false,
    d: 'Vídeos em HD, permite subir suas próprias imagens e folhetos de orientação; tem teleatendimento.' },
  { n: 'SimpleSet', tipo: 'Prescrição', site: 'https://www.simpleset.net', para: 'Autônomos, clínicas e redes', plat: 'Web · iOS · Android', preco: 'Pago (planos por porte)', pt: false,
    d: 'App do paciente com lembretes e registro de séries, repetições e tempo (adesão).' },
  { n: 'Fisioly', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=Fisioly+fisioterapia', busca: true, para: 'Autônomos e clínicas', plat: 'Web', preco: 'Plano gratuito para autônomos', pt: true,
    d: 'Agenda, prontuário e financeiro feitos para fisioterapia no Brasil.' },
  { n: 'Vedius', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=Vedius+fisioterapia', busca: true, para: 'Clínicas', plat: 'Web · app', preco: 'Pago', pt: true,
    d: 'Agenda, financeiro e prontuário pensado para as exigências do COFFITO.' },
  { n: 'ZenFisio', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=ZenFisio+fisioterapia', busca: true, para: 'Clínicas', plat: 'Web', preco: 'Pago', pt: true,
    d: 'Gestão de clínica com emissão de nota fiscal de serviço (NFS-e).' },
];

// Biblioteca básica de exercícios para montar a ficha (o fisio ajusta a dose)
const EXERCICIOS = [
  { r: 'Joelho', n: 'Isometria de quadríceps', d: 'Deitado, joelho esticado com uma toalha enrolada embaixo. Aperte o joelho contra a toalha, segure e solte.', dose: '10 × 10 s' },
  { r: 'Joelho', n: 'Deslizamento do calcanhar', d: 'Deitado, dobre o joelho arrastando o calcanhar na cama e volte devagar.', dose: '3 × 10' },
  { r: 'Joelho', n: 'Elevação da perna estendida', d: 'Deitado, uma perna dobrada. Com o joelho da outra bem esticado, suba até a altura do outro joelho e desça devagar.', dose: '3 × 10' },
  { r: 'Joelho', n: 'Sentar e levantar da cadeira', d: 'Pés na largura do quadril, levante sem usar as mãos (se conseguir) e sente devagar.', dose: '3 × 10' },
  { r: 'Joelho', n: 'Mini agachamento na parede', d: 'Costas na parede, desça até onde for confortável (sem passar de 60°) e suba.', dose: '3 × 12' },
  { r: 'Tornozelo', n: 'Bomba de tornozelo', d: 'Mexa os pés para cima e para baixo, ritmado. Ajuda a circulação.', dose: '20 × a cada hora' },
  { r: 'Tornozelo', n: 'Elevação dos calcanhares', d: 'Em pé, apoiado na pia ou parede, suba na ponta dos pés e desça devagar.', dose: '3 × 15' },
  { r: 'Quadril', n: 'Ponte', d: 'Deitado, joelhos dobrados. Suba o quadril até alinhar com o tronco, segure 2 s e desça.', dose: '3 × 12' },
  { r: 'Quadril', n: 'Abdução deitado de lado', d: 'Deitado de lado, perna de cima esticada. Suba a perna sem rodar o quadril e desça devagar.', dose: '3 × 12' },
  { r: 'Quadril', n: 'Concha (clamshell)', d: 'Deitado de lado, joelhos dobrados e pés juntos. Abra o joelho de cima sem girar o tronco.', dose: '3 × 15' },
  { r: 'Coluna', n: 'Gato e camelo', d: 'Em quatro apoios, arredonde as costas olhando para o umbigo e depois afunde levemente olhando para frente.', dose: '2 × 10' },
  { r: 'Coluna', n: 'Perdigueiro (bird-dog)', d: 'Em quatro apoios, estique braço e perna opostos sem deixar o quadril rodar. Alterne.', dose: '3 × 8 cada lado' },
  { r: 'Coluna', n: 'Prancha', d: 'Apoiado nos antebraços e pontas dos pés (ou joelhos), corpo alinhado, respirando normalmente.', dose: '3 × 20–30 s' },
  { r: 'Coluna', n: 'Joelhos ao peito', d: 'Deitado, abrace os joelhos e traga em direção ao peito com calma.', dose: '3 × 30 s' },
  { r: 'Ombro', n: 'Pendular (Codman)', d: 'Inclinado à frente, apoiado na mesa, deixe o braço solto e faça pequenos círculos.', dose: '1 min cada sentido' },
  { r: 'Ombro', n: 'Rotação externa com elástico', d: 'Cotovelo colado ao corpo a 90°, gire o antebraço para fora contra o elástico e volte devagar.', dose: '3 × 12' },
  { r: 'Ombro', n: 'Deslizamento na parede', d: 'De frente para a parede, deslize as mãos para cima até onde for confortável e desça.', dose: '2 × 10' },
  { r: 'Ombro', n: 'Retração das escápulas', d: 'Sentado com a coluna ereta, aproxime as escápulas, segure 3 s e solte.', dose: '3 × 10' },
  { r: 'Cervical', n: 'Retração do queixo', d: 'Olhando para frente, leve o queixo para trás como se fizesse "papada", segure 3 s.', dose: '10 ×' },
  { r: 'Equilíbrio', n: 'Apoio em uma perna', d: 'Perto de um apoio seguro, fique em uma perna só. Progrida para olhos fechados só com orientação.', dose: '3 × 30 s cada' },
  { r: 'Respiratório', n: 'Respiração diafragmática', d: 'Mão na barriga, puxe o ar pelo nariz enchendo a barriga e solte devagar pela boca com lábios franzidos.', dose: '10 respirações, 3× ao dia' },
  { r: 'Mobilidade', n: 'Alongamento de isquiotibiais', d: 'Sentado na beira da cadeira, perna esticada com o calcanhar no chão, incline o tronco à frente com a coluna reta.', dose: '3 × 30 s' },
];

let radarFilter = 'todos';

export function renderCasa(root) {
  const sheets = store.get('fichas', []);
  const myApps = store.get('radarMeus', []);
  const notes = store.get('radarNotas', {});
  const apps = [...RADAR, ...myApps.map(a => ({ ...a, meu: true }))];
  const shown = apps.filter(a => radarFilter === 'todos' || (radarFilter === 'pt' ? a.pt : a.tipo === radarFilter));

  root.innerHTML = `
    <h1>Exercícios em casa</h1>
    <p class="muted">Monte a ficha do paciente aqui mesmo e mande pelo WhatsApp, ou compare os apps que fisioterapeutas usam para prescrever.</p>

    <div class="row between"><h2 style="margin:0">Fichas de exercícios</h2><button type="button" id="newSheet">＋ Nova ficha</button></div>
    <div style="margin-top:10px">
      ${sheets.length ? sheets.map(s => `
        <div class="card row between">
          <div><b>${esc(s.paciente || 'Sem nome')}</b><br><small class="muted">${s.itens.length} exercícios · ${esc(s.data)}</small></div>
          <div class="row">
            <button type="button" class="small" data-share="${s.id}">Enviar</button>
            <button type="button" class="ghost small" data-edit="${s.id}">Editar</button>
          </div>
        </div>`).join('') : `<div class="card empty"><div class="big">🏋️</div><p>Nenhuma ficha ainda. Monte com exercícios prontos ou escreva os seus.</p></div>`}
    </div>

    <h2>Radar de apps</h2>
    <div class="chips" id="radarChips">
      ${[['todos', 'Todos'], ['Prescrição', 'Prescrição de exercícios'], ['Gestão (Brasil)', 'Gestão de clínica (BR)'], ['pt', 'Em português']].map(([k, l]) => `<button type="button" class="chip ${radarFilter === k ? 'on' : ''}" data-rf="${esc(k)}">${l}</button>`).join('')}
    </div>
    <div class="grid2">
      ${shown.map(a => `
        <div class="card app-card">
          <div class="row between"><h3>${esc(a.n)}</h3>${a.pt ? '<span class="tag ok">PT-BR</span>' : '<span class="tag">Inglês</span>'}</div>
          <div class="meta">${esc(a.tipo)} · ${esc(a.plat || '')} · ${esc(a.para || '')}</div>
          <p>${esc(a.d || '')}</p>
          <p style="font-size:.85rem"><b>Preço:</b> ${esc(a.preco || '—')}</p>
          <label for="note-${esc(a.n)}" style="font-size:.78rem">Minha avaliação</label>
          <select id="note-${esc(a.n)}" data-note="${esc(a.n)}">
            ${['', 'Quero testar', 'Testando', 'Uso e recomendo', 'Não gostei'].map(o => `<option value="${o}" ${(notes[a.n] || '') === o ? 'selected' : ''}>${o || '— sem avaliação —'}</option>`).join('')}
          </select>
          <div class="row" style="margin-top:8px">
            ${a.site ? `<a class="btn small soft" href="${esc(a.site)}" target="_blank" rel="noopener noreferrer">${a.busca ? 'Pesquisar ↗' : 'Abrir site ↗'}</a>` : ''}
            ${a.meu ? `<button type="button" class="ghost small" data-rm-app="${esc(a.id)}">Remover</button>` : ''}
          </div>
        </div>`).join('')}
    </div>
    <div class="row" style="margin-top:4px"><button type="button" class="soft" id="addApp">＋ Adicionar app ao radar</button></div>
    <p class="muted" style="font-size:.8rem">Informações conferidas em outubro de 2026 nos sites dos fornecedores e em comparativos; preços e recursos mudam, confira antes de assinar. Ao mandar vídeos ou dados de pacientes por qualquer app, siga a LGPD e as resoluções do COFFITO sobre teleatendimento.</p>
  `;

  $('#newSheet').onclick = () => openSheetEditor(root);
  root.querySelectorAll('[data-edit]').forEach(b => { b.onclick = () => openSheetEditor(root, sheets.find(s => s.id === b.dataset.edit)); });
  root.querySelectorAll('[data-share]').forEach(b => {
    b.onclick = () => {
      const s = sheets.find(x => x.id === b.dataset.share);
      shareText('Seus exercícios', sheetText(s));
    };
  });
  $('#radarChips').onclick = e => {
    const b = e.target.closest('[data-rf]');
    if (!b) return;
    radarFilter = b.dataset.rf;
    renderCasa(root);
  };
  root.querySelectorAll('[data-note]').forEach(sel => {
    sel.onchange = () => { const n = store.get('radarNotas', {}); n[sel.dataset.note] = sel.value; store.set('radarNotas', n); toast('Anotado'); };
  });
  root.querySelectorAll('[data-rm-app]').forEach(b => {
    b.onclick = () => { store.set('radarMeus', myApps.filter(a => a.id !== b.dataset.rmApp)); renderCasa(root); };
  });
  $('#addApp').onclick = () => openAddApp(root);
}

function sheetText(s) {
  const lines = [
    `*Exercícios para casa${s.paciente ? ' · ' + s.paciente : ''}*`,
    s.freq ? `Frequência: ${s.freq}` : '',
    '',
    ...s.itens.map((it, i) => `*${i + 1}. ${it.n}* (${it.dose})\n${it.d}`),
    '',
    s.obs ? `Observações: ${s.obs}` : '',
    'Dor durante o exercício: até 5 de 0 a 10 é aceitável se passar até o dia seguinte. Se piorar muito, pare e me avise.',
    s.prof ? `\n${s.prof}` : '',
  ];
  return lines.filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n').trim();
}

function openSheetEditor(root, existing) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), paciente: '', freq: '1× ao dia, 5 dias por semana', obs: '', prof: store.get('profAssinatura', ''), itens: [], data: new Date().toLocaleDateString('pt-BR') };
  const regions = [...new Set(EXERCICIOS.map(e => e.r))];

  const body = openSheet(existing ? 'Editar ficha' : 'Nova ficha', `
    <label for="shPac">Paciente (primeiro nome ou apelido)</label>
    <input id="shPac" value="${esc(s.paciente)}" />
    <label for="shFreq">Frequência</label>
    <input id="shFreq" value="${esc(s.freq)}" />

    <h3 style="margin-top:14px">Exercícios na ficha</h3>
    <div id="shItems"></div>

    <label for="shReg">Adicionar exercício pronto</label>
    <div class="row" style="flex-wrap:nowrap">
      <select id="shReg">${regions.map(r => `<optgroup label="${esc(r)}">${EXERCICIOS.map((e, i) => e.r === r ? `<option value="${i}">${esc(e.n)}</option>` : '').join('')}</optgroup>`).join('')}</select>
      <button type="button" class="soft" id="shAdd">Adicionar</button>
    </div>
    <button type="button" class="ghost small" id="shCustom" style="margin-top:8px">＋ Escrever exercício próprio</button>

    <label for="shObs">Observações</label>
    <textarea id="shObs" placeholder="Ex.: usar gelo 15 min depois; parar se sentir formigamento.">${esc(s.obs)}</textarea>
    <label for="shProf">Assinatura (seu nome e CREFITO)</label>
    <input id="shProf" value="${esc(s.prof)}" placeholder="Ex.: Dra. Ana Lima · CREFITO-3 000000-F" />

    <div class="row" style="margin-top:14px">
      <button type="button" id="shSave">Salvar</button>
      <button type="button" class="soft" id="shSend">Salvar e enviar</button>
      <button type="button" class="ghost" id="shCopy">Copiar texto</button>
      ${existing ? '<button type="button" class="ghost" id="shDel" style="color:var(--bad);border-color:var(--bad)">Apagar</button>' : ''}
    </div>
  `);

  const drawItems = () => {
    $('#shItems', body).innerHTML = s.itens.length
      ? s.itens.map((it, i) => `<div class="ex-item">
          <div><b>${esc(it.n)}</b><br><small class="muted">${esc(it.d)}</small>
            <input data-dose="${i}" value="${esc(it.dose)}" aria-label="Dose" style="margin-top:6px;padding:6px 10px" /></div>
          <button type="button" class="ghost small" data-rm="${i}" aria-label="Remover">✕</button>
        </div>`).join('')
      : '<p class="muted">Nenhum exercício ainda.</p>';
  };
  drawItems();
  $('#shItems', body).onclick = e => {
    const b = e.target.closest('[data-rm]');
    if (b) { s.itens.splice(Number(b.dataset.rm), 1); drawItems(); }
  };
  $('#shItems', body).oninput = e => {
    if (e.target.dataset.dose != null) s.itens[Number(e.target.dataset.dose)].dose = e.target.value;
  };
  $('#shAdd', body).onclick = () => {
    const ex = EXERCICIOS[Number($('#shReg', body).value)];
    s.itens.push({ n: ex.n, d: ex.d, dose: ex.dose });
    drawItems();
  };
  $('#shCustom', body).onclick = () => {
    const n = prompt('Nome do exercício');
    if (!n) return;
    const d = prompt('Como fazer (explique de forma simples)') || '';
    const dose = prompt('Séries × repetições ou tempo', '3 × 10') || '';
    s.itens.push({ n, d, dose });
    drawItems();
  };

  const collect = () => {
    s.paciente = $('#shPac', body).value.trim();
    s.freq = $('#shFreq', body).value.trim();
    s.obs = $('#shObs', body).value.trim();
    s.prof = $('#shProf', body).value.trim();
    store.set('profAssinatura', s.prof);
  };
  const save = () => {
    collect();
    if (!s.itens.length) { toast('Adicione pelo menos um exercício'); return false; }
    const list = store.get('fichas', []).filter(x => x.id !== s.id);
    list.unshift(s);
    store.set('fichas', list);
    return true;
  };
  $('#shSave', body).onclick = () => { if (save()) { closeSheet(); toast('Ficha salva'); renderCasa(root); } };
  $('#shSend', body).onclick = () => { if (save()) { shareText('Seus exercícios', sheetText(s)); closeSheet(); renderCasa(root); } };
  $('#shCopy', body).onclick = () => { collect(); copyText(sheetText(s)); };
  const del = $('#shDel', body);
  if (del) del.onclick = () => {
    if (!confirm('Apagar esta ficha?')) return;
    store.set('fichas', store.get('fichas', []).filter(x => x.id !== s.id));
    closeSheet();
    renderCasa(root);
  };
}

function openAddApp(root) {
  const body = openSheet('Adicionar ao radar', `
    <form id="appForm">
      <label for="aN">Nome do app</label><input id="aN" required />
      <label for="aT">Tipo</label>
      <select id="aT"><option>Prescrição</option><option>Gestão (Brasil)</option><option>Estudo</option><option>Avaliação</option></select>
      <label for="aS">Site ou link da loja</label><input id="aS" type="url" placeholder="https://..." />
      <label for="aP">Preço</label><input id="aP" placeholder="Ex.: grátis, R$ 49/mês" />
      <label for="aD">O que ele faz / por que vale a pena</label><textarea id="aD"></textarea>
      <label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="aPt" style="width:20px;height:20px" /> Tem português</label>
      <button type="submit" style="width:100%;margin-top:12px">Adicionar</button>
    </form>`);
  $('#appForm', body).onsubmit = e => {
    e.preventDefault();
    const site = $('#aS', body).value.trim();
    const list = store.get('radarMeus', []);
    list.push({
      id: uid(), n: $('#aN', body).value.trim(), tipo: $('#aT', body).value,
      site: /^https?:\/\//.test(site) ? site : '', preco: $('#aP', body).value.trim(),
      d: $('#aD', body).value.trim(), pt: $('#aPt', body).checked, plat: '', para: 'Adicionado por você',
    });
    store.set('radarMeus', list);
    closeSheet();
    renderCasa(root);
  };
}
