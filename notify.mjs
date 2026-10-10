/* =========================================================
   LIVRE · avisos da Disputa (POST /api/avisar)
   O app manda o tipo de aviso com o token de login. A função
   confere quem é, se pode avisar aquelas pessoas, grava no mural
   e manda o push na hora.

   Tipos:
   - sos:       "Fulano precisa de força agora" para os grupos dele
   - cheer:     força para uma pessoa (do mesmo grupo ou amiga)
   - milestone: "Fulano completou 30 dias" no mural (sem push)
   - relapse:   avisa o padrinho, se a pessoa escolheu ter um

   Usa as variáveis do Firebase (veja netlify/lib/firebase.mjs)
   e VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_SUBJECT.
   ========================================================= */

import webpush from 'web-push';
import { db, json, userFrom, HttpError, missingEnv, appData } from '../lib/firebase.mjs';

const CATEGORY_LABEL = {
  bebidas: 'bebida', cigarro: 'cigarro', pornografia: 'pornografia', gula: 'gula',
  redes: 'redes sociais', jogos: 'jogos', apostas: 'apostas', outro: 'um hábito',
};
const MIN = 60_000;

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (missingEnv().length) return json({ error: 'Servidor sem configuração.' }, 500);
  try {
    return await handle(req);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error('[LIVRE] avisar:', e);
    return json({ error: 'Não deu para avisar agora.' }, 500);
  }
};

export const config = { path: '/api/avisar' };

async function handle(req) {
  const fs = db();
  const me = await userFrom(req);
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'Pedido inválido.' }, 400);
  const { kind, groupId = null, targetId = null } = body;
  const category = CATEGORY_LABEL[body.category] ? body.category : null;
  const days = Number.isInteger(body.days) ? body.days : null;

  const [profile, groupsSnap] = await Promise.all([
    fs.doc(`profiles/${me}`).get(),
    fs.collection('groups').where('members', 'array-contains', me).get(),
  ]);
  const myName = profile.exists ? profile.get('name') : 'Alguém do seu grupo';
  const groups = groupsSnap.docs;
  const groupIds = groups.map(g => g.id);

  // Limite de avisos por pessoa (guarda os horários dos últimos envios)
  const limitsRef = fs.doc(`limits/${me}`);
  const limits = (await limitsRef.get()).data() || {};
  const recent = (key, mins) => (limits[key] || []).filter(t => t > Date.now() - mins * MIN);
  const mark = key => { limits[key] = [...recent(key, 24 * 60), Date.now()].slice(-20); };

  const now = Date.now();
  let toGroups = [];     // grupos que recebem no mural
  let target = null;     // pessoa que recebe na caixa "Recebidos"
  let recipients = [];   // quem recebe push
  let message = null;
  let payload = {};

  if (kind === 'sos') {
    if (recent('sos', 60).length >= 3) return json({ error: 'Você já pediu força agora há pouco. Seus amigos já foram avisados.' }, 429);
    toGroups = groupId ? groups.filter(g => g.id === groupId) : groups;
    if (!toGroups.length) return json({ error: 'Você ainda não está em nenhum grupo.' }, 400);
    payload = category ? { category } : {};
    recipients = [...new Set(toGroups.flatMap(g => g.get('members') || []))].filter(u => u !== me);
    message = { title: `${myName} precisa de força agora`, body: 'Bateu a vontade. Manda um incentivo pelo app.', url: `./#/disputa${groupId ? `/${groupId}` : ''}` };
    mark('sos');

  } else if (kind === 'cheer') {
    if (!targetId || typeof targetId !== 'string' || targetId === me) return json({ error: 'Pessoa inválida.' }, 400);
    const sameGroup = groups.some(g => (g.get('members') || []).includes(targetId));
    const pair = await fs.doc(`friendships/${[me, targetId].sort().join('_')}`).get();
    const friends = pair.exists && pair.get('status') === 'accepted';
    if (!sameGroup && !friends) return json({ error: 'Só dá para mandar força para amigos e gente do seu grupo.' }, 403);
    const key = `cheer_${targetId}`;
    if (recent(key, 10).length >= 1) return json({ ok: true, repeated: true });
    toGroups = groupId && groupIds.includes(groupId) ? groups.filter(g => g.id === groupId) : [];
    target = targetId;
    recipients = [targetId];
    message = { title: `${myName} te mandou força`, body: 'Segura firme. Tem gente torcendo por você.', url: './#/disputa' };
    mark(key);

  } else if (kind === 'milestone') {
    if (!category || !days) return json({ error: 'Marco inválido.' }, 400);
    if (recent('milestone', 60).length >= 10) return json({ ok: true, repeated: true });
    toGroups = groups;
    payload = { category, days };
    mark('milestone');

  } else if (kind === 'relapse') {
    const sp = await fs.doc(`sponsors/${me}`).get();
    if (!sp.exists) return json({ ok: true, noSponsor: true });
    if (recent('relapse', 24 * 60).length >= 5) return json({ ok: true, repeated: true });
    target = sp.get('sponsorId');
    payload = category ? { category } : {};
    recipients = [target];
    message = { title: `${myName} teve uma recaída`, body: `${category ? `Foi com ${CATEGORY_LABEL[category]}. ` : ''}Uma mensagem sua agora pode fazer diferença.`, url: './#/disputa' };
    mark('relapse');

  } else {
    return json({ error: 'Tipo de aviso desconhecido.' }, 400);
  }

  // Grava no mural e na caixa de quem recebe (com os nomes, para não precisar buscar depois)
  let targetName = null;
  if (target) {
    const tp = await fs.doc(`profiles/${target}`).get();
    targetName = tp.exists ? tp.get('name') : null;
  }
  const event = { kind, actor: me, actorName: myName, target, targetName, payload, at: now };
  const batch = fs.batch();
  toGroups.forEach(g => batch.set(g.ref.collection('events').doc(), event));
  if (target) batch.set(fs.collection(`inbox/${target}/items`).doc(), event);
  batch.set(limitsRef, limits);
  await batch.commit();

  // Push na hora (quem estiver em modo discreto recebe um texto neutro)
  let sent = 0;
  const env = process.env;
  if (message && recipients.length && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:contato@exemplo.com', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
    await Promise.all(recipients.slice(0, 30).map(async uid => {
      const [subs, data] = await Promise.all([fs.collection(`users/${uid}/push`).get(), appData(uid)]);
      const msg = data?.settings?.discreet ? { title: 'Nova mensagem', body: 'Abra o app para ver.', url: message.url } : message;
      await Promise.all(subs.docs.map(async s => {
        try {
          await webpush.sendNotification({ endpoint: s.get('endpoint'), keys: { p256dh: s.get('p256dh'), auth: s.get('auth') } }, JSON.stringify(msg), { TTL: 3600 });
          sent++;
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) await s.ref.delete();
        }
      }));
    }));
  }

  return json({ ok: true, notified: recipients.length, sent });
}
