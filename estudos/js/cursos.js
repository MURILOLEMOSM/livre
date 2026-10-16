/* =========================================================
   CAMPUS · Conteúdo por curso
   Cada curso é um módulo de dados com a mesma forma:
   - areas: grandes áreas do curso. Cada disciplina cadastrada
     cai numa área pelas palavras-chave do nome.
       dicas   → dicas de estudo da área
       topicos → tópicos mais cobrados (base dos resumos)
   - gradeSugerida: grade de exemplo para começar rápido
   - visual: qual tela o Atlas mostra (3D ou diagramas)
   Para criar um curso novo, copie um bloco e preencha.
   ========================================================= */

export const CURSOS = {
  medicina: {
    id: 'medicina',
    nome: 'Medicina',
    sigla: 'MED',
    cor: '#2dd4bf',
    visual: 'atlas3d',
    abaVisual: 'Atlas 3D',
    dicasGerais: [
      'Faça revisão espaçada (1, 7 e 30 dias) do conteúdo da semana. A curva do esquecimento é implacável na anatomia e na farmacologia.',
      'Estude por casos clínicos: ligue cada estrutura ou fármaco a um paciente, a um sintoma e a uma conduta.',
      'Use flashcards (Anki) só para o que precisa ser decorado. Mecanismos você entende desenhando.',
    ],
    areas: {
      anatomia: {
        nome: 'Anatomia',
        keywords: ['anatomia', 'neuroanatomia', 'morfologia'],
        dicas: [
          'Estude na ordem osso → músculo (origem, inserção, ação) → nervo → vaso. Cada camada se apoia na anterior.',
          'Desenhe as estruturas de memória e confira com o atlas. Errar o desenho mostra exatamente o que falta fixar.',
          'Mnemônico do plexo braquial: "Raízes, Troncos, Divisões, Cordões, Ramos" — "Rapaz Tímido Dança Com Rainha".',
          'Use o Atlas 3D do app girando a peça: a prova prática pede reconhecer a estrutura em qualquer ângulo.',
        ],
        topicos: ['Sistema esquelético e articulações', 'Músculos: origem, inserção, ação e inervação', 'Plexos braquial e lombossacral', 'Irrigação arterial e drenagem venosa', 'Mediastino e coração', 'Anatomia de superfície e correlação clínica'],
      },
      fisiologia: {
        nome: 'Fisiologia',
        keywords: ['fisiologia', 'biofisica'],
        dicas: [
          'Monte fluxogramas de causa e efeito (ex.: queda da PA → barorreceptores → simpático → FC e RVP sobem).',
          'Explique cada mecanismo em voz alta como se ensinasse alguém. Onde você trava é onde falta entender.',
          'Gráficos (curva de Frank-Starling, de dissociação da hemoglobina) caem muito: saiba desenhar e deslocar a curva.',
        ],
        topicos: ['Potencial de membrana e de ação', 'Ciclo cardíaco e débito cardíaco', 'Mecânica respiratória e trocas gasosas', 'Filtração glomerular e equilíbrio hidroeletrolítico', 'Eixos endócrinos e retroalimentação', 'Contração muscular'],
      },
      bioquimica: {
        nome: 'Bioquímica',
        keywords: ['bioquimica', 'biologia molecular', 'genetica', 'metabolismo'],
        dicas: [
          'Não decore todas as reações: saiba as enzimas reguladoras de cada via e o que as ativa ou inibe.',
          'Relacione cada via a uma doença (ex.: deficiência de G6PD → anemia hemolítica). Fica na memória.',
          'Faça um mapa único do metabolismo integrado (jejum × alimentado) e revise por ele.',
        ],
        topicos: ['Glicólise, ciclo de Krebs e cadeia respiratória', 'Metabolismo de lipídios e corpos cetônicos', 'Estado alimentado × jejum', 'Enzimas e cinética', 'Replicação, transcrição e tradução'],
      },
      histologia: {
        nome: 'Histologia e Embriologia',
        keywords: ['histologia', 'embriologia', 'citologia', 'biologia celular'],
        dicas: [
          'Treine com lâminas reais: descreva o tecido (células, núcleo, matriz) antes de olhar a legenda.',
          'Na embriologia, faça uma linha do tempo por semana de gestação e ligue cada evento a uma malformação.',
        ],
        topicos: ['Tecidos epiteliais e glândulas', 'Tecido conjuntivo, cartilagem e osso', 'Tecido muscular e nervoso', 'Gastrulação e folhetos embrionários', 'Organogênese e malformações'],
      },
      farmacologia: {
        nome: 'Farmacologia',
        keywords: ['farmacologia', 'terapeutica'],
        dicas: [
          'Aprenda por classe: mecanismo → efeito → efeitos adversos → interações. O nome do fármaco vem depois.',
          'Os sufixos ajudam: -olol (betabloqueador), -pril (IECA), -sartana (BRA), -statina (estatina).',
          'Monte uma tabela de antídotos (paracetamol → N-acetilcisteína; opioides → naloxona; benzodiazepínicos → flumazenil).',
        ],
        topicos: ['Farmacocinética (ADME) e farmacodinâmica', 'Sistema nervoso autônomo', 'Anti-hipertensivos e antiarrítmicos', 'Antimicrobianos', 'Analgésicos, AINEs e opioides', 'Antídotos e intoxicações'],
      },
      patologia: {
        nome: 'Patologia',
        keywords: ['patologia', 'anatomia patologica', 'processos patologicos'],
        dicas: [
          'Sempre ligue a lesão ao mecanismo: agressão → resposta celular → aspecto macro e microscópico.',
          'Compare pares parecidos em tabela (necrose × apoptose; hiperplasia × metaplasia × displasia).',
        ],
        topicos: ['Lesão e morte celular (necrose e apoptose)', 'Inflamação aguda e crônica', 'Reparo tecidual', 'Distúrbios hemodinâmicos (trombose, embolia, infarto)', 'Neoplasias'],
      },
      microbiologia: {
        nome: 'Microbiologia e Imunologia',
        keywords: ['microbiologia', 'imunologia', 'parasitologia', 'infectologia'],
        dicas: [
          'Para cada agente: morfologia, transmissão, doença, diagnóstico e tratamento — sempre na mesma ordem.',
          'Na imunologia, desenhe a sinapse imunológica e as vias Th1, Th2 e Th17 até ficar automático.',
        ],
        topicos: ['Imunidade inata e adaptativa', 'Imunoglobulinas e sistema complemento', 'Hipersensibilidades (tipos I a IV)', 'Bactérias gram-positivas e gram-negativas', 'Parasitoses de importância no Brasil'],
      },
      semiologia: {
        nome: 'Semiologia',
        keywords: ['semiologia', 'propedeutica', 'habilidades', 'exame fisico'],
        dicas: [
          'Treine a anamnese em roteiro fixo (identificação, QP, HDA, ISDA, antecedentes, hábitos) até sair sem pensar.',
          'Pratique o exame físico em colegas cronometrando. A prova prática avalia sequência e técnica.',
          'Associe cada sinal semiológico ao achado que ele indica (Murphy → colecistite; Blumberg → peritonite).',
        ],
        topicos: ['Anamnese completa', 'Sinais vitais', 'Exame cardiovascular e respiratório', 'Exame abdominal', 'Exame neurológico'],
      },
      clinica: {
        nome: 'Clínica e Especialidades',
        keywords: ['clinica', 'cirurgia', 'pediatria', 'ginecologia', 'obstetricia', 'cardiologia', 'pneumologia', 'gastro', 'nefrologia', 'endocrino', 'psiquiatria', 'internato', 'urgencia', 'emergencia'],
        dicas: [
          'Estude pelos protocolos e diretrizes atuais (SBC, Ministério da Saúde): é o que as provas de residência cobram.',
          'Resolva questões de residência desde cedo e anote o "porquê" de cada erro num caderno de erros.',
        ],
        topicos: ['Diagnóstico diferencial', 'Exames complementares e interpretação', 'Conduta inicial e protocolos', 'Emergências clínicas'],
      },
      coletiva: {
        nome: 'Saúde Coletiva',
        keywords: ['saude coletiva', 'epidemiologia', 'saude publica', 'bioestatistica', 'sus', 'medicina preventiva'],
        dicas: [
          'Domine a tabela 2×2: sensibilidade, especificidade, VPP e VPN saem dela.',
          'Leia a Lei 8.080/90 e a 8.142/90 com marca-texto: princípios do SUS caem em toda prova.',
        ],
        topicos: ['Princípios e diretrizes do SUS', 'Indicadores de saúde', 'Desenhos de estudo epidemiológico', 'Testes diagnósticos (tabela 2×2)', 'Vigilância epidemiológica'],
      },
    },
    gradeSugerida: [
      { nome: 'Anatomia Humana I', semestre: 1 },
      { nome: 'Histologia e Embriologia', semestre: 1 },
      { nome: 'Bioquímica Médica', semestre: 1 },
      { nome: 'Fisiologia I', semestre: 2 },
      { nome: 'Saúde Coletiva e Epidemiologia', semestre: 2 },
      { nome: 'Imunologia', semestre: 3 },
      { nome: 'Farmacologia', semestre: 4 },
      { nome: 'Patologia Geral', semestre: 4 },
      { nome: 'Semiologia Médica', semestre: 5 },
    ],
  },

  fisioterapia: {
    id: 'fisioterapia',
    nome: 'Fisioterapia',
    sigla: 'FISIO',
    cor: '#a3e635',
    visual: 'atlas3d',
    abaVisual: 'Atlas 3D',
    dicasGerais: [
      'Aprenda palpando: localize em você mesmo cada músculo e acidente ósseo que estudar.',
      'Ligue anatomia e movimento: para cada músculo, pense em um exercício que o fortalece e outro que o alonga.',
      'Grave vídeos dos seus testes especiais e compare com a técnica descrita nos livros.',
    ],
    areas: {
      anatomia: {
        nome: 'Anatomia',
        keywords: ['anatomia', 'neuroanatomia'],
        dicas: [
          'Foque no sistema musculoesquelético: origem, inserção, ação e inervação de cada músculo.',
          'Use o Atlas 3D com as camadas de músculos e tendões ligadas para ver as relações entre eles.',
          'Palpação: localize os acidentes ósseos antes dos músculos. Eles são os pontos de referência.',
        ],
        topicos: ['Ossos e acidentes ósseos palpáveis', 'Músculos dos membros e do tronco', 'Articulações e ligamentos', 'Plexos e nervos periféricos', 'Anatomia de superfície'],
      },
      cinesiologia: {
        nome: 'Cinesiologia e Biomecânica',
        keywords: ['cinesiologia', 'biomecanica', 'cinesioterapia', 'movimento'],
        dicas: [
          'Analise cada movimento em plano, eixo, agonista, antagonista e tipo de contração.',
          'Desenhe as alavancas do corpo (1ª, 2ª e 3ª classe) com o ponto de força, de apoio e de resistência.',
          'Filme gestos do dia a dia (sentar, levantar, subir escada) e descreva a cinesiologia de cada fase.',
        ],
        topicos: ['Planos e eixos de movimento', 'Tipos de contração muscular', 'Alavancas do corpo humano', 'Análise da marcha', 'Cadeias cinéticas aberta e fechada'],
      },
      fisiologia: {
        nome: 'Fisiologia e Fisiologia do Exercício',
        keywords: ['fisiologia', 'exercicio'],
        dicas: [
          'Relacione cada sistema energético (ATP-CP, glicolítico, oxidativo) à duração e à intensidade do esforço.',
          'Entenda as adaptações agudas e crônicas ao treino: elas justificam a prescrição.',
        ],
        topicos: ['Tipos de fibra muscular', 'Sistemas energéticos', 'Respostas cardiovasculares ao exercício', 'Adaptações ao treinamento'],
      },
      avaliacao: {
        nome: 'Avaliação Fisioterapêutica',
        keywords: ['avaliacao', 'semiologia', 'cinesiologia funcional', 'diagnostico'],
        dicas: [
          'Monte fichas de avaliação próprias e preencha com colegas. A sequência tem que sair natural.',
          'Para cada teste especial, saiba: posição, execução, achado positivo e o que ele sugere.',
        ],
        topicos: ['Goniometria', 'Teste de força muscular (escala MRC)', 'Testes ortopédicos especiais', 'Avaliação postural', 'Escalas funcionais'],
      },
      neuro: {
        nome: 'Fisioterapia Neurofuncional',
        keywords: ['neuro', 'neurologia', 'neurofuncional'],
        dicas: [
          'Diferencie bem lesão do neurônio motor superior × inferior: tônus, reflexos, trofismo e sinais.',
          'Estude as escalas (Ashworth modificada, Berg, Fugl-Meyer) aplicando em casos.',
        ],
        topicos: ['AVE e hemiplegia', 'Tônus e espasticidade', 'Controle motor e plasticidade', 'Doença de Parkinson', 'Lesão medular'],
      },
      ortopedia: {
        nome: 'Ortopedia e Traumatologia',
        keywords: ['ortopedia', 'traumato', 'musculoesquelet', 'esportiva', 'reumato'],
        dicas: [
          'Para cada lesão: mecanismo, quadro clínico, teste especial, tratamento e fases da reabilitação.',
          'Conheça os tempos de consolidação e cicatrização: eles definem quando progredir a carga.',
        ],
        topicos: ['Fraturas e consolidação óssea', 'Lesões ligamentares do joelho', 'Ombro doloroso e manguito rotador', 'Lombalgia', 'Pós-operatórios ortopédicos'],
      },
      cardiorresp: {
        nome: 'Cardiorrespiratória',
        keywords: ['respiratoria', 'cardio', 'pneumo', 'uti', 'intensiva', 'cardiorrespiratoria'],
        dicas: [
          'Ausculte colegas e áudios de sons pulmonares até reconhecer cada ruído adventício.',
          'Domine a gasometria: pH, PaCO₂ e HCO₃⁻ em ordem fixa para não errar a interpretação.',
        ],
        topicos: ['Mecânica respiratória', 'Ausculta pulmonar', 'Técnicas de higiene brônquica', 'Gasometria arterial', 'Reabilitação cardíaca'],
      },
      recursos: {
        nome: 'Recursos Terapêuticos',
        keywords: ['eletroterapia', 'termoterapia', 'fototerapia', 'recursos', 'hidroterapia', 'eletrotermo'],
        dicas: [
          'Para cada recurso, faça uma ficha: efeitos fisiológicos, indicações, contraindicações e parâmetros.',
          'As contraindicações caem muito em prova e são as que mais protegem o paciente. Revise sempre.',
        ],
        topicos: ['TENS e FES', 'Ultrassom terapêutico', 'Laser de baixa potência', 'Crioterapia e termoterapia', 'Contraindicações gerais'],
      },
    },
    gradeSugerida: [
      { nome: 'Anatomia Humana', semestre: 1 },
      { nome: 'Fisiologia Humana', semestre: 2 },
      { nome: 'Cinesiologia e Biomecânica', semestre: 2 },
      { nome: 'Avaliação Fisioterapêutica', semestre: 3 },
      { nome: 'Eletrotermofototerapia', semestre: 4 },
      { nome: 'Fisioterapia em Ortopedia e Traumatologia', semestre: 5 },
      { nome: 'Fisioterapia Neurofuncional', semestre: 6 },
      { nome: 'Fisioterapia Cardiorrespiratória', semestre: 6 },
    ],
  },

  computacao: {
    id: 'computacao',
    nome: 'Ciência da Computação',
    sigla: 'CC',
    cor: '#60a5fa',
    visual: 'diagramas',
    abaVisual: 'Diagramas',
    dicasGerais: [
      'Programe todo dia, nem que sejam 30 minutos. Ler código não substitui escrever código.',
      'Para cada conceito, implemente do zero uma versão pequena (uma pilha, um parser, um servidor HTTP).',
      'Use Git desde o primeiro trabalho e mantenha um portfólio no GitHub.',
    ],
    areas: {
      programacao: {
        nome: 'Programação',
        keywords: ['programacao', 'algoritmos e programacao', 'linguagem', 'introducao a computacao', 'orientacao a objetos', 'poo', 'python', 'java'],
        dicas: [
          'Resolva exercícios em plataformas (Beecrowd, LeetCode, Exercism) aumentando a dificuldade aos poucos.',
          'Leia a mensagem de erro inteira antes de pedir ajuda. Ela quase sempre diz a linha e o motivo.',
          'Faça "teste de mesa": execute o código no papel, linha por linha, anotando as variáveis.',
        ],
        topicos: ['Variáveis, tipos e operadores', 'Estruturas de decisão e repetição', 'Funções e recursão', 'Orientação a objetos', 'Tratamento de erros e testes'],
      },
      estruturas: {
        nome: 'Estruturas de Dados e Algoritmos',
        keywords: ['estrutura de dados', 'estruturas de dados', 'algoritmo', 'projeto e analise', 'grafos', 'complexidade'],
        dicas: [
          'Desenhe a estrutura (nós, ponteiros, árvore) antes de codar cada operação.',
          'Para cada algoritmo, saiba a complexidade no melhor, no médio e no pior caso, e o porquê.',
          'Use visualizadores (VisuAlgo) para ver ordenações e buscas passo a passo.',
        ],
        topicos: ['Notação Big-O', 'Listas, pilhas e filas', 'Árvores e heaps', 'Tabelas hash', 'Grafos: BFS, DFS e Dijkstra', 'Ordenação'],
      },
      matematica: {
        nome: 'Matemática e Fundamentos',
        keywords: ['calculo', 'discreta', 'algebra', 'logica', 'probabilidade', 'estatistica', 'geometria analitica'],
        dicas: [
          'Resolva muitos exercícios: matemática se aprende com lápis, não lendo a resolução pronta.',
          'Na matemática discreta, refaça as demonstrações (indução, contradição) sem olhar.',
        ],
        topicos: ['Lógica proposicional', 'Conjuntos e funções', 'Indução matemática', 'Combinatória', 'Limites, derivadas e integrais'],
      },
      sistemas: {
        nome: 'Arquitetura e Sistemas Operacionais',
        keywords: ['sistemas operacionais', 'arquitetura de computadores', 'organizacao de computadores', 'circuitos', 'sistemas digitais', 'compiladores', 'distribuidos'],
        dicas: [
          'Simule escalonadores e algoritmos de substituição de página à mão, em tabela.',
          'Escreva programas com threads e veja as condições de corrida acontecerem.',
        ],
        topicos: ['Processos e threads', 'Escalonamento de CPU', 'Memória virtual e paginação', 'Deadlocks', 'Hierarquia de memória e cache'],
      },
      redes: {
        nome: 'Redes de Computadores',
        keywords: ['redes', 'internet', 'seguranca', 'teleprocessamento'],
        dicas: [
          'Use o Wireshark para ver os pacotes reais de uma requisição HTTP, do DNS ao TCP.',
          'Associe cada protocolo à sua camada e ao problema que ele resolve.',
        ],
        topicos: ['Modelos OSI e TCP/IP', 'TCP × UDP', 'Endereçamento IP e sub-redes', 'DNS, HTTP e HTTPS', 'Roteamento'],
      },
      bancodados: {
        nome: 'Banco de Dados',
        keywords: ['banco de dados', 'bd', 'sql', 'dados'],
        dicas: [
          'Modele um sistema que você conhece (uma loja, uma biblioteca) do diagrama ER até as tabelas.',
          'Escreva consultas SQL num banco real (SQLite basta) em vez de só no papel.',
        ],
        topicos: ['Modelo entidade-relacionamento', 'Normalização (1FN, 2FN, 3FN)', 'SQL: consultas e junções', 'Transações e ACID', 'Índices'],
      },
      engenharia: {
        nome: 'Engenharia de Software',
        keywords: ['engenharia de software', 'requisitos', 'testes', 'gerencia de projetos', 'analise de sistemas', 'projeto de software'],
        dicas: [
          'Aplique os conceitos num projeto real em grupo, com issues, branches e revisão de código.',
          'Estude padrões de projeto pelo problema que resolvem, não pelo diagrama.',
        ],
        topicos: ['Processos ágeis (Scrum, Kanban)', 'Requisitos e casos de uso', 'Princípios SOLID', 'Padrões de projeto', 'Testes automatizados'],
      },
      teoria: {
        nome: 'Teoria da Computação',
        keywords: ['teoria da computacao', 'automatos', 'linguagens formais', 'computabilidade'],
        dicas: [
          'Desenhe os autômatos e simule entradas à mão até entender aceitação e rejeição.',
          'Use o JFLAP para testar autômatos e gramáticas.',
        ],
        topicos: ['Autômatos finitos', 'Expressões regulares', 'Gramáticas livres de contexto', 'Máquinas de Turing', 'Decidibilidade e classes P e NP'],
      },
      ia: {
        nome: 'Inteligência Artificial',
        keywords: ['inteligencia artificial', 'aprendizado de maquina', 'machine learning', 'ciencia de dados', 'ia'],
        dicas: [
          'Implemente um modelo simples (regressão linear, k-NN) do zero antes de usar bibliotecas.',
          'Pratique com conjuntos de dados públicos (Kaggle, UCI) e explique cada métrica de avaliação.',
        ],
        topicos: ['Busca em espaço de estados', 'Aprendizado supervisionado e não supervisionado', 'Redes neurais', 'Métricas de avaliação', 'Sobreajuste e regularização'],
      },
    },
    gradeSugerida: [
      { nome: 'Algoritmos e Programação', semestre: 1 },
      { nome: 'Cálculo I', semestre: 1 },
      { nome: 'Matemática Discreta', semestre: 1 },
      { nome: 'Estruturas de Dados', semestre: 2 },
      { nome: 'Arquitetura de Computadores', semestre: 3 },
      { nome: 'Banco de Dados', semestre: 3 },
      { nome: 'Sistemas Operacionais', semestre: 4 },
      { nome: 'Redes de Computadores', semestre: 5 },
      { nome: 'Engenharia de Software', semestre: 5 },
    ],
  },

  direito: {
    id: 'direito',
    nome: 'Direito',
    sigla: 'DIR',
    cor: '#f59e0b',
    visual: 'diagramas',
    abaVisual: 'Fluxos',
    dicasGerais: [
      'Leia a lei seca todos os dias. Doutrina e jurisprudência explicam, mas a prova cobra o texto legal.',
      'Mantenha o Vade Mecum atualizado e marque os artigos que mais caem.',
      'Faça esquemas e fluxogramas dos procedimentos: eles mostram prazos e fases de uma vez.',
    ],
    areas: {
      constitucional: {
        nome: 'Direito Constitucional',
        keywords: ['constitucional'],
        dicas: [
          'Leia os arts. 1º ao 17 da CF/88 várias vezes: direitos fundamentais são a base de tudo.',
          'Monte tabelas comparando os remédios constitucionais (HC, HD, MS, MI, ação popular).',
          'Acompanhe os informativos do STF da sua matéria.',
        ],
        topicos: ['Princípios fundamentais (arts. 1º a 4º)', 'Direitos e garantias fundamentais (art. 5º)', 'Remédios constitucionais', 'Organização dos Poderes', 'Controle de constitucionalidade'],
      },
      civil: {
        nome: 'Direito Civil',
        keywords: ['civil', 'obrigacoes', 'contratos', 'familia', 'sucessoes', 'reais', 'responsabilidade civil'],
        dicas: [
          'Estude a Parte Geral do Código Civil com calma: ela sustenta obrigações, contratos e o resto.',
          'Faça fichas de prazos (prescrição e decadência). Eles derrubam muita gente.',
        ],
        topicos: ['Pessoa natural e capacidade', 'Negócio jurídico e defeitos', 'Prescrição e decadência', 'Obrigações', 'Contratos em espécie', 'Responsabilidade civil'],
      },
      penal: {
        nome: 'Direito Penal',
        keywords: ['penal', 'criminologia'],
        dicas: [
          'Domine a teoria do crime (fato típico, ilicitude, culpabilidade) antes da parte especial.',
          'Para cada crime da parte especial: núcleo do tipo, sujeitos, elemento subjetivo e consumação.',
        ],
        topicos: ['Princípios penais', 'Teoria do crime', 'Excludentes de ilicitude e de culpabilidade', 'Concurso de pessoas e de crimes', 'Aplicação da pena'],
      },
      processocivil: {
        nome: 'Processo Civil',
        keywords: ['processo civil', 'processual civil', 'teoria geral do processo', 'tgp'],
        dicas: [
          'Siga o fluxo do procedimento comum na aba Fluxos e localize cada artigo do CPC nele.',
          'Prazos no CPC/2015 contam em dias úteis (art. 219). Faça uma tabela com os principais.',
        ],
        topicos: ['Normas fundamentais do processo', 'Petição inicial e citação', 'Contestação e revelia', 'Provas', 'Sentença e coisa julgada', 'Recursos'],
      },
      processopenal: {
        nome: 'Processo Penal',
        keywords: ['processo penal', 'processual penal'],
        dicas: [
          'Separe bem a fase pré-processual (inquérito) da processual (ação penal).',
          'Estude prisões e medidas cautelares com a redação dada pelo Pacote Anticrime (Lei 13.964/2019).',
        ],
        topicos: ['Inquérito policial', 'Ação penal', 'Prisões e medidas cautelares', 'Procedimentos', 'Recursos no processo penal'],
      },
      trabalho: {
        nome: 'Direito do Trabalho',
        keywords: ['trabalho', 'trabalhista', 'previdenciario'],
        dicas: [
          'Leia a CLT com as mudanças da Reforma Trabalhista (Lei 13.467/2017) e marque o que mudou.',
          'As súmulas do TST caem muito: faça um caderno com as principais.',
        ],
        topicos: ['Relação de emprego', 'Jornada de trabalho', 'Remuneração e salário', 'Férias e 13º salário', 'Extinção do contrato'],
      },
      administrativo: {
        nome: 'Direito Administrativo',
        keywords: ['administrativo', 'licitacoes'],
        dicas: [
          'Memorize os princípios do art. 37 da CF com o LIMPE e aplique cada um a um caso.',
          'Estude a nova Lei de Licitações (Lei 14.133/2021) comparando com a antiga 8.666/93.',
        ],
        topicos: ['Princípios da Administração', 'Atos administrativos', 'Poderes administrativos', 'Licitações e contratos', 'Responsabilidade civil do Estado'],
      },
      tributario: {
        nome: 'Direito Tributário',
        keywords: ['tributario', 'financeiro'],
        dicas: [
          'Estude as limitações ao poder de tributar (arts. 150 a 152 da CF) com quadros comparativos.',
          'Classifique os tributos (impostos, taxas, contribuições) pelo fato gerador.',
        ],
        topicos: ['Sistema Tributário Nacional', 'Limitações ao poder de tributar', 'Espécies tributárias', 'Obrigação e crédito tributário'],
      },
      empresarial: {
        nome: 'Direito Empresarial',
        keywords: ['empresarial', 'comercial', 'falencia'],
        dicas: [
          'Compare os tipos societários em tabela: responsabilidade dos sócios, capital e administração.',
          'Títulos de crédito: estude princípios (cartularidade, literalidade, autonomia) antes de cada título.',
        ],
        topicos: ['Empresário e estabelecimento', 'Sociedades', 'Títulos de crédito', 'Recuperação judicial e falência'],
      },
      fundamentos: {
        nome: 'Fundamentos e Teoria',
        keywords: ['introducao ao estudo do direito', 'ied', 'filosofia', 'sociologia', 'teoria do estado', 'teoria geral do estado', 'ciencia politica', 'hermeneutica', 'etica'],
        dicas: [
          'Faça fichamentos dos autores clássicos com as ideias centrais em poucas linhas.',
          'Ligue cada teoria a um debate atual. Ajuda na prova dissertativa.',
        ],
        topicos: ['Fontes do Direito', 'Norma jurídica', 'Hermenêutica e interpretação', 'Teorias da justiça'],
      },
    },
    gradeSugerida: [
      { nome: 'Introdução ao Estudo do Direito', semestre: 1 },
      { nome: 'Teoria Geral do Estado', semestre: 1 },
      { nome: 'Direito Civil I — Parte Geral', semestre: 2 },
      { nome: 'Direito Constitucional I', semestre: 2 },
      { nome: 'Direito Penal I', semestre: 3 },
      { nome: 'Teoria Geral do Processo', semestre: 3 },
      { nome: 'Processo Civil I', semestre: 4 },
      { nome: 'Direito Administrativo', semestre: 5 },
      { nome: 'Direito do Trabalho', semestre: 6 },
    ],
  },
};

export const ORDEM_CURSOS = ['medicina', 'computacao', 'fisioterapia', 'direito'];

/* Tira acentos e caixa para comparar nomes de disciplinas */
export const normalizar = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* Descobre a área de uma disciplina pelo nome. Sem palavra-chave, cai em "geral". */
export function areaDaMateria(cursoId, nomeMateria) {
  const curso = CURSOS[cursoId];
  const nome = normalizar(nomeMateria);
  let melhor = null;
  let maior = 0;
  for (const [id, area] of Object.entries(curso.areas)) {
    for (const kw of area.keywords) {
      // palavra-chave mais longa vence ("processo civil" ganha de "civil")
      const pega = kw.length <= 3 ? new RegExp(`\\b${kw}\\b`).test(nome) : nome.includes(kw);
      if (pega && kw.length > maior) { melhor = id; maior = kw.length; }
    }
  }
  return melhor || 'geral';
}

export function infoArea(cursoId, areaId) {
  const curso = CURSOS[cursoId];
  return curso.areas[areaId] || {
    nome: 'Geral',
    dicas: curso.dicasGerais,
    topicos: ['Conceitos fundamentais da disciplina', 'Pontos destacados pelo professor', 'Exercícios e casos práticos'],
  };
}
