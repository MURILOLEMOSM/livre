/* =========================================================
   LIVRE · core
   Configuração, utilitários, armazenamento e estado global.
   ========================================================= */

/* ---------- Configuração ---------- */
const STORAGE_KEY = 'livre:v2';
const LEGACY_KEY = 'livre:v1';

const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;

const CATEGORIES = {
  bebidas:     { label: 'Bebidas',       icon: 'wine',       hint: 'Cerveja, destilado, vinho' },
  cigarro:     { label: 'Cigarro',       icon: 'cigarette',  hint: 'Cigarro, vape, narguilé' },
  pornografia: { label: 'Pornografia',   icon: 'eye-off',    hint: 'Conteúdo adulto' },
  gula:        { label: 'Gula',          icon: 'utensils',   hint: 'Doce, fast-food, beliscar' },
  redes:       { label: 'Redes sociais', icon: 'smartphone', hint: 'Instagram, TikTok, rolagem' },
  jogos:       { label: 'Jogos',         icon: 'gamepad-2',  hint: 'Games até de madrugada' },
  apostas:     { label: 'Apostas',       icon: 'dices',      hint: 'Bets, cassino online' },
  outro:       { label: 'Outro',         icon: 'circle-dot', hint: 'Qualquer outro hábito' },
};

const TRIGGERS = ['Estresse', 'Tédio', 'Ansiedade', 'Solidão', 'Cansaço', 'Festa ou rolê', 'Tristeza', 'Raiva', 'Celular à noite', 'Outro'];

// Degraus de meta e também os marcos da linha do tempo
const GOAL_LADDER = [1, 3, 7, 14, 30, 60, 90, 180, 365, 730];
const GOAL_LABELS = {
  1: '1 dia', 3: '3 dias', 7: '1 semana', 14: '2 semanas', 30: '1 mês',
  60: '2 meses', 90: '3 meses', 180: '6 meses', 365: '1 ano', 730: '2 anos',
};

const FOCUS_OPTIONS = [15, 25, 45, 60];   // minutos
const FOCUS_GRACE = 10_000;               // tempo fora do app antes da árvore secar

/* ---------- Utilitários ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = n => String(n).padStart(2, '0');
const uid = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const icons = () => window.lucide?.createIcons();
const esc = (s = '') => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const fmtToday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtMoney = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function splitDuration(ms) {
  const t = Math.max(0, ms);
  return {
    d: Math.floor(t / DAY),
    h: Math.floor((t % DAY) / HOUR),
    m: Math.floor((t % HOUR) / MIN),
    s: Math.floor((t % MIN) / 1000),
  };
}

/** "12d 4h", "3h 20m", "15m" */
function formatDuration(ms) {
  const { d, h, m } = splitDuration(ms);
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Data local no formato AAAA-MM-DD */
const localDate = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtMoneyCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const goalLabel = days => GOAL_LABELS[days] ?? `${days} dias`;
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

function toLocalInput(ms) {
  const offset = new Date(ms).getTimezoneOffset() * MIN;
  return new Date(ms - offset).toISOString().slice(0, 16);
}
function fromLocalInput(value) {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : NaN;
}

/* ---------- Estado e armazenamento ---------- */
function emptyState() {
  return {
    version: 2,
    habits: [],
    urges: [],                                   // vontades vencidas: { at, habitId }
    focus: { sessions: [], active: null, prefs: { minutes: 25, locked: false } },
    pacts: [],
    checkins: [],                                // { date: 'AAAA-MM-DD', mood: 1-5, urge: 0-10, note }
    savingsGoal: null,                           // { name, amount }
    futureMsg: null,                             // { text, audio (data URL), at }
    trophies: [],                                // { id, title, at } (desafios vencidos)
    seenMilestones: {},                          // habitId -> maior marco já anunciado ao grupo
    settings: { name: '', mono: false, onboarded: false, discreet: false },
  };
}

/** Garante que dados antigos ou incompletos tenham todos os campos */
function normalize(data) {
  const base = emptyState();
  const s = { ...base, ...data };
  s.focus = { ...base.focus, ...(data.focus || {}) };
  s.focus.prefs = { ...base.focus.prefs, ...(data.focus?.prefs || {}) };
  s.settings = { ...base.settings, ...(data.settings || {}) };
  if (s.habits?.length) s.settings.onboarded = true;
  s.habits = (s.habits || []).map(h => ({
    why: '',
    cost: null,          // { amount, per: 'dia' | 'semana' | 'mes' }
    hoursPerDay: 0,      // tempo que o hábito comia por dia
    plans: [],           // [{ if, then }]
    ...h,
    attempts: (h.attempts || []).map(a => ({ note: '', triggers: [], ...a })),
  }));
  return s;
}

/* ---------- Armazenamento local (com plano B em memória) ---------- */
const memoryStore = new Map();
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return memoryStore.get(key) ?? null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { memoryStore.set(key, value); return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* sem armazenamento */ }
    memoryStore.delete(key);
  },
  json(key) {
    try { return JSON.parse(this.get(key) || 'null'); } catch { return null; }
  },
};

/* ---------- Estado da pessoa logada ---------- */
let currentUser = null;                         // { id, email }
const userKey = () => `${STORAGE_KEY}:${currentUser?.id}`;

/** Troca todo o conteúdo do estado sem trocar o objeto (as outras partes guardam a referência) */
function replaceState(data) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, normalize(data || {}));
}

/**
 * Carrega os dados da pessoa: compara a cópia deste aparelho com a da nuvem
 * e fica com a mais nova. Na primeira entrada, aproveita dados de antes do login.
 */
async function loadUserState() {
  const local = store.json(userKey());
  let remote = null;
  try { remote = await cloud.loadData(); } catch (err) { console.warn('[LIVRE] Sem acesso à nuvem agora:', err.message); }

  const localAt = local?._savedAt || 0;
  const remoteAt = remote?.updatedAt || 0;

  if (remote && remoteAt >= localAt - 2000) return remote.data;
  if (local) {
    if (localAt > remoteAt + 2000) setTimeout(() => cloud.queueSave(state), 0); // aparelho tem coisa mais nova: sobe
    return local;
  }

  // Ninguém tem nada: importa o que ficou de antes do login (v2 sem conta ou v1)
  const legacy = store.json(STORAGE_KEY) || store.json(LEGACY_KEY);
  if (Array.isArray(legacy?.habits) && legacy.habits.length) {
    store.remove(STORAGE_KEY);
    store.remove(LEGACY_KEY);
    setTimeout(() => saveState(), 0);
    return { ...legacy, settings: { ...(legacy.settings || {}), onboarded: true } };
  }
  return emptyState();
}

let storageWarned = false;
function saveState() {
  if (!currentUser) return;
  state._savedAt = Date.now();
  const ok = store.set(userKey(), JSON.stringify(state));
  if (!ok && !storageWarned && cloud.mode === 'local') {
    toast('Este navegador não está salvando os dados. Eles somem ao fechar.');
    storageWarned = true;
  }
  cloud.queueSave(state);
  if (typeof social !== 'undefined') social.schedulePublish();
}

const state = emptyState();

/** Lembrete diário é por aparelho (cada celular tem sua própria inscrição) */
const notifyKey = () => `livre:notify:${currentUser?.id}`;
function notifyPref() {
  return { on: false, hour: 9, weak: false, ...(store.json(notifyKey()) || {}) };
}
function setNotifyPref(patch) {
  store.set(notifyKey(), JSON.stringify({ ...notifyPref(), ...patch }));
}

/** Estado só da interface (não é salvo) */
const ui = { filter: 'todos', route: { name: 'hoje', id: null }, duelCat: 'geral' };
