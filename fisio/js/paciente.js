// Tela do paciente: abre o programa pelo link, marca séries, cronometra, registra dor e
// manda o relatório de volta para o fisioterapeuta. Tudo fica no celular do paciente.

import { $, esc, toast, store, openSheet, closeSheet, shareText } from './util.js';
import { resolveItem, decodeData, encodeData, appBase, ytSearch, adherence, DIAS } from './exercicios.js';

const view = $('#view');
const todayKey = () => new Date().toLocaleDateString('sv'); // AAAA-MM-DD local
const DIF = { facil: 'Fácil', ok: 'No ponto', dificil: 'Difícil' };

let prog = null;
let state = null; // progresso da sessão atual: { date, series: { idx: nFeitas } }
let timer = null;

const progs = () => store.get('pac:progs', {});
const logsOf = id => store.get('pac:logs:' + id, []);

async function boot() {
  const hash = location.hash.slice(1);
  const params = new URLSearchParams(hash);
  try {
    if (params.get('p')) {
      const p = await decodeData(params.get('p'));
      if (!p?.id || !Array.isArray(p.it)) throw new Error('programa');
      const all = progs();
      all[p.id] = { ...p, recebido: Date.now() };
      store.set('pac:progs', all);
      history.replaceState(null, '', '#id=' + encodeURIComponent(p.id));
      prog = all[p.id];
    } else if (params.get('id')) {
      prog = progs()[params.get('id')] || null;
    }
  } catch {
    view.innerHTML = `<div class="card empty"><div class="big">⚠️</div><p>Esse link de exercícios está incompleto. Peça para o seu fisioterapeuta enviar de novo.</p></div>`;
    return;
  }
  if (!prog) {
    const list = Object.values(progs()).sort((a, b) => b.recebido - a.recebido);
    if (list.length === 1) { prog = list[0]; history.replaceState(null, '', '#id=' + encodeURIComponent(prog.id)); }
    else return renderList(list);
  }
  loadState();
  render();
}

function renderList(list) {
  view.innerHTML = list.length
    ? `<h1>Seus programas</h1>${list.map(p => `<a class="card row between" style="text-decoration:none;color:inherit" href="#id=${encodeURIComponent(p.id)}">
        <span><b>${esc(p.prof || 'Programa de exercícios')}</b><br><small class="muted">${p.it.length} exercícios · recebido em ${new Date(p.recebido).toLocaleDateString('pt-BR')}</small></span><span>›</span></a>`).join('')}`
    : `<div class="card empty"><div class="big">🏠</div><p><b>Nenhum programa ainda.</b><br>Abra o link que o seu fisioterapeuta mandou pelo WhatsApp.</p></div>`;
}
window.addEventListener('hashchange', () => { prog = null; boot(); });

function loadState() {
  const saved = store.get('pac:hoje:' + prog.id, null);
  state = saved && saved.date === todayKey() ? saved : { date: todayKey(), series: {} };
}
const saveState = () => store.set('pac:hoje:' + prog.id, state);

// "3 × 12" → 3 séries; "10 × 10 s" → 10 séries com 10 s cada; sem número → 1
function parseDose(dose) {
  const series = Number((dose.match(/^\s*(\d+)\s*×/) || [])[1]) || 1;
  const sec = Number((dose.match(/(\d+)\s*s\b/) || [])[1]) || 0;
  const min = Number((dose.match(/(\d+)\s*min\b/) || [])[1]) || 0;
  return { series: Math.min(series, 20), hold: sec || min * 60 };
}

function render() {
  const items = prog.it.map(resolveItem);
  const logs = logsOf(prog.id);
  const isDay = !prog.dias?.length || prog.dias.includes(new Date().getDay());
  const doneCount = items.filter((it, i) => (state.series[i] || 0) >= parseDose(it.dose).series).length;
  const sessionsToday = logs.filter(l => new Date(l.t).toLocaleDateString('sv') === todayKey()).length;
  const ad = adherence(logs, prog.dias, prog.vezes);

  view.innerHTML = `
    <h1>Olá${prog.pac ? ', ' + esc(prog.pac) : ''}! 👋</h1>
    <p class="muted">${prog.prof ? `Programa de <b>${esc(prog.prof)}</b>` : 'Seu programa de exercícios'}${prog.freq ? ' · ' + esc(prog.freq) : ''}</p>
    ${prog.dias?.length ? `<p class="muted" style="margin-top:-6px">Dias: ${prog.dias.map(d => DIAS[d]).join(', ')}</p>` : ''}

    <div class="card">
      <div class="row between">
        <b>${isDay ? (sessionsToday ? `Hoje: ${sessionsToday} sessão(ões) feita(s) ✔` : 'Hoje é dia de exercício') : 'Hoje é dia de descanso 😌'}</b>
        <span class="tag ${ad >= 80 ? 'ok' : ad >= 50 ? 'warn' : 'bad'}">${ad}% na semana</span>
      </div>
      <div class="progress" style="margin-top:10px"><i style="width:${items.length ? (doneCount / items.length) * 100 : 0}%"></i></div>
      <small class="muted">${doneCount} de ${items.length} exercícios nesta sessão</small>
      ${streakHTML(logs)}
    </div>

    ${prog.obs ? `<div class="notice"><b>Recado do fisio:</b> ${esc(prog.obs)}</div>` : ''}

    <div id="exList">${items.map((it, i) => exerciseHTML(it, i)).join('')}</div>

    <div class="card" id="finish">
      <h3>Como foi a sessão?</h3>
      <label>Dor durante os exercícios (0 = nenhuma, 10 = a pior)</label>
      <div class="pain-scale" id="dor">${Array.from({ length: 11 }, (_, i) => `<button type="button" data-p="${i}" style="background:hsl(${120 - i * 12} 60% 42%)">${i}</button>`).join('')}</div>
      <label>Dificuldade</label>
      <div class="chips" id="dif">${Object.entries(DIF).map(([k, v]) => `<button type="button" class="chip" data-d="${k}">${v}</button>`).join('')}</div>
      <label for="obs">Quer contar algo? (opcional)</label>
      <textarea id="obs" placeholder="Ex.: doeu mais no exercício 3, senti o joelho estalar..."></textarea>
      <button type="button" id="saveSession" style="width:100%;margin-top:10px">Salvar sessão</button>
    </div>

    <div class="row">
      <button type="button" class="soft" id="report">📤 Enviar relatório ao fisio</button>
      <button type="button" class="ghost" id="remind">📅 Lembrete na agenda</button>
      <button type="button" class="ghost" id="print">🖨️ Imprimir</button>
    </div>

    ${historyHTML(logs)}

    <div class="notice bad" style="margin-top:16px">
      <b>Pare e fale com o seu fisioterapeuta</b> se a dor passar de 5 e não melhorar até o dia seguinte, se aparecer inchaço, formigamento ou fraqueza novos.
      <b>Procure atendimento de urgência (SAMU 192)</b> se sentir dor no peito, falta de ar forte, ou perder o controle da urina ou das fezes.
    </div>
    <p class="muted" style="font-size:.78rem">Seus registros ficam só neste celular. Eles só vão para o fisioterapeuta quando você tocar em "Enviar relatório".</p>
  `;

  $('#exList').onclick = onExerciseClick;
  let dor = null, dif = null;
  $('#dor').onclick = e => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    dor = Number(b.dataset.p);
    [...$('#dor').children].forEach(x => { x.style.outline = x === b ? '3px solid var(--ink)' : ''; });
  };
  $('#dif').onclick = e => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    dif = b.dataset.d;
    [...$('#dif').children].forEach(x => x.classList.toggle('on', x === b));
  };
  $('#saveSession').onclick = () => {
    const done = items.filter((it, i) => (state.series[i] || 0) > 0).length;
    if (!done) return toast('Marque pelo menos um exercício feito');
    if (dor === null) return toast('Diga quanto doeu (0 a 10)');
    const list = logsOf(prog.id);
    list.push({ t: Date.now(), d: doneCount, n: items.length, dor, dif: dif || '', o: $('#obs').value.trim() });
    store.set('pac:logs:' + prog.id, list.slice(-200));
    state = { date: todayKey(), series: {} };
    saveState();
    toast(dor > 5 ? 'Salvo. Dor alta: avise seu fisioterapeuta.' : 'Sessão salva! Muito bem 💪');
    render();
    window.scrollTo(0, 0);
  };
  $('#report').onclick = sendReport;
  $('#remind').onclick = openReminder;
  $('#print').onclick = () => window.print();
}

function exerciseHTML(it, i) {
  const { series, hold } = parseDose(it.dose);
  const done = state.series[i] || 0;
  const complete = done >= series;
  return `<div class="card ex-card ${complete ? 'done' : ''}" data-i="${i}">
    <div class="row between" style="flex-wrap:nowrap;align-items:flex-start">
      <h3 style="margin:0">${i + 1}. ${esc(it.n)}</h3>
      <span class="tag ${complete ? 'ok' : ''}">${esc(it.dose)}</span>
    </div>
    <p style="margin:.5rem 0">${esc(it.d)}</p>
    <div class="row">
      ${Array.from({ length: series }, (_, s) => `<button type="button" class="serie ${s < done ? 'on' : ''}" data-serie="${s}" aria-label="Série ${s + 1}">${s < done ? '✓' : s + 1}</button>`).join('')}
    </div>
    <div class="row" style="margin-top:8px">
      ${hold ? `<button type="button" class="soft small" data-timer="${hold}">⏱️ ${hold >= 60 ? Math.round(hold / 60) + ' min' : hold + ' s'}</button>` : ''}
      <a class="btn ghost small" href="${esc(it.v || ytSearch(it.n))}" target="_blank" rel="noopener noreferrer">▶ ${it.v ? 'Ver vídeo do fisio' : 'Ver como fazer'}</a>
    </div>
  </div>`;
}

function onExerciseClick(e) {
  const card = e.target.closest('[data-i]');
  if (!card) return;
  const i = Number(card.dataset.i);
  const s = e.target.closest('[data-serie]');
  if (s) {
    const n = Number(s.dataset.serie);
    // tocar na próxima série marca; tocar na última marcada desfaz
    state.series[i] = (state.series[i] || 0) === n + 1 ? n : n + 1;
    saveState();
    if (navigator.vibrate) navigator.vibrate(30);
    render();
    return;
  }
  const t = e.target.closest('[data-timer]');
  if (t) startTimer(Number(t.dataset.timer));
}

function startTimer(seconds) {
  clearInterval(timer);
  let left = seconds;
  const body = openSheet('Segure...', `<div class="result" id="tLeft" style="font-size:4rem;text-align:center">${left}</div>
    <p class="muted" style="text-align:center">Respire normalmente, não prenda o ar.</p>
    <button type="button" class="ghost" id="tStop" style="width:100%">Parar</button>`);
  const tick = () => {
    left--;
    const el = $('#tLeft', body);
    if (!el) return clearInterval(timer);
    el.textContent = left >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : left;
    if (left <= 0) {
      clearInterval(timer);
      el.textContent = 'Pronto! ✓';
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(closeSheet, 1200);
    }
  };
  timer = setInterval(tick, 1000);
  $('#tStop', body).onclick = () => { clearInterval(timer); closeSheet(); };
}

function streakHTML(logs) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('sv');
    const did = logs.some(l => new Date(l.t).toLocaleDateString('sv') === key);
    const planned = !prog.dias?.length || prog.dias.includes(d.getDay());
    days.push(`<span title="${d.toLocaleDateString('pt-BR')}" class="day ${did ? 'did' : planned ? 'miss' : 'rest'}">${DIAS[d.getDay()][0]}</span>`);
  }
  return `<div class="streak" aria-label="Últimos 14 dias">${days.join('')}</div>`;
}

function historyHTML(logs) {
  if (!logs.length) return '';
  const last = logs.slice(-8).reverse();
  return `<h2>Histórico</h2><div class="card"><table><thead><tr><th>Dia</th><th>Feitos</th><th>Dor</th><th>Dificuldade</th></tr></thead><tbody>
    ${last.map(l => `<tr><td>${new Date(l.t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td><td>${l.d}/${l.n}</td><td>${l.dor}</td><td>${DIF[l.dif] || '—'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

async function sendReport() {
  const logs = logsOf(prog.id);
  if (!logs.length) return toast('Salve pelo menos uma sessão antes');
  const payload = { v: 1, pid: prog.id, pac: prog.pac, ger: Date.now(), logs: logs.slice(-60) };
  const link = appBase() + '#/relatorio/' + await encodeData(payload);
  const last7 = logs.filter(l => l.t > Date.now() - 7 * 86_400_000);
  const dores = logs.slice(-5).map(l => l.dor).join(' → ');
  const text = [
    `Relatório de exercícios${prog.pac ? ' · ' + prog.pac : ''}`,
    `Últimos 7 dias: ${last7.length} sessões (${adherence(logs, prog.dias, prog.vezes)}% do combinado)`,
    `Dor nas últimas sessões: ${dores}`,
    logs.at(-1).o ? `Comentário: ${logs.at(-1).o}` : '',
    '',
    `Abrir no FisioPalma: ${link}`,
  ].filter(Boolean).join('\n');
  const tel = (prog.tel || '').replace(/\D/g, '');
  if (tel) window.open(`https://wa.me/${tel.length <= 11 ? '55' + tel : tel}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  else shareText('Relatório de exercícios', text);
}

function openReminder() {
  const body = openSheet('Lembrete na agenda', `
    <p>Cria um evento que se repete ${prog.dias?.length ? 'nos dias combinados' : 'todo dia'} no calendário do seu celular.</p>
    <label for="rTime">Horário</label>
    <input id="rTime" type="time" value="${store.get('pac:hora', '08:00')}" />
    <button type="button" id="rGo" style="width:100%;margin-top:12px">Adicionar à agenda</button>`);
  $('#rGo', body).onclick = () => {
    const [h, m] = $('#rTime', body).value.split(':');
    store.set('pac:hora', `${h}:${m}`);
    const start = new Date();
    start.setHours(Number(h), Number(m), 0, 0);
    if (start < new Date()) start.setDate(start.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    const dt = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const byday = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const rule = prog.dias?.length ? `FREQ=WEEKLY;BYDAY=${prog.dias.map(d => byday[d]).join(',')}` : 'FREQ=DAILY';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FisioPalma//PT-BR', 'BEGIN:VEVENT',
      `UID:${prog.id}-${Date.now()}@fisiopalma`, `DTSTAMP:${dt(new Date())}`, `DTSTART:${dt(start)}`, 'DURATION:PT20M',
      `RRULE:${rule}`, 'SUMMARY:Exercícios de fisioterapia 💪', `DESCRIPTION:Abra seus exercícios: ${location.href}`,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Hora dos exercícios', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    Object.assign(document.createElement('a'), { href: url, download: 'lembrete-exercicios.ics' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    closeSheet();
    toast('Abra o arquivo baixado para salvar na agenda');
  };
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
boot();
