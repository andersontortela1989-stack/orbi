import { TINTAS } from '../brand/paleta3d.js';

/**
 * Layout geométrico do PORTO (centro [-58, 16]) e do FAROL (centro [-64, 42]).
 *
 * Mantém as pegadas históricas [16, 7, 14] e [8, 14, 8] com os mesmos colisores.
 * Contêineres e guindaste ficam ao norte/oeste do armazém (longe da rua em z ≈ 28),
 * e a baía com cais, píer, navio, barcos e pescadores ocupa a faixa sul da ilha
 * do bairro (z ∈ [48.5, 57.5], x ∈ [-81, -41.5]), totalmente visível na câmera 2,5D.
 */

// Contêineres em coordenadas locais ao PORTO [-58, 16]
export const CONTEINERES_PORTO = Object.freeze([
  // Pilha ao norte do armazém (z local ≈ -11.8 → mundo z ≈ 4.2)
  { id: 'c1', x: -4.2, y: 0.9,  z: -11.6, w: 4.4, h: 1.6, l: 2.0, cor: TINTAS.coral },
  { id: 'c2', x:  1.2, y: 0.9,  z: -11.6, w: 4.4, h: 1.6, l: 2.0, cor: TINTAS.sun },
  { id: 'c3', x: -1.6, y: 2.55, z: -11.6, w: 4.4, h: 1.6, l: 2.0, cor: TINTAS.blue },
  // Pilha a oeste do armazém (x local ≈ -13.2 → mundo x ≈ -71.2)
  { id: 'c4', x: -13.4, y: 0.9,  z: -2.2, w: 2.0, h: 1.6, l: 4.4, cor: TINTAS.grass },
  { id: 'c5', x: -13.4, y: 0.9,  z:  3.0, w: 2.0, h: 1.6, l: 4.4, cor: TINTAS.coral },
  { id: 'c6', x: -13.4, y: 2.55, z:  0.4, w: 2.0, h: 1.6, l: 4.4, cor: TINTAS.sun },
]);

export const GUINDASTE_PORTO = Object.freeze({
  x: -13.4,
  z: -9.4,
  altura: 8.6,
  lanca: 7.4,
});

export const PORTO_LAYOUT = Object.freeze({
  size: Object.freeze([16, 7, 14]),
  conteineres: CONTEINERES_PORTO,
  guindaste: GUINDASTE_PORTO,
});

// Baía, cais, píer, navio, barcos e pescadores em coordenadas locais ao FAROL [-64, 42]
// Mundo: x ∈ [-81, -41.5] (local x ∈ [-17, +22.5]), z ∈ [48.5, 57.5] (local z ∈ [6.5, 15.5])
export const BAIA_PORTO = Object.freeze({
  x: 2.8,
  z: 11.4,
  w: 38.8,
  l: 8.2,
  caisZ: 7.1,
  pier: Object.freeze({ x: 8.2, z: 10.2, w: 3.2, l: 6.2 }),
  navio: Object.freeze({ x: -7.8, z: 11.8, w: 11.2, l: 3.2 }),
  barcos: Object.freeze([
    { id: 'b1', x: 15.2, z: 11.6, rot:  0.22, cor: TINTAS.coral },
    { id: 'b2', x:  2.2, z: 13.0, rot: -0.18, cor: TINTAS.sun },
  ]),
  pescadores: Object.freeze([
    { id: 'p1', x: 7.2, z: 12.6, corCamisa: TINTAS.sun,   corChapeu: TINTAS.coral },
    { id: 'p2', x: 9.2, z: 12.8, corCamisa: TINTAS.grass, corChapeu: TINTAS.white },
  ]),
});

export const FAROL_LAYOUT = Object.freeze({
  size: Object.freeze([8, 14, 8]),
  faixas: Object.freeze([
    { y: 1.5, h: 2.4, rTopo: 2.85, rBase: 3.15, cor: TINTAS.coral },
    { y: 3.9, h: 2.4, rTopo: 2.55, rBase: 2.85, cor: TINTAS.white },
    { y: 6.3, h: 2.4, rTopo: 2.25, rBase: 2.55, cor: TINTAS.coral },
    { y: 8.7, h: 2.4, rTopo: 1.95, rBase: 2.25, cor: TINTAS.white },
  ]),
  baia: BAIA_PORTO,
});
