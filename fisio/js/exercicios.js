// Biblioteca de exercícios, modelos de programa e o "envelope" que vai dentro dos links
// (fisio → paciente e paciente → fisio). Tudo viaja no próprio link: não precisa de servidor.

export const EXERCICIOS = [
  { id: 'iso-quad', r: 'Joelho', n: 'Isometria de quadríceps', d: 'Deitado, joelho esticado com uma toalha enrolada embaixo. Aperte o joelho contra a toalha, segure e solte.', dose: '10 × 10 s' },
  { id: 'desl-calc', r: 'Joelho', n: 'Deslizamento do calcanhar', d: 'Deitado, dobre o joelho arrastando o calcanhar na cama e volte devagar.', dose: '3 × 10' },
  { id: 'epe', r: 'Joelho', n: 'Elevação da perna estendida', d: 'Deitado, uma perna dobrada. Com o joelho da outra bem esticado, suba até a altura do outro joelho e desça devagar.', dose: '3 × 10' },
  { id: 'sentar-levantar', r: 'Joelho', n: 'Sentar e levantar da cadeira', d: 'Pés na largura do quadril, levante sem usar as mãos (se conseguir) e sente devagar.', dose: '3 × 10' },
  { id: 'mini-agach', r: 'Joelho', n: 'Mini agachamento na parede', d: 'Costas na parede, desça até onde for confortável (sem passar de 60°) e suba.', dose: '3 × 12' },
  { id: 'step-up', r: 'Joelho', n: 'Subir no degrau', d: 'De frente para um degrau baixo, suba com uma perna, depois a outra, e desça devagar. Segure no corrimão se precisar.', dose: '3 × 10 cada perna' },
  { id: 'bomba-torn', r: 'Tornozelo', n: 'Bomba de tornozelo', d: 'Mexa os pés para cima e para baixo, ritmado. Ajuda a circulação.', dose: '20 × a cada hora' },
  { id: 'elev-calc', r: 'Tornozelo', n: 'Elevação dos calcanhares', d: 'Em pé, apoiado na pia ou parede, suba na ponta dos pés e desça devagar.', dose: '3 × 15' },
  { id: 'along-pant', r: 'Tornozelo', n: 'Alongamento da panturrilha na parede', d: 'Mãos na parede, uma perna atrás com o calcanhar no chão e joelho esticado. Leve o corpo à frente até sentir alongar.', dose: '3 × 30 s cada' },
  { id: 'ponte', r: 'Quadril', n: 'Ponte', d: 'Deitado, joelhos dobrados. Suba o quadril até alinhar com o tronco, segure 2 s e desça.', dose: '3 × 12' },
  { id: 'abd-lado', r: 'Quadril', n: 'Abdução deitado de lado', d: 'Deitado de lado, perna de cima esticada. Suba a perna sem rodar o quadril e desça devagar.', dose: '3 × 12' },
  { id: 'concha', r: 'Quadril', n: 'Concha (clamshell)', d: 'Deitado de lado, joelhos dobrados e pés juntos. Abra o joelho de cima sem girar o tronco.', dose: '3 × 15' },
  { id: 'along-flex-quadril', r: 'Quadril', n: 'Alongamento do flexor do quadril', d: 'Ajoelhado com uma perna à frente (use uma almofada no joelho). Contraia o bumbum e leve o quadril levemente à frente.', dose: '3 × 30 s cada' },
  { id: 'gato-camelo', r: 'Coluna', n: 'Gato e camelo', d: 'Em quatro apoios, arredonde as costas olhando para o umbigo e depois afunde levemente olhando para frente.', dose: '2 × 10' },
  { id: 'bird-dog', r: 'Coluna', n: 'Perdigueiro (bird-dog)', d: 'Em quatro apoios, estique braço e perna opostos sem deixar o quadril rodar. Alterne.', dose: '3 × 8 cada lado' },
  { id: 'prancha', r: 'Coluna', n: 'Prancha', d: 'Apoiado nos antebraços e pontas dos pés (ou joelhos), corpo alinhado, respirando normalmente.', dose: '3 × 20–30 s' },
  { id: 'joelhos-peito', r: 'Coluna', n: 'Joelhos ao peito', d: 'Deitado, abrace os joelhos e traga em direção ao peito com calma.', dose: '3 × 30 s' },
  { id: 'ext-prono', r: 'Coluna', n: 'Extensão deitado de bruços', d: 'De bruços, apoie os antebraços e levante o tronco devagar, mantendo o quadril no chão. Relaxe e volte.', dose: '2 × 10' },
  { id: 'caminhada', r: 'Coluna', n: 'Caminhada', d: 'Caminhe em ritmo confortável, em que consiga conversar. Aumente o tempo aos poucos.', dose: '20–30 min' },
  { id: 'pendular', r: 'Ombro', n: 'Pendular (Codman)', d: 'Inclinado à frente, apoiado na mesa, deixe o braço solto e faça pequenos círculos.', dose: '1 min cada sentido' },
  { id: 're-elastico', r: 'Ombro', n: 'Rotação externa com elástico', d: 'Cotovelo colado ao corpo a 90°, gire o antebraço para fora contra o elástico e volte devagar.', dose: '3 × 12' },
  { id: 'ri-elastico', r: 'Ombro', n: 'Rotação interna com elástico', d: 'Cotovelo colado ao corpo a 90°, puxe o elástico em direção à barriga e volte devagar.', dose: '3 × 12' },
  { id: 'desl-parede', r: 'Ombro', n: 'Deslizamento na parede', d: 'De frente para a parede, deslize as mãos para cima até onde for confortável e desça.', dose: '2 × 10' },
  { id: 'retr-escap', r: 'Ombro', n: 'Retração das escápulas', d: 'Sentado com a coluna ereta, aproxime as escápulas, segure 3 s e solte.', dose: '3 × 10' },
  { id: 'retr-queixo', r: 'Cervical', n: 'Retração do queixo', d: 'Olhando para frente, leve o queixo para trás como se fizesse "papada", segure 3 s.', dose: '10 ×' },
  { id: 'rot-cerv', r: 'Cervical', n: 'Rotação do pescoço', d: 'Sentado, olhe devagar para um lado até onde for confortável, volte ao centro e vá para o outro lado.', dose: '10 × cada lado' },
  { id: 'along-trap', r: 'Cervical', n: 'Alongamento do trapézio', d: 'Sentado, segure no banco com uma mão e incline a cabeça para o lado oposto, sem forçar.', dose: '3 × 30 s cada' },
  { id: 'uma-perna', r: 'Equilíbrio', n: 'Apoio em uma perna', d: 'Perto de um apoio seguro, fique em uma perna só. Progrida para olhos fechados só com orientação.', dose: '3 × 30 s cada' },
  { id: 'tandem', r: 'Equilíbrio', n: 'Marcha em linha (pé ante pé)', d: 'Perto de uma parede ou bancada, ande colocando o calcanhar encostado na ponta do outro pé.', dose: '3 × 10 passos' },
  { id: 'diafrag', r: 'Respiratório', n: 'Respiração diafragmática', d: 'Mão na barriga, puxe o ar pelo nariz enchendo a barriga e solte devagar pela boca com lábios franzidos.', dose: '10 respirações, 3× ao dia' },
  { id: 'along-isquio', r: 'Mobilidade', n: 'Alongamento de isquiotibiais', d: 'Sentado na beira da cadeira, perna esticada com o calcanhar no chão, incline o tronco à frente com a coluna reta.', dose: '3 × 30 s' },
];

export const byId = id => EXERCICIOS.find(e => e.id === id);

// Pontos de partida para o fisio adaptar. Não são protocolo fechado.
export const MODELOS = [
  { n: 'Dor lombar inespecífica', it: ['gato-camelo', 'joelhos-peito', 'ponte', 'bird-dog', 'prancha', 'caminhada'] },
  { n: 'Joelho: dor anterior / artrose', it: ['iso-quad', 'epe', 'sentar-levantar', 'ponte', 'abd-lado', 'elev-calc'] },
  { n: 'Ombro: dor subacromial', it: ['pendular', 'desl-parede', 'retr-escap', 're-elastico', 'ri-elastico'] },
  { n: 'Pós-operatório de membro inferior (fase inicial)', it: ['bomba-torn', 'iso-quad', 'desl-calc', 'diafrag'] },
  { n: 'Idoso: equilíbrio e prevenção de quedas', it: ['sentar-levantar', 'elev-calc', 'uma-perna', 'tandem', 'step-up'] },
  { n: 'Dor cervical', it: ['retr-queixo', 'rot-cerv', 'retr-escap', 'along-trap'] },
];

export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Expande um item da ficha (pode ser da biblioteca, só com id, ou escrito à mão)
export function resolveItem(it) {
  const base = it.e ? byId(it.e) || {} : {};
  return { n: it.n || base.n || 'Exercício', d: it.d || base.d || '', dose: it.dose || base.dose || '', v: it.v || '' };
}

/* ---------- Links: JSON → deflate → base64url ---------- */

const toB64url = bytes => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = str => {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};
const pipeBytes = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

export async function encodeData(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'undefined') return 'j' + toB64url(raw);
  return 'z' + toB64url(await pipeBytes(raw, new CompressionStream('deflate-raw')));
}

export async function decodeData(str) {
  const kind = str[0];
  let bytes = fromB64url(str.slice(1));
  if (kind === 'z') bytes = await pipeBytes(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'j') throw new Error('formato');
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Endereço do app (funciona em qualquer domínio onde ele estiver publicado)
export const appBase = () => new URL('.', location.href).href;

// Programa compacto que vai no link do paciente
export function programPayload(s) {
  return {
    v: 1, id: s.id, pac: s.paciente, prof: s.prof, tel: s.tel, freq: s.freq, dias: s.dias, vezes: s.vezes,
    obs: s.obs, data: s.data,
    it: s.itens.map(i => {
      const base = i.e && byId(i.e);
      // da biblioteca e sem mudança no texto: manda só o id e a dose (link fica curto)
      if (base && i.n === base.n && i.d === base.d) return { e: i.e, dose: i.dose, ...(i.v ? { v: i.v } : {}) };
      return { n: i.n, d: i.d, dose: i.dose, ...(i.v ? { v: i.v } : {}) };
    }),
  };
}

export const ytSearch = name => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${name} exercício fisioterapia`);

// Quantas sessões foram prescritas nos últimos `days` dias (inclui hoje)
export function prescribedSessions(dias, vezes, days, now = new Date()) {
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (!dias?.length || dias.includes(d.getDay())) total += vezes || 1;
  }
  return total;
}

export function adherence(logs, dias, vezes, days = 7) {
  const since = Date.now() - days * 86_400_000;
  const done = logs.filter(l => l.t >= since).length;
  const expected = prescribedSessions(dias, vezes, days);
  return expected ? Math.min(100, Math.round((done / expected) * 100)) : 0;
}

// Folhetos curtos de educação em saúde para mandar ao paciente
export const ORIENTACOES = [
  { t: 'Dor nas costas: continue se mexendo', x: 'A maioria das dores nas costas melhora em algumas semanas.\n• Ficar de repouso na cama costuma atrasar a melhora: mantenha suas atividades, adaptando o ritmo.\n• Caminhar é um ótimo remédio.\n• Exames de imagem mostram alterações comuns até em quem não sente dor; elas não explicam tudo.\n• Procure atendimento logo se tiver perda de força nas pernas, dormência na região íntima ou dificuldade para urinar.' },
  { t: 'Gelo ou calor?', x: 'Gelo: nas primeiras 48–72 h depois de uma torção ou pancada, ou quando há inchaço. 15 a 20 minutos, sempre com um pano entre o gelo e a pele.\nCalor: para músculos tensos e rigidez. 15 a 20 minutos, morno, nunca quente demais.\nNão durma com bolsa de gelo ou de calor. Se você tem diabetes, problemas de circulação ou pouca sensibilidade na pele, pergunte antes ao seu fisioterapeuta.' },
  { t: 'Sentir dor não quer dizer que está machucando', x: 'A dor é um alarme do corpo, e às vezes esse alarme fica sensível demais, principalmente quando a dor dura muito tempo.\nPor isso, um pouco de desconforto durante os exercícios é esperado e seguro: até 5 numa escala de 0 a 10, desde que melhore até o dia seguinte.\nSono, estresse e medo também aumentam a dor. Movimento, aos poucos, ensina o corpo que é seguro se mexer de novo.' },
  { t: 'Casa segura: prevenção de quedas', x: '• Tire tapetes soltos ou prenda com fita antiderrapante.\n• Deixe uma luz acesa no caminho do banheiro à noite.\n• Barras de apoio no box e perto do vaso ajudam muito.\n• Use calçados fechados atrás e com sola de borracha.\n• Deixe o que usa todo dia em altura fácil, sem precisar subir em banco.\n• Levante devagar da cama: sente, espere alguns segundos e só então fique de pé.' },
  { t: 'Trabalho sentado e home office', x: '• A melhor postura é a próxima: mude de posição a cada 30–40 minutos.\n• Tela na altura dos olhos, pés apoiados no chão ou num apoio.\n• Levante para beber água, atender o telefone ou ir ao banheiro: são pausas que contam.\n• Faça 2 ou 3 dos seus exercícios no meio do expediente.' },
  { t: 'Sono e dor', x: '• Dormir mal deixa o corpo mais sensível à dor, e a dor atrapalha o sono: vale cuidar dos dois.\n• Tente deitar e acordar no mesmo horário.\n• Evite telas e café perto da hora de dormir.\n• Travesseiros entre os joelhos (de lado) ou embaixo dos joelhos (de barriga para cima) podem deixar mais confortável.' },
];
