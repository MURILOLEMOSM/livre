/* =========================================================
   LIVRE · Disputa (social)
   Amigos por ID ou link, grupos de até 10 e placar ao vivo.

   Dois modos, mesma interface:
   - firebase: tudo de verdade, pela função /api/disputa do Netlify
   - local:    sem servidor; amigos de exemplo para testar a tela
   ========================================================= */

const social = (() => {
  const MAX_GROUP = 10;

  const ERRORS = {
    GRUPO_CHEIO: 'Esse grupo já tem 10 pessoas.',
    ID_NAO_ENCONTRADO: 'Não achamos ninguém com esse ID. Confira as letras e os números.',
    VOCE_MESMO: 'Esse é o seu próprio ID.',
    CONVITE_INVALIDO: 'Esse convite não existe mais ou o código está errado.',
    NAO_E_AMIGO: 'Só dá para colocar amigos no grupo.',
    FORA_DO_GRUPO: 'Você não está nesse grupo.',
    PEDIDO_NAO_ENCONTRADO: 'Esse pedido não existe mais.',
    SEM_LOGIN: 'Entre na sua conta de novo.',
    DESAFIOS_DEMAIS: 'Esse grupo já tem 3 desafios valendo. Espere um terminar.',
    PRAZO_INVALIDO: 'O prazo vai de 1 a 365 dias.',
  };
  function friendly(err) {
    const m = err?.message || String(err || '');
    const key = Object.keys(ERRORS).find(k => m.includes(k));
    if (key) return ERRORS[key];
    if (/failed to fetch|network/i.test(m)) return 'Sem conexão. Confira sua internet.';
    return m || 'Algo deu errado. Tente de novo.';
  }
  const fail = err => { throw new Error(friendly(err)); };

  /* ---------- Cache que as telas leem ---------- */
  const data = {
    me: null,            // { name, code }
    friends: [],         // { fid, id, name, code, status, incoming }
    groups: [],          // { id, name, code, owner, members }
    boards: {},          // groupId -> [{ id, name, code, me, habits:[{category,startAt,record}] }]
    feeds: {},           // groupId -> [{ id, kind, actor, actorName, target, targetName, payload, at }]
    challenges: {},      // groupId -> [{ id, title, category, days, startsAt, endsAt, createdBy }]
    inbox: [],           // força recebida e avisos de quem você apadrinha
    sponsor: null,       // { id, name, code } (seu padrinho)
    sponsoring: [],      // pessoas que escolheram você
    loaded: false,
    loading: false,
    error: '',
  };

  /* ---------- O que eu mostro na disputa ---------- */
  // Padrão: todos os hábitos, menos pornografia (a pessoa liga se quiser)
  function sharedIds() {
    const saved = state.settings.sharedHabits;
    if (Array.isArray(saved)) return saved.filter(id => findHabit(id));
    return state.habits.filter(h => h.category !== 'pornografia').map(h => h.id);
  }

  /** Resumo público: só categoria, início e recorde. Um por categoria (o mais longo). */
  function mySummary() {
    const ids = new Set(sharedIds());
    const best = {};
    state.habits.filter(h => ids.has(h.id)).forEach(h => {
      const cur = best[h.category];
      if (!cur || h.startAt < cur.startAt) best[h.category] = { category: h.category, startAt: h.startAt, record: h.record || 0 };
    });
    return Object.values(best);
  }

  /* =================== Modo Firebase =================== */
  // Tudo passa pela função /api/disputa (netlify/functions/disputa.mjs)
  const call = async (op, args) => {
    try { return (await cloud.api('/api/disputa', { op, args })).result; }
    catch (err) { fail(err); }
  };

  const remote = {
    ensureProfile: name => call('ensureProfile', { name }),
    find: code => call('find', { code }),
    request: code => call('request', { code }),
    accept: fid => call('accept', { fid }),
    removeFriend: fid => call('removeFriend', { fid }),
    friends: () => call('friends'),
    groups: () => call('groups'),
    createGroup: name => call('createGroup', { name }),
    join: code => call('join', { code }),
    addToGroup: (groupId, userId) => call('addToGroup', { groupId, userId }),
    leave: groupId => call('leave', { groupId }),
    deleteGroup: groupId => call('deleteGroup', { groupId }),
    board: groupId => call('board', { groupId }),
    feed: groupId => call('feed', { groupId }),
    inbox: () => call('inbox'),
    challenges: groupId => call('challenges', { groupId }),
    createChallenge: (groupId, title, category, days) => call('createChallenge', { groupId, title, category, days }),
    deleteChallenge: id => call('deleteChallenge', { id }),
    sponsorship: () => call('sponsorship'),
    setSponsor: friendId => call('setSponsor', { friendId: friendId || null }),
    /** Avisos com push passam pela função /api/avisar */
    async notify(payload) {
      try { return await cloud.api('/api/avisar', payload); }
      catch (err) { fail(err); }
    },
    /** O resumo do placar o app grava direto (as regras só deixam gravar o próprio) */
    publish: summary => cloud.publishStats(summary),
  };

  /* =================== Modo local (amigos de exemplo) =================== */
  const D = DAY, H = HOUR;
  // Pessoas fictícias para testar a tela sem servidor
  const DIRECTORY = [
    { id: 'p-lucas', name: 'Lucas', code: 'LIV-LUC4S', habits: [['cigarro', 15 * D + 3 * H, 31 * D], ['bebidas', 6 * D, 12 * D]] },
    { id: 'p-ana', name: 'Ana', code: 'LIV-ANA7Q', habits: [['redes', 9 * D + 20 * H, 9 * D + 2 * H], ['gula', 2 * D + 5 * H, 11 * D]] },
    { id: 'p-pedro', name: 'Pedro', code: 'LIV-PDR92', habits: [['apostas', 41 * D, 41 * D], ['cigarro', 3 * D + 8 * H, 20 * D]] },
    { id: 'p-bia', name: 'Bia', code: 'LIV-BXA3K', habits: [['bebidas', 27 * D + 6 * H, 14 * D], ['redes', 1 * D + 2 * H, 5 * D]] },
    { id: 'p-rafa', name: 'Rafa', code: 'LIV-RAF8K', habits: [['cigarro', 4 * D + 15 * H, 9 * D], ['jogos', 12 * D, 30 * D]] },
  ];
  const BASE_TIME = startOfDay(Date.now()) - 7 * H;   // fixa os tempos do exemplo durante o dia
  const statsOf = p => p.habits.map(([category, ago, record]) => ({ category, startAt: BASE_TIME - ago, record }));
  const localKey = () => `livre:social:${currentUser?.id}`;
  const randomCode = () => 'LIV-' + Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

  function localDb() {
    const db = store.json(localKey());
    if (db) return db;
    const isDemo = currentUser?.id === 'demo';
    // Na conta de exemplo já vem um grupo montado e um pedido esperando
    return {
      me: null,
      friends: isDemo ? [
        { fid: 1, id: 'p-lucas', status: 'accepted', incoming: false },
        { fid: 2, id: 'p-ana', status: 'accepted', incoming: true },
        { fid: 3, id: 'p-rafa', status: 'accepted', incoming: false },
        { fid: 4, id: 'p-pedro', status: 'pending', incoming: true },
      ] : [],
      groups: isDemo ? [{ id: 'g-1', name: 'Turma sem cigarro', code: 'K7Q2M9XD', owner: true, members: ['me', 'p-lucas', 'p-ana', 'p-rafa'] }] : [],
      challenges: isDemo ? [{ id: 'c-demo', groupId: 'g-1', title: '30 dias sem cigarro', category: 'cigarro', days: 30, startsAt: BASE_TIME - 12 * D, endsAt: BASE_TIME + 18 * D, createdBy: 'p-lucas' }] : [],
      nextFid: 10,
    };
  }
  const saveLocal = db => store.set(localKey(), JSON.stringify(db));
  const person = id => DIRECTORY.find(p => p.id === id);

  const local = {
    async ensureProfile(name) {
      const db = localDb();
      db.me = { name: name || db.me?.name || 'Você', code: db.me?.code || randomCode() };
      saveLocal(db);
      return db.me;
    },
    async find(code) {
      const p = DIRECTORY.find(x => x.code === code.trim().toUpperCase());
      return p ? { id: p.id, name: p.name, code: p.code } : null;
    },
    async request(code) {
      const db = localDb();
      const p = DIRECTORY.find(x => x.code === code.trim().toUpperCase());
      if (!p) fail({ message: 'ID_NAO_ENCONTRADO' });
      if (db.me?.code === code.trim().toUpperCase()) fail({ message: 'VOCE_MESMO' });
      const f = db.friends.find(x => x.id === p.id);
      if (f?.status === 'accepted') return 'ja_amigos';
      if (f && f.incoming) { f.status = 'accepted'; saveLocal(db); return 'aceito'; }
      if (!f) db.friends.push({ fid: db.nextFid++, id: p.id, status: 'pending', incoming: false });
      saveLocal(db);
      // No exemplo, a outra pessoa "aceita" sozinha depois de uns segundos
      setTimeout(() => {
        const db2 = localDb();
        const f2 = db2.friends.find(x => x.id === p.id);
        if (f2 && f2.status === 'pending') {
          f2.status = 'accepted';
          saveLocal(db2);
          toast(`${p.name} aceitou seu pedido de amizade.`, true);
          refresh();
        }
      }, 4000);
      return 'enviado';
    },
    async accept(fid) {
      const db = localDb();
      const f = db.friends.find(x => String(x.fid) === String(fid) && x.incoming);
      if (!f) fail({ message: 'PEDIDO_NAO_ENCONTRADO' });
      f.status = 'accepted';
      saveLocal(db);
    },
    async removeFriend(fid) {
      const db = localDb();
      db.friends = db.friends.filter(x => String(x.fid) !== String(fid));
      saveLocal(db);
    },
    async friends() {
      return localDb().friends.map(f => ({ ...f, ...(({ name, code }) => ({ name, code }))(person(f.id)) }));
    },
    async groups() {
      return localDb().groups.map(g => ({ id: g.id, name: g.name, code: g.code, owner: g.owner, members: g.members.length }));
    },
    async createGroup(name) {
      const db = localDb();
      const g = { id: `g-${uid()}`, name, code: randomCode().slice(4) + 'XY1', owner: true, members: ['me'] };
      db.groups.unshift(g);
      saveLocal(db);
      return g.id;
    },
    async join() { fail({ message: 'No modo local não dá para entrar em grupo de outra pessoa. Crie um grupo e chame os amigos de exemplo.' }); },
    async addToGroup(groupId, userId) {
      const db = localDb();
      const g = db.groups.find(x => x.id === groupId);
      if (!g) fail({ message: 'FORA_DO_GRUPO' });
      if (g.members.length >= MAX_GROUP) fail({ message: 'GRUPO_CHEIO' });
      if (!db.friends.some(f => f.id === userId && f.status === 'accepted')) fail({ message: 'NAO_E_AMIGO' });
      if (!g.members.includes(userId)) g.members.push(userId);
      saveLocal(db);
    },
    async leave(groupId) {
      const db = localDb();
      db.groups = db.groups.filter(g => g.id !== groupId);
      saveLocal(db);
    },
    async deleteGroup(groupId) { return local.leave(groupId); },
    async board(groupId) {
      const db = localDb();
      const g = db.groups.find(x => x.id === groupId);
      if (!g) fail({ message: 'FORA_DO_GRUPO' });
      return g.members.map(id => id === 'me'
        ? { id: currentUser.id, name: db.me?.name || 'Você', code: db.me?.code, me: true, habits: mySummary() }
        : { id, name: person(id).name, code: person(id).code, me: false, habits: statsOf(person(id)) });
    },
    async publish() { /* nada a enviar no modo local */ },

    async feed(groupId) {
      const db = localDb();
      const g = db.groups.find(x => x.id === groupId);
      if (!g) fail({ message: 'FORA_DO_GRUPO' });
      const mine = (db.events || []).filter(e => e.group_id === groupId);
      // Alguns acontecimentos de exemplo para o mural não começar vazio
      const demo = g.members.includes('p-lucas') ? [
        { id: 'e1', kind: 'milestone', actor: 'p-lucas', actorName: 'Lucas', payload: { category: 'cigarro', days: 14 }, at: BASE_TIME - 1 * D },
        { id: 'e2', kind: 'sos', actor: 'p-ana', actorName: 'Ana', payload: { category: 'gula' }, at: BASE_TIME - 2 * D - 3 * H },
        { id: 'e3', kind: 'cheer', actor: 'p-rafa', actorName: 'Rafa', target: 'p-ana', targetName: 'Ana', payload: {}, at: BASE_TIME - 2 * D - 2 * H },
      ] : [];
      return [...mine, ...demo].sort((a, b) => b.at - a.at);
    },
    async inbox() { return (localDb().inbox || []).sort((a, b) => b.at - a.at).slice(0, 20); },
    async challenges(groupId) {
      const db = localDb();
      return (db.challenges || []).filter(c => c.groupId === groupId && c.endsAt > Date.now() - 7 * D);
    },
    async createChallenge(groupId, title, category, days) {
      const db = localDb();
      db.challenges = db.challenges || [];
      if (db.challenges.filter(c => c.groupId === groupId && c.endsAt > Date.now()).length >= 3) fail({ message: 'DESAFIOS_DEMAIS' });
      db.challenges.push({ id: `c-${uid()}`, groupId, title, category, days, startsAt: Date.now(), endsAt: Date.now() + days * D, createdBy: currentUser.id });
      saveLocal(db);
    },
    async deleteChallenge(id) {
      const db = localDb();
      db.challenges = (db.challenges || []).filter(c => c.id !== id);
      saveLocal(db);
    },
    async sponsorship() {
      const db = localDb();
      const p = db.sponsor && person(db.sponsor);
      return { sponsor: p ? { id: p.id, name: p.name, code: p.code } : null, sponsoring: currentUser?.id === 'demo' ? [{ id: 'p-ana', name: 'Ana', code: 'LIV-ANA7Q' }] : [] };
    },
    async setSponsor(id) {
      const db = localDb();
      if (id && !db.friends.some(f => f.id === id && f.status === 'accepted')) fail({ message: 'NAO_E_AMIGO' });
      db.sponsor = id || null;
      saveLocal(db);
    },
    async notify({ kind, groupId, targetId, category, days }) {
      const db = localDb();
      db.events = db.events || [];
      const ev = { id: `e-${uid()}`, kind, actor: currentUser.id, actorName: db.me?.name || 'Você', target: targetId || null, payload: { category, days }, at: Date.now() };
      if (kind === 'sos' || kind === 'milestone') {
        const groups = groupId ? db.groups.filter(g => g.id === groupId) : db.groups;
        if (!groups.length && kind === 'sos') fail({ message: 'Você ainda não está em nenhum grupo.' });
        groups.forEach(g => db.events.push({ ...ev, id: `e-${uid()}`, group_id: g.id }));
        // No exemplo, um amigo responde com força alguns segundos depois
        const helper = groups.flatMap(g => g.members).find(m => m !== 'me');
        if (kind === 'sos' && helper) {
          setTimeout(() => {
            const db2 = localDb();
            db2.inbox = db2.inbox || [];
            db2.inbox.push({ id: `i-${uid()}`, kind: 'cheer', actor: helper, actorName: person(helper).name, payload: {}, at: Date.now() });
            saveLocal(db2);
            toast(`${person(helper).name} te mandou força. Segura firme.`, true);
            refresh();
          }, 3500);
        }
      } else if (kind === 'cheer') {
        db.events.push({ ...ev, group_id: groupId || null, targetName: person(targetId)?.name });
      }
      saveLocal(db);
      return { ok: true, notified: 1 };
    },
  };

  const impl = () => (cloud.mode === 'firebase' ? remote : local);

  /* ---------- Carregar e atualizar ---------- */
  let loadPromise = null;
  function refresh() {
    if (loadPromise) return loadPromise;
    data.loading = true;
    loadPromise = (async () => {
      try {
        const name = (state.settings.name || '').trim();
        if (name) {
          data.me = await impl().ensureProfile(name);
          publishNow();
        }
        const [friends, groups] = await Promise.all([impl().friends(), impl().groups()]);
        data.friends = friends;
        data.groups = groups;
        if (data.me) {
          const [inbox, sp] = await Promise.all([impl().inbox(), impl().sponsorship()]);
          data.inbox = inbox;
          data.sponsor = sp.sponsor;
          data.sponsoring = sp.sponsoring;
          announceMilestones();
        }
        data.error = '';
      } catch (err) {
        data.error = friendly(err);
      } finally {
        data.loaded = true;
        data.loading = false;
        loadPromise = null;
        if (ui.route.name === 'disputa') render();
      }
    })();
    return loadPromise;
  }

  async function loadBoard(groupId) {
    try {
      const [board, feed, challenges] = await Promise.all([impl().board(groupId), impl().feed(groupId), impl().challenges(groupId)]);
      data.boards[groupId] = board;
      data.feeds[groupId] = feed;
      data.challenges[groupId] = challenges;
      checkTrophies(groupId);
    } catch (err) {
      data.boards[groupId] = { error: friendly(err) };
    }
    if (ui.route.name === 'disputa' && ui.route.id === groupId) render();
  }

  /* ---------- Publicar o meu resumo (com espera) ---------- */
  let pubTimer = null;
  let lastPublished = '';
  function publishNow() {
    if (cloud.mode !== 'firebase' || !currentUser || !data.me) return;
    const summary = mySummary();
    const key = JSON.stringify(summary);
    if (key === lastPublished) return;   // nada mudou no placar: não grava de novo
    impl().publish(summary)
      .then(() => { lastPublished = key; })
      .catch(err => console.warn('[LIVRE] Placar não atualizou:', err.message));
  }
  function schedulePublish() {
    clearTimeout(pubTimer);
    pubTimer = setTimeout(publishNow, 2500);
  }

  /** Avisa o grupo quando um hábito mostrado passa de 7, 14, 30... dias */
  function announceMilestones() {
    const shared = new Set(sharedIds());
    let changed = false;
    newMilestones().forEach(({ habit, days }) => {
      const first = state.seenMilestones[habit.id] === undefined;
      state.seenMilestones[habit.id] = days;
      changed = true;
      // Na primeira vez só anota (não anuncia marcos antigos)
      if (!first && shared.has(habit.id) && data.groups.length) {
        impl().notify({ kind: 'milestone', category: habit.category, days }).catch(() => {});
      }
    });
    if (changed) saveState();
  }

  /** Desafio terminado sem cair vira troféu */
  function checkTrophies(groupId) {
    const board = data.boards[groupId];
    const me = Array.isArray(board) && board.find(p => p.me);
    if (!me) return;
    (data.challenges[groupId] || []).forEach(ch => {
      if (challengeStatus(ch, me) === 'venceu' && !state.trophies.some(t => t.id === ch.id)) {
        state.trophies.push({ id: ch.id, title: ch.title, at: Date.now() });
        saveState();
        toast(`Você venceu o desafio "${ch.title}".`, true);
      }
    });
  }

  function reset() {
    lastPublished = '';
    Object.assign(data, { me: null, friends: [], groups: [], boards: {}, feeds: {}, challenges: {}, inbox: [], sponsor: null, sponsoring: [], loaded: false, loading: false, error: '' });
  }

  /* ---------- Ações (cada uma atualiza o cache depois) ---------- */
  const act = fn => async (...args) => {
    try {
      const out = await fn(...args);
      await refresh();
      return out;
    } catch (err) {
      throw new Error(friendly(err));
    }
  };

  return {
    MAX_GROUP,
    data,
    sharedIds,
    mySummary,
    refresh,
    loadBoard,
    schedulePublish,
    publishNow,
    reset,
    friendly,
    find: code => impl().find(code).catch(err => fail(err)),
    async setName(name) {
      data.me = await impl().ensureProfile(name);
      publishNow();
      await refresh();
    },
    request: act(code => impl().request(code)),
    accept: act(fid => impl().accept(fid)),
    removeFriend: act(fid => impl().removeFriend(fid)),
    createGroup: act(name => impl().createGroup(name)),
    join: act(code => impl().join(code)),
    addToGroup: act((g, u) => impl().addToGroup(g, u)),
    leave: act(g => impl().leave(g)),
    deleteGroup: act(g => impl().deleteGroup(g)),
    createChallenge: act((g, title, cat, days) => impl().createChallenge(g, title, cat, days)),
    deleteChallenge: act(id => impl().deleteChallenge(id)),
    setSponsor: act(id => impl().setSponsor(id)),
    /** Pedido de força, força para alguém, aviso ao padrinho */
    async notify(payload) {
      try { return await impl().notify(payload); }
      catch (err) { throw new Error(friendly(err)); }
    },
    inviteLink: code => `${location.origin}${location.pathname}#/convite/${code}`,
    friendLink: code => `${location.origin}${location.pathname}#/amigo/${code}`,
  };
})();
