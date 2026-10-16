// Carreira e postura: entrevista técnica, o que falar e o que evitar, code review, estágio, ética e modelos prontos

import { $, $$, esc, copyText, store } from './util.js';

const CHECK_ENTREVISTA = [
  'Pesquisei a empresa: produto, stack e uma notícia recente',
  'Reli a vaga e separei 2–3 experiências que combinam com ela',
  'Tenho 3 histórias no formato STAR (desafio, conflito, erro que cometi)',
  'Sei explicar meu projeto principal em 1 minuto e em 5 minutos',
  'Treinei pelo menos 2 problemas falando em voz alta, com cronômetro',
  'Ambiente pronto: câmera, microfone, internet, editor/IDE e papel',
  'Links abertos: GitHub, portfólio, LinkedIn e currículo em PDF',
  'Tenho 2 perguntas para fazer no final',
];

const SECTIONS = [
  {
    t: '🧩 Durante o problema técnico (live coding)',
    html: `
      <ol>
        <li><b>Repita o problema com suas palavras</b> e confirme a entrada e a saída. <i>"Então recebo um vetor de inteiros, pode ter negativos, e devolvo os índices, certo?"</i></li>
        <li><b>Pergunte os limites</b>: tamanho de n, vetor vazio, repetidos, ordenado ou não, memória.</li>
        <li><b>Faça um exemplo pequeno à mão</b> antes de codar.</li>
        <li><b>Diga a solução força bruta</b> e a complexidade dela. Depois melhore: <i>"Isso é O(n²); com um hash map dá para fazer em O(n)."</i></li>
        <li><b>Combine antes de codar</b>: <i>"Posso seguir com essa abordagem?"</i></li>
        <li><b>Pense em voz alta</b> o tempo todo; silêncio longo deixa o entrevistador sem saber como ajudar.</li>
        <li><b>Teste no final</b> com o exemplo e com casos de borda (vazio, um elemento, tudo igual).</li>
        <li><b>Diga a complexidade final</b> de tempo e de memória.</li>
      </ol>
      <p class="muted">Travou? Diga onde travou: <i>"Estou entre usar uma pilha ou dois ponteiros; deixa eu testar a pilha no exemplo."</i> Pedir uma dica é melhor que ficar parado.</p>`,
  },
  {
    t: '🗣️ O que falar × o que evitar',
    html: `
      <div class="do-dont">
        <div class="do"><h3>✔ Fale</h3><ul>
          <li>"Não sei, mas eu chutaria X porque... e confirmaria lendo a documentação."</li>
          <li>"Eu fiz X; o time fez Y." (deixe claro qual foi a sua parte)</li>
          <li>"O que deu errado foi..., e o que mudei depois foi..."</li>
          <li>"Que trade-off vocês preferem aqui: simplicidade ou desempenho?"</li>
          <li>"Posso fazer uma pergunta para entender melhor?"</li>
          <li>Números concretos: "reduzi o tempo de 8 s para 1,5 s".</li>
          <li>"Usei IA para gerar a base e revisei/testei cada parte" (com honestidade).</li>
        </ul></div>
        <div class="dont"><h3>✘ Evite</h3><ul>
          <li>Inventar que sabe uma tecnologia: perguntam a segunda pergunta e fica pior.</li>
          <li>Falar mal do emprego, professor ou colega anterior.</li>
          <li>"Fiz tudo sozinho" num projeto de equipe.</li>
          <li>"Meu defeito é ser perfeccionista." (resposta decorada)</li>
          <li>Jargão para impressionar sem saber explicar.</li>
          <li>Começar a codar sem entender o enunciado.</li>
          <li>Ler resposta de outra tela ou usar IA escondido: muitas entrevistas desclassificam.</li>
        </ul></div>
      </div>`,
  },
  {
    t: '⭐ Perguntas comportamentais (método STAR)',
    html: `
      <p><b>S</b>ituação → <b>T</b>arefa → <b>A</b>ção (o que <i>você</i> fez, 60% da resposta) → <b>R</b>esultado (com número, se der) + o que aprendeu.</p>
      <ul>
        <li>"Fale de um projeto de que você se orgulha."</li>
        <li>"Conte de um conflito com um colega e como resolveu."</li>
        <li>"Um erro que você cometeu." → mostre que assumiu, corrigiu e criou algo para não repetir.</li>
        <li>"Um prazo que você não ia conseguir cumprir." → avisou cedo, negociou escopo.</li>
        <li>"Algo que você aprendeu sozinho rápido."</li>
      </ul>
      <p class="muted">Tem um modelo para preencher lá embaixo, em "Modelos prontos".</p>`,
  },
  {
    t: '👀 Code review: como dar e receber',
    html: `
      <div class="do-dont">
        <div class="do"><h3>Ao revisar</h3><ul>
          <li>Comente o código, não a pessoa: "esta função" em vez de "você".</li>
          <li>Pergunte em vez de mandar: "E se a lista vier vazia?"</li>
          <li>Separe o que bloqueia do que é sugestão: prefixe com <code>nit:</code> ou "opcional".</li>
          <li>Explique o porquê e, se puder, sugira o código.</li>
          <li>Elogie o que ficou bom — de verdade.</li>
          <li>Revise rápido: PR parado trava o time inteiro.</li>
        </ul></div>
        <div class="dont"><h3>Ao receber</h3><ul>
          <li>Não leve para o pessoal: o objetivo é o código ficar melhor.</li>
          <li>Responda cada comentário (corrigido / por que não).</li>
          <li>Não discorde em 10 mensagens: chame para uma call de 5 min.</li>
          <li>Mande PRs pequenos (até ~400 linhas): são revisados melhor e mais rápido.</li>
          <li>Descreva o PR: o que muda, por que e como testar.</li>
        </ul></div>
      </div>`,
  },
  {
    t: '🧑‍💻 Postura no estágio e no primeiro emprego',
    html: `
      <ul>
        <li><b>Regra dos 30 minutos</b>: tente sozinho, anote o que tentou, e então peça ajuda mostrando isso. Ficar 2 dias travado em silêncio é o erro mais comum de júnior.</li>
        <li><b>Pergunte bem</b>: "Estou tentando X, esperava Y, aconteceu Z, já tentei A e B." (com o log do erro)</li>
        <li><b>Anote tudo</b> que te ensinarem (comandos, acessos, onde fica cada coisa). Perguntar a mesma coisa duas vezes é normal; três, anote.</li>
        <li><b>Na daily</b>: o que fiz, o que vou fazer, o que está me travando. Curto.</li>
        <li><b>Prazo</b>: se não vai dar, avise <i>antes</i> do prazo, com o que falta.</li>
        <li><b>Não mexa em produção</b> sem pedir. Não suba senha, token ou <code>.env</code> para o Git.</li>
        <li><b>Leia o código</b> existente antes de reescrever: ele costuma ter motivos que você ainda não vê.</li>
        <li><b>Mostre o trabalho</b>: demonstre o que fez, escreva no PR e na tarefa. Trabalho invisível não conta.</li>
      </ul>`,
  },
  {
    t: '⚖️ Ética, LGPD e segurança',
    html: `
      <ul>
        <li><b>Dados pessoais</b> (LGPD, Lei 13.709/2018): colete só o necessário, não copie base de produção para o seu computador, não compartilhe prints com dados de clientes.</li>
        <li><b>Senhas</b>: nunca em texto puro; use hash próprio para senha (bcrypt, Argon2). Segredos em variáveis de ambiente/cofre, nunca no repositório.</li>
        <li><b>Código de terceiros</b>: respeite a licença (MIT, GPL...). Copiar do Stack Overflow ou da IA sem entender é risco seu.</li>
        <li><b>Achou uma falha de segurança</b>? Avise o responsável de forma privada. Não explore, não divulgue.</li>
        <li><b>Trabalho acadêmico</b>: copiar código de colega ou entregar resposta pronta da IA como sua é plágio — e o professor nota.</li>
        <li><b>Acessibilidade</b> também é ética: contraste, texto alternativo, teclado.</li>
      </ul>`,
  },
  {
    t: '🧠 Síndrome do impostor e burnout',
    html: `
      <ul>
        <li>Ninguém sabe tudo: a área muda rápido e sênior também pesquisa no Google. Compare-se com você de 6 meses atrás, não com o LinkedIn dos outros.</li>
        <li>Mantenha um <b>"arquivo de vitórias"</b>: bugs que resolveu, elogios, coisas que aprendeu. Releia quando bater a dúvida.</li>
        <li>Reprovar em Cálculo ou Programação I é muito comum (taxas acima de 30% em várias universidades). Procure <b>monitoria</b>, grupo de estudo e o professor no horário de atendimento.</li>
        <li>Durma. Código feito às 3 h da manhã costuma voltar como bug.</li>
        <li>Sinais de alerta: cansaço que não passa com descanso, cinismo com tudo, insônia, crise de ansiedade. Procure ajuda: serviço de apoio psicológico da faculdade, UBS/CAPS ou o <b>CVV (188, ligação gratuita, 24 h)</b>.</li>
      </ul>`,
  },
  {
    t: '📄 Currículo, GitHub e LinkedIn',
    html: `
      <ul>
        <li><b>Currículo de 1 página</b>, em PDF, com links clicáveis. Projetos com o que fizeram e o resultado, não só a lista de tecnologias.</li>
        <li>Use os <b>termos da vaga</b>: muitas empresas filtram por palavra-chave (ATS).</li>
        <li><b>GitHub</b>: fixe 3–6 projetos com README (o que é, print/gif, como rodar, o que aprendeu). Commits com mensagens claras.</li>
        <li>Um projeto completo e publicado vale mais que 10 tutoriais clonados.</li>
        <li><b>LinkedIn</b>: título com o que você é/quer ("Estudante de Ciência da Computação | Back-end Python"), foto clara, "Disponível para estágio".</li>
        <li>Participe de <b>hackathons, maratona de programação (SBC/ICPC), iniciação científica e projetos de extensão</b>: contam como experiência.</li>
      </ul>`,
  },
];

// Modelos para copiar e adaptar
const MODELOS = {
  star: {
    name: 'Resposta STAR',
    fields: [['Situação', 'Onde/quando: "No projeto da disciplina de Engenharia de Software, em grupo de 4..."'], ['Tarefa', 'Qual era o seu papel/desafio'], ['Ação', 'O que VOCÊ fez, passo a passo'], ['Resultado', 'O que aconteceu (com número, se der) e o que aprendeu']],
    out: v => `Situação: ${v[0]}\nTarefa: ${v[1]}\nAção: ${v[2]}\nResultado: ${v[3]}`,
  },
  commit: {
    name: 'Mensagem de commit',
    fields: [['Tipo (feat, fix, docs, refactor, test, chore)', 'feat'], ['Escopo (opcional)', 'login'], ['Resumo no imperativo, até ~50 caracteres', 'adiciona recuperação de senha por e-mail'], ['Corpo: por que a mudança (opcional)', 'Usuários sem acesso ao e-mail antigo ficavam presos...']],
    out: v => `${v[0] || 'feat'}${v[1] ? `(${v[1]})` : ''}: ${v[2]}${v[3] ? `\n\n${v[3]}` : ''}`,
  },
  bug: {
    name: 'Relato de bug',
    fields: [['O que aconteceu', 'Ao salvar o perfil com foto, aparece erro 500'], ['Passos para reproduzir', '1. Entrar\n2. Perfil > trocar foto (PNG de 5 MB)\n3. Salvar'], ['O que era esperado', 'Foto salva e mensagem de sucesso'], ['Ambiente e evidências', 'Chrome 129, Android 14, produção. Log: ...']],
    out: v => `## O que aconteceu\n${v[0]}\n\n## Passos para reproduzir\n${v[1]}\n\n## Esperado\n${v[2]}\n\n## Ambiente / evidências\n${v[3]}`,
  },
  pr: {
    name: 'Descrição de PR',
    fields: [['O que muda', 'Adiciona paginação na listagem de pedidos'], ['Por quê', 'A página travava com mais de 2 mil pedidos'], ['Como testar', '1. Rodar seed\n2. Abrir /pedidos\n3. Navegar entre as páginas'], ['Pontos de atenção', 'Mudei o índice da tabela pedidos']],
    out: v => `## O que muda\n${v[0]}\n\n## Por quê\n${v[1]}\n\n## Como testar\n${v[2]}\n\n## Pontos de atenção\n${v[3]}`,
  },
  ajuda: {
    name: 'Pedido de ajuda',
    fields: [['Estou tentando', 'Conectar a API no banco local'], ['Esperava', 'A rota /users devolver a lista'], ['Mas aconteceu', 'ECONNREFUSED 127.0.0.1:5432'], ['Já tentei', 'Reiniciar o Docker, conferir o .env, rodar psql (funciona)']],
    out: v => `Oi! Estou tentando: ${v[0]}\nEsperava: ${v[1]}\nMas aconteceu: ${v[2]}\nJá tentei: ${v[3]}\nAlguém tem uma ideia de onde olhar?`,
  },
};

let modelo = 'star';

export function renderCarreira(root) {
  const done = store.get('checkEntrevista', []);
  root.innerHTML = `
    <h1>Carreira e postura</h1>
    <p class="muted">Como se comportar em entrevista, no estágio, no code review e no time — o que falar e o que evitar.</p>

    <div class="card">
      <div class="row between"><h3 style="margin:0">✅ Checklist antes da entrevista</h3><button type="button" class="ghost small" id="resetCheck">Zerar</button></div>
      <div id="checkList" style="margin-top:6px">
        ${CHECK_ENTREVISTA.map((c, i) => `<label style="display:flex;gap:10px;font-weight:500;margin:8px 0;align-items:flex-start">
          <input type="checkbox" data-i="${i}" ${done.includes(i) ? 'checked' : ''} style="width:20px;height:20px;flex:none;margin-top:1px" />${esc(c)}</label>`).join('')}
      </div>
    </div>

    ${SECTIONS.map(s => `<details class="acc"><summary>${s.t}</summary><div class="acc-body">${s.html}</div></details>`).join('')}

    <h2>Modelos prontos</h2>
    <div class="chips" id="modelChips">
      ${Object.entries(MODELOS).map(([k, m]) => `<button type="button" class="chip ${k === modelo ? 'on' : ''}" data-m="${k}">${esc(m.name)}</button>`).join('')}
    </div>
    <div class="card" id="modelForm"></div>
  `;

  $('#checkList').onchange = e => {
    const i = Number(e.target.dataset.i);
    const cur = new Set(store.get('checkEntrevista', []));
    e.target.checked ? cur.add(i) : cur.delete(i);
    store.set('checkEntrevista', [...cur]);
  };
  $('#resetCheck').onclick = () => { store.set('checkEntrevista', []); renderCarreira(root); };
  $('#modelChips').onclick = e => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    modelo = b.dataset.m;
    $$('#modelChips .chip').forEach(c => c.classList.toggle('on', c === b));
    drawModel();
  };
  drawModel();
}

function drawModel() {
  const m = MODELOS[modelo];
  const drafts = store.get('modelos', {});
  const vals = drafts[modelo] || [];
  const box = $('#modelForm');
  box.innerHTML = `
    ${m.fields.map(([label, ph], i) => `<label for="m${i}">${esc(label)}</label>
      <textarea id="m${i}" data-i="${i}" placeholder="${esc(ph)}" style="min-height:${i === 0 && modelo === 'commit' ? 44 : 70}px">${esc(vals[i] || '')}</textarea>`).join('')}
    <div class="row" style="margin-top:10px">
      <button type="button" id="copyModel">Copiar</button>
      <button type="button" class="ghost" id="clearModel">Limpar</button>
    </div>`;
  box.oninput = e => {
    const i = e.target.dataset.i;
    if (i == null) return;
    const all = store.get('modelos', {});
    (all[modelo] ||= [])[i] = e.target.value;
    store.set('modelos', all);
  };
  $('#copyModel').onclick = () => {
    const v = m.fields.map((_, i) => $('#m' + i).value.trim());
    copyText(m.out(v));
  };
  $('#clearModel').onclick = () => {
    const all = store.get('modelos', {});
    delete all[modelo];
    store.set('modelos', all);
    drawModel();
  };
}
