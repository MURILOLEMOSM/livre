// Site da academia Livre Fit: interações simples, sem dependências
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Dados ----------
  const MODALIDADES = [
    { nome: 'Musculação', cat: 'forca', ico: '◆', txt: 'Equipamentos de ponta e professor no salão o dia todo.', int: 'Todos os níveis' },
    { nome: 'Cross Training', cat: 'forca', ico: '▲', txt: 'Treino funcional de alta intensidade em pequenos grupos.', int: 'Intensidade alta' },
    { nome: 'Funcional', cat: 'forca', ico: '●', txt: 'Movimentos do dia a dia para força, equilíbrio e mobilidade.', int: 'Intensidade média' },
    { nome: 'Glúteo Pro', cat: 'forca', ico: '◆', txt: 'Aula focada em membros inferiores com elásticos e cargas.', int: 'Intensidade média' },
    { nome: 'Bike Indoor', cat: 'cardio', ico: '◎', txt: 'Pedal no ritmo da música, com luz e energia de show.', int: 'Intensidade alta' },
    { nome: 'Dança', cat: 'cardio', ico: '♪', txt: 'Coreografias fáceis de seguir para gastar energia sorrindo.', int: 'Todos os níveis' },
    { nome: 'Lutas', cat: 'cardio', ico: '✕', txt: 'Golpes de boxe e muay thai no saco, sem contato.', int: 'Intensidade alta' },
    { nome: 'Step', cat: 'cardio', ico: '▬', txt: 'Clássico aeróbico com plataforma e muita coordenação.', int: 'Intensidade média' },
    { nome: 'Yoga', cat: 'mente', ico: '☾', txt: 'Respiração, alongamento e foco para equilibrar a semana.', int: 'Leve' },
    { nome: 'Pilates Solo', cat: 'mente', ico: '○', txt: 'Fortalecimento do core e postura com movimentos controlados.', int: 'Leve' },
    { nome: 'Alongamento', cat: 'mente', ico: '〰', txt: 'Mobilidade e recuperação para quem treina pesado.', int: 'Leve' },
    { nome: 'Natação', cat: 'agua', ico: '≈', txt: 'Turmas por nível, da adaptação ao aperfeiçoamento.', int: 'Plano Total' },
    { nome: 'Hidroginástica', cat: 'agua', ico: '≋', txt: 'Exercício de baixo impacto na piscina aquecida.', int: 'Plano Total' },
  ];

  const AULAS = {
    Seg: [['06:30', 'Bike Indoor', 'Sala 1 · 45 min', 4], ['07:30', 'Funcional', 'Área externa · 50 min', 12], ['12:15', 'Lutas', 'Sala 2 · 45 min', 8], ['18:30', 'Glúteo Pro', 'Sala 2 · 45 min', 2], ['19:30', 'Dança', 'Sala 1 · 50 min', 15], ['20:30', 'Yoga', 'Sala 3 · 60 min', 9]],
    Ter: [['06:30', 'Cross Training', 'Box · 50 min', 3], ['08:00', 'Hidroginástica', 'Piscina · 45 min', 10], ['12:15', 'Pilates Solo', 'Sala 3 · 50 min', 7], ['18:00', 'Bike Indoor', 'Sala 1 · 45 min', 1], ['19:15', 'Step', 'Sala 2 · 45 min', 11]],
    Qua: [['06:30', 'Funcional', 'Área externa · 50 min', 9], ['07:30', 'Yoga', 'Sala 3 · 60 min', 6], ['12:15', 'Bike Indoor', 'Sala 1 · 45 min', 5], ['18:30', 'Lutas', 'Sala 2 · 45 min', 3], ['19:30', 'Glúteo Pro', 'Sala 2 · 45 min', 6], ['20:30', 'Alongamento', 'Sala 3 · 30 min', 14]],
    Qui: [['06:30', 'Cross Training', 'Box · 50 min', 6], ['08:00', 'Natação', 'Piscina · 45 min', 4], ['12:15', 'Dança', 'Sala 1 · 50 min', 13], ['18:00', 'Bike Indoor', 'Sala 1 · 45 min', 2], ['19:15', 'Pilates Solo', 'Sala 3 · 50 min', 8]],
    Sex: [['06:30', 'Bike Indoor', 'Sala 1 · 45 min', 7], ['07:30', 'Funcional', 'Área externa · 50 min', 10], ['12:15', 'Glúteo Pro', 'Sala 2 · 45 min', 5], ['18:30', 'Dança', 'Sala 1 · 50 min', 16]],
    Sáb: [['08:00', 'Cross Training', 'Box · 60 min', 4], ['09:00', 'Hidroginástica', 'Piscina · 45 min', 12], ['10:00', 'Yoga', 'Sala 3 · 60 min', 10]],
    Dom: [['09:00', 'Bike Indoor', 'Sala 1 · 45 min', 8], ['10:00', 'Alongamento', 'Sala 3 · 30 min', 15]],
  };

  // Unidades fictícias para demonstração
  const UNIDADES = [
    { nome: 'Paulista', cidade: 'São Paulo', bairro: 'Bela Vista', uf: 'SP', end: 'Av. Exemplo, 1000', piscina: true, h24: true },
    { nome: 'Pinheiros', cidade: 'São Paulo', bairro: 'Pinheiros', uf: 'SP', end: 'Rua Modelo, 250', piscina: false, h24: true },
    { nome: 'Tatuapé', cidade: 'São Paulo', bairro: 'Tatuapé', uf: 'SP', end: 'Rua Demonstração, 77', piscina: true, h24: false },
    { nome: 'Santana', cidade: 'São Paulo', bairro: 'Santana', uf: 'SP', end: 'Av. Fictícia, 410', piscina: false, h24: false },
    { nome: 'Campinas Centro', cidade: 'Campinas', bairro: 'Centro', uf: 'SP', end: 'Rua das Amostras, 33', piscina: false, h24: false },
    { nome: 'Cambuí', cidade: 'Campinas', bairro: 'Cambuí', uf: 'SP', end: 'Av. Protótipo, 1200', piscina: true, h24: false },
    { nome: 'Ribeirão Sul', cidade: 'Ribeirão Preto', bairro: 'Jd. Sul', uf: 'SP', end: 'Av. Teste, 900', piscina: true, h24: true },
    { nome: 'Barra', cidade: 'Rio de Janeiro', bairro: 'Barra da Tijuca', uf: 'RJ', end: 'Av. Exemplo, 3000', piscina: true, h24: true },
    { nome: 'Tijuca', cidade: 'Rio de Janeiro', bairro: 'Tijuca', uf: 'RJ', end: 'Rua Modelo, 88', piscina: false, h24: false },
    { nome: 'Niterói Icaraí', cidade: 'Niterói', bairro: 'Icaraí', uf: 'RJ', end: 'Rua Fictícia, 15', piscina: false, h24: true },
    { nome: 'Savassi', cidade: 'Belo Horizonte', bairro: 'Savassi', uf: 'MG', end: 'Rua Demonstração, 501', piscina: false, h24: true },
    { nome: 'Pampulha', cidade: 'Belo Horizonte', bairro: 'Pampulha', uf: 'MG', end: 'Av. Amostra, 2020', piscina: true, h24: false },
    { nome: 'Batel', cidade: 'Curitiba', bairro: 'Batel', uf: 'PR', end: 'Av. Modelo, 640', piscina: true, h24: false },
    { nome: 'Moinhos', cidade: 'Porto Alegre', bairro: 'Moinhos de Vento', uf: 'RS', end: 'Rua Exemplo, 120', piscina: false, h24: false },
    { nome: 'Asa Sul', cidade: 'Brasília', bairro: 'Asa Sul', uf: 'DF', end: 'Quadra Fictícia, Bloco A', piscina: true, h24: true },
    { nome: 'Boa Viagem', cidade: 'Recife', bairro: 'Boa Viagem', uf: 'PE', end: 'Av. Protótipo, 4500', piscina: true, h24: false },
  ];

  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem('lf:' + k)) ?? padrao; } catch { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem('lf:' + k, JSON.stringify(v)); } catch {} };

  // ---------- Toasts ----------
  const toasts = $('#toasts');
  const avisar = texto => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = texto;
    toasts.append(t);
    setTimeout(() => { t.classList.add('sai'); t.addEventListener('animationend', () => t.remove(), { once: true }); setTimeout(() => t.remove(), 400); }, 2600);
  };

  // Itens recém-desenhados entram em cascata
  const cascata = el => $$(':scope > *', el).forEach((c, i) => { c.classList.add('entra'); c.style.setProperty('--i', Math.min(i, 12)); });

  // ---------- Topo, progresso e voltar ao topo ----------
  const topo = $('#topo'), barra = $('#progresso'), sobe = $('#sobe');
  sobe.hidden = false;
  let pedido = 0;
  const aoRolar = () => {
    pedido = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    topo.classList.toggle('rolou', scrollY > 8);
    barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    sobe.classList.toggle('mostra', scrollY > innerHeight);
  };
  addEventListener('scroll', () => { if (!pedido) pedido = requestAnimationFrame(aoRolar); }, { passive: true });
  aoRolar();
  sobe.addEventListener('click', () => scrollTo({ top: 0, behavior: reduz ? 'auto' : 'smooth' }));

  const menuBtn = $('.menu-btn'), menu = $('#menu');
  const fecharMenu = () => { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', String(aberto));
  });
  $$('a', menu).forEach(a => a.addEventListener('click', fecharMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && !menuBtn.contains(e.target)) fecharMenu(); });

  // Link do menu acompanha a seção visível
  const links = $$('a[href^="#"]:not(.btn)', menu);
  const espia = new IntersectionObserver(entradas => entradas.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + en.target.id)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const sec = $(a.hash); if (sec) espia.observe(sec); });

  // ---------- Revelar ao rolar ----------
  const revela = new IntersectionObserver(entradas => entradas.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visto'); revela.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  const marcar = (sel, grupo) => $$(sel).forEach((el, i) => {
    el.classList.add('revela');
    if (grupo) el.style.setProperty('--i', i % grupo);
    revela.observe(el);
  });
  marcar('.sec-cab');
  marcar('.faixa-in > div', 4);
  marcar('.plano', 3);
  marcar('.app-lista li', 5);
  marcar('.fone');
  marcar('.faq details', 6);
  marcar('.form');

  // ---------- Contador dos números do hero ----------
  const contar = el => {
    const fim = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now(), dur = 1200;
    const passo = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(fim * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  if (!reduz) $$('[data-count]').forEach(el => setTimeout(() => contar(el), 600));

  // ---------- Brilho que segue o mouse + ondas nos botões ----------
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.plano, .mod, .uni');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  document.addEventListener('pointerdown', e => {
    const b = e.target.closest?.('.btn');
    if (!b || reduz) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const o = document.createElement('span');
    o.className = 'onda';
    Object.assign(o.style, { width: d + 'px', height: d + 'px', left: e.clientX - r.left - d / 2 + 'px', top: e.clientY - r.top - d / 2 + 'px' });
    b.append(o);
    o.addEventListener('animationend', () => o.remove());
  });

  // ---------- Planos: mensal x anual ----------
  const num = s => +s.replace(/\./g, '').replace(',', '.');
  const brl = n => n.toFixed(2).replace('.', ',');
  const animarPreco = (el, para) => {
    const de = num(el.textContent), alvo = num(para), t0 = performance.now(), dur = reduz ? 0 : 450;
    el.classList.remove('troca'); void el.offsetWidth; el.classList.add('troca');
    const passo = t => {
      const p = dur ? Math.min((t - t0) / dur, 1) : 1;
      el.textContent = p < 1 ? brl(de + (alvo - de) * p) : para;
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  $$('.preco').forEach(p => {
    const s = $('span', p);
    const eco = document.createElement('span');
    eco.className = 'economia';
    eco.textContent = `Economize R$ ${brl((num(s.dataset.mensal) - num(s.dataset.anual)) * 12)} por ano`;
    p.after(eco);
  });
  const planos = $('.planos');
  $$('.toggle button').forEach(b => b.addEventListener('click', () => {
    $$('.toggle button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    planos.classList.toggle('anual', b.dataset.ciclo === 'anual');
    $$('.preco span').forEach(s => animarPreco(s, s.dataset[b.dataset.ciclo]));
  }));

  // Botão do plano já preenche o formulário
  $$('[data-plano]').forEach(a => a.addEventListener('click', () => { $('#f-plano').value = a.dataset.plano; salvarRascunho(); }));

  // ---------- Modalidades ----------
  const mods = $('#mods');
  const pintarMods = filtro => {
    mods.innerHTML = MODALIDADES.filter(m => filtro === 'todas' || m.cat === filtro).map(m => `
      <article class="mod">
        <div class="mod-ico" aria-hidden="true">${m.ico}</div>
        <h3>${esc(m.nome)}</h3>
        <p>${esc(m.txt)}</p>
        <span class="int">${esc(m.int)}</span>
      </article>`).join('');
    cascata(mods);
  };
  $$('.filtros button').forEach(b => b.addEventListener('click', () => {
    $$('.filtros button').forEach(x => x.classList.toggle('ativo', x === b));
    pintarMods(b.dataset.filtro);
  }));
  pintarMods('todas');

  // ---------- Grade de aulas (com reserva) ----------
  const dias = Object.keys(AULAS);
  const agora = new Date();
  const hoje = dias[(agora.getDay() + 6) % 7];
  const minAgora = agora.getHours() * 60 + agora.getMinutes();
  const reservas = new Set(ler('reservas', []));
  const dEl = $('#dias'), grade = $('#grade');
  dEl.innerHTML = dias.map(d => `<button role="tab" aria-selected="${d === hoje}" tabindex="${d === hoje ? 0 : -1}" data-dia="${d}">${d}</button>`).join('');

  const pintarGrade = dia => {
    let marcouProxima = false;
    grade.innerHTML = AULAS[dia].map(([h, nome, local, vagas]) => {
      const id = `${dia} ${h} ${nome}`, minha = reservas.has(id);
      const [hh, mm] = h.split(':').map(Number);
      const passou = dia === hoje && hh * 60 + mm < minAgora;
      const proxima = dia === hoje && !passou && !marcouProxima && (marcouProxima = true);
      const livres = vagas - (minha ? 1 : 0);
      return `
      <div class="aula${passou ? ' passou' : ''}${proxima ? ' proxima' : ''}${minha ? ' reservada' : ''}">
        <time>${h}</time>
        <div><b>${esc(nome)}${proxima ? '<span class="selo-prox">Próxima</span>' : ''}</b><span>${esc(local)}</span></div>
        <span class="vagas${livres <= 3 ? ' poucas' : ''}">${livres <= 0 ? 'Lotada' : livres === 1 ? 'Última vaga' : livres + ' vagas'}</span>
        <button class="reservar" data-id="${esc(id)}" aria-pressed="${minha}" ${passou && !minha ? 'disabled' : ''}>${minha ? 'Reservada ✓' : 'Reservar'}</button>
      </div>`;
    }).join('');
    cascata(grade);
  };
  const escolherDia = b => {
    $$('button', dEl).forEach(x => { const sel = x === b; x.setAttribute('aria-selected', String(sel)); x.tabIndex = sel ? 0 : -1; });
    pintarGrade(b.dataset.dia);
  };
  $$('button', dEl).forEach(b => b.addEventListener('click', () => escolherDia(b)));
  dEl.addEventListener('keydown', e => {
    const bs = $$('button', dEl), i = bs.indexOf(document.activeElement);
    const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : null;
    if (j === null || i < 0) return;
    e.preventDefault();
    const alvo = bs[(j + bs.length) % bs.length];
    alvo.focus(); escolherDia(alvo);
  });
  grade.addEventListener('click', e => {
    const b = e.target.closest('.reservar');
    if (!b) return;
    const id = b.dataset.id, [dia, h, ...n] = id.split(' ');
    if (reservas.has(id)) { reservas.delete(id); avisar(`Reserva de ${n.join(' ')} cancelada.`); }
    else { reservas.add(id); avisar(`Vaga garantida: ${n.join(' ')}, ${dia} às ${h}.`); }
    gravar('reservas', [...reservas]);
    pintarGrade(dia);
  });
  pintarGrade(hoje);

  // ---------- Unidades (aberta agora + favorita) ----------
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = $('#q'), uf = $('#uf'), piscina = $('#piscina'), h24 = $('#h24'), unis = $('#unis');
  let favorita = ler('favorita', '');
  [...new Set(UNIDADES.map(u => u.uf))].sort().forEach(s => uf.add(new Option(s, s)));
  const aberta = u => u.h24 || (agora.getHours() >= 5 && agora.getHours() < 23);

  let espera;
  const pintarUnis = () => {
    const termo = norm(q.value.trim());
    const lista = UNIDADES.filter(u =>
      (!termo || norm(`${u.nome} ${u.cidade} ${u.bairro}`).includes(termo)) &&
      (!uf.value || u.uf === uf.value) &&
      (!piscina.checked || u.piscina) &&
      (!h24.checked || u.h24))
      .sort((a, b) => (b.nome === favorita) - (a.nome === favorita));
    $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}`;
    unis.innerHTML = lista.length ? lista.map(u => {
      const fav = u.nome === favorita;
      return `
      <article class="uni${fav ? ' favorita' : ''}">
        <div class="uni-cab">
          <h3>${esc(u.nome)}</h3>
          <button class="fav" data-nome="${esc(u.nome)}" aria-pressed="${fav}" aria-label="${fav ? 'Remover' : 'Marcar'} ${esc(u.nome)} como favorita">${fav ? '★' : '☆'}</button>
        </div>
        <p>${esc(u.end)} · ${esc(u.bairro)}<br>${esc(u.cidade)} – ${esc(u.uf)}</p>
        <div class="chips">
          <span class="${aberta(u) ? 'aberta' : 'fechada'}">${aberta(u) ? 'Aberta agora' : 'Fechada agora'}</span>
          <span class="${u.h24 ? 'on' : ''}">${u.h24 ? '24h' : '5h às 23h'}</span>
          ${u.piscina ? '<span class="on">Piscina</span>' : ''}
          <span>Musculação</span><span>Aulas</span>
        </div>
      </article>`;
    }).join('') : '<p class="vazio">Nenhuma unidade com esses filtros. Tente outra cidade.</p>';
    cascata(unis);
  };
  q.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(pintarUnis, 150); });
  [uf, piscina, h24].forEach(el => el.addEventListener('input', pintarUnis));
  unis.addEventListener('click', e => {
    const b = e.target.closest('.fav');
    if (!b) return;
    favorita = favorita === b.dataset.nome ? '' : b.dataset.nome;
    gravar('favorita', favorita);
    if (favorita) { fUni.value = favorita; salvarRascunho(); }
    avisar(favorita ? `${favorita} agora é sua unidade favorita.` : 'Favorita removida.');
    pintarUnis();
  });

  // Unidades no formulário (favorita já vem escolhida)
  const fUni = $('#f-uni');
  UNIDADES.forEach(u => fUni.add(new Option(`${u.nome} — ${u.cidade}/${u.uf}`, u.nome)));
  if (favorita) fUni.value = favorita;
  pintarUnis();

  // ---------- Formulário (demonstração: nada é enviado) ----------
  const form = $('#form'), msg = $('#msg'), tel = $('#f-tel');
  const CAMPOS = ['nome', 'email', 'tel', 'plano', 'unidade'];

  // Máscara de celular: (11) 99999-9999
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d.length ? `(${d}` : '';
  });

  // Rascunho guardado no navegador
  function salvarRascunho() { gravar('rascunho', Object.fromEntries(CAMPOS.map(c => [c, form[c].value]))); }
  const rascunho = ler('rascunho', null);
  if (rascunho) CAMPOS.forEach(c => { if (rascunho[c]) form[c].value = rascunho[c]; });
  form.addEventListener('input', e => {
    salvarRascunho();
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
  });

  const confete = origem => {
    if (reduz) return;
    const r = origem.getBoundingClientRect(), cores = ['#c6ff3d', '#3dffb0', '#e9ecf2', '#ffb03d'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('i');
      c.className = 'confete';
      const ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 160;
      Object.assign(c.style, { left: r.left + r.width / 2 + 'px', top: r.top + 'px', background: cores[i % cores.length] });
      c.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      c.style.setProperty('--dy', Math.sin(ang) * dist + 120 + 'px');
      c.style.setProperty('--r', Math.random() * 720 + 'deg');
      document.body.append(c);
      c.addEventListener('animationend', () => c.remove());
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    let primeiro = null;
    $$('input[required]', form).forEach(i => {
      const valido = i.type === 'checkbox' ? i.checked
        : i.type === 'tel' ? i.value.replace(/\D/g, '').length >= 10
        : i.checkValidity() && i.value.trim() !== '';
      i.removeAttribute('aria-invalid'); void i.offsetWidth;
      if (!valido) { i.setAttribute('aria-invalid', 'true'); primeiro ||= i; }
    });
    if (primeiro) {
      msg.className = 'msg full erro';
      msg.textContent = 'Confira os campos destacados.';
      primeiro.focus();
      return;
    }
    const btn = $('button[type="submit"]', form);
    btn.classList.add('enviando');
    msg.textContent = '';
    setTimeout(() => {
      btn.classList.remove('enviando');
      msg.className = 'msg full ok';
      msg.textContent = `Obrigado, ${form.nome.value.trim().split(' ')[0]}! A unidade ${form.unidade.value} vai entrar em contato.`;
      confete(btn);
      form.reset();
      if (favorita) fUni.value = favorita;
      try { localStorage.removeItem('lf:rascunho'); } catch {}
    }, 900);
  });

  $('#ano').textContent = new Date().getFullYear();
})();
