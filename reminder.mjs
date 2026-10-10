/* =========================================================
   LIVRE · lógica do lembrete diário (sem dependências)
   Separado da função para dar pra testar fácil.
   ========================================================= */

const DAY = 86_400_000;

/** Hora e data locais de um fuso, ex.: { hour: 9, date: '2026-10-04' } */
export function localParts(date, tz) {
  let zone = tz;
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); } catch { zone = 'America/Sao_Paulo'; }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short',
    }).formatToParts(date).map(p => [p.type, p.value])
  );
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short' }).format(date)
  );
  return { hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}`, dow };
}

/** Chegou a hora deste aparelho e ele ainda não recebeu hoje? */
export function isDue(sub, now = new Date()) {
  const { hour, date } = localParts(now, sub.tz);
  return hour === Number(sub.notify_hour) && String(sub.last_sent_on || '') !== date;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * Monta a notificação a partir dos dados do app da pessoa.
 * Devolve null quando não tem nada para avisar.
 */
export function buildMessage(data, now = Date.now()) {
  if (!data) return null;
  // Modo discreto: a notificação não diz do que se trata
  if (data.settings?.discreet) {
    return (data.habits || []).length ? { title: 'Seu lembrete do dia', body: 'Abra o app para ver.', url: './#/hoje' } : null;
  }
  const habits = (data.habits || [])
    .filter(h => h && h.name && Number.isFinite(h.startAt))
    .map(h => {
      const cur = Math.max(0, now - h.startAt);
      return {
        name: String(h.name).slice(0, 40),
        days: Math.floor(cur / DAY),
        recordDays: Math.floor((h.record || 0) / DAY),
        beating: (h.record || 0) > 0 && cur > h.record,
      };
    })
    .sort((a, b) => b.days - a.days);

  if (!habits.length) return null;

  if (habits.length === 1) {
    const h = habits[0];
    const title = h.days === 0 ? `Primeiro dia sem ${h.name}` : `Você está ${plural(h.days, 'dia', 'dias')} sem ${h.name}`;
    let body;
    if (h.beating) body = 'Você passou do seu recorde. Daqui pra frente é território novo.';
    else if (h.recordDays > h.days) body = `Seu recorde é ${plural(h.recordDays, 'dia', 'dias')}. Faltam ${plural(h.recordDays - h.days, 'dia', 'dias')} para passar dele.`;
    else body = 'Um dia de cada vez. Abre o app e confere sua árvore.';
    return { title, body, url: './#/hoje' };
  }

  const lines = habits.slice(0, 4).map(h => `${h.name}: ${plural(h.days, 'dia', 'dias')}`);
  if (habits.length > 4) lines.push(`e mais ${habits.length - 4}`);
  const top = habits[0];
  return {
    title: `Você está ${plural(top.days, 'dia', 'dias')} sem ${top.name}`,
    body: lines.join(' · '),
    url: './#/hoje',
  };
}

/** O ponto fraco desse aparelho chegou? (dia null = todo dia) */
export function isWeakDue(sub, now = new Date()) {
  if (sub.weak_hour === null || sub.weak_hour === undefined) return false;
  const { hour, date, dow } = localParts(now, sub.tz);
  const dayOk = sub.weak_dow === null || sub.weak_dow === undefined || Number(sub.weak_dow) === dow;
  return dayOk && hour === Number(sub.weak_hour) && String(sub.last_weak_on || '') !== date;
}

/** Aviso antes do horário em que a pessoa mais costuma recair */
export function buildWeakMessage(data) {
  if (!data || !(data.habits || []).length) return null;
  if (data.settings?.discreet) return { title: 'Lembrete', body: 'Abra o app para ver.', url: './#/hoje' };
  const plan = (data.habits || []).flatMap(h => h.plans || []).find(p => p && p.if && p.then);
  return {
    title: 'Esse costuma ser seu horário mais difícil',
    body: plan ? `Seu plano: se ${plan.if}, então ${plan.then}.` : 'Se bater vontade, abre o app e aperta "Tô com vontade".',
    url: './#/sos',
  };
}
