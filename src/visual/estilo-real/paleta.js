import { PALETA3D } from '../../brand/paleta3d.js';

/**
 * Paleta do ESTILO REAL, tirada das fotos de padaria de bairro: faixa de
 * letreiro escura com painel creme, marquise escura com friso claro, piso
 * tátil cinza.
 *
 * V1.2b (revisão de 02/10): a V1 sumia no terreno (bege sobre areia, sem
 * contorno). Agora: reboco TERRACOTA (contraste ≈1,9 com a areia do bairro;
 * a outra proposta era azul-acinzentado #6f93ae, ≈1,5), calçada cinza-clara
 * como a da cidade, toldo verde-garrafa liso, vitrine acesa bem clara e
 * contorno fino escuro (não preto). A regra "cores menos saturadas" da V1 foi
 * revogada.
 *
 * Fica fora de brand/paleta3d.js de propósito: aquele arquivo entra no pacote
 * inicial (via bairros.js e store); este só no pacote do jogo, e só é usado
 * com `?estilo=real`.
 */
export const PALETA_REAL = Object.freeze({
  reboco: '#c0644a',
  rebocoSombra: '#9c4c37',
  laje: '#b9b2a6',
  pingadeira: '#f2e6cf',
  faixaEscura: '#252b3b',
  painelCreme: '#f6e3b4',
  friso: '#f2e6cf',
  toldo: '#1f6b4f',
  vidroEscuro: '#2f3b4f',
  vidroPorta: '#3b4a60',
  vitrineLuz: '#fff1d0',
  caixilho: '#3a3f4c',
  grade: '#2a2e37',
  ar: '#d4d8dc',
  arGrade: '#8e949c',
  balcao: '#7b5b40',
  calcada: PALETA3D.calcada.toLowerCase(),
  pisoTatil: '#9fa3aa',
  meioFio: '#c4bfcf',
  contorno: '#3a3550',
});
