import { $, $$, esc, ic, bip, vibrar, confete, toast, hojeISO, mmss } from '../util.js';
import { S, mudar, notificar } from '../store.js';
import { GO, EXERCICIOS } from '../data.js';
import { figura } from '../demo.js';

let cat = 'Todos', dur = 0;

export function tela() {
  const cats = ['Todos', ...new Set(GO.map(g => g.cat))];
  const lista = GO.filter(g => (cat === 'Todos' || g.cat === cat) && (!dur || g.min === dur));
  const s = S();
  return {
    titulo: 'Livre Go',
    html: `
    <p class="sub" style="margin:0 0 12px">${GO.length} treinos guiados para fazer em casa, no parque ou no hotel. Sem equipamento.</p>
    <div class="seg">${cats.map(c => `<button aria-selected="${c === cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="seg" style="margin-top:8px">${[[0, 'Qualquer duração'], [7, '7 min'], [15, '15 min'], [25, '25 min']].map(([v, n]) => `<button aria-selected="${v === dur}" data-dur="${v}">${n}</button>`).join('')}</div>
    <p class="sub peq" style="margin:12px 0 8px">${lista.length} treinos · ${s.goFeitos} feitos por você</p>
    <div class="grade2">
      ${lista.map(g => `<button class="go-card" style="background:${g.cor}" data-go="${g.id}">
        <span class="demo-mini parado">${figura(g.mov, { peso: false })}</span>
        <span class="chip" style="background:rgba(15,17,21,.14);color:var(--tinta);align-self:flex-start">${esc(g.nivel)}</span>
        <span><h3>${esc(g.cat)}</h3><span class="peq" style="font-weight:600;opacity:.75">${g.min} min · ${g.passos.length} rodadas</span></span>
      </button>`).join('')}
    </div>`,
    ligar(m) {
      const re = () => dispatchEvent(new HashChangeEvent('hashchange'));
      $$('[data-cat]', m).forEach(b => b.onclick = () => { cat = b.dataset.cat; re(); });
      $$('[data-dur]', m).forEach(b => b.onclick = () => { dur = +b.dataset.dur; re(); });
      $$('[data-go]', m).forEach(b => b.onclick = () => abrir(GO.find(g => g.id === b.dataset.go)));
    },
  };
}

// Player em tela cheia: alterna trabalho e descanso com contagem regressiva
function abrir(g) {
  // monta a sequência: preparação, depois trabalho/descanso
  const fases = [{ tipo: 'prepara', seg: 10, ex: g.passos[0] }];
  g.passos.forEach((ex, i) => {
    fases.push({ tipo: 'trabalho', seg: g.trab, ex });
    if (i < g.passos.length - 1) fases.push({ tipo: 'descanso', seg: g.desc, ex: g.passos[i + 1] });
  });
  const total = fases.reduce((a, f) => a + f.seg, 0);
  let i = 0, resta = fases[0].seg, pausado = false, decorrido = 0, iv;

  const el = document.createElement('div');
  el.className = 'player';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', g.nome);
  document.body.append(el);
  const fechar = () => { clearInterval(iv); el.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') fechar(); if (e.key === ' ') { e.preventDefault(); pausado = !pausado; desenha(); } };
  document.addEventListener('keydown', tecla);

  const desenha = () => {
    const f = fases[i], info = EXERCICIOS[f.ex];
    const prox = fases.slice(i + 1).find(x => x.tipo === 'trabalho');
    const rotulo = { prepara: 'Prepare-se', trabalho: 'Agora', descanso: 'Descanse · a seguir' }[f.tipo];
    el.innerHTML = `
      <div class="entre"><button class="icone-btn" data-x aria-label="Sair">${ic('voltar')}</button><b>${esc(g.nome)} · ${esc(g.nivel)}</b><span class="chip num">${mmss(total - decorrido)}</span></div>
      <div class="progresso"><i style="width:${decorrido / total * 100}%"></i></div>
      <div class="demo ${pausado || f.tipo === 'descanso' ? 'parado' : ''}">${figura(info.mov, { peso: false })}</div>
      <p class="fase ${f.tipo === 'descanso' ? 'descanso' : 'trabalho'}">${rotulo}</p>
      <h2 style="text-align:center;font-size:1.6rem;font-weight:900;margin:4px 0 8px">${esc(info.nome)}</h2>
      <div class="tempo" aria-live="off">${resta}</div>
      <p class="sub peq" style="text-align:center;min-height:1.5em">${f.tipo === 'trabalho' ? esc(info.dica) : prox ? 'Depois: ' + esc(EXERCICIOS[prox.ex].nome) : 'Última rodada!'}</p>
      <div class="btns" style="margin-top:10px">
        <button class="btn sec" data-pausa>${ic(pausado ? 'play' : 'pausa')} ${pausado ? 'Continuar' : 'Pausar'}</button>
        <button class="btn sec" data-pular>${ic('pular')} Pular</button>
      </div>`;
    $('[data-x]', el).onclick = fechar;
    $('[data-pausa]', el).onclick = () => { pausado = !pausado; desenha(); };
    $('[data-pular]', el).onclick = () => { decorrido += resta; avanca(); };
  };
  const avanca = () => {
    i++;
    if (i >= fases.length) return concluir();
    resta = fases[i].seg;
    if (S().prefs.som) bip(fases[i].tipo === 'trabalho' ? 880 : 520, .18);
    if (S().prefs.vibrar) vibrar(120);
    desenha();
  };
  const concluir = () => {
    fechar();
    mudar(s => { s.goFeitos++; s.goHist.push(hojeISO()); if (!s.checkins.includes(hojeISO())) s.checkins.push(hojeISO()); notificar('Livre Go concluído', `${g.nome} (${g.nivel}) feito. Conta para os desafios!`, 'treino', '#/evolucao'); });
    confete(); bip(660, .12, 3);
    toast('Treino concluído! 🎉');
  };
  iv = setInterval(() => {
    if (pausado) return;
    resta--; decorrido++;
    if (resta <= 3 && resta > 0 && S().prefs.som) bip(440, .08);
    if (resta <= 0) avanca();
    else { const t = $('.tempo', el); if (t) t.textContent = resta; const p = $('.progresso i', el); if (p) p.style.width = decorrido / total * 100 + '%'; const c = $('.chip.num', el); if (c) c.textContent = mmss(total - decorrido); }
  }, 1000);
  desenha();
}
