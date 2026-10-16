/* =========================================================
   TOGA · consulta processual (POST /api/datajud)
   Ponte para a API Pública do DataJud (CNJ), que é gratuita
   mas não aceita chamada direta do navegador.
   Recebe { numero } e devolve os dados e os andamentos do processo.
   A chave pública do CNJ pode mudar: se mudar, defina
   DATAJUD_API_KEY no Netlify com a chave nova da wiki do DataJud.
   ========================================================= */

const PUBLIC_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const UF = ['ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'se', 'sp', 'to'];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

/* Número único (Res. CNJ 65/2008): NNNNNNN-DD.AAAA.J.TR.OOOO */
export function checkCnj(digits) {
  if (!/^\d{20}$/.test(digits)) return false;
  const n = digits.slice(0, 7), dd = digits.slice(7, 9), rest = digits.slice(9);
  const r = BigInt(n + rest + '00') % 97n;
  return String(98n - r).padStart(2, '0') === dd;
}

export function tribunalAlias(digits) {
  const j = digits[13], tr = Number(digits.slice(14, 16));
  if (j === '1') return 'stf';
  if (j === '3') return 'stj';
  if (j === '4') return tr >= 1 && tr <= 6 ? `trf${tr}` : null;
  if (j === '5') return tr === 0 ? 'tst' : tr <= 24 ? `trt${tr}` : null;
  if (j === '6') return tr === 0 ? 'tse' : UF[tr - 1] ? `tre-${UF[tr - 1]}` : null;
  if (j === '7') return 'stm';
  if (j === '8') return UF[tr - 1] ? (UF[tr - 1] === 'df' ? 'tjdft' : `tj${UF[tr - 1]}`) : null;
  if (j === '9') return ({ 13: 'tjmmg', 21: 'tjmrs', 26: 'tjmsp' })[tr] || null;
  return null;
}

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  let numero = '';
  try { numero = String((await req.json()).numero || '').replace(/\D/g, ''); } catch { /* corpo inválido */ }
  if (!checkCnj(numero)) return json({ error: 'Número de processo inválido. Confira os 20 dígitos.' }, 400);

  const alias = tribunalAlias(numero);
  if (!alias) return json({ error: 'Tribunal não reconhecido pelo número.' }, 400);
  if (alias === 'stf') return json({ error: 'O STF não está na API pública do DataJud. Consulte no portal do STF.', alias }, 404);

  try {
    const res = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${alias}/_search`, {
      method: 'POST',
      headers: {
        Authorization: `APIKey ${process.env.DATAJUD_API_KEY || PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ size: 10, query: { match: { numeroProcesso: numero } } }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 401 || res.status === 403) {
      return json({ error: 'O CNJ trocou a chave pública do DataJud. O responsável pelo app precisa atualizá-la.', alias }, 502);
    }
    if (!res.ok) return json({ error: `O DataJud respondeu com erro (${res.status}). Tente mais tarde.`, alias }, 502);

    const hits = (await res.json())?.hits?.hits || [];
    // um registro por grau (1º grau, 2º grau, turma recursal...)
    const graus = hits.map(h => h._source || {}).map(s => ({
      grau: s.grau || '',
      classe: s.classe?.nome || '',
      orgao: s.orgaoJulgador?.nome || '',
      sistema: s.sistema?.nome || '',
      ajuizamento: s.dataAjuizamento || '',
      atualizadoNaFonte: s.dataHoraUltimaAtualizacao || '',
      sigilo: s.nivelSigilo || 0,
      assuntos: (s.assuntos || []).flat().map(a => a?.nome).filter(Boolean),
      movimentos: (s.movimentos || [])
        .map(m => ({
          data: m.dataHora || '',
          nome: m.nome || '',
          detalhe: (m.complementosTabelados || []).map(c => c.nome || c.descricao).filter(Boolean).join(', '),
        }))
        .sort((a, b) => b.data.localeCompare(a.data)),
    }));

    return json({ numero, alias, graus, consultadoEm: new Date().toISOString() });
  } catch (e) {
    console.error('[TOGA] DataJud:', e);
    return json({ error: 'Não deu para falar com o DataJud agora. Tente de novo em alguns minutos.', alias }, 504);
  }
};

export const config = { path: '/api/datajud' };
