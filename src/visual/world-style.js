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

/** Piso de z-index da interface: `.hud` e `.mission-banner` em styles.css. */
export const ZINDEX_PISO_HUD = 10;

/**
 * Teto de camada dos balões que vivem NO MUNDO (o `<Html>` do drei).
 *
 * REGRA: balão do mundo fica SEMPRE abaixo de qualquer elemento do HUD.
 *
 * Por que precisa de um teto explícito: o drei projeta o z-index pela
 * distância à câmera dentro de um intervalo, e o padrão dele é
 * `[16777271, 0]` — milhões, contra os 10 do HUD. O container do R3F é
 * `position: relative` SEM z-index, então não cria contexto de empilhamento:
 * esse número compete direto com a interface, e o balão cobria o "CHEGAMOS!".
 *
 * Mexeu em algum z-index do HUD para baixo de ZINDEX_PISO_HUD? Este teto
 * desce junto — o teste em tests/world-style.test.js guarda a relação.
 */
export const ZINDEX_BALAO_MUNDO = Object.freeze([ZINDEX_PISO_HUD - 1, 0]);

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
