# FisioPalma · fisioterapia na palma da mão

App web (PWA) para **estudantes e fisioterapeutas**. Funciona offline, pode ser instalado no celular e guarda tudo no próprio aparelho (sem login).

## O que tem

| Aba | Para quê |
|---|---|
| **📚 Estante** | Prateleira digital com os livros "em pé". Adicione tirando foto da capa, lendo o código de barras (ISBN), buscando pelo título ou digitando título, autor, editora, edição e ano. Guarde o link do PDF ou o próprio arquivo, marque a página em que parou e filtre por área (ortopedia, neuro, cardiorrespiratória...). Backup e restauração em um arquivo. |
| **🤝 Atender** | Checklist antes do atendimento, primeiro contato, roteiro de anamnese, sequência do exame físico, **o que falar × o que evitar** (linguagem sem efeito nocebo), postura e comportamento, ética (COFFITO 424/2013), **sinais de alerta para parar e encaminhar**, semáforo da dor, situações difíceis, dicas para estágio e OSCE e um modelo de evolução **SOAP** para copiar. |
| **🧠 Estudar** | Cartões com repetição espaçada (caixas de Leitner): mnemônicos, dermátomos e miótomos, inervação muscular, lesões clássicas e testes especiais. Dá para criar os próprios cartões. |
| **📐 Ferramentas** | Escala de dor 0–10, IMC, FC alvo (Karvonen/Tanaka), inclinômetro com o sensor do celular, ADM de referência, MRC, Ashworth modificada, Borg CR10, Glasgow, sinais vitais e testes especiais por região (como fazer e o que significa positivo). |
| **🏠 Casa** | Montador de **ficha de exercícios domiciliares** com 22 exercícios prontos (dose editável), enviada pelo WhatsApp ou copiada. **Radar de apps** de prescrição (Physitrack/PhysiApp, MedBridge, Wibbi, HEP2go, Rehab My Patient, SimpleSet) e de gestão no Brasil (Fisioly, Vedius, ZenFisio), com a sua avaliação de cada um e a opção de adicionar outros. |

## Por que essas funções (pesquisa)

- Estudantes relatam **ansiedade no estágio e no OSCE**, pouca experiência prévia em setores como UTI e excesso de foco em "entregar avaliação" → roteiros, checklist e cartões de revisão.
- Fisioterapeutas usam no dia a dia **goniometria por app, testes especiais e escalas**, normalmente espalhados em vários apps → tudo em uma aba só.
- Os apps de exercício domiciliar mais citados são pagos e quase todos em inglês; muita gente acaba mandando exercícios por WhatsApp → ficha pronta em português que vai direto para o WhatsApp.
- Livros técnicos são caros e ficam espalhados entre físicos, PDFs e bibliotecas virtuais → estante única com o link/arquivo de cada um.

## Rodar no computador

Qualquer servidor estático serve, por exemplo:

```bash
cd fisio
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar

No Netlify, crie um **site novo** apontando para este repositório com *Base directory* = `fisio`. O `fisio/netlify.toml` libera a câmera, os sensores de movimento e as buscas de livros (Google Books e Open Library).

## Estrutura

```
fisio/
├── index.html · manifest.webmanifest · sw.js · netlify.toml
├── css/app.css
├── icons/
└── js/
    ├── app.js          # rotas das abas, offline e instalação
    ├── util.js · db.js # utilidades e IndexedDB (livros, capas e PDFs)
    ├── estante.js      # estante, foto, ISBN, PDF, backup
    ├── atender.js      # guia de atendimento e SOAP
    ├── estudar.js      # cartões e mnemônicos
    ├── ferramentas.js  # escalas, calculadoras, testes, inclinômetro
    └── casa.js         # fichas de exercícios e radar de apps
```

## Aviso

Conteúdo de apoio ao estudo e à prática. Não substitui a supervisão, o julgamento clínico nem o texto oficial das resoluções do COFFITO/CREFITO.
