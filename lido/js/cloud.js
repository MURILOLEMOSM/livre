/* =========================================================
   LIDO · nuvem
   Login por e-mail e senha (Firebase Auth) e cópia dos dados
   em lido/{uid} (Firestore). Sem config, cloud.mode = 'local'
   e o app funciona só no aparelho.
   ========================================================= */

const cloud = (() => {
  const cfg = window.LIDO_CONFIG || {};
  const mode = cfg.firebase?.apiKey && cfg.firebase?.projectId ? 'firebase' : 'local';
  const SDK = ['app', 'auth', 'firestore'].map(m => `https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-${m}-compat.js`);
  let auth = null, fs = null, user = null;

  const ERRORS = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Esse e-mail já tem conta (a mesma do LIVRE vale aqui). Entre com a sua senha.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/password-does-not-meet-requirements': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/missing-email': 'Digite seu e-mail.',
    'auth/missing-password': 'Digite sua senha.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com o servidor. Confira sua internet.',
    'auth/operation-not-allowed': 'O login por e-mail e senha não está ligado no Firebase.',
    'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase (Authentication > Configurações > Domínios autorizados).',
    'permission-denied': 'O servidor recusou. Publique as regras do Firestore com o bloco do LIDO.',
    'unavailable': 'Sem conexão com o servidor. Confira sua internet.',
  };
  const fail = err => { throw new Error(ERRORS[err?.code] || err?.message || 'Algo deu errado. Tente de novo.'); };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = Object.assign(document.createElement('script'), { src, async: true });
      s.onload = resolve;
      s.onerror = () => reject(new Error('Não deu para carregar o login. Confira sua internet.'));
      document.head.appendChild(s);
    });
  }
  const toUser = u => (u ? { id: u.uid, email: u.email } : null);

  async function init() {
    if (mode === 'local') return null;
    for (const src of SDK) await loadScript(src);   // em ordem: app primeiro
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg.firebase);
    auth = app.auth();
    auth.useDeviceLanguage();
    fs = app.firestore();
    user = toUser(await new Promise(resolve => { const stop = auth.onAuthStateChanged(u => { stop(); resolve(u); }); }));
    return user;
  }

  async function ready() {
    if (mode === 'local') throw new Error('Login indisponível: o Firebase não está configurado.');
    if (!auth) await init();
  }

  /* ---------- Salvamento com espera (junta várias mudanças em uma) ---------- */
  let timer = null, pending = null, saving = false;
  function queueSave(snapshot) {
    if (!user || !fs) return;
    pending = JSON.stringify(snapshot);
    clearTimeout(timer);
    timer = setTimeout(flush, 1500);
  }
  async function flush() {
    if (!pending || saving || !user) return;
    const data = pending;
    pending = null;
    saving = true;
    try {
      await fs.doc(`lido/${user.id}`).set({ data, updatedAt: JSON.parse(data)._savedAt || Date.now() });
    } catch (err) {
      console.warn('[LIDO] Não sincronizou agora, tento de novo:', err.message);
      pending = pending || data;
      setTimeout(flush, 15_000);
    } finally { saving = false; }
  }
  // Fechou o app com mudança na fila: tenta mandar antes
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  return {
    mode,
    get user() { return user; },
    init: () => init().catch(err => { console.warn('[LIDO] Sem login agora:', err.message); return null; }),
    async signIn(email, password) {
      await ready();
      try { user = toUser((await auth.signInWithEmailAndPassword(email, password)).user); } catch (err) { fail(err); }
      return user;
    },
    async signUp(email, password) {
      await ready();
      try { user = toUser((await auth.createUserWithEmailAndPassword(email, password)).user); } catch (err) { fail(err); }
      return user;
    },
    async resetPassword(email) {
      await ready();
      try { await auth.sendPasswordResetEmail(email); } catch (err) { if (err.code !== 'auth/user-not-found') fail(err); }
    },
    async signOut() {
      await flush();
      await auth?.signOut();
      user = null;
    },
    async loadData() {
      if (!user || !fs) return null;
      const snap = await fs.doc(`lido/${user.id}`).get();
      if (!snap.exists) return null;
      const d = snap.data();
      return { data: JSON.parse(d.data || 'null'), updatedAt: Number(d.updatedAt) || 0 };
    },
    queueSave, flush,
  };
})();
