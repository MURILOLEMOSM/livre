/* =========================================================
   CAMPUS · Atlas anatômico 3D (Medicina e Fisioterapia)
   Modelo didático montado com formas simples do Three.js,
   organizado em camadas que ligam e desligam. Cada estrutura
   tem nome e descrição; tocar nela abre a ficha.
   Three.js só é baixado quando a aba Atlas é aberta.
   Para trocar por um modelo realista, carregue um .glb com
   GLTFLoader e dê a cada malha o mesmo "userData.id".
   ========================================================= */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export const CAMADAS = {
  esqueleto: { nome: 'Esqueleto', cor: '#e7e0cc' },
  musculos: { nome: 'Músculos', cor: '#c2453a' },
  tendoes: { nome: 'Tendões', cor: '#f1f5f9' },
  arterias: { nome: 'Artérias', cor: '#ef4444' },
  veias: { nome: 'Veias', cor: '#3b82f6' },
  orgaos: { nome: 'Órgãos', cor: '#f0a3b5' },
};

/* Fichas das estruturas. O id liga a ficha à forma 3D. */
export const ESTRUTURAS = {
  cranio: { camada: 'esqueleto', nome: 'Crânio', desc: 'Protege o encéfalo. Neurocrânio (8 ossos) e viscerocrânio (14 ossos), unidos por suturas imóveis.' },
  mandibula: { camada: 'esqueleto', nome: 'Mandíbula', desc: 'Único osso móvel do crânio; articula-se com o temporal na ATM.' },
  coluna: { camada: 'esqueleto', nome: 'Coluna vertebral', desc: '33 vértebras: 7 cervicais, 12 torácicas, 5 lombares, sacro (5 fundidas) e cóccix. Protege a medula espinal.' },
  costelas: { camada: 'esqueleto', nome: 'Costelas', desc: '12 pares: 7 verdadeiros (1ª–7ª), 3 falsos (8ª–10ª) e 2 flutuantes (11ª–12ª).' },
  esterno: { camada: 'esqueleto', nome: 'Esterno', desc: 'Manúbrio, corpo e processo xifoide. Ponto de referência da compressão na RCP (metade inferior).' },
  clavicula: { camada: 'esqueleto', nome: 'Clavícula', desc: 'Liga o membro superior ao tronco. Uma das fraturas mais comuns, geralmente no terço médio.' },
  escapula: { camada: 'esqueleto', nome: 'Escápula', desc: 'Osso plano que dá origem aos músculos do manguito rotador. A cavidade glenoide articula-se com o úmero.' },
  umero: { camada: 'esqueleto', nome: 'Úmero', desc: 'Osso do braço. O nervo radial passa no sulco do nervo radial, na diáfise.' },
  radio: { camada: 'esqueleto', nome: 'Rádio', desc: 'Osso lateral do antebraço. A fratura distal (de Colles) é comum em quedas com a mão espalmada.' },
  ulna: { camada: 'esqueleto', nome: 'Ulna', desc: 'Osso medial do antebraço. O olécrano forma a ponta do cotovelo.' },
  mao: { camada: 'esqueleto', nome: 'Ossos da mão', desc: '27 ossos: 8 do carpo, 5 metacarpos e 14 falanges. O escafoide é o carpal mais fraturado.' },
  pelve: { camada: 'esqueleto', nome: 'Pelve', desc: 'Formada pelos ossos do quadril (ílio, ísquio e púbis), sacro e cóccix. Transmite o peso do tronco aos membros inferiores.' },
  femur: { camada: 'esqueleto', nome: 'Fêmur', desc: 'Maior osso do corpo. A fratura do colo é típica em idosos com osteoporose.' },
  patela: { camada: 'esqueleto', nome: 'Patela', desc: 'Maior osso sesamoide, dentro do tendão do quadríceps. Aumenta o braço de alavanca da extensão do joelho.' },
  tibia: { camada: 'esqueleto', nome: 'Tíbia', desc: 'Osso medial e de carga da perna. A face medial fica logo abaixo da pele, o que favorece fraturas expostas.' },
  fibula: { camada: 'esqueleto', nome: 'Fíbula', desc: 'Osso lateral da perna, sem função de carga importante. Forma o maléolo lateral.' },
  pe: { camada: 'esqueleto', nome: 'Ossos do pé', desc: '26 ossos: 7 do tarso, 5 metatarsos e 14 falanges. O calcâneo recebe o tendão calcâneo.' },

  ecm: { camada: 'musculos', nome: 'Esternocleidomastóideo', desc: 'Flexiona o pescoço e roda a cabeça para o lado oposto. Inervação: nervo acessório (NC XI).' },
  trapezio: { camada: 'musculos', nome: 'Trapézio', desc: 'Eleva, retrai e roda a escápula. Inervação: nervo acessório (NC XI).' },
  deltoide: { camada: 'musculos', nome: 'Deltoide', desc: 'Principal abdutor do braço (após os 15° iniciais do supraespinal). Inervação: nervo axilar.' },
  peitoral: { camada: 'musculos', nome: 'Peitoral maior', desc: 'Aduz, roda medialmente e flexiona o braço. Inervação: nervos peitorais medial e lateral.' },
  biceps: { camada: 'musculos', nome: 'Bíceps braquial', desc: 'Flexiona o cotovelo e é o principal supinador do antebraço. Inervação: nervo musculocutâneo.' },
  triceps: { camada: 'musculos', nome: 'Tríceps braquial', desc: 'Principal extensor do cotovelo. Inervação: nervo radial.' },
  antebraco: { camada: 'musculos', nome: 'Músculos do antebraço', desc: 'Flexores (face anterior, nervos mediano e ulnar) e extensores (face posterior, nervo radial) do punho e dos dedos.' },
  reto_abd: { camada: 'musculos', nome: 'Reto do abdome', desc: 'Flexiona o tronco. Dividido por intersecções tendíneas (o "tanquinho"). Inervação: nervos intercostais T7–T12.' },
  gluteo: { camada: 'musculos', nome: 'Glúteo máximo', desc: 'Principal extensor e rotador lateral do quadril. Inervação: nervo glúteo inferior.' },
  quadriceps: { camada: 'musculos', nome: 'Quadríceps femoral', desc: 'Reto femoral e vastos lateral, medial e intermédio. Estende o joelho. Inervação: nervo femoral.' },
  isquiotibiais: { camada: 'musculos', nome: 'Isquiotibiais', desc: 'Bíceps femoral, semitendíneo e semimembranáceo. Flexionam o joelho e estendem o quadril. Inervação: nervo isquiático.' },
  gastrocnemio: { camada: 'musculos', nome: 'Gastrocnêmio e sóleo', desc: 'Tríceps sural: flexão plantar do tornozelo. Inervação: nervo tibial.' },
  tibial_ant: { camada: 'musculos', nome: 'Tibial anterior', desc: 'Dorsiflexor e inversor do pé. A fraqueza causa o "pé caído" (nervo fibular profundo).' },

  t_calcaneo: { camada: 'tendoes', nome: 'Tendão calcâneo (de Aquiles)', desc: 'Tendão mais forte do corpo; une o tríceps sural ao calcâneo. Teste de Thompson avalia ruptura.' },
  t_patelar: { camada: 'tendoes', nome: 'Ligamento patelar', desc: 'Liga a patela à tuberosidade da tíbia. Base do reflexo patelar (L3–L4).' },
  t_quadriceps: { camada: 'tendoes', nome: 'Tendão do quadríceps', desc: 'Insere os quatro ventres do quadríceps na base da patela.' },
  t_biceps: { camada: 'tendoes', nome: 'Tendão distal do bíceps', desc: 'Insere-se na tuberosidade do rádio. Reflexo bicipital avalia C5–C6.' },
  t_flexores: { camada: 'tendoes', nome: 'Tendões flexores do punho', desc: 'Passam pelo túnel do carpo com o nervo mediano.' },

  coracao: { camada: 'arterias', nome: 'Coração', desc: 'Bomba de quatro câmaras. O lado esquerdo manda sangue oxigenado ao corpo; o direito, sangue venoso aos pulmões.' },
  aorta: { camada: 'arterias', nome: 'Aorta', desc: 'Maior artéria do corpo: aorta ascendente, arco e aorta descendente (torácica e abdominal), que se bifurca em ilíacas comuns na altura de L4.' },
  carotidas: { camada: 'arterias', nome: 'Artérias carótidas', desc: 'Irrigam cabeça e pescoço. A comum se divide em interna (encéfalo) e externa (face) na altura de C4.' },
  a_braquial: { camada: 'arterias', nome: 'Artérias subclávia e braquial', desc: 'Irrigam o membro superior. A braquial é usada para aferir a pressão arterial.' },
  a_femoral: { camada: 'arterias', nome: 'Artérias ilíacas e femorais', desc: 'Irrigam o membro inferior. O pulso femoral é palpado abaixo do ligamento inguinal.' },
  cava: { camada: 'veias', nome: 'Veias cavas', desc: 'A cava superior drena cabeça, pescoço e membros superiores; a inferior, o resto do corpo. Ambas chegam ao átrio direito.' },
  jugulares: { camada: 'veias', nome: 'Veias jugulares', desc: 'Drenam cabeça e pescoço. A turgência jugular é sinal de insuficiência cardíaca direita.' },
  v_braquial: { camada: 'veias', nome: 'Veias do membro superior', desc: 'Superficiais (cefálica e basílica) e profundas. A fossa cubital é o local clássico de punção.' },
  v_femoral: { camada: 'veias', nome: 'Veias femorais e safenas', desc: 'Drenam o membro inferior. A trombose venosa profunda acomete principalmente essas veias.' },

  encefalo: { camada: 'orgaos', nome: 'Encéfalo', desc: 'Cérebro, cerebelo e tronco encefálico. Recebe cerca de 15% do débito cardíaco.' },
  pulmoes: { camada: 'orgaos', nome: 'Pulmões', desc: 'O direito tem 3 lobos e o esquerdo 2 (dá espaço ao coração). Local das trocas gasosas, nos alvéolos.' },
  figado: { camada: 'orgaos', nome: 'Fígado', desc: 'Maior glândula do corpo. Metabolismo, produção de bile, de proteínas plasmáticas e de fatores de coagulação.' },
  estomago: { camada: 'orgaos', nome: 'Estômago', desc: 'Digestão química (ácido clorídrico e pepsina) e mecânica. Produz o fator intrínseco, necessário para absorver vitamina B12.' },
  rins: { camada: 'orgaos', nome: 'Rins', desc: 'Filtram o sangue (cerca de 180 L/dia de filtrado), regulam água, eletrólitos, pH e pressão arterial.' },
  intestinos: { camada: 'orgaos', nome: 'Intestinos', desc: 'Delgado (duodeno, jejuno e íleo) absorve nutrientes; o grosso absorve água e forma as fezes.' },
  bexiga: { camada: 'orgaos', nome: 'Bexiga urinária', desc: 'Armazena urina. Revestida por urotélio; o detrusor contrai na micção.' },
};

let THREE = null;

/* Cria o atlas dentro de "alvo". Retorna controles e uma função para destruir. */
export async function criarAtlas(alvo, { camadasIniciais, aoSelecionar }) {
  THREE = THREE || await import(THREE_URL);

  const largura = () => alvo.clientWidth || 320;
  const altura = () => alvo.clientHeight || 420;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(largura(), altura());
  alvo.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, largura() / altura(), 0.1, 50);
  cena.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.1));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4);
  sol.position.set(2, 3, 4);
  cena.add(sol);
  const contra = new THREE.DirectionalLight(0x93c5fd, 0.6);
  contra.position.set(-2, 1, -3);
  cena.add(contra);

  const corpo = new THREE.Group();
  cena.add(corpo);
  const grupos = {};
  for (const id of Object.keys(CAMADAS)) {
    grupos[id] = new THREE.Group();
    grupos[id].visible = camadasIniciais.includes(id);
    corpo.add(grupos[id]);
  }
  const clicaveis = [];
  montarCorpo(grupos, clicaveis);

  // Câmera orbital simples (sem dependências extras)
  const orbita = { rotY: 0.35, rotX: 0.05, dist: 4.4, alvoY: 0.95 };
  const PADRAO = { ...orbita };
  function posicionarCamera() {
    corpo.rotation.y = orbita.rotY;
    camera.position.set(0, orbita.alvoY + Math.sin(orbita.rotX) * orbita.dist, Math.cos(orbita.rotX) * orbita.dist);
    camera.lookAt(0, orbita.alvoY, 0);
    renderizar();
  }

  let pendente = false;
  function renderizar() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => { pendente = false; renderer.render(cena, camera); });
  }

  // Gestos: arrastar gira, roda do mouse ou pinça aproxima, toque seleciona
  const toques = new Map();
  let arrastou = 0;
  let pincaInicial = 0;
  let distInicial = 0;
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastou = 0;
    if (toques.size === 2) {
      const [a, b] = [...toques.values()];
      pincaInicial = Math.hypot(a.x - b.x, a.y - b.y);
      distInicial = orbita.dist;
    }
  });
  canvas.addEventListener('pointermove', e => {
    const antes = toques.get(e.pointerId);
    if (!antes) return;
    const agora = { x: e.clientX, y: e.clientY };
    toques.set(e.pointerId, agora);
    if (toques.size === 1) {
      const dx = agora.x - antes.x;
      const dy = agora.y - antes.y;
      arrastou += Math.abs(dx) + Math.abs(dy);
      orbita.rotY += dx * 0.01;
      orbita.rotX = Math.max(-1.2, Math.min(1.2, orbita.rotX + dy * 0.006));
      posicionarCamera();
    } else if (toques.size === 2) {
      const [a, b] = [...toques.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      arrastou += 10;
      orbita.dist = Math.max(1.2, Math.min(7, distInicial * (pincaInicial / d)));
      posicionarCamera();
    }
  });
  const soltar = e => {
    const eraUnico = toques.size === 1;
    toques.delete(e.pointerId);
    if (eraUnico && arrastou < 6 && e.type === 'pointerup') selecionarEm(e);
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    orbita.dist = Math.max(1.2, Math.min(7, orbita.dist * (1 + Math.sign(e.deltaY) * 0.1)));
    posicionarCamera();
  }, { passive: false });

  // Seleção por raio a partir do ponto tocado
  const raio = new THREE.Raycaster();
  let selecionada = null;
  function selecionarEm(e) {
    const r = canvas.getBoundingClientRect();
    const ponto = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(ponto, camera);
    const visiveis = clicaveis.filter(m => m.parent.visible);
    const hit = raio.intersectObjects(visiveis, false)[0];
    destacar(hit ? hit.object.userData.id : null);
  }
  function destacar(id) {
    if (selecionada) for (const m of clicaveis) if (m.userData.id === selecionada) m.material.emissive.setHex(0x000000);
    selecionada = id;
    if (id) for (const m of clicaveis) if (m.userData.id === id) m.material.emissive.setHex(0x3b3b10);
    renderizar();
    aoSelecionar(id ? { id, ...ESTRUTURAS[id] } : null);
  }

  // Ajusta ao tamanho do container (girar o celular, redimensionar a janela)
  const ro = new ResizeObserver(() => {
    renderer.setSize(largura(), altura());
    camera.aspect = largura() / altura();
    camera.updateProjectionMatrix();
    renderizar();
  });
  ro.observe(alvo);

  posicionarCamera();

  return {
    mostrarCamada(id, visivel) {
      grupos[id].visible = visivel;
      if (!visivel && selecionada && ESTRUTURAS[selecionada].camada === id) destacar(null);
      renderizar();
    },
    selecionar(id) {
      const camada = ESTRUTURAS[id].camada;
      if (!grupos[camada].visible) grupos[camada].visible = true;
      destacar(id);
      return camada;
    },
    girar(passo) { orbita.rotY += passo; posicionarCamera(); },
    zoom(fator) { orbita.dist = Math.max(1.2, Math.min(7, orbita.dist * fator)); posicionarCamera(); },
    resetar() { Object.assign(orbita, PADRAO); posicionarCamera(); },
    destruir() {
      ro.disconnect();
      cena.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
      renderer.dispose();
      canvas.remove();
    },
  };
}

/* ---------------- Montagem do modelo didático ---------------- */

function montarCorpo(grupos, clicaveis) {
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  const mat = (camada, extra = {}) => new THREE.MeshStandardMaterial({ color: CAMADAS[camada].cor, roughness: 0.55, metalness: 0.05, ...extra });

  function add(id, malha) {
    const camada = ESTRUTURAS[id].camada;
    malha.userData.id = id;
    grupos[camada].add(malha);
    clicaveis.push(malha);
    return malha;
  }

  // Cilindro entre dois pontos (ossos, tendões)
  function haste(id, a, b, raio, extra) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const geo = new THREE.CylinderGeometry(raio, raio * 0.9, dir.length(), 12);
    const m = new THREE.Mesh(geo, mat(ESTRUTURAS[id].camada, extra));
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    return add(id, m);
  }

  // Cápsula entre dois pontos, deslocada (ventres musculares)
  function ventre(id, a, b, raio, desloc = V(0, 0, 0), escala = V(1, 1, 1)) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const geo = new THREE.CapsuleGeometry(raio, Math.max(0.01, dir.length() - raio * 2), 6, 14);
    const m = new THREE.Mesh(geo, mat('musculos', { transparent: true, opacity: 0.88 }));
    m.position.copy(a).addScaledVector(dir, 0.5).add(desloc);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    m.scale.copy(escala);
    return add(id, m);
  }

  function bola(id, pos, raio, escala = V(1, 1, 1), extra) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(raio, 24, 16), mat(ESTRUTURAS[id].camada, extra));
    m.position.copy(pos);
    m.scale.copy(escala);
    return add(id, m);
  }

  function vaso(id, pontos, raio) {
    const curva = new THREE.CatmullRomCurve3(pontos);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curva, 48, raio, 8, false), mat(ESTRUTURAS[id].camada, { roughness: 0.35 }));
    return add(id, m);
  }

  // ---- Esqueleto ----
  bola('cranio', V(0, 1.64), 0.1, V(0.92, 1.1, 1.05));
  bola('mandibula', V(0, 1.53, 0.03), 0.055, V(1.1, 0.6, 1));
  for (let i = 0; i < 24; i++) {
    const y = 1.47 - i * 0.021;
    const z = -0.05 - Math.sin((i / 23) * Math.PI) * 0.025;
    const r = 0.016 + i * 0.0006;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.014, 10), mat('esqueleto'));
    m.position.set(0, y, z);
    add('coluna', m);
  }
  for (let i = 0; i < 10; i++) {
    const y = 1.39 - i * 0.026;
    const raio = 0.09 + Math.sin(((i + 2) / 12) * Math.PI) * 0.045;
    const arco = i < 7 ? Math.PI * 1.7 : Math.PI * (1.4 - (i - 7) * 0.2);
    const m = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.006, 6, 32, arco), mat('esqueleto'));
    m.rotation.x = Math.PI / 2 + 0.25;
    m.rotation.z = Math.PI / 2 + (Math.PI * 2 - arco) / 2 - Math.PI;
    m.position.set(0, y, -0.02);
    m.scale.set(1, 0.85, 1);
    add('costelas', m);
  }
  haste('esterno', V(0, 1.4, 0.075), V(0, 1.22, 0.085), 0.012);
  for (const s of [-1, 1]) {
    haste('clavicula', V(s * 0.02, 1.43, 0.06), V(s * 0.19, 1.45, 0.0), 0.009);
    const esc = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.012), mat('esqueleto'));
    esc.position.set(s * 0.12, 1.36, -0.1);
    esc.rotation.y = s * 0.35;
    add('escapula', esc);
    haste('umero', V(s * 0.2, 1.43), V(s * 0.24, 1.14), 0.016);
    haste('radio', V(s * 0.25, 1.13, 0.01), V(s * 0.29, 0.88, 0.02), 0.009);
    haste('ulna', V(s * 0.235, 1.13, -0.01), V(s * 0.265, 0.88, -0.01), 0.009);
    const mao = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.07), mat('esqueleto'));
    mao.position.set(s * 0.285, 0.8, 0.01);
    add('mao', mao);
    haste('femur', V(s * 0.09, 0.96), V(s * 0.1, 0.52), 0.02);
    bola('patela', V(s * 0.1, 0.5, 0.045), 0.022, V(1, 1.1, 0.6));
    haste('tibia', V(s * 0.095, 0.48), V(s * 0.09, 0.08), 0.017);
    haste('fibula', V(s * 0.135, 0.47, -0.01), V(s * 0.125, 0.08, -0.01), 0.008);
    const pe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.22), mat('esqueleto'));
    pe.position.set(s * 0.1, 0.03, 0.05);
    add('pe', pe);
  }
  const pelve = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.022, 10, 32), mat('esqueleto'));
  pelve.rotation.x = Math.PI / 2 - 0.9;
  pelve.position.set(0, 0.98, -0.01);
  pelve.scale.set(1.25, 1, 1);
  add('pelve', pelve);

  // ---- Músculos ----
  for (const s of [-1, 1]) {
    ventre('ecm', V(s * 0.05, 1.55, 0.02), V(s * 0.02, 1.43, 0.06), 0.014);
    ventre('trapezio', V(s * 0.02, 1.52, -0.07), V(s * 0.18, 1.44, -0.06), 0.03, V(0, 0, 0), V(1, 1, 0.5));
    bola('deltoide', V(s * 0.215, 1.4, 0), 0.05, V(0.8, 1.2, 1), { transparent: true, opacity: 0.88 });
    bola('peitoral', V(s * 0.08, 1.33, 0.08), 0.075, V(1.05, 0.75, 0.35), { transparent: true, opacity: 0.88 });
    ventre('biceps', V(s * 0.21, 1.36), V(s * 0.24, 1.17), 0.026, V(0, 0, 0.025));
    ventre('triceps', V(s * 0.21, 1.38), V(s * 0.235, 1.17), 0.028, V(0, 0, -0.028));
    ventre('antebraco', V(s * 0.25, 1.11), V(s * 0.28, 0.92), 0.028, V(0, 0, 0), V(1.1, 1, 1));
    ventre('gluteo', V(s * 0.09, 0.98, -0.07), V(s * 0.1, 0.86, -0.08), 0.065, V(0, 0, 0), V(1, 1, 0.8));
    ventre('quadriceps', V(s * 0.1, 0.9), V(s * 0.1, 0.56), 0.05, V(0, 0, 0.03));
    ventre('isquiotibiais', V(s * 0.1, 0.86), V(s * 0.1, 0.56), 0.045, V(0, 0, -0.035));
    ventre('gastrocnemio', V(s * 0.1, 0.45), V(s * 0.1, 0.24), 0.042, V(0, 0, -0.04));
    ventre('tibial_ant', V(s * 0.11, 0.44), V(s * 0.1, 0.16), 0.018, V(0, 0, 0.03));

    // ---- Tendões ----
    haste('t_calcaneo', V(s * 0.1, 0.25, -0.06), V(s * 0.1, 0.05, -0.06), 0.008);
    haste('t_patelar', V(s * 0.1, 0.47, 0.05), V(s * 0.098, 0.42, 0.035), 0.008);
    haste('t_quadriceps', V(s * 0.1, 0.56, 0.06), V(s * 0.1, 0.52, 0.05), 0.012);
    haste('t_biceps', V(s * 0.24, 1.17, 0.03), V(s * 0.25, 1.1, 0.015), 0.006);
    haste('t_flexores', V(s * 0.28, 0.93, 0.03), V(s * 0.285, 0.86, 0.035), 0.012);
  }
  ventre('reto_abd', V(0, 1.2, 0.08), V(0, 0.98, 0.07), 0.04, V(0, 0, 0), V(1.6, 1, 0.4));

  // ---- Artérias ----
  bola('coracao', V(0.025, 1.3, 0.03), 0.055, V(0.9, 1.1, 0.85));
  vaso('aorta', [V(0.02, 1.33, 0.03), V(0.02, 1.4, 0.02), V(-0.01, 1.42, -0.02), V(-0.015, 1.34, -0.035), V(-0.015, 1.15, -0.03), V(-0.01, 1.02, -0.01)], 0.011);
  for (const s of [-1, 1]) {
    vaso('carotidas', [V(s * 0.02, 1.41, 0), V(s * 0.03, 1.5, 0.01), V(s * 0.035, 1.6, 0.0)], 0.006);
    vaso('a_braquial', [V(s * 0.02, 1.41, 0), V(s * 0.14, 1.42, 0.0), V(s * 0.225, 1.33, 0.015), V(s * 0.245, 1.14, 0.02), V(s * 0.28, 0.9, 0.02)], 0.005);
    vaso('a_femoral', [V(-0.01, 1.02, -0.01), V(s * 0.07, 0.94, 0.02), V(s * 0.095, 0.7, 0.02), V(s * 0.1, 0.5, -0.03), V(s * 0.1, 0.12, 0.0)], 0.007);
  }

  // ---- Veias ----
  vaso('cava', [V(0.05, 1.42, 0.0), V(0.05, 1.33, 0.02), V(0.045, 1.22, 0.0), V(0.03, 1.1, -0.02), V(0.02, 1.0, -0.01)], 0.011);
  for (const s of [-1, 1]) {
    vaso('jugulares', [V(s * 0.04, 1.42, 0.01), V(s * 0.05, 1.5, 0.02), V(s * 0.055, 1.6, 0.0)], 0.006);
    vaso('v_braquial', [V(s * 0.04, 1.42, 0.01), V(s * 0.15, 1.43, 0.01), V(s * 0.235, 1.32, 0.0), V(s * 0.255, 1.14, 0.035), V(s * 0.29, 0.9, 0.035)], 0.005);
    vaso('v_femoral', [V(0.02, 1.0, -0.01), V(s * 0.08, 0.94, 0.03), V(s * 0.11, 0.7, 0.03), V(s * 0.11, 0.5, -0.02), V(s * 0.11, 0.12, 0.01)], 0.007);
  }

  // ---- Órgãos ----
  bola('encefalo', V(0, 1.665, -0.005), 0.085, V(0.9, 0.85, 1.05));
  bola('pulmoes', V(-0.07, 1.31, 0.0), 0.07, V(0.8, 1.35, 0.9));
  bola('pulmoes', V(0.075, 1.31, 0.0), 0.065, V(0.75, 1.3, 0.85));
  bola('figado', V(-0.06, 1.17, 0.02), 0.08, V(1.1, 0.55, 0.8), { color: '#9a3b2e' });
  bola('estomago', V(0.06, 1.15, 0.03), 0.05, V(1, 0.75, 0.7), { color: '#e58f6b' });
  for (const s of [-1, 1]) bola('rins', V(s * 0.06, 1.1, -0.05), 0.03, V(0.7, 1.15, 0.6), { color: '#8b2c2c' });
  const intest = new THREE.Mesh(new THREE.TorusKnotGeometry(0.045, 0.014, 96, 8, 3, 5), mat('orgaos', { color: '#f2b8a0' }));
  intest.position.set(0, 1.04, 0.03);
  intest.scale.set(1.1, 0.8, 0.6);
  add('intestinos', intest);
  bola('bexiga', V(0, 0.93, 0.04), 0.03, V(1, 0.85, 0.9), { color: '#f5d48a' });
}
