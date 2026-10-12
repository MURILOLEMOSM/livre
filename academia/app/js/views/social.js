import { $, $$, esc, ic, toast, folha, confirmar, relativo, reduzirFoto, uid, confete } from '../util.js';
import { S, mudar, estatisticas, notificar } from '../store.js';
import { MEMBROS, DESAFIOS, UNIDADE } from '../data.js';

let aba = 'timeline';

const pessoa = id => id === 'eu' ? { nome: S().user.nome || 'Você', cor: '#c6ff3d' }
  : id === 'staff' ? { nome: 'Equipe ' + UNIDADE.nome, cor: '#f4f1ea' }
  : MEMBROS.find(m => m.id === id) || { nome: 'Aluno', cor: '#9aa3b2' };
const iniciais = n => n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
const avatar = (id, cls = '') => { const p = pessoa(id); return `<span class="av ${cls}" style="background:${p.cor}">${esc(iniciais(p.nome))}</span>`; };

function progresso(d, st) {
  return Math.min(d.meta, d.tipo === 'treinos' ? st.treinosMes : d.tipo === 'aulas' ? st.aulasMes : st.goMes);
}

export function tela() {
  const s = S(), st = estatisticas();
  let corpo = '';
  if (aba === 'timeline') {
    corpo = `
    <form class="card" id="novo">
      <div class="linha" style="align-items:flex-start">${avatar('eu')}
        <textarea class="inp" name="texto" maxlength="500" placeholder="Compartilhe seu treino, uma conquista ou chame a galera…" style="min-height:70px"></textarea></div>
      <img id="prev" alt="" hidden style="width:100%;border-radius:12px;margin-top:10px">
      <div class="entre" style="margin-top:10px">
        <label class="btn peq sec" style="cursor:pointer">${ic('foto')} Foto<input type="file" accept="image/*" name="foto" class="sr"></label>
        <button class="btn peq">Publicar</button>
      </div>
    </form>
    <div class="lista" style="margin-top:12px">
    ${s.posts.map(p => { const eu = p.curtidas.includes('eu'); return `<article class="card post">
      <div class="cab">${avatar(p.autor)}<div class="cresce" style="flex:1"><b>${esc(pessoa(p.autor).nome)}</b><div class="sub peq">${relativo(p.ts)}${p.autor === 'staff' ? ' · aviso oficial' : ''}</div></div>
        ${p.autor === 'eu' ? `<button class="icone-btn" data-apagar="${p.id}" aria-label="Apagar post">${ic('lixo')}</button>` : ''}</div>
      ${p.texto ? `<div class="txt">${esc(p.texto)}</div>` : ''}
      ${p.foto ? `<img src="${p.foto}" alt="Foto do post de ${esc(pessoa(p.autor).nome)}" loading="lazy">` : ''}
      <div class="acoes">
        <button data-curtir="${p.id}" aria-pressed="${eu}">${ic('coracao', eu ? 'fill="currentColor"' : '')} ${p.curtidas.length || ''}</button>
        <button data-comentar="${p.id}">${ic('balao')} ${p.coments.length || ''}</button>
      </div>
      ${p.coments.length ? `<div class="coments">${p.coments.slice(-3).map(c => `<p><b>${esc(pessoa(c.autor).nome)}</b> ${esc(c.texto)}</p>`).join('')}</div>` : ''}
    </article>`; }).join('')}
    </div>`;
  } else if (aba === 'desafios') {
    corpo = `<div class="lista">${DESAFIOS.map(d => {
      const dentro = !!s.desafios[d.id], prog = progresso(d, st), ok = prog >= d.meta;
      return `<div class="card desafio">
        <div class="entre"><b>${esc(d.nome)}</b>${ok && dentro ? '<span class="chip lima">Concluído</span>' : `<span class="chip">${dentro ? 'Participando' : 'Aberto'}</span>`}</div>
        <div class="sub peq">Prêmio: ${esc(d.premio)} · ${12 + d.meta * 3} alunos participando</div>
        ${dentro ? `<div class="barra"><i style="width:${prog / d.meta * 100}%"></i></div><div class="entre peq"><span>${prog} de ${d.meta} ${d.unidade}</span><button class="link" data-sairdes="${d.id}">Sair</button></div>`
          : `<button class="btn peq" style="margin-top:12px" data-entrar="${d.id}">Participar</button>`}
      </div>`; }).join('')}</div>`;
  } else {
    const rank = [...MEMBROS.map(m => ({ id: m.id, n: m.treinos })), { id: 'eu', n: st.treinosMes }].sort((a, b) => b.n - a.n);
    corpo = `
    <div class="secao" style="margin-top:4px"><h2>Ranking da unidade</h2><span class="sub peq">treinos no mês</span></div>
    <div class="card"><ol class="rank">${rank.map(r => `<li class="${r.id === 'eu' ? 'eu' : ''}">${avatar(r.id)}<span class="cresce" style="flex:1">${esc(pessoa(r.id).nome)}${r.id === 'eu' ? ' (você)' : ''}</span><b class="num">${r.n}</b></li>`).join('')}</ol></div>
    <div class="secao"><h2>Pessoas da unidade</h2><span class="sub peq">${s.amigos.length} amigos</span></div>
    <div class="lista">${MEMBROS.map(m => { const am = s.amigos.includes(m.id); return `<div class="card linha">${avatar(m.id)}<div class="cresce"><b>${esc(m.nome)}</b><div class="sub peq">${m.treinos} treinos este mês</div></div>
      <button class="btn peq ${am ? 'sec' : ''}" data-amigo="${m.id}">${am ? 'Amigos ✓' : 'Adicionar'}</button></div>`; }).join('')}</div>`;
  }
  return {
    titulo: 'Comunidade',
    html: `<div class="seg" role="tablist" style="margin-bottom:12px">${[['timeline', 'Timeline'], ['desafios', 'Desafios'], ['pessoas', 'Pessoas']].map(([k, n]) => `<button role="tab" aria-selected="${k === aba}" data-aba="${k}">${n}</button>`).join('')}</div>${corpo}
      <p class="sub peq" style="margin-top:16px;text-align:center">Demonstração: os outros alunos são fictícios e seus posts ficam só neste aparelho.</p>`,
    ligar(m) {
      const re = () => dispatchEvent(new HashChangeEvent('hashchange'));
      $$('[data-aba]', m).forEach(b => b.onclick = () => { aba = b.dataset.aba; re(); });

      const form = $('#novo', m);
      if (form) {
        let foto = null;
        form.foto.onchange = async () => {
          const arq = form.foto.files[0]; if (!arq) return;
          try { foto = await reduzirFoto(arq); const p = $('#prev', m); p.src = foto; p.hidden = false; }
          catch { toast('Não consegui abrir essa imagem.'); }
        };
        form.onsubmit = e => {
          e.preventDefault();
          const texto = form.texto.value.trim();
          if (!texto && !foto) { toast('Escreva algo ou escolha uma foto.'); return; }
          mudar(s => { s.posts.unshift({ id: uid(), autor: 'eu', ts: Date.now(), texto, foto, curtidas: [], coments: [] }); });
          if (!S().posts.find(p => p.autor === 'eu' && p.ts < Date.now() - 1000)) confete();
          toast('Publicado na timeline da unidade!');
          // um colega reage depois de alguns segundos, para a demo ficar viva
          setTimeout(() => {
            mudar(s => { const p = s.posts.find(x => x.autor === 'eu'); if (p && !p.curtidas.includes('m1')) { p.curtidas.push('m1'); notificar('Carol Mendes curtiu seu post', texto.slice(0, 60) || 'Sua foto', 'social', '#/social'); } });
          }, 4000);
          re();
        };
      }
      $$('[data-curtir]', m).forEach(b => b.onclick = () => {
        mudar(s => { const p = s.posts.find(x => x.id === b.dataset.curtir); const i = p.curtidas.indexOf('eu'); i < 0 ? p.curtidas.push('eu') : p.curtidas.splice(i, 1); });
        re();
      });
      $$('[data-comentar]', m).forEach(b => b.onclick = () => {
        const p = S().posts.find(x => x.id === b.dataset.comentar);
        folha(`<h2>Comentários</h2>
          <div class="lista" style="margin:12px 0">${p.coments.map(c => `<div class="linha">${avatar(c.autor)}<div><b>${esc(pessoa(c.autor).nome)}</b><div>${esc(c.texto)}</div></div></div>`).join('') || '<p class="sub">Seja o primeiro a comentar.</p>'}</div>
          <form id="fc" class="linha"><input class="inp cresce" name="t" maxlength="200" placeholder="Escreva um comentário" aria-label="Comentário"><button class="btn">Enviar</button></form>`, (f, fechar) => {
          $('#fc', f).onsubmit = e => {
            e.preventDefault();
            const t = e.target.t.value.trim(); if (!t) return;
            mudar(s => { s.posts.find(x => x.id === p.id).coments.push({ autor: 'eu', texto: t }); });
            fechar(); re();
          };
        });
      });
      $$('[data-apagar]', m).forEach(b => b.onclick = async () => {
        if (!await confirmar('Apagar post?', 'Ele some da timeline.', 'Apagar', true)) return;
        mudar(s => { s.posts = s.posts.filter(x => x.id !== b.dataset.apagar); }); re();
      });
      $$('[data-entrar]', m).forEach(b => b.onclick = () => { mudar(s => { s.desafios[b.dataset.entrar] = true; }); toast('Você entrou no desafio. Bora!'); re(); });
      $$('[data-sairdes]', m).forEach(b => b.onclick = () => { mudar(s => { delete s.desafios[b.dataset.sairdes]; }); re(); });
      $$('[data-amigo]', m).forEach(b => b.onclick = () => {
        mudar(s => { const i = s.amigos.indexOf(b.dataset.amigo); i < 0 ? s.amigos.push(b.dataset.amigo) : s.amigos.splice(i, 1); });
        re();
      });
    },
  };
}
