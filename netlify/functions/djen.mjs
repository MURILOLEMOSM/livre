/* =========================================================
   TOGA · intimações no Diário de Justiça Eletrônico Nacional
   (GET /api/djen?oab=123456&uf=SP&de=2026-10-01&ate=2026-10-16)
   Ponte para a API pública do Comunica PJe (CNJ), que não aceita
   chamada direta do navegador. Também aceita ?processo=<20 dígitos>.
   ========================================================= */

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SE SP TO'.split(' ');
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const isoDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : '';
const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] != null && o[k] !== '') return o[k]; return ''; };

export default async req => {
  const q = new URL(req.url).searchParams;
  const oab = (q.get('oab') || '').replace(/\D/g, '');       // só dígitos: sufixos fazem a busca falhar
  const uf = (q.get('uf') || '').toUpperCase();
  const processo = (q.get('processo') || '').replace(/\D/g, '');
  const de = isoDate(q.get('de'));
  const ate = isoDate(q.get('ate'));

  if (!processo && !(oab && UFS.includes(uf))) return json({ error: 'Informe o número da OAB e a UF, ou o número do processo.' }, 400);
  if (processo && processo.length !== 20) return json({ error: 'Número de processo inválido.' }, 400);

  const params = new URLSearchParams({ itensPorPagina: '100', pagina: '1' });
  if (processo) params.set('numeroProcesso', processo);
  else { params.set('numeroOab', oab); params.set('ufOab', uf); }
  if (de) params.set('dataDisponibilizacaoInicio', de);
  if (ate) params.set('dataDisponibilizacaoFim', ate);

  try {
    const res = await fetch(`https://comunicaapi.pje.jus.br/api/v1/comunicacao?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 429) return json({ error: 'O CNJ limitou as consultas. Espere 1 minuto e tente de novo.' }, 429);
    if (!res.ok) return json({ error: `O Comunica PJe respondeu com erro (${res.status}).` }, 502);

    const body = await res.json();
    const raw = body.items || body.data || body.content || [];
    const itens = raw.map(c => ({
      data: pick(c, 'data_disponibilizacao', 'dataDisponibilizacao', 'datadisponibilizacao'),
      tribunal: pick(c, 'siglaTribunal', 'sigla_tribunal'),
      tipo: pick(c, 'tipoComunicacao', 'tipo_comunicacao'),
      documento: pick(c, 'tipoDocumento', 'tipo_documento'),
      orgao: pick(c, 'nomeOrgao', 'nome_orgao'),
      classe: pick(c, 'nomeClasse', 'nome_classe'),
      processo: pick(c, 'numeroprocessocommascara', 'numero_processo', 'numeroProcesso'),
      texto: String(pick(c, 'texto') || '').slice(0, 20000),
      link: pick(c, 'link'),
    }));
    return json({ total: body.count ?? itens.length, itens, consultadoEm: new Date().toISOString() });
  } catch (e) {
    console.error('[TOGA] DJEN:', e);
    return json({ error: 'Não deu para falar com o Comunica PJe agora. Tente de novo em alguns minutos.' }, 504);
  }
};

export const config = { path: '/api/djen' };
