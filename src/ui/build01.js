export function deveExigirLandscape(fase, retrato) {
  return fase === 'jogo' && retrato;
}

export function estadoCombustivelHud(combustivel, limiarBaixo) {
  const percentual = Math.max(0, Math.min(100, combustivel));
  const nivel = combustivel <= 0
    ? 'critico'
    : combustivel <= limiarBaixo
      ? 'baixo'
      : 'saudavel';

  return {
    visivel: nivel !== 'saudavel',
    nivel,
    percentual,
  };
}

export const CONTROLES_TOUCH_BUILD_01 = [
  {
    code: 'ArrowLeft',
    zona: 'esq',
    classe: 'tc-steer tc-steer--left',
    ico: '◀',
    rotulo: '',
    ariaLabel: 'virar à esquerda',
  },
  {
    code: 'ArrowRight',
    zona: 'esq',
    classe: 'tc-steer tc-steer--right',
    ico: '▶',
    rotulo: '',
    ariaLabel: 'virar à direita',
  },
  {
    code: 'ArrowDown',
    zona: 'dir',
    classe: 'tc-re',
    ico: '▼',
    rotulo: 'RÉ',
    ariaLabel: 'ré',
  },
  {
    code: 'ArrowUp',
    zona: 'dir',
    classe: 'tc-go',
    ico: '▲',
    rotulo: 'IR',
    ariaLabel: 'ir',
  },
];
