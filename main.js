/* =========================================================
   LIVRE · main
   Rotas, desenho das telas, atualização por segundo,
   folhas (dialogs) e todos os eventos.
   ========================================================= */

/* ---------- Rotas (#/hoje, #/habito/<id>, #/foco, #/pactos, #/conquistas) ---------- */
const VIEWS = { hoje: viewHoje, habito: viewHabit, disputa: viewDisputa, foco: viewFoco, pactos: viewPactos, conquistas: viewConquistas, relatorio: viewRelatorio };

function parseRoute() {
  const [, name, id] = (location.hash || '').match(/^#\/([a-z]+)(?:\/(.+))?$/) || [];
  return VIEWS[name] ? { name, id: id ? decodeURIComponent(id) : null } : { name: 'hoje', id: null };
}

function go(path) {
  if (location.hash === path) render(true);
  else location.hash = path;
}

/* ---------- Desenho ---------- */
let lastSig = '';

function render(scrollTop = false) {
  // Links de convite: #/convite/<código do grupo> e #/amigo/<ID>
  if (captureInvite()) {
    history.replaceState(null, '', '#/disputa');
    setTimeout(processInvite, 300);
  }

  // Atalho do ícone "Tô com vontade" (#/sos): abre a Hoje com o SOS na frente
  if (location.hash === '#/sos') {
    history.replaceState(null, '', '#/hoje');
    setTimeout(() => openSos(), 300);
  }
  const prevRoute = ui.route?.name;
  ui.route = parseRoute();
  const viewEl = $('#view');
  viewEl.innerHTML = VIEWS[ui.route.name](ui.route.id);
  // Troca de seção: entra com um desfoque rápido
  if (prevRoute && prevRoute !== ui.route.name) {
    viewEl.classList.remove('swap');
    void viewEl.offsetWidth;
    viewEl.classList.add('swap');
  }

  // Menu ativo (Detalhe do hábito acende "Hoje")
  const navName = ui.route.name === 'habito' ? 'hoje' : ui.route.name;
  $$('[data-nav]').forEach(a => (a.dataset.nav === navName ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));

  const lv = levelInfo();
  $('#lvlChip').innerHTML = `<b>${lv.level}</b>${lv.title}`;
  applyDiscreet();
  document.documentElement.classList.toggle('report-mode', ui.route.name === 'relatorio');
  document.documentElement.classList.toggle('mono', !!state.settings.mono);

  icons();
  lastSig = signature();
  tick();
  if (scrollTop) window.scrollTo(0, 0);
}

/** Tudo que, ao mudar, pede um redesenho completo da tela atual */
function signature() {
  return [
    ui.route.name, ui.route.id,
    state.habits.map(h => `${stageIndex(currentMs(h))}${goalReached(h) ? 1 : 0}${milestoneList(h).filter(m => m.done).length}`).join(','),
    state.pacts.map(p => pactStatus(p).status).join(','),
    disciplineScore().score, levelInfo().level, Math.floor(xpBreakdown().total / 10),
    !!state.focus.active,
  ].join('|');
}

function clockHTML(ms) {
  const t = splitDuration(ms);
  const parts = t.d > 0 ? [[t.d, 'd'], [pad(t.h), 'h'], [pad(t.m), 'm']] : [[pad(t.h), 'h'], [pad(t.m), 'm'], [pad(t.s), 's']];
  return parts.map(([v, u]) => `${v}<em>${u}</em>`).join('');
}

/** Roda a cada segundo: atualiza só números e barras */
function tick() {
  if (!currentUser || $('#app').hidden) return;

  // Sessão de foco terminou?
  const f = focusActive();
  if (f && Date.now() >= focusEndsAt(f)) {
    endFocus(true);
    toast(`Árvore plantada. +${f.minutes} XP de foco.`, true);
    return render();
  }

  for (const h of state.habits) {
    const cur = currentMs(h);
    const left = goalMs(h) - cur;
    const pct = goalPct(h);
    const pctTxt = `${pct >= 100 ? 100 : pct.toFixed(pct < 10 ? 1 : 0)}%`;

    $$(`[data-clock="${h.id}"]`).forEach(el => (el.innerHTML = clockHTML(cur)));
    $$(`[data-goalbar="${h.id}"]`).forEach(el => (el.style.width = `${pct}%`));
    $$(`[data-goalpct="${h.id}"]`).forEach(el => (el.textContent = pctTxt));
    $$(`[data-next="${h.id}"]`).forEach(el => (el.textContent = left > 0 ? `Meta ${goalLabel(h.goalDays)} · faltam ${formatDuration(left)}` : `Meta ${goalLabel(h.goalDays)} batida`));
    $$(`[data-left="${h.id}"]`).forEach(el => (el.textContent = left > 0 ? `faltam ${formatDuration(left)}` : 'concluída'));
    $$(`[data-best="${h.id}"]`).forEach(el => (el.textContent = formatDuration(bestMs(h))));

    const beating = isBeatingRecord(h);
    $$(`[data-recpill="${h.id}"]`).forEach(el => (el.hidden = !beating));
    $$(`[data-catpill="${h.id}"]`).forEach(el => (el.hidden = beating));

    const counter = $(`[data-counter="${h.id}"]`);
    if (counter) {
      const t = splitDuration(cur);
      ['d', 'h', 'm', 's'].forEach(u => ($(`[data-u="${u}"]`, counter).textContent = pad(t[u])));
    }
  }

  // Placar da disputa
  $$('[data-since]').forEach(el => (el.innerHTML = clockHTML(Date.now() - Number(el.dataset.since))));

  // Foco em andamento
  if (f) {
    const total = f.minutes * MIN;
    const left = Math.max(0, focusEndsAt(f) - Date.now());
    const time = $('[data-focus-time]');
    if (time) time.textContent = `${pad(Math.floor(left / MIN))}:${pad(Math.floor((left % MIN) / 1000))}`;
    const ring = $('[data-focus-ring]');
    if (ring) ring.setAttribute('stroke-dasharray', `${((total - left) / total) * 100} 100`);
    const treeEl = $('[data-focus-tree]');
    const st = focusStageFor(f);
    if (treeEl && +treeEl.dataset.stage !== st) { treeEl.dataset.stage = st; treeEl.innerHTML = treeSVG(st); }
    document.title = `${time ? time.textContent : ''} · Foco · LIVRE`;
  } else if (document.title !== appTitle()) {
    document.title = appTitle();
  }

  // Economia correndo ao vivo
  const moneyEl = $('[data-money]');
  if (moneyEl) moneyEl.textContent = fmtMoneyCents.format(savingsTotals().money);

  // Mudou estágio, meta, marco, pacto ou nível? Redesenha (sem atrapalhar quem está digitando)
  const sig = signature();
  const typing = document.activeElement?.matches?.('#view input, #view textarea');
  if (sig !== lastSig && !typing) render();
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, highlight = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('hl', highlight);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

/* ---------- Confirmação própria (o app não depende do confirm() do navegador) ---------- */
function ask({ title, text, yes = 'Confirmar', danger = false }) {
  const dlg = $('#dlgConfirm');
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  const yesBtn = $('#confirmYes');
  yesBtn.textContent = yes;
  yesBtn.className = `btn ${danger ? 'danger' : 'gold'}`;
  dlg.showModal();
  return new Promise(resolve => {
    const onClick = e => {
      const ans = e.target.closest('[data-answer]')?.dataset.answer;
      if (!ans) return;
      dlg.close();
      resolve(ans === 'yes');
    };
    const onClose = () => { dlg.removeEventListener('click', onClick); resolve(false); };
    dlg.addEventListener('click', onClick);
    dlg.addEventListener('close', onClose, { once: true });
  });
}

/* ---------- Folha: hábito ---------- */
function setChecked(container, value, attr = 'aria-checked') {
  $$('[data-pick]', container).forEach(b => b.setAttribute(attr, String(b.dataset.pick === value)));
}

function openHabitForm(h = null, presetCat = '') {
  $('#habitForm').reset();
  $('#habitTitle').textContent = h ? 'Editar hábito' : 'Novo hábito';
  $('#fId').value = h?.id ?? '';
  $('#fName').value = h?.name ?? '';
  $('#fWhy').value = h?.why ?? '';
  $('#fCost').value = h?.cost?.amount || '';
  $('#fCostPer').value = h?.cost?.per || 'dia';
  $('#fHours').value = h?.hoursPerDay || '';
  $('#fStart').value = toLocalInput(h?.startAt ?? Date.now());
  $('#fStart').max = toLocalInput(Date.now());

  const cat = h?.category ?? (presetCat || 'cigarro');
  $('#fCatChips').innerHTML = Object.entries(CATEGORIES).map(([k, c]) =>
    `<button type="button" class="chip" role="radio" data-pick="${k}" aria-checked="${k === cat}"><i data-lucide="${c.icon}"></i>${c.label}</button>`).join('');

  const goal = h?.goalDays ?? 7;
  const preset = GOAL_LADDER.includes(goal);
  $('#fGoal').value = preset ? goal : 'custom';
  $('#fGoalCustom').value = preset ? '' : goal;
  $('#customGoalWrap').hidden = preset;

  $('#habitError').hidden = true;
  icons();
  $('#dlgHabit').showModal();
}

function submitHabit(e) {
  e.preventDefault();
  const id = $('#fId').value;
  const existing = id ? findHabit(id) : null;
  const name = $('#fName').value.trim();
  const category = $('[data-pick][aria-checked="true"]', $('#fCatChips'))?.dataset.pick || 'outro';
  const startAt = fromLocalInput($('#fStart').value);
  const goalDays = $('#fGoal').value === 'custom' ? parseInt($('#fGoalCustom').value, 10) : Number($('#fGoal').value);
  const lastEnd = existing?.attempts.at(-1)?.end ?? -Infinity;
  const fail = msg => { const el = $('#habitError'); el.textContent = msg; el.hidden = false; };

  if (!name) return fail('Dê um nome ao hábito.');
  if (!Number.isFinite(startAt) || startAt > Date.now() + MIN) return fail('A data precisa ser de agora ou do passado.');
  if (startAt < lastEnd - MIN) return fail('A data não pode ser antes da última recaída registrada.');
  if (!Number.isInteger(goalDays) || goalDays < 1) return fail('A meta precisa ter pelo menos 1 dia.');

  const costAmount = Math.max(0, Number(String($('#fCost').value).replace(',', '.')) || 0);
  const hours = Math.min(24, Math.max(0, Number(String($('#fHours').value).replace(',', '.')) || 0));
  const data = {
    name, category, startAt: Math.min(startAt, Date.now()), goalDays, why: $('#fWhy').value.trim(),
    cost: costAmount > 0 ? { amount: costAmount, per: $('#fCostPer').value } : null,
    hoursPerDay: hours,
  };
  if (existing) updateHabit(id, data);
  else createHabit(data);

  $('#dlgHabit').close();
  toast(existing ? 'Hábito atualizado.' : 'Semente plantada. Agora é um dia de cada vez.', !existing);
  render();
}

/* ---------- Folha: recaída ---------- */
function openRelapse(id) {
  const h = findHabit(id);
  if (!h) return;
  $('#relapseForm').reset();
  $('#rId').value = id;
  $('#rAt').value = toLocalInput(Date.now());
  $('#rAt').min = toLocalInput(h.startAt);
  $('#rAt').max = toLocalInput(Date.now());
  $('#relapseCurrent').textContent = formatDuration(currentMs(h));
  $('#relapseName').textContent = h.name;
  $('#rTriggers').innerHTML = TRIGGERS.map(t => `<button type="button" class="chip" data-trig="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('');
  $('#relapseError').hidden = true;
  $('#dlgRelapse').showModal();
}

function submitRelapse(e) {
  e.preventDefault();
  const h = findHabit($('#rId').value);
  const at = fromLocalInput($('#rAt').value);
  if (!Number.isFinite(at) || at > Date.now() + MIN || at < h.startAt - MIN) {
    const el = $('#relapseError');
    el.textContent = 'A data precisa estar entre o início desta jornada e agora.';
    el.hidden = false;
    return;
  }
  const triggers = $$('[data-trig][aria-pressed="true"]', $('#rTriggers')).map(b => b.dataset.trig);
  const safeAt = clamp(at, h.startAt, Date.now());
  const brokenPacts = state.pacts.filter(p => p.habitId === h.id && pactStatus(p).status === 'active' && safeAt > p.start && safeAt <= p.end);
  const { duration, isRecord } = registerRelapse(h.id, safeAt, $('#rNote').value, triggers);
  $('#dlgRelapse').close();
  // Avisa o padrinho, se a pessoa escolheu ter um (o servidor confere)
  if (cloud.mode === 'firebase' && social.data.me) social.notify({ kind: 'relapse', category: h.category }).catch(() => {});

  if (brokenPacts.length) toast(`Pacto quebrado. Hora de acertar com ${brokenPacts[0].judge}.`);
  else toast(isRecord ? `Novo recorde guardado: ${formatDuration(duration)}. Agora é passar dele.` : `${formatDuration(duration)} guardados no histórico. Recomeçou.`, isRecord);
  render();
}

/* ---------- Folha: pacto ---------- */
function openPact(habitId = '') {
  if (!state.habits.length) return openHabitForm();
  $('#pactForm').reset();
  $('#pHabit').innerHTML = state.habits.map(h => `<option value="${h.id}" ${h.id === habitId ? 'selected' : ''}>${esc(h.name)}</option>`).join('');
  $('#pactError').hidden = true;
  $('#dlgPact').showModal();
}

function submitPact(e) {
  e.preventDefault();
  const days = parseInt($('#pDays').value, 10);
  const stake = Math.round(Number($('#pStake').value));
  const judge = $('#pJudge').value.trim();
  const dest = $('#pDest').value.trim();
  const fail = msg => { const el = $('#pactError'); el.textContent = msg; el.hidden = false; };

  if (!Number.isInteger(days) || days < 1 || days > 365) return fail('O prazo vai de 1 a 365 dias.');
  if (!Number.isFinite(stake) || stake < 1) return fail('Coloque um valor de pelo menos R$ 1.');
  if (!judge) return fail('Diga quem vai ser o juiz.');
  if (!dest) return fail('Diga para onde vai o dinheiro se você falhar.');

  createPact({ habitId: $('#pHabit').value, days, stake, judge, dest });
  $('#dlgPact').close();
  toast(`Pacto firmado. Avise ${judge} para valer de verdade.`, true);
  go('#/pactos');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* sem cópia */ }
    ta.remove();
    return ok;
  }
}

/* ---------- Folha: SOS (respiração 4-4-6 por 90 s) ---------- */
const sos = { timers: [], end: 0, mode: 'breathe' };

function stopBreath() {
  sos.timers.forEach(clearTimeout);
  sos.timers.forEach(clearInterval);
  sos.timers = [];
}

function startBreath() {
  stopBreath();
  sos.end = Date.now() + 90_000;
  const phases = [['Inspira', 4000, 'in'], ['Segura', 4000, 'hold'], ['Solta', 6000, 'out']];
  let i = 0;
  const step = () => {
    const ring = $('#breathRing');
    if (!ring) return;
    const [txt, dur, cls] = phases[i % phases.length];
    ring.className = `breath-ring ${cls}`;
    $('#breathText').textContent = txt;
    i++;
    sos.timers.push(setTimeout(step, dur));
  };
  step();
  sos.timers.push(setInterval(() => {
    const el = $('#sosTime');
    if (!el) return;
    const left = Math.max(0, sos.end - Date.now());
    el.textContent = left > 0 ? `${Math.floor(left / MIN)}:${pad(Math.floor((left % MIN) / 1000))} restantes` : 'O pico já passou. Como está agora?';
  }, 500));
}

function openSos(step = 'breathe') {
  const dlg = $('#dlgSos');
  sos.mode = step;
  $('#sosBody').innerHTML = sosHTML(step);
  icons();
  if (!dlg.open) dlg.showModal();
  if (step === 'breathe') startBreath(); else stopBreath();
}

function sosAnswer(kind) {
  if (kind === 'won') {
    if (!state.habits.length) return sosPick('won', '');
    return openSos('won');
  }
  // Recaída
  if (!state.habits.length) { $('#dlgSos').close(); return openHabitForm(); }
  if (state.habits.length === 1) return sosPick('lost', state.habits[0].id);
  openSos('lost');
}

function sosPick(kind, id) {
  $('#dlgSos').close();
  if (kind === 'won') {
    logUrge(id || null);
    toast('Vontade vencida. +10 XP.', true);
    render();
  } else {
    openRelapse(id);
  }
}

/* ---------- Ações ---------- */
async function handleAction(btn) {
  const { action, id } = btn.dataset;
  switch (action) {
    case 'new-habit': return openHabitForm(null, ui.filter !== 'todos' ? ui.filter : '');
    case 'sos': return openSos();
    case 'relapse': return openRelapse(id);
    case 'new-pact': return openPact(id || '');
    case 'edit': return openHabitForm(findHabit(id));
    case 'go-home': return go('#/hoje');

    case 'set-goal': {
      const days = Number(btn.dataset.goal);
      updateHabit(ui.route.id, { goalDays: days });
      toast(`Nova meta: ${goalLabel(days)}. Bora.`, true);
      return render();
    }

    case 'delete-habit': {
      const h = findHabit(id);
      const ok = await ask({ title: 'Excluir hábito?', text: `"${h.name}", o histórico e os pactos dele somem deste aparelho. Não dá para desfazer.`, yes: 'Excluir', danger: true });
      if (!ok) return;
      deleteHabit(id);
      toast('Hábito excluído.');
      return go('#/hoje');
    }

    case 'focus-quit': {
      const ok = await ask({ title: 'Desistir da sessão?', text: 'A árvore desta sessão seca e fica no seu bosque assim.', yes: 'Desistir', danger: true });
      if (!ok) return;
      endFocus(false);
      toast('Sessão encerrada. A árvore secou.');
      return render();
    }

    case 'toggle-mono':
      state.settings.mono = !state.settings.mono;
      saveState();
      return render();

    case 'copy-judge': {
      const p = state.pacts.find(x => x.id === id);
      const msg = judgeMessage(p);
      if (await copyText(msg)) return toast('Mensagem copiada. É só colar no WhatsApp do juiz.', true);
      return ask({ title: 'Copie a mensagem', text: msg, yes: 'Fechar' });
    }

    case 'delete-pact': {
      const ok = await ask({ title: 'Remover pacto?', text: 'Ele sai da lista. Se ainda estiver valendo, avise o juiz.', yes: 'Remover', danger: true });
      if (!ok) return;
      deletePact(id);
      return render();
    }

    case 'reset': {
      const ok = await ask({ title: 'Zerar tudo?', text: 'Hábitos, histórico, pactos, sessões de foco e conquistas da sua conta. Não dá para desfazer.', yes: 'Zerar tudo', danger: true });
      if (!ok) return;
      replaceState(emptyState());
      saveState();
      toast('Tudo zerado. Recomeço limpo.');
      location.hash = '#/hoje';
      return showOnboarding();
    }

    /* ----- Conta ----- */
    case 'sign-out': {
      const ok = await ask({ title: 'Sair da conta?', text: cloud.mode === 'local' ? 'Seus dados continuam neste aparelho.' : 'Seus dados ficam salvos na conta. Neste aparelho, o lembrete diário é desligado.', yes: 'Sair' });
      if (!ok) return;
      await cloud.signOut();
      return leaveApp();
    }

    /* ----- Disputa ----- */
    case 'go-duel': return go('#/disputa');

    case 'copy-text':
      return toast(await copyText(btn.dataset.text) ? 'Copiado.' : 'Não deu para copiar. Selecione e copie na mão.', true);

    case 'share-friend-link': {
      const code = social.data.me?.code;
      if (!code) return;
      return shareLink(social.friendLink(code), `Me adiciona no LIVRE pra gente disputar quem fica mais tempo limpo. Meu ID: ${code}`);
    }

    case 'share-group-link': {
      const g = social.data.groups.find(x => x.code === btn.dataset.code);
      return shareLink(social.inviteLink(btn.dataset.code), `Entra no meu grupo "${g?.name || 'Disputa'}" no LIVRE. Bora ver quem segura mais tempo.`);
    }

    case 'friend-add': return openFriendForm();

    case 'friend-accept':
      try { await social.accept(btn.dataset.fid); toast('Agora vocês são amigos.', true); }
      catch (err) { toast(err.message); }
      return;

    case 'friend-remove': {
      const name = btn.dataset.name;
      if (name) {
        const ok = await ask({ title: `Desfazer amizade com ${name}?`, text: 'Vocês continuam nos grupos em que já estão juntos.', yes: 'Desfazer', danger: true });
        if (!ok) return;
      }
      try { await social.removeFriend(btn.dataset.fid); } catch (err) { toast(err.message); }
      return;
    }

    case 'group-create': {
      const name = await askInput({ title: 'Novo grupo', text: 'Até 10 pessoas. Depois é só mandar o link.', label: 'Nome do grupo', placeholder: 'Ex.: Turma sem cigarro', ok: 'Criar grupo' });
      if (!name) return;
      try {
        const id = await social.createGroup(name);
        toast('Grupo criado. Agora chama a galera.', true);
        return go(`#/disputa/${id}`);
      } catch (err) { return toast(err.message); }
    }

    case 'group-join': {
      const code = await askInput({ title: 'Entrar num grupo', text: 'Cole o código ou o link que te mandaram.', label: 'Código do convite', placeholder: 'Ex.: K7Q2M9XD', ok: 'Entrar' });
      if (!code) return;
      return joinGroup(code.split('/').pop());
    }

    case 'toggle-share': {
      const ids = new Set(social.sharedIds());
      ids.has(id) ? ids.delete(id) : ids.add(id);
      state.settings.sharedHabits = [...ids];
      saveState();
      return render();
    }

    case 'group-add':
      try { await social.addToGroup(btn.dataset.group, btn.dataset.user); delete social.data.boards[btn.dataset.group]; toast('Amigo adicionado ao grupo.', true); render(); }
      catch (err) { toast(err.message); }
      return;

    case 'group-leave':
    case 'group-delete': {
      const del = action === 'group-delete';
      const ok = await ask(del
        ? { title: 'Apagar o grupo?', text: 'O grupo some para todo mundo. Os hábitos de cada um continuam iguais.', yes: 'Apagar grupo', danger: true }
        : { title: 'Sair do grupo?', text: 'Você some do placar. Dá para voltar se alguém te mandar o link de novo.', yes: 'Sair', danger: true });
      if (!ok) return;
      try { await (del ? social.deleteGroup : social.leave)(btn.dataset.group); go('#/disputa'); }
      catch (err) { toast(err.message); }
      return;
    }

    /* ----- Economia ----- */
    case 'goal-set': {
      const name = await askInput({ title: 'Meta de economia', text: 'O que você quer comprar com o dinheiro que deixou de gastar?', label: 'Meta', placeholder: 'Ex.: Tênis de corrida', ok: 'Próximo' });
      if (!name) return;
      const val = await askInput({ title: 'Quanto custa?', text: name, label: 'Valor em reais', placeholder: 'Ex.: 450', ok: 'Salvar meta' });
      const amount = Number(String(val || '').replace(/[^\d,.]/g, '').replace(',', '.'));
      if (!amount || amount < 1) return val && toast('Valor inválido.');
      state.savingsGoal = { name: name.slice(0, 40), amount: Math.round(amount) };
      saveState();
      toast('Meta criada. Cada dia limpo enche o cofrinho.', true);
      return render();
    }
    case 'goal-clear':
      state.savingsGoal = null;
      saveState();
      return render();

    /* ----- Check-in ----- */
    case 'checkin-edit':
      ui.editCheckin = true;
      return render();

    /* ----- Ponto fraco ----- */
    case 'weak-on': {
      const spot = weakSpot();
      if (!spot) return;
      if (!notifyPref().on) {
        toast('Primeiro ative o lembrete diário. O aviso usa a mesma permissão.');
        return openNotify();
      }
      try { await cloud.setWeakAlert(spot); setNotifyPref({ weak: true }); toast(`Pronto. Vou te avisar ${spot.label}.`, true); render(); }
      catch (err) { toast(err.message); }
      return;
    }
    case 'weak-off':
      try { await cloud.setWeakAlert(null); } catch { /* segue */ }
      setNotifyPref({ weak: false });
      toast('Aviso do ponto fraco desligado.');
      return render();

    /* ----- Planos ----- */
    case 'plan-del': {
      const h = findHabit(id);
      h.plans.splice(Number(btn.dataset.i), 1);
      saveState();
      return render();
    }

    /* ----- Recado do futuro ----- */
    case 'future-save': {
      const text = $('#futureText').value.trim();
      state.futureMsg = { ...(state.futureMsg || {}), text, at: Date.now() };
      saveState();
      return toast(text ? 'Recado salvo. Ele aparece quando você apertar o SOS.' : 'Recado apagado.', true);
    }
    case 'future-rec': return recordFuture(btn);
    case 'future-play': {
      const a = futureAudio();
      if (a) new Audio(a).play().catch(() => toast('Não deu para tocar o áudio.'));
      return;
    }
    case 'future-audio-del':
      store.remove(audioKey());
      return render();

    /* ----- Ajuda, relatório, privacidade ----- */
    case 'help':
      $('#helpBody').innerHTML = helpHTML();
      icons();
      return $('#dlgHelp').showModal();
    case 'print':
      return window.print();
    case 'toggle-discreet':
      state.settings.discreet = !state.settings.discreet;
      saveState();
      toast(state.settings.discreet ? 'Modo discreto ligado. Notificações sem detalhes.' : 'Modo discreto desligado.');
      return render();
    case 'pin-set':
      if (await lock.create()) toast('PIN criado. Ele vai ser pedido ao abrir o app.', true);
      return render();
    case 'pin-remove': {
      const ok = await ask({ title: 'Tirar o PIN?', text: 'O app volta a abrir direto neste aparelho.', yes: 'Tirar PIN', danger: true });
      if (ok) { lock.remove(); render(); }
      return;
    }

    /* ----- Disputa: força, desafios, padrinho ----- */
    case 'sos-group':
      try {
        const r = await social.notify({ kind: 'sos', category: state.habits[0]?.category });
        toast(r.notified ? 'Seu grupo foi avisado. Força chegando.' : 'Pedido enviado.', true);
      } catch (err) { toast(err.message); }
      return;
    case 'cheer':
      try {
        await social.notify({ kind: 'cheer', targetId: btn.dataset.user, groupId: btn.dataset.group || null });
        btn.disabled = true;
        toast(`Força enviada para ${btn.dataset.name || 'seu amigo'}.`, true);
      } catch (err) { toast(err.message); }
      return;
    case 'challenge-new': return openChallenge(btn.dataset.group);
    case 'challenge-del': {
      const ok = await ask({ title: 'Apagar desafio?', text: 'Ele some para todo mundo do grupo.', yes: 'Apagar', danger: true });
      if (!ok) return;
      try { await social.deleteChallenge(id); social.loadBoard(ui.route.id); } catch (err) { toast(err.message); }
      return;
    }
    case 'sponsor-set': {
      const uid2 = btn.dataset.user || null;
      if (uid2) {
        const ok = await ask({ title: `${btn.dataset.name} como padrinho?`, text: 'Ele recebe um aviso quando você registrar uma recaída. Mais ninguém fica sabendo.', yes: 'Escolher' });
        if (!ok) return;
      }
      try { await social.setSponsor(uid2); toast(uid2 ? 'Padrinho escolhido.' : 'Você ficou sem padrinho.', true); } catch (err) { toast(err.message); }
      return;
    }

    case 'delete-account': {
      const ok = await ask({ title: 'Excluir sua conta?', text: 'A conta, os hábitos, o histórico, os pactos e o lembrete são apagados para sempre. Não dá para recuperar.', yes: 'Excluir para sempre', danger: true });
      if (!ok) return;
      const uidBefore = currentUser.id;
      try {
        await cloud.deleteAccount();
      } catch (err) {
        return toast(err.message);
      }
      store.remove(`${STORAGE_KEY}:${uidBefore}`);
      store.remove(`livre:notify:${uidBefore}`);
      leaveApp();
      return authMessage('info', 'Conta excluída. Seus dados foram apagados.');
    }

    case 'demo': {
      const u = await cloud.signInDemo();
      currentUser = u;
      replaceState(store.json(userKey()) || window.LIVRE_DEMO());
      saveState();
      return showApp();
    }

    /* ----- Primeiro acesso ----- */
    case 'onb-start': return startJourneys();

    /* ----- Lembrete diário ----- */
    case 'notify-setup': return openNotify();

    case 'notify-enable': {
      const hour = Number($('#notifyHour').value);
      btn.disabled = true;
      try {
        await cloud.enablePush(hour);
        setNotifyPref({ on: true, hour });
        $('#dlgNotify').close();
        toast(`Lembrete ativado. Todo dia às ${hour}h.`, true);
        render();
      } catch (err) {
        const el = $('#notifyError');
        el.textContent = err.message;
        el.hidden = false;
      } finally { btn.disabled = false; }
      return;
    }

    case 'notify-off':
      try { await cloud.disablePush(); } catch { /* segue mesmo assim */ }
      setNotifyPref({ on: false });
      toast('Lembrete desligado neste aparelho.');
      return render();

    case 'notify-test':
      try { await cloud.testNotification(await reminderPreview()); }
      catch (err) { toast(err.message); }
      return;

    case 'nudge-off':
      state.settings.nudgeOff = true;
      saveState();
      return render();
  }
}

/* =========================================================
   Login e primeiro acesso
   ========================================================= */
const gate = { mode: 'signin', email: '', sel: new Set(), when: 'now', date: '' };
let entering = null;

function showGate(html) {
  $('#app').hidden = true;
  const g = $('#gate');
  g.hidden = false;
  g.innerHTML = html;
  icons();
  window.scrollTo(0, 0);
}

function showAuth(mode = 'signin', email = gate.email) {
  gate.mode = mode;
  gate.email = email;
  showGate(authHTML(mode, { email }));
}

function authMessage(kind, text) {
  const err = $('#authError'), info = $('#authInfo');
  if (!err) return;
  err.hidden = kind !== 'error';
  info.hidden = kind !== 'info';
  (kind === 'error' ? err : info).textContent = text;
}

function showOnboarding() {
  showGate(onboardingHTML(gate.sel, gate.when));
  if (gate.date) $('#onbDate').value = gate.date;
}

function showApp() {
  $('#gate').hidden = true;
  $('#gate').innerHTML = '';
  $('#app').hidden = false;
  render(true);
  // Carrega amigos e grupos em segundo plano (o SOS usa para pedir força)
  if ((state.settings.name || '').trim() && !social.data.loaded) social.refresh();
  if (ui.invite) setTimeout(processInvite, 500);
}

/** Depois do login: carrega os dados da pessoa e decide a tela */
function enterApp(user) {
  if (entering) return entering;
  entering = (async () => {
    currentUser = user;
    showGate('<div class="boot"><span class="brand">LIVRE<span>.</span></span></div>');
    replaceState(await loadUserState());
    if (focusVisibility(false) === 'dead') setTimeout(() => toast('A última sessão de foco secou porque o app foi fechado.'), 600);
    applyDiscreet();
    await lock.guard();
    if (!currentUser) return;   // saiu pela tela do PIN
    if (!state.settings.onboarded && !state.habits.length) showOnboarding();
    else showApp();
  })().finally(() => { entering = null; });
  return entering;
}

function leaveApp() {
  currentUser = null;
  social.reset();
  replaceState(emptyState());
  gate.sel.clear();
  history.replaceState(null, '', location.pathname);
  showAuth('signin');
}

async function submitAuth(e) {
  e.preventDefault();
  const mode = gate.mode;
  const email = ($('#authEmail')?.value ?? gate.email).trim().toLowerCase();
  const pw = $('#authPw')?.value ?? '';
  gate.email = email;

  if (mode !== 'reset' && mode !== 'check' && !/^\S+@\S+\.\S+$/.test(email)) return authMessage('error', 'Digite um e-mail válido.');
  if (mode === 'signin' && !pw) return authMessage('error', 'Digite sua senha.');
  if ((mode === 'signup' || mode === 'reset') && pw.length < 6) return authMessage('error', 'A senha precisa ter pelo menos 6 caracteres.');

  const btn = $('#authSubmit');
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Um instante...';
  try {
    if (mode === 'signin') {
      await enterApp(await cloud.signIn(email, pw));
    } else if (mode === 'signup') {
      const r = await cloud.signUp(email, pw);
      if (r.needsConfirm) return showAuth('check', email);
      await enterApp(r.user);
      toast('Conta criada. Agora escolha o que você quer largar.', true);
    } else if (mode === 'forgot') {
      await cloud.resetPassword(email);
      authMessage('info', 'Pronto. Se esse e-mail tiver conta, o link chega em instantes. Olhe o spam também.');
    } else if (mode === 'reset') {
      await cloud.updatePassword(pw);
      history.replaceState(null, '', location.pathname);
      toast('Senha nova salva.', true);
      await enterApp(cloud.user);
    } else if (mode === 'check') {
      showAuth('signin', email);
    }
  } catch (err) {
    authMessage('error', err.message);
  } finally {
    if (btn.isConnected) { btn.disabled = false; btn.textContent = label; }
  }
}

/** Cria um hábito para cada categoria marcada e abre o app zerado */
function startJourneys() {
  let startAt = Date.now();
  if (gate.when === 'date') {
    const t = fromLocalInput($('#onbDate').value);
    if (!Number.isFinite(t) || t > Date.now() + MIN) {
      const el = $('#onbError');
      el.textContent = 'Escolha uma data de agora ou do passado.';
      el.hidden = false;
      return;
    }
    startAt = Math.min(t, Date.now());
  }
  Object.keys(CATEGORIES).filter(k => gate.sel.has(k)).forEach(k => {
    createHabit({ name: k === 'outro' ? 'Meu hábito' : CATEGORIES[k].label, category: k, startAt, goalDays: 7, why: '' });
  });
  state.settings.onboarded = true;
  saveState();
  gate.sel.clear();
  location.hash = '#/hoje';
  showApp();
  toast('Sementes plantadas. Agora é um dia de cada vez.', true);
  if (!notifyPref().on) setTimeout(openNotify, 700);
}

/* ---------- Lembrete: prévia com os dados reais da pessoa ---------- */
let reminderLib = null;
async function reminderPreview() {
  try {
    reminderLib ||= await import(new URL('netlify/lib/reminder.mjs', document.baseURI).href);
    const msg = reminderLib.buildMessage(state, Date.now());
    if (msg) return msg;
  } catch { /* sem o módulo, usa o exemplo */ }
  const h = state.habits[0];
  const days = h ? Math.floor(currentMs(h) / DAY) : 1;
  return { title: `Você está ${days} ${days === 1 ? 'dia' : 'dias'} sem ${h?.name || 'Cigarro'}`, body: 'Um dia de cada vez. Abre o app e confere sua árvore.' };
}

async function openNotify() {
  const preview = await reminderPreview();
  $('#notifyBody').innerHTML = notifyHTML(preview);
  icons();
  const dlg = $('#dlgNotify');
  if (!dlg.open) dlg.showModal();
}

/** Busca a versão da nuvem quando o app volta para a tela (outro aparelho pode ter mudado) */
async function pullRemote() {
  if (cloud.mode !== 'firebase' || !currentUser || cloud.hasPending()) return;
  try {
    const r = await cloud.loadData();
    if (r && r.updatedAt > (state._savedAt || 0) + 2000) {
      replaceState(r.data);
      store.set(userKey(), JSON.stringify(state));
      if (!$('#app').hidden) render();
    }
  } catch { /* sem internet: segue com o que tem */ }
}

/* =========================================================
   Recursos extras: título discreto, gravação, desafio
   ========================================================= */
const appTitle = () => (state.settings.discreet ? 'Diário' : 'LIVRE');

/** Modo discreto: nome da aba e (antes de instalar) o manifesto com ícone neutro */
function applyDiscreet() {
  const on = !!state.settings.discreet;
  const link = $('#manifestLink');
  const want = on ? 'manifest-discreto.webmanifest' : 'manifest.webmanifest';
  if (link && link.getAttribute('href') !== want) link.setAttribute('href', want);
  const apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (apple) apple.setAttribute('href', on ? 'icons/discreto-apple.png' : 'icons/apple-touch-icon.png');
  if (!focusActive()) document.title = appTitle();
}

let recorder = null, recTimer = null;
async function recordFuture(btn) {
  if (recorder) { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return toast('Este navegador não grava áudio. Use o recado em texto.');
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { return toast('Sem permissão do microfone. Libere nas configurações do navegador.'); }
  const chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    clearTimeout(recTimer);
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    recorder = null;
    if (blob.size > 900_000) return toast('O áudio ficou grande demais. Tente um mais curto.');
    const fr = new FileReader();
    fr.onload = () => {
      if (!store.set(audioKey(), fr.result)) toast('Este navegador não deixou guardar o áudio.');
      else toast('Áudio salvo. Ele toca quando você apertar o SOS.', true);
      render();
    };
    fr.readAsDataURL(blob);
  };
  recorder.start();
  btn.classList.add('recording');
  btn.innerHTML = '<i data-lucide="square"></i>Parar (grava até 30 s)';
  icons();
  recTimer = setTimeout(() => recorder?.stop(), 30_000);
}

function openChallenge(groupId) {
  const board = social.data.boards[groupId];
  const cats = Array.isArray(board) ? [...new Set(board.flatMap(p => (p.habits || []).map(h => h.category)))] : [];
  const options = (cats.length ? cats : Object.keys(CATEGORIES)).map(c => `<option value="${c}">${(CATEGORIES[c] || CATEGORIES.outro).label}</option>`).join('');
  $('#challengeForm').reset();
  $('#chGroup').value = groupId;
  $('#chCat').innerHTML = options;
  $('#chError').hidden = true;
  const suggest = () => { $('#chName').value = `${$('#chDays').value} dias sem ${catLabel($('#chCat').value)}`; };
  suggest();
  $('#chCat').onchange = suggest;
  $('#chDays').onchange = suggest;
  $('#dlgChallenge').showModal();
}

async function submitChallenge(e) {
  e.preventDefault();
  const g = $('#chGroup').value;
  try {
    await social.createChallenge(g, $('#chName').value.trim() || 'Desafio', $('#chCat').value, Number($('#chDays').value));
    $('#dlgChallenge').close();
    toast('Desafio começou. Agora é segurar até o fim.', true);
    social.loadBoard(g);
  } catch (err) {
    const el = $('#chError'); el.textContent = err.message; el.hidden = false;
  }
}

/* =========================================================
   Disputa: convites, campos e compartilhamento
   ========================================================= */
function captureInvite() {
  const m = (location.hash || '').match(/^#\/(convite|amigo)\/([A-Za-z0-9-]+)/);
  if (!m) return false;
  ui.invite = { type: m[1], code: m[2].toUpperCase() };
  return true;
}

async function processInvite() {
  const inv = ui.invite;
  if (!inv || !currentUser || $('#app').hidden) return;
  if (!(state.settings.name || '').trim()) {           // precisa do nome antes
    if (ui.route.name !== 'disputa') go('#/disputa');
    return toast('Coloque seu nome para aceitar o convite.', true);
  }
  ui.invite = null;
  if (inv.type === 'convite') {
    const ok = await ask({ title: 'Entrar no grupo?', text: `Você recebeu um convite para um grupo da Disputa (código ${inv.code}).`, yes: 'Entrar' });
    if (ok) joinGroup(inv.code);
  } else {
    try {
      const p = await social.find(inv.code);
      if (!p) return toast('Esse link de amizade não é mais válido.');
      if (p.code === social.data.me?.code) return toast('Esse é o seu próprio link.');
      const ok = await ask({ title: `Adicionar ${p.name}?`, text: `ID ${p.code}. Vocês vão poder montar grupos de disputa juntos.`, yes: 'Adicionar' });
      if (ok) await sendFriend(p.code);
    } catch (err) { toast(err.message); }
  }
}

async function joinGroup(code) {
  try {
    const id = await social.join(code);
    toast('Você entrou no grupo.', true);
    go(`#/disputa/${id}`);
  } catch (err) { toast(err.message); }
}

async function sendFriend(code) {
  const r = await social.request(code);
  toast({ enviado: 'Pedido enviado. Assim que aceitar, aparece nos seus amigos.', aceito: 'Vocês agora são amigos.', ja_amigos: 'Vocês já são amigos.' }[r] || 'Pedido enviado.', true);
}

async function shareLink(url, text) {
  try {
    if (navigator.share) { await navigator.share({ title: 'LIVRE', text, url }); return; }
  } catch (err) { if (err?.name === 'AbortError') return; }
  toast(await copyText(`${text} ${url}`) ? 'Link copiado. Cola no WhatsApp.' : url, true);
}

/** Folha com um campo só. Devolve o texto ou null. */
function askInput({ title, text = '', label, placeholder = '', ok = 'Confirmar' }) {
  const dlg = $('#dlgInput');
  $('#inputTitle').textContent = title;
  $('#inputText').textContent = text;
  $('#inputLabel').textContent = label;
  $('#inputValue').value = '';
  $('#inputValue').placeholder = placeholder;
  $('#inputOk').textContent = ok;
  $('#inputError').hidden = true;
  dlg.showModal();
  return new Promise(resolve => {
    const form = $('#inputForm');
    const onSubmit = e => {
      e.preventDefault();
      const v = $('#inputValue').value.trim();
      if (!v) { const el = $('#inputError'); el.textContent = 'Preencha o campo.'; el.hidden = false; return; }
      cleanup(); dlg.close(); resolve(v);
    };
    const onClose = () => { cleanup(); resolve(null); };
    const cleanup = () => { form.removeEventListener('submit', onSubmit); dlg.removeEventListener('close', onClose); };
    form.addEventListener('submit', onSubmit);
    dlg.addEventListener('close', onClose);
  });
}

/* Adicionar amigo: 1º procura pelo ID e mostra quem é, 2º envia o pedido */
let friendFound = null;
function openFriendForm() {
  friendFound = null;
  $('#friendForm').reset();
  $('#friendFound').hidden = true;
  $('#friendError').hidden = true;
  $('#friendOk').textContent = 'Procurar';
  $('#dlgFriend').showModal();
}

async function submitFriend(e) {
  e.preventDefault();
  const err = msg => { const el = $('#friendError'); el.textContent = msg; el.hidden = false; };
  $('#friendError').hidden = true;
  const btn = $('#friendOk');
  btn.disabled = true;
  try {
    if (friendFound) {
      await sendFriend(friendFound.code);
      $('#dlgFriend').close();
      return;
    }
    let code = $('#friendCode').value.trim().toUpperCase().replace(/\s/g, '');
    if (/^[A-Z0-9]{5}$/.test(code)) code = `LIV-${code}`;
    if (!/^LIV-[A-Z0-9]{5}$/.test(code)) return err('O ID tem o formato LIV- e mais 5 letras ou números. Ex.: LIV-7K3P9.');
    const p = await social.find(code);
    if (!p) return err('Não achamos ninguém com esse ID. Confira as letras e os números.');
    if (p.code === social.data.me?.code) return err('Esse é o seu próprio ID.');
    friendFound = p;
    const typed = $('#friendName').value.trim().toLowerCase();
    const matches = !typed || p.name.toLowerCase().includes(typed) || typed.includes(p.name.toLowerCase());
    $('#friendFound').innerHTML = `
      <div class="found">
        <span class="avatar">${initial(p.name)}</span>
        <span class="who"><b>${esc(p.name)}</b><small class="num">${esc(p.code)}</small></span>
      </div>
      ${matches ? '' : `<p class="form-info" style="margin-top:10px">O nome nesse ID é <b>${esc(p.name)}</b>, diferente do que você digitou. Confira se é a pessoa certa.</p>`}`;
    $('#friendFound').hidden = false;
    btn.textContent = 'Enviar pedido';
  } catch (ex) {
    err(ex.message);
  } finally {
    btn.disabled = false;
  }
}

function bindEvents() {
  document.addEventListener('click', e => {
    const t = e.target;

    const actionBtn = t.closest('[data-action]');
    if (actionBtn) { e.preventDefault(); handleAction(actionBtn); return; }

    // Login
    const authMode = t.closest('[data-auth-mode]');
    if (authMode) return showAuth(authMode.dataset.authMode, ($('#authEmail')?.value || gate.email).trim());
    const pwBtn = t.closest('[data-toggle-pw]');
    if (pwBtn) {
      const inp = $('#authPw');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      pwBtn.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
      pwBtn.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}"></i>`;
      return icons();
    }

    // Primeiro acesso
    const cat = t.closest('[data-onb-cat]');
    if (cat) {
      const k = cat.dataset.onbCat;
      gate.sel.has(k) ? gate.sel.delete(k) : gate.sel.add(k);
      gate.date = $('#onbDate')?.value || gate.date;
      return showOnboardingKeepScroll();
    }
    const when = t.closest('[data-onb-when]');
    if (when) {
      gate.when = when.dataset.onbWhen;
      gate.date = $('#onbDate')?.value || gate.date;
      return showOnboardingKeepScroll();
    }

    const mood = t.closest('[data-mood]');
    if (mood) return $$('[data-mood]').forEach(b => b.setAttribute('aria-checked', String(b === mood)));

    const duelCat = t.closest('[data-duel-cat]');
    if (duelCat) { ui.duelCat = duelCat.dataset.duelCat; return render(); }

    const filter = t.closest('[data-filter]');
    if (filter) { ui.filter = filter.dataset.filter; return render(); }

    const close = t.closest('[data-close]');
    if (close) return close.closest('dialog')?.close();

    const pick = t.closest('[data-pick]');
    if (pick) return setChecked(pick.parentElement, pick.dataset.pick);

    const trig = t.closest('[data-trig]');
    if (trig) return trig.setAttribute('aria-pressed', String(trig.getAttribute('aria-pressed') !== 'true'));

    const dur = t.closest('[data-min]');
    if (dur) return $$('[data-min]').forEach(b => b.setAttribute('aria-checked', String(b === dur)));

    if (t.closest('#focusLock')) {
      const sw = $('#focusLock');
      return sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
    }

    const sosBtn = t.closest('[data-sos]');
    if (sosBtn) return sosAnswer(sosBtn.dataset.sos);

    const sosPickBtn = t.closest('[data-sos-pick]');
    if (sosPickBtn) return sosPick(sos.mode === 'won' ? 'won' : 'lost', sosPickBtn.dataset.sosPick);
  });

  // Clique fora fecha a folha
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $('#dlgSos').addEventListener('close', stopBreath);

  $('#fGoal').addEventListener('change', () => { $('#customGoalWrap').hidden = $('#fGoal').value !== 'custom'; });
  $('#habitForm').addEventListener('submit', submitHabit);
  $('#relapseForm').addEventListener('submit', submitRelapse);
  $('#pactForm').addEventListener('submit', submitPact);

  // Formulários que são redesenhados (login e foco): escuta no documento
  $('#friendForm').addEventListener('submit', submitFriend);
  $('#friendCode').addEventListener('input', () => {
    friendFound = null;
    $('#friendFound').hidden = true;
    $('#friendOk').textContent = 'Procurar';
  });

  $('#challengeForm').addEventListener('submit', submitChallenge);
  document.addEventListener('input', e => {
    if (e.target.id === 'urgeRange') $('#urgeVal').textContent = e.target.value;
  });

  document.addEventListener('submit', e => {
    if (e.target.id === 'authForm') return submitAuth(e);
    if (e.target.id === 'checkinForm') {
      e.preventDefault();
      const mood = Number($('[data-mood][aria-checked="true"]')?.dataset.mood || 0);
      if (!mood) return toast('Escolha como foi o humor.');
      saveCheckin({ mood, urge: Number($('#urgeRange').value), note: $('#checkinNote').value });
      ui.editCheckin = false;
      toast('Check-in salvo. Até amanhã.', true);
      return render();
    }
    if (e.target.matches('[data-plan-form]')) {
      e.preventDefault();
      const h = findHabit(e.target.dataset.planForm);
      const ifTxt = e.target.elements.if.value.trim().replace(/^se\s+/i, '');
      const thenTxt = e.target.elements.then.value.trim().replace(/^ent[aã]o\s+/i, '');
      if (!ifTxt || !thenTxt) return toast('Preencha as duas partes do plano.');
      h.plans = [...(h.plans || []), { if: ifTxt, then: thenTxt }];
      saveState();
      toast('Plano salvo. Ele aparece no SOS.', true);
      return render();
    }
    if (e.target.id === 'duelNameForm') {
      e.preventDefault();
      const name = $('#duelName').value.trim();
      if (!name) return toast('Escreva um nome.');
      state.settings.name = name.slice(0, 30);
      saveState();
      social.setName(state.settings.name).catch(err => toast(err.message));
      render();
      if (ui.invite) setTimeout(processInvite, 600);
      return;
    }
    if (e.target.id !== 'focusForm') return;
    e.preventDefault();
    const minutes = Number($('[data-min][aria-checked="true"]')?.dataset.min || 25);
    startFocus(minutes, $('#focusIntent').value, $('#focusLock').getAttribute('aria-checked') === 'true');
    toast(`Semente plantada. ${minutes} minutos de foco.`, true);
    render();
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'setName') {
      state.settings.name = e.target.value.trim();
      saveState();
      if (state.settings.name && social.data.me) social.setName(state.settings.name).catch(() => {});
      toast('Nome salvo.');
    }
    if (e.target.id === 'onbDate') gate.date = e.target.value;
  });

  window.addEventListener('hashchange', () => { if (currentUser && !$('#app').hidden) render(true); });

  // Sair do app durante o foco seca a árvore; voltar busca novidades da nuvem
  document.addEventListener('visibilitychange', () => {
    if (!currentUser) return;
    if (document.hidden) cloud.flush();
    const result = focusVisibility(document.hidden);
    if (result === 'dead') { toast('Você saiu do app e a árvore secou.'); render(); }
    else if (!document.hidden) { tick(); pullRemote(); }
  });

  // Outra aba mexeu nos dados
  window.addEventListener('storage', e => {
    if (currentUser && e.key === userKey()) {
      replaceState(store.json(userKey()));
      if (!$('#app').hidden) render();
    }
  });

  // Login, saída e link de "esqueci a senha"
  cloud.onAuthChange((event, user) => {
    if (event === 'PASSWORD_RECOVERY') return showAuth('reset');
    if (event === 'SIGNED_OUT' && currentUser) return leaveApp();
    if (event === 'SIGNED_IN' && user && !currentUser && gate.mode !== 'reset') enterApp(user);
  });
}

function showOnboardingKeepScroll() {
  const y = window.scrollY;
  showOnboarding();
  window.scrollTo(0, y);
}

async function init() {
  $('#fGoal').innerHTML = GOAL_LADDER.map(g => `<option value="${g}">${GOAL_LABELS[g]}</option>`).join('') +
    '<option value="custom">Personalizada...</option>';
  bindEvents();
  lock.bind();
  dock.mount();
  setInterval(tick, 1000);
  captureInvite();   // guarda o convite para depois do login

  let user = null;
  try {
    user = await cloud.init();
  } catch (err) {
    showAuth('signin');
    return authMessage('error', err.message);
  }

  if (cloud.isRecovery && user) showAuth('reset');
  else if (user) await enterApp(user);
  else showAuth('signin');
}

init();
