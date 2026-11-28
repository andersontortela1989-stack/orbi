import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BAIRROS } from '../src/city/bairros.js';
import {
  AREA_KIDS,
  CLARABOIA,
  ESTACIONAMENTO_SHOPPING,
  LOJAS_FRENTE,
  LOJAS_LATERAL,
  PRACA_SHOPPING,
  SHOPPING_LAYOUT,
} from '../src/city/shopping.js';

const bairroShopping = BAIRROS.find((b) => b.slug === 'SHOPPING');
const predioShopping = bairroShopping.predios.find((p) => p.slug === 'SHOPPING');

test('Shopping aberto: prédio ampliado [24, 8, 16] comporta claraboia e vitrines', () => {
  const [w, h, l] = predioShopping.size;
  assert.deepEqual(SHOPPING_LAYOUT.size, predioShopping.size);
  assert.equal(w, 24);
  assert.equal(l, 16);
  assert.ok(CLARABOIA.w < w && CLARABOIA.l < l, 'claraboia cabe no teto');
  assert.ok(CLARABOIA.y >= h, 'claraboia fica no topo do prédio');

  assert.equal(LOJAS_FRENTE.length, 6);
  for (const loja of LOJAS_FRENTE) {
    assert.ok(Math.abs(loja.x) + loja.w / 2 < w / 2, `vitrine ${loja.id} dentro de X`);
    assert.ok(loja.y + loja.h / 2 < h, `vitrine ${loja.id} dentro da altura`);
  }

  assert.equal(LOJAS_LATERAL.length, 4);
  for (const loja of LOJAS_LATERAL) {
    assert.ok(Math.abs(loja.z) + loja.l / 2 < l / 2, `vitrine ${loja.id} dentro de Z`);
  }
});

test('Shopping aberto: Área Kids e estacionamento cabem na ilha sem sobreposição nem invasão da estrada', () => {
  const [px, pz] = predioShopping.pos;
  const [pw] = predioShopping.size;
  const [cx, cz] = bairroShopping.chao.centro;
  const [cw, cl] = bairroShopping.chao.tamanho;

  const kidsMinX = px + AREA_KIDS.x - AREA_KIDS.w / 2;
  const kidsMaxX = px + AREA_KIDS.x + AREA_KIDS.w / 2;
  const kidsMinZ = pz + AREA_KIDS.z - AREA_KIDS.l / 2;
  const kidsMaxZ = pz + AREA_KIDS.z + AREA_KIDS.l / 2;

  const estMinX = px + ESTACIONAMENTO_SHOPPING.x - ESTACIONAMENTO_SHOPPING.w / 2;
  const estMaxX = px + ESTACIONAMENTO_SHOPPING.x + ESTACIONAMENTO_SHOPPING.w / 2;
  const estMinZ = pz + ESTACIONAMENTO_SHOPPING.z - ESTACIONAMENTO_SHOPPING.l / 2;
  const estMaxZ = pz + ESTACIONAMENTO_SHOPPING.z + ESTACIONAMENTO_SHOPPING.l / 2;

  assert.ok(kidsMinX >= px + pw / 2 + 2.0, 'Área Kids fora do prédio e calçada');
  assert.ok(kidsMaxX + 1.5 <= estMinX, 'Área Kids separada do estacionamento');
  assert.ok(kidsMinZ >= cz - cl / 2 + 1.0 && kidsMaxZ <= -26, 'Área Kids dentro da ilha e longe da estrada');

  assert.ok(estMaxX <= cx + cw / 2 - 0.5, 'estacionamento dentro da borda leste');
  assert.ok(estMinZ >= cz - cl / 2 + 1.0 && estMaxZ <= -25, 'estacionamento longe da estrada');
  assert.ok(ESTACIONAMENTO_SHOPPING.vagas >= 5 && ESTACIONAMENTO_SHOPPING.carros.length >= 4);
  assert.ok(AREA_KIDS.pulaPula.raio > 1 && AREA_KIDS.castelinho.w > 2 && AREA_KIDS.piscinaBolinhas.w > 2);
});

test('Shopping aberto: praça externa e totem cabem na ilha mantendo a frente livre', () => {
  const [px, pz] = predioShopping.pos;
  const [cx, cz] = bairroShopping.chao.centro;
  const [cw] = bairroShopping.chao.tamanho;

  for (const g of PRACA_SHOPPING.guardaSois) {
    const wx = px + g.x;
    const wz = pz + g.z;
    assert.ok(wx <= cx + cw / 2 - 1.5, `guarda-sol ${g.id} dentro da borda leste`);
    assert.ok(wz <= -22, `guarda-sol ${g.id} longe da estrada`);
  }

  const tx = px + PRACA_SHOPPING.totem.x;
  const tz = pz + PRACA_SHOPPING.totem.z;
  assert.ok(tx > px + 12 && tz <= -22, 'totem fora da fachada e longe da estrada');
  assert.ok(PRACA_SHOPPING.faixaPedestres.z > 9 && PRACA_SHOPPING.faixaPedestres.z < 15);
});

test('City.jsx: monta OpenShopping para SHOPPING preservando colisor no componente', () => {
  const citySrc = fs.readFileSync('src/components/City.jsx', 'utf8');
  const shoppingSrc = fs.readFileSync('src/components/OpenShopping.jsx', 'utf8');
  assert.ok(citySrc.includes("import { OpenShopping } from './OpenShopping.jsx'"));
  assert.ok(citySrc.includes('<OpenShopping'));
  assert.ok(shoppingSrc.includes('<CuboidCollider args={[w / 2, h / 2, l / 2]} />'));
  assert.ok(shoppingSrc.includes('AreaKids'));
});
