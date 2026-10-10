/* =========================================================
   LIVRE · regras de negócio
   Hábitos, recaídas, marcos, gatilhos, nível e XP, índice de
   disciplina, foco (árvore que cresce) e pactos com juiz.
   Nada aqui mexe no DOM.
   ========================================================= */

/* ---------- Hábitos ---------- */
const findHabit = id => state.habits.find(h => h.id === id);
const currentMs = h => Math.max(0, Date.now() - h.startAt);
const bestMs = h => Math.max(h.record, currentMs(h));
const isBeatingRecord = h => h.record > 0 && currentMs(h) > h.record;
const goalMs = h => h.goalDays * DAY;
const goalPct = h => Math.min(100, (currentMs(h) / goalMs(h)) * 100);
const goalReached = h => currentMs(h) >= goalMs(h);
const cleanTotalMs = h => h.attempts.reduce((s, a) => s + a.duration, 0) + currentMs(h);

/** Próximas metas sugeridas, sempre acima do melhor tempo já feito */
function suggestGoals(h) {
  const baseDays = bestMs(h) / DAY;
  const next = GOAL_LADDER.filter(g => g > baseDays && g !== h.goalDays).slice(0, 2);
  return next.length ? next : [Math.ceil(Math.max(baseDays, 1) * 1.5)];
}

function createHabit(data) {
  state.habits.push({ id: uid(), record: 0, attempts: [], createdAt: Date.now(), ...data });
  saveState();
}

function updateHabit(id, patch) {
  Object.assign(findHabit(id), patch);
  saveState();
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  state.pacts = state.pacts.filter(p => p.habitId !== id);
  saveState();
}

/** Recaída: guarda o período, atualiza recorde e recomeça do momento informado */
function registerRelapse(id, at, note = '', triggers = []) {
  const h = findHabit(id);
  const duration = Math.max(0, at - h.startAt);
  const isRecord = duration > h.record;
  h.attempts.push({ start: h.startAt, end: at, duration, note: note.trim(), triggers });
  if (isRecord) h.record = duration;
  h.startAt = at;
  saveState();
  return { duration, isRecord };
}

/* ---------- Árvore da sequência ---------- */
const STAGES = [
  { from: 0,  name: 'Semente' },
  { from: 1,  name: 'Broto' },
  { from: 3,  name: 'Muda' },
  { from: 7,  name: 'Arbusto' },
  { from: 30, name: 'Árvore' },
  { from: 90, name: 'Árvore dourada' },
];
function stageIndex(ms) {
  const days = ms / DAY;
  let i = 0;
  STAGES.forEach((s, idx) => { if (days >= s.from) i = idx; });
  return i;
}

/* ---------- Marcos ---------- */
const MILESTONES = GOAL_LADDER.filter(d => d <= 365);

function milestoneList(h) {
  const cur = currentMs(h);
  const nextDays = MILESTONES.find(d => cur < d * DAY);
  return MILESTONES.map(days => ({
    days,
    done: cur >= days * DAY,                          // batido na jornada atual
    past: cur < days * DAY && h.record >= days * DAY, // já batido em uma jornada anterior
    next: days === nextDays,
    reachedAt: h.startAt + days * DAY,
  }));
}

function nextMilestone(h) {
  const cur = currentMs(h);
  const days = GOAL_LADDER.find(d => d * DAY > cur);
  return days ? { days, left: days * DAY - cur } : null;
}

/* ---------- Calendário (12 semanas, começando no domingo) ---------- */
function heatmap(h, weeks = 12) {
  const today = startOfDay(Date.now());
  const first = today - new Date(today).getDay() * DAY - (weeks - 1) * 7 * DAY;
  const trackedFrom = Math.min(h.createdAt ?? h.startAt, h.startAt, ...h.attempts.map(a => a.start));
  const relapseDays = new Set(h.attempts.map(a => startOfDay(a.end)));

  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const ds = first + i * DAY;
    // Ajuste de horário de verão: recalcula o início do dia
    const day = startOfDay(ds + 2 * HOUR);
    let c = 'c';
    if (day > today) c = 'f';
    else if (day + DAY <= trackedFrom) c = 'e';
    else if (relapseDays.has(day)) c = 'r';
    else if (day === today || day < trackedFrom) c = 'p';
    cells.push({ day, c });
  }
  return cells;
}

/* ---------- Gatilhos ---------- */
function triggerStats(habits = state.habits) {
  const count = {};
  habits.forEach(h => h.attempts.forEach(a => (a.triggers || []).forEach(t => { count[t] = (count[t] || 0) + 1; })));
  return Object.entries(count).sort((a, b) => b[1] - a[1]);
}

/* ---------- Vontades vencidas (SOS) ---------- */
function logUrge(habitId = null) {
  state.urges.push({ at: Date.now(), habitId });
  saveState();
}

/* ---------- Foco ---------- */
const focusActive = () => state.focus.active;
const focusEndsAt = f => f.start + f.minutes * MIN;
const focusOk = () => state.focus.sessions.filter(s => s.ok);

function startFocus(minutes, intent, locked) {
  state.focus.active = { start: Date.now(), minutes, intent: intent.trim(), locked, hiddenAt: null };
  state.focus.prefs = { minutes, locked };
  saveState();
}

function endFocus(ok) {
  const f = state.focus.active;
  if (!f) return;
  state.focus.sessions.push({ id: uid(), start: f.start, minutes: f.minutes, intent: f.intent, ok });
  state.focus.active = null;
  saveState();
}

/** Chamado quando o app some da tela ou volta. Sair do app mata a árvore. */
function focusVisibility(hidden) {
  const f = state.focus.active;
  if (!f) return null;
  if (hidden) { f.hiddenAt = Date.now(); saveState(); return null; }
  // Conta só o tempo fora que caiu dentro da sessão
  if (f.hiddenAt && Math.min(Date.now(), focusEndsAt(f)) - f.hiddenAt > FOCUS_GRACE) {
    endFocus(false);
    return 'dead';
  }
  f.hiddenAt = null;
  saveState();
  return null;
}

function focusMinutesToday() {
  const today = startOfDay(Date.now());
  return focusOk().filter(s => s.start >= today).reduce((s, x) => s + x.minutes, 0);
}

/* ---------- Pactos ---------- */
function createPact({ habitId, days, stake, judge, dest }) {
  const start = Date.now();
  state.pacts.push({ id: uid(), habitId, days, stake, judge, dest, start, end: start + days * DAY });
  saveState();
}

function deletePact(id) {
  state.pacts = state.pacts.filter(p => p.id !== id);
  saveState();
}

function pactStatus(p) {
  const h = findHabit(p.habitId);
  const now = Date.now();
  const broke = h?.attempts.find(a => a.end > p.start && a.end <= p.end);
  if (broke) return { status: 'broken', at: broke.end, pct: 100 };
  if (now >= p.end) return { status: 'done', pct: 100 };
  return { status: 'active', pct: clamp(((now - p.start) / (p.end - p.start)) * 100, 0, 100), left: p.end - now };
}

function judgeMessage(p) {
  const h = findHabit(p.habitId);
  const name = state.settings.name || 'Eu';
  const st = pactStatus(p);
  const what = h ? h.name.toLowerCase() : 'o hábito';
  if (st.status === 'broken')
    return `${p.judge}, vacilei. Recaí em ${what} antes de fechar ${p.days} dias. Combinado é combinado: vou mandar ${fmtMoney.format(p.stake)} para ${p.dest}.`;
  if (st.status === 'done')
    return `${p.judge}, cumpri! Fiquei ${p.days} dias sem ${what}. Pacto encerrado, obrigado por ser meu juiz.`;
  return `${p.judge}, ${name === 'Eu' ? 'firmei' : `aqui é ${name}, firmei`} um pacto: ${p.days} dias sem ${what}, até ${fmtShort.format(p.end)}. Se eu falhar, mando ${fmtMoney.format(p.stake)} para ${p.dest}. Você é meu juiz. Pode me cobrar.`;
}

/* ---------- Nível e XP ---------- */
const LEVEL_TITLES = ['Iniciante', 'Aprendiz', 'Firme', 'Constante', 'Focado', 'Disciplinado', 'Inabalável', 'Mestre', 'Lenda', 'Livre'];

/** 1 XP por hora limpa, 10 por vontade vencida, 1 por minuto de foco concluído */
function xpBreakdown() {
  const clean = Math.floor(state.habits.reduce((s, h) => s + cleanTotalMs(h), 0) / HOUR);
  const urges = state.urges.length * 10;
  const focus = focusOk().reduce((s, x) => s + x.minutes, 0);
  return { clean, urges, focus, total: clean + urges + focus };
}

function levelInfo(xp = xpBreakdown().total) {
  const level = Math.floor(Math.sqrt(xp / 150)) + 1;
  const floor = 150 * (level - 1) ** 2;
  const next = 150 * level ** 2;
  return {
    level, xp, next,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    pct: ((xp - floor) / (next - floor)) * 100,
  };
}

/* ---------- Índice de disciplina (0 a 100) ---------- */
function disciplineScore() {
  if (!state.habits.length) return { score: 0, label: 'Comece cadastrando um hábito' };
  const week = Date.now() - 7 * DAY;
  const base = state.habits.reduce((s, h) => s + Math.min(1, currentMs(h) / goalMs(h)), 0) / state.habits.length * 100;
  const relapses = state.habits.reduce((s, h) => s + h.attempts.filter(a => a.end >= week).length, 0);
  const urges = state.urges.filter(u => u.at >= week).length;
  const focusToday = focusOk().filter(x => x.start >= startOfDay(Date.now())).length;
  const score = Math.round(clamp(base - relapses * 8 + urges * 3 + focusToday * 4, 0, 100));
  const label = score >= 90 ? 'Imparável' : score >= 70 ? 'Firme' : score >= 40 ? 'Ganhando tração' : 'Recomeçando';
  return { score, label, relapses, urges };
}

/* ---------- Conquistas ---------- */
const anyBest = days => state.habits.some(h => bestMs(h) >= days * DAY);
const BADGES = [
  { icon: 'sprout', title: 'Primeiro passo', desc: 'Cadastrou o primeiro hábito', test: () => state.habits.length > 0 },
  { icon: 'sunrise', title: 'Primeiro dia', desc: '24 horas limpo', test: () => anyBest(1) },
  { icon: 'calendar-check', title: 'Uma semana', desc: '7 dias seguidos', test: () => anyBest(7) },
  { icon: 'medal', title: 'Um mês', desc: '30 dias seguidos', test: () => anyBest(30) },
  { icon: 'crown', title: 'Três meses', desc: '90 dias seguidos', test: () => anyBest(90) },
  { icon: 'zap', title: 'Recorde quebrado', desc: 'Passou do próprio recorde', test: () => state.habits.some(h =>
      isBeatingRecord(h) || h.attempts.some((a, i) => i > 0 && a.duration > Math.max(...h.attempts.slice(0, i).map(x => x.duration)))) },
  { icon: 'refresh-cw', title: 'Recomeço', desc: '3 dias limpo depois de uma recaída', test: () => state.habits.some(h => h.attempts.length && currentMs(h) >= 3 * DAY) },
  { icon: 'shield', title: 'Vontade vencida', desc: 'Usou o SOS e não recaiu', test: () => state.urges.length >= 1 },
  { icon: 'shield-check', title: 'Muralha', desc: '10 vontades vencidas', test: () => state.urges.length >= 10 },
  { icon: 'tree-pine', title: 'Primeira árvore', desc: 'Concluiu uma sessão de foco', test: () => focusOk().length >= 1 },
  { icon: 'trees', title: 'Bosque', desc: '10 sessões de foco concluídas', test: () => focusOk().length >= 10 },
  { icon: 'handshake', title: 'Palavra cumprida', desc: 'Cumpriu um pacto até o fim', test: () => state.pacts.some(p => pactStatus(p).status === 'done') },
];

/* =========================================================
   Economia: dinheiro e horas que o hábito deixou de comer
   ========================================================= */
const PER_DAYS = { dia: 1, semana: 7, mes: 30 };
const costPerDay = h => (h.cost && h.cost.amount > 0 ? h.cost.amount / (PER_DAYS[h.cost.per] || 1) : 0);

/** Conta todo o tempo limpo (jornada atual + as anteriores) */
const savedMoney = h => (costPerDay(h) * cleanTotalMs(h)) / DAY;
const savedHours = h => ((h.hoursPerDay || 0) * cleanTotalMs(h)) / DAY;

function savingsTotals() {
  const money = state.habits.reduce((s, h) => s + savedMoney(h), 0);
  const hours = state.habits.reduce((s, h) => s + savedHours(h), 0);
  const tracked = state.habits.some(h => costPerDay(h) > 0 || h.hoursPerDay > 0);
  return { money, hours, tracked };
}

function formatHours(h) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${Math.floor(h)}h`;
  return `${Math.floor(h / 24)} dias`;
}

/* =========================================================
   Check-in da noite: humor e vontade do dia
   ========================================================= */
const MOODS = ['Péssimo', 'Ruim', 'Ok', 'Bem', 'Ótimo'];
const todayCheckin = () => state.checkins.find(c => c.date === localDate());

function saveCheckin({ mood, urge, note = '' }) {
  const date = localDate();
  state.checkins = state.checkins.filter(c => c.date !== date);
  state.checkins.push({ date, mood, urge, note: note.trim() });
  state.checkins = state.checkins.slice(-400);
  saveState();
}

/** Últimos N dias, com buraco (null) nos dias sem check-in */
function checkinSeries(days = 30) {
  const byDate = new Map(state.checkins.map(c => [c.date, c]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = localDate(Date.now() - i * DAY);
    out.push({ date, ...(byDate.get(date) || { urge: null, mood: null }) });
  }
  return out;
}

/* =========================================================
   Ponto fraco: dia da semana e período em que mais recai
   ========================================================= */
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const PERIODS = [
  { key: 'madrugada', from: 0, to: 6, prep: 'de madrugada', alertHour: 23 },
  { key: 'manhã', from: 6, to: 12, prep: 'de manhã', alertHour: 7 },
  { key: 'tarde', from: 12, to: 18, prep: 'à tarde', alertHour: 12 },
  { key: 'noite', from: 18, to: 24, prep: 'à noite', alertHour: 18 },
];
const periodOf = hour => PERIODS.findIndex(p => hour >= p.from && hour < p.to);

/**
 * Precisa de pelo menos 3 recaídas. Procura a combinação dia + período
 * mais comum; se não tiver padrão claro, tenta só o período.
 */
function weakSpot(habits = state.habits) {
  const ends = habits.flatMap(h => h.attempts.map(a => new Date(a.end)));
  if (ends.length < 3) return null;
  const combo = {}, byPeriod = {};
  ends.forEach(d => {
    const p = periodOf(d.getHours());
    combo[`${d.getDay()}|${p}`] = (combo[`${d.getDay()}|${p}`] || 0) + 1;
    byPeriod[p] = (byPeriod[p] || 0) + 1;
  });
  const [bestKey, bestN] = Object.entries(combo).sort((a, b) => b[1] - a[1])[0];
  if (bestN >= 2 && bestN / ends.length >= 0.3) {
    const [dow, p] = bestKey.split('|').map(Number);
    const period = PERIODS[p];
    // Alerta de madrugada vai na noite anterior
    const alertDow = p === 0 ? (dow + 6) % 7 : dow;
    return { label: `${WEEKDAYS[dow]} ${period.prep}`, count: bestN, total: ends.length, dow: alertDow, hour: period.alertHour };
  }
  const [pKey, pN] = Object.entries(byPeriod).sort((a, b) => b[1] - a[1])[0];
  if (pN / ends.length >= 0.45) {
    const period = PERIODS[Number(pKey)];
    return { label: period.prep, count: pN, total: ends.length, dow: null, hour: period.alertHour };
  }
  return null;
}

/* =========================================================
   Marcos que valem aviso no grupo (7 dias, 30 dias...)
   ========================================================= */
const ANNOUNCE = [7, 14, 30, 60, 90, 180, 365];
function newMilestones() {
  const out = [];
  state.habits.forEach(h => {
    const days = currentMs(h) / DAY;
    const reached = ANNOUNCE.filter(d => days >= d).pop() || 0;
    const seen = state.seenMilestones[h.id] || 0;
    if (reached > seen) out.push({ habit: h, days: reached });
  });
  return out;
}

/* =========================================================
   Desafios de grupo: limpo desde o início até o fim
   ========================================================= */
function challengeStatus(ch, member) {
  const entry = (member.habits || []).find(h => h.category === ch.category);
  const ended = Date.now() >= ch.endsAt;
  if (!entry) return 'fora';
  if (entry.startAt > ch.startsAt) return 'caiu';
  return ended ? 'venceu' : 'firme';
}

BADGES.push(
  { icon: 'piggy-bank', title: 'Cofrinho', desc: 'Economizou R$ 100 sem o vício', test: () => savingsTotals().money >= 100 },
  { icon: 'notebook-pen', title: 'Diário em dia', desc: '7 check-ins da noite', test: () => state.checkins.length >= 7 },
  { icon: 'flag', title: 'Desafio vencido', desc: 'Terminou um desafio do grupo sem cair', test: () => state.trophies.length >= 1 },
);
