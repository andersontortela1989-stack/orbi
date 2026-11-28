import { TINTAS } from '../brand/paleta3d.js';

/**
 * Layout geométrico do SHOPPING ampliado (coordenadas locais ao centro [77, -35]).
 *
 * Prédio [24, 8, 16] mantendo a fachada +Z em z = -27 e a borda oeste em x = 65
 * (sem alterar a distância até a estrada nem os sensores). Na ilha expandida
 * ([54..112] × [-50..-14]), acomoda Área Kids aberta (pula-pula, castelinho
 * inflável, piscina de bolinhas e escorregador), praça de alimentação externa
 * e estacionamento de 5 vagas.
 */

export const CLARABOIA = Object.freeze({
  w: 16.4,
  l: 8.6,
  y: 8.26,
  nervurasX: Object.freeze([-5.5, -1.8, 1.8, 5.5]),
  nervurasZ: Object.freeze([-2.1, 2.1]),
});

// Vitrines da fachada frontal (+Z): 4 lojas no térreo + 2 galerias no 2º andar.
export const LOJAS_FRENTE = Object.freeze([
  { id: 'cinema',      x: -8.9, y: 1.75, w: 3.6, h: 1.7, toldo: TINTAS.coral,     vitrine: '#FFE6A8' },
  { id: 'brinquedos',  x: -4.7, y: 1.75, w: 3.4, h: 1.7, toldo: TINTAS.sun,       vitrine: '#FFF2C6' },
  { id: 'sorveteria',  x:  4.7, y: 1.75, w: 3.4, h: 1.7, toldo: TINTAS.blue,      vitrine: '#CFF4FF' },
  { id: 'livraria',    x:  8.9, y: 1.75, w: 3.6, h: 1.7, toldo: TINTAS.grass,     vitrine: '#DDF8D6' },
  { id: 'galeria-esq', x: -7.1, y: 4.8,  w: 7.4, h: 1.55, toldo: TINTAS.coralSoft, vitrine: '#FFF4E0' },
  { id: 'galeria-dir', x:  7.1, y: 4.8,  w: 7.4, h: 1.55, toldo: TINTAS.blueSoft,  vitrine: '#DFF6FF' },
]);

// Vitrines da lateral direita (+X), voltadas para a Área Kids.
export const LOJAS_LATERAL = Object.freeze([
  { id: 'cafe',      z: -4.6, y: 1.75, l: 4.0, h: 1.7, toldo: TINTAS.sun,       vitrine: '#FFECC2' },
  { id: 'doces',     z:  0.0, y: 1.75, l: 3.8, h: 1.7, toldo: TINTAS.coral,     vitrine: '#FFE8DC' },
  { id: 'moda',      z:  4.6, y: 1.75, l: 4.0, h: 1.7, toldo: TINTAS.blue,      vitrine: '#D6F5FF' },
  { id: 'galeria-l', z:  0.0, y: 4.8,  l: 12.6, h: 1.55, toldo: TINTAS.blueSoft, vitrine: '#E2F7FF' },
]);

// Área Kids aberta ao lado direito do Shopping (sem colisores).
// Em mundo (floorPos = [77, -35]): x ∈ [92.0, 101.2], z ∈ [-42.2, -30.8].
export const AREA_KIDS = Object.freeze({
  x: 19.6,
  z: -1.5,
  w: 9.2,
  l: 11.4,
  pulaPula: Object.freeze({ x: -2.0, z: -2.6, raio: 1.85 }),
  castelinho: Object.freeze({ x: 2.0, z: -2.4, w: 3.1, l: 3.1 }),
  piscinaBolinhas: Object.freeze({ x: -1.9, z: 2.5, w: 3.1, l: 2.9 }),
  escorregador: Object.freeze({ x: 2.1, z: 2.6 }),
  bancos: Object.freeze([
    { id: 'bk-1', x: -2.2, z: 5.1 },
    { id: 'bk-2', x:  2.2, z: 5.1 },
  ]),
});

// Estacionamento ampliado na faixa leste (+X) depois da Área Kids.
// Em mundo (floorPos = [77, -35]): x ∈ [103.6, 110.0], z ∈ [-42.5, -29.9].
export const ESTACIONAMENTO_SHOPPING = Object.freeze({
  x: 29.8,
  z: -1.2,
  w: 6.4,
  l: 12.6,
  vagas: 5,
  cancela: Object.freeze({ x: 27.1, z: 6.1 }),
  carros: Object.freeze([
    { vaga: 0, cor: TINTAS.coral },
    { vaga: 1, cor: TINTAS.sun },
    { vaga: 2, cor: TINTAS.grass },
    { vaga: 4, cor: TINTAS.blue },
  ]),
});

// Boulevard frontal + praça de alimentação externa (sem colisores).
export const PRACA_SHOPPING = Object.freeze({
  faixaPedestres: Object.freeze({ x: 0, z: 12.2, w: 4.8, l: 1.9, tiras: 5 }),
  floreiras: Object.freeze([
    { id: 'fl-esq', x: -8.4, z: 9.2 },
    { id: 'fl-dir', x:  8.4, z: 9.2 },
  ]),
  guardaSois: Object.freeze([
    { id: 'mesa-1', x: 16.4, z: 8.4, cor: TINTAS.coral },
    { id: 'mesa-2', x: 19.8, z: 9.2, cor: TINTAS.sun },
    { id: 'mesa-3', x: 23.2, z: 8.4, cor: TINTAS.blue },
  ]),
  totem: Object.freeze({ x: 13.0, z: 10.6 }),
});

export const SHOPPING_LAYOUT = Object.freeze({
  size: Object.freeze([24, 8, 16]),
  claraboia: CLARABOIA,
  lojasFrente: LOJAS_FRENTE,
  lojasLateral: LOJAS_LATERAL,
  areaKids: AREA_KIDS,
  estacionamento: ESTACIONAMENTO_SHOPPING,
  praca: PRACA_SHOPPING,
});
