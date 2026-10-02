import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CAMINHOS, LARGURA_RUA, LARGURA_RUA_BORDA, TENSAO_RUA } from '../src/city/ruas.js';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { CALCADA_POR_LADO, PADDING_CHEGADA } from '../src/city/geometria.js';
import { MOEDAS } from '../src/city/moedas.js';

/**
 * V1.3 — o trecho final do caminho 2 (porto → centro → mercado) passava SOB a
 * fachada do MERCADO (dívida 14). Agora termina ENTRE os lotes do MERCADO e da
 * PADARIA, nos dois estilos: eixo reto em z ≈ 31,6 de x ≈ 44 até 58.
 */

const PREDIO = new Map(TODOS_PREDIOS.map((p) => [p.slug, p]));
const eixo = new THREE.CatmullRomCurve3(
  CAMINHOS[1].map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  'catmullrom',
  TENSAO_RUA
).getSpacedPoints(800).map((p) => [p.x, p.z]);

const caixa = ({ pos: [x, z], size: [w, , l] }, extra) => [x - w / 2 - extra, z - l / 2 - extra, x + w / 2 + extra, z + l / 2 + extra];
const dist = ([px, pz], [x0, z0, x1, z1]) => Math.hypot(Math.max(x0 - px, 0, px - x1), Math.max(z0 - pz, 0, pz - z1));
const distEixo = (c) => Math.min(...eixo.map((p) => dist(p, c)));

test('o caminho 2 termina entre o MERCADO e a PADARIA (eixo reto em z ≈ 31,6)', () => {
  const fim = eixo.filter(([x]) => x >= 44);
  assert.ok(fim.length > 0);
  for (const [, z] of fim) assert.ok(z > 31.3 && z < 31.9, `z ${z}`);
  assert.deepEqual(CAMINHOS[1].at(-1), [58, 31.6]);
});

test('nenhum lote do quarteirão fica sob o leito nem sob a borda', () => {
  for (const slug of ['MERCADO', 'PADARIA']) {
    const d = distEixo(caixa(PREDIO.get(slug), CALCADA_POR_LADO));
    assert.ok(d > LARGURA_RUA_BORDA / 2, `${slug}: calçada a ${d.toFixed(2)} do eixo`);
  }
});

test('o leito novo alcança os sensores de chegada do MERCADO e da PADARIA', () => {
  for (const slug of ['MERCADO', 'PADARIA']) {
    const d = distEixo(caixa(PREDIO.get(slug), PADDING_CHEGADA)) - LARGURA_RUA / 2;
    assert.ok(d <= 0, `${slug}: leito a ${d.toFixed(2)} do sensor`);
  }
});

test('nenhuma moeda ficou sobre a rua nova no trecho do mercado', () => {
  for (const [x, z] of MOEDAS.filter(([x]) => x >= 20 && x <= 60)) {
    const d = Math.min(...eixo.map(([rx, rz]) => Math.hypot(rx - x, rz - z)));
    assert.ok(d > LARGURA_RUA_BORDA / 2, `moeda (${x}, ${z}) a ${d.toFixed(2)} do eixo`);
  }
});
