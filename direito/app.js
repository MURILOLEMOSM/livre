/* =========================================================
   TOGA · app
   Estante (IndexedDB), calculadora de prazos, guias,
   estudo com repetição espaçada e catálogo de apps.
   Tudo fica no aparelho; nada vai para servidor.
   ========================================================= */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const icons = () => window.lucide && lucide.createIcons();

/* ---------- Preferências pequenas (localStorage) ---------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('toga:' + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('toga:' + key, JSON.stringify(value)); } catch { /* sem espaço ou bloqueado */ }
  },
};

/* ---------- Banco de livros (IndexedDB) ---------- */
const db = {
  _p: null,
  open() {
    this._p ||= new Promise((resolve, reject) => {
      const req = indexedDB.open('toga', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('books', { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this._p;
  },
  async tx(mode, fn) {
    const d = await this.open();
    return new Promise((resolve, reject) => {
      const t = d.transaction('books', mode);
      const r = fn(t.objectStore('books'));
      t.oncomplete = () => resolve(r?.result);
      t.onerror = () => reject(t.error);
    });
  },
  all() { return this.tx('readonly', s => s.getAll()); },
  put(book) { return this.tx('readwrite', s => s.put(book)); },
  del(id) { return this.tx('readwrite', s => s.delete(id)); },
};

let BOOKS = [];
const blobUrls = new Map();
function coverSrc(b) {
  if (b.cover instanceof Blob) {
    if (!blobUrls.has(b.id + b.updated)) blobUrls.set(b.id + b.updated, URL.createObjectURL(b.cover));
    return blobUrls.get(b.id + b.updated);
  }
  return b.coverUrl || '';
}

/* ---------- Imagem: reduz a foto para não lotar o aparelho ---------- */
async function shrinkImage(file, maxH = 640) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxH / bmp.height);
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
}

async function readBarcode(file) {
  if (!('BarcodeDetector' in window)) return null;
  const bmp = await createImageBitmap(file);
  const det = new BarcodeDetector({ formats: ['ean_13'] });
  const codes = await det.detect(bmp).catch(() => []);
  // o ISBN-13 é o EAN que começa com 978 ou 979; o código menor ao lado é o preço
  const hit = codes.map(c => c.rawValue.replace(/\D/g, '')).find(v => /^97[89]\d{10}$/.test(v));
  return hit || null;
}

/* ---------- Busca de dados do livro (Google Books, depois Open Library) ---------- */
async function lookupBook({ isbn, title, author }) {
  const clean = (isbn || '').replace(/[^\dX]/gi, '');
  let q = '';
  if (clean) q = 'isbn:' + clean;
  else if (title) q = `intitle:${title}` + (author ? `+inauthor:${author}` : '');
  if (!q) return [];

  const out = [];
  try {
    const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=6&langRestrict=pt`);
    const j = await r.json();
    for (const it of j.items || []) {
      const v = it.volumeInfo || {};
      const ids = v.industryIdentifiers || [];
      out.push({
        title: v.title + (v.subtitle ? ': ' + v.subtitle : ''),
        author: (v.authors || []).join(', '),
        publisher: v.publisher || '',
        year: (v.publishedDate || '').slice(0, 4),
        isbn: (ids.find(i => i.type === 'ISBN_13') || ids[0] || {}).identifier || clean,
        coverUrl: (v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '').replace('http://', 'https://').replace('&edge=curl', ''),
      });
    }
  } catch { /* sem internet ou API fora: tenta a outra */ }

  if (!out.length && clean) {
    try {
      const r = await fetch(`https://openlibrary.org/isbn/${clean}.json`);
      if (r.ok) {
        const v = await r.json();
        out.push({
          title: v.title || '', author: '', publisher: (v.publishers || [])[0] || '',
          year: (v.publish_date || '').match(/\d{4}/)?.[0] || '', isbn: clean,
          coverUrl: `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`,
        });
      }
    } catch { /* nada encontrado */ }
  }
  return out;
}

/* =========================================================
   Prazos
   ========================================================= */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const fmt = d => `${WEEK[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

const holidayCache = {};
function holidays(y, opts) {
  const key = y + JSON.stringify(opts);
  if (holidayCache[key]) return holidayCache[key];
  const map = {
    [`${y}-01-01`]: 'Confraternização Universal',
    [`${y}-04-21`]: 'Tiradentes',
    [`${y}-05-01`]: 'Dia do Trabalho',
    [`${y}-09-07`]: 'Independência',
    [`${y}-10-12`]: 'Nossa Senhora Aparecida',
    [`${y}-11-02`]: 'Finados',
    [`${y}-11-15`]: 'Proclamação da República',
    [`${y}-11-20`]: 'Consciência Negra',
    [`${y}-12-25`]: 'Natal',
  };
  const e = easter(y);
  map[iso(addDays(e, -2))] = 'Sexta-feira Santa';
  if (opts.forense) {
    map[iso(addDays(e, -48))] = 'Carnaval';
    map[iso(addDays(e, -47))] = 'Carnaval';
    map[iso(addDays(e, 60))] = 'Corpus Christi';
  }
  if (opts.federal) {
    for (let i = -4; i <= -1; i++) map[iso(addDays(e, i))] ||= 'Semana Santa (Justiça Federal)';
    map[`${y}-08-11`] = 'Criação dos cursos jurídicos (Justiça Federal)';
    map[`${y}-11-01`] = 'Todos os Santos (Justiça Federal)';
    map[`${y}-12-08`] = 'Dia da Justiça (Justiça Federal)';
  }
  return (holidayCache[key] = map);
}

const REGIMES = {
  civel: { label: 'Cível (CPC)', uteis: true, recesso: true },
  jec: { label: 'Juizado Especial Cível', uteis: true, recesso: true },
  trabalho: { label: 'Trabalhista (CLT)', uteis: true, recesso: true },
  penal: { label: 'Penal (CPP)', uteis: false, recesso: true },
  corridos: { label: 'Dias corridos (sem suspensão)', uteis: false, recesso: false },
};

function inRecess(d) {
  const m = d.getMonth() + 1, day = d.getDate();
  return (m === 12 && day >= 20) || (m === 1 && day <= 20);
}

function calcPrazo({ start, days, regime, dje, dobro, federal, forense, custom }) {
  const R = REGIMES[regime];
  const opts = { federal, forense };
  const customMap = Object.fromEntries((custom || []).map(c => [c.date, c.label || 'Suspensão local']));
  const skipped = [];

  const reason = d => {
    const k = iso(d);
    if (d.getDay() === 0 || d.getDay() === 6) return 'fim de semana';
    const h = holidays(d.getFullYear(), opts)[k] || customMap[k];
    if (h) return h;
    if (R.recesso && inRecess(d)) return 'suspensão de 20/12 a 20/01';
    return null;
  };
  const nextBusiness = d => {
    let x = addDays(d, 1);
    for (let r; (r = reason(x)); x = addDays(x, 1)) skipped.push([new Date(x), r]);
    return x;
  };

  let base = start;
  const steps = [];
  if (dje) {
    base = nextBusiness(start);
    steps.push(['Publicação (1º dia útil após a disponibilização no DJe)', base]);
  } else {
    steps.push(['Intimação', base]);
  }

  const n = dobro ? days * 2 : days;
  let d = nextBusiness(base);
  steps.push(['1º dia do prazo', d]);

  if (R.uteis) {
    for (let c = 1; c < n; c++) d = nextBusiness(d);
  } else {
    // dias corridos: no penal, os dias de 20/12 a 20/01 não correm (CPP art. 798-A)
    for (let c = 1; c < n;) {
      d = addDays(d, 1);
      if (R.recesso && inRecess(d)) { skipped.push([new Date(d), 'suspensão de 20/12 a 20/01']); continue; }
      c++;
    }
    if (reason(d)) {
      skipped.push([new Date(d), reason(d) + ' (vencimento prorrogado)']);
      d = nextBusiness(d);
    }
  }
  steps.push(['Vencimento', d]);
  return { end: d, steps, skipped, n };
}

/* =========================================================
   Estudo: repetição espaçada simples (caixas de Leitner)
   ========================================================= */
const BOX_DAYS = [0, 1, 3, 7, 15, 30];
function allDecks() {
  const mine = store.get('myCards', []);
  return [...DECKS, ...(mine.length ? [{ id: 'meus', title: 'Meus cartões', cards: mine.map(c => [c.q, c.a]) }] : [])];
}
function cardKey(deckId, i) { return deckId + ':' + i; }
function dueCards(deck) {
  const prog = store.get('progress', {});
  const today = iso(new Date());
  return deck.cards.map((c, i) => ({ c, i, p: prog[cardKey(deck.id, i)] }))
    .filter(x => !x.p || x.p.due <= today);
}
function grade(deckId, i, ok) {
  const prog = store.get('progress', {});
  const k = cardKey(deckId, i);
  const box = ok ? Math.min((prog[k]?.box || 0) + 1, BOX_DAYS.length - 1) : 1;
  prog[k] = { box, due: iso(addDays(new Date(), BOX_DAYS[box])) };
  store.set('progress', prog);
}

/* =========================================================
   Telas
   ========================================================= */
const VIEWS = { estante: viewEstante, prazos: viewPrazos, guias: viewGuias, estudo: viewEstudo, apps: viewApps };
const view = () => $('#view');

function route() {
  const [, name, id] = (location.hash || '').match(/^#\/([a-z]+)(?:\/(.+))?$/) || [];
  const r = VIEWS[name] ? { name, id: id && decodeURIComponent(id) } : { name: 'estante', id: null };
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === r.name));
  VIEWS[r.name](r.id);
  icons();
  window.scrollTo(0, 0);
}

/* ---------- Estante ---------- */
let shelfFilter = { area: '', q: '', status: '' };

function bookCover(b) {
  const src = coverSrc(b);
  const hue = [...(b.title || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return src
    ? `<img src="${esc(src)}" alt="" loading="lazy" data-t="${esc(b.title)}">`
    : `<span class="fake" style="--h:${hue}">${esc(b.title)}</span>`;
}

function viewEstante() {
  const { area, q, status } = shelfFilter;
  const needle = q.trim().toLowerCase();
  const list = BOOKS
    .filter(b => !area || b.area === area)
    .filter(b => !status || b.status === status)
    .filter(b => !needle || [b.title, b.author, b.publisher, b.isbn].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => (a.area || '').localeCompare(b.area || '') || a.title.localeCompare(b.title));

  const usedAreas = [...new Set(BOOKS.map(b => b.area).filter(Boolean))].sort();
  const perRow = Math.max(3, Math.floor((Math.min(window.innerWidth, 1040) - 48) / 104));
  const rows = [];
  for (let i = 0; i < list.length; i += perRow) rows.push(list.slice(i, i + perRow));

  view().innerHTML = `
    <section class="head">
      <div>
        <p class="kicker">Sua estante</p>
        <h1>${BOOKS.length} ${BOOKS.length === 1 ? 'livro' : 'livros'}</h1>
      </div>
      <button class="btn gold" data-act="add-book"><i data-lucide="plus"></i>Adicionar</button>
    </section>

    ${BOOKS.length ? `
    <div class="tools">
      <label class="search"><i data-lucide="search"></i><input type="search" id="shelfQ" placeholder="Título, autor, editora ou ISBN" value="${esc(q)}"></label>
      <select id="shelfStatus" aria-label="Situação">
        <option value="">Todos</option>
        ${['Quero ler', 'Lendo', 'Lido', 'Consulta'].map(s => `<option ${s === status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="chips">
      <button class="chip ${!area ? 'on' : ''}" data-area="">Todas</button>
      ${usedAreas.map(a => `<button class="chip ${a === area ? 'on' : ''}" data-area="${esc(a)}">${esc(a)}</button>`).join('')}
    </div>` : ''}

    <div class="shelf">
      ${rows.length ? rows.map(r => `
        <div class="row">
          ${r.map(b => `<button class="book" data-book="${b.id}" title="${esc(b.title)}">${bookCover(b)}${b.pdf || b.pdfUrl ? '<em class="pdf">PDF</em>' : ''}</button>`).join('')}
        </div>`).join('') : `
        <div class="row empty-row"><p>${BOOKS.length ? 'Nenhum livro com esse filtro.' : 'Prateleira vazia. Tire uma foto da capa ou do código de barras para começar.'}</p></div>`}
    </div>

    ${BOOKS.length ? `<p class="fine">Os livros ficam guardados neste aparelho. <button class="link" data-act="export">Baixar cópia de segurança</button> · <button class="link" data-act="import">Restaurar</button></p>`
    : `<div class="tips">
        <h3>Três jeitos de adicionar</h3>
        <ol>
          <li><b>Foto do código de barras</b> no verso: o app lê o ISBN e busca título, autor, editora e capa.</li>
          <li><b>Foto da capa</b>: fica sendo a capinha na prateleira. Depois é só digitar o nome.</li>
          <li><b>PDF</b>: cole o link ou escolha o arquivo do aparelho para abrir direto daqui.</li>
        </ol>
        <p class="fine"><button class="link" data-act="import">Já tem uma cópia de segurança? Restaurar</button></p>
      </div>`}
  `;

  $('#shelfQ')?.addEventListener('input', e => {
    shelfFilter.q = e.target.value;
    const pos = e.target.selectionStart;
    viewEstante(); icons();
    const inp = $('#shelfQ'); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  $('#shelfStatus')?.addEventListener('change', e => { shelfFilter.status = e.target.value; route(); });
}

function bookForm(b = {}) {
  const editing = !!b.id;
  openSheet(`
    <h2>${editing ? 'Editar livro' : 'Novo livro'}</h2>

    <div class="capture">
      <label class="cap">
        <input type="file" accept="image/*" capture="environment" id="fCoverFile" hidden>
        <span class="cover-prev" id="coverPrev">${b.id || b.coverUrl ? bookCover(b) : '<i data-lucide="camera"></i>'}</span>
        <span>Foto da capa</span>
      </label>
      <label class="cap">
        <input type="file" accept="image/*" capture="environment" id="fBarcode" hidden>
        <span class="cover-prev bar"><i data-lucide="scan-barcode"></i></span>
        <span>Foto do código de barras</span>
      </label>
    </div>
    <p class="msg" id="lookMsg"></p>

    <form id="bookForm" class="form">
      <div class="grid2">
        <label>ISBN<input name="isbn" inputmode="numeric" value="${esc(b.isbn)}" placeholder="978..."></label>
        <button type="button" class="btn ghost" data-act="lookup"><i data-lucide="search"></i>Buscar dados</button>
      </div>
      <div id="lookResults"></div>
      <label>Título *<input name="title" required value="${esc(b.title)}" placeholder="Curso de Direito Civil"></label>
      <label>Autor(es)<input name="author" value="${esc(b.author)}"></label>
      <div class="grid2">
        <label>Editora<input name="publisher" value="${esc(b.publisher)}"></label>
        <label>Edição<input name="edition" value="${esc(b.edition)}" placeholder="12ª"></label>
      </div>
      <div class="grid2">
        <label>Ano<input name="year" inputmode="numeric" maxlength="4" value="${esc(b.year)}"></label>
        <label>Área
          <select name="area">
            <option value="">Escolha</option>
            ${AREAS.map(a => `<option ${a === b.area ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </label>
      </div>
      <label>Situação
        <select name="status">
          ${['Quero ler', 'Lendo', 'Lido', 'Consulta'].map(s => `<option ${s === (b.status || 'Lendo') ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </label>
      <fieldset>
        <legend>PDF (opcional)</legend>
        <label>Link do PDF<input name="pdfUrl" type="url" value="${esc(b.pdfUrl)}" placeholder="https://..."></label>
        <label class="file-line"><input type="file" accept="application/pdf" id="fPdf"> <span id="pdfName">${b.pdf ? 'PDF guardado no aparelho ✓' : 'ou escolha o arquivo'}</span></label>
      </fieldset>
      <label>Anotações<textarea name="notes" rows="3" placeholder="Capítulos importantes, quem indicou...">${esc(b.notes)}</textarea></label>
      <div class="actions">
        ${editing ? '<button type="button" class="btn danger" data-act="del-book"><i data-lucide="trash-2"></i></button>' : ''}
        <button type="button" class="btn ghost" data-close>Cancelar</button>
        <button class="btn gold">Salvar na estante</button>
      </div>
    </form>
  `);

  const draft = { ...b };
  const form = $('#bookForm');
  const msg = t => { $('#lookMsg').textContent = t; };

  $('#fCoverFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    draft.cover = await shrinkImage(f);
    draft.coverUrl = '';
    draft.updated = Date.now();
    $('#coverPrev').innerHTML = `<img src="${URL.createObjectURL(draft.cover)}" alt="">`;
  });

  $('#fBarcode').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    msg('Lendo o código...');
    const code = await readBarcode(f).catch(() => null);
    if (!code) {
      msg('BarcodeDetector' in window
        ? 'Não consegui ler. Tente uma foto mais de perto e com luz, ou digite o ISBN (começa com 978 ou 979).'
        : 'Este navegador não lê código de barras pela foto. Digite o ISBN que aparece acima do código (começa com 978).');
      return;
    }
    form.isbn.value = code;
    doLookup();
  });

  $('#fPdf').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    draft.pdf = f;
    $('#pdfName').textContent = f.name + ' ✓';
  });

  async function doLookup() {
    msg('Buscando...');
    const res = await lookupBook({ isbn: form.isbn.value, title: form.title.value, author: form.author.value });
    if (!res.length) { msg('Nada encontrado. Preencha à mão. Leva 20 segundos.'); $('#lookResults').innerHTML = ''; return; }
    msg(res.length > 1 ? 'Toque no livro certo:' : 'Encontrei. Confira e salve.');
    if (res.length === 1) return applyResult(res[0]);
    $('#lookResults').innerHTML = `<div class="results">${res.map((r, i) => `
      <button type="button" class="result" data-pick="${i}">
        ${r.coverUrl ? `<img src="${esc(r.coverUrl)}" alt="">` : '<span class="fake small">?</span>'}
        <span><b>${esc(r.title)}</b><small>${esc([r.author, r.publisher, r.year].filter(Boolean).join(' · '))}</small></span>
      </button>`).join('')}</div>`;
    $$('[data-pick]').forEach(btn => btn.onclick = () => { applyResult(res[btn.dataset.pick]); $('#lookResults').innerHTML = ''; });
  }
  function applyResult(r) {
    for (const k of ['title', 'author', 'publisher', 'year', 'isbn']) if (r[k] && !form[k].value) form[k].value = r[k];
    if (r.coverUrl && !draft.cover) {
      draft.coverUrl = r.coverUrl;
      $('#coverPrev').innerHTML = `<img src="${esc(r.coverUrl)}" alt="">`;
    }
  }
  $('[data-act="lookup"]').onclick = doLookup;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const book = { ...draft, ...data, id: b.id || uid(), created: b.created || Date.now(), updated: Date.now() };
    await db.put(book);
    await loadBooks();
    closeSheet();
    toast('Livro na estante');
    location.hash = '#/estante'; route();
  });

  $('[data-act="del-book"]')?.addEventListener('click', async () => {
    if (!confirm(`Tirar "${b.title}" da estante?`)) return;
    await db.del(b.id);
    await loadBooks();
    closeSheet(); route();
  });
}

function bookDetail(b) {
  const age = b.year ? new Date().getFullYear() - Number(b.year) : 0;
  openSheet(`
    <div class="detail">
      <div class="detail-cover">${bookCover(b)}</div>
      <div>
        <p class="kicker">${esc(b.area || 'Sem área')} · ${esc(b.status || '')}</p>
        <h2>${esc(b.title)}</h2>
        <p>${esc(b.author)}</p>
        <p class="muted">${esc([b.publisher, b.edition && b.edition + ' ed.', b.year].filter(Boolean).join(' · '))}</p>
        ${b.isbn ? `<p class="muted mono">ISBN ${esc(b.isbn)}</p>` : ''}
      </div>
    </div>
    ${age >= 3 && b.area !== 'Filosofia e Teoria' ? `<p class="warn"><i data-lucide="alert-triangle"></i>Edição de ${esc(b.year)}. Leis e súmulas mudam rápido: confira se há edição mais nova antes de usar em peça ou prova.</p>` : ''}
    ${b.notes ? `<p class="notes">${esc(b.notes)}</p>` : ''}
    <div class="actions">
      ${b.pdf ? '<button class="btn gold" data-act="open-pdf"><i data-lucide="file-text"></i>Abrir PDF</button>' : ''}
      ${b.pdfUrl ? `<a class="btn gold" href="${esc(b.pdfUrl)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Abrir link</a>` : ''}
      <button class="btn ghost" data-act="edit-book"><i data-lucide="pencil"></i>Editar</button>
    </div>
  `);
  $('[data-act="open-pdf"]')?.addEventListener('click', () => window.open(URL.createObjectURL(b.pdf), '_blank'));
  $('[data-act="edit-book"]').onclick = () => bookForm(b);
}

/* Cópia de segurança: capas viram texto (data URL); PDFs do aparelho não entram */
async function exportBooks() {
  const toData = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  const out = [];
  for (const b of BOOKS) {
    const { pdf, cover, ...rest } = b;
    out.push({ ...rest, cover: cover instanceof Blob ? await toData(cover) : undefined });
  }
  const blob = new Blob([JSON.stringify({ app: 'toga', v: 1, books: out, myCards: store.get('myCards', []) })], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `estante-toga-${iso(new Date())}.json` });
  a.click();
  if (BOOKS.some(b => b.pdf)) toast('PDFs guardados no aparelho não entram na cópia');
}
function importBooks() {
  const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'application/json' });
  inp.onchange = async () => {
    try {
      const j = JSON.parse(await inp.files[0].text());
      for (const b of j.books || []) {
        if (typeof b.cover === 'string') b.cover = await (await fetch(b.cover)).blob();
        await db.put(b);
      }
      if (j.myCards?.length) store.set('myCards', j.myCards);
      await loadBooks(); route();
      toast(`${(j.books || []).length} livros restaurados`);
    } catch { toast('Arquivo inválido'); }
  };
  inp.click();
}

/* ---------- Prazos ---------- */
function viewPrazos() {
  const last = store.get('prazoForm', { regime: 'civel', days: 15, dje: true, forense: true, federal: false, dobro: false });
  const saved = store.get('prazos', []).sort((a, b) => a.end.localeCompare(b.end));
  const today = iso(new Date());

  view().innerHTML = `
    <section class="head"><div><p class="kicker">Calculadora</p><h1>Prazos</h1></div></section>

    <form id="prazoForm" class="card form">
      <div class="grid2">
        <label>Data da intimação ou disponibilização<input type="date" name="start" required value="${esc(last.start || today)}"></label>
        <label>Prazo (dias)<input type="number" name="days" min="1" max="999" required value="${esc(last.days)}"></label>
      </div>
      <label>Tipo de processo
        <select name="regime">${Object.entries(REGIMES).map(([k, r]) => `<option value="${k}" ${k === last.regime ? 'selected' : ''}>${r.label}</option>`).join('')}</select>
      </label>
      <div class="checks">
        <label><input type="checkbox" name="dje" ${last.dje ? 'checked' : ''}> Intimação pelo Diário eletrônico (publicação no dia útil seguinte)</label>
        <label><input type="checkbox" name="dobro" ${last.dobro ? 'checked' : ''}> Prazo em dobro (Fazenda, MP, Defensoria)</label>
        <label><input type="checkbox" name="forense" ${last.forense ? 'checked' : ''}> Sem expediente no Carnaval e em Corpus Christi</label>
        <label><input type="checkbox" name="federal" ${last.federal ? 'checked' : ''}> Justiça Federal (feriados da Lei 5.010/1966)</label>
      </div>
      <button class="btn gold wide"><i data-lucide="calculator"></i>Calcular</button>
    </form>

    <div id="prazoOut"></div>

    <details class="card">
      <summary><i data-lucide="calendar-x"></i>Feriados e suspensões da sua comarca (${store.get('customDays', []).length})</summary>
      <p class="fine">Feriado estadual, municipal, ponto facultativo ou indisponibilidade do sistema. Entram em todos os cálculos.</p>
      <form id="customForm" class="grid2">
        <input type="date" name="date" required>
        <input name="label" placeholder="Ex.: Aniversário da cidade">
        <button class="btn ghost">Adicionar</button>
      </form>
      <ul class="plain">${store.get('customDays', []).map((c, i) => `<li>${fmt(parseIso(c.date))} · ${esc(c.label)} <button class="link" data-del-custom="${i}">remover</button></li>`).join('')}</ul>
    </details>

    <section>
      <h2 class="sec">Meus prazos</h2>
      ${saved.length ? `<ul class="prazos">${saved.map(p => {
        const left = Math.round((parseIso(p.end) - parseIso(today)) / 864e5);
        const cls = left < 0 ? 'past' : left <= 2 ? 'hot' : left <= 5 ? 'warm' : '';
        return `<li class="${cls}">
          <div><b>${esc(p.title)}</b><small>${esc(p.proc || '')} · vence ${fmt(parseIso(p.end))}</small></div>
          <span class="left">${left < 0 ? 'venceu' : left === 0 ? 'HOJE' : left === 1 ? 'amanhã' : left + ' dias'}</span>
          <button class="icon" data-ics="${p.id}" aria-label="Adicionar à agenda"><i data-lucide="calendar-plus"></i></button>
          <button class="icon" data-del-prazo="${p.id}" aria-label="Apagar"><i data-lucide="x"></i></button>
        </li>`;
      }).join('')}</ul>` : '<p class="muted">Calcule um prazo e salve aqui para ver a contagem regressiva.</p>'}
    </section>

    <section>
      <h2 class="sec">Tabela rápida</h2>
      ${PRAZOS_TABELA.map(g => `
        <details class="card table">
          <summary>${esc(g.grupo)}</summary>
          <table>${g.itens.map(([a, p, art]) => `<tr><td>${esc(a)}</td><td><b>${esc(p)}</b></td><td class="muted">${esc(art)}</td></tr>`).join('')}</table>
        </details>`).join('')}
    </section>

    <p class="disclaimer">A calculadora segue as regras gerais (CPC arts. 219, 220 e 224; CLT art. 775; CPP art. 798 e 798-A; Lei 9.099 art. 12-A). Ela não conhece feriados locais nem suspensões do seu tribunal que você não cadastrou. Confira sempre no sistema do tribunal e não deixe para o último dia.</p>
  `;

  const form = $('#prazoForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const opts = {
      start: f.start, days: Number(f.days), regime: f.regime,
      dje: !!f.dje, dobro: !!f.dobro, forense: !!f.forense, federal: !!f.federal,
    };
    store.set('prazoForm', opts);
    const r = calcPrazo({ ...opts, start: parseIso(opts.start), custom: store.get('customDays', []) });
    const uniq = [...new Map(r.skipped.map(([d, why]) => [iso(d), [d, why]])).values()].filter(([d]) => d < r.end);
    $('#prazoOut').innerHTML = `
      <div class="card result-card">
        <p class="kicker">${r.n} dias ${REGIMES[opts.regime].uteis ? 'úteis' : 'corridos'}</p>
        <p class="big">Vence <b>${fmt(r.end)}</b></p>
        <ol class="steps">${r.steps.map(([t, d]) => `<li><span>${t}</span><b>${fmt(d)}</b></li>`).join('')}</ol>
        ${uniq.length ? `<details><summary>${uniq.length} dias não contados</summary><ul class="plain">${uniq.map(([d, w]) => `<li>${fmt(d)} · ${esc(w)}</li>`).join('')}</ul></details>` : ''}
        <form id="saveForm" class="grid2">
          <input name="title" placeholder="Peça (ex.: Contestação)" required>
          <input name="proc" placeholder="Nº do processo ou cliente">
          <button class="btn ghost"><i data-lucide="bookmark"></i>Salvar prazo</button>
        </form>
      </div>`;
    icons();
    $('#saveForm').addEventListener('submit', ev => {
      ev.preventDefault();
      const s = Object.fromEntries(new FormData(ev.target));
      store.set('prazos', [...store.get('prazos', []), { id: uid(), title: s.title, proc: s.proc, end: iso(r.end) }]);
      toast('Prazo salvo'); route();
    });
    $('#prazoOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#customForm').addEventListener('submit', e => {
    e.preventDefault();
    const c = Object.fromEntries(new FormData(e.target));
    store.set('customDays', [...store.get('customDays', []), c]);
    route();
  });
}

function downloadIcs(p) {
  const d = p.end.replace(/-/g, '');
  const prev = iso(addDays(parseIso(p.end), -1)).replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Toga//Prazos//PT',
    'BEGIN:VEVENT', `UID:${p.id}@toga`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d}`, `SUMMARY:PRAZO: ${p.title}${p.proc ? ' (' + p.proc + ')' : ''}`,
    'BEGIN:VALARM', 'TRIGGER:-PT24H', 'ACTION:DISPLAY', `DESCRIPTION:Prazo vence amanhã (${prev})`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: `prazo-${p.end}.ics`,
  });
  a.click();
}

/* ---------- Guias ---------- */
const SECTION_STYLE = {
  do: ['check-circle-2', 'do'], dont: ['x-circle', 'dont'], say: ['message-circle', 'say'],
  avoid: ['message-circle-x', 'dont'], list: ['chevron-right', ''], text: ['', ''],
};

function viewGuias(id) {
  const g = GUIDES.find(x => x.id === id);
  if (!g) {
    view().innerHTML = `
      <section class="head"><div><p class="kicker">Conduta e prática</p><h1>Guias</h1></div></section>
      <div class="guide-grid">${GUIDES.map(x => `
        <a class="guide-tile" href="#/guias/${x.id}">
          <i data-lucide="${x.icon}"></i>
          <b>${esc(x.title)}</b>
          <small>${esc(x.sub)}</small>
        </a>`).join('')}</div>`;
    return;
  }
  view().innerHTML = `
    <a class="back" href="#/guias"><i data-lucide="arrow-left"></i>Guias</a>
    <section class="head"><div><p class="kicker">${esc(g.sub)}</p><h1>${esc(g.title)}</h1></div></section>
    ${g.sections.map(s => {
      const [ic, cls] = SECTION_STYLE[s.type];
      if (s.type === 'text') return `<div class="card"><h3>${esc(s.h)}</h3>${s.items.map(t => `<p>${esc(t)}</p>`).join('')}</div>`;
      return `<div class="card sec-${cls || 'list'}"><h3>${esc(s.h)}</h3><ul class="ticks">${s.items.map(t =>
        `<li><i data-lucide="${ic}"></i><span>${esc(t)}</span></li>`).join('')}</ul></div>`;
    }).join('')}
    <p class="disclaimer"><b>Base:</b> ${esc(g.fonte)} Material de apoio, não substitui a leitura da norma.</p>
  `;
}

/* ---------- Estudo ---------- */
let session = null;

function viewEstudo(id) {
  const decks = allDecks();
  const deck = decks.find(d => d.id === id);
  if (deck) return studyDeck(deck);

  view().innerHTML = `
    <section class="head"><div><p class="kicker">Repetição espaçada</p><h1>Estudo</h1></div>
      <a class="btn ghost" href="#/guias/decorar"><i data-lucide="brain"></i>Técnicas</a></section>
    <div class="deck-list">${decks.map(d => {
      const due = dueCards(d).length;
      return `<a class="deck" href="#/estudo/${d.id}">
        <div><b>${esc(d.title)}</b><small>${d.cards.length} cartões</small></div>
        <span class="due ${due ? '' : 'zero'}">${due ? due + ' para revisar' : 'em dia ✓'}</span>
      </a>`;
    }).join('')}</div>

    <details class="card">
      <summary><i data-lucide="plus"></i>Criar meus cartões</summary>
      <form id="cardForm" class="form">
        <label>Pergunta<input name="q" required placeholder="Ex.: Prazo do agravo interno"></label>
        <label>Resposta<input name="a" required placeholder="15 dias (CPC art. 1.070)"></label>
        <button class="btn gold">Adicionar cartão</button>
      </form>
      ${store.get('myCards', []).length ? `<ul class="plain">${store.get('myCards', []).map((c, i) =>
        `<li><b>${esc(c.q)}</b> → ${esc(c.a)} <button class="link" data-del-card="${i}">apagar</button></li>`).join('')}</ul>` : ''}
    </details>
    <p class="fine">Acertou, o cartão volta em 1, 3, 7, 15 e depois 30 dias. Errou, volta amanhã.</p>
  `;
  $('#cardForm').addEventListener('submit', e => {
    e.preventDefault();
    const c = Object.fromEntries(new FormData(e.target));
    store.set('myCards', [...store.get('myCards', []), c]);
    toast('Cartão criado'); route();
  });
}

function studyDeck(deck) {
  if (!session || session.deck !== deck.id) {
    let queue = dueCards(deck);
    if (!queue.length) queue = deck.cards.map((c, i) => ({ c, i })); // tudo em dia: revisão livre
    session = { deck: deck.id, queue: queue.sort(() => Math.random() - 0.5), pos: 0, ok: 0, flipped: false };
  }
  const s = session;
  if (s.pos >= s.queue.length) {
    view().innerHTML = `
      <a class="back" href="#/estudo"><i data-lucide="arrow-left"></i>Estudo</a>
      <div class="card done"><i data-lucide="party-popper"></i><h2>Fim da rodada</h2>
        <p>${s.ok} de ${s.queue.length} certos.</p>
        <a class="btn gold" href="#/estudo">Voltar aos baralhos</a></div>`;
    session = null;
    return;
  }
  const { c, i } = s.queue[s.pos];
  view().innerHTML = `
    <a class="back" href="#/estudo"><i data-lucide="arrow-left"></i>${esc(deck.title)}</a>
    <p class="muted center">${s.pos + 1} de ${s.queue.length}</p>
    <button class="flash ${s.flipped ? 'flipped' : ''}" id="flash">
      <span class="q">${esc(c[0])}</span>
      ${s.flipped ? `<span class="a">${esc(c[1])}</span>` : '<span class="hint">Toque para ver a resposta</span>'}
    </button>
    ${s.flipped ? `<div class="actions center">
      <button class="btn danger-soft" data-grade="0"><i data-lucide="rotate-ccw"></i>Errei</button>
      <button class="btn gold" data-grade="1"><i data-lucide="check"></i>Acertei</button>
    </div>` : ''}
  `;
  $('#flash').onclick = () => { s.flipped = true; route(); };
  $$('[data-grade]').forEach(b => b.onclick = () => {
    const ok = b.dataset.grade === '1';
    grade(deck.id, i, ok);
    if (ok) s.ok++;
    s.pos++; s.flipped = false; route();
  });
}

/* ---------- Apps ---------- */
function viewApps() {
  const mine = store.get('myApps', []);
  const using = store.get('usingApps', []);
  view().innerHTML = `
    <section class="head"><div><p class="kicker">Ferramentas que valem a pena</p><h1>Apps e sites</h1></div></section>
    <p class="muted">Seleção com fontes oficiais primeiro. Marque os que você usa e cadastre os seus.</p>
    ${[...APPS, ...(mine.length ? [{ cat: 'Meus apps', items: mine, mine: true }] : [])].map(g => `
      <h2 class="sec">${esc(g.cat)}</h2>
      <div class="apps">${g.items.map((a, i) => `
        <div class="app-card ${using.includes(a.name) ? 'using' : ''}">
          <div class="app-top">
            <b>${esc(a.name)}</b>
            <button class="icon" data-use="${esc(a.name)}" aria-label="Marcar que uso"><i data-lucide="${using.includes(a.name) ? 'star' : 'star-off'}"></i></button>
          </div>
          <p>${esc(a.what)}</p>
          ${a.when ? `<p class="when"><b>Quando usar:</b> ${esc(a.when)}</p>` : ''}
          <div class="app-foot">
            ${(a.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
            ${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener" class="link">Abrir <i data-lucide="external-link"></i></a>` : ''}
            ${g.mine ? `<button class="link" data-del-app="${i}">apagar</button>` : ''}
          </div>
        </div>`).join('')}</div>`).join('')}

    <details class="card">
      <summary><i data-lucide="plus"></i>Cadastrar um app que você usa</summary>
      <form id="appForm" class="form">
        <label>Nome<input name="name" required></label>
        <label>Para que serve<input name="what" required></label>
        <label>Link<input name="url" type="url" placeholder="https://"></label>
        <button class="btn gold">Salvar</button>
      </form>
    </details>
    <p class="disclaimer">Preços e funções mudam. Confira na loja antes de assinar. Nenhum app aqui é patrocinado.</p>
  `;
  $('#appForm').addEventListener('submit', e => {
    e.preventDefault();
    const a = Object.fromEntries(new FormData(e.target));
    store.set('myApps', [...mine, { ...a, tags: ['meu'] }]);
    route();
  });
}

/* =========================================================
   Folha (sheet), aviso e eventos
   ========================================================= */
function openSheet(html) {
  const dlg = $('#sheet');
  $('#sheetBody').innerHTML = html;
  icons();
  if (!dlg.open) dlg.showModal();
}
function closeSheet() { $('#sheet').close(); }

let toastT;
function toast(t) {
  const el = $('#toast');
  el.textContent = t; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-book],[data-area],[data-close],[data-del-prazo],[data-ics],[data-del-custom],[data-del-card],[data-use],[data-del-app]');
  if (!t) return;
  const d = t.dataset;
  if (d.close !== undefined) return closeSheet();
  if (d.book) return bookDetail(BOOKS.find(b => b.id === d.book));
  if (d.area !== undefined) { shelfFilter.area = d.area; return route(); }
  if (d.act === 'add-book') return bookForm();
  if (d.act === 'export') return exportBooks();
  if (d.act === 'import') return importBooks();
  if (d.delPrazo) { store.set('prazos', store.get('prazos', []).filter(p => p.id !== d.delPrazo)); return route(); }
  if (d.ics) return downloadIcs(store.get('prazos', []).find(p => p.id === d.ics));
  if (d.delCustom) { const c = store.get('customDays', []); c.splice(+d.delCustom, 1); store.set('customDays', c); return route(); }
  if (d.delCard) { const c = store.get('myCards', []); c.splice(+d.delCard, 1); store.set('myCards', c); return route(); }
  if (d.delApp) { const c = store.get('myApps', []); c.splice(+d.delApp, 1); store.set('myApps', c); return route(); }
  if (d.use) {
    const u = store.get('usingApps', []);
    store.set('usingApps', u.includes(d.use) ? u.filter(x => x !== d.use) : [...u, d.use]);
    return route();
  }
});

// capa que não carrega (sem internet, link quebrado) vira a capa desenhada
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName !== 'IMG' || img.dataset.t == null) return;
  img.replaceWith(Object.assign(document.createElement('span'), { className: 'fake', textContent: img.dataset.t }));
}, true);

$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });

async function loadBooks() {
  try { BOOKS = await db.all(); } catch { BOOKS = []; toast('Não foi possível abrir a estante neste navegador'); }
}

let resizeT;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { if (!location.hash || location.hash.startsWith('#/estante')) route(); }, 200);
});
window.addEventListener('hashchange', route);

(async () => {
  await loadBooks();
  route();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
