/* =========================================================
   LIDO · core
   Configuração, utilitários, armazenamento, estado e regras
   (XP, nível, sequência, revisão espaçada e medalhas).
   ========================================================= */

/* ---------- Configuração ---------- */
const STORAGE_KEY = 'lido:v1';

const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;

const SESSION_OPTIONS = [10, 20, 30, 45, 60];   // minutos
const CANDLE_GRACE = 15_000;                    // tempo fora do app antes da vela apagar

// Caixas da revisão espaçada: lembrou, sobe uma caixa; esqueceu, volta para a primeira
const REVIEW_STEPS = [1, 3, 7, 16, 35, 90];     // dias

const BOOK_COLORS = ['#FF8A3D', '#5FB49C', '#6C8EEF', '#E0607E', '#C9A227', '#9B7BD4', '#4FB3D9', '#A3A3A3'];

const STATUS = {
  lendo: { label: 'Lendo', icon: 'book-open' },
  quero: { label: 'Quero ler', icon: 'bookmark' },
  lido:  { label: 'Lido', icon: 'book-check' },
};

const LEVEL_TITLES = ['Curioso', 'Folheador', 'Leitor', 'Leitor assíduo', 'Devorador', 'Traça', 'Erudito', 'Bibliotecário', 'Sábio', 'Lenda das letras'];

/* ---------- Utilitários ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = n => String(n).padStart(2, '0');
const uid = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const icons = () => window.lucide?.createIcons();
const esc = (s = '') => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const fmtDateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtToday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

/** "2h 15m", "40m", "0m" */
function formatMinutes(ms) {
  const m = Math.floor(Math.max(0, ms) / MIN);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${pad(m % 60)}m` : `${m}m`;
}

/** "12:04" para o cronômetro */
function clock(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

/** Data local no formato AAAA-MM-DD */
const localDate = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

/* ---------- Estado ---------- */
function emptyState() {
  return {
    version: 1,
    books: [],      // { id, title, author, pages, current, status, color, addedAt, finishedAt }
    sessions: [],   // { id, bookId, start, end, ms, fromPage, toPage, lit }
    notes: [],      // { id, bookId, text, cue, page, at, box, due }
    reviews: [],    // { at, ok }
    active: null,   // { bookId, start, target, fromPage, awayAt, lit }
    settings: { name: '', dailyGoal: 20, onboarded: false },
  };
}

function normalize(data) {
  const base = emptyState();
  const s = { ...base, ...(data || {}) };
  s.settings = { ...base.settings, ...(data?.settings || {}) };
  for (const k of ['books', 'sessions', 'notes', 'reviews']) if (!Array.isArray(s[k])) s[k] = [];
  s.books = s.books.map(b => ({ author: '', pages: 0, current: 0, status: 'lendo', color: BOOK_COLORS[0], finishedAt: null, ...b }));
  s.notes = s.notes.map(n => ({ cue: '', page: null, box: 0, due: n.at + REVIEW_STEPS[0] * DAY, ...n }));
  return s;
}

/* Armazenamento local, com plano B em memória (aba anônima, Safari restrito) */
const memoryStore = new Map();
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return memoryStore.get(key) ?? null; } },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { memoryStore.set(key, value); return false; }
  },
  json(key) { try { return JSON.parse(this.get(key) || 'null'); } catch { return null; } },
};

/* Cada conta tem sua cópia no aparelho; sem conta, fica na chave base */
const GUEST_KEY = 'lido:guest';
let accountId = null;
const dataKey = () => (accountId ? `${STORAGE_KEY}:${accountId}` : STORAGE_KEY);

const state = emptyState();

let storageWarned = false;
function saveState() {
  state._savedAt = Date.now();
  const ok = store.set(dataKey(), JSON.stringify(state));
  if (!ok && !storageWarned) {
    toast('Este navegador não está salvando os dados. Eles somem ao fechar.');
    storageWarned = true;
  }
  cloud.queueSave(state);
}

/** Troca todo o conteúdo do estado sem trocar o objeto */
function setState(data) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, normalize(data));
}

function replaceState(data) {
  setState(data);
  saveState();
}

/**
 * Carrega os dados da conta: compara a cópia do aparelho com a da nuvem e
 * fica com a mais nova. Na primeira entrada, leva junto o que foi feito sem conta.
 */
async function loadAccount(user) {
  accountId = user.id;
  let local = store.json(dataKey());
  if (!local) {
    const guest = store.json(STORAGE_KEY);
    if (guest?.books?.length) local = guest;
  }
  let remote = null;
  try { remote = await cloud.loadData(); } catch (err) { console.warn('[LIDO] Sem acesso à nuvem agora:', err.message); }

  const localAt = local?._savedAt || 0;
  if (remote && remote.updatedAt >= localAt - 2000) setState(remote.data);
  else if (local) { setState(local); saveState(); }   // aparelho tem coisa mais nova: sobe
  else setState(null);
  store.set(dataKey(), JSON.stringify(state));
}

function loadGuest() {
  accountId = null;
  setState(store.json(STORAGE_KEY));
}

/* ---------- Consultas ---------- */
const bookById = id => state.books.find(b => b.id === id);
const sessionsOf = id => state.sessions.filter(s => s.bookId === id);
const notesOf = id => state.notes.filter(n => n.bookId === id).sort((a, b) => b.at - a.at);
const readingNow = () => state.books.filter(b => b.status === 'lendo');

/** Livro sugerido para o botão "Ler": o último lido entre os que estão em andamento */
function currentBook() {
  const lendo = readingNow();
  if (!lendo.length) return null;
  const last = id => Math.max(0, ...sessionsOf(id).map(s => s.end));
  return [...lendo].sort((a, b) => (last(b.id) || b.addedAt) - (last(a.id) || a.addedAt))[0];
}

function bookProgress(b) {
  return b.pages > 0 ? clamp(b.current / b.pages, 0, 1) : 0;
}

/** Minutos lidos por dia: { 'AAAA-MM-DD': ms } */
function msByDay() {
  const map = {};
  for (const s of state.sessions) map[localDate(s.start)] = (map[localDate(s.start)] || 0) + s.ms;
  return map;
}

const msOnDay = (day = localDate()) => msByDay()[day] || 0;
const totalMs = () => state.sessions.reduce((t, s) => t + s.ms, 0);
const totalPages = () => state.sessions.reduce((t, s) => t + Math.max(0, (s.toPage ?? 0) - (s.fromPage ?? 0)), 0);

/** Dias seguidos com alguma leitura. Hoje ainda vazio não quebra a sequência. */
function streak() {
  const days = msByDay();
  let t = Date.now();
  if (!days[localDate(t)]) t -= DAY;
  let n = 0;
  while (days[localDate(t)]) { n++; t -= DAY; }
  return n;
}

function bestStreak() {
  const days = Object.keys(msByDay()).sort();
  let best = 0, run = 0, prev = null;
  for (const d of days) {
    const t = new Date(d + 'T12:00').getTime();
    run = prev !== null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

/** Ritmo em páginas por minuto (só sessões com página registrada) */
function pace(bookId) {
  const list = (bookId ? sessionsOf(bookId) : state.sessions).filter(s => s.toPage > s.fromPage && s.ms > MIN);
  const pages = list.reduce((t, s) => t + (s.toPage - s.fromPage), 0);
  const ms = list.reduce((t, s) => t + s.ms, 0);
  return ms > 0 ? pages / (ms / MIN) : 0;
}

/** Tempo estimado para terminar o livro, pelo ritmo dele (ou o geral) */
function timeToFinish(b) {
  const p = pace(b.id) || pace();
  if (!p || !b.pages) return null;
  return ((b.pages - b.current) / p) * MIN;
}

/* ---------- Revisão espaçada ---------- */
const dueNotes = () => state.notes.filter(n => n.due <= Date.now()).sort((a, b) => a.due - b.due);

function reviewNote(note, remembered) {
  note.box = remembered ? Math.min(note.box + 1, REVIEW_STEPS.length - 1) : 0;
  note.due = startOfDay(Date.now()) + REVIEW_STEPS[note.box] * DAY + 4 * HOUR;
  state.reviews.push({ at: Date.now(), ok: !!remembered });
}

/* ---------- XP e nível ---------- */
function xpBreakdown() {
  const minutes = Math.floor(totalMs() / MIN);
  const lit = state.sessions.filter(s => s.lit && s.ms >= 5 * MIN).length * 5;
  const notes = state.notes.length * 3;
  const reviews = state.reviews.length;
  const finished = state.books.filter(b => b.status === 'lido').length * 50;
  return { minutes, lit, notes, reviews, finished, total: minutes + lit + notes + reviews + finished };
}

/** Nível n precisa de 60·n·(n+1)/2 XP acumulado */
function levelInfo(xp = xpBreakdown().total) {
  let level = 1;
  while (xp >= 30 * level * (level + 1)) level++;
  const floor = 30 * (level - 1) * level;
  const next = 30 * level * (level + 1);
  return {
    level, xp, floor, next,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    pct: (xp - floor) / (next - floor),
  };
}

/* ---------- Medalhas ---------- */
const MEDALS = [
  { id: 'primeira', icon: 'flame', title: 'Primeira chama', desc: 'Termine uma sessão de leitura', test: () => state.sessions.length >= 1 },
  { id: 'seq3', icon: 'calendar-check', title: '3 dias seguidos', desc: 'Leia três dias em sequência', test: () => bestStreak() >= 3 },
  { id: 'seq7', icon: 'calendar-days', title: 'Semana cheia', desc: 'Leia sete dias em sequência', test: () => bestStreak() >= 7 },
  { id: 'seq30', icon: 'calendar-heart', title: 'Mês de leitura', desc: 'Leia trinta dias em sequência', test: () => bestStreak() >= 30 },
  { id: 'livro1', icon: 'book-check', title: 'Fim', desc: 'Termine seu primeiro livro', test: () => state.books.some(b => b.status === 'lido') },
  { id: 'livro5', icon: 'library', title: 'Estante cheia', desc: 'Termine cinco livros', test: () => state.books.filter(b => b.status === 'lido').length >= 5 },
  { id: 'h10', icon: 'hourglass', title: '10 horas', desc: 'Some dez horas de leitura', test: () => totalMs() >= 10 * HOUR },
  { id: 'h50', icon: 'gem', title: '50 horas', desc: 'Some cinquenta horas de leitura', test: () => totalMs() >= 50 * HOUR },
  { id: 'maratona', icon: 'timer', title: 'Maratona', desc: 'Leia 60 minutos sem parar', test: () => state.sessions.some(s => s.ms >= 60 * MIN) },
  { id: 'vela', icon: 'shield-check', title: 'Chama firme', desc: 'Dez sessões sem a vela apagar', test: () => state.sessions.filter(s => s.lit).length >= 10 },
  { id: 'notas', icon: 'notebook-pen', title: 'Marginália', desc: 'Escreva 25 notas', test: () => state.notes.length >= 25 },
  { id: 'revisor', icon: 'brain', title: 'Memória viva', desc: 'Faça 50 revisões', test: () => state.reviews.length >= 50 },
  { id: 'coruja', icon: 'moon', title: 'Coruja', desc: 'Leia depois das 23h', test: () => state.sessions.some(s => new Date(s.start).getHours() >= 23) },
  { id: 'cedo', icon: 'sunrise', title: 'Madrugador', desc: 'Leia antes das 7h', test: () => state.sessions.some(s => new Date(s.start).getHours() < 7) },
];

const earnedMedals = () => MEDALS.filter(m => m.test());

/* ---------- Aviso rápido ---------- */
let toastTimer;
function toast(msg, good = false) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('good', good);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}
