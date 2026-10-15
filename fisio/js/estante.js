// Estante digital: livros com capa em pé, foto, ISBN, PDF e progresso de leitura

import { db } from './db.js';
import { $, $$, esc, uid, toast, openSheet, closeSheet } from './util.js';

export const AREAS = [
  'Anatomia', 'Fisiologia', 'Cinesiologia e biomecânica', 'Ortopedia e traumatologia', 'Neurofuncional',
  'Cardiorrespiratória', 'Terapia intensiva', 'Pediatria', 'Gerontologia', 'Esportiva', 'Saúde da mulher',
  'Dermatofuncional', 'Terapia manual', 'Recursos e eletrotermofototerapia', 'Avaliação e semiologia',
  'Saúde coletiva', 'Pesquisa e metodologia', 'Outros',
];
const STATUS = { quero: 'Quero ler', lendo: 'Lendo', lido: 'Lido' };
const SPINE_COLORS = ['#0F5257', '#7B2D26', '#2F4858', '#6A4C93', '#33658A', '#8C5E34', '#3D5A40', '#9C3D54', '#1D3557', '#5B5F97'];

let books = [];
let filter = 'todos';
let query = '';

const colorFor = text => SPINE_COLORS[[...String(text)].reduce((a, c) => a + c.charCodeAt(0), 0) % SPINE_COLORS.length];

export async function renderEstante(root) {
  books = (await db.all('books')).sort((a, b) => b.createdAt - a.createdAt);
  root.innerHTML = `
    <div class="row between">
      <div>
        <h1>Minha estante</h1>
        <p class="muted" id="shelfCount"></p>
      </div>
      <button type="button" id="addBook">＋ Adicionar livro</button>
    </div>
    <input type="search" id="shelfSearch" placeholder="Buscar por título, autor, editora ou área" value="${esc(query)}" />
    <div class="chips" id="shelfFilter" style="margin-top:8px">
      ${chip('todos', 'Todos')}${chip('lendo', 'Lendo')}${chip('quero', 'Quero ler')}${chip('lido', 'Lidos')}${chip('pdf', 'Com PDF')}
      ${AREAS.map(a => chip('area:' + a, a)).join('')}
    </div>
    <div id="shelves"></div>
    <div class="row no-print" style="margin-top:14px">
      <button type="button" class="soft small" id="exportShelf">⬇ Fazer backup</button>
      <label class="btn soft small" style="margin:0">⬆ Restaurar backup<input type="file" id="importShelf" accept="application/json" hidden /></label>
    </div>
    <p class="muted" style="font-size:.8rem">Os livros ficam salvos só neste aparelho. Faça backup de vez em quando para não perder nada se trocar de celular.</p>
  `;
  $('#addBook').onclick = () => openBookForm();
  $('#shelfSearch').oninput = e => { query = e.target.value; drawShelves(); };
  $('#shelfFilter').onclick = e => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    filter = b.dataset.f;
    $$('#shelfFilter .chip').forEach(c => c.classList.toggle('on', c === b));
    drawShelves();
  };
  $('#exportShelf').onclick = exportBackup;
  $('#importShelf').onchange = e => importBackup(e.target.files[0]);
  drawShelves();
  window.onresize = () => { if (location.hash.startsWith('#/estante')) drawShelves(); };
}

const chip = (f, label) => `<button type="button" class="chip ${filter === f ? 'on' : ''}" data-f="${esc(f)}">${esc(label)}</button>`;

function visibleBooks() {
  const q = query.trim().toLowerCase();
  return books.filter(b => {
    if (filter === 'pdf' && !(b.pdfUrl || b.pdfFile)) return false;
    if (STATUS[filter] && b.status !== filter) return false;
    if (filter.startsWith('area:') && b.area !== filter.slice(5)) return false;
    if (!q) return true;
    return [b.title, b.author, b.publisher, b.area, b.isbn].some(v => String(v || '').toLowerCase().includes(q));
  });
}

function drawShelves() {
  const list = visibleBooks();
  const wrap = $('#shelves');
  if (!wrap) return;
  $('#shelfCount').textContent = books.length === 1 ? '1 livro na estante' : `${books.length} livros na estante`;
  if (!books.length) {
    wrap.innerHTML = `<div class="card empty"><div class="big">📚</div><p><b>Sua estante está vazia.</b><br>Tire uma foto da capa, leia o código de barras ou cole o link do PDF.</p></div>`;
    return;
  }
  if (!list.length) {
    wrap.innerHTML = `<div class="card empty"><p>Nenhum livro com esse filtro.</p></div>`;
    return;
  }
  // quantos livros cabem em cada prateleira
  const bookW = window.innerWidth >= 700 ? 120 : 106;
  const usable = Math.min(wrap.clientWidth || window.innerWidth - 32, 920) - 40;
  const perRow = Math.max(2, Math.floor(usable / bookW));
  let html = '';
  for (let i = 0; i < list.length; i += perRow) {
    html += `<div class="shelf">${list.slice(i, i + perRow).map(bookHTML).join('')}</div>`;
  }
  wrap.innerHTML = `<div class="shelf-wrap">${html}</div>`;
  wrap.onclick = e => {
    const b = e.target.closest('[data-book]');
    if (b) openBookDetail(b.dataset.book);
  };
}

function coverHTML(b) {
  const src = b.cover || b.coverUrl;
  if (src) return `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`;
  return `<span class="cover-text"><b>${esc(b.title)}</b><small>${esc(b.author || b.publisher || '')}</small></span>`;
}

function bookHTML(b) {
  const pct = b.pages && b.page ? Math.min(100, Math.round((b.page / b.pages) * 100)) : 0;
  const badge = b.status === 'lido' ? '✓ lido' : (b.pdfUrl || b.pdfFile) ? 'PDF' : '';
  return `<div class="book-slot">
    <button type="button" class="book" data-book="${esc(b.id)}" style="background:${colorFor(b.title)}" aria-label="${esc(b.title)}">
      ${coverHTML(b)}
      ${badge ? `<span class="badge">${badge}</span>` : ''}
      ${pct && b.status !== 'lido' ? `<span class="bar" style="width:${pct}%"></span>` : ''}
    </button>
    <div class="book-label">${esc(b.title)}</div>
  </div>`;
}

/* ---------------- Detalhe do livro ---------------- */

async function openBookDetail(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;
  const pct = b.pages ? Math.min(100, Math.round(((b.page || 0) / b.pages) * 100)) : 0;
  const body = openSheet(b.title, `
    <div class="book-detail">
      <div>${b.cover || b.coverUrl
        ? `<img class="cover-preview" src="${esc(b.cover || b.coverUrl)}" alt="Capa" referrerpolicy="no-referrer" />`
        : `<div class="book" style="width:100%;background:${colorFor(b.title)}">${coverHTML(b)}</div>`}</div>
      <div>
        ${b.author ? `<p><b>${esc(b.author)}</b></p>` : ''}
        <p class="muted">${[b.publisher, b.edition && b.edition + 'ª ed.', b.year].filter(Boolean).map(esc).join(' · ')}</p>
        ${b.isbn ? `<p class="muted">ISBN ${esc(b.isbn)}</p>` : ''}
        <p>${b.area ? `<span class="tag">${esc(b.area)}</span> ` : ''}<span class="tag ${b.status === 'lido' ? 'ok' : b.status === 'lendo' ? 'warn' : ''}">${STATUS[b.status] || ''}</span></p>
      </div>
    </div>
    ${b.pages ? `
      <label for="pageNow">Página atual: <span id="pageLbl">${b.page || 0}</span> de ${b.pages} (${pct}%)</label>
      <input type="range" id="pageNow" min="0" max="${b.pages}" value="${b.page || 0}" />
    ` : ''}
    ${b.notes ? `<h3 style="margin-top:12px">Anotações</h3><p style="white-space:pre-line">${esc(b.notes)}</p>` : ''}
    <div class="row" style="margin-top:14px">
      ${b.pdfFile ? `<button type="button" id="openPdfFile">📄 Abrir PDF</button>` : ''}
      ${b.pdfUrl ? `<a class="btn" href="${esc(b.pdfUrl)}" target="_blank" rel="noopener noreferrer">🔗 Abrir link</a>` : ''}
      <button type="button" class="ghost" id="editBook">Editar</button>
      <button type="button" class="ghost" id="delBook" style="color:var(--bad);border-color:var(--bad)">Remover</button>
    </div>
  `);
  const range = $('#pageNow', body);
  if (range) {
    range.oninput = () => { $('#pageLbl', body).textContent = range.value; };
    range.onchange = async () => {
      b.page = Number(range.value);
      if (b.page > 0 && b.status === 'quero') b.status = 'lendo';
      if (b.page >= b.pages) b.status = 'lido';
      await db.put('books', b);
      drawShelves();
      toast(b.status === 'lido' ? 'Livro concluído! 🎉' : 'Progresso salvo');
    };
  }
  $('#editBook', body).onclick = () => openBookForm(b);
  $('#delBook', body).onclick = async () => {
    if (!confirm(`Remover "${b.title}" da estante?`)) return;
    await db.del('books', b.id);
    if (b.pdfFile) await db.del('files', b.pdfFile);
    books = books.filter(x => x.id !== b.id);
    closeSheet();
    drawShelves();
    toast('Livro removido');
  };
  const openPdf = $('#openPdfFile', body);
  if (openPdf) openPdf.onclick = async () => {
    const f = await db.get('files', b.pdfFile);
    if (!f) return toast('Arquivo não encontrado');
    const url = URL.createObjectURL(f.blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
}

/* ---------------- Formulário (novo / editar) ---------------- */

function openBookForm(existing) {
  const b = existing ? { ...existing } : { id: uid(), status: 'quero', createdAt: Date.now() };
  let pdfBlob = null;
  const canScan = 'BarcodeDetector' in window;
  const body = openSheet(existing ? 'Editar livro' : 'Novo livro', `
    <form id="bookForm" autocomplete="off">
      <div class="row" style="align-items:flex-start">
        <img id="coverPrev" class="cover-preview" alt="Prévia da capa" ${b.cover || b.coverUrl ? `src="${esc(b.cover || b.coverUrl)}"` : ''} referrerpolicy="no-referrer" />
        <div class="stack" style="flex:1;min-width:170px">
          <label class="btn" style="margin:0">📷 Tirar foto da capa<input type="file" accept="image/*" capture="environment" id="camInput" hidden /></label>
          <label class="btn soft" style="margin:0">🖼️ Escolher da galeria<input type="file" accept="image/*" id="galInput" hidden /></label>
          ${canScan ? `<label class="btn ghost" style="margin:0">▥ Foto do código de barras<input type="file" accept="image/*" capture="environment" id="scanInput" hidden /></label>` : ''}
          ${b.cover || b.coverUrl ? `<button type="button" class="ghost small" id="rmCover">Tirar capa</button>` : ''}
        </div>
      </div>

      <label for="fIsbn">ISBN (busca os dados sozinho)</label>
      <div class="row" style="flex-wrap:nowrap">
        <input id="fIsbn" inputmode="numeric" placeholder="978..." value="${esc(b.isbn || '')}" />
        <button type="button" class="soft" id="lookupIsbn">Buscar</button>
      </div>

      <label for="fTitle">Título *</label>
      <div class="row" style="flex-wrap:nowrap">
        <input id="fTitle" required value="${esc(b.title || '')}" placeholder="Ex.: Anatomia Orientada para a Clínica" />
        <button type="button" class="soft" id="lookupTitle" title="Procurar dados pelo título">🔎</button>
      </div>
      <div id="titleResults"></div>

      <label for="fAuthor">Autor(es)</label>
      <input id="fAuthor" value="${esc(b.author || '')}" />
      <div class="field2">
        <div><label for="fPub">Editora</label><input id="fPub" value="${esc(b.publisher || '')}" /></div>
        <div><label for="fEd">Edição</label><input id="fEd" inputmode="numeric" value="${esc(b.edition || '')}" placeholder="Ex.: 8" /></div>
        <div><label for="fYear">Ano</label><input id="fYear" inputmode="numeric" value="${esc(b.year || '')}" /></div>
        <div><label for="fPages">Nº de páginas</label><input id="fPages" type="number" min="0" value="${esc(b.pages || '')}" /></div>
      </div>
      <div class="field2">
        <div><label for="fArea">Área</label><select id="fArea"><option value="">—</option>${AREAS.map(a => `<option ${b.area === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select></div>
        <div><label for="fStatus">Situação</label><select id="fStatus">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      </div>

      <label for="fPdfUrl">Link do PDF (Drive, biblioteca virtual, site da editora...)</label>
      <input id="fPdfUrl" type="url" placeholder="https://..." value="${esc(b.pdfUrl || '')}" />
      <label for="fPdfFile">ou arquivo PDF do aparelho ${b.pdfFile ? '<span class="tag ok">já tem um salvo</span>' : ''}</label>
      <input id="fPdfFile" type="file" accept="application/pdf" />

      <label for="fNotes">Anotações</label>
      <textarea id="fNotes" placeholder="Capítulos importantes, quem indicou, para qual disciplina...">${esc(b.notes || '')}</textarea>

      <button type="submit" style="width:100%;margin-top:14px">Salvar na estante</button>
    </form>
  `);

  const prev = $('#coverPrev', body);
  const setCover = dataUrl => { b.cover = dataUrl; b.coverUrl = ''; prev.src = dataUrl; };
  const onImage = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try { setCover(await resizeImage(file)); } catch { toast('Não consegui ler essa imagem'); }
  };
  $('#camInput', body).onchange = onImage;
  $('#galInput', body).onchange = onImage;
  const rm = $('#rmCover', body);
  if (rm) rm.onclick = () => { b.cover = ''; b.coverUrl = ''; prev.removeAttribute('src'); rm.remove(); };

  const scan = $('#scanInput', body);
  if (scan) scan.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const isbn = await readBarcode(file);
    if (!isbn) return toast('Não achei o código. Tente com mais luz e mais perto.');
    $('#fIsbn', body).value = isbn;
    fillFromIsbn();
  };

  const fill = info => {
    const set = (id, v) => { if (v && !$(id, body).value) $(id, body).value = v; };
    if (info.title) $('#fTitle', body).value = info.title;
    set('#fAuthor', info.author); set('#fPub', info.publisher); set('#fYear', info.year); set('#fPages', info.pages);
    if (info.isbn) set('#fIsbn', info.isbn);
    if (info.cover && !b.cover) {
      imageUrlToDataUrl(info.cover).then(setCover).catch(() => { b.coverUrl = info.cover; prev.src = info.cover; });
    }
  };

  const fillFromIsbn = async () => {
    const isbn = $('#fIsbn', body).value.replace(/[^0-9Xx]/g, '');
    if (isbn.length < 10) return toast('Digite os 10 ou 13 números do ISBN');
    toast('Procurando...');
    const info = await lookupIsbn(isbn);
    if (!info) return toast('Não encontrei; preencha à mão (sem problema!)');
    fill(info);
    toast('Dados preenchidos ✔');
  };
  $('#lookupIsbn', body).onclick = fillFromIsbn;

  $('#lookupTitle', body).onclick = async () => {
    const q = $('#fTitle', body).value.trim();
    const out = $('#titleResults', body);
    if (q.length < 3) return toast('Digite pelo menos parte do título');
    out.innerHTML = '<p class="muted">Procurando...</p>';
    const results = await searchTitle(q);
    if (!results.length) { out.innerHTML = '<p class="muted">Nada encontrado. Preencha à mão.</p>'; return; }
    out.innerHTML = `<div class="card" style="padding:6px 10px;margin-top:8px">${results.map((r, i) => `
      <button type="button" class="ghost small" data-r="${i}" style="width:100%;justify-content:flex-start;text-align:left;margin:4px 0;border-width:1px">
        ${r.cover ? `<img src="${esc(r.cover)}" alt="" style="width:28px;height:40px;object-fit:cover;border-radius:2px" referrerpolicy="no-referrer" />` : '📘'}
        <span><b>${esc(r.title)}</b><br><small>${esc([r.author, r.publisher, r.year].filter(Boolean).join(' · '))}</small></span>
      </button>`).join('')}</div>`;
    out.onclick = e => {
      const btn = e.target.closest('[data-r]');
      if (!btn) return;
      fill(results[Number(btn.dataset.r)]);
      out.innerHTML = '';
    };
  };

  $('#fPdfFile', body).onchange = e => { pdfBlob = e.target.files[0] || null; };

  $('#bookForm', body).onsubmit = async e => {
    e.preventDefault();
    const v = id => $(id, body).value.trim();
    Object.assign(b, {
      title: v('#fTitle'), author: v('#fAuthor'), publisher: v('#fPub'), edition: v('#fEd'),
      year: v('#fYear'), pages: Number(v('#fPages')) || 0, area: v('#fArea'), status: v('#fStatus'),
      isbn: v('#fIsbn'), pdfUrl: v('#fPdfUrl'), notes: v('#fNotes'),
    });
    if (!b.title) return toast('Coloque pelo menos o título');
    try {
      if (pdfBlob) {
        const fileId = b.pdfFile || uid();
        await db.put('files', { id: fileId, name: pdfBlob.name, blob: pdfBlob });
        b.pdfFile = fileId;
      }
      await db.put('books', b);
    } catch {
      return toast('Sem espaço no aparelho para salvar. Tente um PDF menor ou use o link.');
    }
    closeSheet();
    toast(existing ? 'Livro atualizado' : 'Livro na estante! 📚');
    renderEstante($('#view'));
  };
}

/* ---------------- Imagem e código de barras ---------------- */

// Reduz a foto para não lotar o armazenamento (capa de ~480×720)
async function resizeImage(file, maxW = 480, maxH = 720) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function imageUrlToDataUrl(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('capa');
  return resizeImage(await res.blob());
}

async function readBarcode(file) {
  try {
    const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] });
    const codes = await detector.detect(await createImageBitmap(file));
    const isbn = codes.map(c => c.rawValue).find(v => /^97[89]\d{10}$/.test(v));
    return isbn || codes[0]?.rawValue || '';
  } catch { return ''; }
}

/* ---------------- Busca de dados do livro ---------------- */

const https = u => (u ? u.replace(/^http:/, 'https:') : '');

function fromGoogle(item) {
  const v = item.volumeInfo || {};
  const isbn = (v.industryIdentifiers || []).find(i => i.type === 'ISBN_13')?.identifier
    || (v.industryIdentifiers || [])[0]?.identifier || '';
  return {
    title: [v.title, v.subtitle].filter(Boolean).join(': '),
    author: (v.authors || []).join(', '),
    publisher: v.publisher || '',
    year: (v.publishedDate || '').slice(0, 4),
    pages: v.pageCount || '',
    cover: https(v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail),
    isbn,
  };
}

async function lookupIsbn(isbn) {
  try {
    const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const j = await r.json();
    if (j.items?.length) return fromGoogle(j.items[0]);
  } catch { /* tenta a próxima fonte */ }
  try {
    const r = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const d = (await r.json())[`ISBN:${isbn}`];
    if (d) return {
      title: d.title,
      author: (d.authors || []).map(a => a.name).join(', '),
      publisher: (d.publishers || []).map(p => p.name).join(', '),
      year: (d.publish_date || '').match(/\d{4}/)?.[0] || '',
      pages: d.number_of_pages || '',
      cover: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
      isbn,
    };
  } catch { /* sem internet ou fora do ar */ }
  return null;
}

async function searchTitle(q) {
  try {
    const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=6&printType=books`);
    const j = await r.json();
    return (j.items || []).map(fromGoogle);
  } catch { return []; }
}

/* ---------------- Backup ---------------- */

const blobToDataUrl = blob => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = () => rej(fr.error);
  fr.readAsDataURL(blob);
});

async function exportBackup() {
  const all = await db.all('books');
  const files = await db.all('files');
  const payload = {
    app: 'fisiopalma', version: 1, exportedAt: new Date().toISOString(),
    books: all,
    files: await Promise.all(files.map(async f => ({ id: f.id, name: f.name, data: await blobToDataUrl(f.blob) }))),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `estante-fisiopalma-${new Date().toISOString().slice(0, 10)}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('Backup baixado');
}

async function importBackup(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'fisiopalma' || !Array.isArray(data.books)) throw new Error('formato');
    for (const f of data.files || []) {
      const blob = await (await fetch(f.data)).blob();
      await db.put('files', { id: f.id, name: f.name, blob });
    }
    for (const b of data.books) await db.put('books', b);
    toast(`${data.books.length} livros restaurados`);
    renderEstante($('#view'));
  } catch {
    toast('Esse arquivo não é um backup da estante');
  }
}
