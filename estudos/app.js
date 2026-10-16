/* =========================================================
   CAMPUS · App principal
   - Estado salvo no aparelho (localStorage), separado por curso
   - Rotas por hash: #/grade, #/biblioteca, #/atlas, #/acervo, #/quiz
   - Cada tela é uma função que desenha em #tela e liga seus eventos
   ========================================================= */

import { CURSOS, ORDEM_CURSOS, areaDaMateria, infoArea } from './js/cursos.js';
import { PERGUNTAS } from './js/perguntas.js';
import { ACERVO, TIPOS_ACERVO } from './js/acervo.js';
import { DIAGRAMAS, desenharDiagrama } from './js/diagramas.js';

/* ---------------- Estado ---------------- */

const CHAVE = 'campus:v1';
const estado = carregar();

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && salvo.cursos) return salvo;
  } catch { /* primeiro acesso ou armazenamento bloqueado */ }
  return { curso: null, tema: 'dark', cursos: {} };
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
    return true;
  } catch {
    aviso('Sem espaço no aparelho. Apague fotos de capas antigas ou exporte um backup.');
    return false;
  }
}

/* Dados do curso atual (cada curso guarda sua própria grade, livros e quiz) */
function dados() {
  const id = estado.curso;
  estado.cursos[id] ||= { materias: [], livros: [], quiz: { xp: 0, melhor: 0, rodadas: 0, porArea: {} } };
  return estado.cursos[id];
}
const curso = () => CURSOS[estado.curso];

/* ---------------- Utilidades ---------------- */

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icone = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const sorteio = lista => lista[Math.floor(Math.random() * lista.length)];

let timerAviso;
function aviso(msg) {
  const el = $('#aviso');
  el.textContent = msg;
  el.classList.add('visivel');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => el.classList.remove('visivel'), 3200);
}

/* Folha (modal) única, reaproveitada por todas as telas */
const folha = $('#folha');
function abrirFolha(html, { travada = false } = {}) {
  // Troca o container a cada abertura para não acumular eventos da folha anterior
  const novo = document.createElement('div');
  novo.id = 'folha-conteudo';
  novo.innerHTML = html;
  $('#folha-conteudo').replaceWith(novo);
  folha.classList.toggle('travada', travada);
  if (!folha.open) folha.showModal();
  return $('#folha-conteudo');
}
const fecharFolha = () => folha.open && folha.close();
folha.addEventListener('cancel', e => { if (folha.classList.contains('travada')) e.preventDefault(); });
folha.addEventListener('click', e => { if (e.target === folha && !folha.classList.contains('travada')) folha.close(); });

/* Texto simples com marcação mínima (##, ###, -) → HTML seguro */
function textoParaHtml(texto) {
  let html = '';
  let lista = false;
  for (const bruta of texto.split('\n')) {
    const linha = bruta.trimEnd();
    const item = /^\s*[-•]\s+/.test(linha);
    if (lista && !item) { html += '</ul>'; lista = false; }
    if (linha.startsWith('### ')) html += `<h4>${esc(linha.slice(4))}</h4>`;
    else if (linha.startsWith('## ')) html += `<h3>${esc(linha.slice(3))}</h3>`;
    else if (item) {
      if (!lista) { html += '<ul>'; lista = true; }
      html += `<li>${esc(linha.replace(/^\s*[-•]\s+/, ''))}</li>`;
    } else if (linha.trim()) html += `<p>${esc(linha)}</p>`;
  }
  return html + (lista ? '</ul>' : '');
}

/* ---------------- Tema e curso ---------------- */

function aplicarTema() {
  document.documentElement.dataset.theme = estado.tema;
  $('#btn-tema use').setAttribute('href', estado.tema === 'dark' ? '#i-sol' : '#i-lua');
  $('meta[name="theme-color"]').content = estado.tema === 'dark' ? '#0b1120' : '#f8fafc';
}
$('#btn-tema').addEventListener('click', () => {
  estado.tema = estado.tema === 'dark' ? 'light' : 'dark';
  salvar();
  aplicarTema();
});

function aplicarCurso() {
  const c = curso();
  document.documentElement.style.setProperty('--curso', c.cor);
  $('#curso-nome').textContent = c.nome;
  $('#nav-visual').textContent = c.abaVisual;
}

function escolherCurso({ primeiraVez = false } = {}) {
  const raiz = abrirFolha(`
    <h2>${primeiraVez ? 'Bem-vindo ao CAMPUS' : 'Trocar de curso'}</h2>
    <p class="sutil">${primeiraVez ? 'Qual é o seu curso? Dá para trocar depois; cada curso guarda sua própria grade, biblioteca e pontuação.' : 'Seus dados de cada curso ficam guardados.'}</p>
    <div class="cursos-grid">
      ${ORDEM_CURSOS.map(id => {
        const c = CURSOS[id];
        return `<button class="curso-card ${id === estado.curso ? 'ativo' : ''}" data-curso="${id}" style="--c:${c.cor}">
          <span class="curso-sigla">${c.sigla}</span>
          <strong>${c.nome}</strong>
          <small>${c.abaVisual} · ${Object.keys(c.areas).length} áreas</small>
        </button>`;
      }).join('')}
    </div>
    ${primeiraVez ? '' : `
    <div class="secao-dados">
      <h4>Backup dos dados</h4>
      <div class="linha-botoes">
        <button class="btn" data-acao="exportar">${icone('baixar')} Exportar</button>
        <label class="btn">${icone('upload')} Importar<input type="file" accept="application/json,.json" hidden data-acao="importar"></label>
      </div>
    </div>`}
  `, { travada: primeiraVez });

  raiz.addEventListener('click', e => {
    const card = e.target.closest('[data-curso]');
    if (card) {
      estado.curso = card.dataset.curso;
      dados();
      salvar();
      aplicarCurso();
      fecharFolha();
      rotear();
      return;
    }
    if (e.target.closest('[data-acao="exportar"]')) exportarBackup();
  });
  raiz.querySelector('[data-acao="importar"]')?.addEventListener('change', importarBackup);
}
$('#btn-curso').addEventListener('click', () => escolherCurso());

function exportarBackup() {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `campus-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importarBackup(e) {
  const arq = e.target.files[0];
  if (!arq) return;
  try {
    const novo = JSON.parse(await arq.text());
    if (!novo.cursos || !CURSOS[novo.curso]) throw new Error('formato');
    Object.assign(estado, novo);
    salvar();
    aplicarTema();
    aplicarCurso();
    fecharFolha();
    rotear();
    aviso('Backup importado.');
  } catch {
    aviso('Arquivo inválido. Use um backup exportado pelo CAMPUS.');
  }
}

/* ---------------- Roteamento ---------------- */

const TELAS = { grade: telaGrade, biblioteca: telaBiblioteca, atlas: telaAtlas, acervo: telaAcervo, quiz: telaQuiz };
let limpezaTela = null;

function rotear() {
  if (!estado.curso) return;
  const rota = location.hash.replace('#/', '').split('?')[0];
  const nome = TELAS[rota] ? rota : 'grade';
  if (limpezaTela) { limpezaTela(); limpezaTela = null; }
  $$('.nav-item').forEach(a => a.classList.toggle('ativo', a.dataset.rota === nome));
  // Elemento novo a cada tela: os eventos da tela anterior vão embora junto
  const tela = $('#tela').cloneNode(false);
  $('#tela').replaceWith(tela);
  tela.className = `tela tela-${nome}`;
  limpezaTela = TELAS[nome](tela) || null;
  tela.scrollTop = 0;
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', rotear);

/* =========================================================
   1. GRADE CURRICULAR
   ========================================================= */

function telaGrade(tela) {
  const d = dados();
  const c = curso();
  const nivel = nivelDoXp(d.quiz.xp);
  const precisao = precisaoGeral(d.quiz);
  const porSemestre = {};
  for (const m of d.materias) (porSemestre[m.semestre || 0] ||= []).push(m);
  const semestres = Object.keys(porSemestre).map(Number).sort((a, b) => a - b);

  tela.innerHTML = `
    <section class="cabecalho">
      <div>
        <p class="sobretitulo">${esc(c.nome)}</p>
        <h1>Minha grade</h1>
      </div>
      <button class="btn primario" data-acao="adicionar">${icone('mais')} Disciplina</button>
    </section>

    <section class="stats">
      <div class="stat"><span>${d.materias.length}</span><small>disciplinas</small></div>
      <div class="stat"><span>${d.livros.length}</span><small>livros</small></div>
      <div class="stat"><span>${nivel.nivel}</span><small>nível no quiz</small></div>
      <div class="stat"><span>${precisao === null ? '—' : precisao + '%'}</span><small>de acertos</small></div>
    </section>

    <section class="cartao dica-dia">
      ${icone('dica')}
      <div><strong>Dica do dia</strong><p>${esc(sorteio(c.dicasGerais))}</p></div>
    </section>

    ${d.materias.length === 0 ? `
      <section class="vazio">
        <h3>Cadastre as disciplinas do seu semestre</h3>
        <p>Cada disciplina recebe dicas de estudo da área e organiza seus livros e o quiz.</p>
        <div class="linha-botoes centro">
          <button class="btn primario" data-acao="adicionar">${icone('mais')} Adicionar</button>
          <label class="btn">${icone('upload')} Enviar arquivo<input type="file" accept=".txt,.csv,.json,text/plain,text/csv,application/json" hidden data-acao="arquivo"></label>
          <button class="btn" data-acao="sugerida">Usar grade sugerida</button>
        </div>
        <p class="sutil pequeno">Arquivo: uma disciplina por linha. Para informar o semestre use "Nome;Semestre".</p>
      </section>
    ` : semestres.map(s => `
      <section class="bloco">
        <h2 class="titulo-bloco">${s ? `${s}º semestre` : 'Sem semestre'}</h2>
        <div class="lista-materias">
          ${porSemestre[s].map(m => cartaoMateria(m, d)).join('')}
        </div>
      </section>
    `).join('') + `
      <div class="linha-botoes">
        <label class="btn discreto">${icone('upload')} Enviar arquivo<input type="file" accept=".txt,.csv,.json,text/plain,text/csv,application/json" hidden data-acao="arquivo"></label>
      </div>`}
  `;

  tela.addEventListener('click', e => {
    const alvo = e.target.closest('[data-acao], [data-materia]');
    if (!alvo) return;
    if (alvo.dataset.materia) return abrirMateria(alvo.dataset.materia);
    if (alvo.dataset.acao === 'adicionar') formMaterias();
    if (alvo.dataset.acao === 'sugerida') {
      adicionarMaterias(c.gradeSugerida);
      aviso('Grade sugerida adicionada. Edite como quiser.');
    }
  });
  tela.addEventListener('change', async e => {
    if (e.target.dataset.acao !== 'arquivo' || !e.target.files[0]) return;
    const lista = lerArquivoGrade(await e.target.files[0].text());
    if (!lista.length) return aviso('Não achei disciplinas no arquivo.');
    adicionarMaterias(lista);
    aviso(`${lista.length} disciplina(s) importada(s).`);
  });
}

function cartaoMateria(m, d) {
  const area = infoArea(estado.curso, m.area);
  const livros = d.livros.filter(l => l.materiaId === m.id).length;
  const desemp = d.quiz.porArea[m.area];
  const pct = desemp && desemp.t ? Math.round((desemp.a / desemp.t) * 100) : null;
  return `
    <button class="materia" data-materia="${m.id}">
      <span class="materia-area">${esc(area.nome)}</span>
      <strong>${esc(m.nome)}</strong>
      <span class="materia-meta">
        <span>${livros} livro${livros === 1 ? '' : 's'}</span>
        <span>${pct === null ? 'sem quiz ainda' : `${pct}% no quiz`}</span>
      </span>
    </button>`;
}

/* Aceita: JSON (lista de nomes ou de {nome, semestre}), CSV/TXT ("Nome;Semestre" ou só o nome) */
function lerArquivoGrade(texto) {
  try {
    const json = JSON.parse(texto);
    const lista = Array.isArray(json) ? json : json.materias || json.disciplinas || [];
    return lista.map(x => typeof x === 'string' ? { nome: x } : { nome: x.nome || x.name, semestre: Number(x.semestre || x.periodo) || 0 })
      .filter(x => x.nome);
  } catch { /* não é JSON: segue como texto */ }
  return texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const [nome, sem] = l.split(/[;,\t]/).map(s => s.trim());
    return { nome, semestre: Number(sem) || 0 };
  }).filter(x => x.nome && !/^(nome|disciplina|materia)$/i.test(x.nome));
}

function adicionarMaterias(lista) {
  const d = dados();
  const existentes = new Set(d.materias.map(m => m.nome.toLowerCase()));
  for (const item of lista) {
    if (existentes.has(item.nome.toLowerCase())) continue;
    d.materias.push({ id: uid(), nome: item.nome, semestre: item.semestre || 0, area: areaDaMateria(estado.curso, item.nome) });
    existentes.add(item.nome.toLowerCase());
  }
  salvar();
  rotear();
}

function formMaterias() {
  const raiz = abrirFolha(`
    <h2>Adicionar disciplinas</h2>
    <form class="form" id="form-materias">
      <label>Disciplinas <small>(uma por linha)</small>
        <textarea name="nomes" rows="5" required placeholder="Anatomia Humana I&#10;Fisiologia I"></textarea>
      </label>
      <label>Semestre
        <input name="semestre" type="number" min="0" max="14" inputmode="numeric" placeholder="Ex.: 2">
      </label>
      <button class="btn primario largo">Adicionar</button>
    </form>
  `);
  $('#form-materias', raiz).addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const sem = Number(f.get('semestre')) || 0;
    const lista = String(f.get('nomes')).split('\n').map(s => s.trim()).filter(Boolean).map(nome => ({ nome, semestre: sem }));
    fecharFolha();
    adicionarMaterias(lista);
  });
}

function abrirMateria(id) {
  const d = dados();
  const m = d.materias.find(x => x.id === id);
  if (!m) return;
  const area = infoArea(estado.curso, m.area);
  const livros = d.livros.filter(l => l.materiaId === m.id);
  const temQuiz = PERGUNTAS[estado.curso].some(p => p.area === m.area);

  const raiz = abrirFolha(`
    <p class="sobretitulo">${esc(area.nome)}${m.semestre ? ` · ${m.semestre}º semestre` : ''}</p>
    <h2>${esc(m.nome)}</h2>

    <h4>${icone('dica')} Dicas para estudar</h4>
    <ul class="lista-dicas">${area.dicas.map(t => `<li>${esc(t)}</li>`).join('')}</ul>

    <h4>Tópicos que mais caem</h4>
    <div class="tags">${area.topicos.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>

    <h4>Livros desta disciplina</h4>
    ${livros.length ? `<ul class="lista-simples">${livros.map(l => `<li>${esc(l.titulo)}<small>${esc(l.autor || '')}</small></li>`).join('')}</ul>` : '<p class="sutil">Nenhum livro ainda. Registre na aba Biblioteca.</p>'}

    <div class="linha-botoes">
      ${temQuiz ? `<a class="btn primario" href="#/quiz?area=${m.area}" data-fechar>${icone('quiz')} Treinar no quiz</a>` : ''}
      <a class="btn" href="#/biblioteca" data-fechar>${icone('livro')} Ver biblioteca</a>
      <button class="btn perigo" data-acao="remover">${icone('lixo')} Remover</button>
    </div>
  `);
  raiz.addEventListener('click', e => {
    if (e.target.closest('[data-fechar]')) fecharFolha();
    if (e.target.closest('[data-acao="remover"]')) {
      if (!confirm(`Remover "${m.nome}"? Os livros ficam na biblioteca, sem disciplina.`)) return;
      d.materias = d.materias.filter(x => x.id !== id);
      d.livros.forEach(l => { if (l.materiaId === id) l.materiaId = null; });
      salvar();
      fecharFolha();
      rotear();
    }
  });
}

/* =========================================================
   2. BIBLIOTECA PESSOAL
   ========================================================= */

let filtroBiblioteca = 'todas';

function telaBiblioteca(tela) {
  const d = dados();
  const nomeMateria = id => d.materias.find(m => m.id === id)?.nome || 'Sem disciplina';
  const livros = d.livros.filter(l => filtroBiblioteca === 'todas' || (l.materiaId || 'nenhuma') === filtroBiblioteca);

  tela.innerHTML = `
    <section class="cabecalho">
      <div>
        <p class="sobretitulo">Biblioteca pessoal</p>
        <h1>Meus livros</h1>
      </div>
      <button class="btn primario" data-acao="novo">${icone('camera')} Registrar</button>
    </section>

    ${d.livros.length ? `
      <div class="chips" role="tablist">
        <button class="chip ${filtroBiblioteca === 'todas' ? 'ativo' : ''}" data-filtro="todas">Todas</button>
        ${d.materias.map(m => `<button class="chip ${filtroBiblioteca === m.id ? 'ativo' : ''}" data-filtro="${m.id}">${esc(m.nome)}</button>`).join('')}
        ${d.livros.some(l => !l.materiaId) ? `<button class="chip ${filtroBiblioteca === 'nenhuma' ? 'ativo' : ''}" data-filtro="nenhuma">Sem disciplina</button>` : ''}
      </div>
      <div class="grade-livros">
        ${livros.map(l => `
          <button class="livro" data-livro="${l.id}">
            ${capa(l)}
            <strong>${esc(l.titulo)}</strong>
            <small>${esc(l.autor || 'Autor não informado')}</small>
            <span class="livro-materia">${esc(nomeMateria(l.materiaId))}</span>
            ${l.resumo ? '<span class="selo">Resumo</span>' : ''}
          </button>`).join('') || '<p class="sutil">Nenhum livro nesta disciplina.</p>'}
      </div>
    ` : `
      <section class="vazio">
        <h3>Registre seus livros físicos</h3>
        <p>Tire uma foto da capa (ou do código de barras), ligue o livro a uma disciplina e monte o resumo dele.</p>
        <button class="btn primario" data-acao="novo">${icone('camera')} Registrar livro</button>
      </section>
    `}
  `;

  tela.addEventListener('click', e => {
    const f = e.target.closest('[data-filtro]');
    if (f) { filtroBiblioteca = f.dataset.filtro; return rotear(); }
    if (e.target.closest('[data-acao="novo"]')) return formLivro();
    const l = e.target.closest('[data-livro]');
    if (l) abrirLivro(l.dataset.livro);
  });
}

/* Capa: foto do usuário ou uma capa gerada com as iniciais */
function capa(l, grande = false) {
  if (l.capa) return `<img class="capa ${grande ? 'grande' : ''}" src="${l.capa}" alt="Capa de ${esc(l.titulo)}">`;
  let h = 0;
  for (const ch of l.titulo) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const iniciais = l.titulo.split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || l.titulo[0];
  return `<div class="capa gerada ${grande ? 'grande' : ''}" style="--h:${h}"><span>${esc(iniciais)}</span></div>`;
}

/* Reduz a foto para caber no armazenamento do aparelho */
function comprimirFoto(arquivo, max = 480) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k);
      cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      ok(cv.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = erro;
    img.src = URL.createObjectURL(arquivo);
  });
}

/* Lê o ISBN (EAN-13) pelo BarcodeDetector, disponível no Chrome para Android */
async function lerIsbn(arquivo) {
  if (!('BarcodeDetector' in window)) return null;
  const detector = new window.BarcodeDetector({ formats: ['ean_13'] });
  const bitmap = await createImageBitmap(arquivo);
  const codigos = await detector.detect(bitmap);
  return codigos.find(c => /^97[89]/.test(c.rawValue))?.rawValue || codigos[0]?.rawValue || null;
}

function formLivro() {
  const d = dados();
  let fotoAtual = null;
  const raiz = abrirFolha(`
    <h2>Registrar livro</h2>
    <form class="form" id="form-livro">
      <div class="foto-campo">
        <div class="foto-preview" id="foto-preview">${icone('camera')}<span>Sem foto</span></div>
        <div class="foto-acoes">
          <label class="btn">${icone('camera')} Foto da capa<input type="file" accept="image/*" capture="environment" hidden id="in-capa"></label>
          <label class="btn">Ler código de barras<input type="file" accept="image/*" capture="environment" hidden id="in-isbn"></label>
          <small class="sutil">O código de barras do livro é o ISBN.</small>
        </div>
      </div>
      <label>Título<input name="titulo" required maxlength="160" autocomplete="off"></label>
      <label>Autor(es)<input name="autor" maxlength="160" autocomplete="off"></label>
      <div class="duas-colunas">
        <label>ISBN<input name="isbn" inputmode="numeric" maxlength="17" autocomplete="off"></label>
        <label>Disciplina
          <select name="materia">
            ${d.materias.map(m => `<option value="${m.id}">${esc(m.nome)}</option>`).join('')}
            <option value="">Sem disciplina</option>
          </select>
        </label>
      </div>
      ${d.materias.length ? '' : '<p class="sutil pequeno">Dica: cadastre suas disciplinas na aba Grade para organizar os livros.</p>'}
      <button class="btn primario largo">Salvar livro</button>
    </form>
  `);

  $('#in-capa', raiz).addEventListener('change', async e => {
    const arq = e.target.files[0];
    if (!arq) return;
    fotoAtual = await comprimirFoto(arq);
    $('#foto-preview', raiz).innerHTML = `<img src="${fotoAtual}" alt="Prévia da capa">`;
  });
  $('#in-isbn', raiz).addEventListener('change', async e => {
    const arq = e.target.files[0];
    if (!arq) return;
    try {
      const isbn = await lerIsbn(arq);
      if (isbn) { raiz.querySelector('[name="isbn"]').value = isbn; aviso(`ISBN lido: ${isbn}`); }
      else aviso('BarcodeDetector indisponível ou código não encontrado. Digite o ISBN.');
    } catch { aviso('Não consegui ler o código. Digite o ISBN.'); }
  });
  $('#form-livro', raiz).addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const livro = {
      id: uid(),
      titulo: String(f.get('titulo')).trim(),
      autor: String(f.get('autor')).trim(),
      isbn: String(f.get('isbn')).replace(/[^0-9Xx]/g, ''),
      materiaId: f.get('materia') || null,
      capa: fotoAtual,
      resumo: '',
      criado: Date.now(),
    };
    d.livros.unshift(livro);
    if (!salvar()) { d.livros.shift(); return; }
    fecharFolha();
    rotear();
    abrirLivro(livro.id);
  });
}

/* Monta um roteiro de resumo a partir dos tópicos e dicas da área da disciplina.
   Ponto de extensão: trocar por uma chamada a uma API de IA no servidor. */
function gerarResumo(livro) {
  const d = dados();
  const m = d.materias.find(x => x.id === livro.materiaId);
  const area = infoArea(estado.curso, m?.area || 'geral');
  return [
    `## ${livro.titulo}`,
    `${livro.autor || 'Autor não informado'} · ${m ? m.nome : 'Sem disciplina'} (${area.nome})`,
    '',
    `### Tópicos mais cobrados em ${area.nome}`,
    ...area.topicos.map(t => `- ${t} — capítulos: ___`),
    '',
    '### Roteiro de leitura',
    '- Leia o sumário e marque os capítulos ligados aos tópicos acima.',
    '- Para cada capítulo: a ideia central em 1 frase, 3 a 5 conceitos-chave e 1 exemplo ou caso.',
    '- No fim, escreva 5 perguntas de revisão e responda sem olhar o livro.',
    '',
    '### Como estudar este conteúdo',
    ...area.dicas.map(t => `- ${t}`),
    '',
    '### Minhas anotações',
    '- ',
  ].join('\n');
}

function abrirLivro(id) {
  const d = dados();
  const l = d.livros.find(x => x.id === id);
  if (!l) return;
  const m = d.materias.find(x => x.id === l.materiaId);

  const desenhar = (editando = false) => {
    const raiz = abrirFolha(`
      <div class="livro-topo">
        ${capa(l, true)}
        <div>
          <p class="sobretitulo">${esc(m ? m.nome : 'Sem disciplina')}</p>
          <h2>${esc(l.titulo)}</h2>
          <p class="sutil">${esc(l.autor || 'Autor não informado')}${l.isbn ? ` · ISBN ${esc(l.isbn)}` : ''}</p>
        </div>
      </div>

      <div class="resumo-cabecalho">
        <h3>Resumo</h3>
        ${l.resumo && !editando ? '<button class="btn pequeno" data-acao="editar">Editar</button>' : ''}
      </div>
      ${editando ? `
        <textarea class="editor-resumo" id="editor" rows="16">${esc(l.resumo)}</textarea>
        <p class="sutil pequeno">Use "## " para títulos, "### " para subtítulos e "- " para listas.</p>
        <div class="linha-botoes">
          <button class="btn primario" data-acao="salvar">Salvar resumo</button>
          <button class="btn" data-acao="cancelar">Cancelar</button>
        </div>
      ` : l.resumo ? `<article class="resumo">${textoParaHtml(l.resumo)}</article>` : `
        <div class="vazio pequeno">
          <p>Gere um roteiro de resumo com os tópicos que mais caem em ${esc(infoArea(estado.curso, m?.area || 'geral').nome)} e complete com suas anotações.</p>
          <div class="linha-botoes centro">
            <button class="btn primario" data-acao="gerar">Gerar roteiro</button>
            <button class="btn" data-acao="branco">Escrever do zero</button>
          </div>
        </div>
      `}

      <div class="linha-botoes">
        <button class="btn perigo" data-acao="remover">${icone('lixo')} Remover livro</button>
      </div>
    `);

    raiz.onclick = e => {
      const acao = e.target.closest('[data-acao]')?.dataset.acao;
      if (acao === 'gerar') { l.resumo = gerarResumo(l); salvar(); desenhar(true); }
      if (acao === 'branco') { l.resumo = `## ${l.titulo}\n\n- `; desenhar(true); }
      if (acao === 'editar') desenhar(true);
      if (acao === 'cancelar') desenhar(false);
      if (acao === 'salvar') { l.resumo = $('#editor', raiz).value; salvar(); desenhar(false); rotear(); }
      if (acao === 'remover' && confirm(`Remover "${l.titulo}"?`)) {
        d.livros = d.livros.filter(x => x.id !== id);
        salvar();
        fecharFolha();
        rotear();
      }
    };
  };
  desenhar(false);
}

/* =========================================================
   3. ACERVO GRATUITO
   ========================================================= */

let filtroAcervo = { tipo: 'todos', busca: '' };

function telaAcervo(tela) {
  tela.innerHTML = `
    <section class="cabecalho">
      <div>
        <p class="sobretitulo">Acesso aberto</p>
        <h1>Acervo grátis</h1>
      </div>
    </section>
    <input class="busca" type="search" placeholder="Buscar no acervo" value="${esc(filtroAcervo.busca)}" aria-label="Buscar no acervo">
    <div class="chips">
      <button class="chip ${filtroAcervo.tipo === 'todos' ? 'ativo' : ''}" data-tipo="todos">Todos</button>
      ${Object.entries(TIPOS_ACERVO).map(([id, nome]) => `<button class="chip ${filtroAcervo.tipo === id ? 'ativo' : ''}" data-tipo="${id}">${nome}</button>`).join('')}
    </div>
    <div id="lista-acervo"></div>
  `;

  const desenharLista = () => {
    const termo = filtroAcervo.busca.toLowerCase();
    const filtra = it => (filtroAcervo.tipo === 'todos' || it.tipo === filtroAcervo.tipo)
      && (!termo || `${it.nome} ${it.desc}`.toLowerCase().includes(termo));
    const doCurso = ACERVO.filter(it => it.cursos.includes(estado.curso) && filtra(it));
    const gerais = ACERVO.filter(it => !it.cursos.length && filtra(it));
    const cartao = it => `
      <a class="recurso" href="${it.url}" target="_blank" rel="noopener noreferrer">
        <span class="recurso-tipo">${TIPOS_ACERVO[it.tipo]}</span>
        <strong>${esc(it.nome)} ${icone('externo', 'mini')}</strong>
        <p>${esc(it.desc)}</p>
      </a>`;
    $('#lista-acervo', tela).innerHTML = `
      ${doCurso.length ? `<h2 class="titulo-bloco">Para ${esc(curso().nome)}</h2><div class="grade-recursos">${doCurso.map(cartao).join('')}</div>` : ''}
      ${gerais.length ? `<h2 class="titulo-bloco">Para todos os cursos</h2><div class="grade-recursos">${gerais.map(cartao).join('')}</div>` : ''}
      ${!doCurso.length && !gerais.length ? '<p class="sutil">Nada encontrado.</p>' : ''}
    `;
  };
  desenharLista();

  $('.busca', tela).addEventListener('input', e => { filtroAcervo.busca = e.target.value; desenharLista(); });
  tela.addEventListener('click', e => {
    const chip = e.target.closest('[data-tipo]');
    if (!chip) return;
    filtroAcervo.tipo = chip.dataset.tipo;
    $$('[data-tipo]', tela).forEach(c => c.classList.toggle('ativo', c === chip));
    desenharLista();
  });
}

/* =========================================================
   4. ATLAS 3D / DIAGRAMAS
   ========================================================= */

function telaAtlas(tela) {
  return curso().visual === 'atlas3d' ? telaAtlas3d(tela) : telaDiagramas(tela);
}

function telaAtlas3d(tela) {
  const fisio = estado.curso === 'fisioterapia';
  const iniciais = fisio ? ['esqueleto', 'musculos', 'tendoes'] : ['esqueleto', 'musculos', 'arterias', 'veias'];
  let atlas = null;
  let ativo = true;

  tela.innerHTML = `
    <section class="cabecalho">
      <div>
        <p class="sobretitulo">${fisio ? 'Sistema musculoesquelético' : 'Anatomia interativa'}</p>
        <h1>Atlas 3D</h1>
      </div>
    </section>
    <div class="atlas">
      <div class="atlas-palco">
        <div class="atlas-canvas" id="atlas-canvas"><div class="carregando">Carregando modelo 3D…</div></div>
        <div class="atlas-controles">
          <button class="btn-icone" data-cmd="esq" aria-label="Girar para a esquerda">⟲</button>
          <button class="btn-icone" data-cmd="mais" aria-label="Aproximar">+</button>
          <button class="btn-icone" data-cmd="menos" aria-label="Afastar">−</button>
          <button class="btn-icone" data-cmd="dir" aria-label="Girar para a direita">⟳</button>
          <button class="btn-icone" data-cmd="reset" aria-label="Voltar à posição inicial">⌂</button>
        </div>
        <p class="atlas-ajuda">Arraste para girar · pinça ou roda para zoom · toque numa estrutura</p>
      </div>
      <aside class="atlas-lado">
        <div class="camadas" id="camadas"></div>
        <div class="cartao ficha" id="ficha"><p class="sutil">Toque numa estrutura do modelo ou escolha na lista abaixo.</p></div>
        <div id="lista-estruturas"></div>
      </aside>
    </div>
  `;

  import('./js/atlas3d.js').then(async ({ criarAtlas, CAMADAS, ESTRUTURAS }) => {
    const visiveis = new Set(iniciais);
    const desenharCamadas = () => {
      $('#camadas', tela).innerHTML = Object.entries(CAMADAS).map(([id, c]) => `
        <button class="camada ${visiveis.has(id) ? 'ativa' : ''}" data-camada="${id}" style="--c:${c.cor}" aria-pressed="${visiveis.has(id)}">
          <span class="camada-cor"></span>${c.nome}
        </button>`).join('');
    };
    desenharCamadas();
    $('#lista-estruturas', tela).innerHTML = Object.entries(CAMADAS).map(([cid, c]) => `
      <details class="grupo-estruturas">
        <summary><span class="camada-cor" style="--c:${c.cor}"></span>${c.nome}</summary>
        ${Object.entries(ESTRUTURAS).filter(([, e]) => e.camada === cid).map(([id, e]) => `<button class="estrutura" data-estrutura="${id}">${e.nome}</button>`).join('')}
      </details>`).join('');

    const mostrarFicha = e => {
      $('#ficha', tela).innerHTML = e
        ? `<p class="sobretitulo">${CAMADAS[e.camada].nome}</p><h3>${e.nome}</h3><p>${e.desc}</p>`
        : '<p class="sutil">Toque numa estrutura do modelo ou escolha na lista abaixo.</p>';
    };

    try {
      const alvo = $('#atlas-canvas', tela);
      const criado = await criarAtlas(alvo, { camadasIniciais: iniciais, aoSelecionar: mostrarFicha });
      if (!ativo) return criado.destruir();
      atlas = criado;
      $('.carregando', alvo)?.remove();
    } catch (err) {
      console.error(err);
      $('#atlas-canvas', tela).innerHTML = '<div class="carregando">Não foi possível abrir o 3D (sem internet ou WebGL desligado). Use a lista de estruturas ao lado.</div>';
    }

    tela.addEventListener('click', e => {
      const cam = e.target.closest('[data-camada]');
      if (cam) {
        const id = cam.dataset.camada;
        visiveis.has(id) ? visiveis.delete(id) : visiveis.add(id);
        atlas?.mostrarCamada(id, visiveis.has(id));
        desenharCamadas();
      }
      const est = e.target.closest('[data-estrutura]');
      if (est) {
        const id = est.dataset.estrutura;
        if (atlas) {
          visiveis.add(atlas.selecionar(id));
          desenharCamadas();
        } else {
          mostrarFicha({ id, ...ESTRUTURAS[id] });
        }
        $('#ficha', tela).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      const cmd = e.target.closest('[data-cmd]')?.dataset.cmd;
      if (cmd && atlas) {
        ({ esq: () => atlas.girar(-0.5), dir: () => atlas.girar(0.5), mais: () => atlas.zoom(0.85), menos: () => atlas.zoom(1.18), reset: () => atlas.resetar() })[cmd]();
      }
    });
  });

  return () => { ativo = false; atlas?.destruir(); };
}

function telaDiagramas(tela) {
  const lista = DIAGRAMAS[estado.curso];
  let atual = lista[0];
  const direito = estado.curso === 'direito';

  tela.innerHTML = `
    <section class="cabecalho">
      <div>
        <p class="sobretitulo">${direito ? 'Procedimentos e fases' : 'Arquitetura e redes'}</p>
        <h1>${curso().abaVisual} interativos</h1>
      </div>
    </section>
    <div class="chips">${lista.map(dg => `<button class="chip ${dg === atual ? 'ativo' : ''}" data-diagrama="${dg.id}">${esc(dg.titulo)}</button>`).join('')}</div>
    <div class="atlas">
      <div class="diagrama-palco"><div class="diagrama-rolagem" id="diagrama"></div><p class="diagrama-dica">Deslize para os lados para ver o diagrama inteiro</p></div>
      <aside class="atlas-lado">
        <div class="cartao ficha" id="ficha"></div>
      </aside>
    </div>
  `;

  const fichaVazia = () => { $('#ficha', tela).innerHTML = `<h3>${esc(atual.titulo)}</h3><p class="sutil">Toque em uma etapa do diagrama para ver a explicação${direito ? ' e os artigos de lei' : ''}.</p>`; };
  const desenhar = () => {
    desenharDiagrama($('#diagrama', tela), atual, no => {
      $('#ficha', tela).innerHTML = `<p class="sobretitulo">${esc(atual.titulo)}</p><h3>${esc(no.rotulo)}</h3><p>${esc(no.info)}</p>`;
    });
    fichaVazia();
    // No celular o diagrama é mais largo que a tela: começa centralizado
    const rolagem = $('#diagrama', tela);
    rolagem.scrollLeft = (rolagem.scrollWidth - rolagem.clientWidth) / 2;
  };
  desenhar();

  tela.addEventListener('click', e => {
    const chip = e.target.closest('[data-diagrama]');
    if (!chip) return;
    atual = lista.find(x => x.id === chip.dataset.diagrama);
    $$('[data-diagrama]', tela).forEach(c => c.classList.toggle('ativo', c === chip));
    desenhar();
  });
}

/* =========================================================
   5. QUIZ GAMIFICADO (adaptativo)
   ========================================================= */

const TAMANHO_RODADA = 10;
const nivelDoXp = xp => {
  const nivel = Math.floor(Math.sqrt(xp / 50)) + 1;
  const base = 50 * (nivel - 1) ** 2;
  const prox = 50 * nivel ** 2;
  return { nivel, progresso: (xp - base) / (prox - base), falta: prox - xp };
};
function precisaoGeral(quiz) {
  let a = 0, t = 0;
  for (const v of Object.values(quiz.porArea)) { a += v.a; t += v.t; }
  return t ? Math.round((a / t) * 100) : null;
}

function telaQuiz(tela) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const d = dados();
  const banco = PERGUNTAS[estado.curso];
  const areasComPergunta = [...new Set(banco.map(p => p.area))];
  const areasDaGrade = [...new Set(d.materias.map(m => m.area))].filter(a => areasComPergunta.includes(a));
  let modo = params.get('area') && areasComPergunta.includes(params.get('area')) ? params.get('area') : 'grade';

  const inicio = () => {
    const nv = nivelDoXp(d.quiz.xp);
    tela.innerHTML = `
      <section class="cabecalho">
        <div>
          <p class="sobretitulo">Quiz adaptativo</p>
          <h1>Desafio de ${esc(curso().nome)}</h1>
        </div>
      </section>

      <section class="cartao nivel">
        <div class="nivel-num"><span>${nv.nivel}</span><small>nível</small></div>
        <div class="nivel-info">
          <div class="barra"><span style="width:${Math.round(nv.progresso * 100)}%"></span></div>
          <p class="sutil">${d.quiz.xp} XP · faltam ${nv.falta} XP para o nível ${nv.nivel + 1} · recorde ${d.quiz.melhor} pts</p>
        </div>
      </section>

      <h2 class="titulo-bloco">O que treinar</h2>
      <div class="chips">
        <button class="chip ${modo === 'grade' ? 'ativo' : ''}" data-modo="grade">${areasDaGrade.length ? 'Minha grade' : 'Tudo'}</button>
        ${areasComPergunta.map(a => `<button class="chip ${modo === a ? 'ativo' : ''}" data-modo="${a}">${esc(infoArea(estado.curso, a).nome)}</button>`).join('')}
      </div>
      <p class="sutil pequeno">A dificuldade sobe quando você acerta em sequência e desce quando erra. Áreas em que você vai pior aparecem mais.</p>
      <button class="btn primario largo grande" data-acao="comecar">${icone('quiz')} Começar rodada</button>

      ${Object.keys(d.quiz.porArea).length ? `
        <h2 class="titulo-bloco">Desempenho por área</h2>
        <div class="desempenho">
          ${Object.entries(d.quiz.porArea).map(([a, v]) => {
            const pct = Math.round((v.a / v.t) * 100);
            return `<div class="desemp-linha"><span>${esc(infoArea(estado.curso, a).nome)}</span><div class="barra ${pct < 50 ? 'fraca' : ''}"><span style="width:${pct}%"></span></div><b>${pct}%</b></div>`;
          }).join('')}
        </div>` : ''}
    `;
    tela.onclick = e => {
      const chip = e.target.closest('[data-modo]');
      if (chip) {
        modo = chip.dataset.modo;
        $$('[data-modo]', tela).forEach(c => c.classList.toggle('ativo', c === chip));
      }
      if (e.target.closest('[data-acao="comecar"]')) jogar();
    };
  };

  /* Motor adaptativo */
  const jogar = () => {
    const areas = modo === 'grade' ? (areasDaGrade.length ? areasDaGrade : areasComPergunta) : [modo];
    const pool = banco.filter(p => areas.includes(p.area));
    const total = Math.min(TAMANHO_RODADA, pool.length);
    const precisao = precisaoGeral(d.quiz);
    const r = { feitas: new Set(), n: 0, pontos: 0, acertos: 0, seq: 0, seqMax: 0, dif: precisao !== null && precisao >= 70 ? 2 : 1, erros: [], xpAntes: d.quiz.xp };

    const proxima = () => {
      const restantes = pool.filter(p => !r.feitas.has(p));
      // Prefere o nível atual; sem perguntas nele, pega o nível mais próximo
      const menorDist = Math.min(...restantes.map(p => Math.abs(p.nivel - r.dif)));
      const candidatas = restantes.filter(p => Math.abs(p.nivel - r.dif) === menorDist);
      // Peso maior para áreas com menos acertos
      const peso = p => {
        const v = d.quiz.porArea[p.area];
        const acc = v && v.t ? v.a / v.t : 0.5;
        return 1 + (1 - acc) * 2;
      };
      let x = Math.random() * candidatas.reduce((s, p) => s + peso(p), 0);
      for (const p of candidatas) { x -= peso(p); if (x <= 0) return p; }
      return candidatas[candidatas.length - 1];
    };

    const mostrar = () => {
      if (r.n >= total) return fim();
      const p = proxima();
      r.feitas.add(p);
      r.n++;
      // Embaralha as opções mantendo a resposta certa
      const ordem = p.opcoes.map((_, i) => i).sort(() => Math.random() - 0.5);

      tela.innerHTML = `
        <div class="quiz-topo">
          <span>Pergunta ${r.n}/${total}</span>
          <span class="estrelas" aria-label="Dificuldade ${p.nivel} de 3">${'★'.repeat(p.nivel)}${'☆'.repeat(3 - p.nivel)}</span>
          <span class="pontos" id="pontos">${r.pontos} pts</span>
        </div>
        <div class="barra fina"><span style="width:${((r.n - 1) / total) * 100}%"></span></div>
        <section class="cartao pergunta">
          <p class="sobretitulo">${esc(infoArea(estado.curso, p.area).nome)}${r.seq >= 2 ? ` · 🔥 ${r.seq} seguidas` : ''}</p>
          <h2>${esc(p.p)}</h2>
          <div class="opcoes">
            ${ordem.map((i, k) => `<button class="opcao" data-i="${i}"><span class="letra">${'ABCD'[k]}</span>${esc(p.opcoes[i])}</button>`).join('')}
          </div>
          <div id="explicacao"></div>
        </section>
      `;

      tela.onclick = e => {
        const btn = e.target.closest('.opcao');
        if (btn && !btn.disabled) responder(p, Number(btn.dataset.i), btn);
        if (e.target.closest('[data-acao="proxima"]')) mostrar();
      };
    };

    const responder = (p, escolha, btn) => {
      const certo = escolha === p.c;
      $$('.opcao', tela).forEach(b => {
        b.disabled = true;
        if (Number(b.dataset.i) === p.c) b.classList.add('correta');
      });
      const stats = (d.quiz.porArea[p.area] ||= { a: 0, t: 0 });
      stats.t++;

      if (certo) {
        stats.a++;
        r.acertos++;
        r.seq++;
        r.seqMax = Math.max(r.seqMax, r.seq);
        const ganho = 10 * p.nivel + Math.min(r.seq - 1, 5) * 2;
        r.pontos += ganho;
        btn.classList.add('certa-escolhida');
        flutuar(btn, `+${ganho}`);
        confete(btn);
        if (r.seq >= 2 && r.dif < 3) r.dif++;
      } else {
        btn.classList.add('errada');
        r.seq = 0;
        r.dif = Math.max(1, r.dif - 1);
        r.erros.push(p);
        navigator.vibrate?.(120);
      }
      $('#pontos', tela).textContent = `${r.pontos} pts`;
      $('#explicacao', tela).innerHTML = `
        <div class="explicacao ${certo ? 'ok' : 'nao'}">
          <strong>${certo ? 'Acertou!' : 'Não foi dessa vez.'}</strong>
          <p>${esc(p.exp)}</p>
        </div>
        <button class="btn primario largo" data-acao="proxima">${r.n >= total ? 'Ver resultado' : 'Próxima'}</button>`;
      salvar();
    };

    const fim = () => {
      const nivelAntes = nivelDoXp(r.xpAntes).nivel;
      d.quiz.xp += r.pontos;
      d.quiz.rodadas++;
      const recorde = r.pontos > d.quiz.melhor;
      if (recorde) d.quiz.melhor = r.pontos;
      salvar();
      const nv = nivelDoXp(d.quiz.xp);
      tela.innerHTML = `
        <section class="cartao resultado">
          <p class="sobretitulo">Fim da rodada</p>
          <div class="placar">${r.pontos}<small>pts</small></div>
          <p>${r.acertos} de ${total} certas · melhor sequência ${r.seqMax}</p>
          ${recorde ? '<p class="destaque">🏆 Novo recorde!</p>' : ''}
          ${nv.nivel > nivelAntes ? `<p class="destaque">⬆️ Você subiu para o nível ${nv.nivel}!</p>` : ''}
          <div class="linha-botoes centro">
            <button class="btn primario" data-acao="denovo">Jogar de novo</button>
            <button class="btn" data-acao="inicio">Voltar</button>
          </div>
        </section>
        ${r.erros.length ? `
          <h2 class="titulo-bloco">Revise o que errou</h2>
          ${r.erros.map(p => `<div class="cartao revisao"><strong>${esc(p.p)}</strong><p>✔ ${esc(p.opcoes[p.c])}</p><p class="sutil">${esc(p.exp)}</p></div>`).join('')}` : ''}
      `;
      if (r.acertos === total) confete($('.placar', tela), 40);
      tela.onclick = e => {
        if (e.target.closest('[data-acao="denovo"]')) jogar();
        if (e.target.closest('[data-acao="inicio"]')) inicio();
      };
    };

    mostrar();
  };

  inicio();
  return () => { tela.onclick = null; };
}

/* Animações de feedback */
function flutuar(alvo, texto) {
  const el = document.createElement('span');
  el.className = 'flutua';
  el.textContent = texto;
  alvo.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function confete(alvo, qtd = 18) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = alvo.getBoundingClientRect();
  const cores = ['#2dd4bf', '#facc15', '#f472b6', '#60a5fa', '#a3e635'];
  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('i');
    p.className = 'confete';
    p.style.left = `${r.left + r.width / 2}px`;
    p.style.top = `${r.top + r.height / 2}px`;
    p.style.background = cores[i % cores.length];
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
    p.style.setProperty('--dy', `${-60 - Math.random() * 160}px`);
    p.style.setProperty('--rot', `${Math.random() * 720}deg`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

/* ---------------- PWA: service worker e instalação ---------------- */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
let pedidoInstalacao = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pedidoInstalacao = e;
  $('#btn-instalar').hidden = false;
});
$('#btn-instalar').addEventListener('click', async () => {
  if (!pedidoInstalacao) return;
  pedidoInstalacao.prompt();
  await pedidoInstalacao.userChoice;
  pedidoInstalacao = null;
  $('#btn-instalar').hidden = true;
});

/* ---------------- Início ---------------- */

aplicarTema();
if (estado.curso && CURSOS[estado.curso]) {
  aplicarCurso();
  rotear();
} else {
  estado.curso = null;
  escolherCurso({ primeiraVez: true });
}
