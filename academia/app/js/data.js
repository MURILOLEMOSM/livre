// Catálogos do app (conteúdo de demonstração)

// Biblioteca de exercícios: nome, grupo, movimento da animação e dica de execução
export const EXERCICIOS = {
  agachamento: { nome: 'Agachamento livre', grupo: 'Pernas', mov: 'agacha', dica: 'Pés na largura dos ombros, peito aberto e joelhos acompanhando a ponta dos pés. Desça como se fosse sentar numa cadeira.' },
  legpress: { nome: 'Leg press 45°', grupo: 'Pernas', mov: 'agacha', dica: 'Lombar sempre encostada no banco. Não trave os joelhos no fim da subida.' },
  avanco: { nome: 'Avanço com halteres', grupo: 'Pernas', mov: 'avanco', dica: 'Dê um passo largo e desça até os dois joelhos formarem 90°. O tronco fica reto.' },
  cadeira_ext: { nome: 'Cadeira extensora', grupo: 'Pernas', mov: 'agacha', dica: 'Ajuste o encosto para o joelho ficar alinhado ao eixo do aparelho. Suba em 1 s, desça em 2 s.' },
  stiff: { nome: 'Stiff com barra', grupo: 'Posterior', mov: 'alonga', dica: 'Joelhos levemente flexionados e coluna neutra. Leve o quadril para trás, não a cabeça para baixo.' },
  supino: { nome: 'Supino reto', grupo: 'Peito', mov: 'empurra', dica: 'Escápulas encaixadas no banco e pés firmes no chão. A barra desce até a linha do peito.' },
  supino_incl: { nome: 'Supino inclinado com halteres', grupo: 'Peito', mov: 'empurra', dica: 'Banco entre 30° e 45°. Junte os halteres em cima sem bater um no outro.' },
  crucifixo: { nome: 'Crucifixo máquina', grupo: 'Peito', mov: 'empurra', dica: 'Cotovelos levemente dobrados e fixos durante todo o movimento.' },
  desenvolvimento: { nome: 'Desenvolvimento com halteres', grupo: 'Ombros', mov: 'acima', dica: 'Abdômen firme para não arquear a lombar. Suba até quase estender os braços.' },
  elevacao_lat: { nome: 'Elevação lateral', grupo: 'Ombros', mov: 'acima', dica: 'Suba até a linha dos ombros, com os cotovelos guiando o movimento.' },
  puxada: { nome: 'Puxada frontal', grupo: 'Costas', mov: 'puxa', dica: 'Puxe a barra até o alto do peito, levando os cotovelos para baixo e para trás.' },
  remada: { nome: 'Remada baixa', grupo: 'Costas', mov: 'puxa', dica: 'Tronco parado. Imagine que está guardando as escápulas no bolso de trás.' },
  remada_uni: { nome: 'Remada unilateral', grupo: 'Costas', mov: 'puxa', dica: 'Apoie joelho e mão no banco e puxe o halter em direção ao quadril.' },
  rosca: { nome: 'Rosca direta', grupo: 'Bíceps', mov: 'rosca', dica: 'Cotovelos colados ao corpo. Sem balançar o tronco para ajudar.' },
  rosca_martelo: { nome: 'Rosca martelo', grupo: 'Bíceps', mov: 'rosca', dica: 'Palmas viradas uma para a outra durante todo o movimento.' },
  triceps_polia: { nome: 'Tríceps na polia', grupo: 'Tríceps', mov: 'rosca', dica: 'Só o antebraço se move. Estenda tudo e volte devagar.' },
  prancha: { nome: 'Prancha', grupo: 'Core', mov: 'prancha', dica: 'Corpo em linha reta da cabeça aos pés. Contraia glúteos e abdômen.' },
  abdominal: { nome: 'Abdominal supra', grupo: 'Core', mov: 'prancha', dica: 'Tire só as escápulas do chão e solte o ar ao subir.' },
  esteira: { nome: 'Esteira', grupo: 'Cardio', mov: 'cardio', dica: 'Ritmo em que dá para conversar, mas sem cantar.' },
  polichinelo: { nome: 'Polichinelo', grupo: 'Cardio', mov: 'salta', dica: 'Aterrisse com os joelhos levemente dobrados.' },
  burpee: { nome: 'Burpee', grupo: 'Cardio', mov: 'salta', dica: 'Desça, leve os pés para trás, volte e salte. Mantenha o ritmo constante.' },
  corrida_parada: { nome: 'Corrida parada', grupo: 'Cardio', mov: 'cardio', dica: 'Joelhos na altura do quadril e braços acompanhando.' },
  alongamento_post: { nome: 'Alongamento posterior', grupo: 'Mobilidade', mov: 'alonga', dica: 'Respire fundo e desça um pouco mais a cada expiração.' },
  mobilidade_ombro: { nome: 'Mobilidade de ombro', grupo: 'Mobilidade', mov: 'acima', dica: 'Movimentos amplos e lentos, sem dor.' },
  flexao: { nome: 'Flexão de braço', grupo: 'Peito', mov: 'prancha', dica: 'Mãos um pouco além da largura dos ombros. Pode apoiar os joelhos.' },
  agacha_salto: { nome: 'Agachamento com salto', grupo: 'Pernas', mov: 'agacha', dica: 'Aterrisse suave e já emende o próximo agachamento.' },
};

// Ficha inicial do aluno
export const FICHAS_INICIAIS = [
  { id: 'A', nome: 'Treino A', foco: 'Peito, ombros e tríceps', itens: [
    ['supino', 4, '10', 60, 30], ['supino_incl', 3, '12', 60, 14], ['crucifixo', 3, '12', 45, 35], ['desenvolvimento', 3, '10', 60, 12], ['elevacao_lat', 3, '15', 45, 6], ['triceps_polia', 3, '12', 45, 25] ] },
  { id: 'B', nome: 'Treino B', foco: 'Costas e bíceps', itens: [
    ['puxada', 4, '10', 60, 45], ['remada', 3, '12', 60, 40], ['remada_uni', 3, '10', 60, 16], ['rosca', 3, '12', 45, 10], ['rosca_martelo', 3, '12', 45, 10], ['prancha', 3, '40s', 30, 0] ] },
  { id: 'C', nome: 'Treino C', foco: 'Pernas e core', itens: [
    ['agachamento', 4, '10', 90, 40], ['legpress', 4, '12', 75, 120], ['avanco', 3, '10', 60, 10], ['cadeira_ext', 3, '15', 45, 35], ['stiff', 3, '12', 60, 30], ['abdominal', 3, '20', 30, 0] ] },
];

// Grade semanal de aulas coletivas (0 = domingo)
export const AULAS = [
  { id: 'bike', nome: 'Bike Indoor', sala: 'Sala 1', dur: 45, prof: 'Prof. Diego', cap: 20, cor: '#c6ff3d', mov: 'cardio', dias: [1, 2, 3, 4, 5, 0], horas: ['06:30', '18:00'] },
  { id: 'funcional', nome: 'Funcional', sala: 'Área externa', dur: 50, prof: 'Prof. Carla', cap: 16, cor: '#3dffb0', mov: 'salta', dias: [1, 3, 5, 6], horas: ['07:30', '19:00'] },
  { id: 'lutas', nome: 'Lutas', sala: 'Sala 2', dur: 45, prof: 'Prof. Rafa', cap: 14, cor: '#ff6b4a', mov: 'empurra', dias: [1, 3], horas: ['12:15', '20:00'] },
  { id: 'gluteo', nome: 'Glúteo Pro', sala: 'Sala 2', dur: 45, prof: 'Prof. Bia', cap: 12, cor: '#ffb03d', mov: 'agacha', dias: [1, 2, 4], horas: ['18:30'] },
  { id: 'danca', nome: 'Dança', sala: 'Sala 1', dur: 50, prof: 'Prof. Léo', cap: 25, cor: '#c6ff3d', mov: 'salta', dias: [1, 4, 5], horas: ['19:30'] },
  { id: 'yoga', nome: 'Yoga', sala: 'Sala 3', dur: 60, prof: 'Prof. Marina', cap: 15, cor: '#3dffb0', mov: 'alonga', dias: [1, 3, 6], horas: ['07:00', '20:30'] },
  { id: 'pilates', nome: 'Pilates Solo', sala: 'Sala 3', dur: 50, prof: 'Prof. Marina', cap: 12, cor: '#3dffb0', mov: 'prancha', dias: [2, 4], horas: ['12:15', '19:15'] },
  { id: 'cross', nome: 'Cross Training', sala: 'Box', dur: 50, prof: 'Prof. Rafa', cap: 12, cor: '#ff6b4a', mov: 'agacha', dias: [2, 4, 6], horas: ['06:30', '08:00'] },
  { id: 'hidro', nome: 'Hidroginástica', sala: 'Piscina', dur: 45, prof: 'Prof. Sônia', cap: 18, cor: '#3dffb0', mov: 'cardio', dias: [2, 4, 6], horas: ['08:00', '09:00'] },
];

// Ocupação "pseudoaleatória" estável por aula e data, para a demonstração
export function ocupacao(aulaId, data, hora) {
  let h = 0;
  for (const c of aulaId + data + hora) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 100;
}

// Livre Go: treinos guiados para fazer em qualquer lugar
const GO_BASE = {
  HIIT: { cor: '#ff6b4a', mov: 'salta', ex: ['polichinelo', 'agacha_salto', 'burpee', 'corrida_parada', 'flexao', 'avanco'] },
  Funcional: { cor: '#c6ff3d', mov: 'agacha', ex: ['agachamento', 'avanco', 'flexao', 'prancha', 'polichinelo', 'abdominal'] },
  Hipertrofia: { cor: '#ffb03d', mov: 'empurra', ex: ['flexao', 'agachamento', 'avanco', 'abdominal', 'prancha', 'desenvolvimento'] },
  Alongamento: { cor: '#3dffb0', mov: 'alonga', ex: ['alongamento_post', 'mobilidade_ombro', 'alongamento_post', 'mobilidade_ombro'] },
  Mobilidade: { cor: '#9aa3b2', mov: 'acima', ex: ['mobilidade_ombro', 'alongamento_post', 'avanco', 'agachamento'] },
  Core: { cor: '#c6ff3d', mov: 'prancha', ex: ['prancha', 'abdominal', 'prancha', 'corrida_parada'] },
};
const NIVEIS = [['Iniciante', 30, 30], ['Intermediário', 40, 20], ['Avançado', 45, 15]];
const DURS = [7, 15, 25];
export const GO = Object.entries(GO_BASE).flatMap(([cat, b]) => NIVEIS.flatMap(([nivel, trab, desc]) => DURS.map(min => {
  const ciclo = trab + desc, rodadas = Math.max(1, Math.round((min * 60) / ciclo));
  const passos = Array.from({ length: rodadas }, (_, i) => b.ex[i % b.ex.length]);
  return { id: `${cat}-${nivel}-${min}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), cat, nivel, min, trab, desc, passos, cor: b.cor, mov: b.mov,
    nome: `${cat} ${min} min` };
})));

// Desafios da unidade
export const DESAFIOS = [
  { id: 'd12', nome: '12 treinos em outubro', meta: 12, unidade: 'treinos', tipo: 'treinos', premio: '1 mês de toalha grátis' },
  { id: 'aulas8', nome: '8 aulas coletivas', meta: 8, unidade: 'aulas', tipo: 'aulas', premio: 'Squeeze Livre Fit' },
  { id: 'go10', nome: '10 treinos no Livre Go', meta: 10, unidade: 'treinos', tipo: 'go', premio: 'Selo Treino em Qualquer Lugar' },
];

// Conquistas
export const SELOS = [
  { id: 'primeiro', nome: 'Primeiro treino', ico: '🎯', ok: s => s.historico.length >= 1 },
  { id: 'dez', nome: '10 treinos', ico: '💪', ok: s => s.historico.length >= 10 },
  { id: 'sequencia', nome: '3 dias seguidos', ico: '🔥', ok: s => s.maiorSequencia >= 3 },
  { id: 'aula', nome: 'Primeira aula', ico: '🎵', ok: s => s.reservas.length >= 1 },
  { id: 'go', nome: 'Treino em casa', ico: '🏠', ok: s => s.goFeitos >= 1 },
  { id: 'avaliacao', nome: 'Avaliado', ico: '📏', ok: s => s.avaliacoes.length >= 2 },
  { id: 'social', nome: 'Primeiro post', ico: '📣', ok: s => s.posts.some(p => p.autor === 'eu') },
  { id: 'volume', nome: '10 toneladas', ico: '🏋️', ok: s => s.historico.reduce((a, h) => a + h.volume, 0) >= 10000 },
];

// Unidade do aluno (fictícia)
export const UNIDADE = {
  nome: 'Livre Fit Paulista', end: 'Av. Exemplo, 1000 · Bela Vista · São Paulo/SP',
  horarios: [['Seg a sex', '5h às 23h'], ['Sábado', '7h às 20h'], ['Domingo e feriados', '8h às 14h']],
  comodidades: ['Piscina aquecida', 'Vestiário com armários', 'Bicicletário', 'Estacionamento conveniado', 'Wi-Fi', 'Área de alongamento', 'Box de cross', 'Cadeira de massagem'],
  // ocupação típica por hora (5h às 23h), em %
  curva: [10, 35, 55, 45, 30, 25, 35, 40, 30, 25, 30, 45, 70, 90, 85, 60, 35, 15],
  tel: '(11) 4000-0000',
};

// Parceiros do clube de vantagens (fictícios)
export const PARCEIROS = [
  { nome: 'Empório Verde', tipo: 'Alimentação saudável', desc: '15% de desconto', cupom: 'LIVRE15' },
  { nome: 'Pé no Chão Calçados', tipo: 'Tênis esportivos', desc: '10% em tênis de corrida', cupom: 'LIVRETENIS' },
  { nome: 'Fisio Movimento', tipo: 'Fisioterapia', desc: 'Primeira consulta com 30% off', cupom: 'LIVREFISIO' },
  { nome: 'Suplementa+', tipo: 'Suplementos', desc: '12% em todo o site', cupom: 'LIVRE12' },
  { nome: 'Sono Bom', tipo: 'Colchões', desc: 'Frete grátis', cupom: 'LIVRESONO' },
];

// Serviços com agendamento
export const SERVICOS = [
  { id: 'avaliacao', nome: 'Avaliação física', desc: 'Bioimpedância, medidas e teste de força. 40 min.', preco: 0, ico: 'grafico' },
  { id: 'nutri', nome: 'Consulta com nutricionista', desc: 'Plano alimentar alinhado ao seu treino. 50 min.', preco: 89.9, ico: 'saude' },
  { id: 'personal', nome: 'Aula com personal', desc: 'Sessão individual para ajustar técnica. 60 min.', preco: 69.9, ico: 'halter' },
  { id: 'revisao', nome: 'Revisão da ficha', desc: 'Professor atualiza seu treino. 20 min.', preco: 0, ico: 'nota' },
];

export const PLANOS = {
  Livre: { preco: 99.9, desc: 'Musculação em 1 unidade' },
  Plus: { preco: 139.9, desc: 'Todas as unidades e aulas coletivas' },
  Total: { preco: 189.9, desc: 'Tudo do Plus, piscina e reavaliações' },
};

// Questionário de prontidão para atividade física (redação própria)
export const PARQ = [
  'Algum médico já disse que você tem problema no coração e só deve fazer atividade física com orientação?',
  'Você sente dor no peito quando faz atividade física?',
  'No último mês, você sentiu dor no peito mesmo parado?',
  'Você já perdeu o equilíbrio por tontura ou desmaiou?',
  'Você tem algum problema nos ossos ou articulações que pode piorar com exercício?',
  'Você toma remédio para pressão ou para o coração?',
  'Existe algum outro motivo para você não fazer atividade física?',
];

// Membros da unidade para a parte social (fictícios)
export const MEMBROS = [
  { id: 'm1', nome: 'Carol Mendes', cor: '#ff6b4a', treinos: 15 },
  { id: 'm2', nome: 'João Pedro', cor: '#3dffb0', treinos: 13 },
  { id: 'm3', nome: 'Bia Santos', cor: '#ffb03d', treinos: 11 },
  { id: 'm4', nome: 'Rafael Lima', cor: '#c6ff3d', treinos: 9 },
  { id: 'm5', nome: 'Duda Alves', cor: '#9aa3b2', treinos: 7 },
  { id: 'm6', nome: 'Marcos Rocha', cor: '#3dffb0', treinos: 4 },
];
