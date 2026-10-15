// Casa: programas de exercícios domiciliares (fisio monta → paciente recebe link →
// relatório volta) + radar de apps de prescrição

import { $, $$, esc, uid, toast, store, openSheet, closeSheet, shareText, copyText } from './util.js';
import { EXERCICIOS, MODELOS, DIAS, ORIENTACOES, byId, encodeData, decodeData, appBase, programPayload, adherence } from './exercicios.js';

// Conferido em out/2026. Preços e recursos mudam: o app mostra a data e o link oficial.
const RADAR = [
  { n: 'Physitrack + PhysiApp', aqui: 'Programas com link para o paciente, registro de dor e adesão.', tipo: 'Prescrição', site: 'https://www.physitrack.com', para: 'Clínicas e autônomos', plat: 'Web · iOS · Android', preco: 'Pago (teste grátis de 14 dias)', pt: true,
    d: 'Biblioteca com milhares de vídeos de exercícios, o paciente recebe o programa no app PhysiApp, registra o que fez e a dor. Tem telessaúde e questionários.' },
  { n: 'MedBridge', aqui: 'Programas de exercícios + aba Estudar.', tipo: 'Prescrição', site: 'https://www.medbridge.com', para: 'Clínicas (foco nos EUA)', plat: 'Web · iOS · Android', preco: 'Pago (assinatura anual)', pt: false,
    d: 'Programa de exercícios domiciliares junto com cursos de educação continuada na mesma assinatura.' },
  { n: 'Wibbi', aqui: 'Biblioteca com busca e modelos prontos.', tipo: 'Prescrição', site: 'https://www.wibbi.com', para: 'Autônomos e clínicas pequenas', plat: 'Web · iOS · Android', preco: 'Pago (mensal)', pt: false,
    d: 'Grande biblioteca de exercícios e integrações com prontuários. Prescrição simples.' },
  { n: 'HEP2go', aqui: 'Ficha em texto para imprimir ou mandar.', tipo: 'Prescrição', site: 'https://www.hep2go.com', para: 'Estudantes e autônomos', plat: 'Navegador', preco: 'Gratuito (versão Pro paga)', pt: false,
    d: 'O mais barato: monta e imprime/manda fichas com imagens. Recursos mais simples e sem integração com prontuário.' },
  { n: 'Rehab My Patient', aqui: 'Vídeo próprio por exercício, orientações prontas e teleconsulta pela agenda.', tipo: 'Prescrição', site: 'https://www.rehabmypatient.com', para: 'Autônomos', plat: 'Web · iOS · Android', preco: 'Pago (com período de teste)', pt: false,
    d: 'Vídeos em HD, permite subir suas próprias imagens e folhetos de orientação; tem teleatendimento.' },
  { n: 'SimpleSet', aqui: 'Tela do paciente com séries, cronômetro, lembrete e histórico.', tipo: 'Prescrição', site: 'https://www.simpleset.net', para: 'Autônomos, clínicas e redes', plat: 'Web · iOS · Android', preco: 'Pago (planos por porte)', pt: false,
    d: 'App do paciente com lembretes e registro de séries, repetições e tempo (adesão).' },
  { n: 'Fisioly', aqui: 'Agenda, prontuário e financeiro na aba Clínica.', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=Fisioly+fisioterapia', busca: true, para: 'Autônomos e clínicas', plat: 'Web', preco: 'Plano gratuito para autônomos', pt: true,
    d: 'Agenda, prontuário e financeiro feitos para fisioterapia no Brasil.' },
  { n: 'Vedius', aqui: 'Agenda com confirmação por WhatsApp e prontuário com evolução SOAP.', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=Vedius+fisioterapia', busca: true, para: 'Clínicas', plat: 'Web · app', preco: 'Pago', pt: true,
    d: 'Agenda, financeiro e prontuário pensado para as exigências do COFFITO.' },
  { n: 'ZenFisio', aqui: 'Financeiro e recibos (sem emissão de nota fiscal).', tipo: 'Gestão (Brasil)', site: 'https://www.google.com/search?q=ZenFisio+fisioterapia', busca: true, para: 'Clínicas', plat: 'Web', preco: 'Pago', pt: true,
    d: 'Gestão de clínica com emissão de nota fiscal de serviço (NFS-e).' },
];

let radarFilter = 'todos';

const freqText = s => {
  const dias = s.dias?.length && s.dias.length < 7 ? s.dias.map(d => DIAS[d]).join(', ') : 'todos os dias';
  return `${s.vezes || 1}× ao dia, ${dias}`;
};

// Re-desenha a sub-tela atual depois de salvar/apagar (programas ou radar)
let current = () => {};

const adTag = s => {
  const logs = s.relatorios || [];
  if (!logs.length) return '<span class="tag">Sem relatório ainda</span>';
  const ad = adherence(logs, s.dias, s.vezes);
  return `<span class="tag ${ad >= 80 ? 'ok' : ad >= 50 ? 'warn' : 'bad'}">${ad}% adesão (7 dias)</span>`;
};

export function programCard(s) {
  const last = (s.relatorios || []).at(-1);
  return `
    <div class="card">
      <div class="row between">
        <div><b>${esc(s.paciente || 'Sem nome')}</b><br><small class="muted">${s.itens.length} exercícios · ${esc(s.freq || '')} · criado em ${esc(s.data)}</small></div>
        ${adTag(s)}
      </div>
      ${last ? `<p class="muted" style="font-size:.84rem;margin:.4rem 0 0">Última sessão ${new Date(last.t).toLocaleDateString('pt-BR')} · dor ${last.dor}/10${last.o ? ' · “' + esc(last.o) + '”' : ''}</p>` : ''}
      <div class="row" style="margin-top:10px">
        <button type="button" class="small" data-send="${s.id}">Enviar ao paciente</button>
        ${(s.relatorios || []).length ? `<button type="button" class="soft small" data-evo="${s.id}">Evolução</button>` : ''}
        <button type="button" class="ghost small" data-edit="${s.id}">Editar</button>
      </div>
    </div>`;
}

// Liga os botões dos cartões de programa dentro de `root` (usado também na ficha do paciente)
export function bindProgramCards(root, onChange) {
  const sheets = store.get('fichas', []);
  const find = id => sheets.find(s => s.id === id);
  $$('[data-edit]', root).forEach(b => { b.onclick = () => openEditor(onChange, find(b.dataset.edit)); });
  $$('[data-send]', root).forEach(b => { b.onclick = () => sendProgram(find(b.dataset.send)); });
  $$('[data-evo]', root).forEach(b => { b.onclick = () => openEvolution(find(b.dataset.evo)); });
}

export function renderProgramas(root) {
  current = () => renderProgramas(root);
  const sheets = store.get('fichas', []);
  root.innerHTML = `
    <p class="muted">Monte o programa, mande o link pelo WhatsApp e acompanhe: o paciente marca o que fez, registra a dor e o relatório volta para você.</p>
    <details class="acc"><summary>Como funciona</summary><div class="acc-body">
      <ol style="margin:0">
        <li>Você monta o programa (do zero, da biblioteca ou de um modelo).</li>
        <li>O paciente abre o link: vê os exercícios, marca as séries, usa o cronômetro e diz quanto doeu.</li>
        <li>Ele toca em "Enviar relatório" e você abre o link aqui para ver adesão e evolução da dor.</li>
      </ol>
    </div></details>

    <div class="row between"><h2 style="margin:0">Programas</h2><button type="button" id="newSheet">＋ Novo programa</button></div>
    <div style="margin-top:10px" id="progList">
      ${sheets.length ? sheets.map(programCard).join('') : `<div class="card empty"><div class="big">🏋️</div><p>Nenhum programa ainda. Comece com um modelo pronto e ajuste para o seu paciente.</p></div>`}
    </div>

    <h2>Orientações para enviar</h2>
    <p class="muted" style="margin-top:-4px">Textos curtos de educação em saúde, prontos para o WhatsApp.</p>
    ${ORIENTACOES.map((o, i) => `<details class="acc"><summary>${esc(o.t)}</summary><div class="acc-body">
      <p style="white-space:pre-line">${esc(o.x)}</p>
      <div class="row"><button type="button" class="small" data-ori="${i}">Enviar</button><button type="button" class="ghost small" data-ori-copy="${i}">Copiar</button></div>
    </div></details>`).join('')}
  `;
  $('#newSheet', root).onclick = () => openEditor(current);
  bindProgramCards(root, current);
  $$('[data-ori]', root).forEach(b => { b.onclick = () => { const o = ORIENTACOES[b.dataset.ori]; shareText(o.t, `*${o.t}*\n\n${o.x}`); }; });
  $$('[data-ori-copy]', root).forEach(b => { b.onclick = () => { const o = ORIENTACOES[b.dataset.oriCopy]; copyText(`*${o.t}*\n\n${o.x}`); }; });
}

export function renderRadar(root) {
  current = () => renderRadar(root);
  const myApps = store.get('radarMeus', []);
  const notes = store.get('radarNotas', {});
  const apps = [...RADAR, ...myApps.map(a => ({ ...a, meu: true }))];
  const shown = apps.filter(a => radarFilter === 'todos' || (radarFilter === 'pt' ? a.pt : a.tipo === radarFilter));
  root.innerHTML = `
    <p class="muted">O FisioPalma já junta o principal destes apps (prescrição, adesão, agenda, prontuário e financeiro). Use o radar para comparar e anotar o que você testou.</p>
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
          ${a.aqui ? `<p style="font-size:.85rem"><b>No FisioPalma:</b> ${esc(a.aqui)}</p>` : ''}
          <label style="font-size:.78rem">Minha avaliação
          <select data-note="${esc(a.n)}" style="margin-top:4px">
            ${['', 'Quero testar', 'Testando', 'Uso e recomendo', 'Não gostei'].map(o => `<option value="${o}" ${(notes[a.n] || '') === o ? 'selected' : ''}>${o || '— sem avaliação —'}</option>`).join('')}
          </select></label>
          <div class="row" style="margin-top:8px">
            ${a.site ? `<a class="btn small soft" href="${esc(a.site)}" target="_blank" rel="noopener noreferrer">${a.busca ? 'Pesquisar ↗' : 'Abrir site ↗'}</a>` : ''}
            ${a.meu ? `<button type="button" class="ghost small" data-rm-app="${esc(a.id)}">Remover</button>` : ''}
          </div>
        </div>`).join('')}
    </div>
    <div class="row" style="margin-top:4px"><button type="button" class="soft" id="addApp">＋ Adicionar app ao radar</button></div>
    <p class="muted" style="font-size:.8rem">Informações conferidas em outubro de 2026 nos sites dos fornecedores e em comparativos; preços e recursos mudam, confira antes de assinar. Ao trocar dados de pacientes por qualquer app, siga a LGPD e as resoluções do COFFITO sobre teleatendimento.</p>
  `;
  $('#radarChips', root).onclick = e => {
    const b = e.target.closest('[data-rf]');
    if (!b) return;
    radarFilter = b.dataset.rf;
    current();
  };
  $$('[data-note]', root).forEach(sel => {
    sel.onchange = () => { const n = store.get('radarNotas', {}); n[sel.dataset.note] = sel.value; store.set('radarNotas', n); toast('Anotado'); };
  });
  $$('[data-rm-app]', root).forEach(b => {
    b.onclick = () => { store.set('radarMeus', myApps.filter(a => a.id !== b.dataset.rmApp)); current(); };
  });
  $('#addApp', root).onclick = () => openAddApp();
}

/* ---------------- Enviar ao paciente ---------------- */

async function programLink(s) {
  return appBase() + 'paciente.html#p=' + await encodeData(programPayload(s));
}

async function sendProgram(s) {
  const link = await programLink(s);
  const text = `Olá${s.paciente ? ', ' + s.paciente : ''}! Aqui estão seus exercícios para casa:\n${link}\n\nAbra no celular, marque cada série que fizer e, no final, diga quanto doeu. Uma vez por semana, toque em "Enviar relatório" para eu acompanhar.`;
  const tel = (s.telPac || '').replace(/\D/g, '');
  if (tel) window.open(`https://wa.me/${tel.length <= 11 ? '55' + tel : tel}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  else shareText('Seus exercícios', text);
}

// Versão em texto puro (para quem prefere mandar a ficha escrita ou imprimir)
function sheetText(s) {
  return [
    `*Exercícios para casa${s.paciente ? ' · ' + s.paciente : ''}*`,
    `Frequência: ${s.freq}`,
    '',
    ...s.itens.map((it, i) => `*${i + 1}. ${it.n}* (${it.dose})\n${it.d}${it.v ? '\nVídeo: ' + it.v : ''}`),
    '',
    s.obs ? `Observações: ${s.obs}\n` : '',
    'Dor durante o exercício: até 5 de 0 a 10 é aceitável se passar até o dia seguinte. Se piorar muito, pare e me avise.',
    s.prof ? `\n${s.prof}` : '',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ---------------- Editor do programa ---------------- */

export function openEditor(onDone = () => current(), existing, preset = {}) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: uid(), paciente: '', telPac: '', dias: [1, 2, 3, 4, 5], vezes: 1, obs: '', itens: [], relatorios: [],
    prof: store.get('profAssinatura', ''), tel: store.get('profTel', ''), data: new Date().toLocaleDateString('pt-BR'),
    ...preset,
  };
  s.dias ??= [];
  s.vezes ??= 1;
  const regions = [...new Set(EXERCICIOS.map(e => e.r))];
  let region = '';

  const body = openSheet(existing ? 'Editar programa' : 'Novo programa', `
    <div class="field2">
      <div><label for="shPac">Paciente (primeiro nome)</label><input id="shPac" value="${esc(s.paciente)}" /></div>
      <div><label for="shTelPac">WhatsApp do paciente</label><input id="shTelPac" type="tel" inputmode="tel" placeholder="DDD + número" value="${esc(s.telPac || '')}" /></div>
    </div>
    <label>Dias da semana</label>
    <div class="dias">${DIAS.map((d, i) => `<label><input type="checkbox" data-dia="${i}" ${s.dias.includes(i) ? 'checked' : ''} /><span>${d}</span></label>`).join('')}</div>
    <label for="shVezes">Vezes por dia</label>
    <select id="shVezes">${[1, 2, 3].map(n => `<option ${s.vezes === n ? 'selected' : ''}>${n}</option>`).join('')}</select>

    ${existing ? '' : `<label for="shModelo">Começar de um modelo (opcional)</label>
    <select id="shModelo"><option value="">—</option>${MODELOS.map((m, i) => `<option value="${i}">${esc(m.n)}</option>`).join('')}</select>`}

    <h3 style="margin-top:16px">Exercícios do programa</h3>
    <div id="shItems"></div>

    <label for="shBusca">Adicionar da biblioteca (${EXERCICIOS.length} exercícios)</label>
    <input id="shBusca" type="search" placeholder="Buscar: ponte, ombro, equilíbrio..." />
    <div class="chips" id="shReg" style="margin-top:6px"><button type="button" class="chip on" data-r="">Todos</button>${regions.map(r => `<button type="button" class="chip" data-r="${esc(r)}">${esc(r)}</button>`).join('')}</div>
    <div class="lib-list" id="shLib"></div>

    <details class="acc" style="margin-top:10px"><summary>✏️ Escrever exercício próprio</summary><div class="acc-body">
      <label for="cxN">Nome</label><input id="cxN" />
      <label for="cxD">Como fazer (linguagem simples)</label><textarea id="cxD"></textarea>
      <label for="cxDose">Dose</label><input id="cxDose" value="3 × 10" />
      <button type="button" class="soft" id="cxAdd" style="margin-top:8px">Adicionar ao programa</button>
    </div></details>

    <label for="shObs">Recado para o paciente</label>
    <textarea id="shObs" placeholder="Ex.: usar gelo 15 min depois; parar se sentir formigamento.">${esc(s.obs)}</textarea>
    <div class="field2">
      <div><label for="shProf">Sua assinatura</label><input id="shProf" value="${esc(s.prof)}" placeholder="Dra. Ana · CREFITO-3 000000-F" /></div>
      <div><label for="shTel">Seu WhatsApp (recebe relatórios)</label><input id="shTel" type="tel" inputmode="tel" value="${esc(s.tel || '')}" /></div>
    </div>

    <div class="row" style="margin-top:14px">
      <button type="button" id="shSend">Salvar e enviar link</button>
      <button type="button" class="soft" id="shSave">Só salvar</button>
      <button type="button" class="ghost" id="shCopy">Copiar como texto</button>
      <button type="button" class="ghost" id="shPreview">Ver como paciente</button>
      ${existing ? '<button type="button" class="ghost" id="shDel" style="color:var(--bad);border-color:var(--bad)">Apagar</button>' : ''}
    </div>
  `);

  const drawItems = () => {
    $('#shItems', body).innerHTML = s.itens.length
      ? s.itens.map((it, i) => `<div class="ex-item">
          <div><b>${i + 1}. ${esc(it.n)}</b><br><small class="muted">${esc(it.d)}</small>
            <div class="field2" style="margin-top:6px">
              <input data-dose="${i}" value="${esc(it.dose)}" aria-label="Dose de ${esc(it.n)}" style="padding:6px 10px" />
              <input data-video="${i}" type="url" value="${esc(it.v || '')}" placeholder="Link do seu vídeo (opcional)" aria-label="Vídeo de ${esc(it.n)}" style="padding:6px 10px" />
            </div></div>
          <div class="stack">
            ${i ? `<button type="button" class="ghost small" data-up="${i}" aria-label="Subir">↑</button>` : ''}
            <button type="button" class="ghost small" data-rm="${i}" aria-label="Remover">✕</button>
          </div>
        </div>`).join('')
      : '<p class="muted">Nenhum exercício ainda.</p>';
  };
  const drawLib = () => {
    const q = $('#shBusca', body).value.trim().toLowerCase();
    const list = EXERCICIOS.filter(e => (!region || e.r === region) && (!q || (e.n + ' ' + e.r + ' ' + e.d).toLowerCase().includes(q)));
    $('#shLib', body).innerHTML = list.map(e => `<button type="button" data-add="${e.id}"><span><b>${esc(e.n)}</b> <small class="muted">· ${esc(e.r)}</small></span><span style="color:var(--brand)">＋</span></button>`).join('')
      || '<p class="muted" style="padding:10px">Nada encontrado. Escreva um exercício próprio abaixo.</p>';
  };
  const addEx = e => { s.itens.push({ e: e.id, n: e.n, d: e.d, dose: e.dose }); drawItems(); };
  drawItems();
  drawLib();

  $('#shItems', body).onclick = e => {
    const rm = e.target.closest('[data-rm]');
    const up = e.target.closest('[data-up]');
    if (rm) s.itens.splice(Number(rm.dataset.rm), 1);
    if (up) { const i = Number(up.dataset.up); [s.itens[i - 1], s.itens[i]] = [s.itens[i], s.itens[i - 1]]; }
    if (rm || up) drawItems();
  };
  $('#shItems', body).oninput = e => {
    if (e.target.dataset.dose != null) s.itens[Number(e.target.dataset.dose)].dose = e.target.value;
    if (e.target.dataset.video != null) s.itens[Number(e.target.dataset.video)].v = e.target.value.trim();
  };
  $('#shBusca', body).oninput = drawLib;
  $('#shReg', body).onclick = e => {
    const b = e.target.closest('[data-r]');
    if (!b) return;
    region = b.dataset.r;
    $$('#shReg .chip', body).forEach(c => c.classList.toggle('on', c === b));
    drawLib();
  };
  $('#shLib', body).onclick = e => {
    const b = e.target.closest('[data-add]');
    if (b) { addEx(byId(b.dataset.add)); toast('Adicionado'); }
  };
  const modelo = $('#shModelo', body);
  if (modelo) modelo.onchange = () => {
    if (modelo.value === '') return;
    if (s.itens.length && !confirm('Trocar os exercícios atuais pelos do modelo?')) return;
    s.itens = [];
    MODELOS[Number(modelo.value)].it.forEach(id => addEx(byId(id)));
    toast('Modelo carregado: ajuste as doses para o seu paciente');
  };
  $('#cxAdd', body).onclick = () => {
    const n = $('#cxN', body).value.trim();
    if (!n) return toast('Dê um nome ao exercício');
    s.itens.push({ n, d: $('#cxD', body).value.trim(), dose: $('#cxDose', body).value.trim() });
    $('#cxN', body).value = ''; $('#cxD', body).value = '';
    drawItems();
  };

  const collect = () => {
    s.paciente = $('#shPac', body).value.trim();
    s.telPac = $('#shTelPac', body).value.trim();
    s.dias = $$('[data-dia]', body).filter(c => c.checked).map(c => Number(c.dataset.dia));
    s.vezes = Number($('#shVezes', body).value);
    s.freq = freqText(s);
    s.obs = $('#shObs', body).value.trim();
    s.prof = $('#shProf', body).value.trim();
    s.tel = $('#shTel', body).value.trim();
    store.set('profAssinatura', s.prof);
    store.set('profTel', s.tel);
  };
  const save = () => {
    collect();
    if (!s.itens.length) { toast('Adicione pelo menos um exercício'); return false; }
    const list = store.get('fichas', []).filter(x => x.id !== s.id);
    list.unshift(s);
    store.set('fichas', list);
    return true;
  };
  $('#shSave', body).onclick = () => { if (save()) { closeSheet(); toast('Programa salvo'); onDone(); } };
  $('#shSend', body).onclick = async () => { if (save()) { await sendProgram(s); closeSheet(); onDone(); } };
  $('#shCopy', body).onclick = () => { collect(); copyText(sheetText(s)); };
  $('#shPreview', body).onclick = async () => {
    collect();
    if (!s.itens.length) return toast('Adicione pelo menos um exercício');
    window.open(await programLink(s), '_blank', 'noopener');
  };
  const del = $('#shDel', body);
  if (del) del.onclick = () => {
    if (!confirm('Apagar este programa e os relatórios dele?')) return;
    store.set('fichas', store.get('fichas', []).filter(x => x.id !== s.id));
    closeSheet();
    onDone();
  };
}

/* ---------------- Relatório que volta do paciente ---------------- */

export async function importReport(encoded) {
  let rep;
  try {
    rep = await decodeData(encoded);
    if (!rep?.pid || !Array.isArray(rep.logs)) throw new Error('relatório');
  } catch {
    return toast('Esse link de relatório está incompleto');
  }
  const list = store.get('fichas', []);
  const s = list.find(x => x.id === rep.pid);
  if (!s) {
    return openSheet('Relatório recebido', `<p>Esse relatório é de um programa que não está salvo neste aparelho${rep.pac ? ` (paciente: <b>${esc(rep.pac)}</b>)` : ''}.</p>
      <p class="muted">Abra o link no celular ou computador em que você criou o programa.</p>`);
  }
  const seen = new Set((s.relatorios || []).map(l => l.t));
  const novos = rep.logs.filter(l => !seen.has(l.t));
  s.relatorios = [...(s.relatorios || []), ...novos].sort((a, b) => a.t - b.t);
  store.set('fichas', list);
  current();
  openEvolution(s, novos.length);
}

function openEvolution(s, novos) {
  const logs = s.relatorios || [];
  const ad7 = adherence(logs, s.dias, s.vezes, 7);
  const ad30 = adherence(logs, s.dias, s.vezes, 30);
  const pains = logs.slice(-10).map(l => l.dor);
  const first = logs.slice(0, 3), last = logs.slice(-3);
  const avg = arr => arr.length ? (arr.reduce((a, l) => a + l.dor, 0) / arr.length).toFixed(1).replace('.', ',') : '—';
  const alerta = logs.slice(-3).some(l => l.dor > 5);
  openSheet(`Evolução · ${s.paciente || 'paciente'}`, `
    ${novos != null ? `<p class="tag ok">${novos} sessão(ões) nova(s) importada(s)</p>` : ''}
    ${alerta ? '<div class="notice bad">Dor acima de 5 nas últimas sessões: vale ligar, ajustar a carga ou antecipar a reavaliação.</div>' : ''}
    <div class="grid2" style="grid-template-columns:repeat(3,1fr);gap:8px">
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0">${ad7}%</div><small>adesão 7 dias</small></div>
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0">${ad30}%</div><small>adesão 30 dias</small></div>
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0">${avg(first)} → ${avg(last)}</div><small>dor (início → agora)</small></div>
    </div>
    <h3>Dor por sessão</h3>
    <div class="sparkbars" aria-label="Dor nas últimas sessões: ${pains.join(', ')}">${pains.map(p => `<span style="height:${Math.max(4, p * 10)}%;background:hsl(${120 - p * 12} 60% 42%)" title="${p}"></span>`).join('')}</div>
    <h3>Sessões</h3>
    <table><thead><tr><th>Data</th><th>Feitos</th><th>Dor</th><th>Comentário</th></tr></thead><tbody>
      ${logs.slice().reverse().slice(0, 30).map(l => `<tr><td>${new Date(l.t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td><td>${l.d}/${l.n}</td><td>${l.dor}</td><td>${esc([{ facil: 'Fácil', ok: '', dificil: 'Difícil' }[l.dif], l.o].filter(Boolean).join(' · '))}</td></tr>`).join('')}
    </tbody></table>
  `);
}

function openAddApp() {
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
    current();
  };
}
