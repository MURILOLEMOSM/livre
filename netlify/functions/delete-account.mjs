/* =========================================================
   LIVRE · excluir conta (POST /api/excluir-conta)
   O app manda o token de login da pessoa. A função confere quem
   é e apaga tudo: dados do app, aparelhos, perfil, amizades,
   grupos, padrinho e a conta no Firebase Auth.
   ========================================================= */

import { json, userFrom, HttpError, missingEnv, deleteEverything } from '../lib/firebase.mjs';

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (missingEnv().length) return json({ error: 'Servidor sem configuração.' }, 500);

  try {
    const uid = await userFrom(req);   // ninguém apaga a conta de outra pessoa
    await deleteEverything(uid);
    return json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error('[LIVRE] Falha ao excluir conta:', e);
    return json({ error: 'Não deu para excluir agora. Tente de novo em alguns minutos.' }, 500);
  }
};

export const config = { path: '/api/excluir-conta' };
