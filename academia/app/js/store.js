// Estado do app, salvo no navegador (demonstração: nada vai para um servidor)
import { FICHAS_INICIAIS, EXERCICIOS, PLANOS } from './data.js';
import { hojeISO, somaDias, uid, paraData, difDias } from './util.js';

const CHAVE = 'lfapp:v1';
let estado = null;
const ouvintes = new Set();

export const S = () => estado;
export const ouvir = fn => (ouvintes.add(fn), () => ouvintes.delete(fn));

export function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); }
  catch { /* armazenamento cheio ou bloqueado: segue em memória */ }
  ouvintes.forEach(fn => fn(estado));
}
export function mudar(fn) { fn(estado); salvar(); }

export function carregar() {
  try { estado = JSON.parse(localStorage.getItem(CHAVE)); } catch { estado = null; }
  if (!estado || estado.versao !== 1) estado = semente();
  return estado;
}
export function apagarTudo() {
  try { localStorage.removeItem(CHAVE); } catch {}
  estado = semente();
  salvar();
}

// Dados de exemplo para a primeira abertura
function semente() {
  const hoje = hojeISO();
  const fichas = FICHAS_INICIAIS.map(f => ({
    id: f.id, nome: f.nome, foco: f.foco, vence: somaDias(hoje, 38), professor: 'Prof. Carla',
    exercicios: f.itens.map(([ex, series, reps, desc, carga]) => ({ id: uid(), ex, series, reps, desc, carga })),
  }));

  // Histórico de treinos e check-ins nas últimas semanas
  const historico = [], checkins = [], cargas = {};
  const ciclo = ['A', 'B', 'C'];
  let n = 0;
  for (let d = 34; d >= 1; d--) {
    const dia = somaDias(hoje, -d), sem = paraData(dia).getDay();
    if (sem === 0 || (d % 7 === 3)) continue;
    if (d > 20 && d % 2) continue;
    const id = ciclo[n++ % 3];
    const ficha = fichas.find(f => f.id === id);
    let volume = 0;
    const prog = Math.floor((34 - d) / 10);
    for (const e of ficha.exercicios) {
      if (!e.carga) continue;
      const c = Math.max(1, e.carga - 6 + prog * 2);
      volume += c * e.series * (parseInt(e.reps) || 10);
      (cargas[e.ex] ||= []).push({ data: dia, carga: c });
    }
    historico.push({ id: uid(), data: dia, ficha: ficha.id, nome: ficha.nome, duracao: 48 + (d % 5) * 4, volume, series: ficha.exercicios.reduce((a, e) => a + e.series, 0) });
    checkins.push(dia);
  }

  const avaliacoes = [
    { data: somaDias(hoje, -120), peso: 78.4, gordura: 24.1, cintura: 88, braco: 32, coxa: 56, quadril: 100 },
    { data: somaDias(hoje, -80), peso: 77.1, gordura: 22.8, cintura: 86, braco: 32.5, coxa: 56.5, quadril: 99 },
    { data: somaDias(hoje, -40), peso: 76.0, gordura: 21.6, cintura: 84, braco: 33, coxa: 57, quadril: 98 },
    { data: somaDias(hoje, -5), peso: 75.2, gordura: 20.7, cintura: 82.5, braco: 33.5, coxa: 57.5, quadril: 97 },
  ];

  // Faturas: últimos 5 meses pagos e o atual em aberto
  const faturas = [];
  const base = new Date(); base.setDate(10);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 10);
    faturas.push({ id: uid(), venc: hojeISO(d), valor: PLANOS.Plus.preco, status: i === 0 ? 'aberta' : 'paga', forma: i === 0 ? null : 'Cartão final 4242' });
  }

  const agora = Date.now();
  return {
    versao: 1,
    entrou: false,
    user: { nome: '', email: '', unidade: 'Livre Fit Paulista', plano: 'Plus', desde: somaDias(hoje, -150), matricula: String(100000 + Math.floor(Math.random() * 899999)), meta: 4 },
    saude: { parq: null, termos: null },
    fichas, fichaAtual: 'A',
    notas: { legpress: { carga: '', ajuste: 'Banco na posição 3, pés na parte alta', obs: '' } },
    sessao: null,
    historico, checkins, cargas,
    reservas: [], espera: [],
    goFeitos: 0, goHist: [],
    avaliacoes,
    posts: [
      { id: uid(), autor: 'm1', ts: agora - 36e5 * 2, texto: 'Bati meu recorde no agachamento hoje! 🎉 Obrigada Prof. Carla pela paciência.', foto: null, curtidas: ['m2', 'm3'], coments: [{ autor: 'm2', texto: 'Monstra!' }] },
      { id: uid(), autor: 'm3', ts: agora - 36e5 * 20, texto: 'Alguém vai na aula de Dança de quinta? Bora junto!', foto: null, curtidas: ['m1'], coments: [] },
      { id: uid(), autor: 'staff', ts: agora - 36e5 * 30, texto: 'Aviso: a piscina passa por manutenção no sábado das 7h às 10h. A hidroginástica das 8h fica para as 11h.', foto: null, curtidas: [], coments: [] },
    ],
    amigos: ['m1', 'm3'],
    desafios: { d12: true },
    notifs: [
      { id: uid(), ts: agora - 36e5 * 3, titulo: 'Sua ficha vence em breve', texto: 'Agende a revisão da ficha com um professor.', tipo: 'ficha', lida: false, link: '#/servicos' },
      { id: uid(), ts: agora - 36e5 * 26, titulo: 'Fatura do mês disponível', texto: 'Pague por Pix ou cartão direto no app.', tipo: 'financeiro', lida: false, link: '#/financeiro' },
      { id: uid(), ts: agora - 36e5 * 50, titulo: 'Novo desafio na unidade', texto: '8 aulas coletivas até o fim do mês. Topa?', tipo: 'social', lida: true, link: '#/social' },
    ],
    faturas,
    pagamento: { tipo: 'cartao', apelido: 'Cartão principal', final: '4242' },
    contrato: { inicio: somaDias(hoje, -150), fim: somaDias(hoje, 215), congelado: null },
    agendamentos: [],
    prefs: { tema: 'escuro', som: true, vibrar: true, lembretes: true },
  };
}

// ---------- Derivados ----------
export function estatisticas(s = estado) {
  const dias = [...new Set([...s.checkins, ...s.historico.map(h => h.data)])].sort();
  let maior = 0, atual = 0, prev = null;
  for (const d of dias) {
    atual = prev && difDias(prev, d) === 1 ? atual + 1 : 1;
    maior = Math.max(maior, atual); prev = d;
  }
  const hoje = hojeISO();
  let seq = 0;
  for (let d = hoje; dias.includes(d) || (d === hoje && dias.includes(somaDias(hoje, -1))); d = somaDias(d, -1)) {
    if (dias.includes(d)) seq++;
    if (seq > 400) break;
  }
  // semana atual (segunda a domingo)
  const hd = paraData(hoje), seg = somaDias(hoje, -((hd.getDay() + 6) % 7));
  const semana = dias.filter(d => d >= seg && d <= hoje).length;
  const mes = hoje.slice(0, 7);
  return {
    dias, maiorSequencia: maior, sequencia: seq, semana,
    treinosMes: s.historico.filter(h => h.data.startsWith(mes)).length,
    aulasMes: s.reservas.filter(r => r.data.startsWith(mes) && r.data <= hoje).length,
    goMes: s.goHist.filter(d => d.startsWith(mes)).length,
    volumeTotal: s.historico.reduce((a, h) => a + h.volume, 0),
  };
}

export const naoLidas = () => estado.notifs.filter(n => !n.lida).length;
export function notificar(titulo, texto, tipo = 'geral', link = '') {
  estado.notifs.unshift({ id: uid(), ts: Date.now(), titulo, texto, tipo, lida: false, link });
  estado.notifs = estado.notifs.slice(0, 60);
}

// Sugestão de progressão: se as últimas 2 sessões fecharam todas as séries, sugere subir a carga
export function sugestaoCarga(exId) {
  const h = (estado.cargas[exId] || []).slice(-3);
  if (h.length < 2) return null;
  const [a, b] = h.slice(-2);
  if (b.carga >= a.carga && b.completo !== false) {
    const passo = b.carga >= 40 ? 5 : 2;
    return { de: b.carga, para: b.carga + passo };
  }
  return null;
}

export const nomeEx = id => EXERCICIOS[id]?.nome || id;
