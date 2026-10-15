/* DG Club · animações (Anime.js v4)
   Tudo aqui é enfeite: se a biblioteca não carregar ou a pessoa preferir
   menos movimento, a loja funciona igual, só que parada. */
(() => {
  'use strict';

  const A = window.anime;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const off = () => !A || reduce.matches;
  const noop = () => {};

  if (off()) {
    window.DGMotion = { page: noop, slide: noop, fly: (_, done) => done && done(), bump: noop, pop: noop, drawer: noop, mega: noop };
    return;
  }

  const { stagger, onScroll, createScope, createTimeline, splitText, spring, svg } = A;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Só anima o que existe na página atual (evita avisos da biblioteca)
  const animate = (targets, params) => {
    const list = typeof targets === 'string' ? $$(targets) : [].concat(targets).filter(Boolean);
    return list.length ? A.animate(list, params) : null;
  };

  // ---------- Entrada da marca (uma vez) ----------
  function intro() {
    const crest = $('.brand .crest');
    if (crest) {
      const paths = $$('path', crest);
      animate(svg.createDrawable(paths), { draw: ['0 0', '0 1'], duration: 1400, delay: stagger(220), ease: 'inOutQuad' });
      animate($('text', crest), { opacity: [0, 1], duration: 600, delay: 900 });
    }
    const wm = $('.brand .wm-main');
    if (wm) {
      const { chars } = splitText(wm, { chars: true });
      animate(chars, { opacity: [0, 1], y: ['-0.4em', 0], duration: 700, delay: stagger(45, { start: 200 }), ease: 'outExpo' });
    }
    animate('.nav a', { opacity: [0, 1], y: [-8, 0], duration: 600, delay: stagger(60, { start: 500 }), ease: 'outQuad' });
    animate('.actions .icon-btn', { opacity: [0, 1], scale: [.6, 1], duration: 700, delay: stagger(70, { start: 600 }), ease: spring({ bounce: .45 }) });
    animate('.wa-float', { scale: [0, 1], rotate: ['-90deg', 0], duration: 900, delay: 1600, ease: spring({ bounce: .5 }) });
  }

  // ---------- Revelar ao rolar ----------
  // Só o deslocamento é animado: o conteúdo nunca fica invisível esperando a rolagem.
  function reveal(selector, opts = {}) {
    $$(selector).forEach(group => {
      const items = opts.children ? $$(opts.children, group) : [group];
      if (!items.length) return;
      animate(items, {
        y: [opts.y ?? 36, 0],
        duration: opts.duration ?? 900,
        delay: stagger(opts.stagger ?? 70),
        ease: 'outExpo',
        autoplay: onScroll({ target: group, repeat: false })
      });
    });
  }

  // Movimento ligado à rolagem (parallax)
  function parallax(selector, prop, range) {
    $$(selector).forEach(el => {
      animate(el, {
        [prop]: range,
        ease: 'linear',
        autoplay: onScroll({ target: el.parentElement, enter: 'bottom top', leave: 'top bottom', sync: .4 })
      });
    });
  }

  // Grade e trilhos de produtos aparecem em cascata
  function cards(root) {
    const list = $$('.grid .card, .rail .card', root).slice(0, 16);
    if (list.length) animate(list, { opacity: [0, 1], y: [28, 0], duration: 700, delay: stagger(45), ease: 'outQuart' });
  }

  // ---------- Página ----------
  let scope = null;
  function page(route) {
    if (scope) scope.revert();
    const root = $('#app');
    scope = createScope({ root }).add(() => {
      animate(root, { opacity: [0, 1], duration: 450, ease: 'outQuad' });
      animate('.crumbs, .page-head', { opacity: [0, 1], y: [14, 0], duration: 700, delay: stagger(80), ease: 'outExpo' });
      cards(root);

      if (route === 'home') {
        reveal('.values', { children: 'div', y: 18, stagger: 90 });
        reveal('.rounds', { children: '.round', y: 24, stagger: 50 });
        reveal('.om-banner', { children: '.om-art span, .om-copy > *', stagger: 90 });
        reveal('.cats', { children: '.cat', y: 60, stagger: 120 });
        reveal('.promo', { children: '.promo > *', y: 20, stagger: 100 });
        reveal('.editorial-copy', { children: '.editorial-copy > *', y: 24, stagger: 80 });
        reveal('.insta-grid', { children: '.insta-tile', y: 30, stagger: 60 });
        parallax('.editorial-art .monogram', 'y', ['-12%', '12%']);
        parallax('.cat-art span', 'y', ['10%', '-10%']);
        // As peças do banner Old Money flutuam devagar, cada uma no seu tempo
        animate('.om-art svg', { y: [-6, 6], duration: 2600, delay: stagger(400), loop: true, alternate: true, ease: 'inOutSine' });
      }

      if (route === 'catalog') {
        animate('.facets fieldset, .facets > .btn', { opacity: [0, 1], x: [-16, 0], duration: 600, delay: stagger(70, { start: 150 }), ease: 'outQuad' });
      }

      if (route === 'product') {
        const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 800 } });
        tl.add('.stage', { opacity: [0, 1], scale: [.97, 1] })
          .add('.thumb', { opacity: [0, 1], x: [-12, 0], delay: stagger(80) }, '-=600')
          .add('.buy > *', { opacity: [0, 1], y: [18, 0], delay: stagger(40) }, '-=700');
        reveal('.mini-list', { children: '.mini', y: 24, stagger: 90 });
      }

      if (route === 'oldmoney') {
        const h1 = $('.om-hero h1');
        if (h1) {
          const { chars } = splitText(h1, { chars: true });
          animate(chars, { opacity: [0, 1], y: ['0.5em', 0], rotate: [8, 0], duration: 1000, delay: stagger(55, { start: 150 }), ease: 'outExpo' });
        }
        animate('.om-hero p', { opacity: [0, 1], y: [16, 0], duration: 900, delay: 700, ease: 'outExpo' });
        animate('.om-hero-art svg', { opacity: [0, 1], y: [60, 0], duration: 1300, delay: stagger(220, { start: 300 }), ease: 'outExpo' });
        reveal('.look-grid', { children: '.look', y: 50, stagger: 120 });
        // Peças de cada look balançam de leve, como num cabide
        animate('.look-piece', { y: [-4, 4], rotate: [-1.2, 1.2], duration: 2400, delay: stagger(180), loop: true, alternate: true, ease: 'inOutSine' });
      }

      if (route === 'club') {
        reveal('.tiers', { children: 'article', y: 40, stagger: 120 });
        reveal('.steps', { children: 'article', y: 30, stagger: 120 });
        parallax('.editorial-art .monogram', 'y', ['-10%', '10%']);
      }

      if (route === 'checkout') {
        animate('.co-step', { opacity: [0, 1], y: [20, 0], duration: 700, delay: stagger(110, { start: 100 }), ease: 'outExpo' });
        animate('.co-summary', { opacity: [0, 1], x: [24, 0], duration: 800, delay: 200, ease: 'outExpo' });
      }

      if (route === 'order') {
        createTimeline({ defaults: { ease: 'outExpo', duration: 800 } })
          .add('.order-card', { opacity: [0, 1], scale: [.96, 1] })
          .add('.order-card > *', { opacity: [0, 1], y: [14, 0], delay: stagger(70) }, '-=500');
      }

      if (route === 'account') {
        animate('.member-card', { opacity: [0, 1], rotateX: [25, 0], y: [30, 0], duration: 1100, ease: 'outExpo' });
        animate('.acc-order', { opacity: [0, 1], x: [20, 0], duration: 600, delay: stagger(60, { start: 250 }), ease: 'outQuad' });
      }
    });
  }

  // ---------- Banner: título entra palavra por palavra ----------
  const splitDone = new WeakMap();
  function slide(el) {
    const head = $('h1, .slide-title', el);
    if (head && !splitDone.has(head)) splitDone.set(head, splitText(head, { words: { wrap: 'clip' } }));
    const words = head ? splitDone.get(head).words : [];
    createTimeline({ defaults: { ease: 'outExpo' } })
      .add($('.eyebrow', el), { opacity: [0, 1], y: [10, 0], duration: 600 })
      .add(words, { y: ['110%', '0%'], duration: 900, delay: stagger(70) }, '-=400')
      .add($$('.lede, .hero-actions, .btn', el).filter((n, i, all) => !all.some(o => o !== n && o.contains(n))), { opacity: [0, 1], y: [16, 0], duration: 700, delay: stagger(100) }, '-=600')
      .add($('.slide-art svg', el), { opacity: [0, 1], y: [40, 0], rotate: [-4, 0], duration: 1300 }, 0);
  }

  // ---------- Sacola ----------
  // A peça "voa" até o ícone da sacola
  function fly(fromEl, done) {
    const target = [...document.querySelectorAll('[data-open="cart"]')].find(b => b.offsetParent !== null);
    if (!fromEl || !target) { done && done(); return; }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const ghost = fromEl.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
      margin: 0, zIndex: 90, pointerEvents: 'none', filter: 'drop-shadow(0 12px 18px rgba(15,31,61,.25))'
    });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    createTimeline({ onComplete: () => { ghost.remove(); bump(); done && done(); } })
      .add(ghost, { x: dx * .35, y: dy * .35 - 80, scale: .55, duration: 380, ease: 'outQuad' })
      .add(ghost, { x: dx, y: dy, scale: .08, opacity: .6, duration: 420, ease: 'inQuad' });
  }

  function bump() {
    animate('[data-open="cart"] svg', { scale: [1, 1.35, 1], rotate: [0, -12, 0], duration: 600, ease: 'outQuad' });
    animate('.cart-count', { scale: [.4, 1], duration: 700, ease: spring({ bounce: .6 }) });
  }

  // Coração do favorito
  function pop(btn, on) {
    const s = $('svg', btn) || btn;
    animate(s, on
      ? { scale: [.6, 1.35, 1], duration: 650, ease: 'outBack(3)' }
      : { scale: [1, .8, 1], duration: 350, ease: 'outQuad' });
    if (on) {
      animate('.fav-count', { scale: [.4, 1], duration: 700, ease: spring({ bounce: .6 }) });
    }
  }

  // Itens entrando na gaveta da sacola / menu
  function drawer(id) {
    if (id === 'cart') animate('#cartItems li', { opacity: [0, 1], x: [30, 0], duration: 600, delay: stagger(60, { start: 150 }), ease: 'outExpo' });
    if (id === 'menu') animate('#drawerNav > *', { opacity: [0, 1], x: [-24, 0], duration: 600, delay: stagger(45, { start: 120 }), ease: 'outExpo' });
    if (id === 'quick' || id === 'popup') animate(`#${id} .modal-card`, { scale: [.94, 1], duration: 600, ease: spring({ bounce: .3 }) });
  }

  // Menu grande: colunas entram em cascata
  function mega() {
    animate('#mega .mega-col a, #mega .mega-feat', { opacity: [0, 1], y: [10, 0], duration: 450, delay: stagger(25), ease: 'outQuad' });
  }

  window.DGMotion = { page, slide, fly, bump, pop, drawer, mega };
  intro();
})();
