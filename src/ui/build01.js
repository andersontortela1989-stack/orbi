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
