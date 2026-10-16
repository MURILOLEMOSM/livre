# CodePalma · computação na palma da mão

App web (PWA) para **estudantes e profissionais de Ciência da Computação** (e cursos vizinhos: SI, ADS, Eng. de Software). Funciona offline, pode ser instalado no celular e guarda tudo no próprio aparelho, sem login.

## O que tem

| Aba | Para quê |
|---|---|
| **📚 Estante** | Prateleira digital com os livros "em pé". Adicione tirando **foto da capa**, lendo o **código de barras (ISBN)**, buscando pelo título (Google Books / Open Library) ou digitando título, autor, **editora**, edição e ano. Guarde o **link do PDF** ou o próprio arquivo, marque a página em que parou e filtre por área (algoritmos, SO, redes, BD, IA...). Botão **⭐ Clássicos do curso** com 24 livros das ementas (Cormen, Tanenbaum, Kurose, Sipser, Código Limpo...). Backup e restauração em um arquivo. |
| **🧠 Estudar** | Cartões com repetição espaçada (caixas de Leitner) para decorar o que mais cai: **Big-O**, estruturas de dados, **padrões de entrevista**, sistemas operacionais, redes, banco de dados, POO/SOLID/padrões de projeto, Git e terminal, matemática discreta e lógica. Dá para criar os próprios cartões. |
| **⌨️ Praticar** | **Diário de problemas** (site, dificuldade, padrão, ideia-chave, tempo) com **revisão espaçada**: o problema volta em 3, 7, 21 e 60 dias para você resolver de novo sem olhar; gráfico dos padrões já treinados e dos que faltam. **Radar de sites** de exercícios (Beecrowd, LeetCode, NeetCode, HackerRank, Codeforces, CSES, Exercism, freeCodeCamp, CS50, roadmap.sh, TryHackMe, OBI...) com preço, idioma e para quem serve. **Trilha** com 29 marcos, de fundamentos até portfólio. |
| **🛠️ Ferramentas** | Conversor de bases e **complemento de 2**, **calculadora de sub-rede IPv4**, **tabela-verdade** (detecta tautologia/contradição), **Big-O na prática** (quanto tempo leva para cada n), **testador de regex**, formatador/validador de **JSON**, **timestamp Unix**, **média da disciplina** ("quanto preciso tirar na P2?") e **Pomodoro**. Tudo offline. |
| **💼 Carreira** | Como se comportar e o que falar: checklist antes da entrevista, roteiro do **live coding**, **o que falar × o que evitar**, perguntas comportamentais (**STAR**), **code review** (dar e receber), postura no estágio (regra dos 30 min, como pedir ajuda, daily), ética/LGPD/segurança, síndrome do impostor e burnout (com CVV 188), currículo/GitHub/LinkedIn. **Modelos prontos para copiar**: resposta STAR, mensagem de commit, relato de bug, descrição de PR e pedido de ajuda. |

## Por que essas funções (pesquisa)

- **Evasão e reprovação** no curso se concentram no primeiro ano, em **Programação e Cálculo** (reprovação acima de 30% em várias universidades; ingressantes com lacunas em matemática e interpretação de enunciados) → cartões de revisão, ferramentas de discreta/lógica, calculadora de média e dicas de estudo ativo (teste de mesa, monitoria).
- Treinar algoritmos fica espalhado em vários sites, em inglês, e a pessoa **esquece o que resolveu** → diário único com ideia-chave e revisão espaçada + radar dizendo qual site usar em cada fase (Beecrowd/Exercism para começar, NeetCode/LeetCode para entrevista).
- **Entrevista técnica e síndrome do impostor** aparecem o tempo todo nos relatos de estagiários e juniores → guia de postura, o que falar e o que evitar, STAR e checklist.
- No trabalho, a maior frustração dos devs é **dívida técnica** e processos lentos de **code review** (Stack Overflow Developer Survey) → boas práticas de PR/review e modelos de commit, bug e PR.
- Livros técnicos são caros e ficam espalhados entre físicos, PDFs e bibliotecas virtuais → estante única com o link/arquivo de cada um.

## Rodar no computador

```bash
cd computacao
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar

No Netlify, crie um **site novo** apontando para este repositório com *Base directory* = `computacao`. O `computacao/netlify.toml` libera a câmera e as buscas de livros (Google Books e Open Library).

## Estrutura

```
computacao/
├── index.html · manifest.webmanifest · sw.js · netlify.toml
├── css/app.css
├── icons/
└── js/
    ├── app.js          # rotas das abas, offline e instalação
    ├── util.js · db.js # utilidades e IndexedDB (livros, capas e PDFs)
    ├── estante.js      # estante, foto, ISBN, PDF, clássicos, backup
    ├── estudar.js      # cartões com repetição espaçada
    ├── praticar.js     # diário de problemas, radar de sites, trilha
    ├── ferramentas.js  # bases, sub-rede, tabela-verdade, Big-O, regex, JSON, timestamp, média, pomodoro
    └── carreira.js     # entrevista, postura, code review, ética e modelos
```

A estante, os cartões e o visual seguem a mesma base do FisioPalma (`fisio/`), adaptados para computação.

## Aviso

Conteúdo de apoio ao estudo. Preços e planos das plataformas mudam: confira no site oficial.
