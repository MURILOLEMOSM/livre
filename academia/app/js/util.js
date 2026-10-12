// Utilitários do app: DOM, formatação, avisos, folhas, som e gráficos
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Datas ----------
export const hojeISO = (d = new Date()) => {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export const paraData = iso => { const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
export const somaDias = (iso, n) => { const d = paraData(iso); d.setDate(d.getDate() + n); return hojeISO(d); };
export const difDias = (a, b) => Math.round((paraData(b) - paraData(a)) / 864e5);
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_L = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const DIAS_L = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const dataCurta = iso => { const d = paraData(iso); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
export const dataLonga = iso => { const d = paraData(iso); return `${d.getDate()} de ${MESES_L[d.getMonth()]}`; };
export const mesAno = d => `${MESES_L[d.getMonth()]} ${d.getFullYear()}`;
export const relativo = ts => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'ontem' : `${d} dias`;
};
export const mmss = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const brl = n => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const num = n => String(Math.round(n * 10) / 10).replace('.', ',');

// ---------- Avisos ----------
export function toast(texto) {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = texto;
  box.append(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.remove(), 2800);
}

// ---------- Folha inferior (modal) ----------
export function folha(html, aoAbrir, aoFechar) {
  const fundo = document.createElement('div');
  fundo.className = 'fundo-folha';
  fundo.innerHTML = `<div class="folha" role="dialog" aria-modal="true">${html}</div>`;
  const anterior = document.activeElement;
  let fechada = false;
  const fechar = () => {
    if (fechada) return;
    fechada = true;
    aoFechar?.();
    fundo.classList.add('sai');
    setTimeout(() => fundo.remove(), 180);
    document.removeEventListener('keydown', esc_);
    anterior?.focus?.();
  };
  const esc_ = e => { if (e.key === 'Escape') fechar(); };
  fundo.addEventListener('click', e => { if (e.target === fundo || e.target.closest('[data-fechar]')) fechar(); });
  document.addEventListener('keydown', esc_);
  document.body.append(fundo);
  const f = $('.folha', fundo);
  setTimeout(() => (f.querySelector('input, select, textarea, button:not([data-fechar])') || f).focus?.(), 50);
  aoAbrir?.(f, fechar);
  return fechar;
}

export function confirmar(titulo, texto, rotulo = 'Confirmar', perigo = false) {
  return new Promise(res => {
    let ok = false;
    folha(`<h2>${esc(titulo)}</h2><p class="sub">${esc(texto)}</p>
      <div class="btns" style="margin-top:16px"><button class="btn sec" data-fechar>Voltar</button><button class="btn ${perigo ? 'coral' : ''}" data-ok>${esc(rotulo)}</button></div>`,
    (f, fechar) => { f.querySelector('[data-ok]').onclick = () => { ok = true; fechar(); }; },
    () => res(ok));
  });
}

// ---------- Som e vibração ----------
let ctx;
export function bip(freq = 880, dur = .15, vezes = 1) {
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < vezes; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * (dur + .08);
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + .02);
    }
  } catch {}
}
export const vibrar = p => { try { navigator.vibrate?.(p); } catch {} };

// ---------- Confete ----------
export function confete(x = innerWidth / 2, y = innerHeight / 3) {
  if (reduz()) return;
  const cores = ['#c6ff3d', '#3dffb0', '#f4f1ea', '#ff6b4a'];
  for (let i = 0; i < 46; i++) {
    const c = document.createElement('i');
    c.className = 'confete';
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 180;
    Object.assign(c.style, { left: x + 'px', top: y + 'px', background: cores[i % 4] });
    c.style.setProperty('--dx', Math.cos(a) * d + 'px');
    c.style.setProperty('--dy', Math.sin(a) * d + 160 + 'px');
    c.style.setProperty('--r', Math.random() * 720 + 'deg');
    document.body.append(c);
    c.addEventListener('animationend', () => c.remove());
  }
}

// ---------- Arquivos ----------
export function baixar(nome, conteudo, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export function ics({ titulo, local, inicio, fim, desc }) {
  const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Livre Fit//App//PT', 'BEGIN:VEVENT', `UID:${uid()}@livrefit`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(inicio)}`, `DTEND:${f(fim)}`, `SUMMARY:${titulo}`, `LOCATION:${local}`, `DESCRIPTION:${desc || ''}`,
    'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', `DESCRIPTION:${titulo}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
export const copiar = async texto => { try { await navigator.clipboard.writeText(texto); toast('Copiado!'); } catch { toast(texto); } };

// Reduz uma foto para caber no armazenamento do navegador
export function reduzirFoto(arquivo, max = 720) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(arquivo);
  });
}

// ---------- Gráfico de linha simples (SVG) ----------
export function grafico(pontos, { sufixo = '', casas = 1 } = {}) {
  if (pontos.length < 2) return '<p class="sub peq">Registre pelo menos duas medidas para ver o gráfico.</p>';
  const W = 320, H = 160, P = { l: 30, r: 12, t: 14, b: 22 };
  const vs = pontos.map(p => p.v), min = Math.min(...vs), max = Math.max(...vs), faixa = max - min || 1;
  const x = i => P.l + (i * (W - P.l - P.r)) / (pontos.length - 1);
  const y = v => P.t + (1 - (v - min) / faixa) * (H - P.t - P.b);
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const area = `${d} L${x(pontos.length - 1)} ${H - P.b} L${P.l} ${H - P.b} Z`;
  const f = v => v.toFixed(casas).replace('.', ',');
  return `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de ${f(pontos[0].v)} a ${f(pontos.at(-1).v)}${sufixo}">
    <defs><linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c6ff3d" stop-opacity=".3"/><stop offset="1" stop-color="#c6ff3d" stop-opacity="0"/></linearGradient></defs>
    <line class="eixo" x1="${P.l}" y1="${H - P.b}" x2="${W - P.r}" y2="${H - P.b}"/>
    <text x="2" y="${y(max) + 4}">${f(max)}</text><text x="2" y="${y(min) + 4}">${f(min)}</text>
    <path class="area" d="${area}"/><path class="serie" d="${d}"/>
    ${pontos.map((p, i) => `<circle class="ponto" cx="${x(i)}" cy="${y(p.v)}" r="3.5"/>`).join('')}
    <text x="${P.l}" y="${H - 6}">${esc(pontos[0].r)}</text><text x="${W - P.r}" y="${H - 6}" text-anchor="end">${esc(pontos.at(-1).r)}</text>
  </svg>`;
}

// ---------- Ícones (traço próprio, 24x24) ----------
const P = {
  casa: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  halter: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sino: '<path d="M6 17V11a6 6 0 1 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v7h-4M14 21v-3"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pausa: '<path d="M8 5v14M16 5v14"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  carteira: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  estrela: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  coracao: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  balao: '<path d="M4 5h16v11H9l-5 4z"/>',
  relogio: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  ajuste: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  mapa: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  doc: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  presente: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z"/>',
  saude: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z"/><path d="M8 12h2.5l1.5-3 2 5 1.5-2H18"/>',
  raio: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  seta: '<path d="M9 5l7 7-7 7"/>',
  nota: '<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  foto: '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
  sair: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  trofeu: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
  fogo: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-10-1.5 2-2 3.5-2 5-1-1-2-2.5-2-4.5C7 8 5 11 5 15c0 4.3 3 7 7 7z"/>',
  lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  baixar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  pular: '<path d="M5 5l9 7-9 7zM18 5v14"/>',
  lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M10 2h4"/>',
};
export const ic = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[n] || ''}</svg>`;
export const SIMBOLO = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M53.25 26.31A22 22 0 1 1 37.69 10.75" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><circle cx="53.9" cy="10.1" r="6.5" fill="currentColor"/></svg>`;
