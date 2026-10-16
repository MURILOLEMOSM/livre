# CodePalma no Stitch

Prompts para gerar o layout do CodePalma no [Stitch](https://stitch.withgoogle.com). Crie um projeto **Mobile**, cole primeiro o **briefing de estilo** e depois um prompt por tela (no mesmo projeto, para manter o visual).

## 1. Briefing de estilo (colar primeiro)

```
App mobile em português do Brasil chamado "CodePalma" — ciência da computação na palma da mão, para estudantes e profissionais de computação.

Estilo: limpo, moderno e um pouco "nerd", sem parecer genérico. Cantos arredondados (14px nos cards, 10px nos botões), sombras suaves, muito espaço em branco.
Cores (claro): fundo #F4F3FA, cards #FFFFFF, texto #1B1A2E, texto secundário #5E5C76, bordas #E1DFEE, cor principal roxo #3B3486, destaque verde-água #22A88F, sucesso #2E7D4F, alerta #B7791F, erro #C0392B.
Cores (escuro): fundo #121220, cards #1B1B2E, texto #ECEBF7, principal #A89BFF, destaque #3DDBB9.
Fontes: títulos em Space Grotesk (negrito), texto em Inter, código e números em JetBrains Mono.
Topo: logo ">_ CodePalma" (o ">_" em verde-água, monoespaçado; "Palma" em roxo) e botão "Instalar" com contorno à direita.
Barra de abas fixa embaixo com 5 itens (ícone + rótulo): Estante, Estudar, Praticar, Ferramentas, Carreira. Aba ativa em roxo, as outras em cinza.
Botões: principal roxo cheio com texto branco; secundário roxo claro (12% de opacidade); contorno roxo. Filtros como "chips" arredondados roláveis na horizontal.
```

## 2. Telas

### Estante (tela inicial)
```
Tela "Minha estante". Título grande e abaixo "12 livros na estante". Botão "+ Adicionar livro" à direita do título.
Campo de busca "Buscar por título, autor, editora ou área". Chips de filtro: Todos (ativo), Lendo, Quero ler, Lidos, Com PDF, Algoritmos, Redes, Banco de dados...
O destaque da tela é uma ESTANTE DE MADEIRA desenhada: moldura marrom (#8B5E3C) com fundo lilás claro, 3 prateleiras, e em cada uma 3–4 livros EM PÉ (proporção 2:3) mostrando a capa. Livros sem capa aparecem como lombada colorida com o título escrito. Alguns livros têm um selo "PDF" ou "✓ lido" no canto e uma barrinha verde-água de progresso de leitura na base. Nome do livro pequeno embaixo de cada um.
Livros de exemplo: "Algoritmos: Teoria e Prática" (Cormen), "Código Limpo", "Sistemas Operacionais Modernos", "Redes de Computadores e a Internet", "Introdução à Teoria da Computação", "Entendendo Algoritmos".
Embaixo: botões pequenos "⭐ Clássicos do curso", "⬇ Fazer backup", "⬆ Restaurar backup" e uma nota "Os livros ficam salvos só neste aparelho".
```

### Adicionar livro (folha inferior)
```
Folha que sobe de baixo (bottom sheet) com título "Novo livro" e X para fechar.
No topo, à esquerda, um quadro vazio de prévia da capa (2:3); à direita, botões empilhados: "📷 Tirar foto da capa" (principal), "🖼️ Escolher da galeria" (secundário), "▥ Foto do código de barras" (contorno).
Campos: ISBN com botão "Buscar" ao lado; Título com botão de lupa; Autor(es); em duas colunas: Editora, Edição, Ano, Nº de páginas; Área (seletor) e Situação (Quero ler / Lendo / Lido); Link do PDF; ou arquivo PDF do aparelho; Anotações.
Botão largo no final: "Salvar na estante".
```

### Estudar
```
Tela "Estudar e decorar" com subtítulo explicando repetição espaçada.
Chips de baralho: Complexidade (Big-O) (22) ativo, Estruturas de dados, Padrões de entrevista, Sistemas operacionais, Redes, Banco de dados, POO e SOLID, Git e terminal, Matemática discreta.
Linha com 5 caixinhas de contagem: "21 Novos/errados", "1 Caixa 2", "0 Caixa 3", "0 Caixa 4", "0 Dominados".
Cartão grande central (flashcard) com a pergunta "Quick sort" em destaque e, abaixo de uma linha tracejada, a resposta "Médio O(n log n); pior O(n²)...". Abaixo, três botões: "Errei" (vermelho), "Quase" (secundário), "Acertei" (principal). Texto pequeno "20 para revisar agora".
Botões "+ Criar cartão" e "Recomeçar este baralho". Card de dicas de estudo no final.
```

### Praticar — Diário
```
Tela "Praticar". Chips de sub-aba: "📒 Diário" (ativo), "🛰️ Radar de sites", "🗺️ Trilha".
Três cards de número lado a lado: "Resolvidos 37", "Nesta semana 6", "Para revisar 3". Botão largo "+ Registrar problema".
Seção "🔁 Revisar hoje" com cards de problema: nome em negrito ("1. Two Sum"), linha cinza "LeetCode · Fácil · Hash map", linha roxa "💡 hash map guardando o complemento" e uma etiqueta à direita (verde "Resolvido", vermelha "Travei", amarela "Tentando").
Seção "Padrões que você já treinou": barras horizontais com nome do padrão à esquerda (Hash map, Dois ponteiros, BFS/DFS, Programação dinâmica) e o número à direita, e a frase "Faltando: Heap, Backtracking, Intervalos".
```

### Praticar — Radar de sites
```
Mesma tela Praticar com a sub-aba "🛰️ Radar de sites" ativa.
Aviso em faixa amarela clara com borda esquerda: "Preços e planos mudam: confira no site. Para começar do zero, prefira Beecrowd, Exercism ou CS50; para entrevista, NeetCode + LeetCode."
Chips: Todos, Em português, 100% grátis, Lógica e algoritmos, Entrevistas, Programação competitiva...
Grade de cards (1 coluna no celular): nome do site em negrito (Beecrowd, LeetCode, NeetCode, HackerRank, Codeforces, Exercism), linha cinza "Lógica e algoritmos · Grátis · PT", descrição de 2 linhas e botão pequeno "Abrir site ↗".
```

### Ferramentas
```
Tela "Ferramentas" com subtítulo "Tudo funciona sem internet".
Lista de seções sanfona (acordeão) com "+" à direita: 🔢 Conversor de bases e complemento de 2 (ABERTA), 🌐 Calculadora de sub-rede IPv4, ⊤ Tabela-verdade, 📈 Big-O na prática, 🔍 Testador de regex, { } Formatar e validar JSON, ⏱️ Timestamp Unix, 🎓 Média da disciplina, 🍅 Pomodoro.
Na seção aberta: grade 2x2 de campos Decimal "42", Hexadecimal "2A", Binário "101010", Octal "52"; seletor "Complemento de 2 com 16 bits"; caixa de resultado em fonte monoespaçada mostrando "0000 0000 0010 1010".
```

### Ferramentas — Média da disciplina
```
Seção "🎓 Média da disciplina" aberta. Tabela editável com colunas Avaliação, Nota (0–10), Peso: P1 7,5 peso 3; P2 vazia peso 3; Trabalho 9 peso 2; Listas vazia peso 2. Botão "+ Avaliação". Campo "Média para passar: 6".
Resultado em destaque: "Média parcial: 8,10" e "Precisa de média 4,43 no que falta" com o número grande em roxo.
```

### Carreira
```
Tela "Carreira e postura" com subtítulo "Como se comportar em entrevista, no estágio, no code review e no time".
Card "✅ Checklist antes da entrevista" com botão "Zerar" e 8 itens com caixa de seleção (3 marcados).
Seções sanfona: 🧩 Durante o problema técnico, 🗣️ O que falar × o que evitar (ABERTA), ⭐ Perguntas comportamentais (STAR), 👀 Code review, 🧑‍💻 Postura no estágio, ⚖️ Ética, LGPD e segurança, 🧠 Síndrome do impostor e burnout, 📄 Currículo, GitHub e LinkedIn.
Na seção aberta, dois quadros lado a lado (empilhados no celular): verde "✔ Fale" e vermelho "✘ Evite", cada um com 4–5 frases curtas.
Embaixo, "Modelos prontos": chips (Resposta STAR, Mensagem de commit, Relato de bug, Descrição de PR, Pedido de ajuda) e um card com campos de texto e botões "Copiar" e "Limpar".
```

### Versão escura
```
Gere a tela "Minha estante" no modo escuro usando as cores escuras do briefing, mantendo a estante de madeira em tons mais escuros (#7A5233).
```

## 3. Ajustes que costumam ajudar

- "Mantenha exatamente a mesma barra de abas e o mesmo topo das outras telas."
- "Use textos reais em português, nada de lorem ipsum."
- "Toques de pelo menos 44px de altura; contraste AA."
