/* =========================================================
   LIVRE · nuvem
   Login, sincronização dos dados e inscrição no lembrete diário.

   Dois modos, mesma interface:
   - firebase: contas reais, dados na nuvem, lembrete por push
   - local:    sem servidor configurado; contas e dados ficam só
               neste aparelho (para testar e para a prévia)
   ========================================================= */

const cloud = (() => {
  const cfg = window.LIVRE_CONFIG || {};
  const mode = cfg.firebase?.apiKey && cfg.firebase?.projectId ? 'firebase' : 'local';
  const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'America/Sao_Paulo'; } })();

  let user = null;        // { id, email }
  const listeners = [];

  /* ---------- Mensagens de erro em português ---------- */
  const AUTH_ERRORS = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Esse e-mail já tem conta. Entre com a sua senha.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/password-does-not-meet-requirements': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/missing-email': 'Digite seu e-mail.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com o servidor. Confira sua internet.',
    'auth/requires-recent-login': 'Por segurança, saia e entre de novo antes de fazer isso.',
    'auth/user-disabled': 'Essa conta foi desativada.',
    'auth/operation-not-allowed': 'O login por e-mail e senha não está ligado no Firebase (Authentication > Sign-in method).',
    'auth/api-key-not-valid': 'A configuração do Firebase no config.js está errada.',
    'permission-denied': 'O servidor recusou. Confira as regras do Firestore.',
    'unavailable': 'Sem conexão com o servidor. Confira sua internet.',
  };
  function friendly(err) {
    const code = String(err?.code || '').replace(/\.$/, '');
    if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
    const m = (err?.message || String(err || '')).toLowerCase();
    if (m.includes('api-key-not-valid')) return AUTH_ERRORS['auth/api-key-not-valid'];
    if (m.includes('invalid login') || m.includes('invalid-credential')) return 'E-mail ou senha incorretos.';
    if (m.includes('already registered')) return 'Esse e-mail já tem conta. Entre com a sua senha.';
    if (m.includes('at least 6')) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (m.includes('too many')) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
    if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Confira sua internet.';
    return err?.message || 'Algo deu errado. Tente de novo.';
  }
  const fail = err => { throw new Error(friendly(err)); };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = Object.assign(document.createElement('script'), { src, async: true });
      s.onload = resolve;
      s.onerror = () => reject(new Error('Não deu para carregar o login. Confira sua internet.'));
      document.head.appendChild(s);
    });
  }

  const emit = (event, data) => listeners.forEach(fn => fn(event, data));
  const toUser = u => (u ? { id: u.uid || u.id, email: u.email } : null);

  /* =================== Modo local =================== */
  const LOCAL_USERS = 'livre:local-users';
  const LOCAL_SESSION = 'livre:local-session';

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return btoa(unescape(encodeURIComponent(text)));
    }
  }
  const localUsers = () => store.json(LOCAL_USERS) || {};

  const local = {
    async init() {
      const id = store.get(LOCAL_SESSION);
      if (id === 'demo') return { id: 'demo', email: 'exemplo@livre.app' };
      const found = Object.entries(localUsers()).find(([, u]) => u.id === id);
      return found ? { id, email: found[0] } : null;
    },
    async signUp(email, password) {
      if (password.length < 6) fail({ message: 'at least 6' });
      const users = localUsers();
      if (users[email]) fail({ message: 'already registered' });
      users[email] = { id: `local-${uid()}`, hash: await hash(`${email}:${password}`) };
      store.set(LOCAL_USERS, JSON.stringify(users));
      store.set(LOCAL_SESSION, users[email].id);
      return { user: { id: users[email].id, email }, needsConfirm: false };
    },
    async signIn(email, password) {
      const u = localUsers()[email];
      if (!u || u.hash !== await hash(`${email}:${password}`)) fail({ message: 'invalid login' });
      store.set(LOCAL_SESSION, u.id);
      return { id: u.id, email };
    },
    async signInDemo() {
      store.set(LOCAL_SESSION, 'demo');
      return { id: 'demo', email: 'exemplo@livre.app' };
    },
    async resetPassword() {
      fail({ message: 'No modo local não tem envio de e-mail. Crie outra conta para testar.' });
    },
    async updatePassword() { return true; },
    async signOut() { store.remove(LOCAL_SESSION); },
    async deleteAccount() {
      const users = localUsers();
      const email = Object.keys(users).find(e => users[e].id === user?.id);
      if (email) { delete users[email]; store.set(LOCAL_USERS, JSON.stringify(users)); }
      store.remove(LOCAL_SESSION);
    },
    async loadData() { return null; },
    async saveData() { return true; },
  };

  /* =================== Modo Firebase =================== */
  const FIREBASE_SDK = ['app', 'auth', 'firestore'].map(m => `https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-${m}-compat.js`);
  let fb = null;          // firebase.app()
  let fbAuth = null, fs = null;

  async function token() {
    const u = fbAuth?.currentUser;
    if (!u) fail({ message: 'Sua sessão expirou. Entre de novo e tente outra vez.' });
    return u.getIdToken();
  }

  /** Chama uma função do servidor (Netlify) com o token de login */
  async function api(path, body) {
    const t = await token();
    let res;
    try {
      res = await fetch(path, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    } catch { fail({ message: 'network' }); }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || 'Algo deu errado. Tente de novo.');
    return out;
  }

  const remote = {
    async init() {
      for (const src of FIREBASE_SDK) await loadScript(src);   // em ordem: app primeiro
      fb = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg.firebase);
      fbAuth = fb.auth();
      fbAuth.useDeviceLanguage();   // e-mails de senha no idioma do aparelho
      fs = fb.firestore();
      // Espera o Firebase dizer se já tem alguém logado neste aparelho
      const first = await new Promise(resolve => {
        const stop = fbAuth.onAuthStateChanged(u => { stop(); resolve(u); });
      });
      fbAuth.onAuthStateChanged(u => {
        const was = user;
        user = toUser(u);
        if (was && !user) emit('SIGNED_OUT', null);
        else if (!was && user) emit('SIGNED_IN', user);
      });
      return toUser(first);
    },
    async signUp(email, password) {
      try {
        const { user: u } = await fbAuth.createUserWithEmailAndPassword(email, password);
        return { user: toUser(u), needsConfirm: false };
      } catch (err) { fail(err); }
    },
    async signIn(email, password) {
      try { return toUser((await fbAuth.signInWithEmailAndPassword(email, password)).user); }
      catch (err) { fail(err); }
    },
    async resetPassword(email) {
      try {
        // Depois de trocar a senha, o Firebase mostra um botão que volta para o app
        await fbAuth.sendPasswordResetEmail(email, { url: location.origin + location.pathname });
      } catch (err) {
        if (err.code === 'auth/user-not-found') return true;   // não conta quem tem conta ou não
        if (err.code === 'auth/unauthorized-continue-uri' || err.code === 'auth/invalid-continue-uri') {
          try { await fbAuth.sendPasswordResetEmail(email); } catch (e) { fail(e); }
        } else fail(err);
      }
      return true;
    },
    async updatePassword(password) {
      try { await fbAuth.currentUser.updatePassword(password); } catch (err) { fail(err); }
      return true;
    },
    async signOut() {
      await disablePush().catch(() => {});
      await fbAuth.signOut();
    },
    async deleteAccount() {
      await api('/api/excluir-conta');
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      await (await reg?.pushManager?.getSubscription())?.unsubscribe().catch(() => {});
      await fbAuth.signOut().catch(() => {});
    },
    async loadData() {
      const snap = await fs.doc(`users/${user.id}`).get();
      if (!snap.exists) return null;
      const d = snap.data();
      return { data: JSON.parse(d.data || 'null'), updatedAt: Number(d.updatedAt) || 0 };
    },
    async saveData(snapshot) {
      // Guardado como texto JSON: o Firestore não aceita alguns formatos (listas dentro de listas, undefined)
      await fs.doc(`users/${user.id}`).set({ data: JSON.stringify(snapshot), updatedAt: snapshot._savedAt || Date.now() });
      return true;
    },
  };

  const impl = mode === 'firebase' ? remote : local;

  /* ---------- Salvamento com espera (junta várias mudanças em uma) ---------- */
  let saveTimer = null, pending = null, saving = false;
  function queueSave(snapshot) {
    if (mode === 'local' || !user) return;
    pending = JSON.parse(JSON.stringify(snapshot));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 1200);
  }
  async function flush() {
    if (!pending || saving || !user) return;
    const data = pending;
    pending = null;
    saving = true;
    try { await impl.saveData(data); }
    catch (err) { console.warn('[LIVRE] Não sincronizou agora, tento de novo:', err.message); pending = pending || data; setTimeout(flush, 15_000); }
    finally { saving = false; }
  }
  const hasPending = () => !!pending || saving;

  /* ---------- Lembrete diário (push) ---------- */
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  /** Diz se dá para ativar o lembrete aqui e, se não der, por quê */
  function pushStatus() {
    if (mode === 'local') return { ok: false, reason: 'O lembrete diário precisa do servidor configurado (Firebase e Netlify). No modo local ele fica desligado.' };
    if (!cfg.vapidPublicKey) return { ok: false, reason: 'Falta a chave pública VAPID no arquivo config.js.' };
    if (isIOS && !isStandalone()) return { ok: false, reason: 'No iPhone, primeiro instale o app: Compartilhar, depois "Adicionar à Tela de Início". Abra pelo ícone e ative aqui.' };
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return { ok: false, reason: 'Este navegador não aceita notificações de sites.' };
    if (Notification.permission === 'denied') return { ok: false, reason: 'As notificações estão bloqueadas para este site. Libere nas configurações do navegador.' };
    return { ok: true };
  }

  function keyToBytes(base64) {
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }

  async function enablePush(hour) {
    const st = pushStatus();
    if (!st.ok) throw new Error(st.reason);
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Sem permissão, o lembrete não chega. Você pode liberar depois nos Ajustes.');

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(cfg.vapidPublicKey) });
    const j = sub.toJSON();

    // Um documento por aparelho, com o id tirado do endereço de push (o mesmo aparelho não duplica)
    try {
      await fs.doc(`users/${user.id}/push/${await hash(j.endpoint)}`).set({
        endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
        notify_hour: Number(hour), tz, last_sent_on: null, createdAt: Date.now(),
      }, { merge: true });
    } catch (err) { fail(err); }
    return true;
  }

  async function disablePush() {
    if (mode === 'local' || !('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager?.getSubscription();
    if (!sub) return;
    if (user && fs) await fs.doc(`users/${user.id}/push/${await hash(sub.endpoint)}`).delete().catch(() => {});
    await sub.unsubscribe();
  }

  /** Alerta do ponto fraco neste aparelho (precisa do lembrete ligado). null desliga. */
  async function setWeakAlert(spot) {
    if (mode === 'local') throw new Error('O alerta precisa do servidor configurado. No modo local ele fica desligado.');
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager?.getSubscription();
    if (!sub) throw new Error('Ative o lembrete diário primeiro. O alerta usa a mesma permissão.');
    try {
      await fs.doc(`users/${user.id}/push/${await hash(sub.endpoint)}`)
        .update({ weak_dow: spot ? spot.dow : null, weak_hour: spot ? spot.hour : null, last_weak_on: null });
    } catch (err) {
      if (err.code === 'not-found') throw new Error('Ative o lembrete diário de novo. O alerta usa a mesma permissão.');
      fail(err);
    }
  }

  /** Mostra uma notificação de teste agora, com o texto que chegaria hoje */
  async function testNotification(msg) {
    if (!('Notification' in window)) throw new Error('Este navegador não mostra notificações.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Permissão de notificação negada.');
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const opts = { body: msg.body, icon: 'icons/icon-192.png', tag: 'livre-test' };
    if (reg) await reg.showNotification(msg.title, opts);
    else new Notification(msg.title, opts);
  }

  return {
    mode,
    tz,
    isRecovery: false,   // no Firebase a troca de senha acontece na página do próprio Firebase
    /** Chamada às funções do servidor com o token (usada pela Disputa) */
    api: (path, body) => (mode === 'firebase' ? api(path, body) : Promise.reject(new Error('Sem servidor no modo local.'))),
    /** Grava o resumo do placar (stats/{uid}); o resto da Disputa passa pelo servidor */
    async publishStats(habits) {
      if (mode !== 'firebase' || !user) return;
      await fs.doc(`stats/${user.id}`).set({ habits, updatedAt: Date.now() });
    },
    get user() { return user; },
    async init() {
      user = await impl.init();
      return user;
    },
    onAuthChange(fn) { listeners.push(fn); },
    async signUp(email, password) { const r = await impl.signUp(email, password); user = r.user; return r; },
    async signIn(email, password) { user = await impl.signIn(email, password); return user; },
    async signInDemo() { user = await local.signInDemo(); return user; },
    resetPassword: email => impl.resetPassword(email),
    updatePassword: pw => impl.updatePassword(pw),
    async signOut() { await flush(); await impl.signOut(); user = null; },
    async deleteAccount() {
      clearTimeout(saveTimer); pending = null;   // nada de salvar de novo depois de apagar
      await impl.deleteAccount();
      user = null;
    },
    loadData: () => (user ? impl.loadData() : null),
    queueSave, flush, hasPending,
    pushStatus, enablePush, disablePush, testNotification, setWeakAlert,
  };
})();
