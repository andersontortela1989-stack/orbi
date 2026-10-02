import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { PALETA3D } from '../src/brand/paleta3d.js';
import { orcamentoDoLugar, recursosDoPao } from '../src/visual/pao-3d.js';

/**
 * ORÇAMENTO DOS PÃES (fatia A2.1) — conta feita com as MESMAS geometrias e
 * materiais que o AderecosLugar.jsx desenha (src/visual/pao-3d.js), sem
 * React nem WebGL. Cada camada é um InstancedMesh: 1 chamada de desenho,
 * com qualquer quantidade de pães.
 */

const PADARIA = TODOS_PREDIOS.find((p) => p.slug === 'PADARIA');

test('orçamento da PADARIA: no máximo 4 chamadas e 2.000 triângulos', () => {
  const { chamadas, triangulos } = orcamentoDoLugar('PADARIA', PADARIA.size);
  assert.ok(chamadas <= 4, `chamadas: ${chamadas}`);
  assert.ok(triangulos <= 2000, `triângulos: ${triangulos}`);
});

test('lugar sem adereço não custa nada', () => {
  const hospital = TODOS_PREDIOS.find((p) => p.slug === 'HOSPITAL');
  assert.deepEqual(orcamentoDoLugar('HOSPITAL', hospital.size), { chamadas: 0, triangulos: 0 });
});

test('materiais: uma instância por papel, compartilhada por todos os pães', () => {
  const { camadas } = recursosDoPao();
  const materiais = new Set(camadas.map((c) => c.material));
  assert.equal(materiais.size, 3); // contorno (base e copa), lateral, casca
  assert.equal(recursosDoPao(), recursosDoPao()); // sempre as mesmas instâncias
});

test('o pão não usa a cor da moeda', () => {
  const moeda = PALETA3D.moeda.toLowerCase();
  for (const cor of Object.values(PALETA3D.pao)) {
    assert.notEqual(cor.toLowerCase(), moeda);
  }
  const { camadas } = recursosDoPao();
  for (const { material } of camadas) {
    assert.notEqual(`#${material.color.getHexString()}`, moeda);
  }
});
