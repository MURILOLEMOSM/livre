/* =========================================================
   LIVRE · PIN para abrir o app
   O PIN fica só neste aparelho (guardado como hash, nunca em
   texto). Pede ao abrir e ao voltar depois de 1 minuto fora.
   Esqueceu? Sai da conta e entra de novo com a senha.
   ========================================================= */

const lock = (() => {
  const AWAY_MS = 60_000;
  const key = () => `livre:pin:${currentUser?.id}`;
  let hiddenAt = 0;
  let resolver = null;
  let mode = 'unlock';     // 'unlock' | 'set1' | 'set2'
  let first = '';
  let typed = '';

  async function hash(pin) {
    const text = `${currentUser?.id}:${pin}`;
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return btoa(text);
    }
  }

  const hasPin = () => !!(currentUser && store.get(key()));
  const el = () => document.getElementById('lock');

  function draw(msg = '', error = false) {
    const titles = { unlock: 'Digite seu PIN', set1: 'Crie um PIN de 4 dígitos', set2: 'Repita o PIN' };
    el().innerHTML = `
      <div class="lock-box" role="dialog" aria-modal="true" aria-labelledby="lockTitle">
        <span class="brand">${state.settings.discreet ? 'Diário' : 'LIVRE<span>.</span>'}</span>
        <h2 id="lockTitle">${titles[mode]}</h2>
        <div class="pin-dots ${error ? 'shake' : ''}" aria-label="${typed.length} de 4 dígitos">
          ${[0, 1, 2, 3].map(i => `<i class="${i < typed.length ? 'on' : ''}"></i>`).join('')}
        </div>
        <p class="lock-msg ${error ? 'err' : ''}" role="status">${msg}</p>
        <div class="keypad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-key="${n}">${n}</button>`).join('')}
          <button type="button" data-key="cancel" class="kp-text">${mode === 'unlock' ? 'Esqueci' : 'Cancelar'}</button>
          <button type="button" data-key="0">0</button>
          <button type="button" data-key="back" class="kp-text" aria-label="Apagar">Apagar</button>
        </div>
      </div>`;
  }

  function open(newMode) {
    mode = newMode;
    typed = '';
    first = '';
    el().hidden = false;
    document.documentElement.classList.add('locked');
    draw();
    return new Promise(res => { resolver = res; });
  }

  function close(result) {
    el().hidden = true;
    el().innerHTML = '';
    document.documentElement.classList.remove('locked');
    const r = resolver;
    resolver = null;
    if (r) r(result);
  }

  async function press(k) {
    if (k === 'back') { typed = typed.slice(0, -1); return draw(); }
    if (k === 'cancel') {
      if (mode !== 'unlock') return close(false);
      const ok = await ask({ title: 'Esqueceu o PIN?', text: 'Você sai da conta neste aparelho e entra de novo com e-mail e senha. O PIN é apagado e seus dados continuam salvos.', yes: 'Sair e entrar de novo' });
      if (!ok) return;
      store.remove(key());
      close(false);
      await cloud.signOut();
      return leaveApp();
    }
    if (typed.length >= 4) return;
    typed += k;
    draw();
    if (typed.length < 4) return;

    if (mode === 'unlock') {
      if (await hash(typed) === store.get(key())) return close(true);
      typed = '';
      return draw('PIN errado. Tente de novo.', true);
    }
    if (mode === 'set1') {
      first = typed;
      mode = 'set2';
      typed = '';
      return draw();
    }
    if (typed !== first) {
      mode = 'set1';
      typed = '';
      return draw('Os dois PINs ficaram diferentes. Comece de novo.', true);
    }
    store.set(key(), await hash(typed));
    close(true);
  }

  function bind() {
    document.addEventListener('click', e => {
      const b = e.target.closest('#lock [data-key]');
      if (b) press(b.dataset.key);
    });
    document.addEventListener('keydown', e => {
      if (el().hidden) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('back');
    });
    // Voltou depois de 1 minuto fora: pede de novo
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      if (hasPin() && hiddenAt && Date.now() - hiddenAt > AWAY_MS && el().hidden) open('unlock');
    });
  }

  return {
    hasPin,
    bind,
    /** Chamado ao entrar no app */
    async guard() { if (hasPin()) await open('unlock'); },
    async create() { return open('set1'); },
    remove() { store.remove(key()); },
  };
})();
