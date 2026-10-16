# CAMPUS · Arquitetura do MVP

PWA de estudos para **Medicina** (carro-chefe), **Ciência da Computação**, **Fisioterapia** e **Direito**.
HTML, CSS e JavaScript puros (módulos ES), sem build. Three.js é a única biblioteca externa e só é baixado quando o Atlas 3D abre.

## Como rodar

```bash
# na raiz do repositório
python3 -m http.server 8080
# abra http://localhost:8080/estudos/
```

O service worker exige `localhost` ou HTTPS. No Netlify, o app fica em `/estudos/`.

## Estrutura de arquivos

```
estudos/
├── index.html            # casca: navegação, topo, folha (dialog), sprite de ícones
├── styles.css            # todo o visual (tokens, escuro por padrão, mobile-first)
├── app.js                # estado, rotas e as 5 telas
├── manifest.webmanifest  # instalação na tela inicial
├── sw.js                 # cache offline (app + Three.js)
├── icons/                # SVG + PNG 192/512/maskable/apple
└── js/
    ├── cursos.js         # módulo de cada curso: áreas, palavras-chave, dicas, tópicos, grade sugerida
    ├── perguntas.js      # banco do quiz (área, nível 1–3, opções, explicação)
    ├── acervo.js         # links de acesso aberto por curso
    ├── diagramas.js      # diagramas SVG interativos (Computação e Direito)
    └── atlas3d.js        # atlas anatômico em camadas (Three.js, carregado sob demanda)
```

## Fluxo de telas

```
Primeiro acesso → Escolha do curso (folha travada)
        │
        ▼
┌──────────────── Navegação (barra inferior no celular · lateral no desktop) ────────────────┐
│ Grade        │ Biblioteca     │ Atlas 3D / Diagramas / Fluxos │ Acervo        │ Quiz        │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
Grade ─ estatísticas, dica do dia, disciplinas por semestre
   ├─ + Disciplina (várias por linha) · Enviar arquivo (.txt/.csv/.json) · Grade sugerida
   └─ Disciplina → dicas da área, tópicos que caem, livros ligados, "Treinar no quiz" (#/quiz?area=…)
Biblioteca ─ filtro por disciplina, capas
   ├─ Registrar → foto da capa (câmera), leitura do ISBN pelo código de barras, disciplina
   └─ Livro → gerar roteiro de resumo pelos tópicos da área → editar → salvar
Atlas ─ Medicina/Fisio: modelo 3D com 6 camadas, ficha de cada estrutura, lista acessível
      ─ Computação: arquitetura web e TCP/IP · Direito: procedimento comum do CPC e persecução penal
Acervo ─ busca + filtro por tipo; recursos do curso primeiro, depois os gerais
Quiz ─ nível/XP, escolha da área → 10 perguntas adaptativas → resultado e revisão dos erros
Topo ─ troca de curso (com backup exportar/importar) · tema claro/escuro · instalar
```

## Decisões

| Tema | Decisão |
|---|---|
| Cursos modulares | Cada curso é um objeto em `cursos.js` com a mesma forma. Para criar um quinto curso, basta copiar um bloco e incluir perguntas, acervo e o visual. |
| Disciplina → área | A área é deduzida pelo nome (`areaDaMateria`), com palavras-chave sem acento; a palavra mais longa vence ("Processo Civil" vai para Processo Civil, não para Civil). Sem correspondência, cai em "Geral". |
| Dados | `localStorage` (`campus:v1`), separados por curso. Fotos são reduzidas para 480 px em JPEG antes de salvar. Há backup em JSON. |
| Rotas | Hash (`#/quiz`), que funciona em hospedagem estática e offline. Cada tela recebe um `<main>` novo, e os eventos da anterior somem junto. |
| Quiz adaptativo | A dificuldade começa em 1 (ou em 2 se o acerto geral for ≥ 70%), sobe a cada 2 acertos seguidos e desce a cada erro. As perguntas são sorteadas com peso maior para as áreas com menos acertos. Pontos: 10 × nível + bônus de sequência. Nível = ⌊√(XP/50)⌋ + 1. |
| Atlas 3D | Modelo didático feito com formas do Three.js, com câmera orbital própria (arrastar, pinça, roda) e seleção por raycast. Para trocar por um modelo realista, carregue um `.glb` com GLTFLoader e marque as malhas com `userData.id` igual às chaves de `ESTRUTURAS`. |
| Resumos | Hoje o roteiro é montado a partir dos tópicos e dicas da área, para o aluno completar. O ponto de troca é `gerarResumo()` em `app.js`: substituir por uma Netlify Function que chame um modelo de IA. |
| Segurança | Todo texto do usuário passa por `esc()` antes de entrar no HTML. Não há script inline, o que é compatível com a CSP do `netlify.toml`. |

## Próximos passos sugeridos

1. Buscar título, autor e capa pelo ISBN (Open Library ou Google Books) usando uma Netlify Function, porque a CSP atual bloqueia a chamada direta.
2. Gerar resumos com IA no servidor (a chave fica no servidor).
3. Sincronizar na nuvem (o repositório já usa Firebase).
4. Trocar o modelo didático por um `.glb` anatômico com licença aberta (ex.: BodyParts3D, CC BY-SA).
5. Ampliar o banco do quiz (hoje são 16 a 18 perguntas por curso) e importar perguntas por CSV.
6. Revisão espaçada: reapresentar no quiz as perguntas erradas em 1, 7 e 30 dias.
