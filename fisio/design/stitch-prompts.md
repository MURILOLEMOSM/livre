# FisioPalma no Google Stitch

Prompts prontos para gerar o layout do app no [Stitch](https://stitch.withgoogle.com).

**Como usar**
1. Abra o Stitch, escolha **Mobile** e cole o **Prompt base** primeiro.
2. Depois peça cada tela com o prompt dela, no mesmo projeto, para manter o estilo.
3. Se quiser que o Stitch siga o app atual, anexe a imagem correspondente da pasta `referencias/` junto com o prompt.
4. Quando terminar, exporte o código ou mande para o Figma pelo botão do Stitch.

---

## Prompt base (cole primeiro)

```
Design a mobile app called "FisioPalma" for physiotherapy students and physiotherapists in Brazil. All UI text in Brazilian Portuguese.

Style: warm, calm and professional, like a well-kept paper notebook in a modern clinic. Not generic, not purple gradients.
Colors: background #F6F2EA (warm paper), cards #FFFFFF with 1px border #E3DDD1 and soft shadow, text #1C2526, secondary text #5F6B6C, brand teal #0F5257, accent coral #E07A5F, success #2E7D4F, warning #B7791F, danger #C0392B. Bookshelf wood #8B5E3C.
Typography: headings in Fraunces (serif, bold); body and buttons in Inter.
Shapes: 14px card radius, 10px button radius, pill chips. Touch targets at least 44px.
Navigation: fixed bottom tab bar with 5 tabs and icons: "Estante", "Atender", "Estudar", "Ferramentas", "Clínica". Top bar with the logo "Fisio" (dark) + "Palma" (teal).
Also provide a dark mode version: background #111718, cards #1A2223, teal #4FB3A9.
```

---

## 1. Estante (prateleira de livros)

```
Screen "Minha estante". Title "Minha estante", subtitle "12 livros na estante", primary button "+ Adicionar livro".
Search field "Buscar por título, autor, editora ou área". Horizontal filter chips: Todos, Lendo, Quero ler, Lidos, Com PDF, Anatomia, Ortopedia, Neurofuncional.
Main element: a realistic wooden bookshelf (wood frame #8B5E3C, light back panel) with 2–3 shelves. Books stand upright showing their covers (2:3 ratio), slight 3D spine shadow, lifting a little on tap. Some covers are photos, others are colored covers with the title in serif. Small badges on covers: "PDF" or "✓ lido", and a thin coral reading-progress bar at the bottom of the cover. Book title in small text under each book.
Below: secondary buttons "Fazer backup" and "Restaurar backup".
Example books: "Anatomia Orientada para a Clínica – Moore", "Cinesiologia Clínica de Brunnstrom", "Fisioterapia Neurofuncional", "Testes Ortopédicos", "Netter Atlas de Anatomia".
```

## 2. Adicionar livro (bottom sheet)

```
Bottom sheet "Novo livro" over the shelf. Cover preview on the left (2:3 empty placeholder) with three stacked buttons: "📷 Tirar foto da capa" (primary), "🖼️ Escolher da galeria", "▥ Foto do código de barras".
Fields: ISBN with button "Buscar"; Título* with search icon button; Autor(es); two-column grid Editora / Edição / Ano / Nº de páginas; selects Área and Situação (Quero ler, Lendo, Lido); "Link do PDF"; file input "ou arquivo PDF do aparelho"; "Anotações". Full-width button "Salvar na estante".
```

## 3. Detalhe do livro

```
Bottom sheet with the book cover on the left, author in bold, publisher · edition · year, ISBN, tags "Neurofuncional" and "Lendo". A slider "Página atual: 120 de 300 (40%)". Notes section. Buttons: "📄 Abrir PDF", "Editar", "Remover" (red outline).
```

## 4. Atender (guia de atendimento)

```
Screen "Como atender", subtitle "Roteiros práticos para antes, durante e depois do atendimento."
Card "✅ Checklist antes de atender" with 8 checkboxes (mãos lavadas, crachá visível, celular no silencioso...).
Accordion list: "👋 Primeiro contato", "📝 Roteiro de anamnese", "🩺 Sequência do exame físico", "🗣️ O que falar e o que evitar", "🧍 Postura e comportamento", "⚖️ Ética e limites profissionais", "🚩 Sinais de alerta: pare e encaminhe", "🚦 Semáforo da dor no exercício", "💬 Situações difíceis", "🎓 Para estagiários".
Show "O que falar e o que evitar" expanded as a two-column comparison: red column "Evite" ("Sua coluna está toda desgastada.") vs green column "Prefira" ("Essas alterações são comuns em pessoas sem dor. A coluna é forte e se adapta.").
At the bottom, a SOAP note card with four text areas S, O, A, P and buttons "Copiar evolução" and "Limpar".
```

## 5. Estudar (cartões)

```
Screen "Estudar e decorar". Deck chips: "Mnemônicos (9)", "Dermátomos e miótomos (18)", "Inervação muscular (16)", "Testes especiais (19)", "Meus cartões".
A row of 5 small boxes showing spaced-repetition progress: "Novos/errados 9", "Caixa 2 0", "Caixa 3 0", "Caixa 4 0", "Dominados 0".
Large flashcard in the center: question in serif "Ossos do carpo (proximal → distal)", dashed divider, answer "Era Sábado, Paulo Pediu: Traz Teu Carro Hoje". Three buttons below: "Errei" (red), "Quase" (soft teal), "Acertei" (teal). Caption "9 para revisar agora". Buttons "+ Criar cartão" and "Recomeçar este baralho". Tips card "Dicas para decorar de verdade".
```

## 6. Ferramentas

```
Screen "Ferramentas". Accordions: "😣 Escala de dor (EVA 0–10)" expanded showing 11 square buttons 0–10 colored from green to red and the result "4/10 · Moderada"; "⚖️ IMC"; "❤️ Frequência cardíaca alvo"; "📏 Inclinômetro com o celular" showing a big "37°" with buttons "Ativar sensor" and "Zerar"; "📐 ADM de referência"; "💪 Força muscular (MRC)"; "🧠 Escala de Glasgow".
Section "Testes especiais" with region chips (Ombro, Joelho, Coluna, Quadril, Tornozelo e pé, Punho e mão) and cards: title "Lachman", "Como:" text, "Positivo:" text.
```

## 7. Clínica · Agenda

```
Screen "Clínica" with sub-navigation chips: "📅 Agenda" (selected), "👥 Pacientes", "🏋️ Exercícios", "💰 Financeiro", "🔭 Apps", "⚙️ Ajustes".
Month header "outubro de 2026" with ‹ › buttons. A 7-day week strip (DOM 11 … SÁB 17) with today selected in teal and coral dots for appointments.
Line "qui., 15/10 · 4 atendimentos · R$ 480,00" with buttons "Hoje" and "+ Agendar".
Appointment cards: bold time "09:00" in teal + patient name "Carlos Souza", "Presencial · 50 min · R$ 120,00", status pill "Agendada"/"Confirmada"/"Realizada"/"Faltou"; actions "Confirmar no WhatsApp", status dropdown, "Ficha", "Editar". One teleconsultation card with primary button "🎥 Entrar na sala".
```

## 8. Clínica · Ficha do paciente

```
Patient record screen. Header card: "Carlos Souza", "42 anos · Particular · Pós-op LCA", buttons "WhatsApp", "Agendar", "+ Evolução", "+ Programa de exercícios".
Three stat tiles: "12 sessões feitas", "1 falta", "R$ 240,00 a receber" (red).
Accordion "📝 Avaliação inicial". Section "Evoluções" with SOAP cards (date "qui., 15/10", S: "Dor 5/10 ao agachar", O: "Flexão do joelho 110°").
Section "Atendimentos" with a compact table (Data, Situação, Valor) and buttons "Registrar pagamento", "Gerar recibo".
Section "Exercícios para casa" with a program card showing "6 exercícios · 1× ao dia, Seg a Sex" and an adherence pill "80% adesão (7 dias)".
Footer buttons "🖨️ Imprimir prontuário" and "Excluir paciente" (red outline).
```

## 9. Clínica · Financeiro

```
Screen with month selector "Outubro de 2026". 2×2 stat cards: "Recebido R$ 3.840,00" (green), "A receber R$ 360,00" (amber), "Despesas R$ 800,00" (red), "Saldo R$ 3.040,00".
Caption "32 sessões realizadas no mês · 2 faltas". Buttons "+ Receita avulsa", "+ Despesa", "⬇ Planilha do mês".
"Pendentes" list with patient name, date, value and a "Recebi" button. "Lançamentos do mês" table with date, description, payment method and green/red values.
```

## 10. Exercícios (montar programa)

```
Bottom sheet "Novo programa". Fields: Paciente, WhatsApp do paciente; weekday toggle pills Dom Seg Ter Qua Qui Sex Sáb; "Vezes por dia"; select "Começar de um modelo" (Dor lombar, Joelho, Ombro, Pós-operatório, Equilíbrio no idoso, Dor cervical).
List "Exercícios do programa": each item with name, short description, dose input ("3 × 12") and "Link do seu vídeo (opcional)", with ↑ and ✕ buttons.
Search "Adicionar da biblioteca (31 exercícios)" with region chips and a list with "+" buttons. Buttons: "Salvar e enviar link" (primary), "Só salvar", "Copiar como texto", "Ver como paciente".
```

## 11. App do paciente (abre pelo link)

```
Separate simple screen for the patient (older adults too: big text, high contrast). Top "Meus exercícios". Greeting "Olá, Maria! 👋", "Programa de Dra. Ana · CREFITO-3".
Status card: "Hoje é dia de exercício", pill "80% na semana", progress bar "2 de 6 exercícios", and a 14-day streak strip (green = done, light red = missed, grey = rest day).
Exercise cards: "1. Ponte" with dose pill "3 × 12", plain-language description, three large round series buttons (1, 2, 3 → filled green with ✓ when done), buttons "⏱️ 30 s" and "▶ Ver como fazer". Completed cards get a light green background.
Card "Como foi a sessão?": pain scale 0–10 colored buttons, difficulty chips "Fácil / No ponto / Difícil", comment box, button "Salvar sessão".
Buttons "📤 Enviar relatório ao fisio", "📅 Lembrete na agenda", "🖨️ Imprimir". Red notice with warning signs and "SAMU 192".
```

## 12. Relatório que volta para o fisio

```
Bottom sheet "Evolução · Maria" with pill "2 sessões novas importadas". Three stat tiles: "80% adesão 7 dias", "65% adesão 30 dias", "6,0 → 3,0 dor (início → agora)". Bar chart "Dor por sessão" (bars colored green→red by value). Table "Sessões" with Data, Feitos, Dor, Comentário.
```
