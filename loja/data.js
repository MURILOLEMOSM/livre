/* DG Club · catálogo, looks e ilustrações das peças */
(() => {
  'use strict';

  // ---------- Configuração da loja ----------
  const CONFIG = {
    nome: 'DG Club',
    // Número do WhatsApp com DDI e DDD, só dígitos (ex.: '5511999999999').
    // Vazio: o pedido abre o WhatsApp para a pessoa escolher o contato.
    whatsapp: '',
    instagram: 'dgclubstore',
    email: 'contato@dgclub.com.br',
    freteGratis: 599,
    parcelas: 6,
    pix: 0.05,          // desconto no Pix
    kitQtd: 3,          // a partir de quantas peças entra o desconto do kit
    kitDesc: 0.15,
    cupons: {           // código: desconto (fração)
      DGCLUB10: 0.10,
      BEMVINDO: 0.10
    }
  };

  // ---------- Ilustrações (SVG) ----------
  const D = 'fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.4" stroke-linecap="round"';
  const L = 'fill="rgba(255,255,255,.14)"';
  const LONG = 'M70 30 L50 36 L20 60 L8 170 L30 174 L44 92 L46 220 L154 220 L156 92 L170 174 L192 170 L180 60 L150 36 L130 30 Q100 50 70 30Z';
  const SHORT = 'M70 30 L48 38 L14 70 L34 104 L50 92 L50 214 L150 214 L150 92 L166 104 L186 70 L152 38 L130 30 Q100 48 70 30Z';

  const SHAPES = {
    camisa: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L100 58 L84 68Z M130 30 L100 58 L116 68Z" ${L}/>
      <path d="M100 58 L100 220" ${D}/>
      <g fill="rgba(0,0,0,.25)"><circle cx="104" cy="82" r="2"/><circle cx="104" cy="112" r="2"/><circle cx="104" cy="142" r="2"/><circle cx="104" cy="172" r="2"/><circle cx="104" cy="202" r="2"/></g>
      <path d="M62 92 L84 92 L84 112 L62 112Z" ${D}/>
      <path d="M8 160 L30 164" ${D}/><path d="M192 160 L170 164" ${D}/>`,
    polo: c => `
      <path d="${SHORT}" fill="${c}"/>
      <path d="M72 30 L100 50 L88 60Z M128 30 L100 50 L112 60Z" ${L}/>
      <path d="M100 50 L100 96 M94 50 L94 96 L106 96 L106 50" ${D}/>
      <g fill="rgba(0,0,0,.25)"><circle cx="100" cy="66" r="2"/><circle cx="100" cy="82" r="2"/></g>
      <path d="M34 104 L50 92 M166 104 L150 92 M50 204 L150 204" ${D}/>`,
    sueter: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M72 31 Q100 54 128 31" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="6"/>
      <path d="M46 204 L154 204 M10 156 L31 160 M190 156 L169 160" ${D}/>
      <g ${D}><path d="M60 110 L60 200 M80 110 L80 200 M100 110 L100 200 M120 110 L120 200 M140 110 L140 200" stroke-dasharray="2 5"/></g>`,
    cardigan: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L100 120 L130 30" ${D}/>
      <path d="M100 120 L100 220" ${D}/>
      <g fill="rgba(255,255,255,.6)"><circle cx="104" cy="136" r="2.6"/><circle cx="104" cy="160" r="2.6"/><circle cx="104" cy="184" r="2.6"/><circle cx="104" cy="206" r="2.6"/></g>
      <path d="M46 206 L154 206 M10 156 L31 160 M190 156 L169 160" ${D}/>`,
    colete: c => `
      <path d="M70 30 L58 36 Q62 70 48 96 L48 220 L152 220 L152 96 Q138 70 142 36 L130 30 L100 104Z" fill="${c}"/>
      <path d="M70 30 L100 104 L130 30" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="5"/>
      <path d="M48 96 Q60 72 58 36 M152 96 Q140 72 142 36" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="5"/>
      <path d="M48 206 L152 206" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="6"/>
      <g ${D}><path d="M70 120 L70 196 M88 120 L88 196 M112 120 L112 196 M130 120 L130 196" stroke-dasharray="2 5"/></g>`,
    blazer: c => `
      <path d="${LONG}" fill="${c}"/>
      <path d="M70 30 L96 130 L78 70 L88 62Z M130 30 L104 130 L122 70 L112 62Z" ${L}/>
      <path d="M100 130 L100 220" ${D}/>
      <g fill="rgba(255,255,255,.45)"><circle cx="106" cy="148" r="2.8"/><circle cx="106" cy="174" r="2.8"/></g>
      <path d="M58 168 L82 168 M118 168 L142 168 M126 96 L144 96" ${D}/>`,
    calca: c => `
      <path d="M56 20 L144 20 L152 228 L112 228 L100 82 L88 228 L48 228Z" fill="${c}"/>
      <path d="M56 34 L144 34 M100 34 L100 82 M70 34 Q76 54 62 60 M130 34 Q124 54 138 60" ${D}/>
      <path d="M72 70 L68 226 M128 70 L132 226" ${D}/>`,
    pantalona: c => `
      <path d="M62 20 L138 20 L168 228 L110 228 L100 90 L90 228 L32 228Z" fill="${c}"/>
      <path d="M62 36 L138 36 M100 36 L100 90 M76 50 L56 226 M124 50 L144 226" ${D}/>`,
    bermuda: c => `
      <path d="M52 40 L148 40 L158 154 L110 160 L100 92 L90 160 L42 154Z" fill="${c}"/>
      <path d="M52 54 L148 54 M100 54 L100 92 M46 140 L90 146 M154 140 L110 146" ${D}/>`,
    saia: c => `
      <path d="M66 30 L134 30 L168 214 L32 214Z" fill="${c}"/>
      <path d="M66 44 L134 44" ${D}/>
      <g ${D}><path d="M80 44 L58 212 M93 44 L84 212 M107 44 L116 212 M120 44 L142 212"/></g>`,
    vestido: c => `
      <path d="M78 18 L84 18 L86 40 L114 40 L116 18 L122 18 L128 72 L166 224 L34 224 L72 72Z" fill="${c}"/>
      <path d="M72 72 Q100 82 128 72 M86 82 L70 222 M114 82 L130 222" ${D}/>`,
    bone: c => `
      <path d="M44 140 Q42 64 104 62 Q164 64 164 136Z" fill="${c}"/>
      <path d="M44 138 Q110 124 196 146 Q186 162 150 160 Q100 152 44 150Z" fill="${c}"/>
      <path d="M44 138 Q110 124 196 146" ${D}/>
      <path d="M104 62 L104 136 M74 72 Q70 104 72 136 M134 72 Q138 104 136 136" ${D}/>
      <circle cx="104" cy="63" r="4" fill="rgba(0,0,0,.25)"/>
      <text x="104" y="114" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="18" fill="rgba(255,255,255,.75)">DG</text>`,
    mocassim: c => `
      <path d="M18 160 L182 160 Q194 160 192 170 L190 176 L20 176 Q10 176 12 168Z" fill="rgba(0,0,0,.55)"/>
      <path d="M18 160 Q14 130 46 122 L110 112 Q152 102 182 132 Q196 150 182 160Z" fill="${c}"/>
      <path d="M112 112 Q140 112 156 132 Q132 140 106 132Z" ${L}/>
      <path d="M118 128 L146 128" stroke="rgba(0,0,0,.3)" stroke-width="5"/>
      <path d="M106 132 Q132 142 158 132" ${D}/>`,
    cinto: c => `
      <rect x="10" y="104" width="180" height="32" rx="3" fill="${c}"/>
      <path d="M16 110 L184 110 M16 130 L184 130" ${D} stroke-dasharray="3 3"/>
      <rect x="140" y="96" width="40" height="48" rx="4" fill="none" stroke="#b9bec7" stroke-width="5"/>
      <path d="M150 120 L178 120" stroke="#b9bec7" stroke-width="4"/>
      <g fill="rgba(0,0,0,.3)"><circle cx="60" cy="120" r="2.6"/><circle cx="80" cy="120" r="2.6"/><circle cx="100" cy="120" r="2.6"/></g>`,
    bolsa: c => `
      <path d="M70 92 Q70 40 100 40 Q130 40 130 92" fill="none" stroke="${c}" stroke-width="9"/>
      <path d="M70 92 Q70 40 100 40 Q130 40 130 92" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="9"/>
      <path d="M36 92 L164 92 L172 210 Q172 216 166 216 L34 216 Q28 216 28 210Z" fill="${c}"/>
      <path d="M36 92 L164 92 L156 132 L44 132Z" ${L}/>
      <rect x="92" y="124" width="16" height="18" rx="2" fill="#b9bec7"/>
      <path d="M40 204 L160 204" ${D} stroke-dasharray="3 3"/>`
  };

  // Vista de detalhe: a mesma peça ampliada (a "segunda foto" da galeria)
  const svg = (shape, color, view = 0) => {
    const box = ['0 0 200 240', '40 20 120 144', '0 0 200 240'][view] || '0 0 200 240';
    const flip = view === 2 ? ' style="transform:scaleX(-1)"' : '';
    return `<svg viewBox="${box}" aria-hidden="true"${flip}>${SHAPES[shape](color)}</svg>`;
  };

  // ---------- Paleta das peças ----------
  const C = {
    branco: ['Branco', '#f7f8fa'],
    preto: ['Preto', '#141416'],
    marinho: ['Marinho', '#142446'],
    royal: ['Azul royal', '#2a4fa0'],
    ceu: ['Azul céu', '#a9c3e6'],
    off: ['Off-white', '#ecebe6']
  };

  // ---------- Catálogo ----------
  // old: preço "de" (promoção) · out: tamanhos esgotados · low: últimas unidades
  // om: faz parte da coleção Old Money · novo: lançamento
  const PRODUCTS = [
    { id: 'camisa-oxford', name: 'Camisa Oxford Clássica', cat: 'masculino', shape: 'camisa', price: 389, rank: 1, om: true, tag: 'Mais vendida',
      desc: 'A camisa que resolve qualquer ocasião. Oxford encorpado, colarinho com botões e caimento reto.',
      details: ['Colarinho button-down', 'Bolso no peito', 'Barra arredondada', 'Modelagem regular'],
      care: '100% algodão egípcio. Lavar a 30 °C, passar do avesso.',
      colors: [C.ceu, C.branco, C.marinho], sizes: ['P', 'M', 'G', 'GG'], out: ['GG'] },
    { id: 'camisa-linho', name: 'Camisa de Linho Positano', cat: 'masculino', shape: 'camisa', price: 449, rank: 5, om: true, novo: true,
      desc: 'Linho italiano lavado, toque seco e amassado charmoso. Feita para o verão europeu ou o brasileiro.',
      details: ['Linho italiano lavado', 'Colarinho italiano', 'Botões em madrepérola', 'Modelagem relaxada'],
      care: '100% linho italiano. Lavar a frio, secar à sombra.',
      colors: [C.branco, C.ceu, C.preto], sizes: ['P', 'M', 'G', 'GG'] },
    { id: 'polo-riviera', name: 'Polo Piquet Riviera', cat: 'masculino', shape: 'polo', price: 329, old: 399, rank: 2, om: true,
      desc: 'Piquet de algodão pima, gola firme e mangas com punho canelado. Sem logo, só qualidade.',
      details: ['Piquet pima 220 g/m²', 'Gola e punhos canelados', 'Dois botões', 'Fenda lateral na barra'],
      care: '100% algodão pima peruano. Lavar à mão ou ciclo delicado.',
      colors: [C.marinho, C.branco, C.preto, C.royal], sizes: ['P', 'M', 'G', 'GG'] },
    { id: 'polo-tricot', name: 'Polo Tricot Capri', cat: 'masculino', shape: 'polo', price: 459, rank: 7, om: true, novo: true,
      desc: 'Polo em tricô fino com gola aberta, o clássico da costa italiana dos anos 60.',
      details: ['Tricô de algodão e seda', 'Gola aberta sem botões', 'Punhos e barra canelados'],
      care: '80% algodão, 20% seda. Lavar à mão, secar na horizontal.',
      colors: [C.off, C.marinho, C.preto], sizes: ['P', 'M', 'G', 'GG'], low: true },
    { id: 'sueter-cashmere', name: 'Suéter Cashmere Gola Careca', cat: 'masculino', shape: 'sueter', price: 1290, rank: 3, om: true, tag: 'Edição limitada',
      desc: 'Toque macio que melhora com o tempo. Tricô fino, leve o bastante para o meio-termo das estações.',
      details: ['Cashmere 12 fios', 'Gola careca canelada', 'Costuras fully-fashioned'],
      care: '100% cashmere mongol. Lavar à mão em água fria, secar na horizontal.',
      colors: [C.marinho, C.preto, C.off], sizes: ['P', 'M', 'G'], low: true },
    { id: 'colete-tricot', name: 'Colete Tricot Cambridge', cat: 'masculino', shape: 'colete', price: 389, rank: 10, om: true,
      desc: 'Decote em V e tricô canelado. Por cima da oxford, é o uniforme do clube de campo.',
      details: ['Decote em V', 'Tricô canelado', 'Acabamento em ribana'],
      care: '100% lã merino. Lavar à mão em água fria.',
      colors: [C.off, C.marinho, C.preto], sizes: ['P', 'M', 'G', 'GG'] },
    { id: 'blazer-navy', name: 'Blazer Navy Lã Fria', cat: 'masculino', shape: 'blazer', price: 1890, rank: 4, om: true,
      desc: 'Desestruturado, dois botões, ombro natural. Funciona com chino, jeans ou alfaiataria.',
      details: ['Lã fria Super 110', 'Ombro natural, sem enchimento', 'Dois botões', 'Fenda traseira'],
      care: '98% lã fria, 2% elastano. Forro em viscose. Somente lavagem a seco.',
      colors: [C.marinho, C.preto], sizes: ['46', '48', '50', '52', '54'], out: ['54'] },
    { id: 'calca-chino', name: 'Calça Chino Alfaiataria', cat: 'masculino', shape: 'calca', price: 459, old: 549, rank: 6,
      desc: 'Corte reto levemente afunilado, cós com passantes e vinco discreto.',
      details: ['Sarja de algodão com elastano', 'Vinco frontal', 'Bolsos faca'],
      care: '97% algodão, 3% elastano. Lavar a 30 °C.',
      colors: [C.marinho, C.preto, C.off], sizes: ['38', '40', '42', '44', '46'] },
    { id: 'calca-la', name: 'Calça de Lã com Pregas', cat: 'masculino', shape: 'calca', price: 690, rank: 12, om: true,
      desc: 'Cintura alta, duas pregas e barra italiana. A calça dos ternos de antigamente, para usar sem o paletó.',
      details: ['Lã fria', 'Duas pregas frontais', 'Ajuste lateral no cós', 'Barra italiana'],
      care: '100% lã. Somente lavagem a seco.',
      colors: [C.preto, C.marinho], sizes: ['38', '40', '42', '44', '46'] },
    { id: 'bermuda-linho', name: 'Bermuda Linho Côte', cat: 'masculino', shape: 'bermuda', price: 299, old: 369, rank: 9,
      desc: 'Comprimento acima do joelho, cós com cordão interno. Para o clube, a praia e o jantar depois.',
      details: ['Linho e algodão', 'Cós com cordão interno', 'Comprimento 18 cm entrepernas'],
      care: '55% linho, 45% algodão. Lavar a frio.',
      colors: [C.branco, C.marinho, C.preto], sizes: ['38', '40', '42', '44'] },
    { id: 'cardigan-hampton', name: 'Cardigan Tricot Hampton', cat: 'feminino', shape: 'cardigan', price: 589, rank: 8, om: true, novo: true,
      desc: 'Decote em V, botões em madrepérola e tricô leve. Sobre os ombros ou fechado.',
      details: ['Tricô de algodão e cashmere', 'Botões em madrepérola', 'Decote em V'],
      care: '70% algodão, 30% cashmere. Lavar à mão, secar na horizontal.',
      colors: [C.off, C.marinho, C.preto], sizes: ['PP', 'P', 'M', 'G'] },
    { id: 'vestido-midi', name: 'Vestido Midi de Linho', cat: 'feminino', shape: 'vestido', price: 749, rank: 11, om: true,
      desc: 'Alças finas, decote reto e saia evasê. A peça mais elegante da sua mala.',
      details: ['Linho puro', 'Forro em algodão', 'Zíper invisível nas costas'],
      care: '100% linho. Forro em algodão. Lavar a frio.',
      colors: [C.branco, C.preto, C.royal], sizes: ['PP', 'P', 'M', 'G'], out: ['PP'] },
    { id: 'tricot-quiet', name: 'Tricot Quiet Luxury', cat: 'feminino', shape: 'sueter', price: 690, rank: 13, om: true,
      desc: 'Gola careca, manga longa, tricô de lã merino extrafina. Aquele básico que todo mundo pergunta de onde é.',
      details: ['Merino extrafina 17,5 mícrons', 'Gola careca', 'Modelagem levemente ampla'],
      care: '100% lã merino. Lavar à mão em água fria.',
      colors: [C.off, C.preto, C.marinho], sizes: ['PP', 'P', 'M', 'G'] },
    { id: 'pantalona', name: 'Calça Pantalona Alfaiataria', cat: 'feminino', shape: 'pantalona', price: 559, rank: 14,
      desc: 'Cintura alta, pregas frontais e caimento fluido até o chão.',
      details: ['Cintura alta', 'Pregas frontais', 'Bolsos faca'],
      care: '64% poliéster reciclado, 34% viscose, 2% elastano. Lavar a 30 °C.',
      colors: [C.off, C.preto, C.marinho], sizes: ['36', '38', '40', '42', '44'] },
    { id: 'saia-plissada', name: 'Saia Midi Plissada', cat: 'feminino', shape: 'saia', price: 489, rank: 15, om: true, novo: true,
      desc: 'Plissado permanente que acompanha o movimento. Com tricot no inverno, com regata no verão.',
      details: ['Plissado permanente', 'Cós com elástico nas costas', 'Comprimento midi'],
      care: '100% poliéster. Lavar à mão, não passar.',
      colors: [C.marinho, C.off, C.preto], sizes: ['PP', 'P', 'M', 'G'] },
    { id: 'polo-feminina', name: 'Polo Tricot Feminina', cat: 'feminino', shape: 'polo', price: 429, old: 499, rank: 16,
      desc: 'Polo em tricô canelado, manga curta e botões encapados. Com saia, jeans ou alfaiataria.',
      details: ['Tricô canelado', 'Botões encapados', 'Modelagem ajustada'],
      care: '100% viscose de bambu. Lavar à mão.',
      colors: [C.off, C.marinho, C.preto], sizes: ['PP', 'P', 'M', 'G'] },
    { id: 'camisa-seda', name: 'Camisa de Seda Lavada', cat: 'feminino', shape: 'camisa', price: 790, rank: 17, om: true,
      desc: 'Seda com toque de pêssego, caimento solto e brilho discreto.',
      details: ['Seda lavada', 'Gola padre', 'Punhos com dois botões'],
      care: '100% seda. Lavar à mão em água fria.',
      colors: [C.off, C.ceu, C.preto], sizes: ['PP', 'P', 'M', 'G'], low: true },
    { id: 'bone-dg', name: 'Boné Bordado DG Club', cat: 'acessorios', shape: 'bone', price: 189, old: 229, rank: 4, tag: 'Mais vendido',
      desc: 'Seis gomos, aba curva e monograma bordado em tom sobre tom. Fecho em couro.',
      details: ['Sarja de algodão', 'Monograma bordado', 'Fecho em couro com fivela'],
      care: '100% algodão sarja. Limpar com pano úmido.',
      colors: [C.marinho, C.preto, C.off], sizes: ['Único'] },
    { id: 'mocassim', name: 'Mocassim de Camurça', cat: 'acessorios', shape: 'mocassim', price: 890, old: 1090, rank: 18, om: true,
      desc: 'Camurça macia, sola de couro com borracha antiderrapante. Usa sem meia, como manda o figurino.',
      details: ['Camurça bovina', 'Sola de couro com borracha', 'Palmilha acolchoada'],
      care: 'Escovar com escova própria; evitar chuva.',
      colors: [C.preto, C.marinho], sizes: ['38', '39', '40', '41', '42', '43', '44'], out: ['44'] },
    { id: 'cinto-ingles', name: 'Cinto de Couro Inglês', cat: 'acessorios', shape: 'cinto', price: 279, rank: 19,
      desc: 'Couro inteiro com bordas pintadas à mão e fivela em metal escovado.',
      details: ['Couro bovino inteiro', 'Largura 3,5 cm', 'Fivela em metal escovado'],
      care: 'Hidratar o couro a cada seis meses.',
      colors: [C.preto, C.marinho], sizes: ['85', '90', '95', '100', '105'] },
    { id: 'bolsa-weekend', name: 'Bolsa de Couro Weekend', cat: 'acessorios', shape: 'bolsa', price: 1490, rank: 20, om: true, novo: true,
      desc: 'Couro estruturado, alça de mão e fecho metálico. Cabe o essencial de um fim de semana no campo.',
      details: ['Couro bovino', 'Forro em algodão', 'Bolso interno com zíper'],
      care: 'Guardar no saco de proteção. Hidratar a cada seis meses.',
      colors: [C.preto, C.marinho, C.off], sizes: ['Único'], low: true }
  ];

  // Tipos de peça (menu e círculos "Compre por categoria")
  const TYPES = [
    { key: 'polos', name: 'Polos', shapes: ['polo'], icon: ['polo', '#142446'] },
    { key: 'camisas', name: 'Camisas', shapes: ['camisa'], icon: ['camisa', '#a9c3e6'] },
    { key: 'tricots', name: 'Tricots', shapes: ['sueter', 'cardigan', 'colete'], icon: ['sueter', '#ecebe6'] },
    { key: 'alfaiataria', name: 'Alfaiataria', shapes: ['blazer'], icon: ['blazer', '#142446'] },
    { key: 'calcas', name: 'Calças', shapes: ['calca', 'pantalona'], icon: ['calca', '#141416'] },
    { key: 'bermudas', name: 'Bermudas', shapes: ['bermuda'], icon: ['bermuda', '#f7f8fa'] },
    { key: 'vestidos-saias', name: 'Vestidos e saias', shapes: ['vestido', 'saia'], icon: ['vestido', '#2a4fa0'] },
    { key: 'bones', name: 'Bonés', shapes: ['bone'], icon: ['bone', '#142446'] },
    { key: 'calcados', name: 'Calçados', shapes: ['mocassim'], icon: ['mocassim', '#141416'] },
    { key: 'couro', name: 'Bolsas e cintos', shapes: ['bolsa', 'cinto'], icon: ['bolsa', '#141416'] }
  ];

  // Looks da coleção Old Money: [id do produto, índice da cor]
  const LOOKS = [
    { id: 'riviera', name: 'Riviera', place: 'Almoço no clube', bg: '#e9eef6',
      items: [['polo-riviera', 0], ['calca-chino', 2], ['mocassim', 1], ['cinto-ingles', 1]] },
    { id: 'hampton', name: 'Hampton', place: 'Fim de semana no campo', bg: '#0f1f3d', dark: true,
      items: [['cardigan-hampton', 0], ['saia-plissada', 0], ['bolsa-weekend', 0]] },
    { id: 'cambridge', name: 'Cambridge', place: 'Biblioteca, outono', bg: '#ecebe6',
      items: [['camisa-oxford', 0], ['colete-tricot', 1], ['calca-la', 0], ['mocassim', 0]] },
    { id: 'positano', name: 'Positano', place: 'Jantar à beira-mar', bg: '#0b0b0c', dark: true,
      items: [['camisa-linho', 0], ['bermuda-linho', 1], ['bone-dg', 0]] }
  ];

  window.DG = { CONFIG, PRODUCTS, TYPES, LOOKS, svg, SHAPES };
})();
