/* DG Club · loja */
(() => {
  'use strict';

  // ---------- Configuração da loja ----------
  // Número do WhatsApp com DDI e DDD, só dígitos (ex.: '5511999999999').
  // Vazio: o pedido abre o WhatsApp para a pessoa escolher o contato.
  const WHATSAPP = '';
  const FRETE_GRATIS = 599;
  const PARCELAS = 6;

  // ---------- Ilustrações das peças (SVG) ----------
  const D = 'fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.4" stroke-linecap="round"';
  const L = 'fill="rgba(255,255,255,.14)"';
  const LONG = 'M70 30 L50 36 L20 60 L8 170 L30 174 L44 92 L46 220 L154 220 L156 92 L170 174 L192 170 L180 60 L150 36 L130 30 Q100 50 70 30Z';
  const SHORT = 'M70 30 L48 38 L14 70 L34 104 L50 92 L50 214 L150 214 L150 92 L166 104 L186 70 L152 38 L130 30 Q100 48 70 30Z';

  const SHAPES = {
    camisa: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L100 58 L84 68Z M130 30 L100 58 L116 68Z" ${L}/>
      <path d="M100 58 L100 220" ${D}/>
      <g fill="rgba(0,0,0,.25)"><circle cx="104" cy="82" r="2"/><circle cx="104" cy="112" r="2"/><circle cx="104" cy="142" r="2"/><circle cx="104" cy="172" r="2"/><circle cx="104" cy="202" r="2"/></g>
      <path d="M62 92 L84 92 L84 112 L62 112Z" ${D}/>
      <path d="M8 160 L30 164" ${D}/><path d="M192 160 L170 164" ${D}/>`,
    polo: c => `
      <path d="${SHORT}" fill="${c}"/>
      <path d="M72 30 L100 50 L88 60Z M128 30 L100 50 L112 60Z" ${L}/>
      <path d="M100 50 L100 96 M94 50 L94 96 L106 96 L106 50" ${D}/>
      <g fill="rgba(0,0,0,.25)"><circle cx="100" cy="66" r="2"/><circle cx="100" cy="82" r="2"/></g>
      <path d="M34 104 L50 92 M166 104 L150 92 M50 204 L150 204" ${D}/>`,
    sueter: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M72 31 Q100 54 128 31" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="6"/>
      <path d="M46 204 L154 204 M10 156 L31 160 M190 156 L169 160" ${D}/>
      <g ${D}><path d="M60 110 L60 200 M80 110 L80 200 M100 110 L100 200 M120 110 L120 200 M140 110 L140 200" stroke-dasharray="2 5"/></g>`,
    cardigan: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L100 120 L130 30" ${D}/>
      <path d="M100 120 L100 220" ${D}/>
      <g fill="rgba(255,255,255,.6)"><circle cx="104" cy="136" r="2.6"/><circle cx="104" cy="160" r="2.6"/><circle cx="104" cy="184" r="2.6"/><circle cx="104" cy="206" r="2.6"/></g>
      <path d="M46 206 L154 206 M10 156 L31 160 M190 156 L169 160" ${D}/>`,
    blazer: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L96 130 L78 70 L88 62Z M130 30 L104 130 L122 70 L112 62Z" ${L}/>
      <path d="M100 130 L100 220" ${D}/>
      <g fill="rgba(255,255,255,.45)"><circle cx="106" cy="148" r="2.8"/><circle cx="106" cy="174" r="2.8"/></g>
      <path d="M58 168 L82 168 M118 168 L142 168 M126 96 L144 96" ${D}/>`,
    calca: c => `
      <path d="M56 20 L144 20 L152 228 L112 228 L100 82 L88 228 L48 228Z" fill="${c}"/>
      <path d="M56 34 L144 34 M100 34 L100 82 M70 34 Q76 54 62 60 M130 34 Q124 54 138 60" ${D}/>
      <path d="M72 70 L68 226 M128 70 L132 226" ${D} stroke-dasharray="1 0"/>`,
    pantalona: c => `
      <path d="M62 20 L138 20 L168 228 L110 228 L100 90 L90 228 L32 228Z" fill="${c}"/>
      <path d="M62 36 L138 36 M100 36 L100 90 M76 50 L56 226 M124 50 L144 226" ${D}/>`,
    bermuda: c => `
      <path d="M52 40 L148 40 L158 154 L110 160 L100 92 L90 160 L42 154Z" fill="${c}"/>
      <path d="M52 54 L148 54 M100 54 L100 92 M46 140 L90 146 M154 140 L110 146" ${D}/>`,
    vestido: c => `
      <path d="M78 18 L84 18 L86 40 L114 40 L116 18 L122 18 L128 72 L166 224 L34 224 L72 72Z" fill="${c}"/>
      <path d="M72 72 Q100 82 128 72 M86 82 L70 222 M114 82 L130 222" ${D}/>`,
    bone: c => `
      <path d="M44 140 Q42 64 104 62 Q164 64 164 136Z" fill="${c}"/>
      <path d="M44 138 Q110 124 196 146 Q186 162 150 160 Q100 152 44 150Z" fill="${c}"/>
      <path d="M44 138 Q110 124 196 146" ${D}/>
      <path d="M104 62 L104 136 M74 72 Q70 104 72 136 M134 72 Q138 104 136 136" ${D}/>
      <circle cx="104" cy="63" r="4" fill="rgba(0,0,0,.25)"/>
      <text x="104" y="114" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="18" fill="rgba(255,255,255,.75)">DG</text>`,
    mocassim: c => `
      <path d="M18 160 L182 160 Q194 160 192 170 L190 176 L20 176 Q10 176 12 168Z" fill="rgba(0,0,0,.55)"/>
      <path d="M18 160 Q14 130 46 122 L110 112 Q152 102 182 132 Q196 150 182 160Z" fill="${c}"/>
      <path d="M112 112 Q140 112 156 132 Q132 140 106 132Z" ${L}/>
      <path d="M118 128 L146 128" stroke="rgba(0,0,0,.3)" stroke-width="5"/>
      <path d="M106 132 Q132 142 158 132" ${D}/>`,
    cinto: c => `
      <rect x="10" y="104" width="180" height="32" rx="3" fill="${c}"/>
      <path d="M16 110 L184 110 M16 130 L184 130" ${D} stroke-dasharray="3 3"/>
      <rect x="140" y="96" width="40" height="48" rx="4" fill="none" stroke="#b9bec7" stroke-width="5"/>
      <path d="M150 120 L178 120" stroke="#b9bec7" stroke-width="4"/>
      <g fill="rgba(0,0,0,.3)"><circle cx="60" cy="120" r="2.6"/><circle cx="80" cy="120" r="2.6"/><circle cx="100" cy="120" r="2.6"/></g>`
  };

  const svg = (shape, color) =>
    `<svg viewBox="0 0 200 240" aria-hidden="true">${SHAPES[shape](color)}</svg>`;

  // ---------- Catálogo ----------
  // bg: tom de fundo da foto; colors: [nome, hex]; sizes esgotados ficam em `out`
  const PRODUCTS = [
    { id: 'oxford', name: 'Camisa Oxford Clássica', cat: 'masculino', shape: 'camisa', price: 389, tag: 'Mais vendida', rank: 1,
      desc: 'A camisa que resolve qualquer ocasião. Oxford encorpado, colarinho com botões e caimento reto.',
      care: '100% algodão egípcio. Lavar a 30 °C, passar do avesso.',
      colors: [['Azul céu', '#a9c3e6'], ['Branco', '#f7f8fa'], ['Marinho', '#142446']],
      sizes: ['P', 'M', 'G', 'GG'], out: ['GG'], bg: '#eef1f5' },
    { id: 'polo-riviera', name: 'Polo Piquet Riviera', cat: 'masculino', shape: 'polo', price: 329, rank: 2,
      desc: 'Piquet de algodão pima, gola firme e mangas com punho canelado. Sem logo, só qualidade.',
      care: '100% algodão pima peruano. Lavar à mão ou ciclo delicado.',
      colors: [['Marinho', '#142446'], ['Branco', '#f7f8fa'], ['Preto', '#141416']],
      sizes: ['P', 'M', 'G', 'GG'], bg: '#e6eaf0' },
    { id: 'cashmere', name: 'Suéter Cashmere Gola Careca', cat: 'masculino', shape: 'sueter', price: 1290, tag: 'Edição limitada', rank: 3,
      desc: 'Toque macio que melhora com o tempo. Tricô fino, leve o bastante para o meio-termo das estações.',
      care: '100% cashmere mongol. Lavar à mão em água fria, secar na horizontal.',
      colors: [['Marinho', '#142446'], ['Preto', '#141416'], ['Branco', '#f7f8fa']],
      sizes: ['P', 'M', 'G'], bg: '#eef1f5' },
    { id: 'blazer', name: 'Blazer Navy Lã Fria', cat: 'masculino', shape: 'blazer', price: 1890, rank: 4,
      desc: 'Desestruturado, dois botões, ombro natural. Funciona com chino, jeans ou alfaiataria.',
      care: '98% lã fria, 2% elastano. Forro em viscose. Somente lavagem a seco.',
      colors: [['Marinho', '#142446'], ['Preto', '#141416']],
      sizes: ['46', '48', '50', '52', '54'], out: ['54'], bg: '#e6eaf0' },
    { id: 'chino', name: 'Calça Chino Alfaiataria', cat: 'masculino', shape: 'calca', price: 459, rank: 6,
      desc: 'Corte reto levemente afunilado, cós com passantes e vinco discreto.',
      care: '97% algodão, 3% elastano. Lavar a 30 °C.',
      colors: [['Marinho', '#142446'], ['Preto', '#141416'], ['Branco', '#f7f8fa']],
      sizes: ['38', '40', '42', '44', '46'], bg: '#eef1f5' },
    { id: 'linho-positano', name: 'Camisa de Linho Positano', cat: 'masculino', shape: 'camisa', price: 449, tag: 'Novo', rank: 5,
      desc: 'Linho italiano lavado, toque seco e amassado charmoso. Feita para o verão europeu — ou o brasileiro.',
      care: '100% linho italiano. Lavar a frio, secar à sombra.',
      colors: [['Branco', '#f7f8fa'], ['Azul céu', '#a9c3e6'], ['Preto', '#141416']],
      sizes: ['P', 'M', 'G', 'GG'], bg: '#e6eaf0' },
    { id: 'bermuda', name: 'Bermuda Linho Côte', cat: 'masculino', shape: 'bermuda', price: 299, rank: 9,
      desc: 'Comprimento acima do joelho, cós com cordão interno. Para o clube, a praia e o jantar depois.',
      care: '55% linho, 45% algodão. Lavar a frio.',
      colors: [['Branco', '#f7f8fa'], ['Marinho', '#142446'], ['Preto', '#141416']],
      sizes: ['38', '40', '42', '44'], bg: '#eef1f5' },
    { id: 'cardigan', name: 'Cardigan Tricot Hampton', cat: 'feminino', shape: 'cardigan', price: 589, tag: 'Novo', rank: 7,
      desc: 'Decote em V, botões em madrepérola e tricô leve. Sobre os ombros ou fechado.',
      care: '70% algodão, 30% cashmere. Lavar à mão, secar na horizontal.',
      colors: [['Branco', '#f7f8fa'], ['Marinho', '#142446'], ['Preto', '#141416']],
      sizes: ['PP', 'P', 'M', 'G'], bg: '#e6eaf0' },
    { id: 'vestido-midi', name: 'Vestido Midi de Linho', cat: 'feminino', shape: 'vestido', price: 749, rank: 8,
      desc: 'Alças finas, decote reto e saia evasê. A peça mais elegante da sua mala.',
      care: '100% linho. Forro em algodão. Lavar a frio.',
      colors: [['Branco', '#f7f8fa'], ['Preto', '#141416'], ['Azul royal', '#2a4fa0']],
      sizes: ['PP', 'P', 'M', 'G'], out: ['PP'], bg: '#eef1f5' },
    { id: 'quiet', name: 'Tricot Quiet Luxury', cat: 'feminino', shape: 'sueter', price: 690, rank: 10,
      desc: 'Gola careca, manga longa, tricô de lã merino extrafina. Aquele básico que todo mundo pergunta de onde é.',
      care: '100% lã merino. Lavar à mão em água fria.',
      colors: [['Branco', '#f7f8fa'], ['Preto', '#141416'], ['Marinho', '#142446']],
      sizes: ['PP', 'P', 'M', 'G'], bg: '#e6eaf0' },
    { id: 'pantalona', name: 'Calça Pantalona Alfaiataria', cat: 'feminino', shape: 'pantalona', price: 559, rank: 11,
      desc: 'Cintura alta, pregas frontais e caimento fluido até o chão.',
      care: '64% poliéster reciclado, 34% viscose, 2% elastano. Lavar a 30 °C.',
      colors: [['Branco', '#f7f8fa'], ['Preto', '#141416'], ['Marinho', '#142446']],
      sizes: ['36', '38', '40', '42', '44'], bg: '#eef1f5' },
    { id: 'polo-fem', name: 'Polo Tricot Feminina', cat: 'feminino', shape: 'polo', price: 429, rank: 12,
      desc: 'Polo em tricô canelado, manga curta e botões encapados. Com saia, jeans ou alfaiataria.',
      care: '100% viscose de bambu. Lavar à mão.',
      colors: [['Branco', '#f7f8fa'], ['Marinho', '#142446'], ['Preto', '#141416']],
      sizes: ['PP', 'P', 'M', 'G'], bg: '#e6eaf0' },
    { id: 'bone', name: 'Boné Bordado DG Club', cat: 'acessorios', shape: 'bone', price: 189, tag: 'Mais vendido', rank: 13,
      desc: 'Seis gomos, aba curva e monograma bordado em tom sobre tom. Fecho em couro.',
      care: '100% algodão sarja. Limpar com pano úmido.',
      colors: [['Marinho', '#142446'], ['Preto', '#141416'], ['Branco', '#f7f8fa']],
      sizes: ['Único'], bg: '#eef1f5' },
    { id: 'mocassim', name: 'Mocassim de Camurça', cat: 'acessorios', shape: 'mocassim', price: 890, rank: 14,
      desc: 'Camurça macia, sola de couro com borracha antiderrapante. Usa sem meia, como manda o figurino.',
      care: 'Camurça bovina. Escovar com escova própria; evitar chuva.',
      colors: [['Preto', '#141416'], ['Marinho', '#142446']],
      sizes: ['38', '39', '40', '41', '42', '43', '44'], out: ['44'], bg: '#e6eaf0' },
    { id: 'cinto', name: 'Cinto de Couro Inglês', cat: 'acessorios', shape: 'cinto', price: 279, rank: 15,
      desc: 'Couro inteiro com bordas pintadas à mão e fivela em latão escovado.',
      care: 'Couro bovino legítimo. Hidratar a cada seis meses.',
      colors: [['Preto', '#141416'], ['Marinho', '#142446']],
      sizes: ['85', '90', '95', '100', '105'], bg: '#eef1f5' }
  ];

  const CAT_NAME = { masculino: 'Masculino', feminino: 'Feminino', acessorios: 'Acessórios' };

  // ---------- Utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const byId = id => PRODUCTS.find(p => p.id === id);
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* sem armazenamento: segue só na memória */ } }
  };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
  }

  // ---------- Grade de produtos ----------
  const state = { filter: 'todos', sort: 'destaque' };

  function renderGrid() {
    let list = PRODUCTS.filter(p => state.filter === 'todos' || p.cat === state.filter);
    const sorters = {
      destaque: (a, b) => a.rank - b.rank,
      menor: (a, b) => a.price - b.price,
      maior: (a, b) => b.price - a.price,
      nome: (a, b) => a.name.localeCompare(b.name, 'pt-BR')
    };
    list = list.slice().sort(sorters[state.sort]);

    $('#grid').innerHTML = list.map((p, i) => `
      <article class="card" data-id="${p.id}" tabindex="0" style="animation-delay:${i * 40}ms" aria-label="${esc(p.name)}, ${brl(p.price)}">
        <div class="card-art" style="background:${p.bg}">
          ${p.tag ? `<span class="card-tag">${esc(p.tag)}</span>` : ''}
          ${svg(p.shape, p.colors[0][1])}
          <button class="quick" data-id="${p.id}" tabindex="-1">Compra rápida</button>
        </div>
        <h3>${esc(p.name)}</h3>
        <div class="meta">
          <span class="price">${brl(p.price)}</span>
          <span class="dots">${p.colors.map(c => `<i style="background:${c[1]}" title="${esc(c[0])}"></i>`).join('')}</span>
        </div>
        <span class="sub">${PARCELAS}x de ${brl(p.price / PARCELAS)}</span>
      </article>`).join('');
  }

  function setFilter(f) {
    state.filter = f;
    $$('.chip').forEach(c => {
      const on = c.dataset.filter === f;
      c.classList.toggle('active', on);
      c.setAttribute('aria-selected', on);
    });
    renderGrid();
  }

  // ---------- Painéis (menu, sacola, modais) ----------
  let lastFocus = null;
  function open(id) {
    closeAll(false);
    lastFocus = document.activeElement;
    const el = document.getElementById(id);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('on');
    document.body.classList.add('locked');
    const focusable = el.querySelector('button, a, input, select');
    if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 50);
  }
  function closeAll(restore = true) {
    $$('.drawer.open, .modal.open').forEach(el => {
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
    });
    $('#scrim').classList.remove('on');
    document.body.classList.remove('locked');
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  }

  // ---------- Modal do produto ----------
  const pick = { id: null, color: 0, size: null };

  function openProduct(id) {
    const p = byId(id);
    if (!p) return;
    pick.id = id;
    pick.color = 0;
    pick.size = p.sizes.length === 1 ? p.sizes[0] : null;

    $('#pmCat').textContent = CAT_NAME[p.cat];
    $('#pmName').textContent = p.name;
    $('#pmPrice').innerHTML = `${brl(p.price)}<small>ou ${PARCELAS}x de ${brl(p.price / PARCELAS)} sem juros · 5% off no Pix</small>`;
    $('#pmDesc').textContent = p.desc;
    $('#pmCare').textContent = p.care;
    $('#pmErr').textContent = '';
    $('#pmArt').style.background = p.bg;

    $('#pmColors').innerHTML = p.colors.map((c, i) =>
      `<button style="background:${c[1]}" data-i="${i}" aria-label="${esc(c[0])}"></button>`).join('');
    $('#pmSizes').innerHTML = p.sizes.map(s =>
      `<button data-s="${esc(s)}" ${(p.out || []).includes(s) ? 'disabled aria-label="' + esc(s) + ' esgotado"' : ''}>${esc(s)}</button>`).join('');

    paintProduct();
    open('product');
  }

  function paintProduct() {
    const p = byId(pick.id);
    const [name, hex] = p.colors[pick.color];
    $('#pmArt').innerHTML = svg(p.shape, hex);
    $('#pmColorName').textContent = name;
    $$('#pmColors button').forEach((b, i) => {
      b.classList.toggle('sel', i === pick.color);
      b.setAttribute('aria-pressed', i === pick.color);
    });
    $$('#pmSizes button').forEach(b => {
      b.classList.toggle('sel', b.dataset.s === pick.size);
      b.setAttribute('aria-pressed', b.dataset.s === pick.size);
    });
  }

  // ---------- Sacola ----------
  let cart = store.get('dg-cart', []).filter(i => byId(i.id));

  function saveCart() { store.set('dg-cart', cart); renderCart(); }

  function addToCart(id, color, size) {
    const key = `${id}|${color}|${size}`;
    const found = cart.find(i => i.key === key);
    if (found) found.qty += 1;
    else cart.push({ key, id, color, size, qty: 1 });
    saveCart();
  }

  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const subtotal = cart.reduce((n, i) => n + byId(i.id).price * i.qty, 0);
    $$('.cart-count').forEach(el => { el.textContent = count; });

    const list = $('#cartItems');
    if (!cart.length) {
      list.innerHTML = '<li class="cart-empty">Sua sacola está vazia.</li>';
    } else {
      list.innerHTML = cart.map(i => {
        const p = byId(i.id);
        const [cname, hex] = p.colors[i.color];
        return `<li data-key="${esc(i.key)}">
          <div class="ci-art" style="background:${p.bg}">${svg(p.shape, hex)}</div>
          <div>
            <div class="ci-name">${esc(p.name)}</div>
            <div class="ci-opts">${esc(cname)} · ${esc(i.size)}</div>
            <div class="qty">
              <button data-q="-1" aria-label="Diminuir">−</button><span>${i.qty}</span><button data-q="1" aria-label="Aumentar">+</button>
            </div>
          </div>
          <div class="ci-right">
            <span>${brl(p.price * i.qty)}</span>
            <button class="ci-remove">Remover</button>
          </div>
        </li>`;
      }).join('');
    }

    $('#subtotal').textContent = brl(subtotal);
    $('#installment').textContent = brl(subtotal / PARCELAS);
    const left = FRETE_GRATIS - subtotal;
    $('#shipText').innerHTML = left > 0
      ? `Faltam <b>${brl(left)}</b> para o frete grátis`
      : 'Você ganhou <b>frete grátis</b>.';
    $('#shipFill').style.width = `${Math.min(100, (subtotal / FRETE_GRATIS) * 100)}%`;
    $('#checkout').disabled = !cart.length;
    $('#checkout').style.opacity = cart.length ? 1 : .4;
  }

  function waUrl(text) {
    const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : 'https://wa.me/';
    return `${base}?text=${encodeURIComponent(text)}`;
  }

  function checkout() {
    if (!cart.length) return;
    const lines = cart.map(i => {
      const p = byId(i.id);
      return `• ${i.qty}x ${p.name} (${p.colors[i.color][0]}, ${i.size}) — ${brl(p.price * i.qty)}`;
    });
    const subtotal = cart.reduce((n, i) => n + byId(i.id).price * i.qty, 0);
    const text = `Olá, DG Club! Gostaria de finalizar meu pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${brl(subtotal)}`;
    window.open(waUrl(text), '_blank', 'noopener');
  }

  // ---------- Informações (rodapé) ----------
  const INFO = {
    tamanhos: `<h3>Guia de tamanhos</h3>
      <p>Medidas da peça em centímetros. Na dúvida entre dois, chama no WhatsApp que a gente ajuda.</p>
      <table><thead><tr><th>Tam.</th><th>Tórax</th><th>Cintura</th><th>Comprimento</th></tr></thead>
      <tbody><tr><td>P</td><td>100</td><td>78</td><td>72</td></tr><tr><td>M</td><td>106</td><td>84</td><td>74</td></tr>
      <tr><td>G</td><td>112</td><td>90</td><td>76</td></tr><tr><td>GG</td><td>118</td><td>96</td><td>78</td></tr></tbody></table>`,
    trocas: `<h3>Trocas e devoluções</h3>
      <p>A primeira troca é por nossa conta em até 30 dias após o recebimento. A peça precisa estar sem uso e com etiqueta.</p>
      <p>Devoluções por arrependimento em até 7 dias, com reembolso integral.</p>`,
    envio: `<h3>Envio</h3>
      <p>Postamos em até 2 dias úteis para todo o Brasil, com código de rastreio.</p>
      <p>Frete grátis em compras acima de ${brl(FRETE_GRATIS)}.</p>`
  };

  // ---------- Eventos ----------
  document.addEventListener('click', e => {
    const t = e.target;

    const filterLink = t.closest('[data-filter]');
    if (filterLink) {
      setFilter(filterLink.dataset.filter);
      if (filterLink.closest('#menu')) closeAll(false);
      if (filterLink.classList.contains('chip')) return;
    }

    const opener = t.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      if (opener.dataset.info) $('#infoBody').innerHTML = INFO[opener.dataset.info];
      open(opener.dataset.open);
      return;
    }

    if (t.closest('[data-close]') || t.id === 'scrim' || t.classList.contains('modal')) {
      closeAll();
      return;
    }

    if (t.closest('#menu a')) closeAll(false);

    const card = t.closest('.card');
    if (card) { openProduct(card.dataset.id); return; }

    const sw = t.closest('#pmColors button');
    if (sw) { pick.color = +sw.dataset.i; paintProduct(); return; }

    const sz = t.closest('#pmSizes button');
    if (sz && !sz.disabled) { pick.size = sz.dataset.s; $('#pmErr').textContent = ''; paintProduct(); return; }

    if (t.closest('#pmAdd')) {
      if (!pick.size) { $('#pmErr').textContent = 'Escolha um tamanho.'; return; }
      addToCart(pick.id, pick.color, pick.size);
      closeAll(false);
      open('cart');
      toast('Adicionado à sacola');
      return;
    }

    const li = t.closest('#cartItems li[data-key]');
    if (li) {
      const item = cart.find(i => i.key === li.dataset.key);
      const q = t.closest('[data-q]');
      if (q) {
        item.qty += +q.dataset.q;
        if (item.qty < 1) cart = cart.filter(i => i !== item);
        saveCart();
      } else if (t.closest('.ci-remove')) {
        cart = cart.filter(i => i !== item);
        saveCart();
      }
      return;
    }

    if (t.closest('#checkout')) checkout();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
      e.preventDefault();
      openProduct(e.target.dataset.id);
    }
  });

  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });

  $('#nlForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#nlEmail').value.trim();
    const list = store.get('dg-newsletter', []);
    if (!list.includes(email)) list.push(email);
    store.set('dg-newsletter', list);
    $('#nlMsg').textContent = 'Bem-vindo ao clube.';
    e.target.reset();
  });

  $$('.wa-link').forEach(a => { a.href = waUrl('Olá, DG Club! Vim pelo site.'); });
  $('#year').textContent = new Date().getFullYear();

  renderGrid();
  renderCart();
})();
