/**
 * FLORES DO PARQUE — a consequência permanente da aventura do parque.
 * Dados puros; FloresParque.jsx desenha.
 *
 * Antes do `parque_florido`, oito botões pequenos no canteiro do parque. Com a
 * flag, as flores crescem UMA vez, quando o resumo da aventura fecha (como os
 * brotos da ESCOLA, H2): o resumo cobre o mundo, e crescer atrás dele era
 * crescer sem ninguém ver. Com a flag vinda do save, já aparecem prontas.
 */
// Cada flor crescida fica inteira no gramado verde, fora da trilha e dos
// caminhos, com folga mínima de 0,5 (tests/flores-parque-gramado.test.js).
// A 7ª saiu de (−10, 81), que encostava na borda do gramado.
export const POSICOES_FLORES = Object.freeze([
  [-21, 66], [-17, 64], [-11, 64], [-7, 67],
  [-21, 78], [-17, 80], [-9, 79.5], [-6, 77],
]);

/** Tamanho do botão antes de florescer. */
export const ESCALA_BOTAO = 0.28;

/**
 * Crescem agora? Com a flag ligada, esperam a aventura que acabou de ligá-la
 * (resumo aberto). Com a flag do save, ou depois de crescer, ficam crescidas.
 */
export function floresCrescem({ florida, floridaAoAbrir, jaCresceram, aventuraAtiva }) {
  return !!florida && (!!floridaAoAbrir || !!jaCresceram || !aventuraAtiva);
}

/** Escala ao montar: prontas com a flag do save; botões sem ela. */
export function escalaInicialDasFlores(florida) {
  return florida ? 1 : ESCALA_BOTAO;
}
