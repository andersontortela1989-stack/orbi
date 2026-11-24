/**
 * SÍTIO (expansão Sítio — Fatia 1) — dados puros do espaço aberto rural
 * (porteira, pasto dos cavalos e rio com peixinhos).
 *
 * Coordenadas locais ao centro do lugar SÍTIO em bairros.js ([-70, -34]).
 * Sem React, sem Three.js e sem colisores invisíveis: o carro entra pela
 * porteira, visita o pasto e o rio e volta livremente para a estrada.
 */

// Meia-extensão da área visual principal (para folgas-cidade.test.js)
export const SITIO_AREA_MEIAS = Object.freeze({ hx: 17, hz: 12 });

// Porteira de entrada na frente (+Z), voltada para a estrada e a câmera
export const PORTEIRA_SITIO = Object.freeze({
  z: 9.2,
  vaoLivre: 6.4,
});

// Pasto dos cavalos (metade oeste)
export const PASTO_SITIO = Object.freeze({
  centro: Object.freeze([-7.6, -1.6]),
  tamanho: Object.freeze([14.4, 12.4]),
});

// 3 cavalos estáticos no pasto (sem colisor, sem animação)
export const CAVALOS_SITIO = Object.freeze([
  Object.freeze({ id: 'cavalo-1', pos: Object.freeze([-10.8, -4.2]), heading: 0.55, pelagem: 'cavaloMarrom' }),
  Object.freeze({ id: 'cavalo-2', pos: Object.freeze([-5.4, -3.4]),  heading: -0.95, pelagem: 'cavaloCreme' }),
  Object.freeze({ id: 'cavalo-3', pos: Object.freeze([-8.2, 1.4]),   heading: 2.35, pelagem: 'cavaloCanela' }),
]);

// Rio calmo (metade leste)
export const RIO_SITIO = Object.freeze({
  centro: Object.freeze([8.6, -1.4]),
  tamanho: Object.freeze([9.4, 13.6]),
});

// 3 peixinhos no rio (no Modo Tranquilo ficam parados na posição base)
export const PEIXES_SITIO = Object.freeze([
  Object.freeze({ id: 'peixe-1', pos: Object.freeze([7.4, -4.6]), fase: 0.0, amplitude: 0.9 }),
  Object.freeze({ id: 'peixe-2', pos: Object.freeze([9.8, -0.8]), fase: 2.1, amplitude: 1.0 }),
  Object.freeze({ id: 'peixe-3', pos: Object.freeze([8.0, 2.8]),  fase: 4.2, amplitude: 0.8 }),
]);