/* =========================================================
   LIVRE · conexão do servidor com o Firebase
   Usada pelas funções do Netlify. Fala com o Firestore e com o
   Firebase Auth como administrador (passa por cima das regras),
   então só roda no servidor.

   Variáveis de ambiente (Netlify > Site configuration > Environment variables),
   tiradas do arquivo JSON da conta de serviço:
     FIREBASE_PROJECT_ID     "project_id"
     FIREBASE_CLIENT_EMAIL   "client_email"
     FIREBASE_PRIVATE_KEY    "private_key" (inteira, com BEGIN e END)
   ========================================================= */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function missingEnv(names = []) {
  return ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', ...names].filter(k => !process.env[k]);
}

function app() {
  if (getApps().length) return getApps()[0];
  const env = process.env;
  // A chave costuma vir com "\n" escrito em vez de quebra de linha; aqui conserta
  const privateKey = String(env.FIREBASE_PRIVATE_KEY || '').replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  return initializeApp({
    credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey }),
  });
}

export const db = () => getFirestore(app());
export const auth = () => getAuth(app());

/** Confere o token de login que o app manda e devolve o id da pessoa */
export async function userFrom(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Entre na sua conta de novo.');
  try {
    return (await auth().verifyIdToken(token)).uid;
  } catch {
    throw new HttpError(401, 'Sua sessão expirou. Entre de novo.');
  }
}

/** Dados do app de uma pessoa (o documento users/{uid} guarda tudo como texto JSON) */
export async function appData(uid) {
  const snap = await db().doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  try { return JSON.parse(snap.get('data') || 'null'); } catch { return null; }
}

/** Apaga tudo de uma pessoa: dados, aparelhos, perfil, amizades, grupos, padrinho e a conta */
export async function deleteEverything(uid) {
  const fs = db();
  const profile = await fs.doc(`profiles/${uid}`).get();

  await fs.recursiveDelete(fs.doc(`users/${uid}`));          // inclui users/{uid}/push
  await fs.recursiveDelete(fs.doc(`inbox/${uid}`));          // inclui inbox/{uid}/items
  const batch = fs.batch();
  batch.delete(fs.doc(`stats/${uid}`));
  batch.delete(fs.doc(`limits/${uid}`));
  batch.delete(fs.doc(`sponsors/${uid}`));
  batch.delete(fs.doc(`profiles/${uid}`));
  if (profile.exists && profile.get('code')) batch.delete(fs.doc(`codes/${profile.get('code')}`));
  (await fs.collection('friendships').where('users', 'array-contains', uid).get()).forEach(d => batch.delete(d.ref));
  (await fs.collection('sponsors').where('sponsorId', '==', uid).get()).forEach(d => batch.delete(d.ref));
  await batch.commit();

  // Grupos: sai de todos; os que eram dela passam para outra pessoa (ou somem se ficarem vazios)
  const groups = await fs.collection('groups').where('members', 'array-contains', uid).get();
  for (const g of groups.docs) await leaveGroup(g.ref, uid);

  await auth().deleteUser(uid).catch(err => { if (err.code !== 'auth/user-not-found') throw err; });
}

/** Tira alguém de um grupo. Se ficar vazio, apaga o grupo com mural e desafios. */
export async function leaveGroup(ref, uid) {
  const fs = db();
  const empty = await fs.runTransaction(async tx => {
    const g = await tx.get(ref);
    if (!g.exists) return false;
    const members = (g.get('members') || []).filter(m => m !== uid);
    if (!members.length) return true;
    const owner = g.get('owner') === uid ? members[0] : g.get('owner');
    tx.update(ref, { members, owner });
    return false;
  });
  if (empty) await deleteGroup(ref);
}

export async function deleteGroup(ref) {
  const fs = db();
  const challenges = await fs.collection('challenges').where('groupId', '==', ref.id).get();
  const batch = fs.batch();
  challenges.forEach(c => batch.delete(c.ref));
  await batch.commit();
  await fs.recursiveDelete(ref);   // inclui groups/{id}/events
}
