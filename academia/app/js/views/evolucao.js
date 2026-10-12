import { $, $$, esc, toast, folha, hojeISO, dataCurta, dataLonga, grafico, num, paraData, mesAno } from '../util.js';
import { S, mudar, estatisticas, notificar } from '../store.js';
import { SELOS } from '../data.js';

let medida = 'peso', mesDelta = 0;
const MEDIDAS = { peso: ['Peso', 'kg'], gordura: ['Gordura', '%'], cintura: ['Cintura', 'cm'], braco: ['Braço', 'cm'], coxa: ['Coxa', 'cm'], quadril: ['Quadril', 'cm'] };

export function tela() {
  const s = S(), st = estatisticas();
  const av = [...s.avaliacoes].sort((a, b) => a.data.localeCompare(b.data));
  const ult = av.at(-1), pri = av[0];
  const alt = s.user.altura || 1.75;
  const imc = ult ? ult.peso / (alt * alt) : 0;
  const faixaImc = imc < 18.5 ? 'abaixo do peso' : imc < 25 ? 'faixa saudável' : imc < 30 ? 'sobrepeso' : 'obesidade';
  const dif = k => ult && pri && av.length > 1 ? ult[k] - pri[k] : 0;
  const ctx = { ...s, maiorSequencia: st.maiorSequencia };

  // calendário do mês
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + mesDelta);
  const ano = base.getFullYear(), mes = base.getMonth(), offset = base.getDay(), nDias = new Date(ano, mes + 1, 0).getDate();
  const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}`;
  const noMes = st.dias.filter(d => d.startsWith(prefixo)).length;

  return {
    titulo: 'Evolução',
    html: `
    <div class="grade3">
      <div class="card"><div class="kpi">${s.historico.length}</div><div class="sub peq">treinos</div></div>
      <div class="card"><div class="kpi">${st.maiorSequencia}</div><div class="sub peq">dias seguidos (recorde)</div></div>
      <div class="card"><div class="kpi">${(st.volumeTotal / 1000).toFixed(0)}<small>t</small></div><div class="sub peq">levantadas</div></div>
    </div>

    <div class="secao"><h2>Avaliação física</h2><button class="link" id="nova">+ Nova medida</button></div>
    ${ult ? `<div class="card">
      <div class="entre"><span class="sub peq">Última: ${dataLonga(ult.data)}</span><span class="chip menta">IMC ${num(imc)} · ${faixaImc}</span></div>
      <div class="grade3" style="margin-top:12px">
        ${['peso', 'gordura', 'cintura'].map(k => { const d = dif(k); return `<div><div class="kpi" style="font-size:1.3rem">${num(ult[k])}<small>${MEDIDAS[k][1]}</small></div><div class="peq ${d < 0 ? 'lima-txt' : 'sub'}" style="${d < 0 ? 'color:var(--lima)' : ''}">${d ? (d > 0 ? '+' : '') + num(d) : '—'} desde ${dataCurta(pri.data)}</div></div>`; }).join('')}
      </div>
    </div>` : '<div class="vazio">Nenhuma avaliação registrada.</div>'}

    <div class="seg" style="margin-top:12px">${Object.entries(MEDIDAS).map(([k, [n]]) => `<button aria-selected="${k === medida}" data-medida="${k}">${n}</button>`).join('')}</div>
    <div class="card" style="margin-top:8px">${grafico(av.map(a => ({ v: a[medida], r: dataCurta(a.data) })), { sufixo: ' ' + MEDIDAS[medida][1] })}</div>

    <div class="secao"><h2>Frequência</h2><span class="sub peq">${noMes} dia${noMes === 1 ? '' : 's'} em ${mesAno(base).split(' ')[0]}</span></div>
    <div class="card">
      <div class="entre" style="margin-bottom:10px"><button class="icone-btn" data-mes="-1" aria-label="Mês anterior">‹</button><b style="text-transform:capitalize">${mesAno(base)}</b><button class="icone-btn" data-mes="1" aria-label="Próximo mês" ${mesDelta >= 0 ? 'disabled' : ''}>›</button></div>
      <div class="calendario" style="margin-bottom:4px">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<i style="background:none;font-weight:700">${d}</i>`).join('')}</div>
      <div class="calendario">${Array.from({ length: offset }, () => '<i class="fora"></i>').join('')}${Array.from({ length: nDias }, (_, i) => { const d = `${prefixo}-${String(i + 1).padStart(2, '0')}`; return `<i class="${st.dias.includes(d) ? 'on' : ''} ${d === hojeISO() ? 'hoje' : ''}">${i + 1}</i>`; }).join('')}</div>
    </div>

    <div class="secao"><h2>Conquistas</h2><span class="sub peq">${SELOS.filter(x => x.ok(ctx)).length}/${SELOS.length}</span></div>
    <div class="card selos">${SELOS.map(x => `<div class="selo ${x.ok(ctx) ? 'ok' : ''}"><i>${x.ico}</i>${esc(x.nome)}</div>`).join('')}</div>

    <div class="secao"><h2>Meta semanal</h2></div>
    <div class="card entre"><span>Treinos por semana</span>
      <div class="linha"><button class="icone-btn" data-meta="-1" aria-label="Diminuir meta">−</button><b class="kpi" style="font-size:1.3rem">${s.user.meta}</b><button class="icone-btn" data-meta="1" aria-label="Aumentar meta">+</button></div></div>`,
    ligar(m) {
      const re = () => dispatchEvent(new HashChangeEvent('hashchange'));
      $$('[data-medida]', m).forEach(b => b.onclick = () => { medida = b.dataset.medida; re(); });
      $$('[data-mes]', m).forEach(b => b.onclick = () => { mesDelta = Math.min(0, mesDelta + +b.dataset.mes); re(); });
      $$('[data-meta]', m).forEach(b => b.onclick = () => { mudar(s => { s.user.meta = Math.min(7, Math.max(1, s.user.meta + +b.dataset.meta)); }); re(); });
      $('#nova', m).onclick = () => {
        const u = S().avaliacoes.at(-1) || {};
        folha(`<h2>Nova medida</h2><p class="sub">Registre o que mediu hoje. Os campos vêm com a última avaliação.</p>
          <form id="fa"><div class="grade2">
          <label class="campo"><span>Altura (m)</span><input class="inp" name="altura" inputmode="decimal" value="${num(S().user.altura || 1.75)}"></label>
          ${Object.entries(MEDIDAS).map(([k, [n, un]]) => `<label class="campo"><span>${n} (${un})</span><input class="inp" name="${k}" inputmode="decimal" value="${u[k] != null ? num(u[k]) : ''}"></label>`).join('')}
          </div><button class="btn bloco">Salvar</button></form>`, (f, fechar) => {
          $('#fa', f).onsubmit = e => {
            e.preventDefault();
            const v = n => parseFloat(String(e.target[n].value).replace(',', '.'));
            const nova = { data: hojeISO() };
            for (const k of Object.keys(MEDIDAS)) { const x = v(k); if (!isNaN(x)) nova[k] = x; }
            if (!nova.peso) { toast('Informe pelo menos o peso.'); return; }
            mudar(s => {
              const alt = v('altura'); if (alt > 1 && alt < 2.5) s.user.altura = alt;
              s.avaliacoes = s.avaliacoes.filter(a => a.data !== nova.data);
              s.avaliacoes.push({ ...s.avaliacoes.at(-1), ...nova });
              notificar('Medida registrada', `Peso ${num(nova.peso)} kg em ${dataLonga(nova.data)}.`, 'evolucao', '#/evolucao');
            });
            fechar(); toast('Medida salva.'); re();
          };
        });
      };
    },
  };
}
