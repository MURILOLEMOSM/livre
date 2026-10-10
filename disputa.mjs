/* =========================================================
   LIVRE · Disputa (POST /api/disputa)
   Amigos, grupos de até 10, placar, mural, desafios e padrinho.

   O app manda { op, args } com o token de login. Tudo que é
   social passa por aqui: as regras do Firestore não deixam o app
   ler nem gravar essas coleções direto. Assim ninguém consegue
   ver dados de quem não é amigo nem do mesmo grupo.

   Coleções:
     profiles/{uid}            nome e ID de amigo
     codes/{code}              ID de amigo -> uid (garante que não repete)
     stats/{uid}               o que a pessoa mostra no placar (o app grava)
     friendships/{uidA_uidB}   pedido e amizade
     groups/{id}               grupo (members: até 10 uids)
     groups/{id}/events        mural do grupo
     challenges/{id}           desafios com prazo
     sponsors/{uid}            padrinho escolhido
     inbox/{uid}/items         força recebida e avisos do apadrinhado
   ========================================================= */

import { randomInt } from 'node:crypto';
import { db, json, userFrom, HttpError, missingEnv, leaveGroup, deleteGroup } from '../lib/firebase.mjs';

const MAX_GROUP = 10;
const DAY = 86_400_000;
const CATEGORIES = ['bebidas', 'cigarro', 'pornografia', 'gula', 'jogos', 'redes', 'apostas', 'outro'];
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sem 0, O, 1 e I
const randomCode = n => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

// Os códigos de erro são traduzidos no app (social.js)
const err = code => new HttpError(400, code);
const pairId = (a, b) => [a, b].sort().join('_');
const cleanCode = c => String(c || '').trim().toUpperCase();
const str = (v, max) => String(v ?? '').trim().slice(0, max);

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (missingEnv().length) return json({ error: 'Servidor sem configuração.' }, 500);

  try {
    const me = await userFrom(req);
    const { op, args = {} } = await req.json().catch(() => ({}));
    const fn = OPS[op];
    if (!fn) return json({ error: 'Operação desconhecida.' }, 400);
    return json({ result: (await fn(me, args, db())) ?? null });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error('[LIVRE] disputa:', e);
    return json({ error: 'Algo deu errado no servidor. Tente de novo.' }, 500);
  }
};

export const config = { path: '/api/disputa' };

/* ---------- Ajudantes ---------- */
async function profilesOf(fs, uids) {
  if (!uids.length) return new Map();
  const snaps = await fs.getAll(...uids.map(u => fs.doc(`profiles/${u}`)));
  return new Map(snaps.filter(s => s.exists).map(s => [s.id, { id: s.id, name: s.get('name'), code: s.get('code') }]));
}

async function areFriends(fs, a, b) {
  const f = await fs.doc(`friendships/${pairId(a, b)}`).get();
  return f.exists && f.get('status') === 'accepted';
}

async function memberGroup(fs, me, groupId) {
  if (!groupId || typeof groupId !== 'string') throw err('FORA_DO_GRUPO');
  const g = await fs.doc(`groups/${groupId}`).get();
  if (!g.exists || !(g.get('members') || []).includes(me)) throw err('FORA_DO_GRUPO');
  return g;
}

/* ---------- Operações ---------- */
const OPS = {
  /** Cria (ou atualiza o nome) do perfil e devolve nome e ID de amigo */
  async ensureProfile(me, { name }, fs) {
    const wanted = str(name, 30);
    const ref = fs.doc(`profiles/${me}`);
    for (let i = 0; i < 6; i++) {
      const out = await fs.runTransaction(async tx => {
        const p = await tx.get(ref);
        if (p.exists) {
          if (wanted && wanted !== p.get('name')) tx.update(ref, { name: wanted });
          return { name: wanted || p.get('name'), code: p.get('code') };
        }
        const code = `LIV-${randomCode(5)}`;
        const taken = await tx.get(fs.doc(`codes/${code}`));
        if (taken.exists) return null;   // código repetido: tenta outro
        tx.set(fs.doc(`codes/${code}`), { uid: me });
        tx.set(ref, { name: wanted || 'Sem nome', code, createdAt: Date.now() });
        return { name: wanted || 'Sem nome', code };
      });
      if (out) return out;
    }
    throw new HttpError(500, 'Não deu para criar seu ID agora. Tente de novo.');
  },

  /** Procura alguém pelo ID (devolve só nome e ID) */
  async find(me, { code }, fs) {
    const c = await fs.doc(`codes/${cleanCode(code)}`).get();
    if (!c.exists) return null;
    return (await profilesOf(fs, [c.get('uid')])).get(c.get('uid')) || null;
  },

  /** Pede amizade. Se a outra pessoa já tinha pedido, vira amizade na hora. */
  async request(me, { code }, fs) {
    const c = await fs.doc(`codes/${cleanCode(code)}`).get();
    if (!c.exists) throw err('ID_NAO_ENCONTRADO');
    const them = c.get('uid');
    if (them === me) throw err('VOCE_MESMO');
    const ref = fs.doc(`friendships/${pairId(me, them)}`);
    return fs.runTransaction(async tx => {
      const f = await tx.get(ref);
      if (f.exists && f.get('status') === 'accepted') return 'ja_amigos';
      if (f.exists && f.get('addressee') === me) { tx.update(ref, { status: 'accepted' }); return 'aceito'; }
      if (!f.exists) tx.set(ref, { users: [me, them], requester: me, addressee: them, status: 'pending', createdAt: Date.now() });
      return 'enviado';
    });
  },

  async accept(me, { fid }, fs) {
    const ref = fs.doc(`friendships/${String(fid)}`);
    const f = await ref.get();
    if (!f.exists || f.get('addressee') !== me || f.get('status') !== 'pending') throw err('PEDIDO_NAO_ENCONTRADO');
    await ref.update({ status: 'accepted' });
  },

  async removeFriend(me, { fid }, fs) {
    const ref = fs.doc(`friendships/${String(fid)}`);
    const f = await ref.get();
    if (f.exists && (f.get('users') || []).includes(me)) await ref.delete();
  },

  /** Amigos e pedidos, já com nome e ID */
  async friends(me, args, fs) {
    const snap = await fs.collection('friendships').where('users', 'array-contains', me).get();
    const rows = snap.docs.map(d => ({ fid: d.id, other: d.get('users').find(u => u !== me), status: d.get('status'), incoming: d.get('addressee') === me }));
    const profiles = await profilesOf(fs, rows.map(r => r.other));
    return rows
      .filter(r => profiles.has(r.other))
      .map(r => ({ fid: r.fid, id: r.other, name: profiles.get(r.other).name, code: profiles.get(r.other).code, status: r.status, incoming: r.incoming }))
      .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'pending' ? -1 : 1));
  },

  /** Seus grupos com número de pessoas */
  async groups(me, args, fs) {
    const snap = await fs.collection('groups').where('members', 'array-contains', me).get();
    return snap.docs
      .map(d => ({ id: d.id, name: d.get('name'), code: d.get('code'), owner: d.get('owner') === me, members: (d.get('members') || []).length, createdAt: d.get('createdAt') || 0 }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Cria um grupo já com você dentro */
  async createGroup(me, { name }, fs) {
    const n = str(name, 40);
    if (!n) throw new HttpError(400, 'Dê um nome para o grupo.');
    let code;
    for (let i = 0; i < 5; i++) {
      code = randomCode(8);
      if ((await fs.collection('groups').where('code', '==', code).limit(1).get()).empty) break;
    }
    const ref = await fs.collection('groups').add({ name: n, owner: me, code, members: [me], createdAt: Date.now() });
    return ref.id;
  },

  /** Entra pelo código do convite (o link leva esse código) */
  async join(me, { code }, fs) {
    const snap = await fs.collection('groups').where('code', '==', cleanCode(code)).limit(1).get();
    if (snap.empty) throw err('CONVITE_INVALIDO');
    const ref = snap.docs[0].ref;
    await fs.runTransaction(async tx => {
      const g = await tx.get(ref);
      const members = g.get('members') || [];
      if (members.includes(me)) return;
      if (members.length >= MAX_GROUP) throw err('GRUPO_CHEIO');
      tx.update(ref, { members: [...members, me] });
    });
    return ref.id;
  },

  /** Coloca um amigo no grupo (precisa ser amigo e estar no grupo) */
  async addToGroup(me, { groupId, userId }, fs) {
    await memberGroup(fs, me, groupId);
    if (!userId || !(await areFriends(fs, me, userId))) throw err('NAO_E_AMIGO');
    const ref = fs.doc(`groups/${groupId}`);
    await fs.runTransaction(async tx => {
      const g = await tx.get(ref);
      const members = g.get('members') || [];
      if (members.includes(userId)) return;
      if (members.length >= MAX_GROUP) throw err('GRUPO_CHEIO');
      tx.update(ref, { members: [...members, userId] });
    });
  },

  async leave(me, { groupId }, fs) {
    const g = await memberGroup(fs, me, groupId);
    await leaveGroup(g.ref, me);
  },

  async deleteGroup(me, { groupId }, fs) {
    const g = await memberGroup(fs, me, groupId);
    if (g.get('owner') !== me) throw new HttpError(403, 'Só quem criou o grupo pode apagar.');
    await deleteGroup(g.ref);
  },

  /** Placar: cada membro com nome, ID e o que escolheu mostrar */
  async board(me, { groupId }, fs) {
    const g = await memberGroup(fs, me, groupId);
    const members = g.get('members') || [];
    const [profiles, stats] = await Promise.all([
      profilesOf(fs, members),
      fs.getAll(...members.map(u => fs.doc(`stats/${u}`))),
    ]);
    const statsBy = new Map(stats.filter(s => s.exists).map(s => [s.id, s.get('habits')]));
    return members.map(u => ({
      id: u,
      name: profiles.get(u)?.name || 'Sem nome',
      code: profiles.get(u)?.code || '',
      me: u === me,
      habits: Array.isArray(statsBy.get(u)) ? statsBy.get(u) : [],
    }));
  },

  /** Mural do grupo: últimos 30 acontecimentos */
  async feed(me, { groupId }, fs) {
    const g = await memberGroup(fs, me, groupId);
    const snap = await g.ref.collection('events').orderBy('at', 'desc').limit(30).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /** Recebidos nos últimos 7 dias */
  async inbox(me, args, fs) {
    const snap = await fs.collection(`inbox/${me}/items`).where('at', '>', Date.now() - 7 * DAY).orderBy('at', 'desc').limit(20).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async challenges(me, { groupId }, fs) {
    await memberGroup(fs, me, groupId);
    const snap = await fs.collection('challenges').where('groupId', '==', groupId).get();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.endsAt > Date.now() - 7 * DAY)
      .sort((a, b) => a.endsAt - b.endsAt);
  },

  /** Cria um desafio no grupo (no máximo 3 valendo ao mesmo tempo) */
  async createChallenge(me, { groupId, title, category, days }, fs) {
    await memberGroup(fs, me, groupId);
    const d = Number(days);
    if (!Number.isInteger(d) || d < 1 || d > 365) throw err('PRAZO_INVALIDO');
    const t = str(title, 50);
    if (!t) throw new HttpError(400, 'Dê um nome para o desafio.');
    if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Categoria inválida.');
    const active = await fs.collection('challenges').where('groupId', '==', groupId).get();
    if (active.docs.filter(c => c.get('endsAt') > Date.now()).length >= 3) throw err('DESAFIOS_DEMAIS');
    const now = Date.now();
    const ref = await fs.collection('challenges').add({ groupId, title: t, category, days: d, startsAt: now, endsAt: now + d * DAY, createdBy: me });
    return ref.id;
  },

  /** Apaga um desafio (quem criou ou o dono do grupo) */
  async deleteChallenge(me, { id }, fs) {
    const ref = fs.doc(`challenges/${String(id)}`);
    const c = await ref.get();
    if (!c.exists) return;
    const g = await fs.doc(`groups/${c.get('groupId')}`).get();
    if (c.get('createdBy') !== me && g.get('owner') !== me) throw new HttpError(403, 'Só quem criou o desafio ou o dono do grupo pode apagar.');
    await ref.delete();
  },

  /** Quem é o meu padrinho e de quem eu sou padrinho */
  async sponsorship(me, args, fs) {
    const [mine, theirs] = await Promise.all([
      fs.doc(`sponsors/${me}`).get(),
      fs.collection('sponsors').where('sponsorId', '==', me).get(),
    ]);
    const sponsorId = mine.exists ? mine.get('sponsorId') : null;
    const ids = [...(sponsorId ? [sponsorId] : []), ...theirs.docs.map(d => d.id)];
    const profiles = await profilesOf(fs, ids);
    return {
      sponsor: (sponsorId && profiles.get(sponsorId)) || null,
      sponsoring: theirs.docs.map(d => profiles.get(d.id)).filter(Boolean),
    };
  },

  /** Escolhe (ou tira, com null) o padrinho. Precisa ser amigo. */
  async setSponsor(me, { friendId }, fs) {
    const ref = fs.doc(`sponsors/${me}`);
    if (!friendId) { await ref.delete(); return; }
    if (friendId === me || !(await areFriends(fs, me, friendId))) throw err('NAO_E_AMIGO');
    await ref.set({ sponsorId: friendId, createdAt: Date.now() });
  },
};
