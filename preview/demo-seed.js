/* Dados de exemplo usados só na prévia (botão "Ver o app com dados de exemplo"). */
window.LIVRE_DEMO = () => {
  const D = 86_400_000, H = 3_600_000, M = 60_000, now = Date.now();

  const make = (id, name, category, goalDays, currentAgo, periods, why) => {
    const total = periods.reduce((s, p) => s + p[0], 0);
    let t = now - currentAgo - total;
    const attempts = periods.map(([dur, triggers, note]) => {
      const a = { start: t, end: t + dur, duration: dur, triggers, note: note || '' };
      t += dur;
      return a;
    });
    return {
      id, name, category, goalDays, why,
      startAt: now - currentAgo,
      record: periods.length ? Math.max(...periods.map(p => p[0])) : 0,
      attempts, createdAt: now - currentAgo - total,
    };
  };

  const habits = [
    make('demo1', 'Cigarro', 'cigarro', 30, 23 * D + 6 * H + 41 * M, [
      [5 * D + 4 * H, ['Festa ou rolê'], 'Aniversário de um amigo'],
      [12 * D, ['Estresse', 'Cansaço']],
      [18 * D + 9 * H, ['Estresse', 'Ansiedade'], 'Semana de prova'],
    ], 'Quero correr 5 km sem perder o fôlego.'),
    make('demo2', 'Cerveja durante a semana', 'bebidas', 14, 9 * D + 3 * H + 12 * M, [
      [7 * D, ['Festa ou rolê']],
      [21 * D + 2 * H, ['Tédio', 'Festa ou rolê'], 'Jogo do time com a galera'],
      [4 * D + 6 * H, ['Estresse']],
    ], 'Acordar inteiro pra treinar de manhã.'),
    make('demo3', 'Doce depois da janta', 'gula', 7, 7 * D + 2 * H + 5 * M, [
      [3 * D, ['Tédio']],
      [5 * D + 8 * H, ['Tristeza'], ''],
    ], ''),
    make('demo4', 'Instagram antes de dormir', 'redes', 7, 2 * D + 11 * H + 30 * M, [
      [1 * D + 20 * H, ['Celular à noite', 'Tédio']],
    ], 'Dormir antes da meia-noite.'),
  ];

  const urges = [3, 5, 9, 12, 16, 20, 26].map((d, i) => ({ at: now - d * D, habitId: habits[i % 3].id }));

  const sessions = [
    [0.12, 25, 'Estudar estrutura de dados', true],
    [0.2, 25, 'Lista de ATP', true],
    [1.1, 45, 'Projeto do app', true],
    [1.3, 25, '', false],
    [2.2, 60, 'Trabalho de Ciência de Dados', true],
    [3.1, 25, 'Ler capítulo 4', true],
    [4.4, 15, '', false],
    [5.2, 45, 'Landing page do cliente', true],
  ].map(([daysAgo, minutes, intent, ok], i) => ({ id: 'f' + i, start: now - daysAgo * D, minutes, intent, ok }));

  const pacts = [
    { id: 'p1', habitId: 'demo1', days: 30, stake: 100, judge: 'Lucas', dest: 'Doação para o abrigo de animais', start: now - 12 * D, end: now + 18 * D },
    { id: 'p2', habitId: 'demo2', days: 14, stake: 50, judge: 'Ana', dest: 'Vaquinha da formatura', start: now - 34 * D, end: now - 20 * D },
    { id: 'p3', habitId: 'demo2', days: 10, stake: 30, judge: 'Lucas', dest: 'Pagar o almoço dele', start: now - 13 * D, end: now - 3 * D },
  ];

  // As recaídas de exemplo acontecem à noite (para o "ponto fraco" ter padrão)
  habits.forEach(h => {
    h.attempts.forEach((a, i) => {
      const e = new Date(a.end); e.setHours(21, 30, 0, 0);
      a.end = Math.min(e.getTime(), now - H);
      if (i > 0) a.start = h.attempts[i - 1].end;
      a.duration = Math.max(H, a.end - a.start);
    });
    if (h.attempts.length) {
      h.startAt = h.attempts[h.attempts.length - 1].end;
      h.record = Math.max(...h.attempts.map(a => a.duration));
    }
  });

  // Gasto, horas e planos para os recursos de economia e SOS
  habits[0].cost = { amount: 14, per: 'dia' };
  habits[0].plans = [{ if: 'acabar o almoço e bater a vontade', then: 'escovo os dentes e saio pra caminhar 5 minutos' }];
  habits[1].cost = { amount: 90, per: 'semana' };
  habits[1].plans = [{ if: 'a galera chamar pro bar na quarta', then: 'vou e peço refrigerante, ou marco um futebol no lugar' }];
  habits[3].hoursPerDay = 1.5;

  // Check-ins dos últimos dias (vontade caindo)
  const checkins = [];
  for (let i = 20; i >= 1; i--) {
    if (i % 4 === 0) continue;
    const d = new Date(now - i * D);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    checkins.push({ date, mood: 2 + (i % 3), urge: Math.max(1, Math.min(9, Math.round(2 + i * 0.3 + ((i * 7) % 3) - 1))), note: '' });
  }

  const state = {
    version: 2, habits, urges, checkins,
    savingsGoal: { name: 'Tênis de corrida', amount: 600 },
    futureMsg: { text: 'Lembra da falta de ar subindo a escada da faculdade? Você não quer voltar pra isso.', at: now - 5 * D },
    trophies: [], seenMilestones: {},
    focus: { sessions, active: null, prefs: { minutes: 25, locked: false } },
    pacts,
    settings: { name: '', mono: false, onboarded: true },
  };
  return state;
};
