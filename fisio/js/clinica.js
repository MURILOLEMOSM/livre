// Clínica: tudo em um só lugar — agenda, pacientes e prontuário, programas de exercícios,
// financeiro, radar de apps e ajustes. Os dados ficam só neste aparelho (com backup).

import { $, $$, esc, uid, toast, store, openSheet, closeSheet, shareText, copyText } from './util.js';
import { renderProgramas, renderRadar, programCard, bindProgramCards, openEditor, importReport } from './casa.js';

const SUBS = [
  ['agenda', '📅 Agenda'], ['pacientes', '👥 Pacientes'], ['exercicios', '🏋️ Exercícios'],
  ['financeiro', '💰 Financeiro'], ['apps', '🔭 Apps'], ['ajustes', '⚙️ Ajustes'],
];
const STATUS = { agendada: 'Agendada', confirmada: 'Confirmada', realizada: 'Realizada', faltou: 'Faltou', cancelada: 'Cancelada' };
const STATUS_TAG = { agendada: '', confirmada: 'ok', realizada: 'ok', faltou: 'bad', cancelada: 'warn' };
const TIPOS = { presencial: 'Presencial', domiciliar: 'Domiciliar', tele: 'Teleconsulta' };
const FORMAS = ['Pix', 'Dinheiro', 'Cartão', 'Convênio', 'Transferência'];
const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const AVALIACAO_MODELO = `Queixa principal:
HDA (início, evolução, o que melhora e piora):
Dor (EVA 0–10): agora __ · melhor __ · pior __
Sinais de alerta: ( ) nenhum
HPP / cirurgias / medicamentos:
Hábitos e trabalho:
Objetivos do paciente:

Exame físico
Inspeção / postura / marcha:
ADM:
Força (MRC):
Testes especiais:
Testes funcionais / questionários:

Diagnóstico fisioterapêutico:
Objetivos (curto e longo prazo):
Conduta e plano (frequência, duração):`;

/* ---------------- Dados ---------------- */

const empty = () => ({ pacientes: [], consultas: [], lancamentos: [] });
const load = () => ({ ...empty(), ...store.get('clinica', {}) });
const persist = d => store.set('clinica', d);

const iso = d => d.toLocaleDateString('sv'); // AAAA-MM-DD local
const fromIso = s => new Date(s + 'T12:00:00');
const hoje = () => iso(new Date());
const fmtDia = s => fromIso(s).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const brl = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = v => Number(String(v).replace(/\./g, '').replace(',', '.')) || 0;
const waLink = (tel, text) => {
  const t = String(tel || '').replace(/\D/g, '');
  return t ? `https://wa.me/${t.length <= 11 ? '55' + t : t}?text=${encodeURIComponent(text)}` : '';
};
const prof = () => store.get('profAssinatura', '');

let agendaDia = hoje();
let finMes = hoje().slice(0, 7);
let busca = '';

/* ---------------- Entrada da aba ---------------- */

export async function renderClinica(root, sub = 'agenda', arg = '') {
  if (store.get('pinHash', '') && sessionStorage.getItem('fp:unlocked') !== '1') return renderLock(root, sub, arg);
  const tab = sub === 'paciente' ? 'pacientes' : sub;
  root.innerHTML = `
    <h1>Clínica</h1>
    <div class="chips" id="subNav">${SUBS.map(([k, l]) => `<a class="chip ${k === tab ? 'on' : ''}" href="#/clinica/${k}" style="text-decoration:none">${l}</a>`).join('')}</div>
    <div id="sub"></div>`;
  const el = $('#sub', root);
  const go = () => renderClinica(root, sub, arg);
  if (sub === 'agenda') renderAgenda(el, go);
  else if (sub === 'pacientes') renderPacientes(el);
  else if (sub === 'paciente') renderPaciente(el, arg, go);
  else if (sub === 'exercicios') renderProgramas(el);
  else if (sub === 'financeiro') renderFinanceiro(el, go);
  else if (sub === 'apps') renderRadar(el);
  else if (sub === 'ajustes') renderAjustes(el, go);
  else renderAgenda(el, go);
  // relatório de paciente que chegou por link (só importa com a Clínica desbloqueada)
  const pending = sessionStorage.getItem('fp:pendingReport');
  if (pending) { sessionStorage.removeItem('fp:pendingReport'); importReport(pending); }
}

/* ---------------- Agenda ---------------- */

function renderAgenda(el, refresh) {
  const d = load();
  const pac = id => d.pacientes.find(p => p.id === id);
  const base = fromIso(agendaDia);
  const week = Array.from({ length: 7 }, (_, i) => { const x = new Date(base); x.setDate(base.getDate() - base.getDay() + i); return iso(x); });
  const doDia = d.consultas.filter(c => c.data === agendaDia).sort((a, b) => a.hora.localeCompare(b.hora));
  const previsto = doDia.filter(c => c.status !== 'cancelada' && c.status !== 'faltou').reduce((s, c) => s + (Number(c.valor) || 0), 0);

  el.innerHTML = `
    <div class="row between" style="margin:6px 0 8px">
      <button type="button" class="ghost small" data-shift="-7" aria-label="Semana anterior">‹</button>
      <b>${fromIso(agendaDia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b>
      <button type="button" class="ghost small" data-shift="7" aria-label="Próxima semana">›</button>
    </div>
    <div class="week">${week.map(w => {
      const n = d.consultas.filter(c => c.data === w && c.status !== 'cancelada').length;
      return `<button type="button" class="wday ${w === agendaDia ? 'on' : ''} ${w === hoje() ? 'today' : ''}" data-day="${w}">
        <small>${DIAS_SEMANA[fromIso(w).getDay()].slice(0, 3)}</small><b>${fromIso(w).getDate()}</b><i>${n ? '•'.repeat(Math.min(n, 4)) : ''}</i></button>`;
    }).join('')}</div>
    <div class="row between" style="margin:12px 0 8px">
      <span><b>${fmtDia(agendaDia)}</b> · ${doDia.length} atendimento(s)${previsto ? ' · ' + brl(previsto) : ''}</span>
      <div class="row"><button type="button" class="ghost small" id="toToday">Hoje</button><button type="button" id="newAppt">＋ Agendar</button></div>
    </div>
    ${doDia.length ? doDia.map(c => {
      const p = pac(c.pacId) || { nome: '(paciente removido)' };
      return `<div class="card appt" data-c="${c.id}">
        <div class="row between" style="flex-wrap:nowrap;align-items:flex-start">
          <div><span class="hora">${esc(c.hora)}</span> <b>${esc(p.nome)}</b><br>
            <small class="muted">${TIPOS[c.tipo] || ''} · ${c.dur || 50} min${c.valor ? ' · ' + brl(c.valor) + (c.pago ? ' ✓ pago' : '') : ''}</small></div>
          <span class="tag ${STATUS_TAG[c.status]}">${STATUS[c.status]}</span>
        </div>
        ${c.obs ? `<p class="muted" style="font-size:.85rem;margin:.4rem 0 0">${esc(c.obs)}</p>` : ''}
        <div class="row" style="margin-top:10px">
          ${p.tel && c.status === 'agendada' ? `<a class="btn small soft" target="_blank" rel="noopener" href="${esc(waLink(p.tel, confirmText(c, p)))}">Confirmar no WhatsApp</a>` : ''}
          ${c.tipo === 'tele' && c.sala ? `<a class="btn small" target="_blank" rel="noopener" href="${esc(c.sala)}">🎥 Entrar na sala</a>` : ''}
          <select data-status="${c.id}" aria-label="Situação" style="width:auto;padding:6px 10px">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          ${p.id ? `<a class="btn ghost small" href="#/clinica/paciente/${p.id}">Ficha</a>` : ''}
          <button type="button" class="ghost small" data-edit-c="${c.id}">Editar</button>
        </div>
      </div>`;
    }).join('') : `<div class="card empty"><div class="big">🗓️</div><p>Nada marcado neste dia.</p></div>`}
  `;
  $$('[data-shift]', el).forEach(b => { b.onclick = () => { const x = fromIso(agendaDia); x.setDate(x.getDate() + Number(b.dataset.shift)); agendaDia = iso(x); refresh(); }; });
  $$('[data-day]', el).forEach(b => { b.onclick = () => { agendaDia = b.dataset.day; refresh(); }; });
  $('#toToday', el).onclick = () => { agendaDia = hoje(); refresh(); };
  $('#newAppt', el).onclick = () => openConsulta(refresh, null, { data: agendaDia });
  $$('[data-status]', el).forEach(s => {
    s.onchange = () => {
      const dd = load();
      const c = dd.consultas.find(x => x.id === s.dataset.status);
      c.status = s.value;
      persist(dd);
      if (c.status === 'realizada' && c.valor && !c.pago) return askPayment(c.id, refresh);
      refresh();
    };
  });
  $$('[data-edit-c]', el).forEach(b => { b.onclick = () => openConsulta(refresh, load().consultas.find(c => c.id === b.dataset.editC)); });
}

function confirmText(c, p) {
  const dia = fromIso(c.data);
  return `Olá, ${p.nome.split(' ')[0]}! Passando para confirmar sua sessão de fisioterapia ${DIAS_SEMANA[dia.getDay()]}, ${dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, às ${c.hora}${c.tipo === 'tele' && c.sala ? ` (por vídeo: ${c.sala})` : c.tipo === 'domiciliar' ? ', na sua casa' : ''}. Pode confirmar?${prof() ? '\n' + prof() : ''}`;
}

function askPayment(id, refresh) {
  const body = openSheet('Sessão realizada', `
    <p>Já recebeu o pagamento desta sessão?</p>
    <label for="pgForma">Forma</label>
    <select id="pgForma">${FORMAS.map(f => `<option>${f}</option>`).join('')}</select>
    <div class="row" style="margin-top:12px">
      <button type="button" id="pgSim">Sim, recebi</button>
      <button type="button" class="ghost" id="pgNao">Ainda não</button>
    </div>`);
  $('#pgSim', body).onclick = () => {
    const d = load();
    const c = d.consultas.find(x => x.id === id);
    Object.assign(c, { pago: true, forma: $('#pgForma', body).value, pagoEm: hoje() });
    persist(d);
    closeSheet(); toast('Pagamento registrado'); refresh();
  };
  $('#pgNao', body).onclick = () => { closeSheet(); toast('Fica em "A receber" no Financeiro'); refresh(); };
}

function openConsulta(refresh, existing, preset = {}) {
  const d = load();
  const c = existing ? { ...existing } : { id: uid(), data: hoje(), hora: '08:00', dur: 50, tipo: 'presencial', status: 'agendada', valor: '', pago: false, obs: '', ...preset };
  const pacs = [...d.pacientes].sort((a, b) => a.nome.localeCompare(b.nome));
  const body = openSheet(existing ? 'Editar atendimento' : 'Agendar', `
    <label for="cPac">Paciente</label>
    <select id="cPac">
      ${pacs.map(p => `<option value="${p.id}" ${c.pacId === p.id ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}
      <option value="__novo" ${!pacs.length ? 'selected' : ''}>＋ Novo paciente</option>
    </select>
    <div id="novoPac" ${pacs.length ? 'hidden' : ''}>
      <div class="field2">
        <div><label for="nNome">Nome</label><input id="nNome" /></div>
        <div><label for="nTel">WhatsApp</label><input id="nTel" type="tel" inputmode="tel" /></div>
      </div>
    </div>
    <div class="field2">
      <div><label for="cData">Data</label><input id="cData" type="date" value="${c.data}" /></div>
      <div><label for="cHora">Horário</label><input id="cHora" type="time" value="${c.hora}" /></div>
      <div><label for="cDur">Duração (min)</label><input id="cDur" type="number" min="10" step="5" value="${c.dur}" /></div>
      <div><label for="cValor">Valor (R$)</label><input id="cValor" inputmode="decimal" value="${c.valor === '' ? '' : String(c.valor).replace('.', ',')}" placeholder="0,00" /></div>
    </div>
    <label for="cTipo">Tipo</label>
    <select id="cTipo">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}" ${c.tipo === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    ${existing ? '' : `<label for="cRep">Repetir toda semana</label>
    <select id="cRep">${[1, 2, 4, 6, 8, 10, 12].map(n => `<option value="${n}">${n === 1 ? 'Não repetir' : n + ' semanas'}</option>`).join('')}</select>`}
    <label for="cObs">Observação</label>
    <input id="cObs" value="${esc(c.obs)}" placeholder="Ex.: trazer exames, 2ª sessão do pacote" />
    <div class="row" style="margin-top:14px">
      <button type="button" id="cSave">Salvar</button>
      ${existing ? `<button type="button" class="ghost" id="cDel" style="color:var(--bad);border-color:var(--bad)">Apagar</button>` : ''}
    </div>`);

  const selPac = $('#cPac', body);
  const fillValor = () => {
    const p = d.pacientes.find(x => x.id === selPac.value);
    if (p?.valor && !$('#cValor', body).value) $('#cValor', body).value = String(p.valor).replace('.', ',');
  };
  selPac.onchange = () => { $('#novoPac', body).hidden = selPac.value !== '__novo'; fillValor(); };
  fillValor();

  $('#cSave', body).onclick = () => {
    const dd = load();
    let pacId = selPac.value;
    if (pacId === '__novo') {
      const nome = $('#nNome', body).value.trim();
      if (!nome) return toast('Coloque o nome do paciente');
      const p = { id: uid(), nome, tel: $('#nTel', body).value.trim(), criado: Date.now(), evolucoes: [] };
      dd.pacientes.push(p);
      pacId = p.id;
    }
    Object.assign(c, {
      pacId, data: $('#cData', body).value, hora: $('#cHora', body).value, dur: Number($('#cDur', body).value) || 50,
      valor: $('#cValor', body).value ? num($('#cValor', body).value) : '', tipo: $('#cTipo', body).value, obs: $('#cObs', body).value.trim(),
    });
    if (!c.data || !c.hora) return toast('Escolha data e horário');
    if (c.tipo === 'tele' && !c.sala) c.sala = `https://meet.jit.si/FisioPalma-${uid()}`;
    const reps = existing ? 1 : Number($('#cRep', body).value);
    const novas = [];
    for (let i = 0; i < reps; i++) {
      const x = fromIso(c.data);
      x.setDate(x.getDate() + 7 * i);
      novas.push(i === 0 ? c : { ...c, id: uid(), data: iso(x), status: 'agendada', pago: false, sala: c.tipo === 'tele' ? `https://meet.jit.si/FisioPalma-${uid()}` : '' });
    }
    // aviso de horário ocupado
    const toMin = h => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
    const choque = novas.find(n => dd.consultas.some(o => o.id !== n.id && o.data === n.data && o.status !== 'cancelada'
      && toMin(o.hora) < toMin(n.hora) + n.dur && toMin(n.hora) < toMin(o.hora) + (o.dur || 50)));
    if (choque && !confirm(`Já existe atendimento nesse horário em ${fmtDia(choque.data)}. Marcar mesmo assim?`)) return;
    dd.consultas = dd.consultas.filter(o => o.id !== c.id).concat(novas);
    persist(dd);
    agendaDia = c.data;
    closeSheet();
    toast(reps > 1 ? `${reps} atendimentos agendados` : 'Agendado');
    refresh();
  };
  const del = $('#cDel', body);
  if (del) del.onclick = () => {
    if (!confirm('Apagar este atendimento?')) return;
    const dd = load();
    dd.consultas = dd.consultas.filter(o => o.id !== c.id);
    persist(dd);
    closeSheet();
    refresh();
  };
}

/* ---------------- Pacientes ---------------- */

function renderPacientes(el) {
  const d = load();
  const q = busca.trim().toLowerCase();
  const list = d.pacientes
    .filter(p => !q || [p.nome, p.tel, p.diag].some(v => String(v || '').toLowerCase().includes(q)))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const next = id => d.consultas.filter(c => c.pacId === id && c.data >= hoje() && c.status !== 'cancelada').sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];
  const devendo = id => d.consultas.filter(c => c.pacId === id && c.status === 'realizada' && c.valor && !c.pago).reduce((s, c) => s + Number(c.valor), 0);

  el.innerHTML = `
    <div class="row" style="flex-wrap:nowrap;margin-top:6px">
      <input type="search" id="pBusca" placeholder="Buscar paciente" value="${esc(busca)}" />
      <button type="button" id="newPac">＋ Paciente</button>
    </div>
    <p class="muted" style="font-size:.85rem">${d.pacientes.length} paciente(s)</p>
    ${list.length ? list.map(p => {
      const n = next(p.id), dv = devendo(p.id);
      return `<a class="card row between" href="#/clinica/paciente/${p.id}" style="text-decoration:none;color:inherit;flex-wrap:nowrap">
        <span><b>${esc(p.nome)}</b><br><small class="muted">${n ? 'Próxima: ' + fmtDia(n.data) + ' ' + esc(n.hora) : 'Sem horário marcado'}${p.diag ? ' · ' + esc(p.diag) : ''}</small></span>
        <span>${dv ? `<span class="tag bad">${brl(dv)}</span>` : ''} ›</span>
      </a>`;
    }).join('') : `<div class="card empty"><div class="big">👥</div><p>${d.pacientes.length ? 'Ninguém com esse nome.' : 'Cadastre seu primeiro paciente.'}</p></div>`}
  `;
  $('#pBusca', el).oninput = e => { busca = e.target.value; renderPacientes(el); const i = $('#pBusca', el); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $('#newPac', el).onclick = () => openPacienteForm(null, id => { location.hash = '#/clinica/paciente/' + id; });
}

function openPacienteForm(existing, done) {
  const p = existing ? { ...existing } : { id: uid(), nome: '', tel: '', nasc: '', convenio: '', diag: '', valor: '', obs: '', criado: Date.now(), evolucoes: [] };
  const body = openSheet(existing ? 'Editar paciente' : 'Novo paciente', `
    <form id="pForm">
      <label for="pNome">Nome completo *</label><input id="pNome" required value="${esc(p.nome)}" />
      <div class="field2">
        <div><label for="pTel">WhatsApp</label><input id="pTel" type="tel" inputmode="tel" value="${esc(p.tel)}" /></div>
        <div><label for="pNasc">Nascimento</label><input id="pNasc" type="date" value="${esc(p.nasc)}" /></div>
        <div><label for="pConv">Convênio / particular</label><input id="pConv" value="${esc(p.convenio)}" placeholder="Particular" /></div>
        <div><label for="pValor">Valor da sessão (R$)</label><input id="pValor" inputmode="decimal" value="${p.valor === '' ? '' : String(p.valor).replace('.', ',')}" /></div>
      </div>
      <label for="pDiag">Diagnóstico médico / encaminhamento</label><input id="pDiag" value="${esc(p.diag)}" placeholder="Ex.: Lombalgia, pós-op LCA" />
      <label for="pObs">Observações</label><textarea id="pObs">${esc(p.obs)}</textarea>
      <button type="submit" style="width:100%;margin-top:12px">Salvar</button>
    </form>`);
  $('#pForm', body).onsubmit = e => {
    e.preventDefault();
    Object.assign(p, {
      nome: $('#pNome', body).value.trim(), tel: $('#pTel', body).value.trim(), nasc: $('#pNasc', body).value,
      convenio: $('#pConv', body).value.trim(), valor: $('#pValor', body).value ? num($('#pValor', body).value) : '',
      diag: $('#pDiag', body).value.trim(), obs: $('#pObs', body).value.trim(),
    });
    if (!p.nome) return;
    const d = load();
    d.pacientes = d.pacientes.filter(x => x.id !== p.id).concat(p);
    persist(d);
    closeSheet();
    toast('Paciente salvo');
    done(p.id);
  };
}

const idade = nasc => {
  if (!nasc) return '';
  const n = fromIso(nasc), t = new Date();
  let a = t.getFullYear() - n.getFullYear();
  if (t < new Date(t.getFullYear(), n.getMonth(), n.getDate())) a--;
  return a + ' anos';
};

function renderPaciente(el, id, refresh) {
  const d = load();
  const p = d.pacientes.find(x => x.id === id);
  if (!p) { el.innerHTML = '<div class="card empty"><p>Paciente não encontrado.</p></div>'; return; }
  p.evolucoes ||= [];
  const consultas = d.consultas.filter(c => c.pacId === id).sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  const futuras = consultas.filter(c => c.data >= hoje() && c.status !== 'cancelada').reverse();
  const realizadas = consultas.filter(c => c.status === 'realizada');
  const pend = realizadas.filter(c => c.valor && !c.pago);
  const progs = store.get('fichas', []).filter(s => s.pacId === id);

  el.innerHTML = `
    <div class="card">
      <div class="row between" style="align-items:flex-start">
        <div>
          <h2 style="margin:0">${esc(p.nome)}</h2>
          <p class="muted" style="margin:.2rem 0 0">${[idade(p.nasc), p.convenio, p.diag].filter(Boolean).map(esc).join(' · ') || 'Sem dados adicionais'}</p>
        </div>
        <button type="button" class="ghost small no-print" id="editPac">Editar</button>
      </div>
      ${p.obs ? `<p style="margin-top:8px;white-space:pre-line">${esc(p.obs)}</p>` : ''}
      <div class="row no-print" style="margin-top:10px">
        ${p.tel ? `<a class="btn small soft" href="${esc(waLink(p.tel, `Olá, ${p.nome.split(' ')[0]}!`))}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        <button type="button" class="small" id="pAgendar">Agendar</button>
        <button type="button" class="small" id="pEvol">＋ Evolução</button>
        <button type="button" class="small" id="pProg">＋ Programa de exercícios</button>
      </div>
    </div>

    <div class="grid2 no-print" style="grid-template-columns:repeat(3,1fr);gap:8px">
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0">${realizadas.length}</div><small>sessões feitas</small></div>
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0">${consultas.filter(c => c.status === 'faltou').length}</div><small>faltas</small></div>
      <div class="card" style="text-align:center;padding:10px"><div class="result" style="margin:0;${pend.length ? 'color:var(--bad)' : ''}">${brl(pend.reduce((s, c) => s + Number(c.valor), 0))}</div><small>a receber</small></div>
    </div>

    <details class="acc" ${p.avaliacao ? '' : 'open'}><summary>📝 Avaliação inicial</summary><div class="acc-body">
      <textarea id="pAval" style="min-height:${p.avaliacao ? 240 : 120}px" placeholder="Escreva a avaliação ou use o roteiro">${esc(p.avaliacao || '')}</textarea>
      <div class="row no-print" style="margin-top:8px">
        <button type="button" class="soft small" id="pAvalModelo">Usar roteiro de avaliação</button>
        <button type="button" class="small" id="pAvalSave">Salvar avaliação</button>
      </div>
    </div></details>

    <h2>Evoluções</h2>
    ${p.evolucoes.length ? [...p.evolucoes].sort((a, b) => b.data.localeCompare(a.data)).map(e => `
      <div class="card evo">
        <div class="row between"><b>${fmtDia(e.data)}</b><button type="button" class="ghost small no-print" data-evo-edit="${e.id}">Editar</button></div>
        ${['s', 'o', 'a', 'p'].filter(k => e[k]).map(k => `<p><b>${k.toUpperCase()}:</b> ${esc(e[k])}</p>`).join('')}
      </div>`).join('') : '<p class="muted">Nenhuma evolução registrada.</p>'}

    <h2>Atendimentos</h2>
    ${futuras.length ? `<p><b>Próximos:</b> ${futuras.slice(0, 5).map(c => `${fmtDia(c.data)} ${esc(c.hora)}`).join(' · ')}</p>` : '<p class="muted">Nenhum horário futuro.</p>'}
    ${consultas.length ? `<div class="card"><table><thead><tr><th>Data</th><th>Situação</th><th>Valor</th></tr></thead><tbody>
      ${consultas.slice(0, 20).map(c => `<tr><td>${fmtDia(c.data)} ${esc(c.hora)}</td><td>${STATUS[c.status]}</td><td>${c.valor ? brl(c.valor) + (c.status === 'realizada' ? (c.pago ? ' ✓' : ' <span class="tag bad">pendente</span>') : '') : '—'}</td></tr>`).join('')}
    </tbody></table></div>` : ''}
    <div class="row no-print">
      ${pend.length ? `<button type="button" class="soft small" id="pReceber">Registrar pagamento (${pend.length})</button>` : ''}
      ${realizadas.some(c => c.pago) ? '<button type="button" class="soft small" id="pRecibo">Gerar recibo</button>' : ''}
    </div>

    <h2>Exercícios para casa</h2>
    <div id="pProgs">${progs.length ? progs.map(programCard).join('') : '<p class="muted">Nenhum programa ligado a este paciente.</p>'}</div>

    <div class="row no-print" style="margin-top:16px">
      <button type="button" class="ghost" id="pPrint">🖨️ Imprimir prontuário</button>
      <button type="button" class="ghost" id="pDel" style="color:var(--bad);border-color:var(--bad)">Excluir paciente</button>
    </div>
    <p class="muted" style="font-size:.78rem">O prontuário deve ser guardado conforme as regras do COFFITO. Faça backup em Ajustes com frequência.</p>
  `;

  $('#editPac', el).onclick = () => openPacienteForm(p, refresh);
  $('#pAgendar', el).onclick = () => openConsulta(refresh, null, { pacId: p.id, valor: p.valor ?? '' });
  $('#pEvol', el).onclick = () => openEvolucao(p.id, null, refresh);
  $$('[data-evo-edit]', el).forEach(b => { b.onclick = () => openEvolucao(p.id, p.evolucoes.find(e => e.id === b.dataset.evoEdit), refresh); });
  $('#pProg', el).onclick = () => openEditor(refresh, null, { paciente: p.nome.split(' ')[0], telPac: p.tel, pacId: p.id });
  bindProgramCards($('#pProgs', el), refresh);
  $('#pAvalModelo', el).onclick = () => { const t = $('#pAval', el); if (!t.value.trim() || confirm('Substituir o texto atual pelo roteiro?')) { t.value = AVALIACAO_MODELO; t.style.minHeight = '360px'; t.focus(); } };
  $('#pAvalSave', el).onclick = () => {
    const dd = load();
    dd.pacientes.find(x => x.id === id).avaliacao = $('#pAval', el).value;
    persist(dd);
    toast('Avaliação salva');
  };
  const rec = $('#pReceber', el);
  if (rec) rec.onclick = () => receberPendentes(pend.map(c => c.id), refresh);
  const recibo = $('#pRecibo', el);
  if (recibo) recibo.onclick = () => openRecibo(p, realizadas.filter(c => c.pago));
  $('#pPrint', el).onclick = () => { $$('details', el).forEach(x => { x.open = true; }); window.print(); };
  $('#pDel', el).onclick = () => {
    if (!confirm(`Excluir ${p.nome}, a avaliação, as evoluções e os atendimentos? Isso não pode ser desfeito.`)) return;
    const dd = load();
    dd.pacientes = dd.pacientes.filter(x => x.id !== id);
    dd.consultas = dd.consultas.filter(c => c.pacId !== id);
    persist(dd);
    location.hash = '#/clinica/pacientes';
  };
}

function openEvolucao(pacId, existing, refresh) {
  const e = existing ? { ...existing } : { id: uid(), data: hoje() };
  const draft = !existing ? store.get('soap', {}) : null;
  const val = k => esc(e[k] || (draft && draft['s' + k.toUpperCase()]) || '');
  const body = openSheet(existing ? 'Editar evolução' : 'Nova evolução', `
    <label for="eData">Data</label><input id="eData" type="date" value="${e.data}" />
    <label for="eS">S — Subjetivo</label><textarea id="eS" placeholder="O que o paciente relata">${val('s')}</textarea>
    <label for="eO">O — Objetivo</label><textarea id="eO" placeholder="O que você mediu">${val('o')}</textarea>
    <label for="eA">A — Avaliação</label><textarea id="eA" placeholder="Sua interpretação">${val('a')}</textarea>
    <label for="eP">P — Plano</label><textarea id="eP" placeholder="Próximos passos">${val('p')}</textarea>
    ${draft && Object.values(draft).some(Boolean) ? '<p class="muted" style="font-size:.8rem">Preenchido com o rascunho da aba Atender.</p>' : ''}
    <div class="row" style="margin-top:12px">
      <button type="button" id="eSave">Salvar evolução</button>
      ${existing ? '<button type="button" class="ghost" id="eDel" style="color:var(--bad);border-color:var(--bad)">Apagar</button>' : ''}
    </div>`);
  $('#eSave', body).onclick = () => {
    Object.assign(e, { data: $('#eData', body).value || hoje(), s: $('#eS', body).value.trim(), o: $('#eO', body).value.trim(), a: $('#eA', body).value.trim(), p: $('#eP', body).value.trim() });
    if (!e.s && !e.o && !e.a && !e.p) return toast('Escreva pelo menos um campo');
    const d = load();
    const p = d.pacientes.find(x => x.id === pacId);
    p.evolucoes = (p.evolucoes || []).filter(x => x.id !== e.id).concat(e);
    persist(d);
    if (!existing) store.set('soap', {});
    closeSheet();
    toast('Evolução salva');
    refresh();
  };
  const del = $('#eDel', body);
  if (del) del.onclick = () => {
    if (!confirm('Apagar esta evolução?')) return;
    const d = load();
    const p = d.pacientes.find(x => x.id === pacId);
    p.evolucoes = p.evolucoes.filter(x => x.id !== e.id);
    persist(d);
    closeSheet();
    refresh();
  };
}

/* ---------------- Financeiro ---------------- */

function receberPendentes(ids, refresh) {
  const body = openSheet('Registrar pagamento', `
    <p>${ids.length} sessão(ões) serão marcadas como pagas hoje.</p>
    <label for="rcForma">Forma</label>
    <select id="rcForma">${FORMAS.map(f => `<option>${f}</option>`).join('')}</select>
    <button type="button" id="rcOk" style="width:100%;margin-top:12px">Confirmar</button>`);
  $('#rcOk', body).onclick = () => {
    const d = load();
    d.consultas.filter(c => ids.includes(c.id)).forEach(c => Object.assign(c, { pago: true, forma: $('#rcForma', body).value, pagoEm: hoje() }));
    persist(d);
    closeSheet();
    toast('Pagamento registrado');
    refresh();
  };
}

function openRecibo(p, pagas) {
  const meses = [...new Set(pagas.map(c => c.data.slice(0, 7)))].sort().reverse();
  const body = openSheet('Recibo', `
    <label for="rbMes">Sessões de</label>
    <select id="rbMes">${meses.map(m => `<option value="${m}">${fromIso(m + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>`).join('')}</select>
    <label for="rbCpf">CPF do paciente (opcional, para reembolso)</label><input id="rbCpf" inputmode="numeric" />
    <label for="rbTxt">Texto</label><textarea id="rbTxt" style="min-height:220px"></textarea>
    <div class="row" style="margin-top:10px">
      <button type="button" id="rbShare">Enviar</button>
      <button type="button" class="ghost" id="rbCopy">Copiar</button>
    </div>
    <p class="muted" style="font-size:.78rem">Recibo simples. Nota fiscal de serviço (NFS-e) é emitida no site da sua prefeitura.</p>`);
  const build = () => {
    const sess = pagas.filter(c => c.data.startsWith($('#rbMes', body).value)).sort((a, b) => a.data.localeCompare(b.data));
    const total = sess.reduce((s, c) => s + Number(c.valor), 0);
    const cpf = $('#rbCpf', body).value.trim();
    $('#rbTxt', body).value = `RECIBO\n\nRecebi de ${p.nome}${cpf ? ', CPF ' + cpf : ''}, a quantia de ${brl(total)}, referente a ${sess.length} sessão(ões) de fisioterapia realizada(s) em ${sess.map(c => fromIso(c.data).toLocaleDateString('pt-BR')).join(', ')}.\n\n${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n_____________________________\n${prof() || 'Nome · CREFITO'}`;
  };
  $('#rbMes', body).onchange = build;
  $('#rbCpf', body).oninput = build;
  build();
  $('#rbShare', body).onclick = () => shareText('Recibo', $('#rbTxt', body).value);
  $('#rbCopy', body).onclick = () => copyText($('#rbTxt', body).value);
}

function renderFinanceiro(el, refresh) {
  const d = load();
  const pac = id => d.pacientes.find(p => p.id === id)?.nome || '(removido)';
  const doMes = d.consultas.filter(c => c.data.startsWith(finMes) && c.status === 'realizada' && c.valor);
  const pagas = doMes.filter(c => c.pago);
  const pendentes = d.consultas.filter(c => c.status === 'realizada' && c.valor && !c.pago).sort((a, b) => a.data.localeCompare(b.data));
  const lanc = d.lancamentos.filter(l => l.data.startsWith(finMes)).sort((a, b) => b.data.localeCompare(a.data));
  const outrasReceitas = lanc.filter(l => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const despesas = lanc.filter(l => l.valor < 0).reduce((s, l) => s - l.valor, 0);
  const recebido = pagas.reduce((s, c) => s + Number(c.valor), 0) + outrasReceitas;
  const aReceber = doMes.filter(c => !c.pago).reduce((s, c) => s + Number(c.valor), 0);
  const linhas = [...pagas.map(c => ({ data: c.data, desc: 'Sessão · ' + pac(c.pacId), valor: Number(c.valor), forma: c.forma })), ...lanc]
    .sort((a, b) => b.data.localeCompare(a.data));
  const label = fromIso(finMes + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  el.innerHTML = `
    <div class="row between" style="margin:6px 0 8px">
      <button type="button" class="ghost small" data-m="-1" aria-label="Mês anterior">‹</button>
      <b>${label.charAt(0).toUpperCase() + label.slice(1)}</b>
      <button type="button" class="ghost small" data-m="1" aria-label="Próximo mês">›</button>
    </div>
    <div class="grid2" style="grid-template-columns:repeat(2,1fr);gap:8px">
      <div class="card stat"><small>Recebido</small><div class="result" style="color:var(--ok)">${brl(recebido)}</div></div>
      <div class="card stat"><small>A receber (mês)</small><div class="result" style="color:var(--warn)">${brl(aReceber)}</div></div>
      <div class="card stat"><small>Despesas</small><div class="result" style="color:var(--bad)">${brl(despesas)}</div></div>
      <div class="card stat"><small>Saldo</small><div class="result">${brl(recebido - despesas)}</div></div>
    </div>
    <p class="muted" style="font-size:.85rem">${doMes.length} sessão(ões) realizada(s) no mês · ${d.consultas.filter(c => c.data.startsWith(finMes) && c.status === 'faltou').length} falta(s)</p>

    <div class="row"><button type="button" class="soft small" id="fRec">＋ Receita avulsa</button><button type="button" class="soft small" id="fDesp">＋ Despesa</button><button type="button" class="ghost small" id="fCsv">⬇ Planilha do mês</button></div>

    <h2>Pendentes (todos os meses)</h2>
    ${pendentes.length ? `<div class="card">${pendentes.map(c => `
      <div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line)">
        <span><b>${esc(pac(c.pacId))}</b><br><small class="muted">${fmtDia(c.data)} · ${brl(c.valor)}</small></span>
        <button type="button" class="small" data-pagar="${c.id}">Recebi</button>
      </div>`).join('')}</div>` : '<p class="muted">Nenhuma sessão em aberto. 👏</p>'}

    <h2>Lançamentos do mês</h2>
    ${linhas.length ? `<div class="card"><table><tbody>
      ${linhas.map(l => `
        <tr><td>${fromIso(l.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td><td>${esc(l.desc)}${l.forma ? ` <small class="muted">· ${esc(l.forma)}</small>` : ''}</td>
        <td style="text-align:right;white-space:nowrap;color:${l.valor < 0 ? 'var(--bad)' : 'var(--ok)'}">${l.valor < 0 ? '−' : ''}${brl(Math.abs(l.valor))}${l.id ? ` <button type="button" class="x" data-rm-l="${l.id}" aria-label="Apagar lançamento" style="font-size:1rem">×</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted">Nada lançado neste mês.</p>'}
  `;
  $$('[data-m]', el).forEach(b => { b.onclick = () => { const [y, m] = finMes.split('-').map(Number); const x = new Date(y, m - 1 + Number(b.dataset.m), 15); finMes = iso(x).slice(0, 7); refresh(); }; });
  $$('[data-pagar]', el).forEach(b => { b.onclick = () => receberPendentes([b.dataset.pagar], refresh); });
  $('#fRec', el).onclick = () => openLancamento(1, refresh);
  $('#fDesp', el).onclick = () => openLancamento(-1, refresh);
  $$('[data-rm-l]', el).forEach(b => {
    b.onclick = () => {
      if (!confirm('Apagar este lançamento?')) return;
      const dd = load();
      dd.lancamentos = dd.lancamentos.filter(l => l.id !== b.dataset.rmL);
      persist(dd);
      refresh();
    };
  });
  $('#fCsv', el).onclick = () => {
    const rows = [['Data', 'Descrição', 'Forma', 'Valor'],
      ...pagas.map(c => [c.data, 'Sessão - ' + pac(c.pacId), c.forma || '', Number(c.valor)]),
      ...doMes.filter(c => !c.pago).map(c => [c.data, 'A receber - ' + pac(c.pacId), '', Number(c.valor)]),
      ...lanc.map(l => [l.data, l.desc, l.forma || '', l.valor])];
    const csv = '﻿' + rows.map(r => r.map(v => typeof v === 'number' ? String(v).replace('.', ',') : `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `financeiro-${finMes}.csv` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
}

function openLancamento(sinal, refresh) {
  const body = openSheet(sinal > 0 ? 'Receita avulsa' : 'Despesa', `
    <form id="lForm">
      <label for="lDesc">Descrição</label><input id="lDesc" required placeholder="${sinal > 0 ? 'Ex.: avaliação domiciliar, pacote' : 'Ex.: aluguel da sala, faixas elásticas, CREFITO'}" />
      <div class="field2">
        <div><label for="lValor">Valor (R$)</label><input id="lValor" required inputmode="decimal" /></div>
        <div><label for="lData">Data</label><input id="lData" type="date" value="${hoje()}" /></div>
      </div>
      <label for="lForma">Forma</label><select id="lForma">${FORMAS.map(f => `<option>${f}</option>`).join('')}</select>
      <button type="submit" style="width:100%;margin-top:12px">Lançar</button>
    </form>`);
  $('#lForm', body).onsubmit = e => {
    e.preventDefault();
    const v = num($('#lValor', body).value);
    if (!v) return toast('Valor inválido');
    const d = load();
    d.lancamentos.push({ id: uid(), desc: $('#lDesc', body).value.trim(), valor: sinal * Math.abs(v), data: $('#lData', body).value || hoje(), forma: $('#lForma', body).value });
    persist(d);
    closeSheet();
    refresh();
  };
}

/* ---------------- Ajustes, backup e PIN ---------------- */

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fisiopalma:' + text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function renderLock(root, sub, arg) {
  root.innerHTML = `<div class="card" style="max-width:360px;margin:40px auto;text-align:center">
    <div class="big" style="font-size:2.4rem">🔒</div>
    <h2>Clínica protegida</h2>
    <form id="lockForm"><input id="lockPin" type="password" inputmode="numeric" autocomplete="current-password" placeholder="PIN" style="text-align:center;font-size:1.4rem;letter-spacing:.3em" />
    <button type="submit" style="width:100%;margin-top:10px">Entrar</button></form>
  </div>`;
  $('#lockPin', root).focus();
  $('#lockForm', root).onsubmit = async e => {
    e.preventDefault();
    if (await sha($('#lockPin', root).value) === store.get('pinHash', '')) {
      sessionStorage.setItem('fp:unlocked', '1');
      renderClinica(root, sub, arg);
    } else {
      toast('PIN incorreto');
      $('#lockPin', root).value = '';
    }
  };
}

function renderAjustes(el, refresh) {
  const d = load();
  el.innerHTML = `
    <div class="card">
      <h3>Seus dados profissionais</h3>
      <label for="aProf">Nome e CREFITO (vai nos recibos, fichas e mensagens)</label>
      <input id="aProf" value="${esc(prof())}" placeholder="Dra. Ana Lima · CREFITO-3 000000-F" />
      <label for="aTel">Seu WhatsApp (recebe relatórios dos pacientes)</label>
      <input id="aTel" type="tel" inputmode="tel" value="${esc(store.get('profTel', ''))}" />
      <button type="button" class="small" id="aSave" style="margin-top:10px">Salvar</button>
    </div>

    <div class="card">
      <h3>🔒 PIN da Clínica</h3>
      <p class="muted" style="font-size:.88rem">Pede um PIN para abrir esta aba no aparelho. É uma trava de tela, não criptografia: proteja também o celular com senha.</p>
      ${store.get('pinHash', '')
        ? '<button type="button" class="ghost small" id="aPinOff">Remover PIN</button> <button type="button" class="ghost small" id="aLock">Bloquear agora</button>'
        : '<div class="row" style="flex-wrap:nowrap"><input id="aPin" type="password" inputmode="numeric" placeholder="4 a 8 números" autocomplete="new-password" /><button type="button" class="small" id="aPinOn">Definir</button></div>'}
    </div>

    <div class="card">
      <h3>💾 Backup</h3>
      <p class="muted" style="font-size:.88rem">${d.pacientes.length} pacientes · ${d.consultas.length} atendimentos · ${store.get('fichas', []).length} programas. Tudo fica só neste aparelho: baixe o backup toda semana e guarde em local seguro.</p>
      <div class="row">
        <button type="button" class="small" id="aExp">⬇ Baixar backup da clínica</button>
        <label class="btn soft small" style="margin:0">⬆ Restaurar<input type="file" id="aImp" accept="application/json" hidden /></label>
      </div>
    </div>

    <div class="notice">Dados de saúde são sensíveis pela LGPD. Peça o consentimento do paciente, guarde só o necessário e não compartilhe o backup.</div>
  `;
  $('#aSave', el).onclick = () => { store.set('profAssinatura', $('#aProf', el).value.trim()); store.set('profTel', $('#aTel', el).value.trim()); toast('Salvo'); };
  const on = $('#aPinOn', el);
  if (on) on.onclick = async () => {
    const pin = $('#aPin', el).value.trim();
    if (!/^\d{4,8}$/.test(pin)) return toast('Use de 4 a 8 números');
    store.set('pinHash', await sha(pin));
    sessionStorage.setItem('fp:unlocked', '1');
    toast('PIN definido');
    refresh();
  };
  const off = $('#aPinOff', el);
  if (off) off.onclick = () => { if (confirm('Remover o PIN?')) { store.set('pinHash', ''); refresh(); } };
  const lock = $('#aLock', el);
  if (lock) lock.onclick = () => { sessionStorage.removeItem('fp:unlocked'); refresh(); };
  $('#aExp', el).onclick = () => {
    const payload = { app: 'fisiopalma-clinica', version: 1, exportedAt: new Date().toISOString(), clinica: load(), fichas: store.get('fichas', []), profAssinatura: prof(), profTel: store.get('profTel', '') };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: `clinica-fisiopalma-${hoje()}.json` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Backup baixado');
  };
  $('#aImp', el).onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== 'fisiopalma-clinica') throw new Error('formato');
      if (!confirm('Restaurar vai substituir os dados da clínica deste aparelho. Continuar?')) return;
      persist({ ...empty(), ...data.clinica });
      store.set('fichas', data.fichas || []);
      if (data.profAssinatura) store.set('profAssinatura', data.profAssinatura);
      if (data.profTel) store.set('profTel', data.profTel);
      toast('Backup restaurado');
      refresh();
    } catch {
      toast('Esse arquivo não é um backup da clínica');
    }
  };
}
