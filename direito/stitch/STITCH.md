# TOGA no Stitch

As imagens desta pasta são as telas reais do app (celular 390 × 844 e computador 1280 × 800).

Para montar no Stitch (stitch.withgoogle.com):

1. Crie um projeto **App** (celular).
2. Cole o **prompt base** abaixo. Se quiser que o Stitch copie o visual, anexe também a imagem `01-estante.png`.
3. Depois, para cada tela, cole o prompt da tela. Se quiser, anexe a imagem com o mesmo número.
4. Gere a versão de computador colando o prompt base com "versão desktop, menu lateral à esquerda" e anexando `20-desktop-estante.png`.

## Prompt base (sistema visual)

```
App mobile em português do Brasil chamado TOGA, para estudantes de Direito e advogados.
Tema escuro, sóbrio, elegante, como uma biblioteca jurídica à noite.
Cores: fundo azul-marinho #0F1A2B; superfícies #16243A e cartões #1B2B45 com borda #2A3D5C;
texto #EEF1F6; texto secundário #9AA8BF; destaque dourado #D4AF5F (botões principais com texto #1A1305);
verde #4CC38A para "faça", vermelho #EF6A6A para "evite" e urgência, azul #6AA9EF para "frases".
Tipografia: títulos em serifa Fraunces (bold), texto em Inter. Rótulos pequenos em caixa alta, dourados e espaçados.
Cantos arredondados de 14 px nos cartões, botões em pílula (altura 44 px), ícones de linha (Lucide).
Topo com a marca "TOGA." (o ponto em dourado). Barra inferior com 5 abas e ícones:
Estante, Processos, Prazos, Modelos, Mais. A aba ativa fica dourada.
```

## Telas

**01 · Estante** (`01-estante.png`)
```
Tela "Sua estante · 9 livros" com botão dourado "+ Adicionar".
Aviso vermelho no topo: "1 prazo vencendo: Réplica (amanhã)".
Busca "Título, autor, editora ou ISBN" e seletor "Todos". Chips de área: Todas, Administrativo, Civil, Constitucional...
Uma estante de madeira com prateleiras: os livros aparecem EM PÉ, capa de frente (proporção 2:3),
com sombra, sobre tábuas de madeira marrom. Selo vermelho "PDF" em alguns livros.
```

**02 · Detalhe do livro** (`02-livro.png`)
```
Folha que sobe de baixo: capa grande à esquerda, área e situação em dourado ("Civil · Lido"),
título em serifa, autor, editora · ano, ISBN. Aviso dourado: "Edição de 2020. Leis e súmulas mudam rápido:
confira se há edição mais nova". Anotações. Botões: "Abrir link" (dourado) e "Editar".
```

**03 · Adicionar livro** (`03-adicionar-livro.png`)
```
Folha "Novo livro" com dois quadros tracejados dourados: "Foto da capa" (ícone de câmera) e
"Foto do código de barras" (ícone de leitor). Campo ISBN com botão "Buscar dados".
Campos: Título*, Autor(es), Editora, Edição, Ano, Área, Situação, PDF (link ou arquivo), Anotações.
Botões: Cancelar e "Salvar na estante" (dourado).
```

**04 · Processos** (`04-processos.png`)
```
Rótulo "GRÁTIS · DADOS OFICIAIS DO CNJ", título "Processos".
Cartão com campo "Número do processo (20 dígitos)", Apelido, Cliente e botão dourado "+ Acompanhar".
Lista "Acompanhando (1)" com botão "Atualizar todos": item "Maria x Banco", número do processo,
TJSP, cliente e "Último andamento: Conclusão em 10/10/2026". Selo dourado "2 novos" quando houver.
Seção "Intimações no Diário (DJEN)" com OAB nº, UF e "Desde".
```

**05 · Processo** (`05-processo.png`)
```
"← Processos", rótulo "JUSTIÇA ESTADUAL · TJSP", título "Maria x Banco", número do processo.
Botões: Atualizar (dourado), Site do tribunal, Copiar nº, lixeira.
Cartão "1º GRAU · SAJ", "Procedimento Comum Cível", vara, etiquetas de assunto,
"fonte atualizada em 14/10/2026 09:12" em destaque e uma linha do tempo vertical de andamentos
(o mais recente com ponto dourado).
```

**06 · Intimações** (`06-intimacoes.png`)
```
Lista de cartões de intimação: selo dourado do tribunal (TJSP), etiqueta "Intimação", data,
número do processo em negrito, classe e vara. "Ler o texto" expansível.
Botões "Calcular prazo" e "Acompanhar". Acima: "2 publicações desde 09/10/2026 · conferir no site oficial".
```

**07 · Prazos** (`07-prazos.png`) e **08 · Resultado** (`08-prazo-resultado.png`)
```
Calculadora: data da intimação, prazo (dias), tipo de processo (Cível CPC, Juizado, Trabalhista, Penal),
caixas: Diário eletrônico, Prazo em dobro, Carnaval e Corpus Christi, Justiça Federal. Botão "Calcular".
Resultado: "Vence seg, 09/11/2026" grande com a data em dourado, passos (publicação, 1º dia, vencimento),
"9 dias não contados" expansível e um formulário para salvar o prazo.
"Meus prazos": lista com borda colorida à esquerda (vermelho = 2 dias ou menos, dourado = até 5, verde = mais)
e contagem "amanhã", "6 dias". Botões "Avisar ao abrir" e "Todos na agenda".
```

**09 · Modelos** (`09-modelos.png`) e **10 · Modelo** (`10-modelo.png`)
```
Lista de modelos por categoria (Advocacia, Petições simples, Extrajudicial, Para o cliente)
em cartões com título, descrição e seta.
Tela do modelo: formulário à esquerda (no celular, em cima) e uma FOLHA DE PAPEL creme (#FBF8F1)
com o texto em Times New Roman que se atualiza enquanto digita. Botões: Copiar (dourado), Baixar Word, Enviar.
```

**11 · Mais** e **12 · Guias** (`11-mais.png`, `12-guias.png`)
```
Grade de cartões com ícone dourado, título em serifa e descrição:
Guias de conduta, Lei seca e jurisprudência, Estudo, Apps e sites, Sobre e privacidade.
Guias: Primeiro atendimento, Postura em audiência, Ética da OAB em 10 pontos, Redes sociais e publicidade,
Estágio, Delegacia, WhatsApp, Como decorar, Cobrança de assinatura, Nome do cliente na internet.
```

**13 · Guia** (`13-guia.png`)
```
Guia "Primeiro atendimento": cartões com borda lateral colorida.
"Faça" (borda e ícones verdes de check), "Evite" (vermelho, X), "Frases que ajudam" (azul, balão de fala),
"Frases que comprometem" (vermelho). Rodapé com a base legal.
```

**14 · Estudo** e **15 · Flashcard** (`14-estudo.png`, `15-flashcard.png`)
```
Baralhos: "Prazos que mais caem", "Brocardos latinos", "Constituição essencial", "Ética OAB",
cada um com selo dourado "13 para revisar".
Flashcard grande central: pergunta em serifa ("Onus probandi"), resposta em dourado ("Ônus da prova"),
contador "1 de 18", botões "Errei" (vermelho suave) e "Acertei" (dourado).
```

**16 · Lei seca**, **17 · Apps** e **18 · Sobre** (`16-lei-seca.png`, `17-apps.png`, `18-sobre.png`)
```
Lei seca: busca de jurisprudência com botões STJ, STF e Todos os tribunais; lista de códigos com ícone de pergaminho;
"Meus artigos" salvos com botão "Virar cartão".
Apps: cartões com nome, estrela para marcar "uso", "Quando usar" e etiquetas (grátis, oficial).
Sobre: tabela "O que as pessoas reclamam × Como o TOGA faz", bloco "Seus dados" e botões
"Baixar cópia de segurança", "Restaurar" e "Apagar tudo" (vermelho).
```
