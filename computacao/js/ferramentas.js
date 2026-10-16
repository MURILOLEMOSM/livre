// Ferramentas do dia a dia: bases numéricas, sub-rede, tabela-verdade, Big-O, regex, JSON, timestamp, média e pomodoro

import { $, esc, copyText, store, toast } from './util.js';

const TOOLS = [
  ['bases', '🔢 Conversor de bases e complemento de 2'],
  ['subrede', '🌐 Calculadora de sub-rede IPv4'],
  ['verdade', '⊤ Tabela-verdade'],
  ['bigo', '📈 Big-O na prática'],
  ['regex', '🔍 Testador de regex'],
  ['json', '{ } Formatar e validar JSON'],
  ['tempo', '⏱️ Timestamp Unix'],
  ['media', '🎓 Média da disciplina'],
  ['pomodoro', '🍅 Pomodoro'],
];

export function renderFerramentas(root, open) {
  root.innerHTML = `
    <h1>Ferramentas</h1>
    <p class="muted">Tudo funciona sem internet. Toque para abrir.</p>
    ${TOOLS.map(([k, t]) => `<details class="acc" data-tool="${k}" ${open === k ? 'open' : ''}><summary>${t}</summary><div class="acc-body" id="tool-${k}"></div></details>`).join('')}
  `;
  for (const [k] of TOOLS) INIT[k]($('#tool-' + k));
}

const INIT = { bases, subrede, verdade, bigo, regex, json, tempo, media, pomodoro };

/* ---------------- Bases ---------------- */

function bases(el) {
  el.innerHTML = `
    <div class="field2">
      <div><label for="bDec">Decimal</label><input id="bDec" inputmode="numeric" data-b="10" value="42" /></div>
      <div><label for="bHex">Hexadecimal</label><input id="bHex" data-b="16" autocapitalize="characters" /></div>
      <div><label for="bBin">Binário</label><input id="bBin" inputmode="numeric" data-b="2" /></div>
      <div><label for="bOct">Octal</label><input id="bOct" inputmode="numeric" data-b="8" /></div>
    </div>
    <label for="bBits">Complemento de 2 com</label>
    <select id="bBits"><option>8</option><option selected>16</option><option>32</option></select>
    <div id="bOut" class="mono-box"></div>`;
  const ids = ['#bDec', '#bHex', '#bBin', '#bOct'];
  const update = src => {
    const raw = src.value.trim().replace(/^0[xbo]/i, '').replace(/[\s_]/g, '');
    const base = Number(src.dataset.b);
    const neg = raw.startsWith('-');
    const digits = neg ? raw.slice(1) : raw;
    const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[base];
    if (!digits || !valid.test(digits)) {
      $('#bOut', el).innerHTML = digits ? '<span class="bad-text">Número inválido nessa base</span>' : '';
      return;
    }
    let n = [...digits.toLowerCase()].reduce((a, c) => a * BigInt(base) + BigInt(parseInt(c, 16)), 0n);
    if (neg) n = -n;
    for (const id of ids) {
      const inp = $(id, el);
      if (inp === src) continue;
      const b = BigInt(inp.dataset.b);
      inp.value = (n < 0n ? '-' : '') + (n < 0n ? -n : n).toString(Number(b)).toUpperCase();
    }
    const bits = Number($('#bBits', el).value);
    const min = -(1n << BigInt(bits - 1));
    const max = (1n << BigInt(bits - 1)) - 1n;
    let tc;
    if (n < min || n > max) tc = `<span class="bad-text">Fora do intervalo de ${bits} bits com sinal (${min} a ${max})</span>`;
    else {
      const u = n < 0n ? (1n << BigInt(bits)) + n : n;
      const s = u.toString(2).padStart(bits, '0').replace(/(.{4})(?=.)/g, '$1 ');
      tc = `<b>${s}</b><br><small>hex ${u.toString(16).toUpperCase().padStart(bits / 4, '0')} · intervalo ${min} a ${max}</small>`;
    }
    $('#bOut', el).innerHTML = `Complemento de 2 (${bits} bits):<br>${tc}`;
  };
  let last = $('#bDec', el);
  ids.forEach(id => { $(id, el).oninput = e => { last = e.target; update(last); }; });
  $('#bBits', el).onchange = () => update(last);
  update(last);
}

/* ---------------- Sub-rede ---------------- */

function subrede(el) {
  el.innerHTML = `
    <label for="ipIn">Endereço IP / prefixo</label>
    <input id="ipIn" value="192.168.10.77/26" inputmode="decimal" placeholder="Ex.: 10.0.5.20/22 ou 10.0.5.20 255.255.252.0" />
    <div id="ipOut" style="margin-top:10px"></div>`;
  const toIp = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
  const parse = s => {
    const p = s.split('.').map(Number);
    if (p.length !== 4 || p.some(x => !Number.isInteger(x) || x < 0 || x > 255)) return null;
    return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
  };
  const run = () => {
    const out = $('#ipOut', el);
    const m = $('#ipIn', el).value.trim().match(/^([\d.]+)\s*(?:\/\s*(\d{1,2})|\s+([\d.]+))$/);
    const ip = m && parse(m[1]);
    let prefix = m?.[2] != null ? Number(m[2]) : null;
    if (m?.[3]) {
      const mask = parse(m[3]);
      const inv = mask == null ? 1 : (~mask >>> 0);
      if (mask != null && (inv & (inv + 1)) === 0) prefix = 32 - Math.log2(inv + 1);
    }
    if (ip == null || prefix == null || prefix < 0 || prefix > 32) {
      out.innerHTML = '<p class="muted">Use o formato 192.168.1.10/24 ou 192.168.1.10 255.255.255.0</p>';
      return;
    }
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const net = (ip & mask) >>> 0;
    const bc = (net | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - prefix);
    const hosts = prefix >= 31 ? total : total - 2;
    const first = prefix >= 31 ? net : net + 1;
    const last = prefix >= 31 ? bc : bc - 1;
    const a = ip >>> 24;
    const priv = a === 10 || (a === 172 && ((ip >>> 16) & 255) >= 16 && ((ip >>> 16) & 255) <= 31) || (a === 192 && ((ip >>> 16) & 255) === 168);
    const bin = n => n.toString(2).padStart(32, '0').replace(/(.{8})(?=.)/g, '$1.');
    out.innerHTML = `<table><tbody>
      <tr><th>Máscara</th><td>${toIp(mask)} (/${prefix})</td></tr>
      <tr><th>Rede</th><td>${toIp(net)}</td></tr>
      <tr><th>Broadcast</th><td>${toIp(bc)}</td></tr>
      <tr><th>Hosts úteis</th><td>${toIp(first)} – ${toIp(last)}<br><b>${hosts.toLocaleString('pt-BR')}</b> endereços</td></tr>
      <tr><th>Wildcard</th><td>${toIp(~mask >>> 0)}</td></tr>
      <tr><th>Tipo</th><td>${priv ? 'Privado (RFC 1918)' : a === 127 ? 'Loopback' : 'Público'}${prefix === 31 ? ' · /31 ponto a ponto' : ''}</td></tr>
      <tr><th>IP em binário</th><td class="mono">${bin(ip)}</td></tr>
      <tr><th>Máscara em binário</th><td class="mono">${bin(mask)}</td></tr>
    </tbody></table>`;
  };
  $('#ipIn', el).oninput = run;
  run();
}

/* ---------------- Tabela-verdade ---------------- */

// Analisador próprio (sem eval): ¬ ∧ ∨ ⊕ → ↔ e as versões em texto
function tokenize(src) {
  const out = [];
  const re = /\s*(<->|<=>|↔|->|=>|→|&&|\|\||[()!~¬&|^∧∨⊕+*]|\b(?:and|or|not|xor|e|ou|nao)\b|[A-Za-z_][A-Za-z0-9_]*|[01])\s*/giy;
  let m;
  let pos = 0;
  while (pos < src.length && (m = re.exec(src))) {
    pos = re.lastIndex;
    const t = m[1].toLowerCase();
    const map = { '!': 'not', '~': 'not', '¬': 'not', 'nao': 'not', '&': 'and', '&&': 'and', '∧': 'and', '*': 'and', 'e': 'and', '|': 'or', '||': 'or', '∨': 'or', '+': 'or', 'ou': 'or', '^': 'xor', '⊕': 'xor', '->': 'imp', '=>': 'imp', '→': 'imp', '<->': 'iff', '<=>': 'iff', '↔': 'iff' };
    if (map[t]) out.push({ op: map[t] });
    else if (t === '(' || t === ')') out.push({ op: t });
    else if (t === '0' || t === '1') out.push({ c: t === '1' });
    else out.push({ v: m[1] });
  }
  if (pos < src.length) throw new Error(`Não entendi o símbolo perto de "${src.slice(pos, pos + 6)}"`);
  return out;
}

function parseExpr(tokens) {
  let i = 0;
  const peek = () => tokens[i];
  const eat = op => { if (peek()?.op === op) { i++; return true; } return false; };
  // precedência: not > and > xor > or > imp > iff
  const iff = () => { let l = imp(); while (eat('iff')) { const r = imp(); const a = l; l = e => a(e) === r(e); } return l; };
  const imp = () => { const l = or(); if (eat('imp')) { const r = imp(); return e => !l(e) || r(e); } return l; };
  const or = () => { let l = xor(); while (eat('or')) { const r = xor(); const a = l; l = e => a(e) || r(e); } return l; };
  const xor = () => { let l = and(); while (eat('xor')) { const r = and(); const a = l; l = e => a(e) !== r(e); } return l; };
  const and = () => { let l = not(); while (eat('and')) { const r = not(); const a = l; l = e => a(e) && r(e); } return l; };
  const not = () => {
    if (eat('not')) { const x = not(); return e => !x(e); }
    const t = tokens[i++];
    if (!t) throw new Error('A expressão terminou no meio');
    if (t.op === '(') { const x = iff(); if (!eat(')')) throw new Error('Faltou fechar um parêntese'); return x; }
    if (t.v) return e => e[t.v];
    if (t.c != null) return () => t.c;
    throw new Error('Operador fora do lugar');
  };
  const f = iff();
  if (i < tokens.length) throw new Error('Sobrou algo no fim da expressão (parêntese a mais?)');
  return f;
}

function verdade(el) {
  el.innerHTML = `
    <label for="tvIn">Expressão</label>
    <input id="tvIn" value="(p -> q) <-> (!q -> !p)" autocapitalize="off" spellcheck="false" />
    <p class="muted" style="font-size:.8rem">Operadores: <code>!</code> não · <code>&amp;</code> e · <code>|</code> ou · <code>^</code> xor · <code>-&gt;</code> implica · <code>&lt;-&gt;</code> se e somente se. Também aceita ¬ ∧ ∨ → ↔ e as palavras e/ou/não.</p>
    <div id="tvOut"></div>`;
  const run = () => {
    const out = $('#tvOut', el);
    const src = $('#tvIn', el).value.trim();
    if (!src) { out.innerHTML = ''; return; }
    try {
      const tokens = tokenize(src);
      const vars = [...new Set(tokens.filter(t => t.v).map(t => t.v))];
      if (vars.length > 6) throw new Error('Use no máximo 6 variáveis (64 linhas)');
      const f = parseExpr(tokens);
      const rows = [];
      for (let m = 0; m < 2 ** vars.length; m++) {
        const env = {};
        vars.forEach((v, k) => { env[v] = Boolean((m >> (vars.length - 1 - k)) & 1); });
        rows.push([vars.map(v => env[v]), f(env)]);
      }
      const trues = rows.filter(r => r[1]).length;
      const kind = trues === rows.length ? '<span class="tag ok">Tautologia</span>' : trues === 0 ? '<span class="tag bad">Contradição</span>' : '<span class="tag warn">Contingência</span>';
      const b = x => (x ? 'V' : 'F');
      out.innerHTML = `<p>${kind} · ${trues} de ${rows.length} linhas verdadeiras</p>
        <div style="overflow-x:auto"><table class="tt"><thead><tr>${vars.map(v => `<th>${esc(v)}</th>`).join('')}<th>Resultado</th></tr></thead>
        <tbody>${rows.map(([vs, r]) => `<tr>${vs.map(x => `<td>${b(x)}</td>`).join('')}<td class="${r ? 'ok-text' : 'bad-text'}"><b>${b(r)}</b></td></tr>`).join('')}</tbody></table></div>`;
    } catch (err) {
      out.innerHTML = `<p class="bad-text">${esc(err.message)}</p>`;
    }
  };
  $('#tvIn', el).oninput = run;
  run();
}

/* ---------------- Big-O ---------------- */

function bigo(el) {
  const fns = [
    ['O(1)', () => 1], ['O(log n)', n => Math.log2(Math.max(n, 2))], ['O(n)', n => n], ['O(n log n)', n => n * Math.log2(Math.max(n, 2))],
    ['O(n²)', n => n ** 2], ['O(n³)', n => n ** 3], ['O(2ⁿ)', n => 2 ** n], ['O(n!)', n => { let r = 1; for (let k = 2; k <= n && r < 1e300; k++) r *= k; return r; }],
  ];
  el.innerHTML = `
    <p>Quanto tempo levaria com <b>10⁸ operações por segundo</b> (ordem de grandeza de um juiz online em C++)?</p>
    <label for="nIn">Tamanho da entrada n</label>
    <input id="nIn" type="number" min="1" value="100000" />
    <div id="nOut" style="margin-top:8px"></div>
    <p class="muted" style="font-size:.8rem">Regra de bolso para limite de 1 s: n ≤ 10–11 → n! · n ≤ 25 → 2ⁿ · n ≤ 500 → n³ · n ≤ 10⁴ → n² · n ≤ 10⁶ → n log n · n ≤ 10⁸ → n.</p>`;
  const fmt = s => {
    if (!isFinite(s) || s > 3.15e7 * 1e6) return '∞ (mais que um milhão de anos)';
    if (s < 1e-3) return 'instantâneo';
    if (s < 1) return `${Math.round(s * 1000)} ms`;
    if (s < 60) return `${s.toFixed(1)} s`;
    if (s < 3600) return `${(s / 60).toFixed(1)} min`;
    if (s < 86400) return `${(s / 3600).toFixed(1)} h`;
    if (s < 3.15e7) return `${(s / 86400).toFixed(1)} dias`;
    return `${(s / 3.15e7).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} anos`;
  };
  const run = () => {
    const n = Math.max(1, Number($('#nIn', el).value) || 1);
    $('#nOut', el).innerHTML = `<table><tbody>${fns.map(([name, f]) => {
      const s = f(n) / 1e8;
      const cls = s <= 1 ? 'ok' : s <= 10 ? 'warn' : 'bad';
      return `<tr><th>${name}</th><td><span class="tag ${cls}">${fmt(s)}</span></td></tr>`;
    }).join('')}</tbody></table>`;
  };
  $('#nIn', el).oninput = run;
  run();
}

/* ---------------- Regex ---------------- */

function regex(el) {
  el.innerHTML = `
    <div class="row" style="flex-wrap:nowrap">
      <div style="flex:1"><label for="reP">Padrão</label><input id="reP" class="mono" value="(\\d{2})/(\\d{2})/(\\d{4})" spellcheck="false" autocapitalize="off" /></div>
      <div style="width:80px"><label for="reF">Flags</label><input id="reF" class="mono" value="g" autocapitalize="off" /></div>
    </div>
    <label for="reT">Texto de teste</label>
    <textarea id="reT" spellcheck="false">Prova 1: 14/10/2026\nEntrega do TP: 03/11/2026\nRecuperação: 1/12/26 (formato errado)</textarea>
    <div id="reOut" class="mono-box"></div>
    <details style="margin-top:8px"><summary class="muted">Cola rápida</summary>
      <table><tbody>
        <tr><td class="mono">\\d \\w \\s</td><td>dígito, letra/número/_, espaço</td></tr>
        <tr><td class="mono">. ^ $</td><td>qualquer caractere, início, fim</td></tr>
        <tr><td class="mono">* + ? {2,5}</td><td>0+, 1+, 0 ou 1, de 2 a 5</td></tr>
        <tr><td class="mono">[a-z] [^0-9]</td><td>conjunto, conjunto negado</td></tr>
        <tr><td class="mono">( ) (?: ) (?&lt;nome&gt; )</td><td>grupo, grupo sem captura, grupo nomeado</td></tr>
        <tr><td class="mono">a|b</td><td>a ou b</td></tr>
        <tr><td class="mono">(?= ) (?! )</td><td>lookahead positivo / negativo</td></tr>
        <tr><td class="mono">g i m s u</td><td>global, ignora maiúsculas, multilinha, . pega \\n, unicode</td></tr>
      </tbody></table>
    </details>`;
  const run = () => {
    const out = $('#reOut', el);
    const text = $('#reT', el).value;
    let re;
    try {
      const flags = $('#reF', el).value.replace(/[^dgimsuyv]/g, '');
      re = new RegExp($('#reP', el).value, flags.includes('g') ? flags : flags + 'g');
    } catch (err) {
      out.innerHTML = `<span class="bad-text">${esc(err.message)}</span>`;
      return;
    }
    if (!$('#reP', el).value) { out.innerHTML = ''; return; }
    const matches = [...text.matchAll(re)].slice(0, 200);
    let html = '';
    let pos = 0;
    for (const m of matches) {
      if (!m[0].length) continue;
      html += esc(text.slice(pos, m.index)) + `<mark>${esc(m[0])}</mark>`;
      pos = m.index + m[0].length;
    }
    html += esc(text.slice(pos));
    const groups = matches.filter(m => m.length > 1).slice(0, 10)
      .map((m, k) => `<div><small>#${k + 1}: ${m.slice(1).map((g, j) => `$${j + 1}=<b>${esc(g ?? '∅')}</b>`).join(' ')}</small></div>`).join('');
    out.innerHTML = `<div>${matches.length} ocorrência(s)</div><div style="white-space:pre-wrap;margin:6px 0">${html}</div>${groups}`;
  };
  ['#reP', '#reF', '#reT'].forEach(id => { $(id, el).oninput = run; });
  run();
}

/* ---------------- JSON ---------------- */

function json(el) {
  el.innerHTML = `
    <textarea id="jsIn" class="mono" spellcheck="false" style="min-height:140px" placeholder='{"nome":"Ana","notas":[8.5,9]}'></textarea>
    <div class="row" style="margin-top:8px">
      <button type="button" class="soft small" id="jsFmt">Formatar</button>
      <button type="button" class="soft small" id="jsMin">Minificar</button>
      <button type="button" class="ghost small" id="jsCopy">Copiar</button>
    </div>
    <div id="jsOut" style="margin-top:6px"></div>`;
  const go = space => {
    const inp = $('#jsIn', el);
    try {
      inp.value = JSON.stringify(JSON.parse(inp.value), null, space);
      $('#jsOut', el).innerHTML = '<span class="ok-text">JSON válido ✔</span>';
    } catch (err) {
      const pos = Number(err.message.match(/position (\d+)/)?.[1]);
      const line = Number.isFinite(pos) ? inp.value.slice(0, pos).split('\n').length : null;
      $('#jsOut', el).innerHTML = `<span class="bad-text">${esc(err.message)}${line && !/line/.test(err.message) ? ` (linha ${line})` : ''}</span>`;
    }
  };
  $('#jsFmt', el).onclick = () => go(2);
  $('#jsMin', el).onclick = () => go(0);
  $('#jsCopy', el).onclick = () => copyText($('#jsIn', el).value);
}

/* ---------------- Timestamp ---------------- */

function tempo(el) {
  el.innerHTML = `
    <label for="tsIn">Timestamp (segundos ou milissegundos)</label>
    <div class="row" style="flex-wrap:nowrap"><input id="tsIn" inputmode="numeric" class="mono" /><button type="button" class="soft" id="tsNow">Agora</button></div>
    <div id="tsOut" class="mono-box"></div>
    <label for="dtIn">Data e hora → timestamp</label>
    <input id="dtIn" type="datetime-local" />
    <div id="dtOut" class="mono-box"></div>`;
  const run = () => {
    const v = $('#tsIn', el).value.trim();
    if (!/^-?\d+$/.test(v)) { $('#tsOut', el).textContent = v ? 'Digite só números' : ''; return; }
    const ms = v.length > 11 ? Number(v) : Number(v) * 1000;
    const d = new Date(ms);
    $('#tsOut', el).innerHTML = `Local: <b>${d.toLocaleString('pt-BR')}</b><br>UTC: ${d.toISOString()}<br><small>${v.length > 11 ? 'lido como milissegundos' : 'lido como segundos'}</small>`;
  };
  $('#tsIn', el).oninput = run;
  $('#tsNow', el).onclick = () => { $('#tsIn', el).value = Math.floor(Date.now() / 1000); run(); };
  $('#dtIn', el).oninput = e => {
    const d = new Date(e.target.value);
    $('#dtOut', el).innerHTML = isNaN(d) ? '' : `segundos: <b>${Math.floor(d / 1000)}</b><br>milissegundos: ${d.getTime()}`;
  };
  $('#tsNow', el).onclick();
}

/* ---------------- Média ---------------- */

function media(el) {
  const saved = store.get('media', { rows: [['P1', '', 3], ['P2', '', 3], ['Trabalho', '', 2], ['Listas', '', 2]], min: 6 });
  el.innerHTML = `
    <p class="muted">Coloque o peso de cada avaliação (pode ser em % ou em pontos). Deixe a nota em branco se ainda não fez: o app calcula quanto precisa tirar.</p>
    <div id="mdRows"></div>
    <div class="row" style="margin-top:6px"><button type="button" class="ghost small" id="mdAdd">＋ Avaliação</button></div>
    <label for="mdMin">Média para passar</label>
    <input id="mdMin" type="number" step="0.1" value="${esc(saved.min)}" style="max-width:120px" />
    <div id="mdOut" style="margin-top:10px"></div>`;
  const draw = () => {
    $('#mdRows', el).innerHTML = `<table><thead><tr><th>Avaliação</th><th>Nota (0–10)</th><th>Peso</th><th></th></tr></thead><tbody>
      ${saved.rows.map((r, i) => `<tr>
        <td><input data-i="${i}" data-k="0" value="${esc(r[0])}" /></td>
        <td><input data-i="${i}" data-k="1" type="number" step="0.1" min="0" max="10" value="${esc(r[1])}" /></td>
        <td><input data-i="${i}" data-k="2" type="number" step="0.5" min="0" value="${esc(r[2])}" style="max-width:80px" /></td>
        <td><button type="button" class="x" data-rm="${i}" aria-label="Remover">×</button></td></tr>`).join('')}
    </tbody></table>`;
    calc();
  };
  const calc = () => {
    const min = Number($('#mdMin', el).value) || 0;
    saved.min = min;
    store.set('media', saved);
    const total = saved.rows.reduce((a, r) => a + (Number(r[2]) || 0), 0);
    if (!total) { $('#mdOut', el).innerHTML = ''; return; }
    const done = saved.rows.filter(r => r[1] !== '');
    const got = done.reduce((a, r) => a + Number(r[1]) * (Number(r[2]) || 0), 0);
    const doneW = done.reduce((a, r) => a + (Number(r[2]) || 0), 0);
    const left = total - doneW;
    let msg;
    if (!left) {
      const m = got / total;
      msg = `<div class="result">${m.toFixed(2)}</div>${m >= min ? '<span class="tag ok">Aprovado(a) 🎉</span>' : `<span class="tag bad">Faltaram ${(min - m).toFixed(2)} pontos</span>`}`;
    } else {
      const need = (min * total - got) / left;
      msg = `Média parcial: <b>${doneW ? (got / doneW).toFixed(2) : '—'}</b><br>`
        + (need <= 0 ? '<span class="tag ok">Já passou, mesmo tirando 0 no resto</span>'
          : need > 10 ? `<span class="tag bad">Precisaria de ${need.toFixed(2)} no que falta: hora de falar com o professor sobre recuperação</span>`
            : `Precisa de média <b class="result" style="font-size:1.2rem">${need.toFixed(2)}</b> no que falta.`);
    }
    $('#mdOut', el).innerHTML = msg;
  };
  $('#mdRows', el).oninput = e => {
    const { i, k } = e.target.dataset;
    if (i == null) return;
    saved.rows[i][k] = e.target.value;
    calc();
  };
  $('#mdRows', el).onclick = e => {
    const b = e.target.closest('[data-rm]');
    if (!b) return;
    saved.rows.splice(Number(b.dataset.rm), 1);
    draw();
  };
  $('#mdAdd', el).onclick = () => { saved.rows.push([`Avaliação ${saved.rows.length + 1}`, '', 1]); draw(); };
  $('#mdMin', el).oninput = calc;
  draw();
}

/* ---------------- Pomodoro ---------------- */

let pomo = null; // continua contando ao trocar de aba

function pomodoro(el) {
  el.innerHTML = `
    <p class="muted">25 min de foco, 5 de pausa; a cada 4 ciclos, 15 min. Celular longe e uma tarefa só.</p>
    <div class="chips" id="pmMode">
      <button type="button" class="chip" data-min="25">Foco 25</button>
      <button type="button" class="chip" data-min="50">Foco 50</button>
      <button type="button" class="chip" data-min="5">Pausa 5</button>
      <button type="button" class="chip" data-min="15">Pausa 15</button>
    </div>
    <div class="result" id="pmClock" style="font-size:2.6rem;text-align:center;font-variant-numeric:tabular-nums">25:00</div>
    <div class="row" style="justify-content:center"><button type="button" id="pmGo">Começar</button><button type="button" class="ghost" id="pmStop">Parar</button></div>
    <p class="muted" style="text-align:center" id="pmCount"></p>`;
  const count = () => {
    const today = new Date().toISOString().slice(0, 10);
    const c = store.get('pomos', {});
    $('#pmCount', el).textContent = `${c[today] || 0} ciclo(s) de foco hoje`;
  };
  let chosen = 25;
  const show = () => {
    // o intervalo do pomodoro em andamento chama esta função também depois de trocar de aba
    const ms = pomo ? Math.max(0, pomo.end - Date.now()) : chosen * 60000;
    const s = Math.ceil(ms / 1000);
    const clock = $('#pmClock');
    if (clock) clock.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  $('#pmMode', el).onclick = e => {
    const b = e.target.closest('[data-min]');
    if (!b || pomo) return;
    chosen = Number(b.dataset.min);
    el.querySelectorAll('#pmMode .chip').forEach(c => c.classList.toggle('on', c === b));
    show();
  };
  $('#pmGo', el).onclick = () => {
    if (pomo) return;
    pomo = { end: Date.now() + chosen * 60000, focus: chosen >= 25 };
    pomo.timer = setInterval(() => {
      show();
      if (Date.now() < pomo.end) return;
      clearInterval(pomo.timer);
      if (pomo.focus) {
        const today = new Date().toISOString().slice(0, 10);
        const c = store.get('pomos', {});
        c[today] = (c[today] || 0) + 1;
        store.set('pomos', c);
      }
      toast(pomo.focus ? 'Foco concluído! Hora da pausa ☕' : 'Pausa acabou. Bora!');
      navigator.vibrate?.([200, 100, 200]);
      pomo = null;
      if ($('#pmCount')) count();
    }, 500);
  };
  $('#pmStop', el).onclick = () => { if (pomo) clearInterval(pomo.timer); pomo = null; show(); };
  el.querySelector('#pmMode .chip').classList.add('on');
  count();
  show();
}
