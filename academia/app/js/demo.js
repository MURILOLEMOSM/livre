// Boneco animado que demonstra cada tipo de movimento (substitui vídeos externos)
// Cada articulação é um grupo SVG; o CSS (.m-<movimento>) anima as rotações.
export function figura(mov = 'agacha', { peso = true } = {}) {
  const halter = peso && ['empurra', 'acima', 'rosca', 'puxa', 'avanco'].includes(mov)
    ? '<rect class="peso" x="52" y="84" width="16" height="7" rx="3"/>' : '';
  return `<svg class="fig m-${mov}" viewBox="0 0 120 160" role="img" aria-label="Demonstração do movimento">
    <line class="chao" x1="10" y1="143" x2="110" y2="143"/>
    <g class="corpo">
      <g class="coxa2 tras"><line x1="60" y1="80" x2="60" y2="110"/><g class="canela2"><line x1="60" y1="110" x2="60" y2="140"/><line x1="60" y1="140" x2="68" y2="140"/></g></g>
      <g class="tronco">
        <line x1="60" y1="80" x2="60" y2="38"/>
        <circle class="cabeca" cx="60" cy="24" r="10"/>
        <g class="braco"><line x1="60" y1="40" x2="60" y2="64"/><g class="ante"><line x1="60" y1="64" x2="60" y2="86"/>${halter}</g></g>
      </g>
      <g class="coxa"><line x1="60" y1="80" x2="60" y2="110"/><g class="canela"><line x1="60" y1="110" x2="60" y2="140"/><line x1="60" y1="140" x2="68" y2="140"/></g></g>
    </g>
  </svg>`;
}
