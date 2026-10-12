import { esc, ic, SIMBOLO, hojeISO, dataLonga, DIAS_L, paraData, relativo } from '../util.js';
import { S, estatisticas, nomeEx } from '../store.js';
import { AULAS, UNIDADE } from '../data.js';

export function tela() {
  const s = S(), st = estatisticas(), hoje = hojeISO();
  const ficha = s.fichas.find(f => f.id === s.fichaAtual) || s.fichas[0];
  const h = new Date().getHours();
  const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const treinouHoje = s.historico.some(x => x.data === hoje);
  const pct = Math.min(100, Math.round((st.semana / s.user.meta) * 100));

  // próxima aula reservada
  const agoraHM = new Date().toTimeString().slice(0, 5);
  const prox = s.reservas.filter(r => r.data > hoje || (r.data === hoje && r.hora >= agoraHM)).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];
  const aulaProx = prox && AULAS.find(a => a.id === prox.aula);

  // lotação agora
  const idx = Math.min(Math.max(h - 5, 0), UNIDADE.curva.length - 1);
  const lot = h < 5 || h >= 23 ? 0 : UNIDADE.curva[idx];
  const nivel = lot < 35 ? ['Tranquila', 'menta'] : lot < 70 ? ['Movimentada', 'ambar'] : ['Cheia', 'coral'];

  const aviso = s.notifs.find(n => !n.lida);
  const vence = s.fichas[0].vence;
  const diasVence = Math.round((paraData(vence) - paraData(hoje)) / 864e5);

  return {
    titulo: 'Livre Fit',
    html: `
    <div class="ola"><p class="sub" style="margin:0">${DIAS_L[new Date().getDay()]}, ${dataLonga(hoje)}</p><h2>${saud}, ${esc(s.user.nome)}!</h2></div>

    ${s.sessao ? `<a class="card click" href="#/sessao" style="background:var(--coral);color:var(--tinta);margin-bottom:12px"><div class="entre"><div><b>Treino em andamento</b><div class="peq">${esc(s.sessao.nome)} · toque para continuar</div></div>${ic('play', 'width="26" height="26"')}</div></a>` : ''}

    <div class="hero-treino">
      <span class="anilha">${SIMBOLO}</span>
      <span class="chip" style="background:rgba(15,17,21,.12);color:var(--tinta)">${treinouHoje ? 'Treino de hoje concluído ✓' : 'Treino de hoje'}</span>
      <h3>${esc(ficha.nome)} · ${esc(ficha.foco)}</h3>
      <p style="margin:0;opacity:.75">${ficha.exercicios.length} exercícios · ~${ficha.exercicios.reduce((a, e) => a + e.series, 0) * 2} min</p>
      <a class="btn" href="#/treino">${ic('play')} ${treinouHoje ? 'Ver ficha' : 'Começar treino'}</a>
    </div>

    <div class="atalhos">
      <a class="atalho" href="#/acesso"><i>${ic('qr')}</i>Check-in</a>
      <a class="atalho" href="#/aulas"><i>${ic('agenda')}</i>Reservar aula</a>
      <a class="atalho" href="#/go"><i>${ic('raio')}</i>Livre Go</a>
      <a class="atalho" href="#/evolucao"><i>${ic('grafico')}</i>Evolução</a>
    </div>

    <div class="secao"><h2>Sua semana</h2><a href="#/evolucao">Ver tudo</a></div>
    <div class="card linha">
      <div class="anel" style="--p:${pct}"><span>${st.semana}/${s.user.meta}</span></div>
      <div class="cresce">
        <b>${st.semana >= s.user.meta ? 'Meta da semana batida! 🎉' : `Faltam ${s.user.meta - st.semana} treino${s.user.meta - st.semana > 1 ? 's' : ''} para a meta`}</b>
        <div class="sub peq">${ic('fogo', 'width="14" height="14" style="vertical-align:-2px;color:var(--coral)"')} Sequência atual: ${st.sequencia} dia${st.sequencia === 1 ? '' : 's'} · recorde ${st.maiorSequencia}</div>
      </div>
    </div>

    <div class="secao"><h2>Próxima aula</h2><a href="#/aulas">Grade</a></div>
    ${aulaProx ? `<a class="card click linha" href="#/aulas">
        <div style="width:6px;align-self:stretch;border-radius:3px;background:${aulaProx.cor}"></div>
        <div class="cresce"><b>${esc(aulaProx.nome)}</b><div class="sub peq">${prox.data === hoje ? 'Hoje' : dataLonga(prox.data)} às ${prox.hora} · ${esc(aulaProx.sala)}</div></div>
        <span class="chip lima">Reservada</span></a>`
      : `<div class="vazio">Nenhuma aula reservada. <a class="link" href="#/aulas">Ver grade</a></div>`}

    <div class="secao"><h2>Lotação agora</h2><span class="chip ${nivel[1]}">${nivel[0]} · ${lot}%</span></div>
    <div class="card">
      <div class="lotacao" aria-label="Ocupação por horário">${UNIDADE.curva.map((v, i) => `<i style="height:${Math.max(6, v)}%" class="${i === idx && lot ? 'agora' : ''}" title="${i + 5}h: ${v}%"></i>`).join('')}</div>
      <div class="lotacao-legenda"><span>5h</span><span>12h</span><span>18h</span><span>22h</span></div>
      <p class="sub peq" style="margin:8px 0 0">${lot >= 70 ? 'Dica: depois das 21h costuma ficar mais vazio.' : 'Bom horário para treinar.'}</p>
    </div>

    ${aviso ? `<div class="secao"><h2>Recado</h2><a href="#/notificacoes">Todos</a></div>
      <a class="card click" href="${aviso.link || '#/notificacoes'}"><b>${esc(aviso.titulo)}</b><div class="sub peq">${esc(aviso.texto)} · ${relativo(aviso.ts)}</div></a>` : ''}

    ${diasVence <= 45 ? `<div class="card" style="margin-top:10px;border:1px solid rgba(255,176,61,.35)"><div class="entre"><div><b>Ficha vence em ${diasVence} dias</b><div class="sub peq">Agende a revisão com um professor</div></div><a class="btn peq sec" href="#/servicos">Agendar</a></div></div>` : ''}

    <div class="secao"><h2>Últimos treinos</h2><a href="#/historico">Histórico</a></div>
    ${s.historico.slice(-3).reverse().map(x => `<div class="card linha"><div class="cresce"><b>${esc(x.nome)}</b><div class="sub peq">${dataLonga(x.data)} · ${x.duracao} min · ${Math.round(x.volume).toLocaleString('pt-BR')} kg levantados</div></div></div>`).join('') || '<div class="vazio">Seus treinos aparecem aqui.</div>'}
    <p class="sub peq" style="margin-top:20px;text-align:center">Exercício mais pesado da ficha: ${esc(nomeEx(ficha.exercicios.reduce((a, e) => e.carga > a.carga ? e : a).ex))}</p>
    `,
  };
}
