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

  // ---------- Topo / menu ----------
  const topo = $('#topo');
  addEventListener('scroll', () => topo.classList.toggle('rolou', scrollY > 8), { passive: true });

  const menuBtn = $('.menu-btn'), menu = $('#menu');
  const fecharMenu = () => { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', String(aberto));
  });
  $$('a', menu).forEach(a => a.addEventListener('click', fecharMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

  // ---------- Planos: mensal x anual ----------
  $$('.toggle button').forEach(b => b.addEventListener('click', () => {
    $$('.toggle button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    $$('.preco span').forEach(s => { s.textContent = s.dataset[b.dataset.ciclo]; });
  }));

  // Botão do plano já preenche o formulário
  $$('[data-plano]').forEach(a => a.addEventListener('click', () => { $('#f-plano').value = a.dataset.plano; }));

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
  };
  $$('.filtros button').forEach(b => b.addEventListener('click', () => {
    $$('.filtros button').forEach(x => x.classList.toggle('ativo', x === b));
    pintarMods(b.dataset.filtro);
  }));
  pintarMods('todas');

  // ---------- Grade de aulas ----------
  const dias = Object.keys(AULAS);
  const hoje = dias[(new Date().getDay() + 6) % 7];
  const dEl = $('#dias'), grade = $('#grade');
  dEl.innerHTML = dias.map(d => `<button role="tab" aria-selected="${d === hoje}" data-dia="${d}">${d}</button>`).join('');
  const pintarGrade = dia => {
    grade.innerHTML = AULAS[dia].map(([h, nome, local, vagas]) => `
      <div class="aula">
        <time>${h}</time>
        <div><b>${esc(nome)}</b><span>${esc(local)}</span></div>
        <span class="vagas${vagas <= 3 ? ' poucas' : ''}">${vagas === 1 ? 'Última vaga' : vagas + ' vagas'}</span>
      </div>`).join('');
  };
  $$('button', dEl).forEach(b => b.addEventListener('click', () => {
    $$('button', dEl).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    pintarGrade(b.dataset.dia);
  }));
  pintarGrade(hoje);

  // ---------- Unidades ----------
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = $('#q'), uf = $('#uf'), piscina = $('#piscina'), h24 = $('#h24');
  [...new Set(UNIDADES.map(u => u.uf))].sort().forEach(s => uf.add(new Option(s, s)));

  const pintarUnis = () => {
    const termo = norm(q.value.trim());
    const lista = UNIDADES.filter(u =>
      (!termo || norm(`${u.nome} ${u.cidade} ${u.bairro}`).includes(termo)) &&
      (!uf.value || u.uf === uf.value) &&
      (!piscina.checked || u.piscina) &&
      (!h24.checked || u.h24));
    $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}`;
    $('#unis').innerHTML = lista.length ? lista.map(u => `
      <article class="uni">
        <h3>${esc(u.nome)}</h3>
        <p>${esc(u.end)} · ${esc(u.bairro)}<br>${esc(u.cidade)} – ${esc(u.uf)}</p>
        <div class="chips">
          <span class="${u.h24 ? 'on' : ''}">${u.h24 ? 'Aberta 24h' : '5h às 23h'}</span>
          ${u.piscina ? '<span class="on">Piscina</span>' : ''}
          <span>Musculação</span><span>Aulas</span>
        </div>
      </article>`).join('') : '<p class="vazio">Nenhuma unidade com esses filtros. Tente outra cidade.</p>';
  };
  [q, uf, piscina, h24].forEach(el => el.addEventListener('input', pintarUnis));
  pintarUnis();

  // Unidades no formulário
  const fUni = $('#f-uni');
  UNIDADES.forEach(u => fUni.add(new Option(`${u.nome} — ${u.cidade}/${u.uf}`, u.nome)));

  // ---------- Formulário (demonstração: nada é enviado) ----------
  const form = $('#form'), msg = $('#msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input[required]', form).forEach(i => {
      const valido = i.type === 'checkbox' ? i.checked
        : i.type === 'tel' ? i.value.replace(/\D/g, '').length >= 10
        : i.checkValidity() && i.value.trim() !== '';
      i.setAttribute('aria-invalid', String(!valido));
      if (!valido) ok = false;
    });
    msg.className = 'msg full ' + (ok ? 'ok' : 'erro');
    msg.textContent = ok
      ? `Obrigado, ${form.nome.value.trim().split(' ')[0]}! A unidade ${form.unidade.value} vai entrar em contato.`
      : 'Confira os campos destacados.';
    if (ok) form.reset();
  });

  $('#ano').textContent = new Date().getFullYear();
})();
