import { $, $$, esc, ic, toast, folha, confirmar, bip, vibrar, confete, mmss, dataLonga, dataCurta, hojeISO, grafico, num, paraData } from '../util.js';
import { S, mudar, notificar, sugestaoCarga } from '../store.js';
import { EXERCICIOS } from '../data.js';
import { figura } from '../demo.js';

const exInfo = id => EXERCICIOS[id] || { nome: id, grupo: '', mov: 'agacha', dica: '' };
const repsNum = r => parseInt(r) || 0;

// ---------- Lista da ficha ----------
export function tela() {
  const s = S();
  const f = s.fichas.find(x => x.id === s.fichaAtual) || s.fichas[0];
  const dias = Math.round((paraData(f.vence) - paraData(hojeISO())) / 864e5);
  return {
    titulo: 'Meu treino',
    html: `
    <div class="seg ficha-tabs" role="tablist">${s.fichas.map(x => `<button role="tab" aria-selected="${x.id === f.id}" data-ficha="${x.id}">${esc(x.nome)}</button>`).join('')}</div>
    <div class="card">
      <div class="entre"><div><h3 style="font-size:1.2rem">${esc(f.foco)}</h3><div class="sub peq">${f.exercicios.length} exercícios · montado por ${esc(f.professor)}</div></div>
      <span class="chip ${dias < 10 ? 'coral' : 'menta'}">vence ${dataCurta(f.vence)}</span></div>
      <button class="btn bloco" style="margin-top:14px" id="iniciar">${ic('play')} ${s.sessao?.ficha === f.id ? 'Continuar treino' : 'Iniciar treino'}</button>
    </div>
    <div class="secao"><h2>Exercícios</h2><span class="sub peq">toque para ver detalhes</span></div>
    ${f.exercicios.map(e => { const i = exInfo(e.ex); return `
      <a class="ex" href="#/treino/${f.id}/${e.id}" style="text-decoration:none">
        <span class="mini parado">${figura(i.mov)}</span>
        <span class="cresce" style="flex:1;min-width:0"><b>${esc(i.nome)}</b><span class="meta">${e.series} × ${esc(e.reps)} · ${e.carga ? e.carga + ' kg · ' : ''}descanso ${e.desc}s</span></span>
        <span class="sub">${ic('seta', 'width="18" height="18"')}</span>
      </a>`; }).join('')}
    <div class="grade2" style="margin-top:16px">
      <a class="card click" href="#/go"><span class="chip coral">${ic('raio', 'width="12" height="12"')} Livre Go</span><b style="display:block;margin-top:8px">Treinar em casa</b><span class="sub peq">Treinos guiados com cronômetro</span></a>
      <a class="card click" href="#/historico"><span class="chip">${ic('relogio', 'width="12" height="12"')} Histórico</span><b style="display:block;margin-top:8px">${s.historico.length} treinos</b><span class="sub peq">Veja tudo o que já fez</span></a>
    </div>`,
    ligar(m) {
      $$('[data-ficha]', m).forEach(b => b.onclick = () => { mudar(s => { s.fichaAtual = b.dataset.ficha; }); dispatchEvent(new HashChangeEvent('hashchange')); });
      $('#iniciar', m).onclick = async () => {
        const s = S();
        if (s.sessao && s.sessao.ficha !== f.id) {
          if (!await confirmar('Trocar de treino?', `Você tem o ${s.sessao.nome} em andamento. Ele será descartado.`, 'Trocar', true)) return;
        }
        if (!S().sessao || S().sessao.ficha !== f.id) {
          mudar(s => {
            s.sessao = { ficha: f.id, nome: f.nome, inicio: Date.now(), aberto: f.exercicios[0].id,
              itens: Object.fromEntries(f.exercicios.map(e => [e.id, Array.from({ length: e.series }, () => ({ reps: repsNum(e.reps) || '', kg: e.carga || '', ok: false }))])) };
          });
        }
        location.hash = '#/sessao';
      };
    },
  };
}

// ---------- Detalhe do exercício ----------
export function exercicio(fichaId, itemId) {
  const s = S();
  const f = s.fichas.find(x => x.id === fichaId);
  const e = f?.exercicios.find(x => x.id === itemId);
  if (!e) return { titulo: 'Exercício', html: '<div class="vazio">Exercício não encontrado.</div>' };
  const i = exInfo(e.ex);
  const nota = s.notas[e.ex] || {};
  const hist = (s.cargas[e.ex] || []).slice(-10);
  const sug = sugestaoCarga(e.ex);
  return {
    titulo: i.nome,
    html: `
    <div class="demo" id="demo">${figura(i.mov)}<span class="chip rot">${esc(i.grupo)}</span>
      <button class="icone-btn" id="pausa" style="position:absolute;right:10px;bottom:10px" aria-label="Pausar demonstração">${ic('pausa')}</button></div>
    <div class="grade3" style="margin-top:12px">
      <div class="card"><div class="kpi">${e.series}</div><div class="sub peq">séries</div></div>
      <div class="card"><div class="kpi">${esc(e.reps)}</div><div class="sub peq">repetições</div></div>
      <div class="card"><div class="kpi">${e.desc}<small>s</small></div><div class="sub peq">descanso</div></div>
    </div>
    <div class="secao"><h2>Como fazer</h2></div>
    <p class="dica">${esc(i.dica)}</p>
    ${sug ? `<p class="sugestao">${ic('raio', 'width="14" height="14" style="vertical-align:-2px"')} <b>Hora de evoluir:</b> você completou as últimas sessões com ${sug.de} kg. Que tal tentar ${sug.para} kg?</p>` : ''}

    <div class="secao"><h2>Carga atual</h2></div>
    <div class="card linha">
      <button class="icone-btn" data-carga="-1" aria-label="Diminuir carga">−</button>
      <div class="cresce" style="text-align:center"><span class="kpi" id="cargaV">${e.carga}</span> <span class="sub">kg</span></div>
      <button class="icone-btn" data-carga="1" aria-label="Aumentar carga">${ic('mais')}</button>
    </div>

    <div class="secao"><h2>Bloco de notas</h2><span class="sub peq">salva sozinho</span></div>
    <div class="card">
      <label class="campo"><span>Regulagem do aparelho</span><input class="inp" data-nota="ajuste" placeholder="Ex.: banco na posição 4, pino no furo 2" value="${esc(nota.ajuste)}"></label>
      <label class="campo" style="margin:0"><span>Observações</span><textarea class="inp" data-nota="obs" placeholder="Como se sentiu, ajustes de pegada…">${esc(nota.obs)}</textarea></label>
    </div>

    <div class="secao"><h2>Evolução da carga</h2></div>
    <div class="card">${grafico(hist.map(h => ({ v: h.carga, r: dataCurta(h.data) })), { sufixo: ' kg', casas: 0 })}</div>
    <button class="btn contorno bloco" style="margin-top:14px" id="descanso">${ic('timer')} Iniciar descanso de ${e.desc}s</button>`,
    ligar(m) {
      $('#pausa', m).onclick = ev => { const d = $('#demo', m); d.classList.toggle('parado'); ev.currentTarget.innerHTML = ic(d.classList.contains('parado') ? 'play' : 'pausa'); };
      $$('[data-carga]', m).forEach(b => b.onclick = () => {
        mudar(s => { const x = s.fichas.find(q => q.id === fichaId).exercicios.find(q => q.id === itemId); x.carga = Math.max(0, x.carga + (+b.dataset.carga) * (x.carga >= 40 ? 2.5 : 1)); $('#cargaV', m).textContent = num(x.carga); });
      });
      let t;
      $$('[data-nota]', m).forEach(el => el.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => mudar(s => { (s.notas[e.ex] ||= {})[el.dataset.nota] = el.value; }), 300);
      }));
      $('#descanso', m).onclick = () => iniciarDescanso(e.desc);
    },
  };
}

// ---------- Sessão de treino em andamento ----------
export function sessao() {
  const s = S();
  if (!s.sessao) return { titulo: 'Treino', html: '<div class="vazio">Nenhum treino em andamento. <a class="link" href="#/treino">Ver ficha</a></div>' };
  const f = s.fichas.find(x => x.id === s.sessao.ficha);
  const total = Object.values(s.sessao.itens).flat().length;
  const feitas = Object.values(s.sessao.itens).flat().filter(x => x.ok).length;
  return {
    titulo: s.sessao.nome,
    acao: `<span class="chip lima num" id="decorrido">0:00</span>`,
    html: `
    <div class="card" style="margin-bottom:12px">
      <div class="entre"><b>${feitas} de ${total} séries</b><span class="sub peq">${Math.round(feitas / total * 100)}%</span></div>
      <div style="height:8px;border-radius:4px;background:var(--linha);margin-top:8px;overflow:hidden"><i style="display:block;height:100%;width:${feitas / total * 100}%;background:var(--lima);transition:width .4s"></i></div>
    </div>
    ${f.exercicios.map(e => {
      const i = exInfo(e.ex), series = s.sessao.itens[e.id] || [], ok = series.every(x => x.ok), aberto = s.sessao.aberto === e.id;
      return `<div class="card" style="padding:0;margin-top:10px">
        <button class="ex ${ok ? 'feito' : ''}" data-abrir="${e.id}" aria-expanded="${aberto}" style="background:none">
          <span class="mini ${aberto ? '' : 'parado'}">${figura(i.mov)}</span>
          <span style="flex:1;min-width:0"><b>${esc(i.nome)}</b><span class="meta">${series.filter(x => x.ok).length}/${series.length} séries · descanso ${e.desc}s</span></span>
          <span class="check-redondo">${ok ? ic('check', 'width="14" height="14"') : ''}</span>
        </button>
        ${aberto ? `<div style="padding:0 12px 12px">
          ${s.notas[e.ex]?.ajuste ? `<p class="sub peq" style="margin:0 0 6px">${ic('nota', 'width="13" height="13" style="vertical-align:-2px"')} ${esc(s.notas[e.ex].ajuste)}</p>` : ''}
          <table class="series"><thead><tr><th>#</th><th>Reps</th><th>Kg</th><th></th></tr></thead><tbody>
          ${series.map((x, n) => `<tr class="${x.ok ? 'ok' : ''}"><td>${n + 1}</td>
            <td><input inputmode="numeric" aria-label="Repetições da série ${n + 1}" data-campo="reps" data-e="${e.id}" data-n="${n}" value="${esc(x.reps)}"></td>
            <td><input inputmode="decimal" aria-label="Carga da série ${n + 1}" data-campo="kg" data-e="${e.id}" data-n="${n}" value="${esc(x.kg)}"></td>
            <td><button class="marcar" data-serie="${e.id}" data-n="${n}" aria-label="Concluir série ${n + 1}" aria-pressed="${x.ok}">${ic('check')}</button></td></tr>`).join('')}
          </tbody></table>
          <div class="btns" style="margin-top:6px"><a class="btn peq sec" href="#/treino/${f.id}/${e.id}">Ver execução</a><button class="btn peq sec" data-mais="${e.id}">+ Série</button></div>
        </div>` : ''}
      </div>`;
    }).join('')}
    <div class="btns" style="margin-top:18px">
      <button class="btn perigo" id="descartar">Descartar</button>
      <button class="btn" id="finalizar">${ic('check')} Finalizar treino</button>
    </div>`,
    ligar(m) {
      const dec = $('#decorrido');
      const tick = () => { const sx = S().sessao; if (sx && dec) dec.textContent = mmss((Date.now() - sx.inicio) / 1000); };
      tick();
      const iv = setInterval(tick, 1000);
      const redesenha = () => dispatchEvent(new HashChangeEvent('hashchange'));

      $$('[data-abrir]', m).forEach(b => b.onclick = () => { mudar(s => { s.sessao.aberto = s.sessao.aberto === b.dataset.abrir ? null : b.dataset.abrir; }); redesenha(); });
      $$('[data-campo]', m).forEach(inp => inp.addEventListener('change', () => {
        mudar(s => { s.sessao.itens[inp.dataset.e][+inp.dataset.n][inp.dataset.campo] = inp.value.replace(',', '.'); });
      }));
      $$('[data-serie]', m).forEach(b => b.onclick = () => {
        const eId = b.dataset.serie, n = +b.dataset.n;
        const e = f.exercicios.find(x => x.id === eId);
        let agoraOk = false, tudo = false;
        mudar(s => {
          const lin = s.sessao.itens[eId][n];
          lin.ok = !lin.ok; agoraOk = lin.ok;
          tudo = s.sessao.itens[eId].every(x => x.ok);
          if (tudo) { const prox = f.exercicios.find(x => !s.sessao.itens[x.id].every(y => y.ok)); s.sessao.aberto = prox?.id || null; }
        });
        if (agoraOk) { vibrar(30); if (!tudo || f.exercicios.some(x => !S().sessao.itens[x.id].every(y => y.ok))) iniciarDescanso(e.desc); }
        redesenha();
      });
      $$('[data-mais]', m).forEach(b => b.onclick = () => {
        mudar(s => { const a = s.sessao.itens[b.dataset.mais]; const u = a.at(-1) || {}; a.push({ reps: u.reps || '', kg: u.kg || '', ok: false }); });
        redesenha();
      });
      $('#descartar', m).onclick = async () => {
        if (!await confirmar('Descartar treino?', 'As séries marcadas não serão salvas.', 'Descartar', true)) return;
        mudar(s => { s.sessao = null; });
        pararDescanso();
        location.hash = '#/treino';
      };
      $('#finalizar', m).onclick = async () => {
        const sx = S().sessao;
        const feitas = Object.values(sx.itens).flat().filter(x => x.ok);
        if (!feitas.length) { toast('Marque pelo menos uma série concluída.'); return; }
        if (feitas.length < Object.values(sx.itens).flat().length && !await confirmar('Finalizar mesmo assim?', 'Ainda há séries sem marcar.', 'Finalizar')) return;
        finalizar();
      };
      return () => clearInterval(iv);
    },
  };
}

function finalizar() {
  const s = S(), sx = s.sessao, hoje = hojeISO();
  const f = s.fichas.find(x => x.id === sx.ficha);
  let volume = 0, series = 0;
  const recordes = [];
  mudar(s => {
    for (const e of f.exercicios) {
      const feitas = sx.itens[e.id].filter(x => x.ok);
      if (!feitas.length) continue;
      series += feitas.length;
      const maxKg = Math.max(0, ...feitas.map(x => parseFloat(x.kg) || 0));
      volume += feitas.reduce((a, x) => a + (parseFloat(x.kg) || 0) * (parseInt(x.reps) || 0), 0);
      if (maxKg) {
        const hist = (s.cargas[e.ex] ||= []);
        const antes = Math.max(0, ...hist.map(h => h.carga));
        if (maxKg > antes && hist.length) recordes.push(`${exInfo(e.ex).nome}: ${num(maxKg)} kg`);
        hist.push({ data: hoje, carga: maxKg, completo: feitas.length === sx.itens[e.id].length });
        e.carga = maxKg;
      }
    }
    const duracao = Math.max(1, Math.round((Date.now() - sx.inicio) / 60000));
    s.historico.push({ id: Math.random().toString(36).slice(2), data: hoje, ficha: f.id, nome: f.nome, duracao, volume: Math.round(volume), series });
    if (!s.checkins.includes(hoje)) s.checkins.push(hoje);
    const ordem = s.fichas.map(x => x.id);
    s.fichaAtual = ordem[(ordem.indexOf(f.id) + 1) % ordem.length];
    s.sessao = null;
    notificar('Treino concluído 💪', `${f.nome}: ${series} séries e ${Math.round(volume).toLocaleString('pt-BR')} kg levantados.`, 'treino', '#/historico');
  });
  pararDescanso();
  const ultimo = S().historico.at(-1);
  confete();
  bip(660, .12, 2);
  const resumo = () => folha(`<div style="text-align:center"><div style="font-size:3rem">🏆</div><h2>Treino concluído!</h2><p class="sub">Mandou bem, ${esc(S().user.nome)}.</p></div>
    <div class="grade3" style="margin:16px 0">
      <div class="card"><div class="kpi">${ultimo.duracao}<small>min</small></div><div class="sub peq">duração</div></div>
      <div class="card"><div class="kpi">${ultimo.series}</div><div class="sub peq">séries</div></div>
      <div class="card"><div class="kpi">${(ultimo.volume / 1000).toFixed(1).replace('.', ',')}<small>t</small></div><div class="sub peq">volume</div></div>
    </div>
    ${recordes.length ? `<div class="sugestao" style="margin-bottom:14px"><b>Novos recordes:</b><br>${recordes.map(esc).join('<br>')}</div>` : ''}
    <p class="sub peq">Próximo: ${esc(S().fichas.find(x => x.id === S().fichaAtual).nome)}</p>
    <div class="btns"><a class="btn sec" href="#/social" data-fechar>Compartilhar</a><button class="btn" data-fechar>Fechar</button></div>`);
  // abre o resumo depois que a tela da ficha for desenhada
  if (location.hash === '#/treino') resumo();
  else { addEventListener('hashchange', resumo, { once: true }); location.hash = '#/treino'; }
}

// ---------- Histórico ----------
export function historico() {
  const s = S();
  const porMes = {};
  [...s.historico].reverse().forEach(h => (porMes[h.data.slice(0, 7)] ||= []).push(h));
  const nomeMes = k => { const [a, m] = k.split('-').map(Number); return new Date(a, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); };
  return {
    titulo: 'Histórico',
    html: Object.entries(porMes).map(([k, l]) => `
      <div class="secao"><h2 style="text-transform:capitalize">${nomeMes(k)}</h2><span class="sub peq">${l.length} treinos</span></div>
      ${l.map(h => `<div class="card linha"><span class="chip lima">${esc(h.ficha)}</span><div class="cresce"><b>${esc(h.nome)}</b><div class="sub peq">${dataLonga(h.data)} · ${h.duracao} min · ${h.series} séries · ${h.volume.toLocaleString('pt-BR')} kg</div></div></div>`).join('')}`).join('')
      || '<div class="vazio">Nenhum treino ainda.</div>',
  };
}

// ---------- Cronômetro de descanso (flutua sobre qualquer tela) ----------
let desc = null, ivDesc = null;
export function iniciarDescanso(seg) {
  desc = { fim: Date.now() + seg * 1000, total: seg };
  mostrarCronometro();
}
export function pararDescanso() { desc = null; clearInterval(ivDesc); document.getElementById('cron')?.remove(); document.body.classList.remove('com-cron'); }
export function mostrarCronometro() {
  if (!desc) return;
  let el = document.getElementById('cron');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cron'; el.className = 'cronometro'; el.setAttribute('role', 'timer');
    el.innerHTML = `<div class="anel"><span>${ic('timer', 'width="16" height="16"')}</span></div>
      <div style="flex:1"><div class="peq" style="opacity:.6;font-weight:600">Descanso</div><b id="cronT">0:00</b></div>
      <button class="btn" data-d="-15">−15</button><button class="btn" data-d="15">+15</button><button class="btn" data-d="x">Pular</button>`;
    document.body.append(el);
    document.body.classList.add('com-cron');
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      if (b.dataset.d === 'x') return pararDescanso();
      desc.fim += +b.dataset.d * 1000; desc.total = Math.max(desc.total + +b.dataset.d, 1);
      tick();
    });
  }
  const tick = () => {
    if (!desc) return;
    const rest = (desc.fim - Date.now()) / 1000;
    const t = document.getElementById('cronT');
    if (t) t.textContent = mmss(rest);
    el.querySelector('.anel').style.setProperty('--p', Math.max(0, 100 - (rest / desc.total) * 100));
    if (rest <= 3 && rest > 0 && Math.abs(rest - Math.round(rest)) < .13 && S().prefs.som) bip(520, .08);
    if (rest <= 0) {
      clearInterval(ivDesc);
      if (S().prefs.som) bip(880, .2, 2);
      if (S().prefs.vibrar) vibrar([200, 100, 200]);
      el.classList.add('fim');
      const t2 = document.getElementById('cronT'); if (t2) t2.textContent = 'Bora!';
      desc = null;
      setTimeout(() => { el.remove(); document.body.classList.remove('com-cron'); }, 2200);
    }
  };
  clearInterval(ivDesc);
  ivDesc = setInterval(tick, 250);
  tick();
}
