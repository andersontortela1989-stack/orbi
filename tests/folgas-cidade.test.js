import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { GARAGEM_POS, GARAGEM_SIZE } from '../src/city/garagem.js';
import { MOEDAS } from '../src/city/moedas.js';
import { BICHOS } from '../src/city/bichos.js';
import { POSTO_POS, POSTO_SIZE } from '../src/city/posto.js';
import {
  CALCADA_POR_LADO,
  PADDING_CHEGADA,
  PADDING_ZONA,
  GRAMADO_PARQUE_RAIO as GRAMADO_RAIO,
  GRAMADO_PARQUE_ESCALA as GRAMADO_ESCALA,
} from '../src/city/geometria.js';
import {
  CARONA_ESPERA_POS as CAO_POS,
  CARONA_EMBARQUE_SIZE as EMBARQUE_SIZE,
  CARONA_EMBARQUE_PADDING as EMBARQUE_PADDING,
  CARONA_ENTREGA_POS as ENTREGA_POS,
  CARONA_ENTREGA_SIZE as ENTREGA_SIZE,
} from '../src/city/carona.js';

/**
 * FOLGAS DA CIDADE (fatia A1.1) — mede folgas e sobreposições entre os
 * elementos fixos da cidade. Não corrige nada: a correção é a A1.2.
 *
 * GEOMETRIA EM AABB (retângulo alinhado aos eixos). Nenhum lote tem rotação:
 * City.jsx passa só floorPos e size ao Building e ao OpenPark, e GasStation e
 * Garagem também não passam rotação. Isto é INFERÊNCIA a partir das props, não
 * medição em execução.
 *
 * DISTÂNCIA COM SINAL: positiva = folga entre os dois; negativa = sobreposição
 * (profundidade no eixo de menor invasão). Déficit = distância − folga exigida.
 */

// Folga mínima entre CALÇADAS, em unidades de mundo — as mesmas de
// src/city/bairros.js (o carro mede 3,5 × 1,8). Por que 4:
//   - o sensor de chegada ultrapassa a calçada em 1,3 (3,5 − 2,2) e a zona de
//     serviço em 1,8 (4 − 2,2); com calçadas a ≥ 4, nenhum par de sensores
//     de prédio se sobrepõe (1,3 + 1,3, 1,3 + 1,8 e 1,8 + 1,8 são todos < 4);
//   - 4 é maior que o comprimento do carro (3,5): sempre cabe um carro entre
//     duas calçadas.
const FOLGA_MINIMA = 4;

// Pares que podem se tocar de propósito. Qualquer exceção nova precisa de
// aprovação do Anderson antes de entrar aqui.
const EXCECOES = [
  { a: 'ENTREGA', b: 'PARQUE', motivo: 'a carona entrega o cão no parque' },
];

// ===================================================================
//  Geometria
// ===================================================================

/** Retângulo alinhado aos eixos: centro [x, z] e meias-medidas hx, hz. */
const caixa = (nome, lugar, [x, z], hx, hz) => ({ nome, lugar, x, z, hx, hz });

/** Distância com sinal entre dois retângulos (negativa = sobreposição). */
function distanciaCaixas(a, b) {
  const gx = Math.abs(a.x - b.x) - (a.hx + b.hx);
  const gz = Math.abs(a.z - b.z) - (a.hz + b.hz);
  if (gx > 0 && gz > 0) return Math.hypot(gx, gz);
  return Math.max(gx, gz);
}

/** Distância com sinal de um ponto a um retângulo (negativa = dentro). */
function distanciaPontoCaixa([px, pz], c) {
  const gx = Math.abs(px - c.x) - c.hx;
  const gz = Math.abs(pz - c.z) - c.hz;
  if (gx > 0 && gz > 0) return Math.hypot(gx, gz);
  return Math.max(gx, gz);
}

const excecao = (lugarA, lugarB) =>
  EXCECOES.some(
    ({ a, b }) => (a === lugarA && b === lugarB) || (a === lugarB && b === lugarA)
  );

const num = (v) => v.toFixed(2).replace('.', ',');

function linha(a, b, distancia, exigida) {
  return (
    `${a} ↔ ${b}: distância ${num(distancia)} u · ` +
    `déficit ${num(distancia - exigida)} u (folga exigida ${num(exigida)} u)`
  );
}

function semViolacoes(violacoes, oque) {
  if (violacoes.length === 0) return;
  assert.fail(`${violacoes.length} ${oque}:\n  ${violacoes.join('\n  ')}`);
}

// ===================================================================
//  Elementos da cidade
// ===================================================================

const PREDIOS_COM_BUILDING = TODOS_PREDIOS.filter((p) => p.slug !== 'PARQUE');
const PARQUE = TODOS_PREDIOS.find((p) => p.slug === 'PARQUE');

const calcada = (slug, pos, [w, , l]) =>
  caixa(`calçada ${slug}`, slug, pos, w / 2 + CALCADA_POR_LADO, l / 2 + CALCADA_POR_LADO);

/** Lotes com colisor: a calçada de todo prédio desenhado pelo Building. */
const LOTES_COM_COLISOR = [
  ...PREDIOS_COM_BUILDING.map((p) => calcada(p.slug, p.pos, p.size)),
  calcada('POSTO', POSTO_POS, POSTO_SIZE),
  calcada('GARAGEM', GARAGEM_POS, GARAGEM_SIZE),
];

// AABB da elipse: superestima nos cantos (conservador — acusa antes da hora,
// nunca deixa passar uma invasão real do gramado).
const GRAMADO_PARQUE = caixa(
  'gramado PARQUE',
  'PARQUE',
  PARQUE.pos,
  GRAMADO_RAIO * GRAMADO_ESCALA[0],
  GRAMADO_RAIO * GRAMADO_ESCALA[1]
);

/** Lotes visuais: calçadas + gramado do PARQUE (que não tem colisor). */
const LOTES_VISUAIS = [...LOTES_COM_COLISOR, GRAMADO_PARQUE];

const sensor = (nome, lugar, pos, [w, , l], padding) =>
  caixa(nome, lugar, pos, w / 2 + padding, l / 2 + padding);

const SENSORES = [
  ...TODOS_PREDIOS.map((p) =>
    sensor(`sensor de chegada ${p.slug}`, p.slug, p.pos, p.size, PADDING_CHEGADA)
  ),
  sensor('zona POSTO', 'POSTO', POSTO_POS, POSTO_SIZE, PADDING_ZONA),
  sensor('zona GARAGEM', 'GARAGEM', GARAGEM_POS, GARAGEM_SIZE, PADDING_ZONA),
  sensor('zona de embarque da carona', 'EMBARQUE', CAO_POS, EMBARQUE_SIZE, EMBARQUE_PADDING),
  sensor('zona de entrega da carona', 'ENTREGA', ENTREGA_POS, ENTREGA_SIZE, PADDING_ZONA),
];

// ===================================================================
//  Testes
// ===================================================================

// Testes que falham hoje: TODO até a correção da A1.2b. Continuam rodando e
// imprimindo cada violação, mas não derrubam o `npm test`.
const FALHA_HOJE = { todo: 'A1.2b' };

test('geometria: distância com sinal entre retângulos e de ponto a retângulo', () => {
  const a = caixa('a', 'A', [0, 0], 1, 1);
  assert.equal(distanciaCaixas(a, caixa('b', 'B', [5, 0], 1, 1)), 3);
  assert.equal(distanciaCaixas(a, caixa('b', 'B', [1.5, 0], 1, 1)), -0.5);
  assert.equal(distanciaCaixas(a, caixa('b', 'B', [5, 6], 1, 1)), 5); // 3-4-5
  assert.equal(distanciaPontoCaixa([0.5, 0], a), -0.5);
  assert.equal(distanciaPontoCaixa([4, 5], a), 5);
});

test('inventário carregado: nada medido no vazio', () => {
  assert.equal(PREDIOS_COM_BUILDING.length, 10);
  assert.equal(LOTES_VISUAIS.length, 13);
  assert.equal(SENSORES.length, 15);
  assert.equal(MOEDAS.length, 30);
  assert.equal(BICHOS.length, 5);
  assert.ok(PARQUE, 'PARQUE existe em bairros.js');
});

test('(a) lotes visuais: nenhum par a menos de FOLGA_MINIMA', FALHA_HOJE, () => {
  const violacoes = [];
  for (let i = 0; i < LOTES_VISUAIS.length; i += 1) {
    for (let j = i + 1; j < LOTES_VISUAIS.length; j += 1) {
      const a = LOTES_VISUAIS[i];
      const b = LOTES_VISUAIS[j];
      const d = distanciaCaixas(a, b);
      if (d < FOLGA_MINIMA) violacoes.push(linha(a.nome, b.nome, d, FOLGA_MINIMA));
    }
  }
  semViolacoes(violacoes, 'par(es) de lotes abaixo da folga');
});

test('(b) sensores: nenhum invade o sensor de outro lugar', FALHA_HOJE, () => {
  const violacoes = [];
  for (let i = 0; i < SENSORES.length; i += 1) {
    for (let j = i + 1; j < SENSORES.length; j += 1) {
      const a = SENSORES[i];
      const b = SENSORES[j];
      if (a.lugar === b.lugar || excecao(a.lugar, b.lugar)) continue;
      const d = distanciaCaixas(a, b);
      if (d < 0) violacoes.push(linha(a.nome, b.nome, d, 0));
    }
  }
  semViolacoes(violacoes, 'sobreposição(ões) entre sensores');
});

test('(b) sensores: nenhum invade o lote de outro lugar', FALHA_HOJE, () => {
  const violacoes = [];
  for (const s of SENSORES) {
    for (const lote of LOTES_VISUAIS) {
      if (s.lugar === lote.lugar || excecao(s.lugar, lote.lugar)) continue;
      const d = distanciaCaixas(s, lote);
      if (d < 0) violacoes.push(linha(s.nome, lote.nome, d, 0));
    }
  }
  semViolacoes(violacoes, 'invasão(ões) de sensor em lote');
});

// Critério: o CENTRO da moeda fica fora da calçada. O raio de coleta não entra
// porque a calçada não tem colisor — o colisor do prédio é só w × l
// (Building.jsx:237). O círculo de coleta pode alcançar a calçada sem que o
// carro encoste no prédio. Isto é INFERÊNCIA a partir do código, não teste
// dirigindo.
test('(c) centro das moedas fora dos lotes com colisor', () => {
  const violacoes = [];
  MOEDAS.forEach((pos, i) => {
    for (const lote of LOTES_COM_COLISOR) {
      const d = distanciaPontoCaixa(pos, lote);
      if (d < 0) violacoes.push(linha(`moeda ${i} [${pos.join(', ')}]`, lote.nome, d, 0));
    }
  });
  semViolacoes(violacoes, 'moeda(s) com o centro dentro de lote');
});

test('(c) bichos e o cão da carona fora dos lotes com colisor', () => {
  const pontos = [
    ...BICHOS.map((b) => ({ nome: `${b.slug} [${b.pos.join(', ')}]`, pos: b.pos })),
    { nome: `cão da carona [${CAO_POS.join(', ')}]`, pos: CAO_POS },
  ];
  const violacoes = [];
  for (const { nome, pos } of pontos) {
    for (const lote of LOTES_COM_COLISOR) {
      const d = distanciaPontoCaixa(pos, lote);
      if (d < 0) violacoes.push(linha(nome, lote.nome, d, 0));
    }
  }
  semViolacoes(violacoes, 'bicho(s) dentro de lote');
});
