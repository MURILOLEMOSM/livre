// Utilidades pequenas usadas por todas as telas

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Escapa texto vindo do usuário antes de ir para o HTML
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

let toastTimer;
export function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// Folha inferior (dialog). Retorna o elemento do corpo para ligar eventos.
export function openSheet(title, html) {
  const dlg = $('#sheet');
  const body = $('#sheetBody');
  body.innerHTML = `<div class="sheet-head"><h2>${esc(title)}</h2><button type="button" class="x" data-close aria-label="Fechar">×</button></div>${html}`;
  body.querySelector('[data-close]').onclick = closeSheet;
  if (!dlg.open) dlg.showModal();
  dlg.onclick = e => { if (e.target === dlg) closeSheet(); };
  return body;
}
export function closeSheet() {
  const dlg = $('#sheet');
  if (dlg.open) dlg.close();
}

// localStorage com JSON e tolerante a falhas (modo privado etc.)
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('fp:' + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('fp:' + key, JSON.stringify(value)); } catch { /* sem espaço ou bloqueado */ }
  },
};

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copiado'); }
  catch { toast('Não consegui copiar; selecione e copie manualmente'); }
}

// Compartilha pelo menu do celular; sem suporte, abre o WhatsApp
export async function shareText(title, text) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}
