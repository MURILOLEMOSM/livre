/* =========================================================
   LIVRE · telas dos recursos extras
   Economia, check-in, ponto fraco, planos, recado do futuro,
   mural e desafios da Disputa, padrinho, ajuda, privacidade
   e relatório.
   ========================================================= */

/** Áudio do recado fica só neste aparelho (é grande demais para sincronizar a cada mudança) */
const audioKey = () => `livre:audio:${currentUser?.id}`;
const futureAudio = () => (currentUser ? store.get(audioKey()) : null);

/* =================== ECONOMIA =================== */
function savingsPanel() {
  if (!state.habits.length) return '';
  const t = savingsTotals();
  const goal = state.savingsGoal;
  if (!t.tracked) {
    return `
      <section class="panel money empty-money">
        <span class="money-ico"><i data-lucide="piggy-bank"></i></span>
        <span class="who"><b>Quanto você já economizou?</b><small>Diga quanto gastava com cada hábito e o app conta o dinheiro e as horas que voltaram pra você.</small></span>
        <button type="button" class="btn gold sm" data-action="edit" data-id="${state.habits[0].id}">Informar gasto</button>
      </section>`;
  }
  const pct = goal ? clamp((t.money / goal.amount) * 100, 0, 100) : 0;
  return `
    <section class="panel money">
      <div class="money-top">
        <div>
          <p class="label">Você já economizou</p>
          <p class="money-val num" data-money>${fmtMoneyCents.format(t.money)}</p>
          ${t.hours > 0 ? `<p class="muted" style="font-size:.84rem"><span data-hours>${formatHours(t.hours)}</span> de volta pra sua vida</p>` : ''}
        </div>
        <span class="money-ico"><i data-lucide="piggy-bank"></i></span>
      </div>
      ${goal ? `
        <div class="goal-line">
          <div class="xp-top"><span>Meta: <b style="color:var(--fg);font-family:var(--body)">${esc(goal.name)}</b></span><b>${fmtMoney.format(goal.amount)}</b></div>
          <div class="bar"><i data-goalmoney style="width:${pct}%"></i></div>
          <p class="muted" style="font-size:.78rem;margin-top:6px">${pct >= 100 ? 'Meta batida. Pode comprar sem culpa.' : `Faltam ${fmtMoney.format(Math.max(0, goal.amount - t.money))}`}</p>
        </div>`
        : `<button type="button" class="btn ghost sm" data-action="goal-set" style="align-self:flex-start"><i data-lucide="gift"></i>Juntar para uma meta</button>`}
    </section>`;
}

function economyPanel(h) {
  const perDay = costPerDay(h);
  if (!perDay && !h.hoursPerDay) {
    return `
      <section class="panel">
        <div class="section-title"><h2>Economia</h2></div>
        <p class="muted">Quanto você gastava com isso? Com esse número o app mostra o dinheiro que deixou de sair do seu bolso.</p>
        <button type="button" class="btn ghost sm" data-action="edit" data-id="${h.id}" style="margin-top:12px"><i data-lucide="wallet"></i>Informar gasto</button>
      </section>`;
  }
  return `
    <section class="panel">
      <div class="section-title"><h2>Economia</h2><button type="button" class="icon-btn" data-action="edit" data-id="${h.id}" aria-label="Editar gasto"><i data-lucide="pencil"></i></button></div>
      <div class="xp-src" style="margin:0">
        ${perDay ? `<div><b class="gold">${fmtMoneyCents.format(savedMoney(h))}</b><small>economizados</small></div>` : ''}
        ${perDay ? `<div><b>${fmtMoneyCents.format(perDay * 30)}</b><small>por mês sem gastar</small></div>` : ''}
        ${h.hoursPerDay ? `<div><b>${formatHours(savedHours(h))}</b><small>de volta</small></div>` : ''}
      </div>
    </section>`;
}

/* =================== CHECK-IN DA NOITE =================== */
function checkinPanel() {
  if (!state.habits.length) return '';
  const c = todayCheckin();
  if (c && !ui.editCheckin) {
    return `
      <section class="panel checkin done">
        <span class="money-ico"><i data-lucide="notebook-pen"></i></span>
        <span class="who"><b>Check-in de hoje feito</b><small>${MOODS[c.mood - 1]} · vontade ${c.urge} de 10</small></span>
        <button type="button" class="btn ghost sm" data-action="checkin-edit">Mudar</button>
      </section>`;
  }
  const mood = c?.mood || 0, urge = c?.urge ?? 3;
  return `
    <section class="panel checkin">
      <div class="section-title"><h2>Como foi hoje?</h2><span class="muted">10 segundos</span></div>
      <form id="checkinForm" class="checkin-form">
        <div class="field"><span>Humor</span>
          <div class="mood-row" role="radiogroup" aria-label="Humor">
            ${MOODS.map((m, i) => `<button type="button" class="chip" role="radio" data-mood="${i + 1}" aria-checked="${mood === i + 1}">${m}</button>`).join('')}
          </div>
        </div>
        <label class="field"><span>Vontade hoje: <b class="gold num" id="urgeVal">${urge}</b> de 10</span>
          <input id="urgeRange" type="range" min="0" max="10" step="1" value="${urge}" class="range" />
        </label>
        <input id="checkinNote" class="input" maxlength="140" placeholder="Uma frase sobre o dia (opcional)" value="${esc(c?.note || '')}" />
        <button type="submit" class="btn gold">Salvar check-in</button>
      </form>
    </section>`;
}

/** Gráfico de barras da vontade nos últimos 30 dias */
function checkinChart() {
  const series = checkinSeries(30);
  const filled = series.filter(d => d.urge !== null);
  if (filled.length < 2) {
    return `<p class="muted">Faça o check-in da noite por alguns dias e aqui aparece se a vontade está caindo.</p>`;
  }
  const W = 300, Hh = 110, gap = 2, bw = (W - gap * 29) / 30;
  const firstHalf = filled.slice(0, Math.ceil(filled.length / 2));
  const lastHalf = filled.slice(Math.ceil(filled.length / 2));
  const avg = a => a.reduce((s, d) => s + d.urge, 0) / (a.length || 1);
  const trend = avg(lastHalf) - avg(firstHalf);
  const bars = series.map((d, i) => {
    const x = i * (bw + gap);
    if (d.urge === null) return `<rect x="${x}" y="${Hh - 3}" width="${bw}" height="3" rx="1.5" fill="#262626"/>`;
    const h = Math.max(4, (d.urge / 10) * (Hh - 6));
    return `<rect x="${x}" y="${Hh - h}" width="${bw}" height="${h}" rx="2" fill="${d.urge >= 7 ? '#FF6B6B' : '#F5C518'}" opacity="${d.urge >= 7 ? 1 : 0.55 + d.urge / 25}"><title>${fmtShort.format(new Date(d.date + 'T12:00'))}: vontade ${d.urge}/10</title></rect>`;
  }).join('');
  return `
    <p class="chart-lead">${trend <= -0.5 ? `A vontade caiu <b class="gold">${Math.abs(trend).toFixed(1)} pontos</b> na segunda metade do período.` : trend >= 0.5 ? `A vontade subiu <b style="color:var(--danger)">${trend.toFixed(1)} pontos</b>. Vale reforçar os planos.` : 'A vontade está estável.'} Média: <b class="num">${avg(filled).toFixed(1)}</b> de 10.</p>
    <svg class="urge-chart" viewBox="0 0 ${W} ${Hh + 16}" role="img" aria-label="Vontade nos últimos 30 dias">
      <line x1="0" y1="${Hh - (7 / 10) * (Hh - 6)}" x2="${W}" y2="${Hh - (7 / 10) * (Hh - 6)}" stroke="#3a3a3a" stroke-dasharray="3 3"/>
      ${bars}
      <text x="0" y="${Hh + 13}" fill="#757575" font-size="9" font-family="Inter, sans-serif">30 dias atrás</text>
      <text x="${W}" y="${Hh + 13}" fill="#757575" font-size="9" text-anchor="end" font-family="Inter, sans-serif">hoje</text>
    </svg>
    <p class="muted" style="font-size:.74rem">Barras vermelhas: dias com vontade 7 ou mais. Linha tracejada: nível 7.</p>`;
}

/* =================== PONTO FRACO =================== */
function weakPanel(habits = state.habits, compact = false) {
  const spot = weakSpot(habits);
  if (!spot) return '';
  const on = notifyPref().weak;
  return `
    <section class="panel weak">
      <span class="money-ico warn"><i data-lucide="shield-alert"></i></span>
      <span class="who">
        <b>Seu ponto fraco: ${spot.label}</b>
        <small>${spot.count} de ${spot.total} recaídas aconteceram nesse horário.${compact ? '' : ' Um aviso antes ajuda a se preparar.'}</small>
      </span>
      ${compact ? '' : on
        ? `<button type="button" class="btn ghost sm" data-action="weak-off"><i data-lucide="bell-ring"></i>Aviso ligado</button>`
        : `<button type="button" class="btn gold sm" data-action="weak-on"><i data-lucide="bell-ring"></i>Me avisar</button>`}
    </section>`;
}

/* =================== PLANOS SE/ENTÃO =================== */
function plansPanel(h) {
  const plans = h.plans || [];
  return `
    <section class="panel">
      <div class="section-title"><h2>Planos se/então</h2><span class="muted">aparecem no SOS</span></div>
      ${plans.length ? `<ul class="plans">
        ${plans.map((p, i) => `
          <li>
            <span><b>Se</b> ${esc(p.if)}, <b>então</b> ${esc(p.then)}.</span>
            <button type="button" class="icon-btn" data-action="plan-del" data-id="${h.id}" data-i="${i}" aria-label="Apagar plano"><i data-lucide="x"></i></button>
          </li>`).join('')}
      </ul>` : '<p class="muted" style="margin-bottom:12px">Decida agora o que fazer quando a vontade bater. Na hora fica muito mais fácil seguir.</p>'}
      ${plans.length < 5 ? `
        <form class="plan-form" data-plan-form="${h.id}">
          <label class="field"><span>Se...</span><input class="input" name="if" maxlength="80" placeholder="eu estiver numa festa e bater vontade" /></label>
          <label class="field"><span>Então...</span><input class="input" name="then" maxlength="80" placeholder="peço um refrigerante e ligo pro Lucas" /></label>
          <button type="submit" class="btn ghost sm"><i data-lucide="plus"></i>Adicionar plano</button>
        </form>` : ''}
    </section>`;
}

/* =================== RECADO DO FUTURO =================== */
function futureMsgPanel() {
  const m = state.futureMsg;
  return `
    <section class="panel">
      <div class="section-title"><h2>Recado pro seu eu do futuro</h2><span class="muted">toca no SOS</span></div>
      <p class="muted" style="margin-bottom:12px">Escreva ou grave um áudio num dia bom. Quando a vontade apertar, é você mesmo lembrando por que começou.</p>
      <textarea id="futureText" class="input" rows="3" maxlength="400" placeholder="Ei, você aí no meio da vontade: lembra do...">${esc(m?.text || '')}</textarea>
      <div class="actions-row" style="margin-top:10px">
        <button type="button" class="btn ghost sm" data-action="future-save"><i data-lucide="check"></i>Salvar texto</button>
        ${futureAudio()
          ? `<button type="button" class="btn ghost sm" data-action="future-play"><i data-lucide="play"></i>Ouvir áudio</button>
             <button type="button" class="btn danger sm" data-action="future-audio-del"><i data-lucide="trash"></i>Apagar áudio</button>`
          : `<button type="button" class="btn gold sm" data-action="future-rec" id="recBtn"><i data-lucide="mic"></i>Gravar áudio (até 30 s)</button>`}
      </div>
    </section>`;
}

/* =================== AJUDA PROFISSIONAL =================== */
const HELP = [
  { cats: ['*'], title: 'CVV, apoio emocional', what: 'Conversa gratuita e sigilosa, 24 horas, para qualquer momento difícil.', phone: '188', url: 'https://cvv.org.br' },
  { cats: ['cigarro'], title: 'Disque Saúde', what: 'Orientação para parar de fumar. O tratamento gratuito é feito no posto de saúde (UBS) do seu bairro.', phone: '136', url: 'https://linhasdecuidado.saude.gov.br/portal/tabagismo/sou-paciente/' },
  { cats: ['bebidas'], title: 'Alcoólicos Anônimos', what: 'Grupos presenciais e online em todo o Brasil.', url: 'https://www.aa.org.br' },
  { cats: ['bebidas', 'outro'], title: 'CAPS AD (SUS)', what: 'Atendimento gratuito para álcool e outras drogas. Pergunte no posto de saúde qual atende sua região.' },
  { cats: ['outro'], title: 'Narcóticos Anônimos', what: 'Grupos de apoio para dependência de drogas.', url: 'https://www.na.org.br' },
  { cats: ['apostas', 'jogos'], title: 'Jogadores Anônimos', what: 'Grupos para quem quer parar de apostar. Família pode procurar o Jog-Anon.', url: 'https://www.jogadoresanonimos.com.br' },
  { cats: ['pornografia'], title: 'D.A.S.A.', what: 'Dependentes de Amor e Sexo Anônimos: grupos em várias cidades e online.', url: 'https://dasariodejaneiro.com.br' },
  { cats: ['gula', 'redes', 'jogos', 'pornografia', 'apostas'], title: 'Psicólogo pelo SUS', what: 'O posto de saúde encaminha para atendimento psicológico gratuito.' },
];

function helpHTML() {
  const mine = new Set(state.habits.map(h => h.category));
  const list = HELP.filter(x => x.cats.includes('*') || x.cats.some(c => mine.has(c)));
  const rest = HELP.filter(x => !list.includes(x));
  const item = x => `
    <li class="help-item">
      <b>${x.title}</b>
      <small>${x.what}</small>
      <span class="row-actions">
        ${x.phone ? `<a class="btn gold sm" href="tel:${x.phone}"><i data-lucide="phone"></i>Ligar ${x.phone}</a>` : ''}
        ${x.url ? `<a class="btn ghost sm" href="${x.url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Site</a>` : ''}
      </span>
    </li>`;
  return `
    <div class="sheet-head">
      <h3 id="helpTitle">Ajuda profissional</h3>
      <button type="button" class="icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button>
    </div>
    <p class="muted">O LIVRE ajuda no dia a dia, mas não substitui quem é do ramo. Pedir ajuda é parte do processo.</p>
    <ul class="help">${list.map(item).join('')}</ul>
    ${rest.length ? `<details class="help-more"><summary>Outros contatos</summary><ul class="help">${rest.map(item).join('')}</ul></details>` : ''}
    <p class="muted" style="font-size:.76rem">Em emergência médica, ligue 192 (SAMU).</p>`;
}

/* =================== DISPUTA: MURAL, DESAFIOS, PADRINHO =================== */
const timeAgo = t => {
  const m = Math.floor((Date.now() - t) / MIN);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  if (m < 60 * 24) return `há ${Math.floor(m / 60)}h`;
  return `há ${Math.floor(m / 1440)}d`;
};
const catLabel = c => (CATEGORIES[c] || CATEGORIES.outro).label.toLowerCase();

function feedPanel(groupId) {
  const feed = social.data.feeds[groupId];
  if (!feed) return '';
  const myId = currentUser?.id;
  const line = e => {
    if (e.kind === 'sos') return `<b>${esc(e.actorName)}</b> pediu força${e.payload.category ? ` (${catLabel(e.payload.category)})` : ''}`;
    if (e.kind === 'milestone') return `<b>${esc(e.actorName)}</b> completou <b class="gold">${e.payload.days} dias</b> sem ${catLabel(e.payload.category)}`;
    if (e.kind === 'cheer') return `<b>${esc(e.actorName)}</b> mandou força para <b>${esc(e.targetName || 'alguém')}</b>`;
    return '';
  };
  const icon = { sos: 'life-buoy', milestone: 'medal', cheer: 'flame' };
  return `
    <section class="panel">
      <div class="section-title"><h2>Mural</h2><span class="muted">últimos acontecimentos</span></div>
      ${feed.length ? `<ul class="feed">
        ${feed.slice(0, 15).map(e => `
          <li class="${e.kind}">
            <span class="feed-ico"><i data-lucide="${icon[e.kind] || 'circle-dot'}"></i></span>
            <span class="who"><span class="feed-text">${line(e)}</span><small>${timeAgo(e.at)}</small></span>
            ${e.actor !== myId && (e.kind === 'sos' || e.kind === 'milestone')
              ? `<button type="button" class="btn ${e.kind === 'sos' ? 'gold' : 'ghost'} sm" data-action="cheer" data-user="${e.actor}" data-group="${groupId}" data-name="${esc(e.actorName)}"><i data-lucide="flame"></i>${e.kind === 'sos' ? 'Mandar força' : 'Parabéns'}</button>`
              : ''}
          </li>`).join('')}
      </ul>` : '<p class="muted">Ainda nada por aqui. Quando alguém pedir força ou passar de um marco, aparece no mural.</p>'}
    </section>`;
}

function challengesPanel(groupId, board) {
  const list = social.data.challenges[groupId];
  if (!list) return '';
  const members = Array.isArray(board) ? board : [];
  const badge = { firme: '<span class="pill">firme</span>', venceu: '<span class="pill"><i data-lucide="check"></i>venceu</span>', caiu: '<span class="pill red">caiu</span>', fora: '<span class="pill grey">fora</span>' };
  return `
    <section class="panel">
      <div class="section-title">
        <h2>Desafios</h2>
        <button type="button" class="btn ghost sm" data-action="challenge-new" data-group="${groupId}"><i data-lucide="flag"></i>Novo desafio</button>
      </div>
      ${list.length ? list.map(ch => {
        const ended = Date.now() >= ch.endsAt;
        const pct = clamp(((Date.now() - ch.startsAt) / (ch.endsAt - ch.startsAt)) * 100, 0, 100);
        const st = members.map(m => ({ m, s: challengeStatus(ch, m) })).filter(x => x.s !== 'fora');
        const alive = st.filter(x => x.s === 'firme' || x.s === 'venceu').length;
        return `
          <article class="challenge">
            <div class="ch-head">
              <span class="who"><b>${esc(ch.title)}</b><small>${(CATEGORIES[ch.category] || CATEGORIES.outro).label} · ${ended ? 'terminou' : `termina ${fmtShort.format(ch.endsAt)}`} · ${alive} de ${st.length} firmes</small></span>
              ${ch.createdBy === currentUser?.id ? `<button type="button" class="icon-btn" data-action="challenge-del" data-id="${ch.id}" aria-label="Apagar desafio"><i data-lucide="trash"></i></button>` : ''}
            </div>
            <div class="bar thin"><i style="width:${pct}%"></i></div>
            <div class="ch-people">${st.map(x => `<span class="ch-p ${x.s}"><span class="avatar sm">${initial(x.m.name)}</span>${esc(x.m.name.split(' ')[0])} ${badge[x.s]}</span>`).join('') || '<small class="muted">Ninguém do grupo mostra esse hábito ainda.</small>'}</div>
          </article>`;
      }).join('') : '<p class="muted">Crie um desafio com prazo, tipo "30 dias sem bebida". Quem chegar ao fim sem cair ganha a medalha.</p>'}
    </section>`;
}

function inboxPanel() {
  const inbox = social.data.inbox;
  if (!inbox.length) return '';
  return `
    <section class="panel">
      <div class="section-title"><h2>Recebidos</h2><span class="muted">últimos 7 dias</span></div>
      <ul class="feed">
        ${inbox.slice(0, 8).map(e => `
          <li class="${e.kind}">
            <span class="feed-ico"><i data-lucide="${e.kind === 'relapse' ? 'hand-heart' : 'flame'}"></i></span>
            <span class="who">
              <span class="feed-text">${e.kind === 'relapse'
                ? `<b>${esc(e.actorName)}</b> teve uma recaída${e.payload.category ? ` (${catLabel(e.payload.category)})` : ''}. Você é o padrinho.`
                : `<b>${esc(e.actorName)}</b> te mandou força`}</span>
              <small>${timeAgo(e.at)}</small>
            </span>
            ${e.kind === 'relapse' ? `<button type="button" class="btn gold sm" data-action="cheer" data-user="${e.actor}" data-name="${esc(e.actorName)}"><i data-lucide="flame"></i>Mandar força</button>` : ''}
          </li>`).join('')}
      </ul>
    </section>`;
}

function sponsorPanel() {
  const d = social.data;
  const friends = d.friends.filter(f => f.status === 'accepted');
  return `
    <section class="panel">
      <div class="section-title"><h2>Padrinho</h2><span class="muted">opcional</span></div>
      <p class="muted" style="margin-bottom:12px">Um amigo de confiança que recebe um aviso quando você registra uma recaída. Só ele, mais ninguém.</p>
      ${d.sponsor ? `
        <div class="people"><li style="list-style:none">
          <span class="avatar">${initial(d.sponsor.name)}</span>
          <span class="who"><b>${esc(d.sponsor.name)}</b><small>é seu padrinho</small></span>
          <button type="button" class="btn ghost sm" data-action="sponsor-set" data-user="">Tirar</button>
        </li></div>`
        : friends.length
          ? `<div class="chip-row wrap">${friends.map(f => `<button type="button" class="chip" data-action="sponsor-set" data-user="${f.id}" data-name="${esc(f.name)}"><i data-lucide="hand-heart"></i>${esc(f.name)}</button>`).join('')}</div>`
          : '<p class="muted">Adicione um amigo primeiro.</p>'}
      ${d.sponsoring.length ? `<p class="muted" style="font-size:.8rem;margin-top:12px">Você é padrinho de: <b style="color:var(--fg)">${d.sponsoring.map(p => esc(p.name)).join(', ')}</b></p>` : ''}
    </section>`;
}

/* =================== PRIVACIDADE =================== */
function privacyPanel() {
  const hasPin = !!lock.hasPin();
  return `
    <section class="panel">
      <div class="section-title"><h2>Privacidade</h2></div>
      <div class="switch-row">
        <span><b>Modo discreto</b><small>Notificações sem dizer do que se trata e nome "Diário" na aba. Para o ícone instalado mudar também, ative antes de instalar.</small></span>
        <button type="button" class="switch" role="switch" data-action="toggle-discreet" aria-checked="${!!state.settings.discreet}" aria-label="Modo discreto"></button>
      </div>
      <div class="switch-row">
        <span><b>PIN para abrir</b><small>${hasPin ? 'O app pede o PIN ao abrir e ao voltar depois de 1 minuto.' : 'Ninguém que pegar seu celular abre o app.'}</small></span>
        ${hasPin
          ? `<button type="button" class="btn ghost sm" data-action="pin-remove">Tirar PIN</button>`
          : `<button type="button" class="btn gold sm" data-action="pin-set"><i data-lucide="lock"></i>Criar PIN</button>`}
      </div>
    </section>`;
}

/* =================== RELATÓRIO =================== */
function viewRelatorio() {
  const t = savingsTotals();
  const trig = triggerStats().slice(0, 6);
  const checks = state.checkins.slice(-30);
  const avgUrge = checks.length ? (checks.reduce((s, c) => s + c.urge, 0) / checks.length).toFixed(1) : null;
  const spot = weakSpot();
  return `
    <div class="report-actions">
      <a class="back" href="#/conquistas"><i data-lucide="arrow-left"></i>Conquistas</a>
      <button type="button" class="btn gold" data-action="print"><i data-lucide="file-text"></i>Salvar PDF</button>
    </div>
    <article class="report">
      <header>
        <p class="brand">LIVRE<span>.</span></p>
        <h1>Relatório de acompanhamento</h1>
        <p>${esc(state.settings.name || currentUser?.email || '')} · gerado em ${fmtDateTime.format(Date.now())}</p>
      </header>

      <h2>Resumo</h2>
      <table>
        <tr><th>Hábitos acompanhados</th><td>${state.habits.length}</td></tr>
        <tr><th>Vontades vencidas com o SOS</th><td>${state.urges.length}</td></tr>
        ${t.tracked ? `<tr><th>Economia estimada</th><td>${fmtMoneyCents.format(t.money)}${t.hours ? ` e ${formatHours(t.hours)}` : ''}</td></tr>` : ''}
        ${avgUrge ? `<tr><th>Vontade média (check-ins, 0 a 10)</th><td>${avgUrge} em ${checks.length} dias</td></tr>` : ''}
        ${spot ? `<tr><th>Horário de maior risco</th><td>${spot.label} (${spot.count} de ${spot.total} recaídas)</td></tr>` : ''}
      </table>

      ${state.habits.map(h => {
        const avg = h.attempts.length ? h.attempts.reduce((s, a) => s + a.duration, 0) / h.attempts.length : null;
        const ht = triggerStats([h]);
        return `
        <section class="report-habit">
          <h2>${esc(h.name)} <small>${catOf(h).label}</small></h2>
          <table>
            <tr><th>Sem recair desde</th><td>${fmtDateTime.format(h.startAt)} (${formatDuration(currentMs(h))})</td></tr>
            <tr><th>Maior período limpo</th><td>${formatDuration(bestMs(h))}</td></tr>
            <tr><th>Recaídas registradas</th><td>${h.attempts.length}${avg ? ` · média de ${formatDuration(avg)} entre elas` : ''}</td></tr>
            ${ht.length ? `<tr><th>Gatilhos mais citados</th><td>${ht.slice(0, 4).map(([g, n]) => `${esc(g)} (${n})`).join(', ')}</td></tr>` : ''}
            ${(h.plans || []).length ? `<tr><th>Planos se/então</th><td>${h.plans.map(p => `Se ${esc(p.if)}, então ${esc(p.then)}.`).join('<br>')}</td></tr>` : ''}
          </table>
          ${h.attempts.length ? `
            <table class="list">
              <tr><th>Período</th><th>Duração</th><th>Gatilhos</th></tr>
              ${h.attempts.slice(-10).reverse().map(a => `<tr><td>${fmtShort.format(a.start)} a ${fmtShort.format(a.end)}</td><td>${formatDuration(a.duration)}</td><td>${(a.triggers || []).map(esc).join(', ') || '-'}</td></tr>`).join('')}
            </table>` : ''}
        </section>`;
      }).join('')}

      ${trig.length ? `<h2>Gatilhos no geral</h2><p>${trig.map(([g, n]) => `${esc(g)}: ${n}`).join(' · ')}</p>` : ''}
      <p class="report-foot">Dados registrados pela própria pessoa no app LIVRE. Não é um documento médico.</p>
    </article>`;
}
