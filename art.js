/* =========================================================
   LIVRE · desenhos em SVG
   A árvore cresce em 6 estágios conforme a sequência limpa
   (ou conforme o progresso de uma sessão de foco).
   ========================================================= */

const ART = {
  gold: '#F5C518',
  deep: '#B8930F',
  dim: '#6E5A12',
  ground: '#2E2E2E',
  dead: '#4A4A4A',
  deadDeep: '#333333',
};

/**
 * @param {number} stage 0 a 5
 * @param {{dead?: boolean, label?: string}} opts
 */
function treeSVG(stage, opts = {}) {
  const c = opts.dead
    ? { a: ART.dead, b: ART.deadDeep, c: '#2a2a2a' }
    : { a: ART.gold, b: ART.deep, c: ART.dim };
  const label = esc(opts.label || STAGES[stage]?.name || 'Árvore');
  const ground = `<path d="M14 86h72" stroke="${ART.ground}" stroke-width="3" stroke-linecap="round"/>`;
  const trunk = (top, w = 4) => `<rect x="${50 - w / 2}" y="${top}" width="${w}" height="${86 - top}" rx="${w / 2}" fill="${c.b}"/>`;
  const leaf = (x, y, rot, rx = 7, ry = 3.6, fill = c.a) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${fill}"/>`;

  let body = '';
  switch (stage) {
    case 0: // Semente
      body = `<ellipse cx="50" cy="84" rx="7" ry="4.5" fill="${c.b}"/>
              <path d="M50 80q1-5 4-7" stroke="${c.a}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      break;
    case 1: // Broto
      body = `${trunk(68, 3)}${leaf(43, 67, -28)}${leaf(57, 64, 28)}`;
      break;
    case 2: // Muda
      body = `${trunk(54, 3.4)}${leaf(42, 72, -22, 8, 3.6, c.b)}${leaf(58, 70, 22, 8, 3.6, c.b)}
              ${leaf(42, 58, -30)}${leaf(58, 55, 30)}${leaf(50, 49, 90, 6, 3.4)}`;
      break;
    case 3: // Arbusto
      body = `${trunk(60, 5)}<circle cx="38" cy="58" r="13" fill="${c.b}"/><circle cx="62" cy="58" r="13" fill="${c.b}"/>
              <circle cx="50" cy="48" r="17" fill="${c.a}"/><circle cx="40" cy="60" r="9" fill="${c.a}"/><circle cx="60" cy="60" r="9" fill="${c.a}"/>`;
      break;
    case 4: // Árvore
      body = `${trunk(56, 6)}<path d="M50 14 74 50H26z" fill="${c.c}"/><path d="M50 26 79 64H21z" fill="${c.b}"/>
              <path d="M50 10 70 40H30z" fill="${c.a}"/><path d="M50 30 72 58H28z" fill="${c.a}" opacity=".9"/>`;
      break;
    default: // Árvore dourada (90+ dias)
      body = `<circle cx="50" cy="44" r="40" fill="${c.a}" opacity="${opts.dead ? 0 : .08}"/>
              ${trunk(56, 7)}<path d="M50 10 76 48H24z" fill="${c.b}"/><path d="M50 24 82 66H18z" fill="${c.b}"/>
              <path d="M50 6 72 38H28z" fill="${c.a}"/><path d="M50 22 76 56H24z" fill="${c.a}"/>
              <circle cx="40" cy="44" r="2.6" fill="#0D0D0D"/><circle cx="60" cy="50" r="2.6" fill="#0D0D0D"/><circle cx="52" cy="34" r="2.4" fill="#0D0D0D"/>
              <path d="M84 16v8M80 20h8M16 30v6M13 33h6" stroke="${c.a}" stroke-width="2" stroke-linecap="round"/>`;
  }

  if (opts.dead && stage > 0) {
    body += `${leaf(30, 84, 10, 5, 2.4, ART.dead)}${leaf(70, 85, -12, 5, 2.4, ART.dead)}`;
  }
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${label}">${ground}${body}</svg>`;
}

/** Anel de progresso. pct de 0 a 100. */
function ringSVG(pct, { stroke = 8, track = '#262626', color = ART.gold } = {}) {
  const r = 50 - stroke / 2 - 1;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
      pathLength="100" stroke-dasharray="${clamp(pct, 0, 100)} 100" data-ring/>
  </svg>`;
}
