/* =========================================================
   LIVRE · telas
   Cada função devolve o HTML de uma tela. Os trechos que mudam
   a cada segundo têm atributos data-* e são atualizados pelo
   tick() em main.js, sem redesenhar a tela inteira.
   ========================================================= */

const catOf = h => CATEGORIES[h.category] ?? CATEGORIES.outro;
const firstName = () => (state.settings.name || '').trim().split(' ')[0];

function greeting() {
  const h = new Date().getHours();
  const base = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return firstName() ? `${base}, ${esc(firstName())}` : base;
}

function emptyBlock({ stage = 0, title, text, action = '', label = '' }) {
  return `
    <div class="panel empty">
      <div class="tree-box">${treeSVG(stage)}</div>
      <h3>${title}</h3>
      <p class="muted">${text}</p>
      ${action ? `<button type="button" class="btn gold" data-action="${action}">${label}</button>` : ''}
    </div>`;
}

/* =================== HOJE =================== */
function viewHoje() {
  const ds = disciplineScore();
  const lv = levelInfo();
  const list = ui.filter === 'todos' ? state.habits : state.habits.filter(h => h.category === ui.filter);
  const trig = triggerStats().slice(0, 5);
  const maxTrig = trig[0]?.[1] || 1;
  const activePacts = state.pacts.filter(p => pactStatus(p).status === 'active').length;
  const counts = key => key === 'todos' ? state.habits.length : state.habits.filter(h => h.category === key).length;

  return `
    <section class="screen-head">
      <div>
        <p class="label">${fmtToday.format(Date.now())}</p>
        <h1>${greeting()}</h1>
      </div>
      <button type="button" class="btn gold" data-action="new-habit"><i data-lucide="plus"></i>Novo hábito</button>
    </section>

    <section class="today-top">
      <div class="pulse">
        <div class="ring">${ringSVG(ds.score)}<div class="ring-val"><b data-score>${ds.score}</b><small>Disciplina</small></div></div>
        <div class="pulse-info">
          <div>
            <p class="label">Índice de hoje</p>
            <h2 data-score-label>${ds.label}</h2>
          </div>
          <div class="xp">
            <div class="xp-top"><span>Nível ${lv.level} · ${lv.title}</span><b data-xp>${lv.xp} XP</b></div>
            <div class="bar thin"><i style="width:${lv.pct}%"></i></div>
          </div>
        </div>
      </div>

      <div class="side-stack">
        <button type="button" class="quick-sos" data-action="sos">
          <span class="ico"><i data-lucide="life-buoy"></i></span>
          <span><b>Tô com vontade</b><small>Respira 90 segundos comigo antes de decidir.</small></span>
        </button>
        <div class="mini-row">
          <a class="mini" href="#/foco"><i data-lucide="timer"></i><span><b class="num">${focusMinutesToday()} min</b><small>de foco hoje</small></span></a>
          <a class="mini" href="#/pactos"><i data-lucide="handshake"></i><span><b class="num">${activePacts}</b><small>${activePacts === 1 ? 'pacto ativo' : 'pactos ativos'}</small></span></a>
        </div>
      </div>
    </section>

    ${state.habits.length ? `<div class="extras-row">${savingsPanel()}${checkinPanel()}</div>` : ''}
    ${weakPanel()}

    ${state.habits.length && !notifyPref().on && !state.settings.nudgeOff ? `
    <section class="nudge">
      <span class="ico"><i data-lucide="bell-ring"></i></span>
      <span class="nudge-txt"><b>Quer um lembrete todo dia?</b><small>"Você está ${Math.floor(currentMs(state.habits[0]) / DAY)} ${Math.floor(currentMs(state.habits[0]) / DAY) === 1 ? 'dia' : 'dias'} sem ${esc(state.habits[0].name)}". Chega no horário que você escolher.</small></span>
      <button type="button" class="btn gold sm" data-action="notify-setup">Ativar</button>
      <button type="button" class="icon-btn" data-action="nudge-off" aria-label="Dispensar"><i data-lucide="x"></i></button>
    </section>` : ''}

    ${state.habits.length ? `
    <section>
      <div class="chip-row" role="toolbar" aria-label="Filtrar por categoria">
        ${[['todos', { label: 'Todos', icon: 'layout-grid' }], ...Object.entries(CATEGORIES)]
          .filter(([k]) => k === 'todos' || counts(k) > 0)
          .map(([k, c]) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${ui.filter === k}">
              <i data-lucide="${c.icon}"></i>${c.label}<span class="count">${counts(k)}</span></button>`).join('')}
      </div>
    </section>` : ''}

    <section>
      <div class="section-title"><h2>Suas jornadas</h2><span class="muted">${list.length} ${list.length === 1 ? 'hábito' : 'hábitos'}</span></div>
      ${state.habits.length ? `
        <div class="habit-list">
          ${list.map(habitCard).join('')}
          <button type="button" class="add-habit" data-action="new-habit"><i data-lucide="plus"></i>Adicionar hábito</button>
        </div>` : emptyBlock({
          title: 'Plante sua primeira semente',
          text: 'Cadastre o que você quer largar e marque quando parou. A árvore cresce junto com os seus dias limpos.',
          action: 'new-habit', label: 'Começar agora',
        })}
    </section>

    ${trig.length ? `
    <section class="panel">
      <div class="section-title"><h2>O que mais te derruba</h2><span class="muted">gatilhos das recaídas</span></div>
      ${trig.map(([t, n]) => `
        <div class="trig"><span>${esc(t)}</span><div class="bar"><i style="width:${(n / maxTrig) * 100}%"></i></div><span class="num">${n}</span></div>`).join('')}
    </section>` : ''}

    <button type="button" class="help-link" data-action="help"><i data-lucide="hand-heart"></i>Precisa de ajuda profissional? Veja contatos gratuitos</button>`;
}

function habitCard(h) {
  const stage = stageIndex(currentMs(h));
  const cat = catOf(h);
  return `
    <a class="habit" href="#/habito/${h.id}" data-hid="${h.id}" data-stage="${stage}">
      <div class="tree-box">${treeSVG(stage)}</div>
      <div class="habit-main">
        <div class="habit-top">
          <h3>${esc(h.name)}</h3>
          <span class="pill" data-recpill="${h.id}" hidden><i data-lucide="zap"></i>Recorde</span>
          <span class="pill grey" data-catpill="${h.id}"><i data-lucide="${cat.icon}"></i>${STAGES[stage].name}</span>
        </div>
        <div class="clock" data-clock="${h.id}"></div>
        <div class="bar thin"><i data-goalbar="${h.id}"></i></div>
        <div class="next"><span data-next="${h.id}"></span><span class="num gold" data-goalpct="${h.id}"></span></div>
      </div>
    </a>`;
}

/* =================== DETALHE DO HÁBITO =================== */
function viewHabit(id) {
  const h = findHabit(id);
  if (!h) return emptyBlock({ title: 'Hábito não encontrado', text: 'Ele pode ter sido excluído.', action: 'go-home', label: 'Voltar para Hoje' });

  const cur = currentMs(h);
  const stage = stageIndex(cur);
  const cat = catOf(h);
  const avg = h.attempts.length ? h.attempts.reduce((s, a) => s + a.duration, 0) / h.attempts.length : null;
  const liveRecord = !h.attempts.length || isBeatingRecord(h);
  const recIdx = liveRecord ? -1 : h.attempts.findIndex(a => a.duration === h.record);
  const trig = triggerStats([h]);
  const maxTrig = trig[0]?.[1] || 1;
  const heat = heatmap(h);

  return `
    <a class="back" href="#/hoje"><i data-lucide="arrow-left"></i>Hoje</a>

    <section class="hero-habit" data-hid="${h.id}" data-stage="${stage}">
      <div class="hero-tree">
        ${treeSVG(stage)}
        <span class="stage">${STAGES[stage].name}</span>
      </div>
      <div class="hero-main">
        <div>
          <p class="label"><i data-lucide="${cat.icon}" style="width:13px;height:13px;vertical-align:-2px"></i> ${cat.label} · desde ${fmtDateTime.format(h.startAt)}</p>
          <h1>${esc(h.name)}</h1>
        </div>
        <div class="counter" data-counter="${h.id}" aria-label="Tempo sem recaída">
          <div><b data-u="d">00</b><small>dias</small></div>
          <div><b data-u="h">00</b><small>horas</small></div>
          <div><b data-u="m">00</b><small>min</small></div>
          <div><b data-u="s">00</b><small>seg</small></div>
        </div>
        ${h.why ? `<p class="why">"${esc(h.why)}"</p>` : ''}
        <div>
          <div class="xp-top" style="margin-bottom:8px"><span>Meta <b style="color:var(--fg);font-family:var(--body)">${goalLabel(h.goalDays)}</b> · <span data-left="${h.id}"></span></span><b data-goalpct="${h.id}"></b></div>
          <div class="bar"><i data-goalbar="${h.id}"></i></div>
          ${goalReached(h) ? `
            <div class="goal-done">
              <p><i data-lucide="flag"></i><b>Meta batida.</b> Próximo desafio:</p>
              <div class="chip-row wrap">${suggestGoals(h).map(g => `<button type="button" class="chip goal" data-action="set-goal" data-goal="${g}">${goalLabel(g)}</button>`).join('')}</div>
            </div>` : ''}
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat hl"><span class="label">Maior recorde</span><b data-best="${h.id}">${formatDuration(bestMs(h))}</b></div>
      <div class="stat"><span class="label">Tentativa</span><b>#${h.attempts.length + 1}</b></div>
      <div class="stat"><span class="label">Média por período</span><b>${avg === null ? 'Sem dados' : formatDuration(avg)}</b></div>
      <div class="stat"><span class="label">Tempo limpo total</span><b>${formatDuration(cleanTotalMs(h))}</b></div>
    </section>

    ${weakPanel([h], true)}

    <div class="two-col">
      <div class="stack">
        ${economyPanel(h)}
        <section class="panel">
          <div class="section-title"><h2>Marcos</h2><span class="muted">${milestoneList(h).filter(m => m.done).length} de ${MILESTONES.length} nesta jornada</span></div>
          <div class="milestones">
            ${milestoneList(h).map(m => `
              <div class="ms ${m.done ? 'done' : ''} ${m.past ? 'past' : ''} ${m.next ? 'next' : ''}">
                <span class="ms-ico"><i data-lucide="${m.done ? 'check' : m.past ? 'history' : 'lock'}"></i></span>
                <b>${goalLabel(m.days)}</b>
                <small>${m.done ? fmtShort.format(m.reachedAt) : m.past ? 'já chegou antes' : m.next ? `em ${formatDuration(m.days * DAY - cur)}` : fmtShort.format(m.reachedAt)}</small>
              </div>`).join('')}
          </div>
        </section>

        <section class="panel">
          <div class="section-title"><h2>Últimas 12 semanas</h2><span class="muted">cada quadrado é um dia</span></div>
          <div class="heat-wrap"><div class="heat">
            ${heat.map(d => `<i class="${d.c}" title="${fmtShort.format(d.day)}"></i>`).join('')}
          </div></div>
          <div class="legend">
            <span><i style="background:var(--gold)"></i>Dia limpo</span>
            <span><i style="background:rgba(245,197,24,.45)"></i>Dia em andamento</span>
            <span><i style="border:1.5px solid var(--danger)"></i>Recaída</span>
          </div>
        </section>
      </div>

      <div class="stack">
        ${plansPanel(h)}
        <section class="panel">
          <div class="section-title"><h2>Gatilhos</h2><span class="muted">${h.attempts.length} ${h.attempts.length === 1 ? 'recaída' : 'recaídas'}</span></div>
          ${trig.length
            ? trig.map(([t, n]) => `<div class="trig"><span>${esc(t)}</span><div class="bar"><i style="width:${(n / maxTrig) * 100}%"></i></div><span class="num">${n}</span></div>`).join('')
            : `<p class="muted">Quando registrar uma recaída, marque o que puxou. Aqui aparece o padrão.</p>`}
        </section>

        <section class="panel">
          <div class="section-title"><h2>Histórico</h2></div>
          <ul class="hist">
            <li>
              <div><p class="when">Desde ${fmtShort.format(h.startAt)}</p><p class="gold" style="font-size:.78rem;margin-top:4px">Em andamento</p></div>
              <span class="dur ${liveRecord ? 'rec' : ''}" data-histlive="${h.id}">${liveRecord ? '<i data-lucide="zap"></i>' : ''}${formatDuration(cur)}</span>
            </li>
            ${h.attempts.map((a, i) => ({ ...a, rec: i === recIdx })).reverse().map(a => `
              <li>
                <div style="min-width:0">
                  <p class="when">${fmtShort.format(a.start)} → ${fmtShort.format(a.end)}</p>
                  ${a.triggers?.length ? `<div class="tags">${a.triggers.map(t => `<span class="pill grey">${esc(t)}</span>`).join('')}</div>` : ''}
                  ${a.note ? `<p class="note">"${esc(a.note)}"</p>` : ''}
                </div>
                <span class="dur ${a.rec ? 'rec' : ''}">${a.rec ? '<i data-lucide="zap"></i>' : ''}${formatDuration(a.duration)}</span>
              </li>`).join('')}
          </ul>
        </section>
      </div>
    </div>

    <section class="actions-row">
      <button type="button" class="btn gold" data-action="relapse" data-id="${h.id}"><i data-lucide="rotate-ccw"></i>Registrar recaída</button>
      <button type="button" class="btn ghost" data-action="new-pact" data-id="${h.id}"><i data-lucide="handshake"></i>Firmar pacto</button>
      <button type="button" class="btn ghost" data-action="edit" data-id="${h.id}"><i data-lucide="pencil"></i>Editar</button>
      <button type="button" class="btn danger" data-action="delete-habit" data-id="${h.id}"><i data-lucide="trash"></i>Excluir</button>
    </section>`;
}

/* =================== FOCO =================== */
function focusStageFor(f) {
  const pct = clamp((Date.now() - f.start) / (f.minutes * MIN), 0, 1);
  return Math.min(5, Math.floor(pct * 6));
}

function viewFoco() {
  const f = focusActive();
  const prefs = state.focus.prefs;
  const ok = focusOk();
  const dead = state.focus.sessions.length - ok.length;
  const grove = state.focus.sessions.slice(-40).reverse();

  const stage = f
    ? `
      <div class="focus-stage" data-focus-live>
        <p class="label">${f.locked ? 'Sessão travada' : 'Sessão de foco'}</p>
        <div class="focus-dial">
          <svg class="track" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#262626" stroke-width="3"/>
            <circle cx="50" cy="50" r="46" fill="none" stroke="${ART.gold}" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" data-focus-ring/>
          </svg>
          <div class="tree-in" data-focus-tree data-stage="${focusStageFor(f)}">${treeSVG(focusStageFor(f))}</div>
        </div>
        <div class="focus-time" data-focus-time>--:--</div>
        ${f.intent ? `<p class="focus-intent">${esc(f.intent)}</p>` : ''}
        <p class="muted" style="font-size:.82rem">Sair do app por mais de 10 segundos seca a árvore.</p>
        ${f.locked
          ? `<p class="pill"><i data-lucide="lock"></i>Sem botão de desistir até o fim</p>`
          : `<button type="button" class="btn outline" data-action="focus-quit"><i data-lucide="x"></i>Desistir</button>`}
      </div>`
    : `
      <div class="focus-stage">
        <div class="focus-idle">${treeSVG(1)}</div>
        <form class="focus-form" id="focusForm">
          <label class="field"><span>No que você vai focar?</span>
            <input id="focusIntent" class="input" maxlength="60" placeholder="Ex.: Estudar estrutura de dados" />
          </label>
          <div class="field"><span>Duração</span>
            <div class="dur-row" role="radiogroup" aria-label="Duração">
              ${FOCUS_OPTIONS.map(m => `<button type="button" class="chip" role="radio" data-min="${m}" aria-checked="${prefs.minutes === m}">${m} min</button>`).join('')}
            </div>
          </div>
          <div class="switch-row">
            <span><b>Travar sessão</b><small>Some o botão de desistir. Só termina quando o tempo acabar.</small></span>
            <button type="button" class="switch" role="switch" id="focusLock" aria-checked="${prefs.locked}" aria-label="Travar sessão"></button>
          </div>
          <button type="submit" class="btn gold block"><i data-lucide="sprout"></i>Plantar e começar</button>
        </form>
      </div>`;

  return `
    <section class="screen-head">
      <div>
        <h1>Foco</h1>
        <p class="muted">Plante uma árvore e fique no app até ela crescer. Se sair para rolar o feed, ela seca.</p>
      </div>
    </section>

    <div class="two-col">
      <div class="stack">${stage}</div>
      <div class="stack">
        <section class="panel">
          <div class="section-title"><h2>Seu bosque</h2><span class="muted">últimas ${grove.length} sessões</span></div>
          <div class="xp-src" style="margin:0 0 16px">
            <div><b>${focusMinutesToday()} min</b><small>foco hoje</small></div>
            <div><b>${ok.length}</b><small>árvores vivas</small></div>
            <div><b>${dead}</b><small>secaram</small></div>
          </div>
          ${grove.length
            ? `<div class="grove">${grove.map(s => `<div title="${fmtShort.format(s.start)} · ${s.minutes} min${s.intent ? ' · ' + esc(s.intent) : ''}">${treeSVG(s.ok ? (s.minutes >= 45 ? 5 : 4) : 3, { dead: !s.ok, label: s.ok ? 'Árvore viva' : 'Árvore seca' })}</div>`).join('')}</div>`
            : `<p class="muted">Ainda vazio. Cada sessão concluída vira uma árvore aqui.</p>`}
        </section>

        <section class="panel">
          <div class="section-title"><h2>Menos estímulo</h2></div>
          <div class="switch-row">
            <span><b>Modo preto e branco</b><small>Tira as cores do app, até o dourado. Sem cor, a tela chama menos atenção e dá menos vontade de ficar abrindo.</small></span>
            <button type="button" class="switch" role="switch" data-action="toggle-mono" aria-checked="${state.settings.mono}" aria-label="Modo preto e branco"></button>
          </div>
        </section>
      </div>
    </div>`;
}

/* =================== PACTOS =================== */
function pactCard(p, i) {
  const h = findHabit(p.habitId);
  const st = pactStatus(p);
  const statusPill = {
    active: `<span class="pill">Ativo</span>`,
    done: `<span class="pill"><i data-lucide="check"></i>Cumprido</span>`,
    broken: `<span class="pill red">Quebrado</span>`,
  }[st.status];

  return `
    <article class="pact ${st.status}">
      <div class="pact-head"><span class="pact-no">PACTO Nº ${String(i + 1).padStart(3, '0')}</span>${statusPill}</div>
      <p class="pact-text">
        Eu me comprometo a ficar <b>${p.days} ${p.days === 1 ? 'dia' : 'dias'}</b> sem <b>${esc(h?.name || 'hábito excluído')}</b>.
        Se falhar, <b>${esc(p.judge)}</b> me cobra <span class="stake">${fmtMoney.format(p.stake)}</span>, que vão para <b>${esc(p.dest)}</b>.
      </p>
      ${st.status === 'active' ? `<div class="bar thin"><i style="width:${st.pct}%"></i></div>` : ''}
      <div class="pact-meta">
        <span>${fmtShort.format(p.start)} → ${fmtShort.format(p.end)}</span>
        <span>${st.status === 'active' ? `faltam ${formatDuration(st.left)}` : st.status === 'broken' ? `quebrado em ${fmtShort.format(st.at)}` : 'palavra cumprida'}</span>
      </div>
      <div class="pact-foot">
        <button type="button" class="btn ghost sm" data-action="copy-judge" data-id="${p.id}"><i data-lucide="copy"></i>${st.status === 'active' ? 'Avisar o juiz' : st.status === 'broken' ? 'Mensagem de acerto' : 'Contar pro juiz'}</button>
        <button type="button" class="icon-btn" data-action="delete-pact" data-id="${p.id}" aria-label="Remover pacto"><i data-lucide="trash"></i></button>
        ${st.status !== 'active' ? `<div class="seal ${st.status === 'broken' ? 'red' : ''}" aria-hidden="true">${st.status === 'broken' ? 'QUEBRADO' : 'CUMPRIDO'}</div>` : ''}
      </div>
    </article>`;
}

function viewPactos() {
  const order = { active: 0, broken: 1, done: 2 };
  const list = state.pacts.map((p, i) => ({ p, i })).sort((a, b) => order[pactStatus(a.p).status] - order[pactStatus(b.p).status] || b.p.start - a.p.start);

  return `
    <section class="screen-head">
      <div>
        <h1>Pactos</h1>
        <p class="muted">Compromisso com alguém de verdade. Você define o prazo, o valor e quem cobra. Recaiu antes do fim, o pacto quebra.</p>
      </div>
      ${state.habits.length ? `<button type="button" class="btn gold" data-action="new-pact"><i data-lucide="plus"></i>Novo pacto</button>` : ''}
    </section>

    ${!state.habits.length
      ? emptyBlock({ title: 'Primeiro, um hábito', text: 'O pacto é sempre sobre um hábito que você está largando.', action: 'new-habit', label: 'Cadastrar hábito' })
      : list.length
        ? `<div class="pacts">${list.map(({ p, i }) => pactCard(p, i)).join('')}</div>`
        : emptyBlock({ stage: 2, title: 'Nenhum pacto ainda', text: 'Escolha alguém que vai mesmo te cobrar. Valor pequeno, mas que doa um pouco, costuma funcionar melhor.', action: 'new-pact', label: 'Firmar o primeiro' })}`;
}

/* =================== CONQUISTAS =================== */
function viewConquistas() {
  const xp = xpBreakdown();
  const lv = levelInfo(xp.total);
  const unlocked = BADGES.filter(b => b.test()).length;

  return `
    <section class="screen-head"><div><h1>Conquistas</h1><p class="muted">Cada hora limpa, cada vontade vencida e cada minuto de foco viram XP.</p></div></section>

    <section class="panel">
      <div class="level-hero">
        <div class="level-num" aria-label="Nível ${lv.level}">${lv.level}</div>
        <div class="level-info">
          <p class="label">Nível ${lv.level}</p>
          <h2>${lv.title}</h2>
          <div class="xp-top"><span>${lv.xp.toLocaleString('pt-BR')} XP</span><b>${lv.next.toLocaleString('pt-BR')} XP</b></div>
          <div class="bar"><i style="width:${lv.pct}%"></i></div>
        </div>
      </div>
      <div class="xp-src">
        <div><b>${xp.clean.toLocaleString('pt-BR')}</b><small>horas limpas</small></div>
        <div><b>${state.urges.length}</b><small>vontades vencidas</small></div>
        <div><b>${xp.focus}</b><small>min de foco</small></div>
      </div>
      <p class="muted" style="font-size:.78rem;margin-top:12px">1 XP por hora limpa, 10 por vontade vencida e 1 por minuto de foco concluído.</p>
    </section>

    <section>
      <div class="section-title"><h2>Medalhas</h2><span class="muted">${unlocked} de ${BADGES.length}</span></div>
      <div class="badges">
        ${BADGES.map(b => {
          const on = b.test();
          return `<div class="badge ${on ? 'on' : ''}"><span class="b-ico"><i data-lucide="${on ? b.icon : 'lock'}"></i></span><b>${b.title}</b><small>${b.desc}</small></div>`;
        }).join('')}
      </div>
    </section>

    <section class="panel">
      <div class="section-title"><h2>Sua vontade nos últimos 30 dias</h2><span class="muted">dos check-ins</span></div>
      ${checkinChart()}
    </section>

    <section class="panel">
      <div class="section-title"><h2>Meta de economia</h2></div>
      ${state.savingsGoal
        ? `<div class="switch-row"><span><b>${esc(state.savingsGoal.name)}</b><small>${fmtMoney.format(state.savingsGoal.amount)} · ${Math.min(100, Math.round(savingsTotals().money / state.savingsGoal.amount * 100))}% juntado</small></span>
             <span class="row-actions"><button type="button" class="btn ghost sm" data-action="goal-set">Mudar</button><button type="button" class="icon-btn" data-action="goal-clear" aria-label="Tirar meta"><i data-lucide="x"></i></button></span></div>`
        : `<p class="muted" style="margin-bottom:12px">Escolha algo pra comprar com o dinheiro que deixou de gastar.</p><button type="button" class="btn ghost sm" data-action="goal-set"><i data-lucide="gift"></i>Definir meta</button>`}
    </section>

    ${futureMsgPanel()}
    ${privacyPanel()}

    <section class="panel">
      <div class="section-title"><h2>Relatório e ajuda</h2></div>
      <div class="actions-row">
        <a class="btn ghost" href="#/relatorio"><i data-lucide="file-text"></i>Relatório em PDF</a>
        <button type="button" class="btn ghost" data-action="help"><i data-lucide="hand-heart"></i>Ajuda profissional</button>
      </div>
      <p class="muted" style="font-size:.78rem;margin-top:10px">O relatório reúne seu histórico e gatilhos para levar no psicólogo ou médico.</p>
    </section>

    <section class="panel">
      <div class="section-title"><h2>Lembrete diário</h2></div>
      <div class="switch-row">
        <span><b>${notifyPref().on ? `Todo dia às ${notifyPref().hour}h` : 'Desligado'}</b><small>${notifyPref().on ? 'Chega no celular dizendo há quantos dias você está sem cada hábito.' : 'Uma notificação por dia com os seus dias limpos.'}</small></span>
        <button type="button" class="switch" role="switch" data-action="${notifyPref().on ? 'notify-off' : 'notify-setup'}" aria-checked="${notifyPref().on}" aria-label="Lembrete diário"></button>
      </div>
      <div class="actions-row" style="padding-top:12px">
        ${notifyPref().on ? '<button type="button" class="btn ghost sm" data-action="notify-setup"><i data-lucide="clock"></i>Mudar horário</button>' : ''}
        <button type="button" class="btn ghost sm" data-action="notify-test"><i data-lucide="bell"></i>Testar agora</button>
      </div>
    </section>

    <section class="panel">
      <div class="section-title"><h2>Conta</h2>${cloud.mode === 'local' ? '<span class="pill grey">modo local</span>' : ''}</div>
      <div class="switch-row">
        <span style="min-width:0"><b style="overflow-wrap:anywhere">${esc(currentUser?.email || '')}</b><small>${cloud.mode === 'local' ? 'Dados só neste aparelho.' : 'Dados salvos na sua conta e sincronizados entre aparelhos.'}</small></span>
        <button type="button" class="btn ghost sm" data-action="sign-out"><i data-lucide="log-out"></i>Sair</button>
      </div>
      <label class="field" style="padding:14px 0;border-bottom:1px solid var(--line-soft)">
        <span>Seu nome</span>
        <input id="setName" class="input" maxlength="30" value="${esc(state.settings.name)}" placeholder="Para o app te chamar pelo nome" />
      </label>
      <div class="switch-row">
        <span><b>Modo preto e branco</b><small>Tira todas as cores do app.</small></span>
        <button type="button" class="switch" role="switch" data-action="toggle-mono" aria-checked="${state.settings.mono}" aria-label="Modo preto e branco"></button>
      </div>
      <div class="switch-row">
        <span><b>Zerar tudo</b><small>Apaga hábitos, histórico, pactos e sessões, mas mantém a conta.</small></span>
        <button type="button" class="btn danger sm" data-action="reset">Zerar</button>
      </div>
      <div class="switch-row">
        <span><b>Excluir conta</b><small>Apaga a conta e todos os dados para sempre.</small></span>
        <button type="button" class="btn danger sm" data-action="delete-account">Excluir</button>
      </div>
      <p class="muted" style="font-size:.78rem;padding-top:12px"><a href="privacidade.html" target="_blank" rel="noopener" style="text-decoration:underline">Política de privacidade</a></p>
    </section>`;
}

/* =================== SOS =================== */
function sosHTML(step) {
  if (step === 'breathe') {
    const reasons = state.habits.filter(h => h.why);
    return `
      <div class="sheet-head">
        <h3 id="sosTitle">Respira comigo</h3>
        <button type="button" class="icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button>
      </div>
      <p class="muted">A vontade sobe, chega no pico e baixa. Fica aqui até ela passar. Não precisa decidir nada agora.</p>
      <div class="breath"><div class="breath-ring" id="breathRing"><span id="breathText">Inspira</span></div></div>
      <p class="sos-time" id="sosTime">1:30</p>
      ${state.futureMsg?.text || futureAudio() ? `
        <div class="future">
          <p class="label">Recado seu, de um dia bom</p>
          ${state.futureMsg?.text ? `<p>"${esc(state.futureMsg.text)}"</p>` : ''}
          ${futureAudio() ? `<button type="button" class="btn ghost sm" data-action="future-play"><i data-lucide="play"></i>Ouvir seu áudio</button>` : ''}
        </div>` : ''}
      ${reasons.length ? `<div class="reasons">${reasons.map(h => `<p><small>${esc(h.name)}</small>${esc(h.why)}</p>`).join('')}</div>` : ''}
      ${(() => {
        const plans = state.habits.flatMap(h => (h.plans || []).map(p => ({ ...p, name: h.name })));
        return plans.length ? `<div class="reasons">${plans.slice(0, 4).map(p => `<p><small>Seu plano · ${esc(p.name)}</small>Se ${esc(p.if)}, então ${esc(p.then)}.</p>`).join('')}</div>` : '';
      })()}
      ${social.data.groups.length ? `<button type="button" class="btn ghost block" data-action="sos-group"><i data-lucide="megaphone"></i>Pedir força ao meu grupo</button>` : ''}
      <div class="sheet-actions" style="flex-direction:column">
        <button type="button" class="btn gold block" data-sos="won"><i data-lucide="shield-check"></i>Passou. Venci a vontade</button>
        <button type="button" class="btn ghost block" data-sos="lost">Não deu, quero registrar a recaída</button>
        <button type="button" class="help-link" data-action="help" style="align-self:center"><i data-lucide="hand-heart"></i>Preciso de ajuda profissional</button>
      </div>`;
  }

  // Escolher o hábito (para a vitória ou para a recaída)
  const won = step === 'won';
  return `
    <div class="sheet-head">
      <h3 id="sosTitle">${won ? 'Boa. Vontade de quê?' : 'Tudo bem. Qual hábito?'}</h3>
      <button type="button" class="icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button>
    </div>
    <p class="muted">${won ? 'Marca qual foi pra contar no seu histórico. Vale +10 XP.' : 'O contador desse hábito recomeça. A árvore volta a ser semente, e tudo bem.'}</p>
    <div class="chip-row wrap">
      ${state.habits.map(h => `<button type="button" class="chip" data-sos-pick="${h.id}"><i data-lucide="${catOf(h).icon}"></i>${esc(h.name)}</button>`).join('')}
      ${won ? `<button type="button" class="chip" data-sos-pick="">Outra coisa</button>` : ''}
    </div>`;
}

/* =================== LOGIN =================== */
const AUTH_TEXT = {
  signin: { title: 'Entrar', sub: 'Bom te ver de novo. Seus dias continuam contando.', submit: 'Entrar' },
  signup: { title: 'Criar conta', sub: 'Leva 10 segundos. Depois você escolhe o que quer largar.', submit: 'Criar conta' },
  forgot: { title: 'Esqueci a senha', sub: 'Manda seu e-mail que enviamos um link para criar uma senha nova.', submit: 'Enviar link' },
  reset:  { title: 'Nova senha', sub: 'Escolha a senha nova da sua conta.', submit: 'Salvar senha' },
  check:  { title: 'Confira seu e-mail', sub: '', submit: 'Já confirmei, entrar' },
};

function authHTML(mode = 'signin', { email = '' } = {}) {
  const t = AUTH_TEXT[mode];
  const showEmail = mode !== 'reset' && mode !== 'check';
  const showPw = mode === 'signin' || mode === 'signup' || mode === 'reset';

  return `
    <div class="auth">
      <section class="auth-art" aria-hidden="${mode !== 'signin' && mode !== 'signup'}">
        <span class="brand">LIVRE<span>.</span></span>
        <div class="auth-tree">${treeSVG(5)}</div>
        <p class="auth-tag">Conte seus dias livres.<br>Bata seus recordes.</p>
        <ul class="auth-points">
          <li><i data-lucide="check"></i>Contador de dias limpos, recordes e metas</li>
          <li><i data-lucide="check"></i>Lembrete todo dia no seu celular</li>
          <li><i data-lucide="check"></i>Tudo salvo na sua conta</li>
        </ul>
      </section>

      <form id="authForm" class="auth-card" data-mode="${mode}" novalidate>
        ${mode === 'signin' || mode === 'signup' ? `
          <div class="seg" role="tablist" aria-label="Entrar ou criar conta">
            <button type="button" role="tab" data-auth-mode="signin" aria-selected="${mode === 'signin'}">Entrar</button>
            <button type="button" role="tab" data-auth-mode="signup" aria-selected="${mode === 'signup'}">Criar conta</button>
          </div>` : ''}

        <div>
          <h2>${t.title}</h2>
          <p class="muted" style="margin-top:6px">${mode === 'check'
            ? `Mandamos um link de confirmação para <b style="color:var(--fg)">${esc(email)}</b>. Abra o e-mail, toque no link e você entra direto.`
            : t.sub}</p>
        </div>

        ${showEmail ? `
          <label class="field"><span>E-mail</span>
            <input id="authEmail" class="input" type="email" autocomplete="email" inputmode="email" value="${esc(email)}" placeholder="voce@email.com" />
          </label>` : ''}

        ${showPw ? `
          <label class="field"><span>${mode === 'reset' ? 'Senha nova' : 'Senha'}${mode !== 'signin' ? ' <em>(mínimo 6 caracteres)</em>' : ''}</span>
            <span class="pw">
              <input id="authPw" class="input" type="password" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" placeholder="••••••" />
              <button type="button" class="icon-btn" data-toggle-pw aria-label="Mostrar senha"><i data-lucide="eye"></i></button>
            </span>
          </label>` : ''}

        <p id="authError" class="form-error" role="alert" hidden></p>
        <p id="authInfo" class="form-info" role="status" hidden></p>

        <button type="submit" class="btn gold block" id="authSubmit">${t.submit}</button>
        ${mode === 'signup' ? '<p class="muted" style="font-size:.76rem;text-align:center">Ao criar a conta você concorda com a <a href="privacidade.html" target="_blank" rel="noopener" style="text-decoration:underline">política de privacidade</a>. Para maiores de 18 anos.</p>' : ''}

        <div class="auth-links">
          ${mode === 'signin' ? '<button type="button" data-auth-mode="forgot">Esqueci minha senha</button>' : ''}
          ${mode === 'forgot' || mode === 'check' ? '<button type="button" data-auth-mode="signin"><i data-lucide="arrow-left"></i>Voltar para entrar</button>' : ''}
        </div>

        <button type="button" class="install auth-install" data-install><i data-lucide="download"></i>Instalar o LIVRE no celular</button>

        ${cloud.mode === 'local' ? `
          <div class="local-note">
            <p><b>Modo local.</b> As contas ficam só neste aparelho até você configurar o Firebase.</p>
            ${typeof window.LIVRE_DEMO === 'function' ? '<button type="button" class="btn ghost block sm" data-action="demo">Ver o app com dados de exemplo</button>' : ''}
          </div>` : ''}
      </form>
    </div>`;
}

/* =================== PRIMEIRO ACESSO =================== */
function onboardingHTML(sel = new Set(), when = 'now') {
  return `
    <div class="onb">
      <header class="onb-head">
        <span class="brand">LIVRE<span>.</span></span>
        <button type="button" class="btn ghost sm" data-action="sign-out"><i data-lucide="log-out"></i>Sair</button>
      </header>

      <div>
        <p class="label">Primeiro passo</p>
        <h1 class="onb-title">O que você quer largar?</h1>
        <p class="muted" style="margin-top:8px">Marque um ou mais. Nome, meta e data dá pra mudar depois.</p>
      </div>

      <div class="pick-grid" role="group" aria-label="Hábitos">
        ${Object.entries(CATEGORIES).map(([k, c]) => `
          <button type="button" class="pick" data-onb-cat="${k}" aria-pressed="${sel.has(k)}">
            <span class="pick-ico"><i data-lucide="${c.icon}"></i></span>
            <span class="pick-txt"><b>${c.label}</b><small>${c.hint}</small></span>
            <span class="pick-check"><i data-lucide="check"></i></span>
          </button>`).join('')}
      </div>

      <div class="field">
        <span>Desde quando você parou?</span>
        <div class="seg" role="radiogroup" aria-label="Desde quando">
          <button type="button" role="radio" data-onb-when="now" aria-checked="${when === 'now'}">Começo agora</button>
          <button type="button" role="radio" data-onb-when="date" aria-checked="${when === 'date'}">Já parei antes</button>
        </div>
        <input id="onbDate" type="datetime-local" class="input" ${when === 'date' ? '' : 'hidden'} max="${toLocalInput(Date.now())}" value="${toLocalInput(Date.now() - DAY)}" />
      </div>

      <p id="onbError" class="form-error" role="alert" hidden></p>
      <button type="button" class="btn gold block onb-go" data-action="onb-start" ${sel.size ? '' : 'disabled'}>
        ${sel.size ? `Começar com ${sel.size} ${sel.size === 1 ? 'hábito' : 'hábitos'}` : 'Escolha pelo menos um'}
      </button>
    </div>`;
}

/* =================== LEMBRETE (folha) =================== */
function notifyHTML(preview) {
  const st = cloud.pushStatus();
  const hour = notifyPref().hour;
  return `
    <div class="sheet-head">
      <h3 id="notifyTitle">Lembrete diário</h3>
      <button type="button" class="icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button>
    </div>
    <p class="muted">Todo dia, no horário que você escolher, chega assim no seu celular:</p>

    <div class="notif-mock" aria-label="Exemplo de notificação">
      <img src="icons/icon-192.png" alt="" width="38" height="38" />
      <div>
        <p class="nm-top"><b>LIVRE</b><span>agora</span></p>
        <p class="nm-title">${esc(preview.title)}</p>
        <p class="nm-body">${esc(preview.body)}</p>
      </div>
    </div>

    <label class="field"><span>Horário</span>
      <select id="notifyHour" class="input">
        ${Array.from({ length: 18 }, (_, i) => i + 6).map(h => `<option value="${h}" ${h === hour ? 'selected' : ''}>${pad(h)}:00</option>`).join('')}
      </select>
    </label>

    ${st.ok ? '' : `<p class="form-info">${esc(st.reason)}</p>`}
    <p id="notifyError" class="form-error" role="alert" hidden></p>

    <div class="sheet-actions">
      <button type="button" class="btn ghost" data-close>Agora não</button>
      <button type="button" class="btn gold" data-action="notify-enable" ${st.ok ? '' : 'disabled'}><i data-lucide="bell-ring"></i>Ativar lembrete</button>
    </div>`;
}

/* =================== DISPUTA =================== */
const initial = name => esc((name || '?').trim().charAt(0).toUpperCase());

function viewDisputa(groupId) {
  const d = social.data;
  if (!d.loaded && !d.loading) social.refresh();

  const head = `
    <section class="screen-head">
      <div>
        <h1>Disputa</h1>
        <p class="muted">Monte um grupo de até 10 pessoas e veja, ao vivo, quem segura mais tempo longe de cada vício.</p>
      </div>
    </section>`;

  // Primeiro precisa de um nome para os amigos te reconhecerem
  if (!(state.settings.name || '').trim()) {
    return `${head}
      <section class="panel duel-start">
        <div class="duel-start-ico"><i data-lucide="swords"></i></div>
        <h2>Como seus amigos te chamam?</h2>
        <p class="muted">Esse nome aparece no placar dos grupos. Dá para mudar depois em Conquistas.</p>
        <form id="duelNameForm" class="duel-name">
          <input id="duelName" class="input" maxlength="30" placeholder="Ex.: Murilo" autocomplete="nickname" />
          <button type="submit" class="btn gold">Entrar na disputa</button>
        </form>
      </section>`;
  }

  if (!d.loaded) return `${head}<section class="panel"><p class="muted">Carregando seus grupos...</p></section>`;
  if (groupId) return viewDuelGroup(groupId);

  const incoming = d.friends.filter(f => f.status === 'pending' && f.incoming);
  const outgoing = d.friends.filter(f => f.status === 'pending' && !f.incoming);
  const friends = d.friends.filter(f => f.status === 'accepted');
  const shared = new Set(social.sharedIds());

  return `${head}
    ${d.error ? `<p class="form-info">${esc(d.error)}</p>` : ''}

    <section class="id-card">
      <div>
        <p class="label">Seu ID na disputa</p>
        <p class="id-code num">${esc(d.me?.code || '...')}</p>
        <p class="muted" style="font-size:.84rem">${esc(d.me?.name || state.settings.name)} · passe esse ID ou o link para seus amigos</p>
      </div>
      <div class="id-actions">
        <button type="button" class="btn ghost sm" data-action="copy-text" data-text="${esc(d.me?.code || '')}"><i data-lucide="copy"></i>Copiar ID</button>
        <button type="button" class="btn gold sm" data-action="share-friend-link"><i data-lucide="link"></i>Link de amizade</button>
      </div>
    </section>

    ${inboxPanel()}

    ${incoming.length ? `
    <section class="panel">
      <div class="section-title"><h2>Pedidos de amizade</h2><span class="pill">${incoming.length}</span></div>
      <ul class="people">
        ${incoming.map(f => `
          <li>
            <span class="avatar">${initial(f.name)}</span>
            <span class="who"><b>${esc(f.name)}</b><small class="num">${esc(f.code)}</small></span>
            <span class="row-actions">
              <button type="button" class="btn gold sm" data-action="friend-accept" data-fid="${f.fid}">Aceitar</button>
              <button type="button" class="icon-btn" data-action="friend-remove" data-fid="${f.fid}" aria-label="Recusar"><i data-lucide="x"></i></button>
            </span>
          </li>`).join('')}
      </ul>
    </section>` : ''}

    <section>
      <div class="section-title">
        <h2>Seus grupos</h2>
        <span class="row-actions">
          <button type="button" class="btn ghost sm" data-action="group-join"><i data-lucide="log-in"></i>Entrar com código</button>
          <button type="button" class="btn gold sm" data-action="group-create"><i data-lucide="plus"></i>Criar grupo</button>
        </span>
      </div>
      ${d.groups.length ? `
        <div class="groups">
          ${d.groups.map(g => `
            <a class="group-card" href="#/disputa/${g.id}">
              <span class="group-ico"><i data-lucide="swords"></i></span>
              <span class="who"><b>${esc(g.name)}</b><small>${g.members} de ${social.MAX_GROUP} pessoas${g.owner ? ' · você criou' : ''}</small></span>
              <span class="seats" aria-hidden="true">${Array.from({ length: social.MAX_GROUP }, (_, i) => `<i class="${i < g.members ? 'on' : ''}"></i>`).join('')}</span>
            </a>`).join('')}
        </div>`
        : `<div class="panel empty-mini"><p class="muted">Nenhum grupo ainda. Crie um e mande o link para até 9 amigos, ou entre com o código que alguém te passou.</p></div>`}
    </section>

    <section class="panel">
      <div class="section-title">
        <h2>Amigos</h2>
        <button type="button" class="btn ghost sm" data-action="friend-add"><i data-lucide="user-plus"></i>Adicionar por ID</button>
      </div>
      ${friends.length || outgoing.length ? `
        <ul class="people">
          ${friends.map(f => `
            <li>
              <span class="avatar">${initial(f.name)}</span>
              <span class="who"><b>${esc(f.name)}</b><small class="num">${esc(f.code)}</small></span>
              <button type="button" class="icon-btn" data-action="friend-remove" data-fid="${f.fid}" data-name="${esc(f.name)}" aria-label="Desfazer amizade com ${esc(f.name)}"><i data-lucide="user-x"></i></button>
            </li>`).join('')}
          ${outgoing.map(f => `
            <li class="waiting">
              <span class="avatar">${initial(f.name)}</span>
              <span class="who"><b>${esc(f.name)}</b><small>esperando aceitar</small></span>
              <button type="button" class="icon-btn" data-action="friend-remove" data-fid="${f.fid}" aria-label="Cancelar pedido"><i data-lucide="x"></i></button>
            </li>`).join('')}
        </ul>`
        : `<p class="muted">Adicione pelo ID (ex.: LIV-7K3P9) ou mande seu link de amizade.</p>`}
    </section>

    ${sponsorPanel()}

    <section class="panel">
      <div class="section-title"><h2>O que você mostra</h2><span class="muted">só a categoria, nunca o nome nem anotações</span></div>
      ${state.habits.length ? `
        <div class="chip-row wrap">
          ${state.habits.map(h => `
            <button type="button" class="chip" data-action="toggle-share" data-id="${h.id}" aria-pressed="${shared.has(h.id)}">
              <i data-lucide="${catOf(h).icon}"></i>${catOf(h).label}
            </button>`).join('')}
        </div>
        <p class="muted" style="font-size:.8rem;margin-top:10px">Marcados aparecem no placar dos seus grupos. Pornografia começa escondida.</p>`
        : '<p class="muted">Você ainda não tem hábitos cadastrados.</p>'}
    </section>

    <a class="mini" href="#/pactos" style="max-width:420px">
      <i data-lucide="handshake"></i>
      <span><b>Pactos</b><small>Aposte com um amigo que vai te cobrar</small></span>
    </a>`;
}

/** Melhor sequência de cada pessoa numa categoria (ou geral) */
function duelRanking(board, cat) {
  const now = Date.now();
  return board.map(p => {
    const list = (p.habits || []).filter(h => cat === 'geral' || h.category === cat);
    const best = list.sort((a, b) => a.startAt - b.startAt)[0];
    return { ...p, best, cur: best ? now - best.startAt : -1 };
  }).sort((a, b) => b.cur - a.cur);
}

function viewDuelGroup(groupId) {
  const d = social.data;
  const g = d.groups.find(x => x.id === groupId);
  const back = '<a class="back" href="#/disputa"><i data-lucide="arrow-left"></i>Disputa</a>';
  if (!g) return `${back}${emptyBlock({ stage: 1, title: 'Grupo não encontrado', text: 'Você pode ter saído dele ou ele foi apagado.', action: 'go-duel', label: 'Ver meus grupos' })}`;

  const board = d.boards[groupId];
  if (!board) social.loadBoard(groupId);
  const cats = Array.isArray(board) ? [...new Set(board.flatMap(p => (p.habits || []).map(h => h.category)))] : [];
  if (ui.duelCat !== 'geral' && !cats.includes(ui.duelCat)) ui.duelCat = 'geral';
  const ranking = Array.isArray(board) ? duelRanking(board, ui.duelCat) : [];
  const inGroup = new Set(Array.isArray(board) ? board.map(p => p.id) : []);
  const addable = d.friends.filter(f => f.status === 'accepted' && !inGroup.has(f.id));
  const full = g.members >= social.MAX_GROUP;

  return `${back}
    <section class="duel-hero">
      <div>
        <p class="label">${g.members} de ${social.MAX_GROUP} pessoas</p>
        <h1>${esc(g.name)}</h1>
      </div>
      <div class="id-actions">
        <button type="button" class="btn gold sm" data-action="share-group-link" data-code="${esc(g.code)}" ${full ? 'disabled' : ''}><i data-lucide="link"></i>Convidar por link</button>
        <button type="button" class="btn ghost sm" data-action="copy-text" data-text="${esc(g.code)}"><i data-lucide="copy"></i>Código ${esc(g.code)}</button>
      </div>
    </section>

    <section>
      <div class="chip-row" role="tablist" aria-label="Placar por vício">
        <button type="button" class="chip" role="tab" data-duel-cat="geral" aria-pressed="${ui.duelCat === 'geral'}"><i data-lucide="crown"></i>Geral</button>
        ${cats.map(c => `<button type="button" class="chip" role="tab" data-duel-cat="${c}" aria-pressed="${ui.duelCat === c}"><i data-lucide="${(CATEGORIES[c] || CATEGORIES.outro).icon}"></i>${(CATEGORIES[c] || CATEGORIES.outro).label}</button>`).join('')}
      </div>
    </section>

    <section class="panel board">
      ${!board ? '<p class="muted">Carregando o placar...</p>'
        : board.error ? `<p class="form-info">${esc(board.error)}</p>`
        : `<ol class="rank">
            ${ranking.map((p, i) => {
              const c = p.best ? (CATEGORIES[p.best.category] || CATEGORIES.outro) : null;
              const leader = i === 0 && p.cur > 0;
              return `
              <li class="${p.me ? 'me' : ''} ${leader ? 'lead' : ''} ${p.best ? '' : 'out'}">
                <span class="pos num">${p.best ? (leader ? '<i data-lucide="crown"></i>' : i + 1) : '–'}</span>
                <span class="avatar">${initial(p.name)}</span>
                <span class="who">
                  <b>${esc(p.name)}${p.me ? ' <em>você</em>' : ''}</b>
                  <small>${p.best
                    ? `${ui.duelCat === 'geral' ? `${c.label} · ` : ''}recorde ${formatDuration(Math.max(p.best.record || 0, p.cur))}`
                    : ui.duelCat === 'geral' ? 'ainda não mostra nenhum hábito' : 'não está nesse'}</small>
                </span>
                <span class="clock" ${p.best ? `data-since="${p.best.startAt}"` : ''}></span>
                ${p.me ? '<span></span>' : `<button type="button" class="cheer-btn" data-action="cheer" data-user="${p.id}" data-group="${groupId}" data-name="${esc(p.name)}" aria-label="Mandar força para ${esc(p.name)}"><i data-lucide="flame"></i></button>`}
              </li>`;
            }).join('')}
          </ol>
          <p class="muted" style="font-size:.78rem;margin-top:12px">Conta o tempo desde a última recaída. O placar mostra só a categoria de cada hábito.</p>`}
    </section>

    ${challengesPanel(groupId, board)}
    ${feedPanel(groupId)}

    <section class="panel">
      <div class="section-title"><h2>Chamar amigos</h2><span class="muted">${full ? 'grupo cheio' : `${social.MAX_GROUP - g.members} ${social.MAX_GROUP - g.members === 1 ? 'vaga' : 'vagas'}`}</span></div>
      ${addable.length && !full ? `
        <div class="chip-row wrap">
          ${addable.map(f => `<button type="button" class="chip" data-action="group-add" data-group="${g.id}" data-user="${f.id}"><i data-lucide="user-plus"></i>${esc(f.name)}</button>`).join('')}
        </div>`
        : `<p class="muted">${full ? 'O grupo chegou em 10 pessoas.' : 'Todos os seus amigos já estão aqui. Mande o link para chamar mais gente.'}</p>`}
    </section>

    <section class="actions-row">
      ${g.owner
        ? `<button type="button" class="btn danger" data-action="group-delete" data-group="${g.id}"><i data-lucide="trash"></i>Apagar grupo</button>`
        : `<button type="button" class="btn danger" data-action="group-leave" data-group="${g.id}"><i data-lucide="door-open"></i>Sair do grupo</button>`}
    </section>`;
}
