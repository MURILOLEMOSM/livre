import { $$, esc, ic, toast, folha, confirmar, hojeISO, somaDias, paraData, DIAS, dataLonga, ics, baixar } from '../util.js';
import { S, mudar, notificar } from '../store.js';
import { AULAS, UNIDADE, ocupacao } from '../data.js';
import { figura } from '../demo.js';

let diaSel = null, filtro = 'todas';

// Lista as aulas de uma data, com vagas calculadas para a demonstração
function aulasDoDia(data) {
  const sem = paraData(data).getDay(), s = S();
  return AULAS.flatMap(a => a.dias.includes(sem) ? a.horas.map(hora => {
    const p = ocupacao(a.id, data, hora);
    const minha = s.reservas.some(r => r.aula === a.id && r.data === data && r.hora === hora);
    const espera = s.espera.find(r => r.aula === a.id && r.data === data && r.hora === hora);
    const ocupadas = p > 85 ? a.cap : Math.round(a.cap * p / 100 * .9) + (minha ? 1 : 0);
    return { ...a, hora, data, ocupadas: Math.min(ocupadas, a.cap), minha, espera };
  }) : []).sort((x, y) => x.hora.localeCompare(y.hora));
}

export function tela() {
  const hoje = hojeISO();
  if (!diaSel || diaSel < hoje) diaSel = hoje;
  const s = S();
  const agoraHM = new Date().toTimeString().slice(0, 5);
  const lista = aulasDoDia(diaSel).filter(a => filtro === 'todas' || (filtro === 'minhas' ? a.minha || a.espera : a.id === filtro));
  const minhas = s.reservas.filter(r => r.data > hoje || (r.data === hoje && r.hora >= agoraHM)).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  return {
    titulo: 'Aulas',
    html: `
    <div class="dias" role="tablist" aria-label="Dia">${Array.from({ length: 7 }, (_, i) => { const d = somaDias(hoje, i), dt = paraData(d); return `<button class="dia" role="tab" aria-selected="${d === diaSel}" data-dia="${d}"><small>${i ? DIAS[dt.getDay()] : 'hoje'}</small><b>${dt.getDate()}</b></button>`; }).join('')}</div>
    <div class="seg" style="margin:8px 0 4px">
      ${[['todas', 'Todas'], ['minhas', 'Minhas'], ...AULAS.map(a => [a.id, a.nome])].map(([id, n]) => `<button aria-selected="${filtro === id}" data-filtro="${id}">${esc(n)}</button>`).join('')}
    </div>
    <p class="sub peq" style="margin:8px 0">${esc(UNIDADE.nome)} · ${dataLonga(diaSel)}</p>
    <div class="lista">
    ${lista.map(a => {
      const passou = a.data === hoje && a.hora < agoraHM;
      const cheia = a.ocupadas >= a.cap && !a.minha;
      const livres = a.cap - a.ocupadas;
      return `<div class="card aula ${passou ? 'passou' : ''}">
        <time>${a.hora}</time>
        <button style="all:unset;cursor:pointer;min-width:0" data-info="${a.id}" data-hora="${a.hora}">
          <b style="display:block">${esc(a.nome)}</b>
          <span class="sub peq">${esc(a.sala)} · ${a.dur} min · ${esc(a.prof)}</span>
          <div class="barra"><i style="width:${a.ocupadas / a.cap * 100}%;background:${cheia ? 'var(--coral)' : livres <= 3 ? 'var(--ambar)' : 'var(--menta)'}"></i></div>
          <span class="sub peq">${cheia ? 'Lotada' : `${livres} vaga${livres === 1 ? '' : 's'}`}</span>
        </button>
        ${passou ? '<span class="chip">Encerrada</span>'
          : a.minha ? `<button class="btn peq" data-cancelar="${a.id}" data-hora="${a.hora}">${ic('check')} Reservada</button>`
          : a.espera ? `<button class="btn peq sec" data-sair="${a.id}" data-hora="${a.hora}">Na fila · ${a.espera.pos}º</button>`
          : cheia ? `<button class="btn peq contorno" data-fila="${a.id}" data-hora="${a.hora}">Lista de espera</button>`
          : `<button class="btn peq sec" data-reservar="${a.id}" data-hora="${a.hora}">Reservar</button>`}
      </div>`;
    }).join('') || '<div class="vazio">Nenhuma aula com esse filtro neste dia.</div>'}
    </div>

    <div class="secao"><h2>Minhas reservas</h2><span class="sub peq">${minhas.length}</span></div>
    ${minhas.map(r => { const a = AULAS.find(x => x.id === r.aula); return `<div class="card linha">
      <div style="width:6px;align-self:stretch;border-radius:3px;background:${a.cor}"></div>
      <div class="cresce"><b>${esc(a.nome)}</b><div class="sub peq">${r.data === hoje ? 'Hoje' : dataLonga(r.data)} às ${r.hora} · ${esc(a.sala)}</div></div>
      <button class="icone-btn" data-ics="${a.id}" data-data="${r.data}" data-hora="${r.hora}" aria-label="Adicionar ao calendário">${ic('baixar')}</button></div>`; }).join('') || '<div class="vazio">Você ainda não reservou nenhuma aula.</div>'}
    <p class="sub peq" style="margin-top:14px">Cancele com pelo menos 1 hora de antecedência para liberar a vaga para a lista de espera.</p>`,
    ligar(m) {
      const re = () => dispatchEvent(new HashChangeEvent('hashchange'));
      $$('[data-dia]', m).forEach(b => b.onclick = () => { diaSel = b.dataset.dia; re(); });
      $$('[data-filtro]', m).forEach(b => b.onclick = () => { filtro = b.dataset.filtro; re(); });
      $$('[data-reservar]', m).forEach(b => b.onclick = () => {
        const a = AULAS.find(x => x.id === b.dataset.reservar), hora = b.dataset.hora;
        mudar(s => {
          s.reservas.push({ aula: a.id, data: diaSel, hora });
          notificar('Reserva confirmada', `${a.nome} · ${dataLonga(diaSel)} às ${hora}. Chegue 5 minutos antes.`, 'aula', '#/aulas');
        });
        lembrete(a, diaSel, hora);
        toast(`Vaga garantida: ${a.nome} às ${hora}`);
        re();
      });
      $$('[data-cancelar]', m).forEach(b => b.onclick = async () => {
        const a = AULAS.find(x => x.id === b.dataset.cancelar), hora = b.dataset.hora;
        if (!await confirmar('Cancelar reserva?', `${a.nome} às ${hora}. A vaga vai para a lista de espera.`, 'Cancelar reserva', true)) return;
        mudar(s => { s.reservas = s.reservas.filter(r => !(r.aula === a.id && r.data === diaSel && r.hora === hora)); });
        toast('Reserva cancelada.');
        re();
      });
      $$('[data-fila]', m).forEach(b => b.onclick = () => {
        const a = AULAS.find(x => x.id === b.dataset.fila), hora = b.dataset.hora;
        const pos = 1 + (a.id.length + hora.length) % 4;
        mudar(s => { s.espera.push({ aula: a.id, data: diaSel, hora, pos }); notificar('Você entrou na lista de espera', `${a.nome} às ${hora}: você é o ${pos}º da fila. Avisamos se abrir vaga.`, 'aula', '#/aulas'); });
        toast(`Você é o ${pos}º na lista de espera.`);
        re();
      });
      $$('[data-sair]', m).forEach(b => b.onclick = () => {
        mudar(s => { s.espera = s.espera.filter(r => !(r.aula === b.dataset.sair && r.data === diaSel && r.hora === b.dataset.hora)); });
        toast('Você saiu da lista de espera.');
        re();
      });
      $$('[data-ics]', m).forEach(b => b.onclick = () => {
        const a = AULAS.find(x => x.id === b.dataset.ics);
        const [h, mi] = b.dataset.hora.split(':').map(Number);
        const ini = paraData(b.dataset.data); ini.setHours(h, mi);
        const fim = new Date(ini.getTime() + a.dur * 60000);
        baixar(`aula-${a.id}.ics`, ics({ titulo: `${a.nome} · Livre Fit`, local: `${UNIDADE.nome} · ${a.sala}`, inicio: ini, fim, desc: a.prof }), 'text/calendar');
      });
      $$('[data-info]', m).forEach(b => b.onclick = () => {
        const a = aulasDoDia(diaSel).find(x => x.id === b.dataset.info && x.hora === b.dataset.hora);
        folha(`<div class="demo" style="margin-bottom:14px">${figura(a.mov, { peso: false })}</div>
          <h2>${esc(a.nome)}</h2><p class="sub">${a.hora} · ${a.dur} min · ${esc(a.sala)} · ${esc(a.prof)}</p>
          <p>${a.ocupadas} de ${a.cap} vagas ocupadas.</p><button class="btn bloco sec" data-fechar>Fechar</button>`);
      });
    },
  };
}

// Lembrete enquanto o app estiver aberto (o navegador não permite agendar com ele fechado)
function lembrete(a, data, hora) {
  if (!S().prefs.lembretes || !('Notification' in window) || Notification.permission !== 'granted') return;
  const [h, m] = hora.split(':').map(Number);
  const quando = paraData(data); quando.setHours(h, m - 30);
  const ms = quando - Date.now();
  if (ms > 0 && ms < 6 * 36e5) setTimeout(() => { try { new Notification(`${a.nome} em 30 minutos`, { body: `${a.sala} · ${hora}`, icon: '../marca/icone-app.svg' }); } catch {} }, ms);
}
