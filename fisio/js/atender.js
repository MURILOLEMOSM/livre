// Guia de atendimento: como se comportar, o que falar, o que evitar, ética, sinais de alerta e evolução SOAP

import { $, esc, copyText, store } from './util.js';

const CHECK_ANTES = [
  'Li a ficha / evolução anterior e sei o objetivo de hoje',
  'Mãos lavadas (ou álcool) antes e depois do contato',
  'Unhas curtas, cabelo preso, sem anéis ou pulseiras que machuquem',
  'Jaleco limpo e crachá visível (estagiário: identificado como estagiário)',
  'Celular no silencioso e longe da maca',
  'Maca com lençol limpo, travesseiro e toalha para cobrir o paciente',
  'Material separado (goniômetro, fita, esfigmomanômetro, oxímetro, faixas elásticas)',
  'Verifiquei se há contraindicações para o recurso que vou usar',
];

const SECTIONS = [
  {
    t: '👋 Primeiro contato',
    html: `
      <ol>
        <li><b>Chame pelo nome</b> que a pessoa prefere ("Como gosta de ser chamado?").</li>
        <li><b>Apresente-se</b>: nome, função e o que vai acontecer. Ex.: <i>"Oi, Dona Maria, eu sou a Ana, estagiária de fisioterapia. Hoje vou conversar com a senhora e fazer alguns testes; vai levar uns 40 minutos."</i></li>
        <li><b>Pergunte o que a pessoa espera</b>: <i>"O que mais está atrapalhando o seu dia a dia? O que gostaria de voltar a fazer?"</i></li>
        <li><b>Combine o toque</b>: explique antes de tocar e peça permissão. <i>"Vou apoiar a mão no seu ombro para ver o movimento, tudo bem?"</i></li>
        <li><b>Olhe nos olhos, sente na altura do paciente</b> durante a conversa e deixe a pessoa terminar de falar.</li>
      </ol>`,
  },
  {
    t: '📝 Roteiro de anamnese',
    html: `
      <ul>
        <li><b>Identificação</b>: idade, profissão/ocupação, lado dominante, com quem mora.</li>
        <li><b>Queixa principal</b> nas palavras do paciente.</li>
        <li><b>HDA</b> (história da doença atual): quando começou, como (trauma ou insidioso), evolução, o que melhora e piora, comportamento em 24 h (manhã, noite, ao longo do dia).</li>
        <li><b>Dor</b>: local (peça para apontar), tipo, irradiação, intensidade 0–10 (agora, melhor e pior momento), formigamento ou dormência.</li>
        <li><b>Rastreio de sinais de alerta</b> (veja a seção 🚩).</li>
        <li><b>HPP</b>: doenças, cirurgias, fraturas, internações, quedas no último ano.</li>
        <li><b>Medicamentos</b> em uso (anticoagulantes, corticoide, anti-hipertensivos, insulina...).</li>
        <li><b>Exames</b> trazidos e diagnóstico médico (se houver).</li>
        <li><b>Hábitos</b>: sono, atividade física, trabalho, fumo, álcool, estresse.</li>
        <li><b>Crenças e medos</b>: <i>"O que você acha que está causando isso?"</i> <i>"Tem algum movimento que tem medo de fazer?"</i></li>
        <li><b>Objetivos</b> do paciente, concretos e mensuráveis (ex.: "subir a escada de casa sem parar").</li>
      </ul>`,
  },
  {
    t: '🩺 Sequência do exame físico',
    html: `
      <ol>
        <li>Sinais vitais (PA, FC, FR, SpO₂ e temperatura quando indicado).</li>
        <li>Inspeção: postura, marcha, edema, cicatrizes, trofismo, cor da pele.</li>
        <li>Palpação: temperatura, pontos dolorosos, tônus.</li>
        <li>ADM ativa, depois passiva (goniometria) — compare com o lado bom.</li>
        <li>Força muscular (escala MRC 0–5) e, se possível, dinamometria.</li>
        <li>Exame neurológico quando indicado: dermátomos, miótomos e reflexos.</li>
        <li>Testes especiais para confirmar ou descartar hipóteses.</li>
        <li>Testes funcionais (sentar-levantar, TUG, caminhada de 6 min, escadas...).</li>
        <li>Questionários validados (ex.: Oswestry, Roland-Morris, DASH, Lysholm, Berg, LEFS).</li>
      </ol>
      <p class="muted">Dica: sempre avalie primeiro o lado não acometido, para o paciente saber o que esperar e você ter referência.</p>`,
  },
  {
    t: '🗣️ O que falar e o que evitar',
    html: `
      <p>O jeito de falar muda a dor e a adesão. Palavras que assustam (efeito nocebo) aumentam medo e evitação de movimento.</p>
      <table>
        <thead><tr><th>Evite</th><th>Prefira</th></tr></thead>
        <tbody>
          <tr><td>"Sua coluna está toda desgastada / degenerada."</td><td>"Essas alterações no exame são comuns em pessoas sem dor da sua idade. A coluna é forte e se adapta."</td></tr>
          <tr><td>"Você tem uma hérnia, nunca mais carregue peso."</td><td>"Vamos voltar a carregar peso aos poucos, do jeito certo, para seu corpo ficar mais forte."</td></tr>
          <tr><td>"Isso não tem cura."</td><td>"Muita gente com esse quadro melhora bastante. Vamos trabalhar para você voltar a fazer o que gosta."</td></tr>
          <tr><td>"Seu joelho é de uma pessoa de 80 anos."</td><td>"Seu joelho precisa de mais força e movimento, e isso dá para treinar."</td></tr>
          <tr><td>"Sua postura está errada, por isso dói."</td><td>"Não existe postura perfeita; o melhor é variar de posição e se mexer."</td></tr>
          <tr><td>"Isso vai doer."</td><td>"Você pode sentir um desconforto. Me avise se passar de 5 de 0 a 10 que a gente ajusta."</td></tr>
          <tr><td>"Pode deixar que eu te curo."</td><td>"Vamos trabalhar juntos; sua parte em casa faz muita diferença."</td></tr>
          <tr><td>Jargão: "Seu supraespinal está com tendinopatia insercional."</td><td>"O tendão do ombro está sensível e precisa de carga certa para se recuperar."</td></tr>
        </tbody>
      </table>
      <h3 style="margin-top:14px">Frases que ajudam</h3>
      <ul>
        <li>"Me conta com suas palavras o que está sentindo."</li>
        <li>"O que você entendeu do que eu expliquei?" (técnica do <i>teach-back</i>).</li>
        <li>"Dor não significa sempre dano. Dá para se mexer com segurança."</li>
        <li>"Que dúvida ficou?" (em vez de "Ficou alguma dúvida?", que costuma ter "não" como resposta).</li>
      </ul>`,
  },
  {
    t: '🧍 Postura e comportamento',
    html: `
      <div class="do-dont">
        <div class="do"><h3>Faça</h3><ul>
          <li>Chegue no horário e avise se for atrasar.</li>
          <li>Explique cada procedimento antes e peça consentimento.</li>
          <li>Cubra com lençol as partes que não estão sendo avaliadas.</li>
          <li>Ofereça acompanhante quando for expor ou tocar regiões íntimas ou sensíveis.</li>
          <li>Anote a evolução no mesmo dia.</li>
          <li>Respeite crenças, cultura, gênero, orientação e limites do paciente.</li>
          <li>Diga "não sei, vou verificar e te respondo" quando não souber.</li>
          <li>Reavalie e mostre a evolução com números (dor, ADM, força, testes).</li>
        </ul></div>
        <div class="dont"><h3>Não faça</h3><ul>
          <li>Mexer no celular durante o atendimento.</li>
          <li>Comentar o caso no corredor, elevador ou grupo de WhatsApp com dados que identifiquem.</li>
          <li>Fotografar ou filmar paciente sem autorização por escrito.</li>
          <li>Falar mal de outro profissional ou do tratamento anterior na frente do paciente.</li>
          <li>Fazer comentários sobre corpo, peso ou aparência que não sejam clínicos.</li>
          <li>Deixar o paciente sozinho com aparelho ligado sem orientação.</li>
          <li>Prometer cura ou prazo garantido.</li>
          <li>Prescrever ou mudar remédios: oriente a falar com o médico.</li>
        </ul></div>
      </div>`,
  },
  {
    t: '⚖️ Ética e limites profissionais',
    html: `
      <div class="notice">Resumo de estudo. Sempre confira o texto oficial do <b>Código de Ética e Deontologia da Fisioterapia (Resolução COFFITO nº 424/2013)</b> e as resoluções atualizadas no site do COFFITO e do seu CREFITO.</div>
      <ul>
        <li><b>Sigilo profissional</b>: guarde segredo do que soube por causa da profissão, salvo exceções previstas em lei (art. 9º, IV). Isso inclui redes sociais e grupos.</li>
        <li><b>Prontuário</b>: registre avaliação, diagnóstico fisioterapêutico, plano e evolução de forma legível; ele é documento do paciente e protege você.</li>
        <li><b>Urgência</b>: não negar assistência em caso de urgência.</li>
        <li><b>Identificação</b>: usar só títulos reconhecidos; não trocar "fisioterapeuta" por expressões genéricas (ex.: "terapeuta holístico").</li>
        <li><b>Publicidade</b>: nada de prometer resultado, usar sensacionalismo ou expor pacientes sem autorização.</li>
        <li><b>Honorários</b>: seguir os referenciais do COFFITO; não aviltar preços nem cobrar por fora quando atende por convênio/SUS.</li>
        <li><b>Autonomia</b>: o fisioterapeuta faz diagnóstico e prescrição fisioterapêuticos; diagnóstico médico e remédios ficam com o médico — trabalhe em equipe e encaminhe quando necessário.</li>
        <li><b>Estágio</b>: estudante só atende sob supervisão de fisioterapeuta docente/preceptor; não assine como profissional.</li>
      </ul>`,
  },
  {
    t: '🚩 Sinais de alerta: pare e encaminhe',
    html: `
      <div class="notice bad"><b>Urgência:</b> dor no peito, falta de ar súbita, sinais de AVC (rosto torto, braço fraco, fala enrolada), desmaio, sangramento importante → interrompa e chame o <b>SAMU 192</b>.</div>
      <h3>Dor lombar / coluna (bandeiras vermelhas)</h3>
      <ul>
        <li>Perda de controle da urina ou das fezes, dormência na região da "sela" (períneo) → <b>síndrome da cauda equina: urgência</b>.</li>
        <li>Fraqueza que piora rápido ou em várias raízes nervosas.</li>
        <li>Histórico de câncer, perda de peso sem explicação, febre, suor noturno.</li>
        <li>Dor constante que não muda com posição ou movimento, pior à noite.</li>
        <li>Trauma importante ou trauma leve em pessoa com osteoporose / uso prolongado de corticoide.</li>
        <li>Imunossupressão, uso de drogas injetáveis, infecção recente.</li>
        <li>Primeiro episódio de dor antes dos 20 ou depois dos 50 anos sem causa clara.</li>
      </ul>
      <h3>Outros</h3>
      <ul>
        <li><b>Trombose venosa profunda</b>: panturrilha inchada, quente, vermelha e dolorida de um lado só (principalmente pós-operatório ou imobilizado).</li>
        <li><b>Coluna cervical</b>: tontura, visão dupla, dificuldade para falar/engolir, queda súbita, dormência no rosto (sinais dos "5 D e 3 N") → não manipular, encaminhar.</li>
        <li><b>Durante o exercício</b>: PA muito alta ou que cai com o esforço, dor no peito, palidez, suor frio, SpO₂ caindo, arritmia → pare.</li>
      </ul>
      <p class="muted">Bandeiras amarelas (medo, catastrofização, depressão, problemas no trabalho) não são urgência, mas mudam o tratamento: aborde com educação em dor e, se preciso, rede de apoio psicológico.</p>`,
  },
  {
    t: '🚦 Semáforo da dor no exercício',
    html: `
      <p>Modelo de monitoramento da dor muito usado em tendinopatias e dor persistente: dá segurança para o paciente se exercitar em casa.</p>
      <table>
        <tbody>
          <tr><td><span class="tag ok">0–2</span></td><td><b>Verde</b>: seguro, pode progredir.</td></tr>
          <tr><td><span class="tag warn">3–5</span></td><td><b>Amarelo</b>: aceitável, se a dor voltar ao normal até a manhã seguinte.</td></tr>
          <tr><td><span class="tag bad">6–10</span></td><td><b>Vermelho</b>: diminua carga, amplitude ou repetições na próxima sessão.</td></tr>
        </tbody>
      </table>`,
  },
  {
    t: '💬 Situações difíceis',
    html: `
      <ul>
        <li><b>"Vou ficar bom?"</b> → Seja honesto e esperançoso: <i>"A maioria das pessoas com esse quadro melhora bastante. Vamos medir sua evolução a cada semana."</i></li>
        <li><b>Paciente não faz os exercícios de casa</b> → Pergunte o que atrapalhou, reduza para 2–3 exercícios, ligue a um hábito (depois de escovar os dentes) e mande a ficha por WhatsApp.</li>
        <li><b>Paciente irritado</b> → Escute sem interromper, valide ("entendo que é frustrante") e foque no que dá para resolver hoje.</li>
        <li><b>Paciente chora</b> → Pause, ofereça um lenço, dê tempo. Não precisa resolver tudo; acolher já ajuda.</li>
        <li><b>Pede diagnóstico ou remédio</b> → <i>"Isso o médico consegue avaliar melhor; vou anotar para você levar na consulta."</i></li>
        <li><b>Comentário ou toque inadequado do paciente</b> → Interrompa com firmeza, registre e comunique o supervisor/coordenação. Você não é obrigado(a) a continuar o atendimento sozinho(a).</li>
        <li><b>Erro seu</b> (ex.: esqueceu algo, causou dor) → Assuma, explique e comunique o supervisor. Transparência gera confiança.</li>
      </ul>`,
  },
  {
    t: '🎓 Para estagiários',
    html: `
      <ul>
        <li>Leve um roteiro de avaliação impresso ou no celular (esta tela!) e revise o caso antes.</li>
        <li>Na dúvida, <b>pare e chame o supervisor</b>. Isso mostra responsabilidade, não fraqueza.</li>
        <li>Monte 2–3 hipóteses antes do exame físico e escolha os testes para confirmá-las.</li>
        <li>Treine a explicação do caso em 1 minuto: quem é, queixa, achados, hipótese, plano.</li>
        <li>Ansiedade é normal: respire, use o checklist e lembre que o paciente quer ser ouvido, não que você saiba tudo.</li>
        <li>Para o OSCE / prova prática: fale em voz alta o que está fazendo, lave as mãos, apresente-se e peça consentimento — muitas avaliações pontuam isso.</li>
      </ul>`,
  },
];

export function renderAtender(root) {
  const done = store.get('checkAntes', []);
  root.innerHTML = `
    <h1>Como atender</h1>
    <p class="muted">Roteiros práticos para antes, durante e depois do atendimento.</p>

    <div class="card">
      <div class="row between"><h3 style="margin:0">✅ Checklist antes de atender</h3><button type="button" class="ghost small" id="resetCheck">Zerar</button></div>
      <div id="checkList" style="margin-top:6px">
        ${CHECK_ANTES.map((c, i) => `<label style="display:flex;gap:10px;font-weight:500;margin:8px 0;align-items:flex-start">
          <input type="checkbox" data-i="${i}" ${done.includes(i) ? 'checked' : ''} style="width:20px;height:20px;flex:none;margin-top:1px" />${esc(c)}</label>`).join('')}
      </div>
    </div>

    ${SECTIONS.map(s => `<details class="acc"><summary>${s.t}</summary><div class="acc-body">${s.html}</div></details>`).join('')}

    <h2>Evolução no formato SOAP</h2>
    <div class="card">
      <label for="sS">S — Subjetivo (o que o paciente relata)</label>
      <textarea id="sS" placeholder="Ex.: Relata dor 4/10 ao subir escada, melhor que na semana passada (6/10). Fez os exercícios 4x."></textarea>
      <label for="sO">O — Objetivo (o que você mediu)</label>
      <textarea id="sO" placeholder="Ex.: Flexão de joelho D 115° (antes 100°). Força quadríceps D 4. TUG 11 s."></textarea>
      <label for="sA">A — Avaliação (sua interpretação)</label>
      <textarea id="sA" placeholder="Ex.: Boa evolução de ADM e dor; ainda déficit de força excêntrica."></textarea>
      <label for="sP">P — Plano</label>
      <textarea id="sP" placeholder="Ex.: Progredir agachamento para step 20 cm; manter exercícios domiciliares; reavaliar em 2 semanas."></textarea>
      <div class="row" style="margin-top:10px">
        <button type="button" id="copySoap">Copiar evolução</button>
        <button type="button" class="ghost" id="clearSoap">Limpar</button>
      </div>
      <p class="muted" style="font-size:.8rem;margin-top:8px">O rascunho fica só neste aparelho. Não coloque nome completo ou documentos do paciente.</p>
    </div>
  `;

  $('#checkList').onchange = e => {
    const i = Number(e.target.dataset.i);
    const cur = new Set(store.get('checkAntes', []));
    e.target.checked ? cur.add(i) : cur.delete(i);
    store.set('checkAntes', [...cur]);
  };
  $('#resetCheck').onclick = () => { store.set('checkAntes', []); renderAtender(root); };

  const ids = ['sS', 'sO', 'sA', 'sP'];
  const draft = store.get('soap', {});
  ids.forEach(id => {
    const el = $('#' + id);
    el.value = draft[id] || '';
    el.oninput = () => { draft[id] = el.value; store.set('soap', draft); };
  });
  $('#copySoap').onclick = () => {
    const d = new Date().toLocaleDateString('pt-BR');
    copyText(`Evolução ${d}\nS: ${$('#sS').value}\nO: ${$('#sO').value}\nA: ${$('#sA').value}\nP: ${$('#sP').value}`);
  };
  $('#clearSoap').onclick = () => { ids.forEach(id => { $('#' + id).value = ''; }); store.set('soap', {}); };
}
