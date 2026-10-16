/* =========================================================
   TOGA · conteúdo fixo
   Guias de conduta, tabela de prazos, baralhos de estudo e
   catálogo de apps. Tudo aqui é material de apoio: confira
   sempre o texto da lei e o calendário do seu tribunal.
   ========================================================= */

const AREAS = [
  'Constitucional', 'Civil', 'Processo Civil', 'Penal', 'Processo Penal',
  'Trabalho', 'Processo do Trabalho', 'Administrativo', 'Tributário',
  'Empresarial', 'Consumidor', 'Família', 'Previdenciário', 'Ambiental',
  'Ética / OAB', 'Filosofia e Teoria', 'Vade Mecum', 'Outros',
];

/* ---------- Guias de conduta ----------
   Cada seção tem um tipo: do (faça), dont (evite), say (pode falar),
   avoid (não fale), text (parágrafo), list (lista simples). */
const GUIDES = [
  {
    id: 'atendimento',
    icon: 'messages-square',
    title: 'Primeiro atendimento',
    sub: 'Como receber o cliente, ouvir e fechar a consulta',
    sections: [
      { h: 'Antes de o cliente chegar', type: 'list', items: [
        'Peça por mensagem um resumo do caso e os documentos principais (RG, comprovante de residência, contratos, prints, decisões).',
        'Confira conflito de interesses: você ou o escritório já atendeu a parte contrária?',
        'Separe a ficha de atendimento, um bloco e o modelo de contrato de honorários.',
        'Escolha um lugar reservado. O sigilo começa na sala de espera.',
      ]},
      { h: 'Faça', type: 'do', items: [
        'Cumprimente pelo nome e explique como a consulta vai funcionar e quanto tempo dura.',
        'Deixe a pessoa contar a história inteira antes de interromper. Anote datas, valores e nomes.',
        'Faça perguntas abertas: "O que aconteceu depois?", "Você tem isso por escrito?".',
        'Traduza o juridiquês: em vez de "litisconsórcio", diga "mais de uma pessoa no mesmo lado do processo".',
        'Explique os caminhos possíveis, os riscos de cada um, o tempo médio e os custos (custas, honorários, perícia, sucumbência).',
        'Diga o que vai acontecer em seguida e quando você dá notícia.',
        'Formalize tudo: contrato de honorários por escrito e procuração assinada.',
      ]},
      { h: 'Evite', type: 'dont', items: [
        'Prometer resultado ("essa causa está ganha"). Advocacia é obrigação de meio.',
        'Dar parecer definitivo sem ver documentos.',
        'Falar mal do advogado anterior ou da parte contrária.',
        'Olhar o celular durante a consulta.',
        'Começar a trabalhar sem contrato e sem procuração.',
        'Comentar o caso de outro cliente, mesmo sem citar nomes.',
      ]},
      { h: 'Frases que ajudam', type: 'say', items: [
        '"Tudo o que você me contar aqui fica entre nós. Isso é sigilo profissional."',
        '"Existe chance real, mas nenhum advogado sério garante resultado. Vou te mostrar os riscos."',
        '"Vou estudar os documentos e te retorno até sexta com o caminho que eu recomendo."',
        '"Esse prazo é da Justiça e não depende de mim. Vou te avisar sempre que houver novidade."',
        '"Para eu te representar, preciso do contrato e da procuração assinados."',
      ]},
      { h: 'Frases que comprometem', type: 'avoid', items: [
        '"Pode ficar tranquilo, isso aí a gente ganha fácil."',
        '"Conheço o juiz, vai dar certo."',
        '"Se não ganhar, não precisa pagar nada" (sem isso estar no contrato).',
        '"Faço mais barato que o outro escritório."',
        '"Diz que foi assim que fica melhor pra você." Orientar a mentir é crime e infração ética.',
      ]},
    ],
    fonte: 'Estatuto da Advocacia (Lei 8.906/1994) e Código de Ética e Disciplina da OAB (2015), arts. 9º, 35 a 38 e 48.',
  },
  {
    id: 'audiencia',
    icon: 'landmark',
    title: 'Postura em audiência',
    sub: 'Tratamento, vestimenta, falar "pela ordem" e o que levar',
    sections: [
      { h: 'Checklist do dia', type: 'list', items: [
        'Chegue 30 minutos antes. Em audiência virtual, entre 10 minutos antes e teste câmera e áudio.',
        'Leve carteira da OAB, procuração, documentos do cliente, rol de testemunhas e roteiro de perguntas.',
        'Reveja os pontos controvertidos e a proposta de acordo que o cliente aceita (valor mínimo, parcelas).',
        'Combine com o cliente: falar só quando perguntado, responder curto e dizer "não sei" quando não souber.',
      ]},
      { h: 'Como se dirigir', type: 'list', items: [
        'Juiz(a): "Excelência" ou "Vossa Excelência". Por escrito: "Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a)" ou "MM. Juiz(a)".',
        'Desembargador(a) e ministro(a): "Vossa Excelência".',
        'Promotor(a), procurador(a) e defensor(a): "Doutor(a)" ou "Vossa Excelência".',
        'Advogado(a) da outra parte: "o(a) colega" ou "o(a) Dr(a). Fulano(a)".',
        'Testemunha e parte: "o(a) senhor(a)".',
      ]},
      { h: 'Faça', type: 'do', items: [
        'Vista-se com sobriedade. Em muitos fóruns o terno ainda é o padrão para homens. Confira o costume local.',
        'Peça a palavra antes de falar e fale para o juiz, não para o colega.',
        'Use "pela ordem" para corrigir um equívoco ou uma dúvida sobre fatos ou documentos. É direito seu (Estatuto, art. 7º, X).',
        'Peça que constem em ata os protestos, as perguntas indeferidas e os incidentes.',
        'Leia a ata antes de assinar.',
      ]},
      { h: 'Evite', type: 'dont', items: [
        'Interromper o juiz, a testemunha ou o colega.',
        'Discutir com a parte contrária. O conflito é técnico, não pessoal.',
        'Fazer pergunta que induz a resposta da testemunha.',
        'Celular tocando. Deixe no silencioso e longe da mão.',
        'Aceitar acordo que o cliente não autorizou.',
      ]},
      { h: 'Seus direitos (Estatuto, art. 7º)', type: 'list', items: [
        'Falar sentado ou em pé nas sessões (inc. XII).',
        'Examinar autos de processos findos ou em andamento, mesmo sem procuração, salvo os sigilosos (inc. XIII).',
        'Retirar-se depois de 30 minutos de atraso do juiz, com comunicação protocolizada em juízo (inc. XX).',
        'Ser tratado com urbanidade. Não há hierarquia entre advogado, juiz e promotor (art. 6º).',
      ]},
    ],
    fonte: 'Estatuto da Advocacia, arts. 6º e 7º.',
  },
  {
    id: 'etica',
    icon: 'scale',
    title: 'Ética da OAB em 10 pontos',
    sub: 'O que dá processo disciplinar e como evitar',
    sections: [
      { h: 'O essencial', type: 'list', items: [
        'Sigilo profissional: vale para tudo que soube em razão da profissão. Você pode se recusar a depor sobre isso (CED arts. 35 a 38; Estatuto art. 7º, XIX).',
        'Não captar clientela. Angariar causas, com ou sem intermediário, é infração (Estatuto art. 34, III e IV).',
        'Honorários: contrate por escrito, de preferência, e não cobre abaixo do mínimo da tabela da seccional. Isso é aviltamento (CED art. 48, § 6º).',
        'Preste contas do que receber em nome do cliente. Recusar sem motivo é infração (Estatuto art. 34, XXI).',
        'Conflito de interesses: não atenda os dois lados. Se surgir conflito entre seus clientes, escolha um e saia do outro com prudência (CED arts. 19 e 20).',
        'Renúncia: comunique o cliente e continue no caso por 10 dias, salvo se for substituído antes (Estatuto art. 5º, § 3º; CPC art. 112).',
        'Não abandone a causa sem justo motivo (Estatuto art. 34, XI).',
        'Prazos: perder prazo por desídia pode virar processo disciplinar e ação de indenização.',
        'Urbanidade com colegas, juízes, servidores e partes (CED art. 27).',
        'Publicidade só informativa e discreta (Provimento 205/2021). Veja o guia de redes sociais.',
      ]},
      { h: 'Infrações comuns de iniciante', type: 'dont', items: [
        'Usar o nome de um advogado que não participa do caso.',
        'Reter autos ou documentos do cliente.',
        'Deixar estagiário praticar ato privativo sozinho.',
        'Postar foto de processo, de cliente ou de audiência sem autorização.',
        'Combinar honorário "por fora" sem recibo.',
      ]},
    ],
    fonte: 'Lei 8.906/1994 (Estatuto), Código de Ética e Disciplina da OAB (Res. 02/2015) e Provimento 205/2021.',
  },
  {
    id: 'redes',
    icon: 'megaphone',
    title: 'Redes sociais e publicidade',
    sub: 'O que o Provimento 205/2021 permite e proíbe',
    sections: [
      { h: 'Pode', type: 'do', items: [
        'Produzir conteúdo jurídico informativo: explicar direitos, decisões e leis novas.',
        'Impulsionar conteúdo informativo (posts patrocinados), sem tom de captação.',
        'Ter site, perfil profissional, logotipo e informar áreas de atuação.',
        'Responder dúvidas gerais em lives e "caixinhas de perguntas", sem resolver o caso concreto de alguém publicamente.',
        'Divulgar títulos acadêmicos que você de fato tem.',
      ]},
      { h: 'Não pode', type: 'dont', items: [
        'Divulgar preços, descontos, formas de pagamento ou "consulta grátis" como atrativo.',
        'Prometer resultado ou divulgar "causas ganhas" com valores.',
        'Chamar para contratar: "fale comigo", "garanta já seus direitos" com link direto para fechar.',
        'Expor clientes, processos ou decisões com dados que identifiquem as partes.',
        'Anunciar especialidade sem a titulação correspondente.',
        'Ostentação ligada à advocacia (bens de luxo como prova de sucesso profissional).',
        'Usar anúncio em carro de som, outdoor ou panfleto em massa.',
      ]},
      { h: 'Dica prática', type: 'text', items: [
        'Antes de postar, pergunte: "isso ensina algo ou só vende meu serviço?". Se só vende, não poste. A OAB publicou em 2024 uma cartilha com dúvidas frequentes sobre o provimento. Vale ler também as regras da sua seccional.',
      ]},
    ],
    fonte: 'Provimento 205/2021 do CFOAB e CED arts. 39 a 47.',
  },
  {
    id: 'estagio',
    icon: 'graduation-cap',
    title: 'Estágio: pode e não pode',
    sub: 'Limites do estagiário inscrito na OAB',
    sections: [
      { h: 'Sozinho, o estagiário pode', type: 'do', items: [
        'Retirar e devolver autos em cartório, assinando a carga.',
        'Obter certidões de peças ou autos de processos em curso ou findos.',
        'Assinar petições de juntada de documentos.',
        'Fazer atos extrajudiciais quando autorizado pelo advogado.',
      ]},
      { h: 'Só junto com o advogado', type: 'list', items: [
        'Assinar petições (exceto as de juntada), sempre em conjunto e sob responsabilidade do advogado.',
        'Participar de audiências ao lado do advogado responsável.',
      ]},
      { h: 'Não pode', type: 'dont', items: [
        'Assinar sozinho uma petição inicial, contestação ou recurso.',
        'Dar consultoria ou parecer jurídico em nome próprio.',
        'Se apresentar como advogado ou usar o título "Dr." como se fosse.',
      ]},
      { h: 'Como aproveitar o estágio', type: 'list', items: [
        'Monte um caderno de modelos: cada peça que ajudar a fazer, guarde uma versão sem dados do cliente.',
        'Peça para acompanhar audiências mesmo quando não for sua tarefa.',
        'Aprenda os sistemas: PJe, eproc, e-SAJ, Projudi. Cada tribunal usa um.',
        'Anote cada prazo que vir sendo contado e confira com a calculadora do app.',
      ]},
    ],
    fonte: 'Estatuto art. 3º, § 2º, e Regulamento Geral da OAB, art. 29.',
  },
  {
    id: 'delegacia',
    icon: 'shield',
    title: 'Delegacia e prisão em flagrante',
    sub: 'Primeiros passos na defesa criminal',
    sections: [
      { h: 'Seus direitos como advogado', type: 'list', items: [
        'Falar com o cliente preso pessoal e reservadamente, mesmo sem procuração (Estatuto art. 7º, III).',
        'Ver os autos do inquérito e tirar cópias, mesmo sem procuração, salvo diligências em andamento (Estatuto art. 7º, XIV, e Súmula Vinculante 14).',
        'Assistir o cliente durante o interrogatório e o depoimento (Estatuto art. 7º, XXI).',
      ]},
      { h: 'Faça', type: 'do', items: [
        'Converse com o cliente antes de qualquer depoimento.',
        'Explique o direito ao silêncio: ele não precisa produzir prova contra si.',
        'Confira se a família foi avisada e se a nota de culpa foi entregue em até 24 horas.',
        'Prepare a audiência de custódia, que deve acontecer em até 24 horas da prisão (CPP art. 310).',
        'Reúna comprovantes de residência, trabalho e bons antecedentes para pedir liberdade.',
      ]},
      { h: 'Evite', type: 'dont', items: [
        'Falar do caso em corredor ou na frente de policiais.',
        'Dar entrevista sem combinar com o cliente.',
        'Prometer soltura imediata à família.',
      ]},
    ],
    fonte: 'Estatuto art. 7º, Súmula Vinculante 14 do STF e CPP art. 310.',
  },
  {
    id: 'whatsapp',
    icon: 'smartphone',
    title: 'Atendimento por WhatsApp',
    sub: 'Combinados, horários e cuidado com dados',
    sections: [
      { h: 'Faça', type: 'do', items: [
        'Tenha um número só para o trabalho e mensagem de ausência com o horário de atendimento.',
        'Combine no contrato como e quando você responde e que prazo é esse.',
        'Mande atualizações curtas depois de cada movimentação importante.',
        'Peça documentos em PDF, legíveis, com nome de arquivo claro.',
        'Salve as conversas importantes no arquivo do cliente.',
      ]},
      { h: 'Evite', type: 'dont', items: [
        'Dar parecer complexo por áudio de 5 minutos. Marque uma reunião ou mande por escrito.',
        'Encaminhar documentos de um cliente para outro contato por engano: confira o destinatário.',
        'Grupos com cliente e parte contrária.',
        'Responder de madrugada e criar a expectativa de que você está sempre disponível.',
      ]},
      { h: 'LGPD', type: 'text', items: [
        'Você é responsável pelos dados pessoais que recebe. Guarde só o necessário, em lugar protegido, e apague quando o caso acabar e não houver mais obrigação de guardar.',
      ]},
    ],
    fonte: 'Lei 13.709/2018 (LGPD) e CED arts. 9º e 35.',
  },
  {
    id: 'decorar',
    icon: 'brain',
    title: 'Como decorar sem sofrer',
    sub: 'Técnicas para lei seca, prazos e OAB',
    sections: [
      { h: 'Técnicas que funcionam', type: 'list', items: [
        'Repetição espaçada: revise no dia seguinte, depois de 3 dias, 7, 15 e 30. Os baralhos da aba Estudo fazem isso por você.',
        'Recordação ativa: feche o código e tente escrever o artigo de memória. Depois confira.',
        'Lei seca com marca-texto em 3 cores: regra (amarelo), exceção (rosa), prazo e número (verde).',
        'Questões antes da teoria: resolva 10 questões da OAB sobre o tema e só depois leia a doutrina.',
        'Explique em voz alta para alguém leigo (técnica Feynman). Onde travar é o que falta estudar.',
      ]},
      { h: 'Mnemônicos clássicos', type: 'list', items: [
        'LIMPE: princípios da administração pública (CF art. 37): Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência.',
        'SO-CI-DI-VA-PLU: fundamentos da República (CF art. 1º): SOberania, CIdadania, DIgnidade da pessoa humana, VAlores sociais do trabalho e da livre iniciativa, PLUralismo político.',
        'CON-GA-ER-PRO: objetivos da República (CF art. 3º): CONstruir sociedade livre, justa e solidária; GArantir o desenvolvimento nacional; ERradicar a pobreza; PROmover o bem de todos.',
        'Remédios constitucionais pelo inciso do art. 5º: HC (LXVIII), MS (LXIX), MS coletivo (LXX), MI (LXXI), HD (LXXII), ação popular (LXXIII).',
        'Recursos no CPC: quase tudo em 15 dias. A exceção que mais cai são os embargos de declaração, com 5.',
      ]},
      { h: 'Rotina sugerida', type: 'list', items: [
        '25 minutos de leitura ativa e 5 de pausa. Repita 4 vezes e faça uma pausa longa.',
        '10 minutos por dia nos baralhos, mesmo nos dias corridos.',
        'Domingo: revisão da semana e 1 simulado curto.',
      ]},
    ],
    fonte: 'Constituição Federal, arts. 1º, 3º, 5º e 37.',
  },
];

/* ---------- Tabela rápida de prazos ---------- */
const PRAZOS_TABELA = [
  { grupo: 'Processo Civil (CPC, dias úteis)', itens: [
    ['Contestação', '15 dias', 'art. 335'],
    ['Réplica', '15 dias', 'arts. 350 e 351'],
    ['Apelação e contrarrazões', '15 dias', 'arts. 1.003, § 5º, e 1.010'],
    ['Agravo de instrumento', '15 dias', 'art. 1.003, § 5º'],
    ['Agravo interno', '15 dias', 'art. 1.070'],
    ['Embargos de declaração', '5 dias', 'art. 1.023'],
    ['Recurso especial e extraordinário', '15 dias', 'art. 1.003, § 5º'],
    ['Pagar no cumprimento de sentença', '15 dias', 'art. 523'],
    ['Impugnação ao cumprimento', '15 dias após o prazo de pagar', 'art. 525'],
    ['Embargos à execução', '15 dias', 'art. 915'],
    ['Pagar na execução de título extrajudicial', '3 dias', 'art. 829'],
    ['Ação rescisória', '2 anos do trânsito em julgado', 'art. 975'],
  ]},
  { grupo: 'Juizado Especial Cível (Lei 9.099/1995, dias úteis)', itens: [
    ['Recurso inominado', '10 dias', 'art. 42'],
    ['Embargos de declaração', '5 dias', 'art. 49'],
  ]},
  { grupo: 'Processo do Trabalho (CLT, dias úteis)', itens: [
    ['Recurso ordinário', '8 dias', 'art. 895'],
    ['Recurso de revista', '8 dias', 'art. 896'],
    ['Agravo de petição', '8 dias', 'art. 897'],
    ['Embargos de declaração', '5 dias', 'art. 897-A'],
    ['Contestação', 'Até a audiência', 'art. 847'],
  ]},
  { grupo: 'Processo Penal (CPP, dias corridos)', itens: [
    ['Resposta à acusação', '10 dias', 'art. 396'],
    ['Apelação (interposição)', '5 dias', 'art. 593'],
    ['Razões de apelação', '8 dias', 'art. 600'],
    ['Recurso em sentido estrito', '5 dias', 'art. 586'],
    ['Embargos de declaração', '2 dias', 'art. 619'],
    ['Habeas corpus', 'Sem prazo', 'art. 647'],
  ]},
  { grupo: 'Outros', itens: [
    ['Mandado de segurança', '120 dias da ciência do ato', 'Lei 12.016/2009, art. 23'],
    ['Prescrição geral (Código Civil)', '10 anos', 'CC art. 205'],
    ['Reparação civil', '3 anos', 'CC art. 206, § 3º, V'],
    ['Prazo em dobro', 'Fazenda Pública, MP e Defensoria', 'CPC arts. 180, 183 e 186'],
  ]},
];

/* ---------- Baralhos de estudo (repetição espaçada) ---------- */
const DECKS = [
  { id: 'prazos', title: 'Prazos que mais caem', cards: [
    ['Prazo da contestação no procedimento comum (CPC)', '15 dias úteis (art. 335)'],
    ['Prazo dos embargos de declaração no CPC', '5 dias (art. 1.023)'],
    ['Prazo da apelação cível', '15 dias (art. 1.003, § 5º)'],
    ['Prazo do recurso inominado no JEC', '10 dias (Lei 9.099, art. 42)'],
    ['Prazo do recurso ordinário trabalhista', '8 dias (CLT art. 895)'],
    ['Prazo da apelação criminal (interposição)', '5 dias (CPP art. 593)'],
    ['Prazo da resposta à acusação', '10 dias (CPP art. 396)'],
    ['Prazo dos embargos de declaração no processo penal', '2 dias (CPP art. 619)'],
    ['Prazo para impetrar mandado de segurança', '120 dias da ciência do ato (Lei 12.016, art. 23)'],
    ['Período de suspensão dos prazos no fim do ano (CPC)', '20 de dezembro a 20 de janeiro, inclusive (art. 220)'],
    ['Como se contam os prazos no CPC?', 'Só em dias úteis (art. 219), excluindo o dia do começo e incluindo o do vencimento (art. 224)'],
    ['Quem tem prazo em dobro no CPC?', 'Fazenda Pública (art. 183), Ministério Público (art. 180) e Defensoria Pública (art. 186)'],
    ['Prazo para a ação rescisória', '2 anos do trânsito em julgado da última decisão (art. 975)'],
  ]},
  { id: 'latim', title: 'Brocardos latinos', cards: [
    ['Pacta sunt servanda', 'Os contratos devem ser cumpridos'],
    ['In dubio pro reo', 'Na dúvida, decide-se a favor do réu'],
    ['Nullum crimen, nulla poena sine praevia lege', 'Não há crime nem pena sem lei anterior que os defina'],
    ['Ne bis in idem', 'Ninguém pode ser punido duas vezes pelo mesmo fato'],
    ['Da mihi factum, dabo tibi jus', 'Dá-me os fatos e te darei o direito'],
    ['Iura novit curia', 'O juiz conhece o direito'],
    ['Rebus sic stantibus', 'Enquanto as coisas permanecerem como estão (revisão do contrato por fato novo)'],
    ['Erga omnes', 'Efeito contra todos'],
    ['Inter partes', 'Efeito só entre as partes'],
    ['Ex tunc', 'Efeito retroativo, desde a origem'],
    ['Ex nunc', 'Efeito daqui para frente'],
    ['Venire contra factum proprium', 'Proibição de agir contra o próprio comportamento anterior'],
    ['Nemo tenetur se detegere', 'Ninguém é obrigado a produzir prova contra si'],
    ['Fumus boni iuris', 'Fumaça do bom direito: probabilidade do direito'],
    ['Periculum in mora', 'Perigo da demora'],
    ['Onus probandi', 'Ônus da prova'],
    ['Data venia', 'Com a devida licença (para discordar)'],
    ['Dura lex, sed lex', 'A lei é dura, mas é a lei'],
  ]},
  { id: 'cf', title: 'Constituição essencial', cards: [
    ['Fundamentos da República (art. 1º)', 'Soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, pluralismo político (SO-CI-DI-VA-PLU)'],
    ['Princípios da administração pública (art. 37)', 'Legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE)'],
    ['Remédio para proteger a liberdade de locomoção', 'Habeas corpus (art. 5º, LXVIII)'],
    ['Remédio para direito líquido e certo não amparado por HC ou HD', 'Mandado de segurança (art. 5º, LXIX)'],
    ['Remédio quando falta norma regulamentadora que torna inviável um direito', 'Mandado de injunção (art. 5º, LXXI)'],
    ['Remédio para conhecer ou retificar informações pessoais em bancos de dados públicos', 'Habeas data (art. 5º, LXXII)'],
    ['Quem pode propor ação popular?', 'Qualquer cidadão (art. 5º, LXXIII)'],
    ['Quais são as cláusulas pétreas? (art. 60, § 4º)', 'Forma federativa, voto direto, secreto, universal e periódico, separação dos Poderes e direitos e garantias individuais'],
    ['Idade mínima para Presidente da República', '35 anos (art. 14, § 3º, VI, a)'],
    ['Idade mínima para Senador', '35 anos (art. 14, § 3º, VI, a)'],
    ['Idade mínima para Deputado Federal', '21 anos (art. 14, § 3º, VI, c)'],
  ]},
  { id: 'etica', title: 'Ética OAB (cai muito na 1ª fase)', cards: [
    ['Por quanto tempo o advogado continua no caso depois de renunciar?', '10 dias após a notificação, salvo se substituído antes (Estatuto art. 5º, § 3º)'],
    ['O estagiário pode assinar sozinho petição de juntada?', 'Sim (Regulamento Geral, art. 29, § 1º, III)'],
    ['Captar clientela é infração?', 'Sim. Angariar ou captar causas, com ou sem intermediário (Estatuto art. 34, IV)'],
    ['Cobrar honorários abaixo da tabela da seccional', 'É aviltamento, vedado (CED art. 48, § 6º)'],
    ['Advogado pode ver autos de inquérito sem procuração?', 'Sim, salvo diligências em andamento e sigilosas (Estatuto art. 7º, XIV; SV 14)'],
    ['Há hierarquia entre advogado, juiz e promotor?', 'Não (Estatuto art. 6º)'],
    ['Publicidade pode divulgar preço de honorários?', 'Não (Provimento 205/2021)'],
    ['O advogado é obrigado a depor sobre fato que soube como advogado?', 'Não. Tem o direito de recusar (Estatuto art. 7º, XIX)'],
  ]},
];

/* ---------- Catálogo de apps e sites ----------
   Mantido à mão. Conferir preços e funções na loja antes de indicar. */
const APPS = [
  { cat: 'Legislação', items: [
    { name: 'Planalto: Legislação', url: 'https://www.planalto.gov.br/legislacao', what: 'Texto oficial e atualizado das leis federais, com as alterações tachadas.', when: 'Sempre que precisar do texto vigente. É a fonte oficial.', tags: ['grátis', 'oficial'] },
    { name: 'LexML', url: 'https://www.lexml.gov.br', what: 'Busca unificada de leis, projetos e jurisprudência de vários órgãos.', when: 'Para achar norma estadual ou municipal e projetos de lei.', tags: ['grátis', 'oficial'] },
    { name: 'Apps de Vade Mecum', url: 'https://play.google.com/store/search?q=vade%20mecum%202026&c=apps', what: 'Vários apps reúnem códigos, súmulas e leis com busca offline (ex.: Vade Mecum 2026 Direito Brasil, Vade Mecum .Verbo).', when: 'No fórum, em sala de aula e para estudar sem internet.', tags: ['grátis com compras'] },
  ]},
  { cat: 'Jurisprudência', items: [
    { name: 'Jurisprudência do STF', url: 'https://jurisprudencia.stf.jus.br', what: 'Acórdãos, súmulas e temas de repercussão geral.', when: 'Questão constitucional e precedente vinculante.', tags: ['grátis', 'oficial'] },
    { name: 'Jurisprudência do STJ', url: 'https://scon.stj.jus.br', what: 'Acórdãos, súmulas, recursos repetitivos e "Jurisprudência em Teses".', when: 'Direito federal infraconstitucional (civil, consumidor, penal).', tags: ['grátis', 'oficial'] },
    { name: 'Jusbrasil', url: 'https://www.jusbrasil.com.br', what: 'Busca de decisões, diários oficiais e artigos.', when: 'Pesquisa rápida e acompanhamento do seu nome nos diários.', tags: ['grátis com plano pago'] },
  ]},
  { cat: 'Processo eletrônico e intimações', items: [
    { name: 'Comunica PJe / DJEN', url: 'https://comunica.pje.jus.br', what: 'Diário de Justiça Eletrônico Nacional: consulta de comunicações e intimações por OAB.', when: 'Conferir diariamente as publicações em seu nome.', tags: ['grátis', 'oficial'] },
    { name: 'PJe', url: 'https://www.pje.jus.br', what: 'Sistema do CNJ usado pela Justiça do Trabalho e por muitos tribunais.', when: 'Peticionar e consultar processos nos tribunais que usam PJe.', tags: ['grátis', 'oficial'] },
    { name: 'eproc (app)', url: 'https://play.google.com/store/search?q=eproc&c=apps', what: 'App oficial com prazos em linha do tempo, ciência de intimações e processos favoritos.', when: 'Justiça Federal da 4ª Região e tribunais que usam eproc.', tags: ['grátis', 'oficial'] },
    { name: 'e-SAJ', url: 'https://esaj.tjsp.jus.br', what: 'Sistema do TJSP e de outros tribunais estaduais.', when: 'Peticionar e consultar processos nesses tribunais.', tags: ['grátis', 'oficial'] },
  ]},
  { cat: 'Gestão de escritório e prazos', items: [
    { name: 'Astrea (Aurum)', url: 'https://www.aurum.com.br/astrea', what: 'Controle de processos, prazos, clientes e financeiro.', when: 'Advogado autônomo ou escritório pequeno.', tags: ['plano gratuito limitado'] },
    { name: 'ADVBOX', url: 'https://advbox.com.br', what: 'Gestão de escritório com prazo fatal antecipado (D-1) e tarefas por equipe.', when: 'Escritório com equipe e muitas intimações.', tags: ['pago'] },
    { name: 'Projuris', url: 'https://www.projuris.com.br', what: 'Gestão jurídica para escritórios e departamentos jurídicos.', when: 'Escritórios médios e jurídicos de empresas.', tags: ['pago'] },
  ]},
  { cat: 'Estudo e OAB', items: [
    { name: 'Anki', url: 'https://apps.ankiweb.net', what: 'Flashcards com repetição espaçada. Dá para importar baralhos de lei seca.', when: 'Decorar artigos, prazos e súmulas.', tags: ['grátis no Android e PC'] },
    { name: 'Qconcursos', url: 'https://www.qconcursos.com', what: 'Banco de questões da OAB e de concursos, com comentários.', when: 'Treinar a 1ª fase da OAB por matéria.', tags: ['pago com amostra'] },
    { name: 'Exame de Ordem (FGV)', url: 'https://oab.fgv.br', what: 'Editais, provas anteriores e gabaritos oficiais.', when: 'Baixar provas antigas para simulado.', tags: ['grátis', 'oficial'] },
    { name: 'Forest', url: 'https://www.forestapp.cc', what: 'Planta uma árvore enquanto você fica longe do celular.', when: 'Sessões de estudo sem distração.', tags: ['grátis com compras'] },
  ]},
  { cat: 'Cálculos', items: [
    { name: 'Calculadora do Cidadão (Banco Central)', url: 'https://www3.bcb.gov.br/CALCIDADAO', what: 'Correção de valores por índices oficiais (IPCA, INPC, IGP-M, Selic).', when: 'Atualizar valor de causa ou de dívida.', tags: ['grátis', 'oficial'] },
    { name: 'PJe-Calc', url: 'https://www.csjt.jus.br/web/csjt/pje-calc', what: 'Sistema oficial da Justiça do Trabalho para cálculos trabalhistas.', when: 'Liquidar sentença e montar pedidos trabalhistas.', tags: ['grátis', 'oficial'] },
  ]},
  { cat: 'OAB', items: [
    { name: 'Conselho Federal da OAB', url: 'https://www.oab.org.br', what: 'Estatuto, Código de Ética, provimentos e notícias. Link para a carteira digital.', when: 'Conferir normas da profissão.', tags: ['grátis', 'oficial'] },
  ]},
];

/* ---------- Data da última revisão do conteúdo ---------- */
const REVISADO = 'outubro de 2026';

/* ---------- Modelos grátis ----------
   {{campo}} é trocado pelo que a pessoa preencher. Campo vazio
   continua aparecendo como [Campo] para não sumir do texto. */
const QUALIF = [
  { k: 'cliente', label: 'Nome completo do cliente' },
  { k: 'nacionalidade', label: 'Nacionalidade', ph: 'brasileiro(a)' },
  { k: 'estadoCivil', label: 'Estado civil' },
  { k: 'profissao', label: 'Profissão' },
  { k: 'cpf', label: 'CPF' },
  { k: 'endereco', label: 'Endereço completo' },
];
const ADV = [
  { k: 'advogado', label: 'Nome do(a) advogado(a)' },
  { k: 'oab', label: 'OAB (número e UF)', ph: 'OAB/SP 123.456' },
  { k: 'enderecoAdv', label: 'Endereço profissional' },
  { k: 'email', label: 'E-mail profissional' },
];
const LOCAL = [
  { k: 'cidade', label: 'Cidade' },
  { k: 'data', label: 'Data', ph: '16 de outubro de 2026' },
];

const MODELOS = [
  {
    id: 'procuracao', cat: 'Advocacia', title: 'Procuração ad judicia et extra',
    sub: 'Poderes gerais para o foro e poderes especiais do art. 105 do CPC',
    fields: [...QUALIF, ...ADV, { k: 'finalidade', label: 'Finalidade', ph: 'propor ação de indenização contra Empresa X' }, ...LOCAL],
    text: `PROCURAÇÃO

OUTORGANTE: {{cliente}}, {{nacionalidade}}, {{estadoCivil}}, {{profissao}}, inscrito(a) no CPF sob o nº {{cpf}}, residente e domiciliado(a) em {{endereco}}.

OUTORGADO(A): {{advogado}}, advogado(a) inscrito(a) na {{oab}}, com escritório em {{enderecoAdv}}, e-mail {{email}}.

PODERES: pelo presente instrumento, o(a) outorgante nomeia e constitui o(a) outorgado(a) seu(sua) procurador(a), conferindo-lhe os poderes da cláusula ad judicia et extra para o foro em geral, em qualquer juízo, instância ou tribunal, podendo propor as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, usando os recursos legais e acompanhando-os, e ainda os poderes especiais para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromisso e assinar declaração de hipossuficiência econômica (art. 105 do CPC), podendo substabelecer com ou sem reserva de poderes, especialmente para {{finalidade}}.

{{cidade}}, {{data}}.

_______________________________________
{{cliente}}`,
  },
  {
    id: 'honorarios', cat: 'Advocacia', title: 'Contrato de honorários',
    sub: 'Modelo enxuto, por escrito, como recomenda o Código de Ética',
    fields: [...QUALIF, ...ADV,
      { k: 'objeto', label: 'Serviço contratado', ph: 'ajuizamento e acompanhamento de ação trabalhista contra Empresa X, até o trânsito em julgado' },
      { k: 'valor', label: 'Honorários iniciais', ph: 'R$ 3.000,00 em 3 parcelas mensais de R$ 1.000,00' },
      { k: 'exito', label: 'Honorários de êxito', ph: '20% do proveito econômico obtido' },
      { k: 'foro', label: 'Foro', ph: 'Comarca de São Paulo/SP' }, ...LOCAL],
    text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS

CONTRATANTE: {{cliente}}, {{nacionalidade}}, {{estadoCivil}}, {{profissao}}, CPF {{cpf}}, residente em {{endereco}}.

CONTRATADO(A): {{advogado}}, {{oab}}, com escritório em {{enderecoAdv}}, e-mail {{email}}.

CLÁUSULA 1ª – OBJETO. O(A) contratado(a) prestará ao(à) contratante os seguintes serviços: {{objeto}}.

CLÁUSULA 2ª – HONORÁRIOS. Pelos serviços, o(a) contratante pagará: (a) {{valor}}; e (b) {{exito}}. Os honorários de sucumbência pertencem ao(à) advogado(a) (art. 23 da Lei 8.906/1994) e não se compensam com os contratados.

CLÁUSULA 3ª – DESPESAS. Custas, emolumentos, perícias, cópias, deslocamentos e demais despesas do processo correm por conta do(a) contratante, mediante prestação de contas.

CLÁUSULA 4ª – OBRIGAÇÃO DE MEIO. O(A) contratado(a) se obriga a empregar a melhor técnica e diligência, sem garantia de resultado.

CLÁUSULA 5ª – DEVERES DO CONTRATANTE. Fornecer documentos e informações verdadeiras, manter contato atualizado e comunicar qualquer fato novo relativo ao caso.

CLÁUSULA 6ª – COMUNICAÇÃO. As partes se comunicarão pelos e-mails e telefones informados. O(A) contratado(a) informará o andamento sempre que houver movimentação relevante.

CLÁUSULA 7ª – RESCISÃO. Em caso de revogação do mandato sem culpa do(a) contratado(a), são devidos os honorários proporcionais ao trabalho realizado e os de êxito, na proporção do serviço prestado, se houver proveito posterior. Na renúncia, o(a) advogado(a) continuará representando o(a) contratante por 10 dias (art. 5º, § 3º, da Lei 8.906/1994).

CLÁUSULA 8ª – TÍTULO EXECUTIVO. Este contrato é título executivo extrajudicial (art. 24 da Lei 8.906/1994).

CLÁUSULA 9ª – FORO. Fica eleito o foro da {{foro}}.

{{cidade}}, {{data}}.

_____________________________          _____________________________
{{cliente}}                                {{advogado}}

Testemunhas:
1. ___________________________   2. ___________________________`,
  },
  {
    id: 'recibo', cat: 'Advocacia', title: 'Recibo de honorários',
    sub: 'Para cada pagamento recebido',
    fields: [{ k: 'cliente', label: 'Quem pagou' }, { k: 'cpf', label: 'CPF de quem pagou' }, { k: 'valor', label: 'Valor', ph: 'R$ 1.000,00 (mil reais)' },
      { k: 'referente', label: 'Referente a', ph: '1ª parcela dos honorários do processo nº ...' }, ...ADV.slice(0, 2), { k: 'cpfAdv', label: 'CPF do(a) advogado(a)' }, ...LOCAL],
    text: `RECIBO DE HONORÁRIOS ADVOCATÍCIOS

Recebi de {{cliente}}, CPF {{cpf}}, a quantia de {{valor}}, referente a {{referente}}, dando plena quitação quanto a este valor.

{{cidade}}, {{data}}.

_______________________________________
{{advogado}} – {{oab}} – CPF {{cpfAdv}}`,
  },
  {
    id: 'hipossuficiencia', cat: 'Advocacia', title: 'Declaração de hipossuficiência',
    sub: 'Para o pedido de gratuidade da justiça (CPC art. 99, § 3º)',
    fields: [...QUALIF, ...LOCAL],
    text: `DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA

Eu, {{cliente}}, {{nacionalidade}}, {{estadoCivil}}, {{profissao}}, CPF {{cpf}}, residente em {{endereco}}, DECLARO, para fins do art. 98 e seguintes do Código de Processo Civil, que não tenho condições de arcar com as custas e despesas do processo e os honorários advocatícios sem prejuízo do meu sustento e do de minha família.

Declaro estar ciente de que a falsidade desta declaração pode gerar responsabilidade civil e criminal.

{{cidade}}, {{data}}.

_______________________________________
{{cliente}}`,
  },
  {
    id: 'substabelecimento', cat: 'Advocacia', title: 'Substabelecimento',
    sub: 'Com ou sem reserva de poderes',
    fields: [...ADV.slice(0, 2), { k: 'novoAdv', label: 'Advogado(a) que recebe os poderes' }, { k: 'novaOab', label: 'OAB de quem recebe' },
      { k: 'reserva', label: 'Com ou sem reserva', ph: 'COM reserva' }, { k: 'cliente', label: 'Cliente' }, { k: 'processo', label: 'Processo nº' }, ...LOCAL],
    text: `SUBSTABELECIMENTO

Eu, {{advogado}}, {{oab}}, substabeleço, {{reserva}} de poderes, na pessoa de {{novoAdv}}, {{novaOab}}, os poderes que me foram conferidos por {{cliente}} nos autos do processo nº {{processo}}.

{{cidade}}, {{data}}.

_______________________________________
{{advogado}} – {{oab}}`,
  },
  {
    id: 'juntada', cat: 'Petições simples', title: 'Petição de juntada de documentos',
    sub: 'Também pode ser assinada pelo estagiário (RG da OAB, art. 29)',
    fields: [{ k: 'juizo', label: 'Juízo', ph: 'Juízo da 2ª Vara Cível da Comarca de Campinas/SP' }, { k: 'processo', label: 'Processo nº' },
      { k: 'cliente', label: 'Parte que você representa' }, { k: 'documentos', label: 'Documentos', ph: 'comprovantes de pagamento de jan. a mar./2026' }, ...ADV.slice(0, 2), ...LOCAL],
    text: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO {{juizo}}

Processo nº {{processo}}

{{cliente}}, já qualificado(a) nos autos em epígrafe, por seu(sua) advogado(a), vem, respeitosamente, à presença de Vossa Excelência, requerer a juntada dos seguintes documentos: {{documentos}}.

Termos em que,
pede deferimento.

{{cidade}}, {{data}}.

{{advogado}}
{{oab}}`,
  },
  {
    id: 'habilitacao', cat: 'Petições simples', title: 'Pedido de habilitação nos autos',
    sub: 'Para passar a receber as intimações em seu nome',
    fields: [{ k: 'juizo', label: 'Juízo' }, { k: 'processo', label: 'Processo nº' }, { k: 'cliente', label: 'Parte que você representa' }, ...ADV.slice(0, 2), ...LOCAL],
    text: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO {{juizo}}

Processo nº {{processo}}

{{cliente}}, nos autos em epígrafe, vem, respeitosamente, por seu(sua) advogado(a) que esta subscreve, conforme procuração anexa, requerer a habilitação de {{advogado}}, {{oab}}, e que todas as intimações e publicações sejam feitas exclusivamente em seu nome, sob pena de nulidade (art. 272, § 5º, do CPC).

Termos em que,
pede deferimento.

{{cidade}}, {{data}}.

{{advogado}}
{{oab}}`,
  },
  {
    id: 'notificacao', cat: 'Extrajudicial', title: 'Notificação extrajudicial',
    sub: 'Cobrança, constituição em mora ou aviso formal',
    fields: [{ k: 'notificante', label: 'Notificante (quem envia)' }, { k: 'notificado', label: 'Notificado(a)' }, { k: 'enderecoNot', label: 'Endereço do(a) notificado(a)' },
      { k: 'fatos', label: 'Fatos', ph: 'Em 10/08/2026 foi pago o valor de R$ 2.000,00 pelo serviço X, que não foi entregue...' },
      { k: 'pedido', label: 'O que você exige', ph: 'a devolução integral do valor pago' }, { k: 'prazo', label: 'Prazo', ph: '10 (dez) dias' }, ...LOCAL],
    text: `NOTIFICAÇÃO EXTRAJUDICIAL

NOTIFICANTE: {{notificante}}
NOTIFICADO(A): {{notificado}} – {{enderecoNot}}

Prezado(a) Senhor(a),

Pela presente, o(a) notificante vem NOTIFICÁ-LO(A) do seguinte:

{{fatos}}

Diante disso, fica o(a) notificado(a) constituído(a) em mora e instado(a) a providenciar, no prazo de {{prazo}} contados do recebimento desta, {{pedido}}.

Decorrido o prazo sem solução, serão tomadas as medidas judiciais cabíveis, sem nova comunicação.

{{cidade}}, {{data}}.

_______________________________________
{{notificante}}`,
  },
  {
    id: 'cancelamento', cat: 'Para o cliente (consumidor)', title: 'Cancelamento de assinatura e estorno',
    sub: 'Cobrança após cancelamento, renovação não autorizada, cobrança em dobro',
    fields: [{ k: 'cliente', label: 'Nome do consumidor' }, { k: 'cpf', label: 'CPF' }, { k: 'empresa', label: 'Empresa' },
      { k: 'servico', label: 'Assinatura / serviço' }, { k: 'cobrancas', label: 'Cobranças contestadas', ph: 'R$ 49,90 em 05/09/2026 e R$ 49,90 em 05/10/2026, no cartão final 1234' },
      { k: 'pedidoCanc', label: 'Quando pediu o cancelamento', ph: 'em 20/08/2026, protocolo nº 123' }, { k: 'email', label: 'E-mail para resposta' }, ...LOCAL],
    text: `PEDIDO DE CANCELAMENTO E RESTITUIÇÃO DE VALORES

À {{empresa}}

Eu, {{cliente}}, CPF {{cpf}}, titular da assinatura {{servico}}, solicito:

1. O CANCELAMENTO IMEDIATO da assinatura e de qualquer renovação automática, com confirmação por escrito e número de protocolo.

2. A RESTITUIÇÃO das seguintes cobranças, feitas sem autorização ou após o pedido de cancelamento {{pedidoCanc}}: {{cobrancas}}.

A restituição deve ser em dobro, com correção monetária e juros, nos termos do art. 42, parágrafo único, do Código de Defesa do Consumidor, salvo engano justificável. Se a contratação foi feita pela internet há menos de 7 dias, exerço também o direito de arrependimento (art. 49 do CDC).

Lembro que o cancelamento deve ser possível pelo mesmo canal usado para contratar (Decreto 11.034/2022), sem exigências que dificultem o pedido.

Aguardo resposta em até 10 dias no e-mail {{email}}. Sem solução, registrarei reclamação no consumidor.gov.br e no Procon e tomarei as medidas judiciais cabíveis, inclusive no Juizado Especial Cível.

{{cidade}}, {{data}}.

{{cliente}}`,
  },
  {
    id: 'lgpd', cat: 'Para o cliente (consumidor)', title: 'Pedido de remoção de dados pessoais (LGPD)',
    sub: 'Nome em site, cadastro indevido, dados desatualizados',
    fields: [{ k: 'cliente', label: 'Nome do titular' }, { k: 'cpf', label: 'CPF' }, { k: 'empresa', label: 'Empresa / site' },
      { k: 'urls', label: 'Onde aparecem os dados', ph: 'links das páginas' }, { k: 'motivo', label: 'Por que remover', ph: 'o processo foi arquivado e a página exibe meu nome completo e endereço' },
      { k: 'email', label: 'E-mail para resposta' }, ...LOCAL],
    text: `REQUERIMENTO DO TITULAR DE DADOS – LEI 13.709/2018 (LGPD)

À {{empresa}}
Aos cuidados do(a) Encarregado(a) pelo Tratamento de Dados Pessoais

Eu, {{cliente}}, CPF {{cpf}}, com base no art. 18 da Lei Geral de Proteção de Dados, requeiro:

1. A confirmação da existência de tratamento e o acesso aos meus dados pessoais (art. 18, I e II);
2. A correção dos dados incompletos, inexatos ou desatualizados (art. 18, III);
3. A anonimização, o bloqueio ou a eliminação dos dados desnecessários, excessivos ou tratados em desconformidade com a lei (art. 18, IV), em especial nas seguintes páginas: {{urls}};
4. A informação sobre as entidades com as quais meus dados foram compartilhados (art. 18, VII).

Motivo: {{motivo}}.

Peço resposta em até 15 dias (art. 19, II), no e-mail {{email}}. Sem resposta adequada, apresentarei petição à Autoridade Nacional de Proteção de Dados (art. 18, § 1º).

{{cidade}}, {{data}}.

{{cliente}}`,
  },
];

/* ---------- Lei seca: textos compilados no Planalto (fonte oficial) ---------- */
const LEIS = [
  ['Constituição Federal', 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'],
  ['Código Civil (Lei 10.406/2002)', 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm'],
  ['Código de Processo Civil (Lei 13.105/2015)', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm'],
  ['Código Penal (DL 2.848/1940)', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm'],
  ['Código de Processo Penal (DL 3.689/1941)', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm'],
  ['CLT (DL 5.452/1943)', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm'],
  ['Código de Defesa do Consumidor (Lei 8.078/1990)', 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'],
  ['Código Tributário Nacional (Lei 5.172/1966)', 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm'],
  ['Estatuto da Advocacia (Lei 8.906/1994)', 'https://www.planalto.gov.br/ccivil_03/leis/l8906.htm'],
  ['ECA (Lei 8.069/1990)', 'https://www.planalto.gov.br/ccivil_03/leis/l8069compilado.htm'],
  ['Juizados Especiais (Lei 9.099/1995)', 'https://www.planalto.gov.br/ccivil_03/leis/l9099.htm'],
  ['Lei Maria da Penha (Lei 11.340/2006)', 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm'],
  ['Lei de Execução Penal (Lei 7.210/1984)', 'https://www.planalto.gov.br/ccivil_03/leis/l7210.htm'],
  ['Mandado de Segurança (Lei 12.016/2009)', 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12016.htm'],
  ['LGPD (Lei 13.709/2018)', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'],
];

/* ---------- Pesquisa de jurisprudência (abre a busca oficial com o termo) ---------- */
const BUSCAS = [
  ['STJ', 'https://scon.stj.jus.br/SCON/pesquisar.jsp?livre='],
  ['STF', 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&queryString='],
  ['Todos os tribunais (.jus.br)', 'https://www.google.com/search?q=site%3Ajus.br+'],
];

/* ---------- Guias extras, para quem atende consumidor ---------- */
GUIDES.push(
  {
    id: 'assinatura',
    icon: 'credit-card',
    title: 'Cobrança de assinatura',
    sub: 'Cliente não consegue cancelar ou foi cobrado depois de cancelar',
    sections: [
      { h: 'O que a lei garante', type: 'list', items: [
        'Cobrança indevida paga deve ser devolvida em dobro, com correção e juros, salvo engano justificável (CDC art. 42, parágrafo único).',
        'Contratou pela internet ou por telefone? Tem 7 dias para desistir e receber tudo de volta (CDC art. 49).',
        'O cancelamento deve ser tão fácil quanto a contratação. O SAC tem que permitir cancelar e dar protocolo (Decreto 11.034/2022).',
        'Dificultar o cancelamento ou condicionar a cobrança de taxa sem previsão clara é prática abusiva (CDC art. 39).',
      ]},
      { h: 'Passo a passo para o cliente', type: 'do', items: [
        'Pedir o cancelamento por escrito (e-mail ou chat) e guardar o protocolo e os prints.',
        'Mandar o modelo "Cancelamento de assinatura e estorno" da aba Modelos.',
        'Contestar a cobrança no banco ou no cartão, com o protocolo em mãos.',
        'Sem resposta em 10 dias: reclamação no consumidor.gov.br, que tem prazo de resposta da empresa.',
        'Ainda sem solução: Juizado Especial Cível. Até 20 salários mínimos, a pessoa pode ir sem advogado (Lei 9.099, art. 9º).',
      ]},
      { h: 'Evite', type: 'dont', items: [
        'Só bloquear o cartão: a dívida pode continuar e virar negativação.',
        'Aceitar "crédito na conta" no lugar do estorno, se a pessoa não quiser.',
      ]},
    ],
    fonte: 'CDC arts. 39, 42 e 49; Decreto 11.034/2022; Lei 9.099/1995, art. 9º.',
  },
  {
    id: 'dados',
    icon: 'eye-off',
    title: 'Nome do cliente na internet',
    sub: 'Processo aparecendo no Google e em sites de busca jurídica',
    sections: [
      { h: 'Por que aparece', type: 'text', items: [
        'Processos e diários oficiais, em regra, são públicos. Sites de busca jurídica copiam esses dados e o Google indexa as páginas. Público não quer dizer sem regra: quem republica dados pessoais continua sujeito à LGPD.',
      ]},
      { h: 'O que dá para pedir', type: 'list', items: [
        'Ao site: correção, anonimização ou eliminação de dados excessivos ou desatualizados (LGPD art. 18). Use o modelo "Pedido de remoção de dados pessoais".',
        'Ao tribunal: se o processo deveria estar em segredo de justiça (família, por exemplo, CPC art. 189), peça a decretação do sigilo nos autos.',
        'Ao Google: pedido de remoção de resultados com informações pessoais, pelo formulário de remoção.',
        'Sem resposta em 15 dias: petição à ANPD (LGPD art. 18, § 1º) ou ação judicial.',
      ]},
      { h: 'Na hora de explicar ao cliente', type: 'say', items: [
        '"O processo é público por regra, mas você tem direito de pedir que tirem ou escondam dados que não precisam estar lá."',
        '"Remover do site não apaga o processo do tribunal. O processo continua existindo."',
      ]},
    ],
    fonte: 'LGPD arts. 18 e 19; CPC art. 189.',
  },
);
