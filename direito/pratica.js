/* =========================================================
   TOGA · prática
   Processos (DataJud/CNJ), intimações por OAB (DJEN), modelos
   grátis, lei seca, página "Sobre" e avisos de prazo.
   Carrega depois de app.js e dá a partida no app.
   ========================================================= */

/* ---------- Número único do processo ---------- */
const UF_ORDEM = ['ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'se', 'sp', 'to'];
const onlyDigits = s => String(s || '').replace(/\D/g, '');

function checkCnj(d) {
  if (!/^\d{20}$/.test(d)) return false;
  const r = BigInt(d.slice(0, 7) + d.slice(9) + '00') % 97n;
  return String(98n - r).padStart(2, '0') === d.slice(7, 9);
}
function maskCnj(d) {
  d = onlyDigits(d);
  return d.length === 20 ? `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d[13]}.${d.slice(14, 16)}.${d.slice(16)}` : d;
}
function tribunalOf(d) {
  const j = d[13], tr = Number(d.slice(14, 16)), uf = UF_ORDEM[tr - 1];
  if (j === '1') return 'stf';
  if (j === '3') return 'stj';
  if (j === '4') return tr >= 1 && tr <= 6 ? `trf${tr}` : null;
  if (j === '5') return tr === 0 ? 'tst' : tr <= 24 ? `trt${tr}` : null;
  if (j === '6') return tr === 0 ? 'tse' : uf ? `tre-${uf}` : null;
  if (j === '7') return 'stm';
  if (j === '8') return uf ? (uf === 'df' ? 'tjdft' : `tj${uf}`) : null;
  if (j === '9') return ({ 13: 'tjmmg', 21: 'tjmrs', 26: 'tjmsp' })[tr] || null;
  return null;
}
const SEGMENTO = { 1: 'STF', 2: 'CNJ', 3: 'STJ', 4: 'Justiça Federal', 5: 'Justiça do Trabalho', 6: 'Justiça Eleitoral', 7: 'Justiça Militar da União', 8: 'Justiça Estadual', 9: 'Justiça Militar Estadual' };
const GRAU = { G1: '1º grau', G2: '2º grau', JE: 'Juizado Especial', TR: 'Turma Recursal', SUP: 'Tribunal Superior', TRU: 'Turma Regional de Uniformização', TNU: 'Turma Nacional de Uniformização' };
const siteTribunal = alias => `https://www.${alias === 'stf' ? 'stf' : alias}.jus.br`;
const fmtDateTime = s => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  const hora = /T\d\d:\d\d/.test(s) && !/T00:00(:00)?/.test(s);
  return d.toLocaleDateString('pt-BR') + (hora ? ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
};
const toIsoDay = s => {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/) || String(s || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return '';
  return m[1].length === 4 ? `${m[1]}-${m[2]}-${m[3]}` : `${m[3]}-${m[2]}-${m[1]}`;
};

async function api(path, opts) {
  const res = await fetch(path, opts);
  let body = {};
  try { body = await res.json(); } catch { /* resposta sem JSON: função não publicada */ }
  if (!res.ok || body.error) throw new Error(body.error || 'Serviço indisponível. Se o app está rodando sem o Netlify, as consultas não funcionam.');
  return body;
}

/* ---------- Processos ---------- */
const procs = () => store.get('processos', []);
const saveProcs = list => store.set('processos', list);
const movCount = r => (r?.graus || []).reduce((n, g) => n + g.movimentos.length, 0);

async function refreshProc(id) {
  const list = procs();
  const p = list.find(x => x.id === id);
  if (!p) return;
  const r = await api('/api/datajud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero: p.numero }),
  });
  p.last = r;
  p.checkedAt = r.consultadoEm;
  if (p.seen == null) p.seen = movCount(r);   // primeira consulta: nada é "novo"
  saveProcs(list);
  return p;
}

function viewProcessos(id) {
  if (id) return procDetail(id);
  const list = procs();
  const oab = store.get('oab', { numero: '', uf: '' });
  const today = iso(new Date());

  view().innerHTML = `
    <section class="head"><div><p class="kicker">Grátis · dados oficiais do CNJ</p><h1>Processos</h1></div></section>

    <form id="procForm" class="card form">
      <label>Número do processo (20 dígitos)<input name="numero" inputmode="numeric" required placeholder="0000000-00.0000.0.00.0000" autocomplete="off"></label>
      <div class="grid2">
        <label>Apelido<input name="apelido" placeholder="Ex.: Maria x Banco"></label>
        <label>Cliente<input name="cliente"></label>
      </div>
      <p class="msg" id="procMsg"></p>
      <button class="btn gold wide"><i data-lucide="plus"></i>Acompanhar</button>
    </form>

    ${list.length ? `
      <div class="row-head"><h2 class="sec">Acompanhando (${list.length})</h2>
        <button class="btn ghost" data-act="refresh-all"><i data-lucide="refresh-cw"></i>Atualizar todos</button></div>
      <ul class="procs">${list.map(p => {
        const novos = Math.max(0, movCount(p.last) - (p.seen || 0));
        const ult = p.last?.graus?.flatMap(g => g.movimentos).sort((a, b) => b.data.localeCompare(a.data))[0];
        return `<li><a href="#/processos/${p.id}">
          <div><b>${esc(p.apelido || maskCnj(p.numero))}</b>
            <small>${esc(maskCnj(p.numero))} · ${esc((p.alias || '').toUpperCase())}${p.cliente ? ' · ' + esc(p.cliente) : ''}</small>
            <small>${ult ? 'Último andamento: ' + esc(ult.nome) + ' em ' + fmtDateTime(ult.data) : p.checkedAt ? 'Sem andamentos na fonte' : 'Ainda não consultado'}</small></div>
          ${novos ? `<span class="due">${novos} novo${novos > 1 ? 's' : ''}</span>` : ''}
        </a></li>`;
      }).join('')}</ul>` : ''}

    <section>
      <h2 class="sec">Intimações no Diário (DJEN)</h2>
      <p class="muted">Busca as publicações no seu nome no Diário de Justiça Eletrônico Nacional. É a fonte oficial e é grátis.</p>
      <form id="djenForm" class="card form">
        <div class="grid3">
          <label>OAB nº<input name="oab" inputmode="numeric" required value="${esc(oab.numero)}" placeholder="123456"></label>
          <label>UF<select name="uf" required>${UF_ORDEM.map(u => `<option ${u.toUpperCase() === oab.uf ? 'selected' : ''}>${u.toUpperCase()}</option>`).join('')}</select></label>
          <label>Desde<input type="date" name="de" value="${iso(addDays(new Date(), -7))}" max="${today}"></label>
        </div>
        <button class="btn gold wide"><i data-lucide="search"></i>Buscar intimações</button>
      </form>
      <div id="djenOut"></div>
    </section>

    <div class="card honest">
      <h3><i data-lucide="info"></i>Como funciona</h3>
      <ul class="plain">
        <li>Os andamentos vêm da API pública do <b>DataJud (CNJ)</b> e as intimações do <b>Comunica PJe/DJEN</b>. Os dois são oficiais e gratuitos. Você não paga para ver seu próprio processo.</li>
        <li>O DataJud é atualizado pelos tribunais e pode atrasar alguns dias. Por isso mostramos a data de atualização da fonte e o link do tribunal ao lado de cada processo.</li>
        <li>Processos em segredo de justiça não aparecem. STF não está no DataJud.</li>
        <li>Prazo conta da intimação oficial, não deste app. Confira sempre no sistema do tribunal.</li>
      </ul>
    </div>
  `;

  $('#procForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const numero = onlyDigits(f.numero);
    const msg = t => { $('#procMsg').textContent = t; };
    if (numero.length !== 20) return msg(`O número tem ${numero.length} dígitos. São 20 no total.`);
    if (!checkCnj(numero)) return msg('Os dígitos verificadores não batem. Confira se não trocou algum número.');
    const alias = tribunalOf(numero);
    if (!alias) return msg('Não reconheci o tribunal por esse número.');
    if (procs().some(p => p.numero === numero)) return msg('Esse processo já está na lista.');
    const p = { id: uid(), numero, alias, apelido: f.apelido, cliente: f.cliente, created: Date.now() };
    saveProcs([...procs(), p]);
    msg('Consultando no DataJud...');
    try { await refreshProc(p.id); toast('Processo adicionado'); }
    catch (err) { toast('Salvo. A consulta falhou: ' + err.message); }
    location.hash = '#/processos/' + p.id;
  });

  $('#djenForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    store.set('oab', { numero: onlyDigits(f.oab), uf: f.uf });
    buscarIntimacoes({ oab: onlyDigits(f.oab), uf: f.uf, de: f.de, ate: today });
  });
}

async function buscarIntimacoes({ oab, uf, de, ate }) {
  const out = $('#djenOut');
  const oficial = `https://comunica.pje.jus.br/consulta?${new URLSearchParams({ numeroOab: oab, ufOab: uf, dataDisponibilizacaoInicio: de, dataDisponibilizacaoFim: ate })}`;
  out.innerHTML = '<p class="muted">Buscando no DJEN...</p>';
  try {
    const r = await api(`/api/djen?${new URLSearchParams({ oab, uf, de, ate })}`);
    store.set('ultimaBuscaDjen', { em: r.consultadoEm, total: r.itens.length });
    out.innerHTML = `
      <p class="fine">${r.itens.length} publicaç${r.itens.length === 1 ? 'ão' : 'ões'} desde ${fmt(parseIso(de))} · consultado agora · <a class="link" href="${esc(oficial)}" target="_blank" rel="noopener">conferir no site oficial</a></p>
      ${r.itens.length ? `<ul class="intims">${r.itens.map((it, i) => `
        <li class="card">
          <div class="intim-top">
            <span class="tag strong">${esc(it.tribunal)}</span>
            <span class="tag">${esc(it.tipo || it.documento || 'Comunicação')}</span>
            <span class="muted">${esc(fmtDateTime(toIsoDay(it.data) || it.data))}</span>
          </div>
          <b class="mono">${esc(maskCnj(it.processo))}</b>
          <small class="muted">${esc([it.classe, it.orgao].filter(Boolean).join(' · '))}</small>
          <details><summary>Ler o texto</summary><p class="intim-text">${esc(it.texto)}</p></details>
          <div class="actions">
            ${toIsoDay(it.data) ? `<button class="btn ghost" data-calc="${toIsoDay(it.data)}"><i data-lucide="calculator"></i>Calcular prazo</button>` : ''}
            ${onlyDigits(it.processo).length === 20 ? `<button class="btn ghost" data-follow="${onlyDigits(it.processo)}"><i data-lucide="eye"></i>Acompanhar</button>` : ''}
            ${it.link ? `<a class="btn ghost" href="${esc(it.link)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Documento</a>` : ''}
          </div>
        </li>`).join('')}</ul>` : '<p class="muted">Nada publicado no período. Bom sinal.</p>'}`;
  } catch (err) {
    out.innerHTML = `<div class="card warn-card"><p>${esc(err.message)}</p><a class="btn gold" href="${esc(oficial)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Buscar direto no Comunica PJe</a></div>`;
  }
  icons();
}

function procDetail(id) {
  const p = procs().find(x => x.id === id);
  if (!p) { location.hash = '#/processos'; return; }
  const r = p.last;
  // abriu o processo: os andamentos deixam de ser novos
  if (r && p.seen !== movCount(r)) { const l = procs(); l.find(x => x.id === id).seen = movCount(r); saveProcs(l); }

  view().innerHTML = `
    <a class="back" href="#/processos"><i data-lucide="arrow-left"></i>Processos</a>
    <section class="head"><div>
      <p class="kicker">${esc(SEGMENTO[p.numero[13]] || '')} · ${esc(p.alias.toUpperCase())}</p>
      <h1>${esc(p.apelido || 'Processo')}</h1>
      <p class="mono">${esc(maskCnj(p.numero))}${p.cliente ? ' · ' + esc(p.cliente) : ''}</p>
    </div></section>

    <div class="actions start">
      <button class="btn gold" data-act="refresh-one"><i data-lucide="refresh-cw"></i>Atualizar</button>
      <a class="btn ghost" href="${esc(siteTribunal(p.alias))}" target="_blank" rel="noopener"><i data-lucide="landmark"></i>Site do tribunal</a>
      <button class="btn ghost" data-copy="${esc(maskCnj(p.numero))}"><i data-lucide="copy"></i>Copiar nº</button>
      <button class="btn danger" data-act="del-proc" aria-label="Parar de acompanhar"><i data-lucide="trash-2"></i></button>
    </div>
    <p class="msg" id="procMsg"></p>

    ${!r ? '<p class="muted">Ainda não consultado. Toque em Atualizar.</p>'
    : !r.graus.length ? `<div class="card"><p>O DataJud não tem este processo. Pode ser muito recente, estar em segredo de justiça ou o tribunal ainda não enviou os dados. Consulte no site do tribunal.</p></div>`
    : r.graus.map(g => `
      <div class="card">
        <p class="kicker">${esc(GRAU[g.grau] || g.grau || '')} ${g.sistema ? '· ' + esc(g.sistema) : ''}</p>
        <h3>${esc(g.classe)}</h3>
        <p class="muted">${esc(g.orgao)}</p>
        ${g.assuntos.length ? `<p>${g.assuntos.map(a => `<span class="tag">${esc(a)}</span>`).join(' ')}</p>` : ''}
        <p class="fine">Ajuizado em ${esc(fmtDateTime(g.ajuizamento))} · <b>fonte atualizada em ${esc(fmtDateTime(g.atualizadoNaFonte))}</b></p>
        <ol class="timeline">${g.movimentos.slice(0, 40).map(m => `
          <li><time>${esc(fmtDateTime(m.data))}</time><span>${esc(m.nome)}${m.detalhe ? ` <small>(${esc(m.detalhe)})</small>` : ''}</span></li>`).join('')}</ol>
        ${g.movimentos.length > 40 ? `<p class="fine">Mostrando os 40 mais recentes de ${g.movimentos.length}.</p>` : ''}
      </div>`).join('')}
    ${r ? `<p class="disclaimer">Consultado em ${esc(fmtDateTime(r.consultadoEm))} na API pública do DataJud (CNJ). O DataJud mostra o andamento, não o conteúdo das decisões. Para ler as peças, use o site do tribunal.</p>` : ''}
  `;
}

/* ---------- Modelos ---------- */
const fillModel = (m, vals) => m.text.replace(/\{\{(\w+)\}\}/g, (_, k) =>
  (vals[k] || '').trim() || `[${(m.fields.find(f => f.k === k) || { label: k }).label}]`);

function viewModelos(id) {
  const m = MODELOS.find(x => x.id === id);
  if (!m) {
    const cats = [...new Set(MODELOS.map(x => x.cat))];
    view().innerHTML = `
      <section class="head"><div><p class="kicker">Grátis · sem cadastro · sem verificação</p><h1>Modelos</h1></div></section>
      <p class="muted">Preencha uma vez seus dados de advogado(a) e eles entram sozinhos nos próximos modelos. Baixe em Word para ajustar.</p>
      ${cats.map(c => `<h2 class="sec">${esc(c)}</h2>
        <div class="deck-list">${MODELOS.filter(x => x.cat === c).map(x => `
          <a class="deck" href="#/modelos/${x.id}"><div><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div><i data-lucide="chevron-right"></i></a>`).join('')}</div>`).join('')}
      <p class="disclaimer">Modelos de partida, revisados em ${REVISADO}. Adapte ao caso concreto e confira a lei vigente antes de usar.</p>`;
    return;
  }
  const vals = store.get('modelVals', {});
  view().innerHTML = `
    <a class="back" href="#/modelos"><i data-lucide="arrow-left"></i>Modelos</a>
    <section class="head"><div><p class="kicker">${esc(m.cat)}</p><h1>${esc(m.title)}</h1><p class="muted">${esc(m.sub)}</p></div></section>
    <div class="model-grid">
      <form id="modelForm" class="card form">
        ${m.fields.map(f => `<label>${esc(f.label)}${f.k === 'fatos' || f.k === 'objeto' ? `<textarea name="${f.k}" rows="3" placeholder="${esc(f.ph || '')}">${esc(vals[f.k])}</textarea>`
          : `<input name="${f.k}" value="${esc(vals[f.k])}" placeholder="${esc(f.ph || '')}">`}</label>`).join('')}
      </form>
      <div>
        <div class="actions start sticky-actions">
          <button class="btn gold" data-act="copy-model"><i data-lucide="copy"></i>Copiar</button>
          <button class="btn ghost" data-act="doc-model"><i data-lucide="file-down"></i>Baixar Word</button>
          ${navigator.share ? '<button class="btn ghost" data-act="share-model"><i data-lucide="share-2"></i>Enviar</button>' : ''}
        </div>
        <pre class="paper" id="paper"></pre>
      </div>
    </div>`;

  const form = $('#modelForm');
  const paint = () => {
    const now = Object.fromEntries(new FormData(form));
    store.set('modelVals', { ...store.get('modelVals', {}), ...now });
    $('#paper').textContent = fillModel(m, now);
  };
  form.addEventListener('input', paint);
  paint();

  const text = () => $('#paper').textContent;
  $('[data-act="copy-model"]').onclick = async () => {
    try { await navigator.clipboard.writeText(text()); toast('Copiado'); } catch { toast('Não deu para copiar. Selecione o texto.'); }
  };
  $('[data-act="doc-model"]').onclick = () => {
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:'Times New Roman';font-size:12pt;line-height:1.5}p{margin:0 0 8pt;text-align:justify}</style></head><body>${
      text().split('\n').map(l => `<p>${esc(l) || '&nbsp;'}</p>`).join('')}</body></html>`;
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' })), download: `${m.id}.doc`,
    }).click();
  };
  $('[data-act="share-model"]')?.addEventListener('click', () => navigator.share({ title: m.title, text: text() }).catch(() => {}));
}

/* ---------- Mais, Lei seca e Sobre ---------- */
function viewMais() {
  const tiles = [
    ['guias', 'scale', 'Guias de conduta', 'Atendimento, audiência, ética, redes sociais'],
    ['leis', 'book-open', 'Lei seca e jurisprudência', 'Textos oficiais, pesquisa e artigos salvos'],
    ['estudo', 'layers', 'Estudo', 'Flashcards com repetição espaçada'],
    ['apps', 'layout-grid', 'Apps e sites', 'Ferramentas que valem a pena'],
    ['sobre', 'shield-check', 'Sobre e privacidade', 'Grátis, sem assinatura, seus dados com você'],
  ];
  view().innerHTML = `
    <section class="head"><div><p class="kicker">Tudo do TOGA</p><h1>Mais</h1></div></section>
    <div class="guide-grid">${tiles.map(([h, ic, t, s]) => `
      <a class="guide-tile" href="#/${h}"><i data-lucide="${ic}"></i><b>${t}</b><small>${s}</small></a>`).join('')}</div>`;
}

function viewLeis() {
  const arts = store.get('artigos', []);
  view().innerHTML = `
    <a class="back" href="#/mais"><i data-lucide="arrow-left"></i>Mais</a>
    <section class="head"><div><p class="kicker">Fontes oficiais</p><h1>Lei seca e jurisprudência</h1></div></section>

    <form id="jurisForm" class="card form">
      <label>Pesquisar jurisprudência<input name="q" required placeholder="Ex.: dano moral negativação indevida"></label>
      <div class="actions start">${BUSCAS.map(([n], i) => `<button class="btn ${i ? 'ghost' : 'gold'}" name="b" value="${i}">${n}</button>`).join('')}</div>
    </form>

    <h2 class="sec">Códigos e leis (Planalto, texto compilado)</h2>
    <div class="law-list">${LEIS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener"><i data-lucide="scroll-text"></i>${esc(n)}</a>`).join('')}</div>

    <h2 class="sec">Meus artigos</h2>
    <form id="artForm" class="card form">
      <div class="grid2">
        <label>Referência<input name="ref" required placeholder="CDC, art. 42, parágrafo único"></label>
        <label>Etiqueta<input name="tag" placeholder="Consumidor"></label>
      </div>
      <label>Texto<textarea name="texto" rows="3" required placeholder="Cole aqui o texto do artigo"></textarea></label>
      <button class="btn gold">Salvar artigo</button>
    </form>
    ${arts.length ? `<ul class="intims">${arts.map((a, i) => `
      <li class="card"><div class="intim-top"><b>${esc(a.ref)}</b>${a.tag ? `<span class="tag">${esc(a.tag)}</span>` : ''}</div>
        <p class="intim-text">${esc(a.texto)}</p>
        <div class="actions"><button class="btn ghost" data-card-art="${i}"><i data-lucide="layers"></i>Virar cartão</button>
          <button class="btn danger" data-del-art="${i}" aria-label="Apagar"><i data-lucide="trash-2"></i></button></div></li>`).join('')}</ul>`
    : '<p class="muted">Guarde os artigos que você mais usa. Eles ficam aqui e funcionam sem internet.</p>'}
  `;
  $('#jurisForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = new FormData(e.target).get('q');
    const i = Number(e.submitter?.value || 0);
    window.open(BUSCAS[i][1] + encodeURIComponent(q), '_blank', 'noopener');
  });
  $('#artForm').addEventListener('submit', e => {
    e.preventDefault();
    store.set('artigos', [Object.fromEntries(new FormData(e.target)), ...arts]);
    toast('Artigo salvo'); route();
  });
}

async function viewSobre() {
  const est = await navigator.storage?.estimate?.().catch(() => null);
  const persisted = await navigator.storage?.persisted?.().catch(() => false);
  view().innerHTML = `
    <a class="back" href="#/mais"><i data-lucide="arrow-left"></i>Mais</a>
    <section class="head"><div><p class="kicker">Transparência</p><h1>Sobre o TOGA</h1></div></section>

    <div class="card">
      <h3>Feito a partir das reclamações mais comuns</h3>
      <table class="cmp">
        <tr><th>O que as pessoas reclamam</th><th>Como o TOGA faz</th></tr>
        <tr><td>Cobrança indevida e dificuldade para cancelar assinatura</td><td>É grátis. Não tem assinatura, cartão nem renovação automática.</td></tr>
        <tr><td>Pagar para ver o próprio processo, que é público</td><td>Consulta direto na fonte oficial do CNJ, sem custo.</td></tr>
        <tr><td>Processo desatualizado sem aviso</td><td>Mostra a data em que a fonte foi atualizada e o link do tribunal em todo processo.</td></tr>
        <tr><td>Notificação que chega sem conteúdo</td><td>Intimação aparece com o texto inteiro e um botão para calcular o prazo.</td></tr>
        <tr><td>Modelos bloqueados até verificar a OAB</td><td>Modelos livres para qualquer pessoa, sem cadastro.</td></tr>
        <tr><td>Conta bloqueada e suporte que não responde</td><td>Não tem conta. Nada para bloquear.</td></tr>
        <tr><td>Dados pessoais expostos e difíceis de remover</td><td>Seus dados ficam só neste aparelho. Um botão apaga tudo.</td></tr>
      </table>
    </div>

    <div class="card">
      <h3>Seus dados</h3>
      <ul class="plain">
        <li>Livros, prazos, processos, cartões e modelos ficam guardados <b>só neste aparelho</b>.</li>
        <li>As consultas de processo e de intimação passam pelo nosso servidor apenas para chegar ao CNJ. Não guardamos o que você consulta.</li>
        <li>Espaço usado: ${est ? (est.usage / 1048576).toFixed(1) + ' MB' : 'não disponível neste navegador'}.
          ${persisted ? 'Armazenamento protegido contra limpeza automática ✓' : 'O navegador pode limpar os dados se faltar espaço. Faça cópias de segurança.'}</li>
      </ul>
      <div class="actions start">
        <button class="btn ghost" data-act="export"><i data-lucide="download"></i>Baixar cópia de segurança</button>
        <button class="btn ghost" data-act="import"><i data-lucide="upload"></i>Restaurar</button>
        <button class="btn danger" data-act="wipe"><i data-lucide="trash-2"></i>Apagar tudo</button>
      </div>
    </div>

    <p class="disclaimer">Conteúdo jurídico revisado em ${REVISADO}. É material de apoio: confira sempre a lei e o calendário do tribunal. O TOGA não é ligado ao CNJ, à OAB nem a nenhum tribunal.</p>
  `;
  icons();
}

/* Apagar tudo: livros (IndexedDB), preferências e cache offline */
async function wipeAll() {
  if (!confirm('Apagar todos os livros, prazos, processos, cartões e anotações deste aparelho? Não dá para desfazer.')) return;
  if (!confirm('Tem certeza? Baixe uma cópia de segurança antes, se quiser guardar algo.')) return;
  try {
    const d = await db.open(); d.close(); db._p = null;
    await new Promise(r => { const q = indexedDB.deleteDatabase('toga'); q.onsuccess = q.onerror = q.onblocked = r; });
  } catch { /* banco já não existe */ }
  Object.keys(localStorage).filter(k => k.startsWith('toga:')).forEach(k => localStorage.removeItem(k));
  BOOKS = [];
  toast('Tudo apagado');
  location.hash = '#/estante';
}

/* ---------- Avisos de prazo ---------- */
function prazosProximos(dias = 2) {
  const hoje = parseIso(iso(new Date()));
  return store.get('prazos', [])
    .map(p => ({ ...p, left: Math.round((parseIso(p.end) - hoje) / 864e5) }))
    .filter(p => p.left >= 0 && p.left <= dias)
    .sort((a, b) => a.left - b.left);
}
function alertaPrazos() {
  const list = prazosProximos();
  if (!list.length) return '';
  return `<a class="alert" href="#/prazos"><i data-lucide="alarm-clock"></i><span><b>${list.length} prazo${list.length > 1 ? 's' : ''} vencendo:</b> ${list.map(p =>
    `${esc(p.title)} (${p.left === 0 ? 'HOJE' : p.left === 1 ? 'amanhã' : 'em 2 dias'})`).join(', ')}</span></a>`;
}
async function notificarPrazos() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const hoje = iso(new Date());
  if (store.get('notificadoEm') === hoje) return;
  const list = prazosProximos(1);
  if (!list.length) return;
  store.set('notificadoEm', hoje);
  const reg = await navigator.serviceWorker?.getRegistration?.().catch(() => null);
  const body = list.map(p => `${p.title}${p.proc ? ' (' + p.proc + ')' : ''}: ${p.left === 0 ? 'vence HOJE' : 'vence amanhã'}`).join('\n');
  const opts = { body, icon: 'icon-192.png', tag: 'toga-prazos' };
  if (reg) reg.showNotification('TOGA · prazos', opts); else new Notification('TOGA · prazos', opts);
}

/* ---------- Registro das telas e eventos ---------- */
Object.assign(VIEWS, { processos: viewProcessos, modelos: viewModelos, mais: viewMais, leis: viewLeis, sobre: viewSobre });
Object.assign(NAV_PARENT, { guias: 'mais', estudo: 'mais', apps: 'mais', leis: 'mais', sobre: 'mais' });

document.addEventListener('click', async e => {
  const t = e.target.closest('[data-calc],[data-follow],[data-copy],[data-card-art],[data-del-art],[data-act="refresh-all"],[data-act="refresh-one"],[data-act="del-proc"],[data-act="wipe"],[data-act="notify"],[data-act="ics-all"]');
  if (!t) return;
  const d = t.dataset;
  const curId = (location.hash.match(/^#\/processos\/(.+)$/) || [])[1];

  if (d.calc) {
    store.set('prazoForm', { ...store.get('prazoForm', {}), start: d.calc, dje: true });
    store.set('prazoAuto', true);
    location.hash = '#/prazos';
  } else if (d.follow) {
    if (procs().some(p => p.numero === d.follow)) return toast('Já está na lista');
    const p = { id: uid(), numero: d.follow, alias: tribunalOf(d.follow), created: Date.now() };
    saveProcs([...procs(), p]);
    toast('Acompanhando');
    refreshProc(p.id).catch(() => {});
  } else if (d.copy) {
    try { await navigator.clipboard.writeText(d.copy); toast('Número copiado'); } catch { toast(d.copy); }
  } else if (d.cardArt) {
    const a = store.get('artigos', [])[+d.cardArt];
    store.set('myCards', [...store.get('myCards', []), { q: `O que diz ${a.ref}?`, a: a.texto }]);
    toast('Virou cartão em Estudo › Meus cartões');
  } else if (d.delArt) {
    const a = store.get('artigos', []); a.splice(+d.delArt, 1); store.set('artigos', a); route();
  } else if (d.act === 'refresh-one') {
    $('#procMsg').textContent = 'Consultando no DataJud...';
    try { await refreshProc(curId); route(); toast('Atualizado'); } catch (err) { $('#procMsg').textContent = err.message; }
  } else if (d.act === 'refresh-all') {
    t.disabled = true;
    let falhas = 0;
    for (const p of procs()) { try { await refreshProc(p.id); } catch { falhas++; } }
    route();
    toast(falhas ? `${falhas} consulta${falhas > 1 ? 's' : ''} falhou. Tente mais tarde.` : 'Todos atualizados');
  } else if (d.act === 'del-proc') {
    if (!confirm('Parar de acompanhar este processo?')) return;
    saveProcs(procs().filter(p => p.id !== curId));
    location.hash = '#/processos';
  } else if (d.act === 'wipe') {
    wipeAll();
  } else if (d.act === 'notify') {
    const perm = await Notification.requestPermission();
    toast(perm === 'granted' ? 'Avisos ativados' : 'Avisos bloqueados no navegador');
    route();
  } else if (d.act === 'ics-all') {
    const list = store.get('prazos', []).filter(p => p.end >= iso(new Date()));
    if (!list.length) return toast('Nenhum prazo futuro');
    downloadIcs(list);
  }
});

/* ---------- Partida ---------- */
(async () => {
  await loadBooks();
  route();
  // pede ao navegador para não apagar a estante quando faltar espaço (o iPhone apaga)
  navigator.storage?.persist?.().catch(() => {});
  if ('serviceWorker' in navigator && window.isSecureContext) {
    await navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  notificarPrazos();
})();
