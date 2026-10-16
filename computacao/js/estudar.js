// Estudar: cartões com repetição espaçada (caixas de Leitner) para as matérias que mais reprovam

import { $, esc, uid, toast, store, openSheet, closeSheet } from './util.js';

// [pergunta, resposta]
export const DECKS = {
  bigo: {
    name: 'Complexidade (Big-O)',
    cards: [
      ['Busca binária em vetor ordenado', 'O(log n): corta o intervalo pela metade a cada passo'],
      ['Busca linear', 'O(n)'],
      ['Merge sort (melhor, médio e pior caso)', 'O(n log n) nos três; usa O(n) de memória extra; é estável'],
      ['Quick sort', 'Médio O(n log n); pior O(n²) (pivô ruim, ex.: vetor já ordenado com pivô no extremo); in-place; não é estável'],
      ['Heap sort', 'O(n log n) em todos os casos, in-place, não é estável'],
      ['Insertion sort', 'Pior O(n²); melhor O(n) com vetor quase ordenado; estável; ótimo para n pequeno'],
      ['Counting sort / radix sort', 'O(n + k) / O(d·(n + k)): não comparam elementos, por isso fogem do limite n log n'],
      ['Limite inferior de ordenação por comparação', 'Ω(n log n) (árvore de decisão com n! folhas)'],
      ['Acesso por índice: vetor × lista ligada', 'Vetor O(1); lista ligada O(n)'],
      ['Inserir no início: vetor × lista ligada', 'Vetor O(n) (desloca tudo); lista ligada O(1)'],
      ['Tabela hash: busca/inserção', 'O(1) em média; O(n) no pior caso (muitas colisões)'],
      ['Árvore binária de busca balanceada (AVL, rubro-negra)', 'Busca, inserção e remoção em O(log n)'],
      ['ABB não balanceada no pior caso', 'O(n): vira uma lista (inserção em ordem crescente)'],
      ['Heap binário: inserir, remover o topo, ver o topo', 'O(log n), O(log n), O(1); construir um heap de n itens: O(n)'],
      ['BFS e DFS em grafo com lista de adjacência', 'O(V + E)'],
      ['Dijkstra com heap binário', 'O((V + E) log V); não funciona com arestas negativas'],
      ['Bellman-Ford', 'O(V·E); aceita pesos negativos e detecta ciclo negativo'],
      ['Floyd-Warshall', 'O(V³): menores caminhos entre todos os pares'],
      ['Kruskal / Prim (árvore geradora mínima)', 'Kruskal O(E log E) com union-find; Prim O(E log V) com heap'],
      ['Teorema mestre: T(n) = 2T(n/2) + O(n)', 'O(n log n) (caso do merge sort)'],
      ['Teorema mestre: T(n) = T(n/2) + O(1)', 'O(log n) (caso da busca binária)'],
      ['Fibonacci recursivo ingênuo × com memoização', 'O(2ⁿ) aproximadamente × O(n)'],
    ],
  },
  estruturas: {
    name: 'Estruturas de dados',
    cards: [
      ['Pilha (stack)', 'LIFO: o último a entrar é o primeiro a sair. Usos: desfazer, chamadas de função, verificar parênteses, DFS iterativa'],
      ['Fila (queue)', 'FIFO: o primeiro a entrar é o primeiro a sair. Usos: BFS, fila de impressão, buffers'],
      ['Deque', 'Fila com inserção e remoção nas duas pontas. Usado em janela deslizante (máximo da janela)'],
      ['Heap / fila de prioridade', 'Árvore quase completa onde cada pai é ≤ (min-heap) ou ≥ (max-heap) que os filhos. Usos: Dijkstra, top-k, agendamento'],
      ['Trie', 'Árvore de prefixos: cada aresta é um caractere. Usos: autocompletar, dicionário, busca por prefixo'],
      ['Union-Find (conjuntos disjuntos)', 'Une conjuntos e responde "estão no mesmo grupo?". Com compressão de caminho + união por rank: quase O(1)'],
      ['Segment tree / Fenwick (BIT)', 'Consultas e atualizações em intervalos (soma, mínimo) em O(log n)'],
      ['Grafo: matriz × lista de adjacência', 'Matriz: O(V²) de memória, checa aresta em O(1). Lista: O(V + E), melhor para grafo esparso'],
      ['Percursos em árvore binária', 'Pré-ordem: raiz, esq, dir\nEm ordem: esq, raiz, dir (numa ABB sai ordenado)\nPós-ordem: esq, dir, raiz'],
      ['Ordenação topológica', 'Ordena vértices de um DAG respeitando as dependências (Kahn com fila de grau de entrada 0, ou DFS)'],
      ['Colisão em hash: duas estratégias', 'Encadeamento (lista em cada posição) e endereçamento aberto (sondagem linear, quadrática, hash duplo)'],
      ['Fator de carga', 'n / tamanho da tabela. Passou do limite (ex.: 0,75) → redimensiona e reespalha'],
    ],
  },
  padroes: {
    name: 'Padrões de entrevista',
    cards: [
      ['"Par de números que soma X" em vetor não ordenado', 'Hash map com o complemento: O(n)'],
      ['Mesmo problema com vetor ordenado', 'Dois ponteiros (um em cada ponta): O(n), O(1) de memória'],
      ['"Maior substring/subvetor contínuo que..."', 'Janela deslizante (sliding window)'],
      ['"Soma de um intervalo" muitas vezes', 'Soma de prefixos: soma(i..j) = P[j+1] − P[i]'],
      ['"Menor caminho" em grafo sem peso / grade', 'BFS'],
      ['"Todas as combinações / permutações / subconjuntos"', 'Backtracking'],
      ['"Quantas formas de..." / "valor máximo com escolhas"', 'Programação dinâmica: defina o estado, a transição e o caso base'],
      ['"K maiores / K mais frequentes"', 'Heap de tamanho k: O(n log k)'],
      ['Detectar ciclo em lista ligada', 'Ponteiros lento e rápido (Floyd, tartaruga e lebre)'],
      ['"Próximo maior elemento"', 'Pilha monotônica'],
      ['Intervalos sobrepostos', 'Ordene pelo início e una em uma passada'],
      ['Buscar resposta em espaço monotônico ("menor capacidade que dá certo")', 'Busca binária na resposta'],
      ['Componentes conectados / "ilhas" na grade', 'DFS/BFS marcando visitados, ou Union-Find'],
    ],
  },
  so: {
    name: 'Sistemas operacionais',
    cards: [
      ['Processo × thread', 'Processo tem espaço de memória próprio; threads do mesmo processo compartilham memória e recursos, mas têm pilha e registradores próprios'],
      ['4 condições de Coffman para deadlock', 'Exclusão mútua, posse e espera, não preempção, espera circular. Quebre uma e não há deadlock'],
      ['Condição de corrida', 'Resultado depende da ordem de execução de threads acessando dado compartilhado. Solução: seção crítica com mutex/semáforo'],
      ['Mutex × semáforo', 'Mutex: trava binária com dono. Semáforo: contador que permite até N acessos (wait/signal, P/V)'],
      ['Escalonamento: FCFS, SJF, Round Robin', 'FCFS: ordem de chegada (efeito comboio). SJF: menor primeiro (ótimo no tempo médio, risco de inanição). RR: fatias de tempo (quantum)'],
      ['Paginação', 'Memória dividida em páginas (lógicas) e quadros (físicos) do mesmo tamanho; a tabela de páginas traduz; a TLB faz cache da tradução'],
      ['Page fault', 'A página acessada não está na RAM: o SO busca no disco e, se preciso, escolhe uma vítima (FIFO, LRU, ótimo)'],
      ['Thrashing', 'O sistema passa mais tempo trocando páginas do que executando, por falta de quadros'],
      ['Troca de contexto', 'Salvar o estado (registradores, PC) de um processo e carregar o de outro; custa tempo'],
      ['Chamada de sistema (syscall)', 'Forma de um programa pedir um serviço ao núcleo (modo usuário → modo núcleo). Ex.: read, write, fork'],
    ],
  },
  redes: {
    name: 'Redes',
    cards: [
      ['Camadas do modelo TCP/IP', 'Aplicação, transporte, rede (internet), enlace (+ física)'],
      ['7 camadas OSI (de baixo para cima)', 'Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação\nMnemônico: "Fiz Esse Rap Tocando Samba Para Ana"'],
      ['TCP × UDP', 'TCP: com conexão, confiável, ordenado, controle de fluxo e congestionamento. UDP: sem conexão, sem garantia, menor atraso (voz, jogos, DNS)'],
      ['Three-way handshake', 'SYN → SYN-ACK → ACK'],
      ['Portas: HTTP, HTTPS, SSH, DNS, SMTP', '80, 443, 22, 53, 25'],
      ['O que o DNS faz', 'Traduz nome (exemplo.com) em endereço IP'],
      ['DHCP', 'Entrega IP, máscara, gateway e DNS automaticamente para quem entra na rede'],
      ['NAT', 'Vários dispositivos com IP privado saem para a internet com um IP público'],
      ['Faixas de IP privado', '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'],
      ['/24 tem quantos hosts utilizáveis?', '254 (256 − rede − broadcast)'],
      ['Códigos HTTP 200, 201, 301, 400, 401, 403, 404, 500', 'OK, Criado, Movido permanentemente, Requisição inválida, Não autenticado, Proibido, Não encontrado, Erro interno'],
      ['O que acontece ao digitar uma URL', 'DNS → conexão TCP (+ TLS) → requisição HTTP → resposta → navegador monta DOM/CSS, baixa recursos e renderiza'],
    ],
  },
  bd: {
    name: 'Banco de dados',
    cards: [
      ['ACID', 'Atomicidade, Consistência, Isolamento, Durabilidade'],
      ['1FN', 'Valores atômicos: sem atributos multivalorados ou grupos repetidos'],
      ['2FN', 'Está na 1FN e todo atributo não chave depende da chave inteira (sem dependência parcial)'],
      ['3FN', 'Está na 2FN e não há dependência transitiva (não chave dependendo de outro não chave)'],
      ['INNER × LEFT JOIN', 'INNER: só as linhas com correspondência nas duas tabelas. LEFT: todas da esquerda, com NULL onde não há par'],
      ['WHERE × HAVING', 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois do GROUP BY'],
      ['Ordem lógica de execução do SELECT', 'FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT'],
      ['Índice', 'Estrutura (geralmente árvore B+) que acelera buscas; custa espaço e deixa INSERT/UPDATE mais lentos'],
      ['Chave primária × estrangeira', 'Primária identifica a linha (única, não nula). Estrangeira referencia a primária de outra tabela (integridade referencial)'],
      ['SQL injection: como evitar', 'Consultas parametrizadas (prepared statements). Nunca concatene entrada do usuário no SQL'],
      ['Teorema CAP', 'Num sistema distribuído com partição de rede, escolha entre consistência e disponibilidade'],
    ],
  },
  poo: {
    name: 'POO, SOLID e padrões',
    cards: [
      ['4 pilares da POO', 'Abstração, encapsulamento, herança, polimorfismo'],
      ['S do SOLID', 'Responsabilidade única: uma classe deve ter um só motivo para mudar'],
      ['O do SOLID', 'Aberto/fechado: aberto para extensão, fechado para modificação'],
      ['L do SOLID', 'Substituição de Liskov: uma subclasse deve poder ocupar o lugar da classe base sem quebrar nada'],
      ['I do SOLID', 'Segregação de interfaces: várias interfaces específicas são melhores que uma geral'],
      ['D do SOLID', 'Inversão de dependência: dependa de abstrações, não de implementações'],
      ['Sobrecarga × sobrescrita', 'Sobrecarga: mesmo nome, parâmetros diferentes (em compilação). Sobrescrita: subclasse redefine o método (em execução)'],
      ['Composição × herança', '"Tem um" × "é um". Prefira composição: menos acoplamento'],
      ['Singleton', 'Garante uma única instância com acesso global (cuidado: dificulta testes)'],
      ['Strategy', 'Troca o algoritmo em tempo de execução por meio de uma interface comum'],
      ['Observer', 'Objetos se inscrevem para ser avisados quando outro muda (eventos, pub/sub)'],
      ['Factory', 'Centraliza a criação de objetos, escondendo qual classe concreta é criada'],
      ['Adapter', 'Faz uma interface incompatível funcionar com o que o cliente espera'],
      ['DRY, KISS, YAGNI', 'Não se repita; mantenha simples; você não vai precisar disso (não construa antes da hora)'],
    ],
  },
  git: {
    name: 'Git e terminal',
    cards: [
      ['Criar branch e já mudar para ela', 'git switch -c nome   (ou git checkout -b nome)'],
      ['Ver o que mudou e ainda não foi para o stage', 'git diff   (já no stage: git diff --staged)'],
      ['Desfazer o último commit mantendo as mudanças', 'git reset --soft HEAD~1'],
      ['Desfazer um commit que já foi enviado', 'git revert <hash> (cria um commit que desfaz, sem reescrever histórico)'],
      ['Guardar mudanças sem commitar', 'git stash   e depois   git stash pop'],
      ['merge × rebase', 'Merge junta com um commit de merge e preserva o histórico. Rebase reaplica seus commits sobre a outra branch (histórico linear). Não faça rebase de branch compartilhada'],
      ['Atualizar a branch com o remoto', 'git pull (= fetch + merge) ou git pull --rebase'],
      ['Corrigir a mensagem do último commit (ainda não enviado)', 'git commit --amend'],
      ['Ver histórico resumido em grafo', 'git log --oneline --graph --all'],
      ['Permissões chmod 755', 'Dono: rwx; grupo: r-x; outros: r-x'],
      ['Procurar texto em arquivos (terminal)', 'grep -rn "texto" pasta/'],
      ['Redirecionar saída e erros para arquivo', 'comando > saida.txt 2>&1'],
    ],
  },
  discreta: {
    name: 'Matemática discreta e lógica',
    cards: [
      ['Leis de De Morgan', '¬(A ∧ B) ≡ ¬A ∨ ¬B\n¬(A ∨ B) ≡ ¬A ∧ ¬B'],
      ['A → B é equivalente a', '¬A ∨ B   (e à contrapositiva ¬B → ¬A)'],
      ['Combinação C(n, k)', 'n! / (k!·(n − k)!): a ordem não importa'],
      ['Arranjo A(n, k)', 'n! / (n − k)!: a ordem importa'],
      ['Princípio da casa dos pombos', 'Com n + 1 objetos em n caixas, alguma caixa tem pelo menos 2'],
      ['Indução: os dois passos', 'Base: vale para n₀. Passo: se vale para k, vale para k + 1'],
      ['Soma 1 + 2 + ... + n', 'n(n + 1) / 2'],
      ['Soma 1 + 2 + 4 + ... + 2ⁿ', '2ⁿ⁺¹ − 1'],
      ['Nº de arestas de um grafo completo Kₙ', 'n(n − 1) / 2'],
      ['Árvore com n vértices tem quantas arestas?', 'n − 1'],
      ['Grafo euleriano (circuito)', 'Conexo e todos os vértices com grau par'],
      ['log₂ de 1.024 / 1.048.576', '10 / 20'],
      ['Complemento de 2 de um número negativo', 'Inverta os bits do positivo e some 1. Com 8 bits: −1 = 11111111'],
    ],
  },
};

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]; // caixa 1 a 5 (índice 0 não usado)
const DAY = 86_400_000;

let deckKey = store.get('deck', 'bigo');
let current = null;
let showAnswer = false;

function allDecks() {
  const custom = store.get('customCards', []);
  return { ...DECKS, meus: { name: 'Meus cartões', cards: custom.map(c => [c.q, c.a, c.id]) } };
}

// id estável de cada cartão = deck + índice (ou id do cartão criado)
const cardId = (deck, card, i) => card[2] || `${deck}:${i}`;

function progress() { return store.get('leitner', {}); }

function dueCards(deck) {
  const p = progress();
  const now = Date.now();
  return allDecks()[deck].cards
    .map((c, i) => ({ q: c[0], a: c[1], id: cardId(deck, c, i), st: p[cardId(deck, c, i)] || { box: 1, due: 0 } }))
    .filter(c => c.st.due <= now)
    .sort((a, b) => a.st.box - b.st.box || a.st.due - b.st.due);
}

function boxCounts(deck) {
  const p = progress();
  const counts = [0, 0, 0, 0, 0];
  allDecks()[deck].cards.forEach((c, i) => { counts[(p[cardId(deck, c, i)]?.box || 1) - 1]++; });
  return counts;
}

export function renderEstudar(root) {
  const decks = allDecks();
  if (!decks[deckKey]) deckKey = 'bigo';
  const due = dueCards(deckKey);
  current = due[0] || null;
  showAnswer = false;
  const counts = boxCounts(deckKey);

  root.innerHTML = `
    <h1>Estudar e decorar</h1>
    <p class="muted">Cartões com repetição espaçada: o que você erra volta logo, o que você acerta volta depois de alguns dias.</p>
    <div class="chips" id="deckChips">
      ${Object.entries(decks).map(([k, d]) => `<button type="button" class="chip ${k === deckKey ? 'on' : ''}" data-d="${k}">${esc(d.name)} (${d.cards.length})</button>`).join('')}
    </div>

    <div class="boxes" aria-label="Cartões por caixa">
      ${counts.map((n, i) => `<span><b>${n}</b>${i === 0 ? 'Novos/errados' : i === 4 ? 'Dominados' : 'Caixa ' + (i + 1)}</span>`).join('')}
    </div>

    <div class="card flash" id="flash" style="margin-top:12px" tabindex="0" role="button" aria-label="Virar cartão"></div>
    <div class="row" id="answerBtns" style="justify-content:center"></div>
    <p class="muted" style="text-align:center;font-size:.85rem" id="dueInfo"></p>

    <div class="row" style="margin-top:8px">
      <button type="button" class="soft" id="newCard">＋ Criar cartão</button>
      <button type="button" class="ghost small" id="resetDeck">Recomeçar este baralho</button>
    </div>

    <h2>Dicas para estudar computação de verdade</h2>
    <div class="card">
      <ul>
        <li><b>Teste-se</b> em vez de só reler: tentar lembrar é o que fixa (prática de recuperação).</li>
        <li><b>Escreva o código à mão</b> antes de rodar: simule o algoritmo num exemplo pequeno, linha por linha (teste de mesa).</li>
        <li><b>Não copie a solução</b>: travou 30–45 min? Leia só a dica, feche e tente de novo. Volte ao problema 3 dias depois.</li>
        <li><b>Espace</b> as revisões: 25 min por dia vencem 6 h na véspera.</li>
        <li><b>Explique em voz alta</b> (técnica do patinho de borracha / Feynman): se não sai fácil, você ainda não entendeu.</li>
        <li><b>Cálculo e Discreta</b> também se treinam fazendo lista: resolva os exercícios ímpares e confira no gabarito.</li>
        <li><b>Use IA como monitor, não como cola</b>: peça dica, explicação ou revisão do seu código — não a resposta pronta da lista.</li>
      </ul>
    </div>
  `;

  $('#deckChips').onclick = e => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    deckKey = b.dataset.d;
    store.set('deck', deckKey);
    renderEstudar(root);
  };
  $('#flash').onclick = flip;
  $('#flash').onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
  $('#newCard').onclick = () => openNewCard(root);
  $('#resetDeck').onclick = () => {
    if (!confirm('Voltar todos os cartões deste baralho para a caixa 1?')) return;
    const p = progress();
    allDecks()[deckKey].cards.forEach((c, i) => delete p[cardId(deckKey, c, i)]);
    store.set('leitner', p);
    renderEstudar(root);
  };
  drawCard(root);

  function flip() {
    if (!current) return;
    showAnswer = !showAnswer;
    drawCard(root);
  }
}

function drawCard(root) {
  const flash = $('#flash');
  const btns = $('#answerBtns');
  const total = allDecks()[deckKey].cards.length;
  const due = dueCards(deckKey).length;
  $('#dueInfo').textContent = total ? `${due} para revisar agora` : '';

  if (!total) {
    flash.innerHTML = `<p class="muted">Nenhum cartão aqui ainda.<br>Crie os seus com o botão abaixo — ótimo para o conteúdo da sua prova.</p>`;
    btns.innerHTML = '';
    return;
  }
  if (!current) {
    const p = progress();
    const next = Math.min(...allDecks()[deckKey].cards.map((c, i) => p[cardId(deckKey, c, i)]?.due || 0));
    flash.innerHTML = `<div class="q">Tudo revisado! 🎉</div><p class="muted">Próxima revisão ${next ? 'em ' + new Date(next).toLocaleDateString('pt-BR') : 'quando quiser'}.</p>`;
    btns.innerHTML = '';
    return;
  }
  flash.innerHTML = `<div class="q">${esc(current.q)}</div>${showAnswer ? `<div class="a">${esc(current.a)}</div>` : '<p class="muted" style="margin-top:12px">Toque para ver a resposta</p>'}`;
  btns.innerHTML = showAnswer
    ? `<button type="button" class="danger" data-ans="0">Errei</button><button type="button" class="soft" data-ans="1">Quase</button><button type="button" data-ans="2">Acertei</button>`
    : '';
  btns.onclick = e => {
    const b = e.target.closest('[data-ans]');
    if (!b) return;
    const p = progress();
    const st = p[current.id] || { box: 1, due: 0 };
    const ans = Number(b.dataset.ans);
    st.box = ans === 0 ? 1 : ans === 1 ? Math.max(1, st.box) : Math.min(5, st.box + 1);
    st.due = Date.now() + INTERVAL_DAYS[st.box] * DAY;
    // errado volta ainda nesta sessão, alguns segundos depois
    if (ans === 0) st.due = Date.now() + 30_000;
    p[current.id] = st;
    store.set('leitner', p);
    renderEstudar(root);
  };
}

function openNewCard(root) {
  const body = openSheet('Novo cartão', `
    <form id="cardForm">
      <label for="cQ">Frente (pergunta)</label>
      <textarea id="cQ" required placeholder="Ex.: Complexidade do insertion sort no melhor caso"></textarea>
      <label for="cA">Verso (resposta)</label>
      <textarea id="cA" required placeholder="Ex.: O(n), quando o vetor já está ordenado"></textarea>
      <button type="submit" style="width:100%;margin-top:12px">Salvar em "Meus cartões"</button>
    </form>`);
  $('#cardForm', body).onsubmit = e => {
    e.preventDefault();
    const q = $('#cQ', body).value.trim();
    const a = $('#cA', body).value.trim();
    if (!q || !a) return;
    const list = store.get('customCards', []);
    list.push({ id: 'meu:' + uid(), q, a });
    store.set('customCards', list);
    deckKey = 'meus';
    store.set('deck', deckKey);
    closeSheet();
    toast('Cartão criado');
    renderEstudar(root);
  };
}
