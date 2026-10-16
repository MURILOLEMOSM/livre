/* =========================================================
   CAMPUS · Diagramas interativos (Computação e Direito)
   Desenho em SVG puro. Cada diagrama é só dados:
   nós com posição (x, y na grade de 100 × 100) e ligações.
   ========================================================= */

const n = (id, x, y, rotulo, info, tipo = '') => ({ id, x, y, rotulo, info, tipo });

export const DIAGRAMAS = {
  computacao: [
    {
      id: 'web',
      titulo: 'Arquitetura de uma aplicação web',
      nos: [
        n('cliente', 50, 6, 'Navegador / App', 'O cliente faz requisições HTTP(S). Em um PWA, o service worker pode responder do cache, sem rede.', 'borda'),
        n('dns', 10, 24, 'DNS', 'Traduz o domínio (ex.: app.com) no endereço IP do servidor ou da CDN. Respostas ficam em cache conforme o TTL.'),
        n('cdn', 90, 24, 'CDN', 'Rede de servidores próximos do usuário que entrega arquivos estáticos (JS, CSS, imagens) com baixa latência.'),
        n('lb', 50, 40, 'Balanceador de carga', 'Distribui as requisições entre várias instâncias da aplicação e tira do ar as que falham no health check.'),
        n('api', 50, 58, 'Servidor de aplicação (API)', 'Regras de negócio. Sem estado (stateless) para escalar horizontalmente: a sessão fica em token ou em cache compartilhado.', 'nucleo'),
        n('cache', 10, 76, 'Cache (Redis)', 'Guarda resultados frequentes em memória. Reduz a carga no banco; o desafio é invalidar na hora certa.'),
        n('db', 50, 92, 'Banco de dados', 'Fonte da verdade. Relacional (PostgreSQL) para consistência ACID; réplicas de leitura ajudam a escalar.', 'dados'),
        n('fila', 90, 76, 'Fila de mensagens', 'Desacopla tarefas lentas (e-mail, relatórios). A API publica e responde logo; workers consomem depois.'),
        n('worker', 90, 92, 'Workers', 'Processos em segundo plano que consomem a fila. Precisam ser idempotentes, pois uma mensagem pode chegar duas vezes.'),
      ],
      ligacoes: [['cliente', 'dns'], ['cliente', 'cdn'], ['cliente', 'lb'], ['lb', 'api'], ['api', 'cache'], ['api', 'db'], ['api', 'fila'], ['fila', 'worker'], ['worker', 'db']],
    },
    {
      id: 'tcpip',
      titulo: 'Pilha TCP/IP × modelo OSI',
      nos: [
        n('app', 50, 8, 'Aplicação', 'Camadas OSI 5, 6 e 7. Protocolos: HTTP, DNS, SMTP, SSH. Unidade: mensagem/dados.', 'borda'),
        n('transp', 50, 32, 'Transporte', 'OSI 4. TCP (confiável, orientado a conexão, controle de fluxo e congestionamento) e UDP (sem conexão, baixa latência). Unidade: segmento.', 'nucleo'),
        n('rede', 50, 56, 'Internet (Rede)', 'OSI 3. IP faz endereçamento e roteamento entre redes; ICMP dá diagnóstico (ping). Unidade: pacote.'),
        n('enlace', 50, 80, 'Acesso à rede', 'OSI 1 e 2. Ethernet, Wi-Fi, endereços MAC, ARP. Unidade: quadro (frame) e bits.', 'dados'),
        n('tls', 92, 20, 'TLS', 'Criptografia entre aplicação e transporte. HTTPS = HTTP sobre TLS, na porta 443.'),
        n('roteador', 8, 56, 'Roteador', 'Opera na camada de rede: lê o IP de destino e encaminha pela tabela de rotas.'),
        n('switch', 8, 80, 'Switch', 'Opera no enlace: encaminha quadros pelo endereço MAC dentro da rede local.'),
      ],
      ligacoes: [['app', 'transp'], ['transp', 'rede'], ['rede', 'enlace'], ['app', 'tls'], ['tls', 'transp'], ['roteador', 'rede'], ['switch', 'enlace']],
    },
  ],

  direito: [
    {
      id: 'cpc',
      titulo: 'Procedimento comum — CPC/2015',
      nos: [
        n('inicial', 50, 5, 'Petição inicial', 'Arts. 319 e 320 do CPC: partes, fatos, fundamentos, pedido, valor da causa e provas.', 'borda'),
        n('admiss', 50, 18, 'Juízo de admissibilidade', 'O juiz pode mandar emendar (art. 321), indeferir (art. 330) ou julgar liminarmente improcedente (art. 332).'),
        n('citacao', 50, 31, 'Citação', 'Ato que chama o réu ao processo (art. 238). Hoje é preferencialmente eletrônica (art. 246).'),
        n('audiencia', 50, 44, 'Conciliação ou mediação', 'Art. 334. Só não ocorre se ambas as partes recusarem ou se o direito não admitir autocomposição.'),
        n('contest', 50, 57, 'Contestação', 'Art. 335: prazo de 15 dias úteis. Sem contestação, há revelia (art. 344).', 'nucleo'),
        n('saneamento', 50, 70, 'Saneamento e organização', 'Art. 357: resolve questões pendentes, fixa os pontos controvertidos e define as provas.'),
        n('instrucao', 50, 83, 'Instrução (AIJ)', 'Produção de provas: perícia, depoimentos e testemunhas na audiência de instrução e julgamento.'),
        n('sentenca', 50, 95, 'Sentença', 'Art. 203, § 1º. Pode resolver o mérito (art. 487) ou não (art. 485). Cabe apelação em 15 dias úteis.', 'dados'),
        n('julg', 92, 70, 'Julgamento antecipado', 'Art. 355: quando não há necessidade de outras provas ou ocorre a revelia com seus efeitos.'),
        n('acordo', 8, 44, 'Acordo homologado', 'Se houver autocomposição, o juiz homologa por sentença (art. 487, III).'),
      ],
      ligacoes: [['inicial', 'admiss'], ['admiss', 'citacao'], ['citacao', 'audiencia'], ['audiencia', 'contest'], ['audiencia', 'acordo'], ['contest', 'saneamento'], ['contest', 'julg'], ['saneamento', 'instrucao'], ['instrucao', 'sentenca'], ['julg', 'sentenca']],
    },
    {
      id: 'penal',
      titulo: 'Persecução penal — fases',
      nos: [
        n('notitia', 50, 5, 'Notícia do crime', 'A autoridade toma conhecimento do fato: boletim de ocorrência, requisição, representação ou flagrante.', 'borda'),
        n('ip', 50, 20, 'Inquérito policial', 'Procedimento administrativo e inquisitivo. Prazo do art. 10 do CPP: 10 dias (preso) ou 30 dias (solto).'),
        n('mp', 50, 36, 'Ministério Público', 'Titular da ação penal pública (art. 129, I, CF). Avalia se há justa causa.', 'nucleo'),
        n('arquiv', 8, 36, 'Arquivamento', 'Quando falta justa causa. Submetido a controle judicial e revisão, conforme o art. 28 do CPP e o entendimento do STF.'),
        n('anpp', 92, 36, 'Acordo de não persecução', 'Art. 28-A do CPP (Pacote Anticrime): crimes sem violência ou grave ameaça com pena mínima inferior a 4 anos.'),
        n('denuncia', 50, 51, 'Denúncia e recebimento', 'Art. 41 do CPP: exposição do fato, qualificação do acusado, classificação do crime e testemunhas.'),
        n('resposta', 50, 65, 'Citação e resposta à acusação', 'Art. 396-A: prazo de 10 dias. Pode levar à absolvição sumária (art. 397).'),
        n('aij', 50, 80, 'Instrução e julgamento', 'Ouvem-se ofendido, testemunhas e, por último, o interrogatório do réu (art. 400).'),
        n('sentpen', 50, 95, 'Sentença', 'Condenatória (art. 387) ou absolutória (art. 386). Cabe apelação em 5 dias (art. 593).', 'dados'),
      ],
      ligacoes: [['notitia', 'ip'], ['ip', 'mp'], ['mp', 'arquiv'], ['mp', 'anpp'], ['mp', 'denuncia'], ['denuncia', 'resposta'], ['resposta', 'aij'], ['aij', 'sentpen']],
    },
  ],
};

const SVG = 'http://www.w3.org/2000/svg';
const W = 1000;
const H = 1000;
const NODE_W = 260;
const NODE_H = 64;

function el(tag, attrs = {}) {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/* Quebra o rótulo em até 2 linhas para caber no retângulo */
function linhas(texto, max = 19) {
  if (texto.length <= max) return [texto];
  const palavras = texto.split(' ');
  let a = '';
  while (palavras.length && (a + ' ' + palavras[0]).trim().length <= max) a = (a + ' ' + palavras.shift()).trim();
  return [a, palavras.join(' ')];
}

/* Desenha o diagrama dentro de "alvo" e chama aoSelecionar(no) no clique */
export function desenharDiagrama(alvo, diagrama, aoSelecionar) {
  alvo.innerHTML = '';
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'diagrama-svg', role: 'img', 'aria-label': diagrama.titulo });

  const defs = el('defs');
  const marker = el('marker', { id: 'seta', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
  marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'diagrama-seta' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const pos = id => {
    const no = diagrama.nos.find(x => x.id === id);
    return {
      x: NODE_W / 2 + 10 + (no.x / 100) * (W - NODE_W - 20),
      y: NODE_H / 2 + 6 + (no.y / 100) * (H - NODE_H - 12),
    };
  };

  // Ligações: saem da borda do retângulo de origem até a borda do destino
  for (const [de, para] of diagrama.ligacoes) {
    const a = pos(de);
    const b = pos(para);
    const borda = (p, q) => {
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const tx = dx ? (NODE_W / 2) / Math.abs(dx) : Infinity;
      const ty = dy ? (NODE_H / 2 + 4) / Math.abs(dy) : Infinity;
      const t = Math.min(tx, ty);
      return { x: p.x + dx * t, y: p.y + dy * t };
    };
    const ini = borda(a, b);
    const fim = borda(b, a);
    svg.appendChild(el('line', { x1: ini.x, y1: ini.y, x2: fim.x, y2: fim.y, class: 'diagrama-linha', 'marker-end': 'url(#seta)' }));
  }

  for (const no of diagrama.nos) {
    const { x, y } = pos(no.id);
    const g = el('g', { class: `diagrama-no ${no.tipo}`, tabindex: '0', role: 'button', 'data-id': no.id, transform: `translate(${x - NODE_W / 2} ${y - NODE_H / 2})` });
    g.appendChild(el('rect', { width: NODE_W, height: NODE_H, rx: 14 }));
    const ls = linhas(no.rotulo);
    ls.forEach((l, i) => {
      const t = el('text', { x: NODE_W / 2, y: NODE_H / 2 + (i - (ls.length - 1) / 2) * 24 + 8, 'text-anchor': 'middle' });
      t.textContent = l;
      g.appendChild(t);
    });
    const escolher = () => {
      svg.querySelectorAll('.diagrama-no.ativo').forEach(e => e.classList.remove('ativo'));
      g.classList.add('ativo');
      aoSelecionar(no);
    };
    g.addEventListener('click', escolher);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(); } });
    svg.appendChild(g);
  }

  alvo.appendChild(svg);
}
