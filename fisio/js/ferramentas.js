// Ferramentas: calculadoras, escalas, ADM de referência, sinais vitais, testes especiais e inclinômetro

import { $, $$, esc } from './util.js';

const ADM = [
  ['Ombro', [['Flexão', '0–180°'], ['Extensão', '0–60°'], ['Abdução', '0–180°'], ['Rotação interna', '0–70°'], ['Rotação externa', '0–90°']]],
  ['Cotovelo', [['Flexão', '0–150°'], ['Extensão', '0° (hiperextensão até ~10°)']]],
  ['Antebraço', [['Pronação', '0–80°'], ['Supinação', '0–80°']]],
  ['Punho', [['Flexão', '0–80°'], ['Extensão', '0–70°'], ['Desvio radial', '0–20°'], ['Desvio ulnar', '0–30°']]],
  ['Quadril', [['Flexão', '0–120°'], ['Extensão', '0–30°'], ['Abdução', '0–45°'], ['Adução', '0–30°'], ['Rotação interna', '0–45°'], ['Rotação externa', '0–45°']]],
  ['Joelho', [['Flexão', '0–135°'], ['Extensão', '0°']]],
  ['Tornozelo', [['Dorsiflexão', '0–20°'], ['Flexão plantar', '0–50°'], ['Inversão', '0–35°'], ['Eversão', '0–15°']]],
  ['Coluna cervical', [['Flexão', '0–45°'], ['Extensão', '0–45°'], ['Inclinação lateral', '0–45°'], ['Rotação', '0–60°']]],
];

const TESTES = {
  Ombro: [
    ['Neer', 'Estabilize a escápula e eleve passivamente o braço em rotação interna até a flexão máxima.', 'Dor na região anterolateral do ombro: dor subacromial.'],
    ['Hawkins-Kennedy', 'Ombro e cotovelo a 90° de flexão; faça rotação interna passiva do ombro.', 'Dor: dor subacromial.'],
    ['Jobe (lata vazia)', 'Braços a 90° no plano da escápula, polegares para baixo; resista ao movimento para cima.', 'Dor ou fraqueza: supraespinal.'],
    ['Speed', 'Ombro a 90° de flexão, cotovelo estendido e antebraço supinado; resista à flexão.', 'Dor no sulco bicipital: cabeça longa do bíceps.'],
    ['Apreensão', 'Decúbito dorsal, abdução 90° e cotovelo 90°; leve à rotação externa aos poucos.', 'Medo/apreensão (não só dor): instabilidade anterior.'],
  ],
  Joelho: [
    ['Lachman', 'Joelho a 20–30° de flexão; estabilize o fêmur e desloque a tíbia para a frente.', 'Translação aumentada ou final mole: lesão do LCA.'],
    ['Gaveta anterior', 'Joelho a 90°, pé fixo; puxe a tíbia para a frente.', 'Translação aumentada: LCA.'],
    ['Gaveta posterior', 'Joelho a 90°, pé fixo; empurre a tíbia para trás.', 'Translação aumentada: LCP.'],
    ['McMurray', 'Flexão máxima, rode a tíbia e estenda o joelho palpando a interlinha.', 'Estalido doloroso na interlinha: menisco.'],
    ['Estresse em valgo / varo', 'Aplique força em valgo (ou varo) com o joelho a 0° e a 30°.', 'Dor ou abertura: colateral medial (valgo) / lateral (varo).'],
  ],
  Coluna: [
    ['Lasègue (SLR)', 'Decúbito dorsal; eleve passivamente a perna estendida.', 'Dor irradiada abaixo do joelho entre ~30° e 70°: radiculopatia lombar.'],
    ['Slump', 'Sentado: flexão do tronco e da cervical, extensão do joelho e dorsiflexão.', 'Reproduz sintomas que aliviam ao estender a cervical: mecanossensibilidade neural.'],
    ['Spurling', 'Extensão, inclinação e rotação da cervical para o lado dos sintomas + leve compressão.', 'Dor irradiada para o braço: radiculopatia cervical.'],
  ],
  Quadril: [
    ['Thomas', 'Na beira da maca, o paciente abraça um joelho no peito.', 'Coxa oposta sai da maca: iliopsoas encurtado; joelho estende: reto femoral.'],
    ['FABER (Patrick)', 'Flexão, abdução e rotação externa (pé sobre o joelho oposto); pressione o joelho.', 'Dor na virilha: quadril; dor posterior: sacroilíaca.'],
    ['FADIR', 'Flexão de 90°, adução e rotação interna do quadril.', 'Dor na virilha: impacto femoroacetabular / lábio.'],
    ['Trendelenburg', 'Apoio em uma perna só por ~30 s.', 'Pelve cai do lado oposto: fraqueza do glúteo médio do lado de apoio.'],
    ['Ober', 'Decúbito lateral, quadril em extensão e abdução; solte a perna.', 'Perna não desce: trato iliotibial encurtado.'],
  ],
  'Tornozelo e pé': [
    ['Thompson', 'Em prono, pés para fora da maca; aperte a panturrilha.', 'Sem flexão plantar: ruptura do tendão do calcâneo.'],
    ['Gaveta anterior', 'Leve flexão plantar; estabilize a tíbia e puxe o calcâneo para a frente.', 'Translação aumentada: ligamento talofibular anterior.'],
  ],
  'Punho e mão': [
    ['Phalen', 'Flexão máxima dos dois punhos, dorso com dorso, por 60 s.', 'Formigamento no polegar, indicador e médio: túnel do carpo.'],
    ['Tinel (punho)', 'Percuta sobre o túnel do carpo.', 'Choque/formigamento no território do mediano.'],
    ['Finkelstein', 'Polegar fechado dentro da mão; faça desvio ulnar do punho.', 'Dor no processo estiloide do rádio: De Quervain.'],
  ],
};

const MRC = [
  ['0', 'Nenhuma contração'],
  ['1', 'Contração visível ou palpável, sem movimento'],
  ['2', 'Movimento completo sem a gravidade'],
  ['3', 'Movimento completo contra a gravidade'],
  ['4', 'Movimento contra a gravidade e alguma resistência'],
  ['5', 'Força normal'],
];
const ASHWORTH = [
  ['0', 'Sem aumento do tônus'],
  ['1', 'Leve aumento: resistência mínima no final da ADM (tranco e soltura)'],
  ['1+', 'Leve aumento: tranco seguido de resistência mínima em menos da metade da ADM'],
  ['2', 'Aumento mais marcado na maior parte da ADM, mas o segmento move com facilidade'],
  ['3', 'Aumento considerável; movimento passivo difícil'],
  ['4', 'Segmento rígido em flexão ou extensão'],
];
const BORG = [
  ['0', 'Nenhum esforço'], ['0,5', 'Extremamente leve'], ['1', 'Muito leve'], ['2', 'Leve'], ['3', 'Moderado'],
  ['4', 'Um pouco intenso'], ['5–6', 'Intenso'], ['7–9', 'Muito intenso'], ['10', 'Extremamente intenso (máximo)'],
];
const GLASGOW = {
  'Abertura ocular': [[4, 'Espontânea'], [3, 'Ao som / chamado'], [2, 'À pressão'], [1, 'Nenhuma']],
  'Resposta verbal': [[5, 'Orientada'], [4, 'Confusa'], [3, 'Palavras'], [2, 'Sons'], [1, 'Nenhuma']],
  'Resposta motora': [[6, 'Obedece comandos'], [5, 'Localiza'], [4, 'Flexão normal (retirada)'], [3, 'Flexão anormal'], [2, 'Extensão'], [1, 'Nenhuma']],
};

const scaleTable = rows => rows.map(([k, v]) => `<div class="scale-row"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');

export function renderFerramentas(root) {
  root.innerHTML = `
    <h1>Ferramentas</h1>
    <p class="muted">Escalas, calculadoras e referências rápidas para o atendimento.</p>

    <details class="acc" open><summary>😣 Escala de dor (EVA / END 0–10)</summary><div class="acc-body">
      <div class="pain-scale" id="pain">${Array.from({ length: 11 }, (_, i) => `<button type="button" data-p="${i}" style="background:hsl(${120 - i * 12} 60% 42%)">${i}</button>`).join('')}</div>
      <p id="painTxt" class="result" style="font-size:1.05rem">Toque no número que o paciente indicar</p>
    </div></details>

    <details class="acc"><summary>⚖️ IMC</summary><div class="acc-body">
      <div class="field2">
        <div><label for="imcP">Peso (kg)</label><input id="imcP" type="number" inputmode="decimal" step="0.1" /></div>
        <div><label for="imcA">Altura (cm)</label><input id="imcA" type="number" inputmode="decimal" /></div>
      </div>
      <div class="result" id="imcR"></div>
      <p class="muted" style="font-size:.82rem">Adultos (OMS): &lt;18,5 baixo peso · 18,5–24,9 adequado · 25–29,9 sobrepeso · ≥30 obesidade. Em idosos e atletas, interprete com cautela.</p>
    </div></details>

    <details class="acc"><summary>❤️ Frequência cardíaca alvo (Karvonen)</summary><div class="acc-body">
      <div class="field2">
        <div><label for="fcIdade">Idade</label><input id="fcIdade" type="number" inputmode="numeric" /></div>
        <div><label for="fcRep">FC de repouso (bpm)</label><input id="fcRep" type="number" inputmode="numeric" /></div>
        <div><label for="fcMin">Intensidade mínima (%)</label><input id="fcMin" type="number" value="50" /></div>
        <div><label for="fcMax">Intensidade máxima (%)</label><input id="fcMax" type="number" value="70" /></div>
      </div>
      <div class="result" id="fcR"></div>
      <p class="muted" style="font-size:.82rem">FCmáx estimada por Tanaka (208 − 0,7 × idade) e, entre parênteses, pela fórmula clássica 220 − idade. Betabloqueadores alteram a FC: nesses casos, prefira a escala de Borg.</p>
    </div></details>

    <details class="acc"><summary>📏 Inclinômetro com o celular</summary><div class="acc-body">
      <p>Apoie a borda do celular no segmento, toque em <b>Zerar</b> na posição inicial e mova até a final.</p>
      <div class="result" id="incR" style="font-size:2.4rem;text-align:center">—</div>
      <div class="row" style="justify-content:center">
        <button type="button" id="incStart">Ativar sensor</button>
        <button type="button" class="ghost" id="incZero" disabled>Zerar</button>
      </div>
      <p class="muted" style="font-size:.82rem;margin-top:8px">Apps de celular mostraram boa concordância com o goniômetro em estudos, mas a medida depende do posicionamento. Use para acompanhar evolução e registre sempre do mesmo jeito.</p>
    </div></details>

    <details class="acc"><summary>📐 ADM de referência (goniometria)</summary><div class="acc-body">
      <table><thead><tr><th>Articulação</th><th>Movimento</th><th>Referência</th></tr></thead><tbody>
        ${ADM.map(([art, mov]) => mov.map(([m, v], i) => `<tr><td>${i === 0 ? `<b>${esc(art)}</b>` : ''}</td><td>${esc(m)}</td><td>${esc(v)}</td></tr>`).join('')).join('')}
      </tbody></table>
      <p class="muted" style="font-size:.82rem">Valores aproximados de referência (AAOS / Marques). Variam entre autores, idade e sexo: compare sempre com o lado não acometido.</p>
    </div></details>

    <details class="acc"><summary>💪 Força muscular (MRC / Oxford)</summary><div class="acc-body">${scaleTable(MRC)}</div></details>
    <details class="acc"><summary>🦵 Espasticidade (Ashworth modificada)</summary><div class="acc-body">${scaleTable(ASHWORTH)}</div></details>
    <details class="acc"><summary>🏃 Esforço percebido (Borg CR10)</summary><div class="acc-body">${scaleTable(BORG)}</div></details>

    <details class="acc"><summary>🧠 Escala de coma de Glasgow</summary><div class="acc-body">
      ${Object.entries(GLASGOW).map(([k, opts]) => `<label>${esc(k)}</label><select data-gcs>${opts.map(([v, t]) => `<option value="${v}">${v} · ${esc(t)}</option>`).join('')}</select>`).join('')}
      <div class="result" id="gcsR"></div>
    </div></details>

    <details class="acc"><summary>🩺 Sinais vitais (adulto em repouso)</summary><div class="acc-body">
      <table><tbody>
        <tr><td><b>FC</b></td><td>60–100 bpm</td></tr>
        <tr><td><b>FR</b></td><td>12–20 irpm</td></tr>
        <tr><td><b>PA</b></td><td>Ótima &lt; 120/80 · Hipertensão ≥ 140/90 mmHg</td></tr>
        <tr><td><b>SpO₂</b></td><td>≥ 95% (em DPOC o alvo costuma ser 88–92%)</td></tr>
        <tr><td><b>Temperatura</b></td><td>Axilar ~36–37,2 °C · febre ≥ 37,8 °C</td></tr>
      </tbody></table>
      <div class="notice">Antes do exercício: PA de repouso muito elevada (≥ 200/110 mmHg pelo ACSM; muitos serviços usam limite mais conservador, como 180/110), FC de repouso &gt; 120 bpm, SpO₂ baixa ou sintomas (dor no peito, tontura) → não inicie e comunique o responsável.</div>
    </div></details>

    <h2>Testes especiais</h2>
    <div class="chips" id="testChips">${Object.keys(TESTES).map((k, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-t="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div id="testList"></div>
    <p class="muted" style="font-size:.82rem">Nenhum teste isolado fecha diagnóstico: combine com a história e outros testes (agrupamentos/clusters).</p>
  `;

  // Dor
  const painTxt = ['Sem dor', 'Leve', 'Leve', 'Leve', 'Moderada', 'Moderada', 'Moderada', 'Intensa', 'Intensa', 'Intensa', 'Pior dor imaginável'];
  $('#pain').onclick = e => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    $('#painTxt').textContent = `${b.dataset.p}/10 · ${painTxt[b.dataset.p]}`;
  };

  // IMC
  const imc = () => {
    const p = parseFloat($('#imcP').value), a = parseFloat($('#imcA').value) / 100;
    if (!p || !a) { $('#imcR').textContent = ''; return; }
    const v = p / (a * a);
    const c = v < 18.5 ? 'baixo peso' : v < 25 ? 'adequado' : v < 30 ? 'sobrepeso' : 'obesidade';
    $('#imcR').textContent = `${v.toFixed(1).replace('.', ',')} kg/m² · ${c}`;
  };
  $('#imcP').oninput = imc; $('#imcA').oninput = imc;

  // Karvonen
  const fc = () => {
    const idade = +$('#fcIdade').value, rep = +$('#fcRep').value, lo = +$('#fcMin').value / 100, hi = +$('#fcMax').value / 100;
    if (!idade || !rep) { $('#fcR').textContent = ''; return; }
    const max = Math.round(208 - 0.7 * idade);
    const zone = m => `${Math.round((m - rep) * lo + rep)}–${Math.round((m - rep) * hi + rep)}`;
    $('#fcR').innerHTML = `FCmáx ${max} bpm<br>Zona alvo: ${zone(max)} bpm <small class="muted">(${zone(220 - idade)})</small>`;
  };
  ['#fcIdade', '#fcRep', '#fcMin', '#fcMax'].forEach(s => { $(s).oninput = fc; });

  // Glasgow
  const gcs = () => {
    const total = $$('[data-gcs]').reduce((s, el) => s + Number(el.value), 0);
    const g = total <= 8 ? 'grave' : total <= 12 ? 'moderado' : 'leve';
    $('#gcsR').textContent = `Total: ${total}/15 · TCE ${g}`;
  };
  $$('[data-gcs]').forEach(el => { el.onchange = gcs; });
  gcs();

  // Inclinômetro
  let zero = null, last = null;
  const onOrient = e => {
    // beta: inclinação frente/trás; gamma: lateral. Usa o eixo que mais variou.
    last = { b: e.beta || 0, g: e.gamma || 0 };
    if (zero === null) return void ($('#incR').textContent = `${Math.round(Math.abs(last.b))}°`);
    const db = last.b - zero.b, dg = last.g - zero.g;
    $('#incR').textContent = `${Math.round(Math.abs(Math.abs(db) >= Math.abs(dg) ? db : dg))}°`;
  };
  $('#incStart').onclick = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') throw new Error('negado');
      }
      if (!('DeviceOrientationEvent' in window)) throw new Error('sem sensor');
      window.addEventListener('deviceorientation', onOrient);
      $('#incZero').disabled = false;
      $('#incStart').disabled = true;
      $('#incR').textContent = '0°';
    } catch {
      $('#incR').textContent = 'Sensor indisponível';
    }
  };
  $('#incZero').onclick = () => { if (last) { zero = { ...last }; $('#incR').textContent = '0°'; } };
  // remove o listener ao sair da tela
  window.addEventListener('hashchange', () => window.removeEventListener('deviceorientation', onOrient), { once: true });

  // Testes
  const drawTests = k => {
    $('#testList').innerHTML = TESTES[k].map(([n, how, pos]) => `
      <div class="card"><h3>${esc(n)}</h3><p><b>Como:</b> ${esc(how)}</p><p style="margin-bottom:0"><b>Positivo:</b> ${esc(pos)}</p></div>`).join('');
  };
  $('#testChips').onclick = e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    $$('#testChips .chip').forEach(c => c.classList.toggle('on', c === b));
    drawTests(b.dataset.t);
  };
  drawTests(Object.keys(TESTES)[0]);
}
