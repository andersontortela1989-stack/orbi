/**
 * ÓRBI 2,5D — contrato visual puro do mundo.
 *
 * Câmera, profundidade e dosagem sensorial moram aqui para que a evolução
 * visual não vire uma coleção de números mágicos espalhados pelos componentes.
 */
export const CAMERA_2_5D = Object.freeze({
  // Diagonal deliberada: revela duas fachadas e o volume dos telhados sem
  // perder a leitura tática do mapa nem girar junto com o carro.
  offset: Object.freeze([28, 34, 30]),
  alvoY: 0.45,
  lerp: 4.6,
});

export const LINGUAGEM_MUNDO = Object.freeze({
  versao: 'orbi-cidade-magica-2.5d',
  contorno: 0.2,
  brilhoJanela: 0.85,
  brilhoJanelaTranquilo: 0.18,
  velocidadeAmbiente: 0.55,
});

/** Resolve a quantidade de estímulo sem conhecer React ou Zustand. */
export function perfilVisual(preferencias = {}) {
  const tranquilo = preferencias.modoTranquilo === true;
  const animacoes = preferencias.animacoes !== false && !tranquilo;
  const detalhes = preferencias.detalhesVisuais !== false && !tranquilo;
  return Object.freeze({
    tranquilo,
    animacoes,
    detalhes,
    particulas: detalhes && animacoes,
    brilhoJanela: tranquilo
      ? LINGUAGEM_MUNDO.brilhoJanelaTranquilo
      : LINGUAGEM_MUNDO.brilhoJanela,
    velocidadeAmbiente: animacoes ? LINGUAGEM_MUNDO.velocidadeAmbiente : 0,
  });
}
