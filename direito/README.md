# TOGA · estante e prática jurídica

App web (PWA) para estudantes de Direito e advogados. Fica em `/direito/`, separado do LIVRE, e funciona offline. Os dados ficam só no aparelho (IndexedDB + localStorage). Não precisa de conta nem de servidor.

## Abas

O menu tem cinco abas: Estante, Processos, Prazos, Modelos e Mais. Em "Mais" ficam Guias, Lei seca e jurisprudência, Estudo, Apps e Sobre.

- **Estante**: prateleira digital com as capas em pé. Para adicionar um livro:
  - **foto do código de barras**: o app lê o ISBN e busca título, autor, editora, ano e capa no Google Books (e, se não achar, no Open Library);
  - **foto da capa**: vira a capinha na prateleira;
  - **PDF**: link ou arquivo guardado no aparelho.

  Dá para filtrar por área e situação (quero ler, lendo, lido, consulta), e o app avisa quando a edição tem 3 anos ou mais. Tem cópia de segurança em JSON.
- **Processos** (grátis, fonte oficial):
  - Acompanha processos pelo número. O app confere os dígitos verificadores e descobre o tribunal sozinho.
  - Os andamentos vêm da API pública do DataJud (CNJ). Novos andamentos aparecem marcados.
  - Cada processo mostra a data em que a fonte foi atualizada e o link do tribunal.
  - Busca as intimações pela OAB no Diário de Justiça Eletrônico Nacional (Comunica PJe), com o texto inteiro e o botão "Calcular prazo".
- **Modelos**: procuração, contrato e recibo de honorários, hipossuficiência, substabelecimento, juntada, habilitação, notificação extrajudicial, cancelamento de assinatura com estorno (CDC) e pedido LGPD. Os dados do advogado são preenchidos uma vez e reaproveitados. Dá para copiar, baixar em Word ou compartilhar.
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

## Feito a partir das reclamações do Reclame Aqui

| O que as pessoas reclamam (Jusbrasil e similares) | Como o TOGA faz |
|---|---|
| Cobrança indevida e dificuldade para cancelar | É grátis: sem assinatura nem cartão |
| Pagar para ver o próprio processo, que é público | Consulta grátis na fonte oficial do CNJ |
| Processo desatualizado sem explicação | Mostra a data de atualização da fonte e o link do tribunal |
| Notificação que chega sem conteúdo | Intimação com o texto inteiro e o cálculo do prazo |
| Modelos bloqueados até verificar a OAB | Modelos livres, sem cadastro |
| Conta bloqueada e suporte que não responde | Não tem conta |
| Dados pessoais expostos e difíceis de remover | Dados só no aparelho, botão "Apagar tudo" e modelo de pedido LGPD para o cliente |

## Servidor (Netlify)

- `netlify/functions/datajud.mjs` responde em `POST /api/datajud`. Encaminha a consulta para a API pública do DataJud. O CNJ pode trocar a chave pública; se trocar, defina `DATAJUD_API_KEY` no Netlify com a chave nova (wiki do DataJud).
- `netlify/functions/djen.mjs` responde em `GET /api/djen`. Encaminha a consulta para a API do Comunica PJe.

Nenhuma das duas guarda o que é consultado. Sem o Netlify, as abas funcionam, mas as consultas mostram o link para buscar direto no site oficial.

## Arquivos

```
direito/
├── index.html · style.css · manifest.webmanifest · sw.js (escopo /direito/)
├── data.js   # conteúdo: guias, tabela de prazos, baralhos, catálogo de apps
├── app.js    # telas, estante (IndexedDB), cálculo de prazos, estudo
├── pratica.js  # processos, intimações, modelos, lei seca, sobre, avisos e partida do app
└── icon.svg · icon-192.png · icon-512.png
```

Ao mudar qualquer arquivo, suba `VERSION` em `direito/sw.js`.

O conteúdo jurídico é material de apoio. Confira sempre o texto da lei e o calendário do tribunal.
