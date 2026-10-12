import { $, $$, esc, ic, SIMBOLO, toast, folha, confirmar, hojeISO, somaDias, dataLonga, dataCurta, paraData, DIAS, brl, relativo, baixar, copiar, uid, bip, vibrar } from '../util.js';
import { S, mudar, estatisticas, notificar, apagarTudo } from '../store.js';
import { UNIDADE, PLANOS, SERVICOS, PARCEIROS, PARQ } from '../data.js';

const re = () => dispatchEvent(new HashChangeEvent('hashchange'));
const iniciais = n => (n || 'A').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

// ---------- Perfil ----------
export function perfil() {
  const s = S(), st = estatisticas();
  const aberta = s.faturas.find(f => f.status === 'aberta');
  const item = (href, i, t, d, extra = '') => `<a href="${href}"><i>${ic(i)}</i><span class="cresce"><b style="display:block">${t}</b><span class="sub peq">${d}</span></span>${extra}<span class="seta">${ic('seta', 'width="16" height="16"')}</span></a>`;
  return {
    titulo: 'Perfil',
    html: `
    <div class="perfil-cab"><span class="av g" style="background:var(--lima)">${esc(iniciais(s.user.nome))}</span>
      <div><h2 style="font-size:1.4rem;font-weight:900">${esc(s.user.nome)}</h2><div class="sub peq">Plano ${esc(s.user.plano)} · matrícula ${esc(s.user.matricula)}</div><div class="sub peq">Aluno desde ${dataLonga(s.user.desde)}</div></div></div>
    <div class="grade3">
      <div class="card"><div class="kpi">${s.historico.length}</div><div class="sub peq">treinos</div></div>
      <div class="card"><div class="kpi">${st.sequencia}</div><div class="sub peq">dias seguidos</div></div>
      <div class="card"><div class="kpi">${s.reservas.length}</div><div class="sub peq">aulas</div></div>
    </div>
    <div class="secao"><h2>Minha conta</h2></div>
    <nav class="menu-lista">
      ${item('#/evolucao', 'grafico', 'Evolução', 'Avaliações, frequência e conquistas')}
      ${item('#/financeiro', 'carteira', 'Plano e pagamentos', aberta ? `Fatura de ${brl(aberta.valor)} em aberto` : 'Tudo em dia', aberta ? '<span class="chip coral">1</span>' : '')}
      ${item('#/servicos', 'agenda', 'Agendar serviços', 'Avaliação, nutricionista, personal')}
      ${item('#/saude', 'saude', 'Saúde e documentos', s.saude.parq ? 'Questionário respondido' : 'Questionário pendente')}
      ${item('#/vantagens', 'presente', 'Clube de vantagens', `${PARCEIROS.length} parceiros com desconto`)}
    </nav>
    <div class="secao"><h2>Academia</h2></div>
    <nav class="menu-lista">
      ${item('#/unidade', 'mapa', esc(UNIDADE.nome), 'Horários, lotação e estrutura')}
      ${item('#/notificacoes', 'sino', 'Notificações', 'Avisos e recados')}
      ${item('#/ajustes', 'ajuste', 'Ajustes', 'Tema, sons, dados')}
    </nav>
    <p class="sub peq" style="text-align:center;margin-top:20px">Livre Fit · app do aluno · versão de demonstração</p>`,
  };
}

// ---------- Check-in / acesso ----------
function codigoAtual() {
  const janela = Math.floor(Date.now() / 30000);
  let h = 2166136261;
  for (const c of S().user.matricula + janela) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return { cod: String(h % 1000000).padStart(6, '0'), resta: 30 - Math.floor((Date.now() / 1000) % 30), semente: h };
}
// Padrão visual derivado do código (não é um QR de verdade: a catraca da demo lê os 6 dígitos)
function padrao(semente) {
  const N = 21; let x = semente || 1, cel = '';
  const rnd = () => (x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0, x ^= x >>> 13, (x >>> 0) / 4294967296);
  const olho = (cx, cy) => `<rect x="${cx}" y="${cy}" width="7" height="7" fill="#0f1115"/><rect x="${cx + 1}" y="${cy + 1}" width="5" height="5" fill="#fff"/><rect x="${cx + 2}" y="${cy + 2}" width="3" height="3" fill="#0f1115"/>`;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if ((i < 8 && j < 8) || (i < 8 && j > 12) || (i > 12 && j < 8)) continue;
    if (rnd() > .52) cel += `<rect x="${j}" y="${i}" width="1" height="1"/>`;
  }
  return `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" role="img" aria-label="Código de acesso"><g fill="#0f1115">${cel}</g>${olho(0, 0)}${olho(14, 0)}${olho(0, 14)}</svg>`;
}
export function acesso() {
  const s = S(), hoje = hojeISO(), fez = s.checkins.includes(hoje);
  const { cod, resta, semente } = codigoAtual();
  return {
    titulo: 'Check-in',
    html: `<div class="acesso">
      <p class="sub" style="margin:4px 0 0">Aproxime da catraca ou informe o código na recepção</p>
      <div class="codigo" id="cod">${padrao(semente)}</div>
      <div class="digitos" id="dig" aria-live="polite">${cod.slice(0, 3)} ${cod.slice(3)}</div>
      <div class="tempo-barra"><i id="tb" style="width:${resta / 30 * 100}%"></i></div>
      <p class="sub peq">O código muda a cada 30 segundos · <span id="rs">${resta}</span>s</p>
      <button class="btn bloco ${fez ? 'sec' : ''}" id="passar" style="margin-top:8px">${fez ? ic('check') + ' Check-in feito hoje' : 'Simular passagem na catraca'}</button>
    </div>
    <div class="secao"><h2>${esc(UNIDADE.nome)}</h2><a href="#/unidade">Detalhes</a></div>
    <div class="card"><div class="sub peq">${esc(UNIDADE.end)}</div><div class="peq" style="margin-top:6px">${UNIDADE.horarios.map(h => `${h[0]}: <b>${h[1]}</b>`).join(' · ')}</div></div>
    <div class="secao"><h2>Últimas entradas</h2></div>
    <div class="card">${[...s.checkins].sort().slice(-5).reverse().map(d => `<div class="entre" style="padding:6px 0"><span>${dataLonga(d)}</span><span class="sub peq">${DIAS[paraData(d).getDay()]}</span></div>`).join('') || '<p class="sub">Nenhuma entrada ainda.</p>'}</div>`,
    ligar(m) {
      const iv = setInterval(() => {
        const c = codigoAtual();
        const dig = $('#dig', m); if (!dig) return;
        if (dig.textContent.replace(' ', '') !== c.cod) { dig.textContent = `${c.cod.slice(0, 3)} ${c.cod.slice(3)}`; $('#cod', m).innerHTML = padrao(c.semente); }
        $('#rs', m).textContent = c.resta; $('#tb', m).style.width = c.resta / 30 * 100 + '%';
      }, 1000);
      $('#passar', m).onclick = () => {
        if (S().checkins.includes(hoje)) { toast('Você já fez check-in hoje. Bom treino!'); return; }
        mudar(s => { s.checkins.push(hoje); notificar('Check-in registrado', `Entrada na ${UNIDADE.nome} às ${new Date().toTimeString().slice(0, 5)}.`, 'acesso'); });
        bip(880, .1, 2); vibrar(60);
        toast('Catraca liberada. Bom treino! 💚');
        re();
      };
      return () => clearInterval(iv);
    },
  };
}

// ---------- Financeiro ----------
export function financeiro() {
  const s = S(), p = PLANOS[s.user.plano], c = s.contrato, hoje = hojeISO();
  const restam = Math.max(0, Math.round((paraData(c.fim) - paraData(hoje)) / 864e5));
  const forma = s.pagamento.tipo === 'cartao' ? `${s.pagamento.apelido} · final ${s.pagamento.final}` : s.pagamento.tipo === 'pix' ? 'Pix (cobrança mensal)' : 'Boleto';
  return {
    titulo: 'Plano e pagamentos',
    html: `
    <div class="cartao-plano"><span class="anilha">${SIMBOLO}</span>
      <span class="chip lima">${c.congelado ? 'Congelado' : 'Ativo'}</span>
      <h2 style="font-size:1.8rem;font-weight:900;margin:10px 0 2px">Plano ${esc(s.user.plano)}</h2>
      <p style="margin:0;opacity:.7">${esc(p.desc)}</p>
      <p style="margin:14px 0 0"><b class="num" style="font-size:1.5rem">${brl(p.preco)}</b> <span style="opacity:.7">/mês</span></p>
    </div>
    <div class="grade2" style="margin-top:10px">
      <div class="card"><div class="sub peq">Vigência</div><b>${dataCurta(c.inicio)} a ${dataCurta(c.fim)}</b><div class="sub peq">${restam} dias restantes</div></div>
      <div class="card"><div class="sub peq">Forma de pagamento</div><b style="font-size:.92rem">${esc(forma)}</b><div><button class="link" id="forma">Alterar</button></div></div>
    </div>
    ${c.congelado ? `<div class="card" style="margin-top:10px;border:1px solid rgba(61,255,176,.35)">Plano congelado até <b>${dataLonga(c.congelado)}</b>. <button class="link" id="descongelar">Voltar a treinar agora</button></div>` : ''}

    <div class="secao"><h2>Faturas</h2></div>
    <div class="lista">${[...s.faturas].reverse().map(f => `<div class="card fatura">
      <div class="cresce" style="flex:1"><b>${dataLonga(f.venc)}</b><div class="sub peq">${f.status === 'paga' ? 'Paga · ' + esc(f.forma || '') : 'Vence ' + dataCurta(f.venc)}</div></div>
      <b class="num">${brl(f.valor)}</b>
      ${f.status === 'paga' ? `<button class="icone-btn" data-recibo="${f.id}" aria-label="Baixar recibo">${ic('baixar')}</button>` : `<button class="btn peq coral" data-pagar="${f.id}">Pagar</button>`}
    </div>`).join('')}</div>

    <div class="secao"><h2>Gerenciar plano</h2></div>
    <nav class="menu-lista">
      <button id="trocar"><i>${ic('raio')}</i><span class="cresce"><b style="display:block">Trocar de plano</b><span class="sub peq">Livre, Plus ou Total</span></span></button>
      <button id="congelar" ${c.congelado ? 'disabled style="opacity:.5"' : ''}><i>${ic('lua')}</i><span class="cresce"><b style="display:block">Congelar plano</b><span class="sub peq">Pause por viagem ou saúde</span></span></button>
      <button id="cancelar"><i style="color:var(--coral)">${ic('sair')}</i><span class="cresce"><b style="display:block">Cancelar plano</b><span class="sub peq">Aviso de 30 dias, sem multa no mensal</span></span></button>
    </nav>
    <p class="sub peq" style="margin-top:14px">Demonstração: nenhum pagamento real é feito e nenhum dado de cartão é guardado.</p>`,
    ligar(m) {
      $$('[data-pagar]', m).forEach(b => b.onclick = () => pagar(S().faturas.find(f => f.id === b.dataset.pagar)));
      $$('[data-recibo]', m).forEach(b => b.onclick = () => {
        const f = S().faturas.find(x => x.id === b.dataset.recibo);
        baixar(`recibo-${f.venc}.txt`, `LIVRE FIT · RECIBO (demonstração)\n\nAluno: ${S().user.nome}\nMatrícula: ${S().user.matricula}\nPlano: ${S().user.plano}\nReferente a: ${dataLonga(f.venc)}\nValor: ${brl(f.valor)}\nPago com: ${f.forma}\n`);
      });
      $('#forma', m).onclick = () => folha(`<h2>Forma de pagamento</h2><p class="sub">Escolha como quer pagar as próximas mensalidades.</p>
        <form id="ff">
          <div class="seg" style="margin:10px 0">${[['cartao', 'Cartão'], ['pix', 'Pix'], ['boleto', 'Boleto']].map(([k, n]) => `<button type="button" aria-selected="${S().pagamento.tipo === k}" data-tipo="${k}">${n}</button>`).join('')}</div>
          <div id="campos-cartao">
            <label class="campo"><span>Apelido do cartão</span><input class="inp" name="apelido" value="${esc(S().pagamento.apelido || '')}" placeholder="Ex.: Cartão do banco"></label>
            <label class="campo"><span>Últimos 4 dígitos (demonstração)</span><input class="inp" name="final" inputmode="numeric" maxlength="4" pattern="\\d{4}" value="${esc(S().pagamento.final || '')}"></label>
          </div>
          <button class="btn bloco">Salvar</button></form>`, (f, fechar) => {
        let tipo = S().pagamento.tipo;
        const mostra = () => { $('#campos-cartao', f).hidden = tipo !== 'cartao'; };
        $$('[data-tipo]', f).forEach(b => b.onclick = () => { tipo = b.dataset.tipo; $$('[data-tipo]', f).forEach(x => x.setAttribute('aria-selected', String(x === b))); mostra(); });
        mostra();
        $('#ff', f).onsubmit = e => {
          e.preventDefault();
          const fm = e.target;
          if (tipo === 'cartao' && !/^\d{4}$/.test(fm.final.value)) { toast('Informe os 4 últimos dígitos.'); return; }
          mudar(s => { s.pagamento = { tipo, apelido: fm.apelido.value || 'Cartão', final: fm.final.value }; });
          fechar(); toast('Forma de pagamento atualizada.'); re();
        };
      });
      $('#trocar', m).onclick = () => folha(`<h2>Trocar de plano</h2><div class="lista" style="margin-top:12px">${Object.entries(PLANOS).map(([n, p]) => `<button class="card click" data-plano="${n}" style="${n === S().user.plano ? 'box-shadow:inset 0 0 0 2px var(--lima)' : ''}">
          <div class="entre"><b>${n}</b><b class="num">${brl(p.preco)}</b></div><div class="sub peq">${esc(p.desc)}</div></button>`).join('')}</div>`, (f, fechar) => {
        $$('[data-plano]', f).forEach(b => b.onclick = async () => {
          const n = b.dataset.plano; if (n === S().user.plano) return fechar();
          fechar();
          if (!await confirmar(`Mudar para o ${n}?`, `A próxima fatura passa a ser ${brl(PLANOS[n].preco)}.`, 'Confirmar troca')) return;
          mudar(s => { s.user.plano = n; const a = s.faturas.find(x => x.status === 'aberta'); if (a) a.valor = PLANOS[n].preco; notificar('Plano alterado', `Agora você está no plano ${n}.`, 'financeiro', '#/financeiro'); });
          toast(`Plano ${n} ativado!`); re();
        });
      });
      $('#congelar', m).onclick = () => folha(`<h2>Congelar plano</h2><p class="sub">Seu contrato é estendido pelo mesmo período. ${S().user.plano === 'Total' ? 'No Total, até 60 dias por ano.' : 'Até 30 dias por ano, com atestado ou comprovante de viagem.'}</p>
        <div class="seg" style="margin:12px 0">${[7, 15, 30].map(d => `<button data-dias="${d}" aria-selected="false">${d} dias</button>`).join('')}</div>`, (f, fechar) => {
        $$('[data-dias]', f).forEach(b => b.onclick = () => {
          const d = +b.dataset.dias;
          mudar(s => { s.contrato.congelado = somaDias(hojeISO(), d); s.contrato.fim = somaDias(s.contrato.fim, d); notificar('Plano congelado', `Até ${dataLonga(s.contrato.congelado)}. Seu contrato foi estendido.`, 'financeiro', '#/financeiro'); });
          fechar(); toast(`Plano congelado por ${d} dias.`); re();
        });
      });
      $('#descongelar', m)?.addEventListener('click', () => { mudar(s => { s.contrato.congelado = null; }); toast('Bem-vindo(a) de volta!'); re(); });
      $('#cancelar', m).onclick = async () => {
        if (!await confirmar('Cancelar plano?', `Você continua treinando até ${dataLonga(somaDias(hojeISO(), 30))}. Antes, que tal congelar?`, 'Solicitar cancelamento', true)) return;
        mudar(s => { notificar('Cancelamento solicitado', 'Recebemos seu pedido. Você pode desistir dele na recepção até o fim do aviso.', 'financeiro', '#/financeiro'); });
        toast('Pedido de cancelamento registrado.');
      };
    },
  };
}

function pagar(f) {
  const s = S();
  const pix = `00020126LIVREFIT-DEMO-${S().user.matricula}-${f.venc.replace(/-/g, '')}5204000053039865406${f.valor.toFixed(2)}`;
  folha(`<h2>Pagar ${brl(f.valor)}</h2><p class="sub">Mensalidade de ${dataLonga(f.venc)}</p>
    <div class="seg" style="margin:12px 0"><button aria-selected="true" data-m="pix">Pix</button>${s.pagamento.tipo === 'cartao' ? `<button aria-selected="false" data-m="cartao">Cartão final ${esc(s.pagamento.final)}</button>` : ''}</div>
    <div id="m-pix"><p class="peq sub">Copie o código e pague no app do seu banco:</p>
      <div class="card" style="word-break:break-all;font-family:monospace;font-size:.75rem">${esc(pix)}</div>
      <div class="btns" style="margin-top:10px"><button class="btn sec" id="copia">Copiar código</button><button class="btn" id="paguei">Já paguei</button></div>
      <p class="sub peq">Código de demonstração: não é um Pix de verdade.</p></div>
    <div id="m-cartao" hidden><button class="btn bloco" id="cartao">Pagar com cartão final ${esc(s.pagamento.final)}</button></div>`, (fl, fechar) => {
    $$('[data-m]', fl).forEach(b => b.onclick = () => { $$('[data-m]', fl).forEach(x => x.setAttribute('aria-selected', String(x === b))); $('#m-pix', fl).hidden = b.dataset.m !== 'pix'; $('#m-cartao', fl).hidden = b.dataset.m !== 'cartao'; });
    $('#copia', fl).onclick = () => copiar(pix);
    const quitar = forma => {
      mudar(s => { const x = s.faturas.find(q => q.id === f.id); x.status = 'paga'; x.forma = forma; notificar('Pagamento confirmado', `Mensalidade de ${brl(f.valor)} quitada. Obrigado!`, 'financeiro', '#/financeiro'); });
      fechar(); toast('Pagamento confirmado!'); re();
    };
    $('#paguei', fl).onclick = () => quitar('Pix');
    $('#cartao', fl)?.addEventListener('click', () => quitar(`Cartão final ${S().pagamento.final}`));
  });
}

// ---------- Serviços ----------
export function servicos() {
  const s = S(), hoje = hojeISO();
  const meus = s.agendamentos.filter(a => a.data >= hoje).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  return {
    titulo: 'Serviços',
    html: `
    <div class="lista">${SERVICOS.map(x => `<button class="card click linha" data-serv="${x.id}">
      <i style="width:42px;height:42px;border-radius:12px;background:var(--card2);display:grid;place-items:center;color:var(--lima)">${ic(x.ico)}</i>
      <span class="cresce"><b style="display:block">${esc(x.nome)}</b><span class="sub peq">${esc(x.desc)}</span></span>
      <span class="chip ${x.preco ? '' : 'lima'}">${x.preco ? brl(x.preco) : 'Incluso'}</span></button>`).join('')}</div>
    <div class="secao"><h2>Meus agendamentos</h2></div>
    ${meus.map(a => { const x = SERVICOS.find(q => q.id === a.serv); return `<div class="card linha"><div class="cresce"><b>${esc(x.nome)}</b><div class="sub peq">${dataLonga(a.data)} às ${a.hora} · ${esc(a.prof)}</div></div><button class="btn peq perigo" data-desmarcar="${a.id}">Desmarcar</button></div>`; }).join('') || '<div class="vazio">Nada agendado.</div>'}
    <a class="card click" href="#/vantagens" style="margin-top:14px"><div class="entre"><div><b>Clube de vantagens</b><div class="sub peq">Descontos em parceiros da Livre Fit</div></div>${ic('presente', 'width="22" height="22"')}</div></a>`,
    ligar(m) {
      $$('[data-serv]', m).forEach(b => b.onclick = () => {
        const x = SERVICOS.find(q => q.id === b.dataset.serv);
        let dia = somaDias(hojeISO(), 1), hora = null;
        const profs = { avaliacao: 'Prof. Carla', nutri: 'Dra. Helena (nutricionista)', personal: 'Prof. Rafa', revisao: 'Prof. Carla' };
        const horarios = d => ['07:00', '08:00', '10:00', '12:00', '15:00', '17:00', '18:00', '19:00', '20:00'].filter((h, i) => (paraData(d).getDate() + i) % 3 !== 0);
        const desenha = (f, fechar) => {
          $('#corpo', f).innerHTML = `
            <div class="dias">${Array.from({ length: 10 }, (_, i) => { const d = somaDias(hojeISO(), i + 1), dt = paraData(d); return dt.getDay() === 0 ? '' : `<button class="dia" aria-selected="${d === dia}" data-d="${d}"><small>${DIAS[dt.getDay()]}</small><b>${dt.getDate()}</b></button>`; }).join('')}</div>
            <p class="sub peq">Horários livres em ${dataLonga(dia)}</p>
            <div class="seg" style="flex-wrap:wrap">${horarios(dia).map(h => `<button aria-selected="${h === hora}" data-h="${h}">${h}</button>`).join('')}</div>
            <button class="btn bloco" style="margin-top:14px" id="conf" ${hora ? '' : 'disabled'}>Confirmar ${hora ? `${dataCurta(dia)} às ${hora}` : ''}</button>`;
          $$('[data-d]', f).forEach(b => b.onclick = () => { dia = b.dataset.d; hora = null; desenha(f, fechar); });
          $$('[data-h]', f).forEach(b => b.onclick = () => { hora = b.dataset.h; desenha(f, fechar); });
          $('#conf', f).onclick = () => {
            mudar(s => { s.agendamentos.push({ id: uid(), serv: x.id, data: dia, hora, prof: profs[x.id] }); notificar(`${x.nome} agendada`, `${dataLonga(dia)} às ${hora} com ${profs[x.id]}.`, 'servico', '#/servicos'); });
            fechar(); toast('Agendado!'); re();
          };
        };
        folha(`<h2>${esc(x.nome)}</h2><p class="sub">${esc(x.desc)} ${x.preco ? '· ' + brl(x.preco) + ' (cobrado na próxima fatura)' : '· incluso no seu plano'}</p><div id="corpo"></div>`, desenha);
      });
      $$('[data-desmarcar]', m).forEach(b => b.onclick = async () => {
        if (!await confirmar('Desmarcar?', 'O horário fica livre para outro aluno.', 'Desmarcar', true)) return;
        mudar(s => { s.agendamentos = s.agendamentos.filter(a => a.id !== b.dataset.desmarcar); }); re();
      });
    },
  };
}

// ---------- Clube de vantagens ----------
export function vantagens() {
  return {
    titulo: 'Clube de vantagens',
    html: `<p class="sub" style="margin-top:0">Mostre o cupom ou use no site do parceiro. Parceiros e cupons de demonstração.</p>
    <div class="lista">${PARCEIROS.map(p => `<div class="card"><div class="entre"><div><b>${esc(p.nome)}</b><div class="sub peq">${esc(p.tipo)}</div></div><span class="chip lima">${esc(p.desc)}</span></div>
      <div class="entre" style="margin-top:12px;padding:10px 12px;border:1.5px dashed var(--linha);border-radius:12px"><b class="num" style="letter-spacing:.08em">${esc(p.cupom)}</b><button class="btn peq sec" data-cupom="${esc(p.cupom)}">Copiar</button></div></div>`).join('')}</div>`,
    ligar(m) { $$('[data-cupom]', m).forEach(b => b.onclick = () => copiar(b.dataset.cupom)); },
  };
}

// ---------- Saúde e documentos ----------
export function saude() {
  const s = S(), pq = s.saude.parq, t = s.saude.termos;
  return {
    titulo: 'Saúde e documentos',
    html: `
    <div class="card">
      <div class="entre"><b>Questionário de saúde (PAR-Q)</b>${pq ? `<span class="chip ${pq.alerta ? 'ambar' : 'menta'}">${pq.alerta ? 'Requer atestado' : 'Apto'}</span>` : '<span class="chip coral">Pendente</span>'}</div>
      <p class="sub peq">${pq ? `Respondido em ${dataLonga(pq.data)}. Refaça a cada 12 meses ou se algo mudar na sua saúde.` : 'Obrigatório para treinar.'}</p>
      <button class="btn peq sec" id="refazer">${pq ? 'Refazer' : 'Responder'}</button>
    </div>
    ${pq ? `<details class="card" style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">Ver respostas</summary>${PARQ.map((q, i) => `<p class="peq"><b>${pq.resp[i] === 'sim' ? 'Sim' : 'Não'}</b> · ${esc(q)}</p>`).join('')}</details>` : ''}
    <div class="card" style="margin-top:10px">
      <div class="entre"><b>Termo de adesão</b>${t ? '<span class="chip menta">Assinado</span>' : '<span class="chip coral">Pendente</span>'}</div>
      ${t ? `<p class="sub peq">Assinado digitalmente em ${dataLonga(t.data)}.</p><img src="${t.assinatura}" alt="Sua assinatura" style="width:100%;max-width:280px;background:#fff;border-radius:12px">` : ''}
    </div>
    <div class="card" style="margin-top:10px">
      <b>Atestado médico</b><p class="sub peq">Necessário para natação e se o questionário pedir.</p>
      <label class="btn peq sec" style="cursor:pointer">${ic('foto')} Enviar foto do atestado<input type="file" accept="image/*,application/pdf" class="sr" id="atestado"></label>
      ${s.saude.atestado ? `<p class="peq" style="margin:8px 0 0">${ic('check', 'width="14" height="14" style="vertical-align:-2px;color:var(--lima)"')} Enviado em ${dataLonga(s.saude.atestado)} · em análise</p>` : ''}
    </div>`,
    ligar(m) {
      $('#refazer', m).onclick = () => {
        const resp = {};
        folha(`<h2>Questionário de saúde</h2>${PARQ.map((q, i) => `<div class="parq-q"><p style="margin:0">${i + 1}. ${esc(q)}</p><div class="seg"><button aria-selected="false" data-q="${i}" data-v="nao">Não</button><button aria-selected="false" data-q="${i}" data-v="sim">Sim</button></div></div>`).join('')}
          <button class="btn bloco" style="margin-top:14px" id="salvaq">Salvar respostas</button>`, (f, fechar) => {
          $$('[data-q]', f).forEach(b => b.onclick = () => { resp[b.dataset.q] = b.dataset.v; $$(`[data-q="${b.dataset.q}"]`, f).forEach(x => x.setAttribute('aria-selected', String(x === b))); });
          $('#salvaq', f).onclick = () => {
            if (Object.keys(resp).length < PARQ.length) { toast('Responda todas as perguntas.'); return; }
            mudar(s => { s.saude.parq = { data: hojeISO(), resp, alerta: Object.values(resp).includes('sim') }; });
            fechar(); toast('Questionário atualizado.'); re();
          };
        });
      };
      $('#atestado', m).onchange = e => { if (e.target.files[0]) { mudar(s => { s.saude.atestado = hojeISO(); notificar('Atestado recebido', 'A equipe vai analisar em até 2 dias úteis.', 'saude', '#/saude'); }); toast('Atestado enviado.'); re(); } };
    },
  };
}

// ---------- Unidade ----------
export function unidade() {
  const u = UNIDADE, h = new Date().getHours();
  const idx = Math.min(Math.max(h - 5, 0), u.curva.length - 1);
  return {
    titulo: 'Minha unidade',
    html: `
    <div class="card"><h2 style="font-size:1.3rem;font-weight:900">${esc(u.nome)}</h2><p class="sub peq">${esc(u.end)}</p>
      <div class="btns"><a class="btn peq sec" href="tel:${u.tel.replace(/\D/g, '')}">Ligar</a><a class="btn peq sec" href="#/acesso">Check-in</a></div></div>
    <div class="secao"><h2>Horários</h2></div>
    <div class="card">${u.horarios.map(([d, hr]) => `<div class="entre" style="padding:6px 0"><span>${d}</span><b>${hr}</b></div>`).join('')}</div>
    <div class="secao"><h2>Movimento ao longo do dia</h2></div>
    <div class="card"><div class="lotacao" style="height:90px">${u.curva.map((v, i) => `<i style="height:${Math.max(6, v)}%" class="${i === idx && h >= 5 && h < 23 ? 'agora' : ''}"></i>`).join('')}</div>
      <div class="lotacao-legenda"><span>5h</span><span>9h</span><span>13h</span><span>17h</span><span>22h</span></div>
      <p class="sub peq" style="margin:8px 0 0">Horários mais tranquilos: 10h às 16h e depois das 21h.</p></div>
    <div class="secao"><h2>Estrutura</h2></div>
    <div class="card" style="display:flex;flex-wrap:wrap;gap:8px">${u.comodidades.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>`,
  };
}

// ---------- Notificações ----------
export function notificacoes() {
  const s = S();
  return {
    titulo: 'Notificações',
    acao: s.notifs.some(n => !n.lida) ? '<button class="link" id="todas" style="font-size:.8rem">Ler todas</button>' : '',
    html: `${'Notification' in window && Notification.permission === 'default' ? `<div class="card entre" style="margin-bottom:12px"><span class="peq">Receba lembretes das suas aulas</span><button class="btn peq" id="permite">Ativar</button></div>` : ''}
    <div class="lista">${s.notifs.map(n => `<a class="card click notif ${n.lida ? 'lida' : ''}" href="${n.link || '#/notificacoes'}" data-n="${n.id}"><span class="pt"></span><span><b style="display:block">${esc(n.titulo)}</b><span class="sub peq">${esc(n.texto)}</span><span class="sub peq" style="display:block;margin-top:4px">${relativo(n.ts)}</span></span></a>`).join('') || '<div class="vazio">Nenhuma notificação.</div>'}</div>`,
    ligar(m) {
      $('#todas')?.addEventListener('click', () => { mudar(s => s.notifs.forEach(n => { n.lida = true; })); re(); });
      $$('[data-n]', m).forEach(a => a.addEventListener('click', () => mudar(s => { const n = s.notifs.find(x => x.id === a.dataset.n); if (n) n.lida = true; })));
      $('#permite', m)?.addEventListener('click', async () => { try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Lembretes ativados!' : 'Sem permissão para notificar.'); } catch {} re(); });
    },
  };
}

// ---------- Ajustes ----------
export function ajustes() {
  const s = S();
  const tg = (k, t, d) => `<label class="entre" style="padding:12px 0"><span><b style="display:block">${t}</b><span class="sub peq">${d}</span></span><input type="checkbox" class="troca" data-pref="${k}" ${s.prefs[k] ? 'checked' : ''}></label>`;
  return {
    titulo: 'Ajustes',
    html: `
    <div class="secao" style="margin-top:4px"><h2>Aparência</h2></div>
    <div class="seg">${[['escuro', 'Escuro'], ['claro', 'Claro'], ['auto', 'Automático']].map(([k, n]) => `<button aria-selected="${s.prefs.tema === k}" data-tema="${k}">${n}</button>`).join('')}</div>
    <div class="secao"><h2>Treino</h2></div>
    <div class="card" style="padding:4px 16px">${tg('som', 'Sons do cronômetro', 'Bipes no fim do descanso')}${tg('vibrar', 'Vibração', 'Vibra ao terminar o descanso')}${tg('lembretes', 'Lembretes de aula', '30 minutos antes, com o app aberto')}</div>
    <div class="secao"><h2>Seus dados</h2></div>
    <form class="card" id="fd">
      <label class="campo"><span>Nome</span><input class="inp" name="nome" value="${esc(s.user.nome)}"></label>
      <label class="campo"><span>E-mail</span><input class="inp" name="email" type="email" value="${esc(s.user.email)}"></label>
      <button class="btn peq">Salvar</button>
    </form>
    <nav class="menu-lista" style="margin-top:12px">
      <button id="exportar"><i>${ic('baixar')}</i><span class="cresce"><b style="display:block">Exportar meus dados</b><span class="sub peq">Arquivo JSON com treinos, medidas e histórico</span></span></button>
      <button id="sair"><i>${ic('sair')}</i><span class="cresce"><b style="display:block">Sair</b><span class="sub peq">Volta para a tela de boas-vindas</span></span></button>
      <button id="apagar"><i style="color:var(--coral)">${ic('lixo')}</i><span class="cresce"><b style="display:block;color:var(--coral)">Apagar tudo</b><span class="sub peq">Remove os dados deste aparelho</span></span></button>
    </nav>
    <p class="sub peq" style="margin-top:14px">Seus dados ficam guardados apenas neste navegador. Nada é enviado para servidores.</p>`,
    ligar(m) {
      $$('[data-tema]', m).forEach(b => b.onclick = () => { mudar(s => { s.prefs.tema = b.dataset.tema; }); dispatchEvent(new Event('lf:tema')); re(); });
      $$('[data-pref]', m).forEach(c => c.onchange = async () => {
        mudar(s => { s.prefs[c.dataset.pref] = c.checked; });
        if (c.dataset.pref === 'lembretes' && c.checked && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
        if (c.dataset.pref === 'som' && c.checked) bip(880, .1);
      });
      $('#fd', m).onsubmit = e => { e.preventDefault(); const f = e.target; if (!f.nome.value.trim()) return toast('O nome não pode ficar vazio.'); mudar(s => { s.user.nome = f.nome.value.trim(); s.user.email = f.email.value.trim(); }); toast('Dados salvos.'); };
      $('#exportar', m).onclick = () => { const d = { ...S() }; baixar(`livrefit-dados-${hojeISO()}.json`, JSON.stringify(d, null, 2), 'application/json'); };
      $('#sair', m).onclick = async () => { if (await confirmar('Sair?', 'Seus dados continuam salvos neste aparelho.', 'Sair')) { mudar(s => { s.entrou = false; }); location.hash = ''; re(); } };
      $('#apagar', m).onclick = async () => { if (await confirmar('Apagar tudo?', 'Treinos, medidas, posts e reservas serão removidos deste aparelho.', 'Apagar', true)) { apagarTudo(); location.hash = ''; re(); toast('Dados apagados.'); } };
    },
  };
}
