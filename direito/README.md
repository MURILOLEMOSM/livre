# TOGA · estante e prática jurídica

App web (PWA) para estudantes de Direito e advogados. Fica em `/direito/`, separado do LIVRE, e funciona offline. Os dados ficam só no aparelho (IndexedDB + localStorage). Não precisa de conta nem de servidor.

## Abas

- **Estante**: prateleira digital com as capas em pé. Para adicionar um livro:
  - **foto do código de barras**: o app lê o ISBN e busca título, autor, editora, ano e capa no Google Books (e, se não achar, no Open Library);
  - **foto da capa**: vira a capinha na prateleira;
  - **PDF**: link ou arquivo guardado no aparelho.

  Dá para filtrar por área e situação (quero ler, lendo, lido, consulta), e o app avisa quando a edição tem 3 anos ou mais. Tem cópia de segurança em JSON.
- **Prazos**: calculadora em dias úteis ou corridos para cível, JEC, trabalhista e penal. Considera:
  - feriados nacionais, Carnaval, Corpus Christi e os feriados da Justiça Federal;
  - a suspensão de 20/12 a 20/01;
  - a publicação no DJe;
  - o prazo em dobro;
  - os feriados locais que você cadastrar.

  Os prazos salvos aparecem com contagem regressiva e podem ser exportados para a agenda (.ics, com alarme 24 h antes). Tem também uma tabela rápida dos prazos mais usados.
- **Guias**: primeiro atendimento (o que falar e o que não falar), postura em audiência, ética da OAB, redes sociais (Provimento 205/2021), estágio, delegacia, atendimento por WhatsApp e técnicas para decorar.
- **Estudo**: flashcards com repetição espaçada (prazos, brocardos latinos, Constituição e ética da OAB) e cartões próprios.
- **Apps**: catálogo de ferramentas por categoria (legislação, jurisprudência, processo eletrônico, gestão, estudo, cálculos). Dá para marcar as que você usa e cadastrar outras.

## Arquivos

```
direito/
├── index.html · style.css · manifest.webmanifest · sw.js (escopo /direito/)
├── data.js   # conteúdo: guias, tabela de prazos, baralhos, catálogo de apps
├── app.js    # telas, estante (IndexedDB), cálculo de prazos, estudo
└── icon.svg · icon-192.png · icon-512.png
```

Ao mudar qualquer arquivo, suba `VERSION` em `direito/sw.js`.

O conteúdo jurídico é material de apoio. Confira sempre o texto da lei e o calendário do tribunal.
