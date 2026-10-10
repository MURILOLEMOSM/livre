/* =========================================================
   LIVRE · barra escondida da direita
   Uma alça fina no meio da borda direita. Arrastar o dedo dela
   para a esquerda (ou tocar nela) abre uma barra de ícones com
   todas as seções e atalhos.

   Gesto contínuo: puxa a barra e, sem tirar o dedo, desliza para
   cima ou para baixo. O item embaixo do dedo acende com o nome
   ao lado; soltou em cima, abre. Soltou fora, a barra fica aberta
   para tocar com calma. Fecha arrastando para a direita, tocando
   fora ou com Esc.
   ========================================================= */

const dock = (() => {
  const ITEMS = [
    { nav: 'hoje', icon: 'sun', label: 'Hoje' },
    { nav: 'disputa', icon: 'swords', label: 'Disputa' },
    { nav: 'foco', icon: 'timer', label: 'Foco' },
    { nav: 'pactos', icon: 'handshake', label: 'Pactos' },
    { nav: 'conquistas', icon: 'trophy', label: 'Conquistas' },
    { nav: 'relatorio', icon: 'file-text', label: 'Relatório' },
    'sep',
    { action: 'new-habit', icon: 'plus', label: 'Novo hábito' },
    { action: 'sos', icon: 'life-buoy', label: 'Tô com vontade', sos: true },
    { action: 'notify-setup', icon: 'bell', label: 'Lembrete' },
    { action: 'toggle-discreet', icon: 'eye-off', label: 'Modo discreto' },
    { action: 'help', icon: 'heart-handshake', label: 'Ajuda' },
  ];

  const OPEN_DIST = 22;     // quanto o dedo anda para a esquerda até abrir
  const CLOSE_DIST = 40;    // quanto anda para a direita para fechar
  let root, panel, handle, scrim;
  let isOpen = false;
  let touch = null;         // gesto em andamento
  let hot = null;           // item embaixo do dedo
  let lastTipTimer = null;

  function html() {
    let n = 0;
    const items = ITEMS.map(it => {
      if (it === 'sep') return '<span class="dock-sep" aria-hidden="true"></span>';
      const attrs = it.nav ? `href="#/${it.nav}" data-nav="${it.nav}"` : `href="#" data-action="${it.action}"`;
      return `<a class="dock-item${it.sos ? ' is-sos' : ''}" ${attrs} data-label="${it.label}" aria-label="${it.label}" tabindex="-1" style="--i:${n++}">
        <i data-lucide="${it.icon}"></i><span class="dock-tip">${it.label}</span></a>`;
    }).join('');
    return `
      <div class="dock-scrim" data-dock-close></div>
      <button type="button" class="dock-handle" aria-label="Abrir atalhos" aria-expanded="false" aria-controls="dockPanel"><span></span></button>
      <nav class="dock-panel" id="dockPanel" aria-label="Atalhos" aria-hidden="true">${items}</nav>`;
  }

  /** Sessão de foco travada: nada de sair por aqui */
  const blocked = () => !!(state?.focus?.active && state?.focus?.prefs?.locked);

  function open({ fromGesture = false } = {}) {
    if (isOpen) return;
    if (blocked()) { toast('Sessão de foco travada. Termine ou desista dela primeiro.'); return; }
    isOpen = true;
    root.classList.add('open');
    root.classList.toggle('dragging', fromGesture);
    handle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.querySelectorAll('.dock-item').forEach(a => a.removeAttribute('tabindex'));
    if (!fromGesture) panel.querySelector('[aria-current="page"], .dock-item')?.focus({ preventScroll: true });
    navigator.vibrate?.(8);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    setHot(null);
    root.classList.remove('open', 'dragging');
    handle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.querySelectorAll('.dock-item').forEach(a => a.setAttribute('tabindex', '-1'));
    if (panel.contains(document.activeElement)) handle.focus({ preventScroll: true });
  }

  function setHot(el) {
    if (hot === el) return;
    hot?.classList.remove('hot');
    hot = el;
    if (hot) { hot.classList.add('hot'); navigator.vibrate?.(4); }
  }

  /** Item da barra embaixo do ponto (aceita o dedo um pouco à esquerda da barra) */
  function itemAt(x, y) {
    const r = panel.getBoundingClientRect();
    if (y < r.top - 8 || y > r.bottom + 8 || x < r.left - 90) return null;
    const px = Math.min(Math.max(x, r.left + 4), r.right - 4);
    return document.elementFromPoint(px, y)?.closest('.dock-item') || null;
  }

  function pick(el) {
    close();
    // Deixa a barra começar a fechar antes de trocar de tela
    setTimeout(() => el.click(), 60);
  }

  /* ---------- Toque ---------- */
  function onStart(e) {
    const t = e.touches[0];
    const fromEdge = e.target.closest('.dock-handle') || (!isOpen && t.clientX > innerWidth - 18 && inBand(t.clientY));
    const onPanel = isOpen && e.target.closest('.dock-panel');
    if (!fromEdge && !onPanel) return;
    touch = { x0: t.clientX, y0: t.clientY, fromEdge: !!fromEdge, moved: false, opened: isOpen };
  }

  function onMove(e) {
    if (!touch) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.x0, dy = t.clientY - touch.y0;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touch.moved = true;

    if (touch.fromEdge && !isOpen && dx < -OPEN_DIST && Math.abs(dx) > Math.abs(dy) * 0.8) open({ fromGesture: true });
    if (isOpen && touch.moved) {
      if (e.cancelable) e.preventDefault();   // não rola a página enquanto escolhe
      if (dx > CLOSE_DIST && Math.abs(dx) > Math.abs(dy)) { touch = null; close(); return; }
      setHot(itemAt(t.clientX, t.clientY));
    }
  }

  function onEnd() {
    if (!touch) return;
    const g = touch;
    touch = null;
    root.classList.remove('dragging');
    if (hot && g.moved) { const el = hot; setHot(null); pick(el); return; }
    setHot(null);
    // Toque simples na alça abre ou fecha (o click cuida disso)
  }

  // A faixa de toque da borda fica só no meio da tela, para não atrapalhar o resto
  const inBand = y => y > innerHeight * 0.25 && y < innerHeight * 0.75;

  /* ---------- Mouse e teclado ---------- */
  function onClick(e) {
    if (e.target.closest('.dock-handle')) { e.preventDefault(); e.stopPropagation(); isOpen ? close() : open(); return; }
    if (e.target.closest('[data-dock-close]')) { e.preventDefault(); close(); return; }
    const item = e.target.closest('.dock-item');
    if (item && isOpen) {
      // Os itens com data-action seguem para o handleAction do main.js; os links mudam a rota
      setTimeout(close, 0);
    }
  }

  function onKey(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const list = [...panel.querySelectorAll('.dock-item')];
      const i = list.indexOf(document.activeElement);
      const next = list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length];
      next.focus();
    }
  }

  /* ---------- Rótulo ao passar o mouse (desktop) ---------- */
  function onHover(e) {
    const item = e.target.closest?.('.dock-item');
    clearTimeout(lastTipTimer);
    if (item) setHot(item);
    else lastTipTimer = setTimeout(() => setHot(null), 80);
  }

  function mount() {
    root = document.createElement('div');
    root.className = 'dock';
    root.innerHTML = html();
    $('#app').appendChild(root);
    panel = root.querySelector('.dock-panel');
    handle = root.querySelector('.dock-handle');
    scrim = root.querySelector('.dock-scrim');

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', () => { touch = null; setHot(null); root.classList.remove('dragging'); });
    root.addEventListener('click', onClick, true);
    panel.addEventListener('mouseover', onHover);
    panel.addEventListener('mouseleave', () => setHot(null));
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', close);
    if (typeof icons === 'function') icons();
  }

  return { mount, open, close, get isOpen() { return isOpen; } };
})();
