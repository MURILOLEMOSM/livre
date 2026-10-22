# LIDO · Leitura com foco

App web (PWA) irmão do LIVRE, agora para leitura: cronômetro com uma vela que apaga se você sair do app, notas (digitadas ou ditadas) que voltam em revisão espaçada, metas diárias, nível e medalhas. Funciona offline. Com login (mesma conta do LIVRE, Firebase) os dados sincronizam em `lido/{uid}`; sem conta, ficam só no aparelho. Tem exportar/importar em JSON.

Fica na pasta `lido/` deste repositório, então no Netlify abre em `https://<seu-site>/lido/`.

## Telas

- **Hoje**: anel da meta diária, dias seguidos, total de horas e páginas, livro atual com tempo estimado para terminar, aviso de notas para revisar e mapa das últimas 12 semanas.
- **Estante**: livros em Lendo, Quero ler e Lido, com capa gerada pela cor e pelas iniciais.
- **Livro**: progresso, sessões (vela acesa ou apagada), notas e ações (ler, anotar, terminar, editar).
- **Ler**: escolhe 10 a 60 min (ou sem meta) e a página inicial. A cera derrete até a meta. Saiu do app por mais de 15 s, a vela apaga e a sessão perde o bônus. No fim informa a página e, se quiser, uma nota (botão **Ditar** usa o reconhecimento de voz do navegador).
- **Revisar**: cada nota vira um cartão. Lembrou, ele volta em 3, 7, 16, 35 e 90 dias; esqueceu, volta amanhã. Uma "pergunta para revisão" opcional vira a frente do cartão.
- **Perfil**: nível, origem do XP, 14 medalhas e ajustes (nome, meta, compartilhar, exportar/importar, apagar).

## XP

1 por minuto lido · +5 por sessão de 5 min ou mais com a vela acesa · +3 por nota · +1 por revisão · +50 por livro terminado.

## Estrutura

```
lido/
├── index.html            # casca, menus e folhas (dialogs)
├── manifest.webmanifest
├── sw.js                 # cache offline (só apaga caches "lido-*")
├── css/lido.css
├── js/core.js            # estado, armazenamento, XP, sequência, revisão, medalhas
├── js/views.js           # HTML de cada tela
├── js/main.js            # rotas, vela, folhas e eventos
├── js/pwa.js             # service worker e botão instalar
└── icons/
```

## Atualizar uma versão publicada

Mudou algum arquivo? Suba `VERSION` no `lido/sw.js` (ex.: `lido-v2`).
