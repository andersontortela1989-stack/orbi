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

  // MERCADO (V1.3): fachada branco-gelo (≈1,9 contra a areia e ≈3,6 contra a
  // terracota da PADARIA), faixa verde de mercado, toldo azul liso.
  brancoGelo: '#eef1f4',
  rodapeCinza: '#9aa3ad',
  verdeMercado: '#2e8b57',
  painelClaro: '#fff8e1',
  toldoAzul: '#2f6db5',
  portaAberta: '#2b2f38',
  portaEnrolar: '#b8bec6',
  nervura: '#8f969f',
  bancaBase: '#2e6b4a',
  caixote: '#a9784e',
  // frutas: a COR diz qual é (pergunta das cores na chegada do MERCADO);
  // a banana fica longe do âmbar da moeda
  laranja: '#f28c28',
  maca: '#d7263d',
  banana: '#f2d53c',
  uva: '#6b2d8f',
  folha: '#3f9e52',

  // rua e mobiliário (V1.3)
  poste: '#7d8590',
  luminaria: '#fff1d0',
  tronco: '#7a5230',
  copa: '#3f9e52',
  copaClara: '#5bbe6e',
  canteiro: '#7d6650',
  lixeira: '#2f7d4f',
  lixeiraTampa: '#25603c',
});
