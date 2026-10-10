# LIVRE · Controle de Hábitos

App web (PWA) para acompanhar dias livres de vícios: login, contador em tempo real, recordes, histórico de recaídas, metas e um lembrete por dia no celular. Funciona offline e pode ser instalado.

## Como funciona para quem usa

1. Abre o link, cria a conta com e-mail e senha (ou entra, se já tem).
2. Primeiro acesso: escolhe o que quer largar (bebidas, cigarro, redes sociais...) e desde quando.
3. O app abre zerado só com esses hábitos.
4. Ativa o lembrete e escolhe o horário. Todo dia chega: "Você está 3 dias sem Cigarro".

## Telas

- **Hoje**: índice de disciplina (0 a 100), nível e XP, botão "Tô com vontade", foco do dia, pactos ativos e a lista de jornadas com a árvore de cada hábito.
- **Hábito**: contador, meta, marcos (1 dia até 1 ano), calendário das últimas 12 semanas, gatilhos das recaídas e histórico.
- **Foco**: sessão de 15 a 60 min. A árvore cresce com o tempo e seca se você sair do app por mais de 10 s. Opção de travar a sessão e modo preto e branco.
- **Disputa**: cada pessoa tem um ID (LIV-XXXXX). Adiciona amigos pelo ID ou por link, monta grupos de até 10 e vê o placar ao vivo de quem está há mais tempo limpo em cada vício. O grupo vê só a categoria do hábito, e cada um escolhe o que mostra.
- **Pactos**: prazo, valor, juiz e destino do dinheiro. Recaiu no prazo, o pacto quebra. Mensagem pronta para mandar ao juiz.
- **Conquistas**: nível, origem do XP, 15 medalhas e ajustes.

## Estrutura

```
livre/
├── index.html              # casca do app, folhas (dialogs) e links do PWA
├── manifest.webmanifest
├── sw.js                   # cache offline
├── css/style.css           # todo o visual
├── package.json            # dependências das funções (web-push, firebase-admin)
├── netlify.toml
├── firebase/firestore.rules           # regras de acesso do banco (cole no console)
├── netlify/
│   ├── functions/daily-reminder.mjs   # roda de hora em hora e manda o push
│   ├── functions/disputa.mjs          # /api/disputa: amigos, grupos, placar, desafios, padrinho
│   ├── functions/notify.mjs           # /api/avisar: pedido de força, força, marcos, recaída
│   ├── functions/delete-account.mjs   # /api/excluir-conta
│   ├── lib/firebase.mjs               # conexão do servidor com o Firebase
│   └── lib/reminder.mjs               # monta o texto do lembrete
├── js/
│   ├── config.js           # firebaseConfig e chave VAPID pública
│   ├── cloud.js            # login, sincronização e inscrição no push
│   ├── social.js           # Disputa
│   ├── core.js · rules.js · art.js · views.js · views2.js · lock.js · main.js · pwa.js
└── icons/
```

## Onde ficam os dados (Firestore)

| Coleção | O que guarda | Quem acessa |
|---|---|---|
| `users/{uid}` | tudo do app da pessoa, como texto JSON | só a própria pessoa |
| `users/{uid}/push/{id}` | aparelhos que recebem o lembrete | só a própria pessoa |
| `stats/{uid}` | resumo do placar (categoria, início, recorde) | a pessoa grava, o servidor lê |
| `profiles`, `codes`, `friendships`, `groups`, `challenges`, `sponsors`, `inbox`, `limits` | Disputa | só o servidor (funções do Netlify) |

Uma cópia fica no aparelho para abrir rápido e funcionar offline.

## Colocar no ar (passo a passo)

Sem configurar nada, o app roda em **modo local**: as contas e os dados ficam só no aparelho e não tem lembrete. Para ter login de verdade e notificação:

### 1. Firebase (plano grátis Spark serve)
1. Em console.firebase.google.com, crie um projeto (o Google Analytics pode ficar desligado).
2. **Authentication > Começar > Sign-in method > E-mail/senha**: ative e salve.
3. **Firestore Database > Criar banco de dados**: local `southamerica-east1 (São Paulo)`, comece em **modo de produção**.
4. Na aba **Regras** do Firestore, apague tudo, cole o conteúdo de `firebase/firestore.rules` e clique em **Publicar**.
5. **Configurações do projeto (engrenagem) > Geral > Seus apps > ícone `</>`**: registre um app da Web (sem Hosting) e copie o objeto `firebaseConfig`.
6. **Configurações do projeto > Contas de serviço > Gerar nova chave privada**: baixa um arquivo JSON. Ele é secreto.
7. **Authentication > Configurações > Domínios autorizados**: adicione o endereço do site (ex.: `livre.netlify.app`).

### 2. Chaves do lembrete (VAPID)
```bash
npx web-push generate-vapid-keys
```

### 3. Preencha `js/config.js`
Cole os campos do `firebaseConfig` e a VAPID pública. Esses valores são públicos. O JSON da conta de serviço e a VAPID privada nunca vão para esse arquivo nem para o GitHub.

### 4. Netlify
As funções precisam de deploy pelo GitHub (ou `netlify deploy`). Arrastar a pasta no Netlify Drop não roda funções.

1. Suba a pasta para um repositório no GitHub e conecte em **Add new site > Import from Git**.
2. Em **Site configuration > Environment variables**, crie (os três primeiros vêm do JSON da conta de serviço):
   - `FIREBASE_PROJECT_ID` (campo `project_id`)
   - `FIREBASE_CLIENT_EMAIL` (campo `client_email`)
   - `FIREBASE_PRIVATE_KEY` (campo `private_key`, inteiro, de `-----BEGIN` até `END PRIVATE KEY-----\n`)
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (ex.: `mailto:seuemail@gmail.com`)
3. Faça o deploy. Os registros de cada função aparecem em **Logs > Functions**.

### iPhone
No iPhone o push só funciona com o app instalado: Safari > Compartilhar > Adicionar à Tela de Início, abrir pelo ícone e ativar o lembrete por lá (iOS 16.4 ou mais novo).

## Rodar localmente

O service worker só funciona em `http://localhost` ou em HTTPS (abrir o arquivo direto não ativa o PWA).

```bash
# na pasta livre/
npx serve .
# ou
python -m http.server 8080
```

## Atualizar uma versão publicada

Mudou algum arquivo? Suba o valor de `VERSION` no `sw.js` (ex.: `livre-v8`). Assim o cache antigo é apagado e todo mundo recebe a versão nova.
