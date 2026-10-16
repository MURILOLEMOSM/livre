/* =========================================================
   CAMPUS · Acervo gratuito
   Links para bases abertas, livros de domínio público e
   materiais de acesso livre. "cursos" vazio = vale para todos.
   tipo: base | livro | curso | legislacao | ferramenta
   ========================================================= */

const a = (nome, url, tipo, cursos, desc) => ({ nome, url, tipo, cursos, desc });

export const ACERVO = [
  // Para todos os cursos
  a('Portal de Periódicos CAPES', 'https://www.periodicos.capes.gov.br/', 'base', [], 'Milhares de revistas científicas. Acesso completo pela rede da sua universidade ou login CAFe.'),
  a('SciELO', 'https://www.scielo.br/', 'base', [], 'Biblioteca eletrônica de revistas científicas da América Latina, todas em acesso aberto.'),
  a('Google Acadêmico', 'https://scholar.google.com.br/', 'base', [], 'Busca artigos, teses e livros acadêmicos e mostra quando há versão gratuita.'),
  a('DOAJ', 'https://doaj.org/', 'base', [], 'Diretório de periódicos de acesso aberto revisados por pares.'),
  a('Domínio Público', 'http://www.dominiopublico.gov.br/', 'livro', [], 'Biblioteca digital do governo federal com obras em domínio público.'),
  a('Biblioteca Digital Brasileira de Teses e Dissertações', 'https://bdtd.ibict.br/', 'base', [], 'Teses e dissertações das universidades brasileiras.'),
  a('Open Textbook Library', 'https://open.umn.edu/opentextbooks', 'livro', [], 'Livros didáticos universitários abertos, revisados por professores (em inglês).'),
  a('Internet Archive — Livros', 'https://archive.org/details/texts', 'livro', [], 'Acervo enorme de livros digitalizados, muitos para empréstimo digital.'),

  // Saúde (Medicina e Fisioterapia)
  a('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/', 'base', ['medicina', 'fisioterapia'], 'Principal base de literatura biomédica, mantida pela NLM dos EUA.'),
  a('PubMed Central (PMC)', 'https://www.ncbi.nlm.nih.gov/pmc/', 'base', ['medicina', 'fisioterapia'], 'Artigos biomédicos com texto completo gratuito.'),
  a('BVS — Biblioteca Virtual em Saúde', 'https://bvsalud.org/', 'base', ['medicina', 'fisioterapia'], 'LILACS, MEDLINE e outras bases em saúde, com foco na América Latina.'),
  a('NCBI Bookshelf', 'https://www.ncbi.nlm.nih.gov/books/', 'livro', ['medicina', 'fisioterapia'], 'Livros e referências de medicina e biologia com acesso gratuito (StatPearls e outros).'),
  a('OpenStax — Anatomy and Physiology', 'https://openstax.org/details/books/anatomy-and-physiology-2e', 'livro', ['medicina', 'fisioterapia'], 'Livro completo de anatomia e fisiologia, gratuito e revisado.'),
  a('Radiopaedia', 'https://radiopaedia.org/', 'base', ['medicina', 'fisioterapia'], 'Casos e artigos de radiologia com imagens comentadas.'),
  a('Protocolos e diretrizes do Ministério da Saúde (PCDT)', 'https://www.gov.br/saude/pt-br/assuntos/pcdt', 'base', ['medicina'], 'Protocolos Clínicos e Diretrizes Terapêuticas do SUS.'),
  a('Biblioteca Cochrane', 'https://www.cochranelibrary.com/', 'base', ['medicina', 'fisioterapia'], 'Revisões sistemáticas de alta qualidade; resumos gratuitos.'),
  a('PEDro', 'https://pedro.org.au/portuguese/', 'base', ['fisioterapia'], 'Base de evidências em fisioterapia, com ensaios clínicos avaliados por qualidade.'),
  a('Physiopedia', 'https://www.physio-pedia.com/', 'base', ['fisioterapia'], 'Enciclopédia colaborativa de fisioterapia (em inglês).'),

  // Ciência da Computação
  a('arXiv — Computer Science', 'https://arxiv.org/archive/cs', 'base', ['computacao'], 'Pré-publicações de pesquisa em computação, todas abertas.'),
  a('MIT OpenCourseWare — EECS', 'https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science', 'curso', ['computacao'], 'Aulas, provas e notas dos cursos de computação do MIT.'),
  a('Pro Git (em português)', 'https://git-scm.com/book/pt-br/v2', 'livro', ['computacao'], 'O livro oficial do Git, completo e gratuito.'),
  a('SICP — JavaScript Edition', 'https://sourceacademy.org/sicpjs/', 'livro', ['computacao'], 'O clássico Structure and Interpretation of Computer Programs, em versão aberta com JavaScript.'),
  a('Think Python', 'https://greenteapress.com/wp/think-python-2e/', 'livro', ['computacao'], 'Introdução à programação com Python, livre para leitura.'),
  a('Operating Systems: Three Easy Pieces', 'https://pages.cs.wisc.edu/~remzi/OSTEP/', 'livro', ['computacao'], 'Livro de sistemas operacionais gratuito e muito usado em universidades.'),
  a('VisuAlgo', 'https://visualgo.net/pt', 'ferramenta', ['computacao'], 'Animações de estruturas de dados e algoritmos passo a passo.'),
  a('freeCodeCamp', 'https://www.freecodecamp.org/portuguese/', 'curso', ['computacao'], 'Cursos práticos gratuitos de programação e desenvolvimento web.'),
  a('MDN Web Docs', 'https://developer.mozilla.org/pt-BR/', 'base', ['computacao'], 'Documentação de referência de HTML, CSS, JavaScript e APIs web.'),

  // Direito
  a('Planalto — Legislação', 'https://www.planalto.gov.br/ccivil_03/', 'legislacao', ['direito'], 'Texto oficial e atualizado da Constituição, códigos e leis federais.'),
  a('Constituição Federal de 1988', 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm', 'legislacao', ['direito'], 'Texto compilado da CF/88 com todas as emendas.'),
  a('LexML Brasil', 'https://www.lexml.gov.br/', 'legislacao', ['direito'], 'Busca unificada de legislação, jurisprudência e doutrina.'),
  a('Jurisprudência do STF', 'https://jurisprudencia.stf.jus.br/', 'base', ['direito'], 'Pesquisa de acórdãos, súmulas e informativos do Supremo Tribunal Federal.'),
  a('Jurisprudência do STJ', 'https://scon.stj.jus.br/SCON/', 'base', ['direito'], 'Pesquisa de julgados e súmulas do Superior Tribunal de Justiça.'),
  a('Biblioteca Digital do Senado Federal', 'https://www2.senado.leg.br/bdsf/', 'livro', ['direito'], 'Livros, artigos e obras raras de Direito e ciência política.'),
  a('Biblioteca Digital da Câmara dos Deputados', 'https://bd.camara.leg.br/', 'livro', ['direito'], 'Publicações jurídicas e legislativas de acesso livre.'),
];

export const TIPOS_ACERVO = {
  base: 'Bases e artigos',
  livro: 'Livros',
  curso: 'Cursos',
  legislacao: 'Legislação',
  ferramenta: 'Ferramentas',
};
