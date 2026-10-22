/* =========================================================
   LIDO · main
   Rotas, desenho, cronômetro da vela, folhas (dialogs) e eventos.
   ========================================================= */

/* ---------- Rotas (#/hoje, #/estante, #/livro/<id>, #/ler, #/revisar, #/perfil) ---------- */
const VIEWS = { hoje: viewHoje, estante: viewEstante, livro: viewLivro, ler: viewLer, revisar: viewRevisar, perfil: viewPerfil };
const ui = { route: null, medals: new Set(earnedMedals().map(m => m.id)) };

function parseRoute() {
  const [, name, id] = (location.hash || '').match(/^#\/([a-z]+)(?:\/(.+))?$/) || [];
  return VIEWS[name] ? { name, id: id ? decodeURIComponent(id) : null } : { name: 'hoje', id: null };
}

function go(path) {
  if (location.hash === path) render();
  else location.hash = path;
}

function render() {
  const viewEl = $('#view');
  if (!state.settings.onboarded) {
    document.documentElement.classList.add('onboarding');
    viewEl.innerHTML = viewOnboarding();
    icons();
    return;
  }
  document.documentElement.classList.remove('onboarding');

  // Sessão em andamento: o app fica preso na tela da vela
  if (state.active && location.hash !== '#/ler') { history.replaceState(null, '', '#/ler'); }

  const prev = ui.route?.name;
  ui.route = parseRoute();
  viewEl.innerHTML = VIEWS[ui.route.name](ui.route.id);
  if (prev !== ui.route.name) window.scrollTo(0, 0);

  const nav = ui.route.name === 'livro' ? 'estante' : ui.route.name;
  $$('[data-nav]').forEach(a => (a.dataset.nav === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  const due = dueNotes().length;
  $$('[data-due]').forEach(el => { el.textContent = due; el.hidden = !due; });
  const lv = levelInfo();
  $('#lvlChip').innerHTML = `<b>${lv.level}</b>${lv.title}`;
  document.documentElement.classList.toggle('in-session', !!state.active);

  icons();
  tick();
}

/** Salva, redesenha e avisa de medalhas novas */
function commit() {
  saveState();
  const now = earnedMedals();
  const fresh = now.filter(m => !ui.medals.has(m.id));
  ui.medals = new Set(now.map(m => m.id));
  if (fresh.length) setTimeout(() => toast(`Medalha nova: ${fresh.map(m => m.title).join(', ')}`, true), 400);
  render();
}

/* ---------- Cronômetro da vela ---------- */
let targetWarned = false;

function tick() {
  const a = state.active;
  if (!a) return;
  const ms = Date.now() - a.start;
  const timer = $('#timer');
  if (timer) timer.textContent = clock(ms);
  // A cera derrete até a meta; sem meta, gasta em 60 min
  const span = (a.target || 60) * MIN;
  const left = Math.round(100 - clamp(ms / span, 0, 1) * 80);
  const wax = $('#wax');
  if (wax) wax.style.height = `${left}%`;
  const flame = $('.flame');
  if (flame) flame.style.bottom = `${6 + left * 2}px`;   // a cera tem 200px: a chama fica no topo dela

  if (a.target && ms >= a.target * MIN && !targetWarned) {
    targetWarned = true;
    navigator.vibrate?.([120, 60, 120]);
    toast(`Meta de ${a.target} min cumprida. Pode continuar ou encerrar.`, true);
  }
}
setInterval(tick, 1000);

/* A vela apaga se a pessoa fica fora do app por mais de CANDLE_GRACE */
function markAway() {
  if (state.active && !state.active.awayAt) { state.active.awayAt = Date.now(); saveState(); }
}
function checkReturn() {
  const a = state.active;
  if (!a?.awayAt) return;
  const away = Date.now() - a.awayAt;
  a.awayAt = null;
  if (a.lit && away > CANDLE_GRACE) {
    a.lit = false;
    toast('A vela apagou: você ficou fora do app.');
    navigator.vibrate?.(200);
  }
  saveState();
  render();
}
document.addEventListener('visibilitychange', () => (document.hidden ? markAway() : checkReturn()));
window.addEventListener('pagehide', markAway);

/* Impede fechar a aba sem querer no meio da sessão */
window.addEventListener('beforeunload', e => { if (state.active) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Ações de livro ---------- */
function openBookDialog(id = null) {
  const b = id ? bookById(id) : null;
  const f = $('#bookForm');
  f.reset();
  f.id.value = b?.id || '';
  f.title.value = b?.title || '';
  f.author.value = b?.author || '';
  f.pages.value = b?.pages || '';
  f.current.value = b?.current || '';
  f.status.value = b?.status || 'lendo';
  const color = b?.color || BOOK_COLORS[state.books.length % BOOK_COLORS.length];
  $('#colorPick').innerHTML = BOOK_COLORS.map(c => `
    <label class="swatch" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === color ? 'checked' : ''}><span></span></label>`).join('');
  $('#bookTitle').textContent = b ? 'Editar livro' : 'Novo livro';
  $('#delBook').hidden = !b;
  $('#dlgBook').showModal();
  setTimeout(() => f.title.focus(), 50);
}

function saveBook(f) {
  const data = {
    title: f.title.value.trim(),
    author: f.author.value.trim(),
    pages: Math.max(0, parseInt(f.pages.value, 10) || 0),
    status: f.status.value,
    color: f.color.value || BOOK_COLORS[0],
  };
  data.current = clamp(parseInt(f.current.value, 10) || 0, 0, data.pages || Infinity);
  if (!data.title) return toast('Dê um título ao livro.');

  let b = bookById(f.id.value);
  if (b) {
    if (data.status === 'lido' && b.status !== 'lido') b.finishedAt = Date.now();
    Object.assign(b, data);
  } else {
    b = { id: uid(), addedAt: Date.now(), finishedAt: data.status === 'lido' ? Date.now() : null, ...data };
    state.books.push(b);
  }
  $('#dlgBook').close();
  commit();
  if (!f.id.value) go(`#/livro/${b.id}`);
}

function finishBook(id) {
  const b = bookById(id);
  if (!b) return;
  b.status = 'lido';
  b.finishedAt = Date.now();
  if (b.pages) b.current = b.pages;
  toast(`"${b.title}" foi para os lidos. +50 XP`, true);
  commit();
}

/* ---------- Sessão ---------- */
function openStart(bookId) {
  const b = bookById(bookId);
  if (!b) return;
  const f = $('#startForm');
  f.bookId.value = b.id;
  f.fromPage.value = b.current || '';
  $('#startTitle').textContent = b.title;
  $('#dlgStart').showModal();
}

function startSession(f) {
  state.active = {
    bookId: f.bookId.value,
    start: Date.now(),
    target: parseInt(f.target.value, 10) || 0,
    fromPage: parseInt(f.fromPage.value, 10) || 0,
    awayAt: null,
    lit: true,
  };
  targetWarned = false;
  $('#dlgStart').close();
  saveState();
  go('#/ler');
}

function openStop() {
  const a = state.active;
  if (!a) return;
  const b = bookById(a.bookId);
  const f = $('#stopForm');
  f.reset();
  f.toPage.value = a.fromPage || '';
  if (b?.pages) f.toPage.max = b.pages;
  $('#stopSummary').textContent = `${formatMinutes(Date.now() - a.start)} de leitura${a.lit ? ', vela acesa até o fim.' : '.'}`;
  $('#dlgStop').showModal();
}

function stopSession(f) {
  const a = state.active;
  if (!a) return;
  const end = Date.now();
  const b = bookById(a.bookId);
  const toPage = parseInt(f.toPage.value, 10) || a.fromPage;
  state.sessions.push({ id: uid(), bookId: a.bookId, start: a.start, end, ms: end - a.start, fromPage: a.fromPage, toPage, lit: a.lit });
  if (b && toPage > b.current) b.current = b.pages ? Math.min(toPage, b.pages) : toPage;
  const text = f.text.value.trim();
  if (text) addNote(a.bookId, text, '', toPage);
  state.active = null;
  $('#dlgStop').close();
  const gained = Math.floor((end - a.start) / MIN) + (a.lit && end - a.start >= 5 * MIN ? 5 : 0) + (text ? 3 : 0);
  toast(`Sessão salva. +${gained} XP`, true);
  if (b?.pages && b.current >= b.pages && b.status !== 'lido') {
    setTimeout(() => { if (confirm(`Chegou ao fim de "${b.title}". Marcar como lido?`)) finishBook(b.id); }, 300);
  }
  commit();
  go(b ? `#/livro/${b.id}` : '#/hoje');
}

function cancelSession() {
  if (!confirm('Descartar esta sessão? O tempo não será salvo.')) return;
  state.active = null;
  saveState();
  go('#/hoje');
}

/* ---------- Notas ---------- */
function addNote(bookId, text, cue, page) {
  const at = Date.now();
  state.notes.push({ id: uid(), bookId, text, cue, page: page || null, at, box: 0, due: startOfDay(at) + REVIEW_STEPS[0] * DAY + 4 * HOUR });
}

function openNote(bookId) {
  const f = $('#noteForm');
  f.reset();
  f.bookId.value = bookId;
  const b = bookById(bookId);
  f.page.value = b?.current || '';
  $('#dlgNote').showModal();
  setTimeout(() => f.text.focus(), 50);
}

function saveNote(f) {
  const text = f.text.value.trim();
  if (!text) return toast('Escreva a nota antes de salvar.');
  addNote(f.bookId.value, text, f.cue.value.trim(), parseInt(f.page.value, 10) || null);
  $('#dlgNote').close();
  toast('Nota salva. Ela volta para revisão amanhã.', true);
  commit();
}

/* ---------- Ditado por voz (quando o navegador tem reconhecimento de fala) ---------- */
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
let listening = null;

function toggleDictation(btn) {
  if (!Speech) return toast('Este navegador não tem ditado. Use o microfone do teclado.');
  if (listening) { listening.stop(); return; }
  const field = btn.closest('form').text;
  const rec = new Speech();
  rec.lang = 'pt-BR';
  rec.interimResults = false;
  rec.continuous = true;
  rec.onresult = e => {
    const said = [...e.results].slice(e.resultIndex).map(r => r[0].transcript).join(' ').trim();
    if (said) field.value = `${field.value.trim()} ${said}`.trim();
  };
  rec.onend = () => { listening = null; btn.classList.remove('rec'); };
  rec.onerror = e => { if (e.error === 'not-allowed') toast('Libere o microfone para ditar.'); };
  rec.start();
  listening = rec;
  btn.classList.add('rec');
}

/* ---------- Dados ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lido-${localDate()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.books)) throw new Error('formato');
    if (!confirm('Importar vai substituir os dados deste aparelho. Continuar?')) return;
    replaceState(data);
    ui.medals = new Set(earnedMedals().map(m => m.id));
    toast('Dados importados.', true);
    render();
  } catch {
    toast('Arquivo inválido. Use um backup exportado pelo LIDO.');
  }
}

async function share() {
  const lv = levelInfo();
  const text = `Estou no nível ${lv.level} (${lv.title}) no LIDO: ${formatMinutes(totalMs())} de leitura, ${streak()} dias seguidos e ${state.books.filter(b => b.status === 'lido').length} livros terminados.`;
  try {
    if (navigator.share) await navigator.share({ title: 'LIDO', text, url: location.origin + location.pathname });
    else { await navigator.clipboard.writeText(text); toast('Texto copiado.', true); }
  } catch { /* a pessoa fechou o compartilhamento */ }
}

/* ---------- Eventos ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const id = el.dataset.id;
  switch (el.dataset.act) {
    case 'add-book': openBookDialog(); break;
    case 'edit-book': openBookDialog(id); break;
    case 'finish': if (confirm('Marcar este livro como lido?')) finishBook(id); break;
    case 'start': state.active ? go('#/ler') : openStart(id); break;
    case 'stop': openStop(); break;
    case 'cancel': cancelSession(); break;
    case 'quick-note': openNote(state.active.bookId); break;
    case 'add-note': openNote(id); break;
    case 'del-note':
      if (confirm('Apagar esta nota?')) { state.notes = state.notes.filter(n => n.id !== id); commit(); }
      break;
    case 'dictate': toggleDictation(el); break;
    case 'reveal': {
      const card = $('#flash');
      $('.answer', card).hidden = false;
      $('.grade', card).hidden = false;
      el.hidden = true;
      break;
    }
    case 'grade': {
      const n = state.notes.find(x => x.id === id);
      if (n) reviewNote(n, el.dataset.ok === '1');
      commit();
      break;
    }
    case 'share': share(); break;
    case 'export': exportData(); break;
    case 'wipe':
      if (confirm('Apagar todos os livros, sessões e notas deste aparelho?') && confirm('Tem certeza? Não dá para desfazer.')) {
        replaceState(null);
        ui.medals = new Set();
        render();
      }
      break;
    case 'close': el.closest('dialog').close(); break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  const handlers = { bookForm: saveBook, startForm: startSession, stopForm: stopSession, noteForm: saveNote, onboardForm: finishOnboarding };
  if (!handlers[f.id]) return;
  e.preventDefault();
  handlers[f.id](f);
});

document.addEventListener('change', e => {
  if (e.target.id === 'setName') { state.settings.name = e.target.value.trim(); commit(); }
  if (e.target.id === 'setGoal') { state.settings.dailyGoal = parseInt(e.target.value, 10) || 20; commit(); }
  if (e.target.id === 'importFile' && e.target.files[0]) importData(e.target.files[0]);
});

$('#delBook').addEventListener('click', () => {
  const f = $('#bookForm');
  const b = bookById(f.id.value);
  if (!b || !confirm(`Apagar "${b.title}" com todas as sessões e notas?`)) return;
  state.books = state.books.filter(x => x.id !== b.id);
  state.sessions = state.sessions.filter(s => s.bookId !== b.id);
  state.notes = state.notes.filter(n => n.bookId !== b.id);
  if (state.active?.bookId === b.id) state.active = null;
  $('#dlgBook').close();
  commit();
  go('#/estante');
});

function finishOnboarding(f) {
  state.settings.name = f.name.value.trim();
  state.settings.dailyGoal = parseInt(f.goal.value, 10) || 20;
  state.settings.onboarded = true;
  const title = f.title.value.trim();
  if (title) {
    state.books.push({
      id: uid(), title, author: f.author.value.trim(), pages: Math.max(0, parseInt(f.pages.value, 10) || 0),
      current: 0, status: 'lendo', color: BOOK_COLORS[0], addedAt: Date.now(), finishedAt: null,
    });
  }
  commit();
  go('#/hoje');
}

/* ---------- Início ---------- */
window.addEventListener('hashchange', render);
// Voltou depois de fechar o app no meio da sessão: confere se a vela apagou
if (state.active?.awayAt) checkReturn();
render();
