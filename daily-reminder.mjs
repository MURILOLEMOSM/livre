/* =========================================================
   LIVRE · lembrete diário
   Roda de hora em hora no Netlify. Para cada aparelho cuja hora
   local bate com o horário escolhido (e que ainda não recebeu hoje),
   lê os hábitos da pessoa e manda uma notificação push.

   Aparelhos ficam em users/{uid}/push/{id} no Firestore.

   Variáveis de ambiente (Netlify > Site configuration > Environment variables):
     FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
     VAPID_PUBLIC_KEY    gerada com: npx web-push generate-vapid-keys
     VAPID_PRIVATE_KEY   idem
     VAPID_SUBJECT       mailto:seu-email@exemplo.com
   ========================================================= */

import webpush from 'web-push';
import { db, missingEnv, appData } from '../lib/firebase.mjs';
import { isDue, isWeakDue, buildMessage, buildWeakMessage, localParts } from '../lib/reminder.mjs';

export default async () => {
  const env = process.env;
  const missing = missingEnv(['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY']);
  if (missing.length) {
    console.error('[LIVRE] Faltam variáveis de ambiente:', missing.join(', '));
    return new Response(`Faltam: ${missing.join(', ')}`, { status: 500 });
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:contato@exemplo.com', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const fs = db();
  const now = new Date();

  let snap;
  try {
    snap = await fs.collectionGroup('push').get();
  } catch (err) {
    console.error('[LIVRE] Erro ao ler aparelhos:', err.message);
    return new Response('erro', { status: 500 });
  }

  const subs = snap.docs.map(d => ({ ref: d.ref, user_id: d.ref.parent.parent.id, ...d.data() }));
  const due = subs.filter(s => isDue(s, now));
  const weak = subs.filter(s => isWeakDue(s, now));
  if (!due.length && !weak.length) return new Response('Nenhum lembrete nesta hora.');

  const userIds = [...new Set([...due, ...weak].map(s => s.user_id))];
  const dataByUser = new Map(await Promise.all(userIds.map(async u => [u, await appData(u)])));

  const send = s => (msg, ttl) => webpush.sendNotification(
    { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(msg), { TTL: ttl });

  let sent = 0, removed = 0, failed = 0;
  for (const sub of due) {
    const msg = buildMessage(dataByUser.get(sub.user_id), now.getTime());
    if (msg) {
      try {
        await send(sub)(msg, 6 * 3600);
        sent++;
      } catch (err) {
        // 404/410: o aparelho cancelou a inscrição ou desinstalou o app
        if (err.statusCode === 404 || err.statusCode === 410) {
          await sub.ref.delete();
          removed++;
          continue;
        }
        console.error('[LIVRE] Falha ao enviar:', err.statusCode, err.body);
        failed++;
        continue; // não marca como enviado; tenta de novo amanhã no mesmo horário
      }
    }
    await sub.ref.update({ last_sent_on: localParts(now, sub.tz).date });
  }

  // Alerta do ponto fraco (dia e hora em que a pessoa mais recai)
  for (const sub of weak) {
    const msg = buildWeakMessage(dataByUser.get(sub.user_id));
    if (!msg) continue;
    try {
      await send(sub)(msg, 2 * 3600);
      sent++;
      await sub.ref.update({ last_weak_on: localParts(now, sub.tz).date });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await sub.ref.delete().catch(() => {});
        removed++;
      } else { console.error('[LIVRE] Falha no alerta:', err.statusCode, err.body); failed++; }
    }
  }

  console.log(`[LIVRE] enviados: ${sent}, removidos: ${removed}, falhas: ${failed}`);
  return new Response(JSON.stringify({ sent, removed, failed }), { headers: { 'content-type': 'application/json' } });
};

export const config = { schedule: '@hourly' };
