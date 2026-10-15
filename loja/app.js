/* DG Club · loja (páginas, sacola, checkout) */
(() => {
  'use strict';

  const { CONFIG, PRODUCTS, TYPES, LOOKS, svg } = window.DG;
  const M = () => window.DGMotion;

  // ---------- Utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const byId = id => PRODUCTS.find(p => p.id === id);
  const off = p => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
  const typeOf = p => TYPES.find(t => t.shapes.includes(p.shape));
  const CAT_NAME = { masculino: 'Masculino', feminino: 'Feminino', acessorios: 'Acessórios' };
  const bgOf = i => (i % 2 ? '#e6eaf0' : '#eef1f5');
  const BG = {};
  PRODUCTS.forEach((p, i) => { BG[p.id] = bgOf(i); });

  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* sem armazenamento: segue na memória */ } }
  };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }

  function waUrl(text) {
    const base = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : 'https://wa.me/';
    return `${base}?text=${encodeURIComponent(text)}`;
  }

  const icon = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>',
    swap: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M3 10h18"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };

  // ---------- Estado ----------
  let cart = store.get('dg-cart', []).filter(i => byId(i.id));
  let favs = store.get('dg-favs', []).filter(byId);
  let recent = store.get('dg-recent', []).filter(byId);
  let coupon = store.get('dg-coupon', '');
  let account = store.get('dg-account', null);
  let orders = store.get('dg-orders', []);

  // ---------- Preços e totais ----------
  function freteOptions(cep, base) {
    const d = String(cep).replace(/\D/g, '');
    if (d.length !== 8) return null;
    const r = +d[0];
    const t = r <= 1 ? [19.9, '3 a 5', 29.9, '1 a 2']
      : r <= 3 ? [24.9, '4 a 7', 39.9, '2 a 3']
        : r <= 6 ? [34.9, '7 a 12', 59.9, '3 a 5']
          : [27.9, '5 a 8', 44.9, '2 a 4'];
    const free = base >= CONFIG.freteGratis;
    return [
      { id: 'normal', name: 'Entrega normal', price: free ? 0 : t[0], days: t[1] },
      { id: 'expressa', name: 'Entrega expressa', price: t[2], days: t[3] }
    ];
  }

  function totals({ ship = null, pay = null } = {}) {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const subtotal = cart.reduce((n, i) => n + byId(i.id).price * i.qty, 0);
    const kit = count >= CONFIG.kitQtd ? subtotal * CONFIG.kitDesc : 0;
    const cupomRate = CONFIG.cupons[coupon] || 0;
    const cupom = (subtotal - kit) * cupomRate;
    const base = subtotal - kit - cupom;
    const pix = pay === 'pix' ? base * CONFIG.pix : 0;
    const frete = ship ? ship.price : 0;
    return { count, subtotal, kit, cupom, base, pix, frete, total: base - pix + frete };
  }

  // ---------- Componentes ----------
  function priceHTML(p) {
    return `<span class="price${p.old ? ' is-sale' : ''}">${p.old ? `<s>${brl(p.old)}</s>` : ''}${brl(p.price)}</span>`;
  }

  function cardHTML(p, i = 0) {
    const fav = favs.includes(p.id);
    return `
      <article class="card">
        <div class="card-media">
        <a class="card-art" href="#/p/${p.id}" style="background:${BG[p.id]}" aria-label="${esc(p.name)}">
          <span class="tags">
            ${p.old ? `<span class="card-tag sale">−${off(p)}%</span>` : ''}
            ${p.novo ? '<span class="card-tag">Novo</span>' : ''}
            ${p.tag ? `<span class="card-tag">${esc(p.tag)}</span>` : ''}
          </span>
          <span class="art a1">${svg(p.shape, p.colors[0][1])}</span>
          <span class="art a2">${svg(p.shape, (p.colors[1] || p.colors[0])[1])}</span>
        </a>
        <button class="fav${fav ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritar ${esc(p.name)}">${icon.heart}</button>
        <button class="quick" data-quick="${p.id}">Compra rápida</button>
        </div>
        <a href="#/p/${p.id}" class="card-info">
          <h3>${esc(p.name)}</h3>
          <span class="meta">${priceHTML(p)}<span class="dots">${p.colors.map(c => `<i style="background:${c[1]}" title="${esc(c[0])}"></i>`).join('')}</span></span>
          <span class="sub">${brl(p.price * (1 - CONFIG.pix))} no Pix · ${CONFIG.parcelas}x de ${brl(p.price / CONFIG.parcelas)}</span>
        </a>
      </article>`;
  }

  function railHTML(title, list, link) {
    if (!list.length) return '';
    return `
      <section class="rail-wrap">
        <div class="rail-head">
          <h2>${title}</h2>
          <div class="rail-ctrl">
            ${link ? `<a class="link-arrow" href="${link}">Ver tudo</a>` : ''}
            <button class="rail-btn" data-rail="-1" aria-label="Voltar">${icon.prev}</button>
            <button class="rail-btn" data-rail="1" aria-label="Avançar">${icon.next}</button>
          </div>
        </div>
        <div class="rail">${list.map(cardHTML).join('')}</div>
      </section>`;
  }

  const benefitsHTML = () => `
    <section class="values" aria-label="Diferenciais">
      <div>${icon.truck}<strong>Frete grátis</strong><span>Acima de ${brl(CONFIG.freteGratis)} para todo o Brasil</span></div>
      <div>${icon.swap}<strong>Troca grátis</strong><span>Primeira troca em até 30 dias</span></div>
      <div>${icon.card}<strong>6x sem juros</strong><span>Ou ${CONFIG.pix * 100}% off no Pix</span></div>
      <div>${icon.chat}<strong>Atendimento pessoal</strong><span>Consultoria de tamanho no WhatsApp</span></div>
    </section>`;

  const roundsHTML = () => `
    <section class="shop-type" aria-label="Compre por categoria">
      <p class="eyebrow center">Compre por categoria</p>
      <div class="rounds">${TYPES.map(t => `
        <a href="#/c/t-${t.key}" class="round">
          <span class="round-art">${svg(t.icon[0], t.icon[1])}</span>
          <span>${t.name}</span>
        </a>`).join('')}
      </div>
    </section>`;

  const crumbs = items => `<nav class="crumbs" aria-label="Você está em">${items.map(([label, href], i) =>
    (href && i < items.length - 1 ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join('<i>/</i>')}</nav>`;

  // ---------- Páginas ----------
  const pages = {};

  // Início
  pages.home = () => {
    const best = PRODUCTS.slice().sort((a, b) => a.rank - b.rank).slice(0, 8);
    const news = PRODUCTS.filter(p => p.novo);
    return `
      <section class="slider" aria-roledescription="carrossel" aria-label="Destaques">
        <div class="slides">
          <article class="slide dark" style="--bg:#0f1f3d" data-shape="blazer" data-fill="#f7f8fa">
            <div class="slide-copy">
              <p class="eyebrow">Coleção Outono · Inverno</p>
              <h1>Vestir-se bem<br><em>nunca sai de moda.</em></h1>
              <p class="lede">Peças pensadas para durar décadas, não temporadas. Tecidos nobres e cortes limpos.</p>
              <div class="hero-actions"><a href="#/c/todos" class="btn btn-light">Ver coleção</a><a href="#/old-money" class="btn btn-outline-light">Old Money</a></div>
            </div>
            <div class="slide-art"></div>
          </article>
          <article class="slide light" style="--bg:#e9eef6" data-shape="polo" data-fill="#2a4fa0">
            <div class="slide-copy">
              <p class="eyebrow">Semana das polos</p>
              <h2 class="slide-title">Polos com até<br><em>20% off.</em></h2>
              <p class="lede">Piquet pima e tricot. Gola firme, caimento de clube.</p>
              <a href="#/c/t-polos" class="btn btn-dark">Comprar polos</a>
            </div>
            <div class="slide-art"></div>
          </article>
          <article class="slide dark" style="--bg:#0b0b0c" data-shape="camisa" data-fill="#f7f8fa">
            <div class="slide-copy">
              <p class="eyebrow">Guarda-roupa essencial</p>
              <h2 class="slide-title">Leve 3 peças,<br><em>ganhe 15%.</em></h2>
              <p class="lede">O desconto entra sozinho na sacola e soma com os ${CONFIG.pix * 100}% do Pix.</p>
              <a href="#/c/todos" class="btn btn-light">Montar meu kit</a>
            </div>
            <div class="slide-art"></div>
          </article>
        </div>
        <button class="slide-nav prev" aria-label="Banner anterior">${icon.prev}</button>
        <button class="slide-nav next" aria-label="Próximo banner">${icon.next}</button>
        <div class="slide-dots"></div>
      </section>

      ${benefitsHTML()}
      ${roundsHTML()}
      ${railHTML('Mais vendidos', best, '#/c/todos')}

      <section class="om-banner">
        <div class="om-art" aria-hidden="true">
          ${LOOKS[0].items.slice(0, 3).map(([id, c]) => `<span>${svg(byId(id).shape, byId(id).colors[c][1])}</span>`).join('')}
        </div>
        <div class="om-copy">
          <p class="eyebrow">Coleção</p>
          <h2>Old Money</h2>
          <p>Riviera, Hampton, Cambridge e Positano: quatro looks completos para quem se veste como se sempre tivesse sido assim.</p>
          <a href="#/old-money" class="btn btn-dark">Ver os looks</a>
        </div>
      </section>

      <section class="cats">
        <a href="#/c/masculino" class="cat"><div class="cat-art tone-navy"><span>${svg('polo', '#f7f8fa')}</span></div>
          <div class="cat-label"><span>Masculino</span><small>Polos, camisas, alfaiataria</small></div></a>
        <a href="#/c/feminino" class="cat"><div class="cat-art tone-royal"><span>${svg('vestido', '#f7f8fa')}</span></div>
          <div class="cat-label"><span>Feminino</span><small>Tricots, vestidos, linho</small></div></a>
        <a href="#/c/acessorios" class="cat"><div class="cat-art tone-black"><span>${svg('mocassim', '#f7f8fa')}</span></div>
          <div class="cat-label"><span>Acessórios</span><small>Bonés, couro, mocassins</small></div></a>
      </section>

      ${railHTML('Novidades', news, '#/c/novidades')}

      <section class="promo">
        <div>
          <p class="eyebrow light">Kit essencial</p>
          <h2>Leve 3, ganhe <em>15% off</em></h2>
        </div>
        <p>Escolha qualquer combinação de peças. O desconto aparece direto na sacola.</p>
        <a href="#/c/todos" class="btn btn-light">Montar meu kit</a>
      </section>

      <section class="editorial">
        <div class="editorial-art tone-royal" aria-hidden="true"><span class="monogram">DG</span></div>
        <div class="editorial-copy">
          <p class="eyebrow">O Clube</p>
          <h2>Discreto é o novo<br><em>sofisticado.</em></h2>
          <p>O DG Club nasceu da ideia de que elegância é silenciosa. Nossas peças conversam com quem entende de tecido, de caimento e de detalhe, sem precisar de logo estampado no peito.</p>
          <p>Membros acumulam benefícios a cada compra: acesso antecipado aos drops, frete grátis e atendimento de alfaiataria.</p>
          <a href="#/clube" class="link-arrow">Conheça o clube →</a>
        </div>
      </section>

      <section class="insta">
        <div class="insta-head">
          <p class="eyebrow center">No Instagram</p>
          <h2><a href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">@${CONFIG.instagram}</a></h2>
        </div>
        <div class="insta-grid">
          ${['camisa-linho', 'polo-riviera', 'cardigan-hampton', 'blazer-navy', 'saia-plissada', 'mocassim'].map((id, i) => {
            const p = byId(id);
            return `<a href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener" class="insta-tile" style="background:${['#0f1f3d', '#e9eef6', '#0b0b0c', '#eef1f5', '#2a4fa0', '#ecebe6'][i]}" aria-label="Ver no Instagram">${svg(p.shape, p.colors[i % p.colors.length][1])}</a>`;
          }).join('')}
        </div>
      </section>`;
  };
  pages.home.after = () => initSlider();
  pages.home.title = 'DG Club · Vestuário atemporal';

  // Catálogo
  const FILTERS = {
    todos: { name: 'Toda a coleção', test: () => true },
    novidades: { name: 'Novidades', test: p => p.novo },
    masculino: { name: 'Masculino', test: p => p.cat === 'masculino' },
    feminino: { name: 'Feminino', test: p => p.cat === 'feminino' },
    acessorios: { name: 'Acessórios', test: p => p.cat === 'acessorios' },
    sale: { name: 'Sale', test: p => p.old },
    'old-money': { name: 'Old Money', test: p => p.om }
  };
  TYPES.forEach(t => { FILTERS[`t-${t.key}`] = { name: t.name, test: p => t.shapes.includes(p.shape) }; });

  const facet = { types: [], colors: [], sizes: [], price: '', sort: 'destaque' };
  let lastListKey = '';

  function listFor(key, q) {
    if (key === 'busca') {
      const words = norm(q).split(/\s+/).filter(Boolean);
      return PRODUCTS.filter(p => {
        const hay = norm(`${p.name} ${p.desc} ${CAT_NAME[p.cat]} ${typeOf(p).name} ${p.colors.map(c => c[0]).join(' ')}`);
        return words.every(w => hay.includes(w));
      });
    }
    return PRODUCTS.filter((FILTERS[key] || FILTERS.todos).test);
  }

  pages.catalog = (key, q = '') => {
    if (lastListKey !== key + q) Object.assign(facet, { types: [], colors: [], sizes: [], price: '' });
    lastListKey = key + q;
    const base = listFor(key, q);
    const title = key === 'busca' ? `Busca: “${q}”` : (FILTERS[key] || FILTERS.todos).name;
    pages.catalog.title = `${key === 'busca' ? 'Busca' : title} · DG Club`;

    const types = TYPES.filter(t => base.some(p => t.shapes.includes(p.shape)));
    const colors = [...new Map(base.flatMap(p => p.colors).map(c => [c[0], c])).values()];
    const sizes = [...new Set(base.flatMap(p => p.sizes))];

    return `
      <section class="page catalog">
        ${crumbs([['Início', '#/'], [title]])}
        <header class="page-head">
          <h1>${esc(title)}</h1>
          <p class="muted" id="countTxt"></p>
        </header>
        <div class="cat-layout">
          <aside class="facets" id="facets" aria-label="Filtros">
            <div class="facets-head"><strong>Filtrar</strong><button class="link-btn" data-facet-close>Fechar</button></div>
            ${types.length > 1 ? `<fieldset><legend>Categoria</legend>${types.map(t => `
              <label class="check"><input type="checkbox" data-facet="types" value="${t.key}"${facet.types.includes(t.key) ? ' checked' : ''}> ${t.name}</label>`).join('')}</fieldset>` : ''}
            <fieldset><legend>Cor</legend><div class="swatch-row">${colors.map(c => `
              <label class="swatch-check" title="${esc(c[0])}"><input type="checkbox" data-facet="colors" value="${esc(c[0])}"${facet.colors.includes(c[0]) ? ' checked' : ''}><i style="background:${c[1]}"></i><span>${esc(c[0])}</span></label>`).join('')}</div></fieldset>
            <fieldset><legend>Tamanho</legend><div class="size-row">${sizes.map(s => `
              <label class="size-check"><input type="checkbox" data-facet="sizes" value="${esc(s)}"${facet.sizes.includes(s) ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div></fieldset>
            <fieldset><legend>Preço</legend>${[['', 'Todos'], ['0-400', 'Até R$ 400'], ['400-800', 'R$ 400 a R$ 800'], ['800-99999', 'Acima de R$ 800']].map(([v, l]) => `
              <label class="check"><input type="radio" name="price" data-facet="price" value="${v}"${facet.price === v ? ' checked' : ''}> ${l}</label>`).join('')}</fieldset>
            <button class="btn btn-ghost full" data-facet-clear>Limpar filtros</button>
          </aside>
          <div class="cat-main">
            <div class="toolbar">
              <button class="btn btn-ghost filter-btn" data-facet-open>Filtrar</button>
              <div class="active-facets" id="activeFacets"></div>
              <label class="sort"><span>Ordenar</span>
                <select id="sort">
                  ${[['destaque', 'Destaques'], ['novos', 'Lançamentos'], ['menor', 'Menor preço'], ['maior', 'Maior preço'], ['desconto', 'Maior desconto']].map(([v, l]) => `<option value="${v}"${facet.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
                </select>
              </label>
            </div>
            <div class="grid" id="grid"></div>
          </div>
        </div>
      </section>`;
  };
  pages.catalog.after = (key, q = '') => renderGrid(key, q);

  function renderGrid(key, q) {
    const sorters = {
      destaque: (a, b) => a.rank - b.rank,
      novos: (a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0) || a.rank - b.rank,
      menor: (a, b) => a.price - b.price,
      maior: (a, b) => b.price - a.price,
      desconto: (a, b) => off(b) - off(a)
    };
    const [min, max] = facet.price ? facet.price.split('-').map(Number) : [0, Infinity];
    const list = listFor(key, q).filter(p =>
      (!facet.types.length || facet.types.includes(typeOf(p).key)) &&
      (!facet.colors.length || p.colors.some(c => facet.colors.includes(c[0]))) &&
      (!facet.sizes.length || p.sizes.some(s => facet.sizes.includes(s) && !(p.out || []).includes(s))) &&
      p.price >= min && p.price <= max
    ).sort(sorters[facet.sort]);

    $('#countTxt').textContent = `${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
    const chips = [
      ...facet.types.map(v => [`types`, v, TYPES.find(t => t.key === v).name]),
      ...facet.colors.map(v => ['colors', v, v]),
      ...facet.sizes.map(v => ['sizes', v, `Tam. ${v}`]),
      ...(facet.price ? [['price', facet.price, $(`[data-facet="price"][value="${facet.price}"]`)?.parentElement.textContent.trim()]] : [])
    ];
    $('#activeFacets').innerHTML = chips.map(([k, v, l]) => `<button class="chip" data-unfacet="${k}" data-value="${esc(v)}">${esc(l)} ×</button>`).join('');
    $('#grid').innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<div class="empty"><p>Nenhuma peça encontrada${q ? ` para “${esc(q)}”` : ''}.</p><a class="btn btn-dark" href="#/c/todos">Ver toda a coleção</a></div>`;
  }

  // Produto
  const pdp = { id: null, color: 0, size: null, view: 0, qty: 1 };

  pages.product = id => {
    const p = byId(id);
    if (!p) return pages.notfound();
    if (pdp.id !== id) Object.assign(pdp, { id, color: 0, size: p.sizes.length === 1 ? p.sizes[0] : null, view: 0, qty: 1 });
    recent = [id, ...recent.filter(r => r !== id)].slice(0, 10);
    store.set('dg-recent', recent);
    pages.product.title = `${p.name} · DG Club`;
    const t = typeOf(p);
    const fav = favs.includes(p.id);

    const look = LOOKS.find(l => l.items.some(([i]) => i === id));
    const lookItems = look
      ? look.items.filter(([i]) => i !== id).map(([i]) => byId(i))
      : PRODUCTS.filter(o => o.id !== id && o.cat === p.cat && typeOf(o) !== t).slice(0, 3);
    const related = PRODUCTS.filter(o => o.id !== id && o.cat === p.cat && !lookItems.includes(o)).sort((a, b) => a.rank - b.rank).slice(0, 8);
    const seen = recent.filter(r => r !== id).map(byId).slice(0, 8);

    return `
      <section class="page pdp">
        ${crumbs([['Início', '#/'], [CAT_NAME[p.cat], `#/c/${p.cat}`], [t.name, `#/c/t-${t.key}`], [p.name]])}
        <div class="pdp-grid">
          <div class="gallery">
            <div class="thumbs" role="tablist" aria-label="Fotos">
              ${['Frente', 'Detalhe', 'Lateral'].map((l, v) => `<button class="thumb" data-view="${v}" role="tab" aria-label="${l}" style="background:${BG[p.id]}"></button>`).join('')}
            </div>
            <div class="stage" id="stage" style="background:${BG[p.id]}">
              <span class="tags">${p.old ? `<span class="card-tag sale">−${off(p)}%</span>` : ''}${p.novo ? '<span class="card-tag">Novo</span>' : ''}</span>
              <div id="stageArt"></div>
            </div>
          </div>

          <div class="buy">
            <p class="eyebrow">${CAT_NAME[p.cat]} · ${t.name}${p.om ? ' · Old Money' : ''}</p>
            <h1>${esc(p.name)}</h1>
            <p class="ref">Ref. DG-${String(PRODUCTS.indexOf(p) + 101).padStart(4, '0')}</p>
            <div class="buy-price">
              ${p.old ? `<s>${brl(p.old)}</s>` : ''}<strong>${brl(p.price)}</strong>${p.old ? `<span class="pm-off">−${off(p)}%</span>` : ''}
              <small>${brl(p.price * (1 - CONFIG.pix))} no Pix (${CONFIG.pix * 100}% off) · ou ${CONFIG.parcelas}x de ${brl(p.price / CONFIG.parcelas)} sem juros</small>
            </div>

            <div class="opt">
              <span class="label">Cor: <b id="colorName"></b></span>
              <div class="swatches">${p.colors.map((c, i) => `<button style="background:${c[1]}" data-color="${i}" aria-label="${esc(c[0])}"></button>`).join('')}</div>
            </div>

            <div class="opt">
              <div class="label-row"><span class="label">Tamanho</span><a href="#/ajuda/medidas" class="link-small">Guia de medidas</a></div>
              <div class="sizes">${p.sizes.map(s => `<button data-size="${esc(s)}"${(p.out || []).includes(s) ? ' disabled' : ''}>${esc(s)}</button>`).join('')}</div>
              ${p.out?.length ? `<a class="link-small" target="_blank" rel="noopener" href="${waUrl(`Olá! Quero ser avisado quando ${p.name} voltar no tamanho ${p.out.join(', ')}.`)}">Tamanho esgotado? Avise-me pelo WhatsApp</a>` : ''}
              ${p.low ? '<p class="low">Últimas unidades</p>' : ''}
            </div>

            <div class="buy-row">
              <div class="qty big"><button data-pdp-qty="-1" aria-label="Diminuir">−</button><span id="pdpQty">${pdp.qty}</span><button data-pdp-qty="1" aria-label="Aumentar">+</button></div>
              <button class="btn btn-dark grow" data-add>Adicionar à sacola</button>
              <button class="icon-btn boxed fav${fav ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritar">${icon.heart}</button>
            </div>
            <button class="btn btn-ghost full" data-buy-now>Comprar agora</button>
            <p class="err" id="pdpErr" role="alert"></p>

            <form class="cep" data-cep>
              <label for="cepPdp">${icon.truck} Calcular frete e prazo</label>
              <div class="cep-row"><input id="cepPdp" inputmode="numeric" maxlength="9" placeholder="00000-000" autocomplete="postal-code"><button class="btn btn-ghost" type="submit">Calcular</button></div>
              <div class="cep-out" id="cepOut"></div>
            </form>

            <p class="desc">${esc(p.desc)}</p>
            <details open><summary>Detalhes</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
            <details><summary>Composição e cuidados</summary><p>${esc(p.care)}</p></details>
            <details><summary>Envio e trocas</summary><p>Postagem em até 2 dias úteis. Frete grátis acima de ${brl(CONFIG.freteGratis)}. Primeira troca grátis em até 30 dias, com etiqueta.</p></details>
          </div>
        </div>
      </section>

      ${lookItems.length ? `
      <section class="complete">
        <div class="rail-head"><h2>${look ? `Complete o look ${esc(look.name)}` : 'Combine com'}</h2>${look ? `<a class="link-arrow" href="#/old-money">Ver todos os looks</a>` : ''}</div>
        <div class="mini-list">
          ${lookItems.map(o => `
            <div class="mini">
              <a href="#/p/${o.id}" class="mini-art" style="background:${BG[o.id]}">${svg(o.shape, o.colors[0][1])}</a>
              <div><a href="#/p/${o.id}" class="mini-name">${esc(o.name)}</a>${priceHTML(o)}</div>
              <button class="btn btn-ghost sm" data-quick="${o.id}">Adicionar</button>
            </div>`).join('')}
        </div>
      </section>` : ''}

      ${railHTML('Você também pode gostar', related)}
      ${railHTML('Vistos recentemente', seen)}`;
  };
  pages.product.after = () => paintPdp();

  function paintPdp() {
    const p = byId(pdp.id);
    if (!p || !$('#stageArt')) return;
    const [name, hex] = p.colors[pdp.color];
    $('#stageArt').innerHTML = svg(p.shape, hex, pdp.view);
    $('#colorName').textContent = name;
    $$('.thumb').forEach((b, v) => {
      b.innerHTML = svg(p.shape, hex, v);
      b.classList.toggle('sel', v === pdp.view);
      b.setAttribute('aria-selected', v === pdp.view);
    });
    $$('[data-color]').forEach((b, i) => { b.classList.toggle('sel', i === pdp.color); b.setAttribute('aria-pressed', i === pdp.color); });
    $$('[data-size]').forEach(b => { const on = b.dataset.size === pdp.size; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
    $('#pdpQty').textContent = pdp.qty;
  }

  // Old Money
  pages.oldmoney = () => {
    const items = PRODUCTS.filter(p => p.om).sort((a, b) => a.rank - b.rank);
    return `
      <section class="om-hero">
        <div class="om-hero-copy">
          <p class="eyebrow light">Coleção</p>
          <h1>Old Money</h1>
          <p>Riqueza discreta não se anuncia. Ela aparece no caimento de uma oxford, no peso de um cashmere, na camurça gasta de um mocassim herdado. Esta é a nossa leitura do guarda-roupa de quem nunca precisou provar nada.</p>
        </div>
        <div class="om-hero-art" aria-hidden="true">${svg('blazer', '#f7f8fa')}${svg('camisa', '#a9c3e6')}</div>
      </section>

      <section class="page looks">
        <header class="page-head center"><p class="eyebrow">Quatro looks completos</p><h2>Compre o look</h2></header>
        <div class="look-grid">
          ${LOOKS.map(l => {
            const total = l.items.reduce((n, [id]) => n + byId(id).price, 0);
            return `
            <article class="look${l.dark ? ' dark' : ''}">
              <div class="look-art" style="background:${l.bg}">
                ${l.items.map(([id, c], k) => `<a href="#/p/${id}" class="look-piece p${k}" aria-label="${esc(byId(id).name)}">${svg(byId(id).shape, byId(id).colors[c][1])}</a>`).join('')}
              </div>
              <div class="look-info">
                <div><h3>${l.name}</h3><p class="muted">${l.place} · ${l.items.length} peças</p></div>
                <div class="look-buy"><span>${brl(total)}</span><button class="btn btn-dark sm" data-look="${l.id}">Comprar o look</button></div>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>

      <section class="page">
        <header class="page-head"><h2>Todas as peças Old Money</h2><p class="muted">${items.length} peças</p></header>
        <div class="grid">${items.map(cardHTML).join('')}</div>
      </section>`;
  };
  pages.oldmoney.title = 'Coleção Old Money · DG Club';

  // Favoritos
  pages.favorites = () => {
    const list = favs.map(byId);
    return `
      <section class="page">
        ${crumbs([['Início', '#/'], ['Favoritos']])}
        <header class="page-head"><h1>Favoritos</h1><p class="muted">${list.length} ${list.length === 1 ? 'peça salva' : 'peças salvas'}</p></header>
        ${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>`
        : `<div class="empty"><p>Você ainda não salvou nenhuma peça. Toque no coração de um produto para guardar aqui.</p><a class="btn btn-dark" href="#/c/todos">Explorar a coleção</a></div>`}
      </section>`;
  };
  pages.favorites.title = 'Favoritos · DG Club';

  // Checkout
  const co = { ship: null, shipOpts: null, pay: 'pix', parcelas: 1 };

  pages.checkout = () => {
    if (!cart.length) {
      return `<section class="page"><div class="empty"><p>Sua sacola está vazia.</p><a class="btn btn-dark" href="#/c/todos">Ver a coleção</a></div></section>`;
    }
    const a = account || {};
    const addr = store.get('dg-address', {});
    return `
      <section class="page checkout">
        ${crumbs([['Início', '#/'], ['Sacola', '#/sacola'], ['Finalizar compra']])}
        <header class="page-head"><h1>Finalizar compra</h1></header>
        <form class="co-grid" id="coForm" novalidate>
          <div class="co-steps">
            <fieldset class="co-step">
              <legend><span>1</span> Identificação</legend>
              <div class="fields">
                <label class="field full"><span>Nome completo</span><input id="coNome" name="nome" required autocomplete="name" value="${esc(a.nome || '')}"></label>
                <label class="field"><span>E-mail</span><input id="coEmail" name="email" type="email" required autocomplete="email" value="${esc(a.email || '')}"></label>
                <label class="field"><span>Celular com DDD</span><input id="coCel" name="cel" inputmode="tel" required autocomplete="tel" placeholder="(11) 99999-9999" value="${esc(a.cel || '')}"></label>
                <label class="field"><span>CPF <em>(para a nota fiscal)</em></span><input id="coCpf" name="cpf" inputmode="numeric" placeholder="000.000.000-00" value="${esc(a.cpf || '')}"></label>
              </div>
            </fieldset>

            <fieldset class="co-step">
              <legend><span>2</span> Entrega</legend>
              <div class="fields">
                <label class="field"><span>CEP</span><input id="coCep" name="cep" inputmode="numeric" maxlength="9" required autocomplete="postal-code" placeholder="00000-000" value="${esc(addr.cep || '')}"></label>
                <p class="field hint" id="cepHint">Digite o CEP para ver as opções de entrega.</p>
                <label class="field full"><span>Endereço</span><input id="coRua" name="rua" required autocomplete="address-line1" value="${esc(addr.rua || '')}"></label>
                <label class="field"><span>Número</span><input id="coNum" name="num" required value="${esc(addr.num || '')}"></label>
                <label class="field"><span>Complemento</span><input id="coComp" name="comp" value="${esc(addr.comp || '')}"></label>
                <label class="field"><span>Bairro</span><input id="coBairro" name="bairro" required value="${esc(addr.bairro || '')}"></label>
                <label class="field"><span>Cidade</span><input id="coCidade" name="cidade" required autocomplete="address-level2" value="${esc(addr.cidade || '')}"></label>
                <label class="field sm"><span>UF</span><input id="coUf" name="uf" required maxlength="2" autocomplete="address-level1" value="${esc(addr.uf || '')}"></label>
              </div>
              <div class="ship-opts" id="shipOpts"></div>
            </fieldset>

            <fieldset class="co-step">
              <legend><span>3</span> Pagamento</legend>
              <div class="pay-opts">
                <label class="pay-opt"><input type="radio" name="pay" value="pix"${co.pay === 'pix' ? ' checked' : ''}><span><b>Pix</b><small>${CONFIG.pix * 100}% de desconto. Enviamos a chave pelo WhatsApp.</small></span></label>
                <label class="pay-opt"><input type="radio" name="pay" value="cartao"${co.pay === 'cartao' ? ' checked' : ''}><span><b>Cartão de crédito</b><small>Até ${CONFIG.parcelas}x sem juros. Enviamos o link de pagamento seguro.</small></span></label>
                <label class="pay-opt"><input type="radio" name="pay" value="boleto"${co.pay === 'boleto' ? ' checked' : ''}><span><b>Boleto</b><small>Vencimento em 2 dias úteis.</small></span></label>
              </div>
              <label class="field" id="parcWrap"${co.pay === 'cartao' ? '' : ' hidden'}><span>Parcelas</span><select id="coParc"></select></label>
            </fieldset>
          </div>

          <aside class="co-summary">
            <h2>Resumo</h2>
            <ul class="co-items">${cart.map(i => {
              const p = byId(i.id);
              return `<li><span class="co-thumb" style="background:${BG[p.id]}">${svg(p.shape, p.colors[i.color][1])}<b>${i.qty}</b></span>
                <span><span class="co-name">${esc(p.name)}</span><small>${esc(p.colors[i.color][0])} · ${esc(i.size)}</small></span>
                <span>${brl(p.price * i.qty)}</span></li>`;
            }).join('')}</ul>
            <div class="coupon">
              <label class="sr-only" for="coCupom">Cupom</label>
              <input id="coCupom" placeholder="Cupom de desconto" value="${esc(coupon)}">
              <button class="btn btn-ghost sm" type="button" data-coupon="#coCupom">Aplicar</button>
            </div>
            <div class="co-totals" id="coTotals"></div>
            <button class="btn btn-dark full" type="submit">Finalizar pedido</button>
            <p class="muted small">O pedido é confirmado pelo WhatsApp da loja, onde você recebe o link ou a chave de pagamento.</p>
          </aside>
        </form>
      </section>`;
  };
  pages.checkout.title = 'Finalizar compra · DG Club';
  pages.checkout.after = () => {
    if (!cart.length) return;
    const cep = $('#coCep');
    if (cep.value) onCheckoutCep(false);
    renderCheckoutTotals();
  };

  function maskCep(el) {
    const d = el.value.replace(/\D/g, '').slice(0, 8);
    el.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    return d;
  }

  async function onCheckoutCep(lookup = true) {
    const d = maskCep($('#coCep'));
    const { base } = totals();
    co.shipOpts = freteOptions(d, base);
    if (!co.shipOpts) { co.ship = null; $('#shipOpts').innerHTML = ''; renderCheckoutTotals(); return; }
    if (!co.ship || !co.shipOpts.find(o => o.id === co.ship.id)) co.ship = co.shipOpts[0];
    else co.ship = co.shipOpts.find(o => o.id === co.ship.id);
    $('#shipOpts').innerHTML = co.shipOpts.map(o => `
      <label class="pay-opt"><input type="radio" name="ship" value="${o.id}"${co.ship.id === o.id ? ' checked' : ''}>
        <span><b>${o.name}</b><small>${o.days} dias úteis</small></span><strong>${o.price ? brl(o.price) : 'Grátis'}</strong></label>`).join('');
    renderCheckoutTotals();
    if (!lookup) return;
    $('#cepHint').textContent = 'Buscando endereço…';
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) throw new Error('CEP não encontrado');
      $('#coRua').value = j.logradouro || $('#coRua').value;
      $('#coBairro').value = j.bairro || $('#coBairro').value;
      $('#coCidade').value = j.localidade || '';
      $('#coUf').value = j.uf || '';
      $('#cepHint').textContent = `${j.localidade} · ${j.uf}`;
      $('#coNum').focus();
    } catch {
      $('#cepHint').textContent = 'Não encontramos o endereço automaticamente. Preencha os campos abaixo.';
    }
  }

  function renderCheckoutTotals() {
    const box = $('#coTotals');
    if (!box) return;
    const t = totals({ ship: co.ship, pay: co.pay });
    const parc = $('#coParc');
    if (parc) {
      const cur = co.parcelas;
      parc.innerHTML = Array.from({ length: CONFIG.parcelas }, (_, k) => k + 1)
        .map(n => `<option value="${n}"${n === cur ? ' selected' : ''}>${n}x de ${brl(t.total / n)} sem juros</option>`).join('');
    }
    box.innerHTML = `
      <div class="row"><span>Subtotal</span><span>${brl(t.subtotal)}</span></div>
      ${t.kit ? `<div class="row disc"><span>Kit ${CONFIG.kitQtd} peças (−${CONFIG.kitDesc * 100}%)</span><span>− ${brl(t.kit)}</span></div>` : ''}
      ${t.cupom ? `<div class="row disc"><span>Cupom ${esc(coupon)}</span><span>− ${brl(t.cupom)}</span></div>` : ''}
      ${t.pix ? `<div class="row disc"><span>Desconto Pix (−${CONFIG.pix * 100}%)</span><span>− ${brl(t.pix)}</span></div>` : ''}
      <div class="row"><span>Frete</span><span>${co.ship ? (co.ship.price ? brl(co.ship.price) : 'Grátis') : 'Informe o CEP'}</span></div>
      <div class="row total"><span>Total</span><strong>${brl(t.total)}</strong></div>`;
  }

  function submitCheckout(form) {
    const req = ['coNome', 'coEmail', 'coCel', 'coCep', 'coRua', 'coNum', 'coBairro', 'coCidade', 'coUf'];
    let bad = null;
    req.forEach(id => {
      const el = $(`#${id}`);
      const ok = el.value.trim() && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
      el.closest('.field').classList.toggle('invalid', !ok);
      if (!ok && !bad) bad = el;
    });
    if (bad) { bad.focus(); toast('Preencha os campos destacados.'); return; }
    if (!co.ship) { $('#coCep').focus(); toast('Informe um CEP válido para calcular o frete.'); return; }

    const v = id => $(`#${id}`).value.trim();
    account = { ...(account || {}), nome: v('coNome'), email: v('coEmail'), cel: v('coCel'), cpf: v('coCpf') };
    store.set('dg-account', account);
    const address = { cep: v('coCep'), rua: v('coRua'), num: v('coNum'), comp: v('coComp'), bairro: v('coBairro'), cidade: v('coCidade'), uf: v('coUf').toUpperCase() };
    store.set('dg-address', address);

    const t = totals({ ship: co.ship, pay: co.pay });
    const now = new Date();
    const order = {
      num: `DG${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      date: now.toISOString(),
      items: cart.map(i => ({ ...i, name: byId(i.id).name, colorName: byId(i.id).colors[i.color][0], price: byId(i.id).price })),
      address, ship: co.ship, pay: co.pay, parcelas: co.pay === 'cartao' ? co.parcelas : 1, coupon, totals: t,
      cliente: { nome: account.nome, email: account.email, cel: account.cel, cpf: account.cpf }
    };
    orders = [order, ...orders];
    store.set('dg-orders', orders);
    cart = [];
    coupon = '';
    store.set('dg-coupon', '');
    saveCart();
    location.hash = `#/pedido/${order.num}`;
  }

  function orderMessage(o) {
    const pay = { pix: 'Pix', cartao: `Cartão de crédito em ${o.parcelas}x`, boleto: 'Boleto' }[o.pay];
    const t = o.totals;
    const a = o.address;
    return [
      `Olá, DG Club! Acabei de fazer o pedido ${o.num} pelo site.`,
      '',
      ...o.items.map(i => `• ${i.qty}x ${i.name} (${i.colorName}, ${i.size}) — ${brl(i.price * i.qty)}`),
      '',
      `Subtotal: ${brl(t.subtotal)}`,
      t.kit ? `Kit ${CONFIG.kitQtd} peças: − ${brl(t.kit)}` : '',
      t.cupom ? `Cupom ${o.coupon}: − ${brl(t.cupom)}` : '',
      t.pix ? `Desconto Pix: − ${brl(t.pix)}` : '',
      `Frete (${o.ship.name}): ${o.ship.price ? brl(o.ship.price) : 'grátis'}`,
      `Total: ${brl(t.total)}`,
      `Pagamento: ${pay}`,
      '',
      `Nome: ${o.cliente.nome}`,
      `Celular: ${o.cliente.cel}`,
      `E-mail: ${o.cliente.email}`,
      o.cliente.cpf ? `CPF: ${o.cliente.cpf}` : '',
      `Entrega: ${a.rua}, ${a.num}${a.comp ? ` (${a.comp})` : ''}, ${a.bairro}, ${a.cidade}/${a.uf}, CEP ${a.cep}`
    ].filter(l => l !== '').join('\n');
  }

  pages.order = num => {
    const o = orders.find(x => x.num === num);
    if (!o) return pages.notfound();
    return `
      <section class="page order">
        <div class="order-card">
          <p class="eyebrow">Pedido ${esc(o.num)}</p>
          <h1>Pedido registrado, ${esc(o.cliente.nome.split(' ')[0])}.</h1>
          <p>Último passo: envie o pedido pelo WhatsApp. A loja confirma o estoque e manda ${o.pay === 'pix' ? 'a chave Pix' : o.pay === 'cartao' ? 'o link de pagamento' : 'o boleto'} por lá.</p>
          <a class="btn btn-dark" href="${waUrl(orderMessage(o))}" target="_blank" rel="noopener">Enviar pedido pelo WhatsApp</a>
          <div class="order-sum">
            ${o.items.map(i => `<div class="row"><span>${i.qty}x ${esc(i.name)} <small>${esc(i.colorName)} · ${esc(i.size)}</small></span><span>${brl(i.price * i.qty)}</span></div>`).join('')}
            <div class="row"><span>Frete · ${esc(o.ship.name)}</span><span>${o.ship.price ? brl(o.ship.price) : 'Grátis'}</span></div>
            <div class="row total"><span>Total</span><strong>${brl(o.totals.total)}</strong></div>
          </div>
          <p class="muted small">Entrega em ${esc(o.address.rua)}, ${esc(o.address.num)} · ${esc(o.address.cidade)}/${esc(o.address.uf)} · prazo de ${esc(o.ship.days)} dias úteis após o pagamento.</p>
          <a class="link-arrow" href="#/c/todos">Continuar comprando</a>
        </div>
      </section>`;
  };
  pages.order.title = 'Pedido registrado · DG Club';

  // Conta
  const tierOf = spent => (spent >= 3000 ? ['Sócio Fundador', null] : spent >= 1000 ? ['Sócio', 3000] : ['Membro', 1000]);

  pages.account = () => {
    if (!account?.email) {
      return `
        <section class="page narrow">
          ${crumbs([['Início', '#/'], ['Minha conta']])}
          <header class="page-head"><h1>Minha conta</h1><p class="muted">Entre com seu nome e e-mail para acompanhar pedidos e benefícios do clube.</p></header>
          <form class="account-form" data-account>
            <label class="field full"><span>Nome</span><input id="accNome" required autocomplete="name"></label>
            <label class="field full"><span>E-mail</span><input id="accEmail" type="email" required autocomplete="email"></label>
            <button class="btn btn-dark full" type="submit">Entrar</button>
            <p class="muted small">Seus dados ficam guardados neste aparelho.</p>
          </form>
        </section>`;
    }
    const spent = orders.reduce((n, o) => n + o.totals.total, 0);
    const [tier, next] = tierOf(spent);
    return `
      <section class="page">
        ${crumbs([['Início', '#/'], ['Minha conta']])}
        <header class="page-head"><h1>Olá, ${esc(account.nome.split(' ')[0])}</h1><p class="muted">${esc(account.email)}</p></header>
        <div class="acc-grid">
          <div class="member-card">
            <span class="crest-sm">DG</span>
            <p class="eyebrow light">Nível no clube</p>
            <h2>${tier}</h2>
            <p>${next ? `Faltam ${brl(next - spent)} em compras para o próximo nível.` : 'Você está no nível mais alto do clube.'}</p>
            <div class="ship-track light"><div class="ship-fill" style="width:${next ? Math.min(100, spent / next * 100) : 100}%"></div></div>
            <a href="#/clube" class="link-arrow light">Ver benefícios</a>
          </div>
          <div class="acc-orders">
            <h2>Meus pedidos</h2>
            ${orders.length ? orders.map(o => `
              <a class="acc-order" href="#/pedido/${o.num}">
                <span><b>${o.num}</b><small>${new Date(o.date).toLocaleDateString('pt-BR')} · ${o.items.reduce((n, i) => n + i.qty, 0)} peças</small></span>
                <span>${brl(o.totals.total)}</span>
              </a>`).join('') : '<p class="muted">Nenhum pedido ainda.</p>'}
            <div class="acc-links">
              <a class="btn btn-ghost" href="#/favoritos">Favoritos (${favs.length})</a>
              <button class="btn btn-ghost" data-logout>Sair</button>
            </div>
          </div>
        </div>
      </section>`;
  };
  pages.account.title = 'Minha conta · DG Club';

  // O Clube
  pages.club = () => `
    <section class="editorial big">
      <div class="editorial-art tone-navy" aria-hidden="true"><span class="monogram">DG</span></div>
      <div class="editorial-copy">
        <p class="eyebrow">O Clube</p>
        <h1>Discreto é o novo<br><em>sofisticado.</em></h1>
        <p>O DG Club nasceu da ideia de que elegância é silenciosa. Produzimos pouco, com cuidado, e cada cliente faz parte do clube desde a primeira compra.</p>
      </div>
    </section>
    <section class="page">
      <header class="page-head center"><p class="eyebrow">Benefícios</p><h2>Três níveis de membro</h2></header>
      <div class="tiers">
        <article><h3>Membro</h3><p class="muted">A partir da primeira compra</p><ul><li>Acesso à lista privada</li><li>Primeira troca grátis</li><li>Presente de aniversário</li></ul></article>
        <article class="hl"><h3>Sócio</h3><p class="muted">A partir de ${brl(1000)} em compras</p><ul><li>Tudo do nível Membro</li><li>Acesso 48 h antes aos drops</li><li>Frete grátis em qualquer valor</li></ul></article>
        <article><h3>Sócio Fundador</h3><p class="muted">A partir de ${brl(3000)} em compras</p><ul><li>Tudo do nível Sócio</li><li>Ajustes de alfaiataria grátis</li><li>Convites para eventos do clube</li></ul></article>
      </div>
    </section>
    <section class="atelier">
      <header class="page-head center"><p class="eyebrow">Atelier</p><h2>Como trabalhamos</h2></header>
      <div class="steps">
        <article><span class="num">I</span><h3>Seleção de matéria-prima</h3><p>Fios e tecidos escolhidos pelo toque, gramatura e durabilidade.</p></article>
        <article><span class="num">II</span><h3>Modelagem própria</h3><p>Cada peça passa por provas até o caimento ficar exato: ombro no lugar, comprimento na medida.</p></article>
        <article><span class="num">III</span><h3>Tiragem limitada</h3><p>Produzimos pouco. Quando acaba, acaba, e volta só se valer a pena.</p></article>
      </div>
    </section>`;
  pages.club.title = 'O Clube · DG Club';

  // Ajuda
  const HELP = {
    faq: ['Perguntas frequentes', `
      ${[
        ['Como faço meu pedido?', 'Escolha as peças, finalize a compra no site e envie o pedido pelo WhatsApp. A loja confirma o estoque e envia o pagamento por lá.'],
        ['Quais formas de pagamento?', `Pix com ${CONFIG.pix * 100}% de desconto, cartão de crédito em até ${CONFIG.parcelas}x sem juros e boleto.`],
        ['Qual o prazo de entrega?', 'Postamos em até 2 dias úteis após a confirmação do pagamento. O prazo do transporte depende da região e aparece no checkout.'],
        ['Como funciona o desconto do kit?', `Com ${CONFIG.kitQtd} peças ou mais na sacola, ${CONFIG.kitDesc * 100}% de desconto entra automaticamente.`],
        ['Posso trocar o tamanho?', 'Sim. A primeira troca é grátis em até 30 dias, com a peça sem uso e com etiqueta.'],
        ['Vocês têm loja física?', 'Atendemos online e com hora marcada. Chame no WhatsApp para agendar.']
      ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}`],
    medidas: ['Guia de medidas', `
      <p>Medidas da peça em centímetros. Na dúvida entre dois tamanhos, chame no WhatsApp que a gente ajuda.</p>
      <h3>Camisas, polos e tricots</h3>
      <div class="table-wrap"><table><thead><tr><th>Tam.</th><th>Tórax</th><th>Ombro</th><th>Comprimento</th></tr></thead>
      <tbody><tr><td>PP</td><td>94</td><td>40</td><td>68</td></tr><tr><td>P</td><td>100</td><td>43</td><td>72</td></tr><tr><td>M</td><td>106</td><td>45</td><td>74</td></tr><tr><td>G</td><td>112</td><td>47</td><td>76</td></tr><tr><td>GG</td><td>118</td><td>49</td><td>78</td></tr></tbody></table></div>
      <h3>Calças e bermudas</h3>
      <div class="table-wrap"><table><thead><tr><th>Tam.</th><th>Cintura</th><th>Quadril</th><th>Entrepernas</th></tr></thead>
      <tbody><tr><td>36</td><td>72</td><td>94</td><td>80</td></tr><tr><td>38</td><td>76</td><td>98</td><td>81</td></tr><tr><td>40</td><td>80</td><td>102</td><td>82</td></tr><tr><td>42</td><td>84</td><td>106</td><td>83</td></tr><tr><td>44</td><td>88</td><td>110</td><td>84</td></tr><tr><td>46</td><td>92</td><td>114</td><td>85</td></tr></tbody></table></div>
      <h3>Blazers</h3>
      <div class="table-wrap"><table><thead><tr><th>Tam.</th><th>Tórax</th><th>Manga</th></tr></thead>
      <tbody><tr><td>46</td><td>92</td><td>62</td></tr><tr><td>48</td><td>96</td><td>63</td></tr><tr><td>50</td><td>100</td><td>64</td></tr><tr><td>52</td><td>104</td><td>65</td></tr><tr><td>54</td><td>108</td><td>66</td></tr></tbody></table></div>`],
    trocas: ['Trocas e devoluções', `
      <p>A primeira troca é por nossa conta em até 30 dias após o recebimento. A peça precisa estar sem uso, sem lavagem e com etiqueta.</p>
      <p>Devolução por arrependimento em até 7 dias corridos, com reembolso integral no mesmo meio de pagamento.</p>
      <p>Para solicitar, chame no WhatsApp com o número do pedido.</p>`],
    envio: ['Envio e prazos', `
      <p>Postamos em até 2 dias úteis após a confirmação do pagamento, com código de rastreio. Frete grátis na entrega normal acima de ${brl(CONFIG.freteGratis)}.</p>
      <div class="table-wrap"><table><thead><tr><th>Região (CEP)</th><th>Normal</th><th>Expressa</th></tr></thead>
      <tbody><tr><td>São Paulo (0 e 1)</td><td>3 a 5 dias</td><td>1 a 2 dias</td></tr><tr><td>RJ, ES e MG (2 e 3)</td><td>4 a 7 dias</td><td>2 a 3 dias</td></tr>
      <tr><td>Norte e Nordeste (4 a 6)</td><td>7 a 12 dias</td><td>3 a 5 dias</td></tr><tr><td>Centro-Oeste e Sul (7 a 9)</td><td>5 a 8 dias</td><td>2 a 4 dias</td></tr></tbody></table></div>`],
    pagamento: ['Pagamento', `
      <p><b>Pix:</b> ${CONFIG.pix * 100}% de desconto sobre o valor dos produtos.</p>
      <p><b>Cartão de crédito:</b> até ${CONFIG.parcelas}x sem juros. Visa, Mastercard, Elo e Amex.</p>
      <p><b>Boleto:</b> vencimento em 2 dias úteis. O pedido é postado após a compensação.</p>
      <p><b>Cupons e kit:</b> o desconto de ${CONFIG.kitDesc * 100}% do kit soma com cupom e Pix.</p>`],
    contato: ['Contato', `
      <p>Atendimento de segunda a sábado, das 9h às 19h.</p>
      <p><b>WhatsApp:</b> <a class="wa-link" href="#" target="_blank" rel="noopener">abrir conversa</a></p>
      <p><b>Instagram:</b> <a href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">@${CONFIG.instagram}</a></p>
      <p><b>E-mail:</b> ${esc(CONFIG.email)}</p>`],
    privacidade: ['Privacidade', `
      <p>Este site guarda sacola, favoritos, conta e pedidos apenas no seu navegador. Os dados do pedido só saem dele quando você envia a mensagem pelo WhatsApp.</p>
      <p>A busca de endereço pelo CEP consulta o serviço público ViaCEP.</p>`]
  };

  pages.help = (topic = 'faq') => {
    const [title, body] = HELP[topic] || HELP.faq;
    pages.help.title = `${title} · DG Club`;
    return `
      <section class="page">
        ${crumbs([['Início', '#/'], ['Ajuda', '#/ajuda/faq'], [title]])}
        <div class="help">
          <nav class="help-nav" aria-label="Ajuda">${Object.entries(HELP).map(([k, [t]]) => `<a href="#/ajuda/${k}"${k === topic ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
          <article class="help-body"><h1>${title}</h1>${body}</article>
        </div>
      </section>`;
  };

  pages.notfound = () => `<section class="page"><div class="empty"><p>Página não encontrada.</p><a class="btn btn-dark" href="#/">Voltar ao início</a></div></section>`;
  pages.notfound.title = 'Página não encontrada · DG Club';

  // ---------- Roteador ----------
  let sliderTimer;
  function route() {
    clearInterval(sliderTimer);
    closeAll(false);
    hideMega();
    const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    const [r, a = ''] = parts;
    let page; let args = [];
    if (!r) page = pages.home;
    else if (r === 'c') { page = pages.catalog; args = [a || 'todos']; }
    else if (r === 'busca') { page = pages.catalog; args = ['busca', a]; }
    else if (r === 'p') { page = pages.product; args = [a]; }
    else if (r === 'old-money') page = pages.oldmoney;
    else if (r === 'favoritos') page = pages.favorites;
    else if (r === 'checkout') page = pages.checkout;
    else if (r === 'sacola') { location.replace('#/checkout'); return; }
    else if (r === 'pedido') { page = pages.order; args = [a]; }
    else if (r === 'conta') page = pages.account;
    else if (r === 'clube') page = pages.club;
    else if (r === 'ajuda') { page = pages.help; args = [a || 'faq']; }
    else page = pages.notfound;

    $('#app').innerHTML = page(...args);
    document.title = page.title || 'DG Club';
    page.after?.(...args);
    const name = { '': 'home', c: 'catalog', busca: 'catalog', p: 'product', 'old-money': 'oldmoney', clube: 'club', checkout: 'checkout', pedido: 'order', conta: 'account' }[r || ''] || 'other';
    M()?.page(name);
    $$('.wa-link', $('#app')).forEach(el => { el.href = waUrl('Olá, DG Club! Vim pelo site.'); });
    $$('#mainNav a').forEach(el => el.classList.toggle('current', location.hash.startsWith(el.getAttribute('href'))));
    document.body.classList.toggle('on-checkout', r === 'checkout');
    window.scrollTo(0, 0);
  }

  // ---------- Banner rotativo ----------
  function initSlider() {
    const slides = $$('.slide');
    if (!slides.length) return;
    let cur = 0;
    slides.forEach(sl => { $('.slide-art', sl).innerHTML = svg(sl.dataset.shape, sl.dataset.fill); });
    $('.slide-dots').innerHTML = slides.map((_, i) => `<button aria-label="Banner ${i + 1}"></button>`).join('');
    const dots = $$('.slide-dots button');
    const go = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((sl, k) => { sl.classList.toggle('on', k === cur); sl.setAttribute('aria-hidden', k !== cur); });
      dots.forEach((d, k) => d.classList.toggle('on', k === cur));
      M()?.slide(slides[cur]);
      clearInterval(sliderTimer);
      sliderTimer = setInterval(() => go(cur + 1), 6000);
    };
    $('.slide-nav.prev').onclick = () => go(cur - 1);
    $('.slide-nav.next').onclick = () => go(cur + 1);
    dots.forEach((d, k) => { d.onclick = () => go(k); });
    let x0 = null;
    const box = $('.slider');
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    go(0);
  }

  // ---------- Cabeçalho: avisos, menu grande, busca ----------
  function initAnnounce() {
    const items = $$('.ann');
    let i = 0;
    setInterval(() => {
      items[i].classList.remove('on');
      i = (i + 1) % items.length;
      items[i].classList.add('on');
    }, 3500);
  }

  function megaHTML(key) {
    if (key === 'novidades') {
      const news = PRODUCTS.filter(p => p.novo);
      return `<div class="mega-in"><div class="mega-col"><h4>Novidades</h4>${news.map(p => `<a href="#/p/${p.id}">${esc(p.name)}</a>`).join('')}<a href="#/c/novidades" class="strong">Ver todas</a></div>
        ${news.slice(0, 3).map(p => `<a class="mega-feat" href="#/p/${p.id}"><span style="background:${BG[p.id]}">${svg(p.shape, p.colors[0][1])}</span><b>${esc(p.name)}</b><small>${brl(p.price)}</small></a>`).join('')}</div>`;
    }
    const items = PRODUCTS.filter(p => p.cat === key);
    const types = TYPES.filter(t => items.some(p => t.shapes.includes(p.shape)));
    const feat = items.slice().sort((a, b) => a.rank - b.rank).slice(0, 2);
    return `<div class="mega-in">
      <div class="mega-col"><h4>Categorias</h4>${types.map(t => `<a href="#/c/t-${t.key}">${t.name}</a>`).join('')}<a href="#/c/${key}" class="strong">Ver tudo</a></div>
      <div class="mega-col"><h4>Destaques</h4><a href="#/c/novidades">Novidades</a><a href="#/old-money">Coleção Old Money</a><a href="#/c/sale">Sale</a><a href="#/ajuda/medidas">Guia de medidas</a></div>
      ${feat.map(p => `<a class="mega-feat" href="#/p/${p.id}"><span style="background:${BG[p.id]}">${svg(p.shape, p.colors[0][1])}</span><b>${esc(p.name)}</b><small>${brl(p.price)}</small></a>`).join('')}
    </div>`;
  }
  let megaKey = null;
  function showMega(key) {
    if (megaKey === key) return;
    megaKey = key;
    $('#mega').innerHTML = megaHTML(key);
    $('#mega').hidden = false;
    M()?.mega();
  }
  function hideMega() { megaKey = null; $('#mega').hidden = true; }

  function drawerNav() {
    const sub = cat => TYPES.filter(t => PRODUCTS.some(p => p.cat === cat && t.shapes.includes(p.shape)))
      .map(t => `<a href="#/c/t-${t.key}">${t.name}</a>`).join('');
    $('#drawerNav').innerHTML = `
      <a href="#/c/novidades" class="big">Novidades</a>
      <details><summary class="big">Masculino</summary><div class="sub"><a href="#/c/masculino">Ver tudo</a>${sub('masculino')}</div></details>
      <details><summary class="big">Feminino</summary><div class="sub"><a href="#/c/feminino">Ver tudo</a>${sub('feminino')}</div></details>
      <details><summary class="big">Acessórios</summary><div class="sub"><a href="#/c/acessorios">Ver tudo</a>${sub('acessorios')}</div></details>
      <a href="#/old-money" class="big">Old Money</a>
      <a href="#/c/sale" class="big sale">Sale</a>
      <div class="drawer-links">
        <a href="#/conta">Minha conta</a><a href="#/favoritos">Favoritos</a><a href="#/clube">O Clube</a><a href="#/ajuda/faq">Ajuda</a>
      </div>`;
  }

  function toggleSearch(show) {
    $('#searchbar').hidden = !show;
    if (show) { hideMega(); $('#q').focus(); }
  }
  function renderSuggest(q) {
    const box = $('#suggest');
    if (!q) { box.hidden = true; return; }
    const list = listFor('busca', q).slice(0, 5);
    box.hidden = false;
    box.innerHTML = list.length
      ? list.map(p => `<a href="#/p/${p.id}" class="sg"><span style="background:${BG[p.id]}">${svg(p.shape, p.colors[0][1])}</span><b>${esc(p.name)}</b><small>${brl(p.price)}</small></a>`).join('') +
        `<a class="sg-all" href="#/busca/${encodeURIComponent(q)}">Ver todos os resultados</a>`
      : '<p class="muted">Nenhuma peça encontrada.</p>';
  }

  // ---------- Painéis ----------
  let lastFocus = null;
  function open(id) {
    closeAll(false);
    lastFocus = document.activeElement;
    const el = document.getElementById(id);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('on');
    document.body.classList.add('locked');
    M()?.drawer(id);
    const f = el.querySelector('input, button:not([data-close]), a, select');
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
  }
  function closeAll(restore = true) {
    $$('.drawer.open, .modal.open').forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); });
    $('#scrim').classList.remove('on');
    document.body.classList.remove('locked');
    if (restore && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  // ---------- Compra rápida e looks ----------
  const quick = { id: null, color: 0, size: null };
  function openQuick(id) {
    const p = byId(id);
    Object.assign(quick, { id, color: 0, size: p.sizes.length === 1 ? p.sizes[0] : null });
    paintQuick();
    open('quick');
  }
  function paintQuick() {
    const p = byId(quick.id);
    $('#quickBody').innerHTML = `
      <div class="quick-grid">
        <div class="quick-art" style="background:${BG[p.id]}">${svg(p.shape, p.colors[quick.color][1])}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          ${priceHTML(p)}
          <span class="label">Cor: <b>${esc(p.colors[quick.color][0])}</b></span>
          <div class="swatches">${p.colors.map((c, i) => `<button style="background:${c[1]}" data-qcolor="${i}" class="${i === quick.color ? 'sel' : ''}" aria-label="${esc(c[0])}"></button>`).join('')}</div>
          <span class="label">Tamanho</span>
          <div class="sizes">${p.sizes.map(s => `<button data-qsize="${esc(s)}" class="${s === quick.size ? 'sel' : ''}"${(p.out || []).includes(s) ? ' disabled' : ''}>${esc(s)}</button>`).join('')}</div>
          <p class="err" id="quickErr"></p>
          <button class="btn btn-dark full" data-qadd>Adicionar à sacola</button>
          <a class="link-small" href="#/p/${p.id}">Ver detalhes do produto</a>
        </div>
      </div>`;
  }

  function openLook(id) {
    const l = LOOKS.find(x => x.id === id);
    quick.id = null;
    $('#quickBody').innerHTML = `
      <p class="eyebrow">Compre o look</p>
      <h3>${l.name}</h3>
      <p class="muted">Escolha o tamanho de cada peça. Deixe em branco o que não quiser levar.</p>
      <div class="look-list">${l.items.map(([pid, c]) => {
        const p = byId(pid);
        return `<div class="look-row">
          <span class="mini-art" style="background:${BG[p.id]}">${svg(p.shape, p.colors[c][1])}</span>
          <span><b>${esc(p.name)}</b><small>${esc(p.colors[c][0])} · ${brl(p.price)}</small></span>
          <label class="sr-only" for="lk-${pid}">Tamanho de ${esc(p.name)}</label>
          <select id="lk-${pid}" data-look-item="${pid}" data-look-color="${c}">
            <option value="">Tamanho</option>${p.sizes.filter(s => !(p.out || []).includes(s)).map(s => `<option${p.sizes.length === 1 ? ' selected' : ''}>${esc(s)}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}</div>
      <p class="err" id="quickErr"></p>
      <button class="btn btn-dark full" data-look-add>Adicionar look à sacola</button>`;
    open('quick');
  }

  // ---------- Sacola ----------
  function saveCart() { store.set('dg-cart', cart); renderCart(); }

  function addToCart(id, color, size, qty = 1) {
    const key = `${id}|${color}|${size}`;
    const found = cart.find(i => i.key === key);
    if (found) found.qty += qty;
    else cart.push({ key, id, color, size, qty });
    saveCart();
  }

  function renderCart() {
    const t = totals();
    $$('.cart-count').forEach(el => { el.textContent = t.count; el.hidden = !t.count; });
    $('.cart-count-txt').textContent = t.count ? `(${t.count})` : '';
    $('#cartItems').innerHTML = cart.length ? cart.map(i => {
      const p = byId(i.id);
      const [cname, hex] = p.colors[i.color];
      return `<li data-key="${esc(i.key)}">
        <a class="ci-art" href="#/p/${p.id}" style="background:${BG[p.id]}">${svg(p.shape, hex)}</a>
        <div>
          <a class="ci-name" href="#/p/${p.id}">${esc(p.name)}</a>
          <div class="ci-opts">${esc(cname)} · ${esc(i.size)}</div>
          <div class="qty"><button data-q="-1" aria-label="Diminuir">−</button><span>${i.qty}</span><button data-q="1" aria-label="Aumentar">+</button></div>
        </div>
        <div class="ci-right"><span>${brl(p.price * i.qty)}</span><button class="ci-remove">Remover</button></div>
      </li>`;
    }).join('') : '<li class="cart-empty"><p>Sua sacola está vazia.</p><a class="btn btn-dark" href="#/c/todos">Ver a coleção</a></li>';

    const missing = CONFIG.kitQtd - t.count;
    $('#cartFoot').innerHTML = cart.length ? `
      <p class="kit-hint">${missing > 0 ? `Adicione mais ${missing} ${missing === 1 ? 'peça' : 'peças'} e ganhe ${CONFIG.kitDesc * 100}% off no kit.` : `Desconto de kit aplicado: ${CONFIG.kitDesc * 100}% off.`}</p>
      <div class="coupon">
        <label class="sr-only" for="cartCupom">Cupom</label>
        <input id="cartCupom" placeholder="Cupom de desconto" value="${esc(coupon)}">
        <button class="btn btn-ghost sm" data-coupon="#cartCupom">Aplicar</button>
      </div>
      <div class="row"><span>Subtotal</span><span>${brl(t.subtotal)}</span></div>
      ${t.kit ? `<div class="row disc"><span>Kit ${CONFIG.kitQtd} peças (−${CONFIG.kitDesc * 100}%)</span><span>− ${brl(t.kit)}</span></div>` : ''}
      ${t.cupom ? `<div class="row disc"><span>Cupom ${esc(coupon)}</span><span>− ${brl(t.cupom)}</span></div>` : ''}
      <div class="row total"><span>Total</span><strong>${brl(t.base)}</strong></div>
      <p class="muted small">ou ${CONFIG.parcelas}x de ${brl(t.base / CONFIG.parcelas)} · ${brl(t.base * (1 - CONFIG.pix))} no Pix · frete no checkout</p>
      <a class="btn btn-dark full" href="#/checkout">Finalizar compra</a>
      <button class="btn btn-ghost full" data-close>Continuar comprando</button>` : '';

    const left = CONFIG.freteGratis - t.base;
    $('.ship-text').innerHTML = !t.count ? `Frete grátis acima de ${brl(CONFIG.freteGratis)}`
      : left > 0 ? `Faltam <b>${brl(left)}</b> para o frete grátis` : 'Você ganhou <b>frete grátis</b>.';
    $('.ship-fill').style.width = `${Math.min(100, (t.base / CONFIG.freteGratis) * 100)}%`;
    if (location.hash.startsWith('#/checkout')) renderCheckoutTotals();
  }

  function applyCoupon(input) {
    const code = input.value.trim().toUpperCase();
    if (!code) { coupon = ''; store.set('dg-coupon', ''); renderCart(); toast('Cupom removido.'); return; }
    if (!CONFIG.cupons[code]) { toast('Cupom inválido. Confira o código e tente de novo.'); return; }
    coupon = code;
    store.set('dg-coupon', coupon);
    renderCart();
    toast(`Cupom ${code} aplicado: ${CONFIG.cupons[code] * 100}% off.`);
  }

  // ---------- Favoritos ----------
  function paintFavCount() {
    $$('.fav-count').forEach(el => { el.textContent = favs.length; el.hidden = !favs.length; });
  }
  function toggleFav(id, btn) {
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    store.set('dg-favs', favs);
    paintFavCount();
    const on = favs.includes(id);
    $$(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if (btn) M()?.pop(btn, on);
    toast(on ? 'Salvo nos favoritos' : 'Removido dos favoritos');
    if (location.hash === '#/favoritos') route();
  }

  // ---------- Eventos ----------
  document.addEventListener('click', e => {
    const t = e.target;
    const hit = s => t.closest(s);

    if (hit('[data-skip]')) { $('#app').focus(); return; }
    if (hit('[data-close]') || t.id === 'scrim' || t.classList.contains('modal')) { closeAll(); return; }
    if (hit('[data-open]')) { e.preventDefault(); open(hit('[data-open]').dataset.open); return; }
    if (hit('[data-fav]')) { e.preventDefault(); toggleFav(hit('[data-fav]').dataset.fav, hit('[data-fav]')); return; }
    if (hit('[data-quick]')) { e.preventDefault(); openQuick(hit('[data-quick]').dataset.quick); return; }
    if (hit('[data-look]')) { openLook(hit('[data-look]').dataset.look); return; }
    if (hit('[data-search]')) { toggleSearch($('#searchbar').hidden); return; }
    if (hit('[data-search-close]')) { toggleSearch(false); return; }
    if (hit('[data-coupon]')) { applyCoupon($(hit('[data-coupon]').dataset.coupon)); return; }

    const rail = hit('[data-rail]');
    if (rail) { const r = rail.closest('.rail-wrap').querySelector('.rail'); r.scrollBy({ left: +rail.dataset.rail * r.clientWidth * 0.8, behavior: 'smooth' }); return; }

    // Página de produto
    if (hit('[data-color]')) { pdp.color = +hit('[data-color]').dataset.color; paintPdp(); return; }
    if (hit('[data-size]') && !hit('[data-size]').disabled) { pdp.size = hit('[data-size]').dataset.size; $('#pdpErr').textContent = ''; paintPdp(); return; }
    if (hit('[data-view]')) { pdp.view = +hit('[data-view]').dataset.view; paintPdp(); return; }
    if (hit('[data-pdp-qty]')) { pdp.qty = Math.max(1, Math.min(10, pdp.qty + +hit('[data-pdp-qty]').dataset.pdpQty)); paintPdp(); return; }
    if (hit('[data-add]') || hit('[data-buy-now]')) {
      if (!pdp.size) { $('#pdpErr').textContent = 'Escolha um tamanho.'; $('.sizes').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      addToCart(pdp.id, pdp.color, pdp.size, pdp.qty);
      if (hit('[data-buy-now]')) { location.hash = '#/checkout'; return; }
      toast('Adicionado à sacola');
      M() ? M().fly($('#stageArt svg'), () => open('cart')) : open('cart');
      return;
    }

    // Compra rápida
    if (hit('[data-qcolor]')) { quick.color = +hit('[data-qcolor]').dataset.qcolor; paintQuick(); return; }
    if (hit('[data-qsize]') && !hit('[data-qsize]').disabled) { quick.size = hit('[data-qsize]').dataset.qsize; paintQuick(); return; }
    if (hit('[data-qadd]')) {
      if (!quick.size) { $('#quickErr').textContent = 'Escolha um tamanho.'; return; }
      addToCart(quick.id, quick.color, quick.size);
      toast('Adicionado à sacola');
      const art = $('.quick-art svg');
      closeAll(false);
      M() ? M().fly(art, () => open('cart')) : open('cart');
      return;
    }
    if (hit('[data-look-add]')) {
      const picks = $$('[data-look-item]').filter(s => s.value);
      if (!picks.length) { $('#quickErr').textContent = 'Escolha o tamanho de pelo menos uma peça.'; return; }
      picks.forEach(s => addToCart(s.dataset.lookItem, +s.dataset.lookColor, s.value));
      open('cart');
      toast(`${picks.length} ${picks.length === 1 ? 'peça adicionada' : 'peças adicionadas'} à sacola`);
      return;
    }

    // Sacola
    const li = hit('#cartItems li[data-key]');
    if (li && (hit('[data-q]') || hit('.ci-remove'))) {
      const item = cart.find(i => i.key === li.dataset.key);
      if (hit('[data-q]')) item.qty += +hit('[data-q]').dataset.q;
      if (hit('.ci-remove') || item.qty < 1) cart = cart.filter(i => i !== item);
      saveCart();
      return;
    }

    // Catálogo
    if (hit('[data-facet-open]')) { $('#facets').classList.add('open'); document.body.classList.add('locked'); return; }
    if (hit('[data-facet-close]')) { $('#facets').classList.remove('open'); document.body.classList.remove('locked'); return; }
    if (hit('[data-facet-clear]')) { Object.assign(facet, { types: [], colors: [], sizes: [], price: '' }); $$('[data-facet]').forEach(i => { i.checked = i.value === '' && i.type === 'radio'; }); rerenderGrid(); return; }
    const un = hit('[data-unfacet]');
    if (un) {
      const k = un.dataset.unfacet; const v = un.dataset.value;
      if (k === 'price') facet.price = ''; else facet[k] = facet[k].filter(x => x !== v);
      const input = $$(`[data-facet="${k}"]`).find(i => i.value === (k === 'price' ? '' : v));
      if (input) input.checked = k === 'price';
      rerenderGrid();
      return;
    }

    if (hit('[data-logout]')) { account = null; store.set('dg-account', null); route(); toast('Você saiu da conta.'); return; }

    if (hit('#drawerNav a')) closeAll(false);
    if (hit('.mega a')) hideMega();
  });

  function rerenderGrid() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (parts[0] === 'busca') renderGrid('busca', parts[1] || ''); else renderGrid(parts[1] || 'todos', '');
  }

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-facet]')) {
      const k = t.dataset.facet;
      if (k === 'price') facet.price = t.value;
      else facet[k] = t.checked ? [...facet[k], t.value] : facet[k].filter(x => x !== t.value);
      rerenderGrid();
    }
    if (t.id === 'sort') { facet.sort = t.value; rerenderGrid(); }
    if (t.name === 'pay') { co.pay = t.value; $('#parcWrap').hidden = co.pay !== 'cartao'; renderCheckoutTotals(); }
    if (t.name === 'ship') { co.ship = co.shipOpts.find(o => o.id === t.value); renderCheckoutTotals(); }
    if (t.id === 'coParc') co.parcelas = +t.value;
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'coCep') { const d = maskCep(t); if (d.length === 8) onCheckoutCep(); }
    if (t.id === 'cepPdp') maskCep(t);
    if (t.closest('.field.invalid') && t.value.trim()) t.closest('.field').classList.remove('invalid');
  });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.id === 'searchbar') {
      e.preventDefault();
      const q = $('#q').value.trim();
      if (q) { location.hash = `#/busca/${encodeURIComponent(q)}`; toggleSearch(false); $('#suggest').hidden = true; }
      return;
    }
    if (f.matches('[data-cep]')) {
      e.preventDefault();
      const p = byId(pdp.id);
      const opts = freteOptions($('#cepPdp').value, p.price * pdp.qty);
      $('#cepOut').innerHTML = opts
        ? opts.map(o => `<div class="row"><span>${o.name} · ${o.days} dias úteis</span><b>${o.price ? brl(o.price) : 'Grátis'}</b></div>`).join('') + '<p class="muted small">Estimativa para esta peça. O valor final aparece no checkout.</p>'
        : '<p class="err">Digite um CEP com 8 números.</p>';
      return;
    }
    if (f.id === 'coForm') { e.preventDefault(); submitCheckout(f); return; }
    if (f.matches('[data-account]')) {
      e.preventDefault();
      account = { ...(account || {}), nome: $('#accNome').value.trim(), email: $('#accEmail').value.trim() };
      store.set('dg-account', account);
      route();
      toast(`Bem-vindo, ${account.nome.split(' ')[0]}.`);
      return;
    }
    if (f.matches('[data-newsletter]')) {
      e.preventDefault();
      const email = $('input', f).value.trim();
      const list = store.get('dg-newsletter', []);
      if (!list.includes(email)) list.push(email);
      store.set('dg-newsletter', list);
      store.set('dg-popup', 'done');
      f.nextElementSibling.textContent = 'Pronto! Use o cupom BEMVINDO na sacola.';
      f.reset();
    }
  });

  let qTimer;
  $('#q').addEventListener('input', e => { clearTimeout(qTimer); qTimer = setTimeout(() => renderSuggest(e.target.value.trim()), 120); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAll(); hideMega(); if (!$('#searchbar').hidden) toggleSearch(false); }
  });

  // Menu grande (só com mouse)
  $$('#mainNav a').forEach(a => {
    a.addEventListener('mouseenter', () => { if (a.dataset.mega) showMega(a.dataset.mega); else hideMega(); });
    a.addEventListener('focus', () => { if (a.dataset.mega) showMega(a.dataset.mega); else hideMega(); });
  });
  $('#header').addEventListener('mouseleave', hideMega);

  window.addEventListener('hashchange', route);

  // Popup da lista: uma vez, depois de alguns segundos na loja
  setTimeout(() => {
    if (store.get('dg-popup', '') || document.querySelector('.modal.open, .drawer.open') || location.hash.startsWith('#/checkout')) return;
    store.set('dg-popup', 'seen');
    open('popup');
  }, 12000);

  // ---------- Início ----------
  $$('.wa-link').forEach(el => { el.href = waUrl('Olá, DG Club! Vim pelo site.'); });
  $('#year').textContent = new Date().getFullYear();
  drawerNav();
  paintFavCount();
  renderCart();
  initAnnounce();
  route();
})();
