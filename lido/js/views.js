/* =========================================================
   LIDO · telas
   Cada função devolve o HTML de uma rota.
   ========================================================= */

function bookCover(b, size = '') {
  const initials = b.title.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return `<span class="cover ${size}" style="--c:${b.color}"><b>${esc(initials)}</b></span>`;
}

function progressBar(pct) {
  return `<span class="bar"><i style="width:${Math.round(pct * 100)}%"></i></span>`;
}

function emptyBox(icon, title, text, action = '') {
  return `<div class="empty"><i data-lucide="${icon}"></i><h3>${title}</h3><p class="muted">${text}</p>${action}</div>`;
}

/* ---------- Hoje ---------- */
function viewHoje() {
  const goal = state.settings.dailyGoal * MIN;
  const today = msOnDay();
  const pct = clamp(today / goal, 0, 1);
  const book = currentBook();
  const due = dueNotes().length;
  const lv = levelInfo();
  const name = state.settings.name ? `, ${esc(state.settings.name)}` : '';
  const r = 52, c = 2 * Math.PI * r;

  return `
    <header class="hello">
      <p class="label">${fmtToday.format(new Date())}</p>
      <h1>Bom te ver${name}.</h1>
    </header>

    <section class="card goal">
      <svg viewBox="0 0 120 120" class="ring" aria-hidden="true">
        <circle cx="60" cy="60" r="${r}" class="ring-bg"/>
        <circle cx="60" cy="60" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/>
      </svg>
      <div class="goal-text">
        <p class="label">Meta de hoje</p>
        <p class="big num">${Math.floor(today / MIN)}<small>/${state.settings.dailyGoal} min</small></p>
        <p class="muted">${pct >= 1 ? 'Meta batida. O resto é bônus.' : `Faltam ${Math.ceil((goal - today) / MIN)} min.`}</p>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><i data-lucide="flame"></i><b class="num">${streak()}</b><span>dias seguidos</span></div>
      <div class="stat"><i data-lucide="hourglass"></i><b class="num">${formatMinutes(totalMs())}</b><span>lidos no total</span></div>
      <div class="stat"><i data-lucide="file-text"></i><b class="num">${totalPages()}</b><span>páginas</span></div>
    </section>

    ${book ? `
      <section class="card now">
        <p class="label">Continuar lendo</p>
        <a class="now-book" href="#/livro/${book.id}">
          ${bookCover(book, 'lg')}
          <div>
            <h2>${esc(book.title)}</h2>
            <p class="muted">${esc(book.author || 'Autor não informado')}</p>
            ${book.pages ? `${progressBar(bookProgress(book))}<p class="muted small">Página ${book.current} de ${book.pages}${timeToFinish(book) ? ` · faltam uns ${formatMinutes(timeToFinish(book))}` : ''}</p>` : ''}
          </div>
        </a>
        <button class="btn primary wide" data-act="start" data-id="${book.id}"><i data-lucide="flame"></i>Acender a vela</button>
      </section>` : `
      <section class="card">
        ${emptyBox('book-plus', 'Nenhum livro em andamento', 'Coloque na estante o que você está lendo e comece uma sessão.',
          '<button class="btn primary" data-act="add-book"><i data-lucide="plus"></i>Adicionar livro</button>')}
      </section>`}

    ${due ? `
      <a class="card review-cta" href="#/revisar">
        <i data-lucide="brain"></i>
        <div><h3>${due} ${due === 1 ? 'nota para revisar' : 'notas para revisar'}</h3><p class="muted">Dois minutos agora fazem você lembrar daqui a meses.</p></div>
        <i data-lucide="chevron-right"></i>
      </a>` : ''}

    <section class="card">
      <div class="row-between"><p class="label">Últimas 12 semanas</p><span class="muted small">Nível ${lv.level} · ${lv.title}</span></div>
      ${heatmap()}
    </section>`;
}

function heatmap() {
  const days = msByDay();
  const goal = state.settings.dailyGoal * MIN;
  const end = startOfDay(Date.now());
  const first = end - (7 * 12 - 1) * DAY - new Date(end).getDay() * DAY;
  const cells = [];
  for (let t = first; t <= end; t += DAY) {
    const ms = days[localDate(t)] || 0;
    const lvl = ms === 0 ? 0 : ms < goal / 2 ? 1 : ms < goal ? 2 : 3;
    cells.push(`<i class="l${lvl}" title="${fmtShort.format(t)}: ${formatMinutes(ms)}"></i>`);
  }
  return `<div class="heat">${cells.join('')}</div>`;
}

/* ---------- Estante ---------- */
function viewEstante() {
  const groups = Object.entries(STATUS).map(([key, st]) => {
    const list = state.books.filter(b => b.status === key);
    if (!list.length) return '';
    return `
      <section>
        <p class="label section-label"><i data-lucide="${st.icon}"></i>${st.label} · ${list.length}</p>
        <div class="shelf">
          ${list.map(b => `
            <a class="book-tile" href="#/livro/${b.id}">
              ${bookCover(b)}
              <div>
                <h3>${esc(b.title)}</h3>
                <p class="muted small">${esc(b.author || '—')}</p>
                ${key === 'lendo' && b.pages ? progressBar(bookProgress(b)) : ''}
              </div>
            </a>`).join('')}
        </div>
      </section>`;
  }).join('');

  return `
    <header class="page-head">
      <h1>Estante</h1>
      <button class="btn primary" data-act="add-book"><i data-lucide="plus"></i>Livro</button>
    </header>
    ${state.books.length ? groups : `<section class="card">${emptyBox('library', 'Estante vazia', 'Adicione o livro que está lendo agora e os que quer ler depois.')}</section>`}`;
}

/* ---------- Livro ---------- */
function viewLivro(id) {
  const b = bookById(id);
  if (!b) return `<section class="card">${emptyBox('search-x', 'Livro não encontrado', 'Ele pode ter sido apagado.', '<a class="btn" href="#/estante">Voltar à estante</a>')}</section>`;

  const sessions = sessionsOf(id).sort((a, b) => b.start - a.start);
  const notes = notesOf(id);
  const ms = sessions.reduce((t, s) => t + s.ms, 0);
  const left = timeToFinish(b);

  return `
    <a class="back" href="#/estante"><i data-lucide="arrow-left"></i>Estante</a>

    <section class="card book-head">
      ${bookCover(b, 'xl')}
      <div class="grow">
        <span class="pill">${STATUS[b.status].label}</span>
        <h1>${esc(b.title)}</h1>
        <p class="muted">${esc(b.author || 'Autor não informado')}</p>
        ${b.pages ? `${progressBar(bookProgress(b))}<p class="muted small">Página ${b.current} de ${b.pages} · ${Math.round(bookProgress(b) * 100)}%</p>` : ''}
      </div>
    </section>

    <section class="stats">
      <div class="stat"><b class="num">${formatMinutes(ms)}</b><span>de leitura</span></div>
      <div class="stat"><b class="num">${sessions.length}</b><span>sessões</span></div>
      <div class="stat"><b class="num">${left ? formatMinutes(left) : '—'}</b><span>para terminar</span></div>
    </section>

    <div class="actions">
      ${b.status !== 'lido' ? `<button class="btn primary" data-act="start" data-id="${b.id}"><i data-lucide="flame"></i>Ler agora</button>` : ''}
      <button class="btn" data-act="add-note" data-id="${b.id}"><i data-lucide="notebook-pen"></i>Nota</button>
      ${b.status !== 'lido' ? `<button class="btn" data-act="finish" data-id="${b.id}"><i data-lucide="book-check"></i>Terminei</button>` : ''}
      <button class="btn" data-act="edit-book" data-id="${b.id}"><i data-lucide="pencil"></i>Editar</button>
    </div>

    <section class="card">
      <p class="label">Notas · ${notes.length}</p>
      ${notes.length ? `<ul class="notes">${notes.map(n => `
        <li>
          ${n.cue ? `<p class="cue">${esc(n.cue)}</p>` : ''}
          <p>${esc(n.text)}</p>
          <p class="muted small">${n.page ? `p. ${n.page} · ` : ''}${fmtShort.format(n.at)} · próxima revisão ${fmtShort.format(n.due)}
            <button class="link danger" data-act="del-note" data-id="${n.id}">apagar</button></p>
        </li>`).join('')}</ul>`
        : '<p class="muted">Anote o que valeu a pena. Cada nota vira um cartão de revisão.</p>'}
    </section>

    <section class="card">
      <p class="label">Sessões</p>
      ${sessions.length ? `<ul class="sessions">${sessions.slice(0, 30).map(s => `
        <li>
          <i data-lucide="${s.lit ? 'flame' : 'flame-kindling'}" class="${s.lit ? 'lit' : 'out'}"></i>
          <span>${fmtDateTime.format(s.start)}</span>
          <span class="num">${formatMinutes(s.ms)}</span>
          <span class="muted num">${s.toPage > s.fromPage ? `+${s.toPage - s.fromPage} p.` : ''}</span>
        </li>`).join('')}</ul>` : '<p class="muted">Nenhuma sessão ainda.</p>'}
    </section>`;
}

/* ---------- Sessão de leitura ---------- */
function viewLer() {
  const a = state.active;
  if (!a) {
    const lendo = readingNow();
    return `
      <header class="page-head"><h1>Ler</h1></header>
      ${lendo.length ? `
        <section class="card">
          <p class="label">Qual livro?</p>
          <div class="pick">${lendo.map(b => `
            <button class="book-tile" data-act="start" data-id="${b.id}">${bookCover(b)}<div><h3>${esc(b.title)}</h3><p class="muted small">${b.pages ? `p. ${b.current}/${b.pages}` : esc(b.author)}</p></div></button>`).join('')}
          </div>
        </section>` : `<section class="card">${emptyBox('book-plus', 'Nada para ler ainda', 'Adicione um livro na estante primeiro.', '<button class="btn primary" data-act="add-book"><i data-lucide="plus"></i>Adicionar livro</button>')}</section>`}`;
  }

  const b = bookById(a.bookId);
  return `
    <section class="session ${a.lit ? '' : 'is-out'}">
      <p class="label">${esc(b?.title || 'Leitura')}</p>
      <div class="candle" aria-hidden="true">
        <div class="flame"><span></span></div>
        <div class="wax"><i id="wax"></i></div>
        <div class="plate"></div>
      </div>
      <p class="timer num" id="timer">00:00</p>
      <p class="muted" id="sessionHint">${a.lit
        ? (a.target ? `Meta: ${a.target} min. Saia do app e a vela apaga em ${CANDLE_GRACE / 1000} s.` : `Sem meta. Saia do app e a vela apaga em ${CANDLE_GRACE / 1000} s.`)
        : 'A vela apagou porque você saiu do app. O tempo continua contando.'}</p>
      <div class="actions center">
        <button class="btn" data-act="quick-note"><i data-lucide="notebook-pen"></i>Nota</button>
        <button class="btn primary" data-act="stop"><i data-lucide="square"></i>Encerrar</button>
      </div>
      <button class="link muted" data-act="cancel">Descartar sessão</button>
    </section>`;
}

/* ---------- Revisar ---------- */
function viewRevisar() {
  const due = dueNotes();
  const done = state.reviews.filter(r => r.at >= startOfDay(Date.now())).length;
  if (!due.length) {
    const next = state.notes.length ? Math.min(...state.notes.map(n => n.due)) : null;
    return `
      <header class="page-head"><h1>Revisar</h1></header>
      <section class="card">${emptyBox('sparkles', done ? 'Tudo revisado por hoje' : 'Nada para revisar',
        next ? `A próxima nota volta em ${fmtShort.format(next)}.` : 'Escreva notas durante a leitura. Elas voltam aqui em 1, 3, 7, 16 dias... até ficarem na memória.')}</section>`;
  }
  const n = due[0];
  const b = bookById(n.bookId);
  const front = n.cue || `Do que trata a sua nota${n.page ? ` da página ${n.page}` : ''}?`;
  return `
    <header class="page-head"><h1>Revisar</h1><span class="muted num">${due.length} na fila · ${done} hoje</span></header>
    <section class="card flash" id="flash">
      <p class="label">${b ? esc(b.title) : 'Livro apagado'}</p>
      <h2>${esc(front)}</h2>
      <div class="answer" hidden><p>${esc(n.text)}</p></div>
      <button class="btn primary wide" data-act="reveal">Mostrar nota</button>
      <div class="actions grade" hidden>
        <button class="btn" data-act="grade" data-ok="0" data-id="${n.id}"><i data-lucide="rotate-ccw"></i>Tinha esquecido</button>
        <button class="btn primary" data-act="grade" data-ok="1" data-id="${n.id}"><i data-lucide="check"></i>Lembrava</button>
      </div>
    </section>
    <p class="muted small center">Caixa ${n.box + 1} de ${REVIEW_STEPS.length}. Lembrou, ela volta em ${REVIEW_STEPS[Math.min(n.box + 1, REVIEW_STEPS.length - 1)]} dias.</p>`;
}

/* ---------- Perfil ---------- */
function viewPerfil() {
  const lv = levelInfo();
  const xp = xpBreakdown();
  const got = new Set(earnedMedals().map(m => m.id));
  const finished = state.books.filter(b => b.status === 'lido').length;

  return `
    <header class="page-head"><h1>Perfil</h1></header>

    <section class="card level">
      <span class="lvl-badge num">${lv.level}</span>
      <div class="grow">
        <h2>${lv.title}</h2>
        ${progressBar(lv.pct)}
        <p class="muted small num">${lv.xp} XP · faltam ${lv.next - lv.xp} para o nível ${lv.level + 1}</p>
      </div>
    </section>

    <section class="card">
      <p class="label">De onde vem o XP</p>
      <ul class="xp">
        <li><span>Minutos lidos</span><b class="num">${xp.minutes}</b></li>
        <li><span>Sessões com a vela acesa</span><b class="num">${xp.lit}</b></li>
        <li><span>Notas</span><b class="num">${xp.notes}</b></li>
        <li><span>Revisões</span><b class="num">${xp.reviews}</b></li>
        <li><span>Livros terminados (${finished})</span><b class="num">${xp.finished}</b></li>
      </ul>
    </section>

    <section class="card">
      <div class="row-between"><p class="label">Medalhas</p><span class="muted small num">${got.size}/${MEDALS.length}</span></div>
      <div class="medals">${MEDALS.map(m => `
        <div class="medal ${got.has(m.id) ? 'on' : ''}" title="${esc(m.desc)}">
          <i data-lucide="${m.icon}"></i><b>${m.title}</b><span>${m.desc}</span>
        </div>`).join('')}
      </div>
    </section>

    <section class="card">
      <p class="label">Conta</p>
      ${cloud.user
        ? `<p>${esc(cloud.user.email)}</p><p class="muted small">Sincronizado na nuvem. Entre com este e-mail em outro aparelho para continuar de onde parou.</p>
           <div class="actions"><button class="btn" data-act="logout"><i data-lucide="log-out"></i>Sair</button></div>`
        : `<p class="muted">Seus dados estão só neste aparelho.</p>
           ${cloud.mode === 'firebase' ? '<div class="actions"><button class="btn primary" data-act="login"><i data-lucide="log-in"></i>Entrar ou criar conta</button></div>' : ''}`}
    </section>

    <section class="card settings">
      <p class="label">Ajustes</p>
      <label>Seu nome<input id="setName" maxlength="30" value="${esc(state.settings.name)}" placeholder="Como quer ser chamado"></label>
      <label>Meta diária
        <select id="setGoal">${[10, 15, 20, 30, 45, 60].map(m => `<option value="${m}" ${m === state.settings.dailyGoal ? 'selected' : ''}>${m} minutos</option>`).join('')}</select>
      </label>
      <div class="actions">
        <button class="btn" data-act="share"><i data-lucide="share-2"></i>Compartilhar progresso</button>
        <button class="btn" data-act="export"><i data-lucide="download"></i>Exportar</button>
        <label class="btn"><i data-lucide="upload"></i>Importar<input type="file" accept="application/json" id="importFile" hidden></label>
        <button class="btn" data-install><i data-lucide="smartphone"></i>Instalar</button>
      </div>
      <button class="link danger" data-act="wipe">Apagar todos os dados</button>
    </section>`;
}

/* ---------- Entrar ---------- */
function viewLogin() {
  return `
    <section class="onboard">
      <span class="brand big">LIDO<span>.</span></span>
      <h1>Leia todo dia. Lembre do que leu.</h1>
      <p class="muted">Entre para guardar sua estante na nuvem e usar em qualquer aparelho. Já tem conta no LIVRE? É a mesma.</p>
      <form id="authForm" class="card form">
        <label>E-mail<input name="email" type="email" autocomplete="email" required></label>
        <label>Senha<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
        <p class="auth-error" id="authError" role="alert" hidden></p>
        <button class="btn primary wide" type="submit" name="act" value="in">Entrar</button>
        <button class="btn wide" type="submit" name="act" value="up">Criar conta</button>
        <button class="link" type="button" data-act="reset">Esqueci a senha</button>
      </form>
      <button class="link muted center" data-act="guest">Usar sem conta (fica só neste aparelho)</button>
    </section>`;
}

/* ---------- Primeiro acesso ---------- */
function viewOnboarding() {
  return `
    <section class="onboard">
      <span class="brand big">LIDO<span>.</span></span>
      <h1>Leia todo dia. Lembre do que leu.</h1>
      <p class="muted">Acenda a vela, leia sem sair do app e anote o que importa. As notas voltam para revisão até ficarem na memória.</p>
      <form id="onboardForm" class="card form">
        <label>Seu nome<input name="name" maxlength="30" placeholder="Opcional"></label>
        <label>O que você está lendo?<input name="title" maxlength="80" placeholder="Título do livro"></label>
        <div class="two">
          <label>Autor<input name="author" maxlength="60" placeholder="Opcional"></label>
          <label>Páginas<input name="pages" type="number" min="0" max="5000" inputmode="numeric" placeholder="320"></label>
        </div>
        <label>Meta por dia
          <select name="goal">${[10, 15, 20, 30, 45, 60].map(m => `<option value="${m}" ${m === 20 ? 'selected' : ''}>${m} minutos</option>`).join('')}</select>
        </label>
        <button class="btn primary wide" type="submit">Começar</button>
      </form>
    </section>`;
}
