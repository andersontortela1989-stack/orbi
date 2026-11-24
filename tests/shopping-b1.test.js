import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BAIRROS, TODOS_PREDIOS } from '../src/city/bairros.js';
import { CAMINHOS, LARGURA_RUA_BORDA, TENSAO_RUA } from '../src/city/ruas.js';
import { CALCADA_POR_LADO } from '../src/city/geometria.js';
import { GARAGEM_POS, GARAGEM_SIZE } from '../src/city/garagem.js';
import { POSTO_POS, POSTO_SIZE } from '../src/city/posto.js';
import { PALETA3D } from '../src/brand/paleta3d.js';
import {
  DESTINOS_GPS,
  PREDIOS_GPS,
  FRASE_PEDIDO,
  FRASE_CHEGADA,
} from '../src/missions/destinos.js';
import { CATEGORIAS_CADERNINHO, conteudoDescoberta } from '../src/missions/descobertas.js';

test('Shopping (Fatia 1): bairro e prédio existem com identidade visual própria', () => {
  const bairro = BAIRROS.find((b) => b.slug === 'SHOPPING');
  assert.ok(bairro, 'bairro SHOPPING existe em BAIRROS');
  assert.equal(bairro.corChao, PALETA3D.chaoShopping);

  const outrosChaos = BAIRROS.filter((b) => b.slug !== 'SHOPPING').map((b) => b.corChao);
  assert.ok(!outrosChaos.includes(bairro.corChao), 'cor do chão do SHOPPING é distinta dos demais bairros');

  const predio = TODOS_PREDIOS.find((p) => p.slug === 'SHOPPING');
  assert.ok(predio, 'prédio SHOPPING existe em TODOS_PREDIOS');
  assert.equal(predio.cor, PALETA3D.predios.SHOPPING);

  const outrasCores = Object.entries(PALETA3D.predios)
    .filter(([slug]) => slug !== 'SHOPPING')
    .map(([, cor]) => cor);
  assert.ok(!outrasCores.includes(predio.cor), 'cor do prédio SHOPPING é única na paleta');
});

test('Shopping (Fatia 1): deriva automaticamente sensores, GPS e Caderninho', () => {
  assert.ok(DESTINOS_GPS.includes('SHOPPING'), 'SHOPPING disponível nos destinos do GPS');
  assert.ok(PREDIOS_GPS.some((p) => p.slug === 'SHOPPING'), 'SHOPPING tem sensor de chegada');
  assert.ok(FRASE_PEDIDO.SHOPPING?.length > 0, 'SHOPPING tem frase de pedido');
  assert.ok(FRASE_CHEGADA.SHOPPING?.startsWith('Uau! Então'), 'SHOPPING segue o padrão previsível de chegada');

  const lugares = CATEGORIAS_CADERNINHO.find((c) => c.id === 'lugares');
  assert.ok(lugares.possiveis.includes('SHOPPING'), 'SHOPPING aparece na seção LUGARES do Caderninho');
  const card = conteudoDescoberta('lugares', 'SHOPPING');
  assert.equal(card.rotulo, 'SHOPPING');
  assert.equal(card.cor, PALETA3D.predios.SHOPPING);
});

test('Shopping (Fatia 1): estrada de acesso passa diante da entrada (+Z) sem invadir calçadas', () => {
  const shopping = TODOS_PREDIOS.find((p) => p.slug === 'SHOPPING');
  const caminhoShopping = CAMINHOS[5];
  assert.ok(Array.isArray(caminhoShopping) && caminhoShopping.length >= 4, 'caminho de acesso do SHOPPING existe');

  const curva = new THREE.CatmullRomCurve3(
    caminhoShopping.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'catmullrom',
    TENSAO_RUA
  );
  const pontos = curva.getSpacedPoints(120);
  const meiaBorda = LARGURA_RUA_BORDA / 2;

  const lotes = [
    ...TODOS_PREDIOS.filter((p) => p.slug !== 'PARQUE').map((p) => ({
      slug: p.slug,
      x: p.pos[0],
      z: p.pos[1],
      hx: p.size[0] / 2 + CALCADA_POR_LADO,
      hz: p.size[2] / 2 + CALCADA_POR_LADO,
    })),
    {
      slug: 'GARAGEM',
      x: GARAGEM_POS[0],
      z: GARAGEM_POS[1],
      hx: GARAGEM_SIZE[0] / 2 + CALCADA_POR_LADO,
      hz: GARAGEM_SIZE[2] / 2 + CALCADA_POR_LADO,
    },
    {
      slug: 'POSTO',
      x: POSTO_POS[0],
      z: POSTO_POS[1],
      hx: POSTO_SIZE[0] / 2 + CALCADA_POR_LADO,
      hz: POSTO_SIZE[2] / 2 + CALCADA_POR_LADO,
    },
  ];

  for (const pt of pontos) {
    for (const lote of lotes) {
      const gx = Math.abs(pt.x - lote.x) - (lote.hx + meiaBorda);
      const gz = Math.abs(pt.z - lote.z) - (lote.hz + meiaBorda);
      const invadiu = gx < 0 && gz < 0;
      assert.ok(
        !invadiu,
        `rua do Shopping invadiu calçada de ${lote.slug} em [${pt.x.toFixed(1)}, ${pt.z.toFixed(1)}]`
      );
    }
  }

  // Confirma que a rua passa diante da fachada principal (+Z) do SHOPPING
  const frenteShopping = pontos.filter((pt) => Math.abs(pt.x - shopping.pos[0]) <= 6);
  assert.ok(frenteShopping.length > 0, 'estrada passa em frente ao eixo X do SHOPPING');
  assert.ok(
    frenteShopping.every((pt) => pt.z > shopping.pos[1] + shopping.size[2] / 2),
    'estrada passa diante da fachada +Z do SHOPPING'
  );
});