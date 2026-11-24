import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { BAIRROS, TODOS_PREDIOS } from '../src/city/bairros.js';
import { CAMINHOS, LARGURA_RUA_BORDA, TENSAO_RUA } from '../src/city/ruas.js';
import { CALCADA_POR_LADO } from '../src/city/geometria.js';
import { GARAGEM_POS, GARAGEM_SIZE } from '../src/city/garagem.js';
import { POSTO_POS, POSTO_SIZE } from '../src/city/posto.js';
import {
  CAVALOS_SITIO, PASTO_SITIO, PEIXES_SITIO,
  PORTEIRA_SITIO, RIO_SITIO, SITIO_AREA_MEIAS,
} from '../src/city/sitio.js';
import { PALETA3D } from '../src/brand/paleta3d.js';
import { DESTINOS_GPS, PREDIOS_GPS, FRASE_PEDIDO, FRASE_CHEGADA } from '../src/missions/destinos.js';
import { CATEGORIAS_CADERNINHO, conteudoDescoberta } from '../src/missions/descobertas.js';

test('Sítio (Fatia 1): bairro, paleta única, GPS e Caderninho', () => {
  const bairro = BAIRROS.find((b) => b.slug === 'SÍTIO');
  assert.ok(bairro);
  assert.equal(bairro.corChao, PALETA3D.chaoSitio);
  assert.ok(!BAIRROS.filter((b) => b.slug !== 'SÍTIO').map((b) => b.corChao).includes(bairro.corChao));

  const lugar = TODOS_PREDIOS.find((p) => p.slug === 'SÍTIO');
  assert.equal(lugar.cor, PALETA3D.predios['SÍTIO']);
  const outrasCores = Object.entries(PALETA3D.predios).filter(([s]) => s !== 'SÍTIO').map(([, c]) => c);
  assert.ok(!outrasCores.includes(lugar.cor));

  assert.ok(DESTINOS_GPS.includes('SÍTIO'));
  assert.ok(PREDIOS_GPS.some((p) => p.slug === 'SÍTIO'));
  assert.ok(FRASE_PEDIDO['SÍTIO']?.length > 0);
  assert.ok(FRASE_CHEGADA['SÍTIO']?.startsWith('Uau! Então'));
  assert.ok(CATEGORIAS_CADERNINHO.find((c) => c.id === 'lugares').possiveis.includes('SÍTIO'));
  assert.equal(conteudoDescoberta('lugares', 'SÍTIO').cor, PALETA3D.predios['SÍTIO']);
});

test('Sítio (Fatia 1): porteira, 3 cavalos no pasto e 3 peixes no rio', () => {
  assert.ok(PORTEIRA_SITIO.vaoLivre >= 5.5);
  assert.equal(CAVALOS_SITIO.length, 3);
  assert.equal(PEIXES_SITIO.length, 3);

  const [px, pz] = PASTO_SITIO.centro;
  const [pw, pl] = PASTO_SITIO.tamanho;
  for (const c of CAVALOS_SITIO) {
    assert.ok(Math.abs(c.pos[0] - px) <= pw / 2 - 1 && Math.abs(c.pos[1] - pz) <= pl / 2 - 1);
    assert.ok(PALETA3D.sitio[c.pelagem]);
    assert.notEqual(PALETA3D.sitio[c.pelagem].toLowerCase(), PALETA3D.moeda.toLowerCase());
  }

  const [rx, rz] = RIO_SITIO.centro;
  const [rw, rl] = RIO_SITIO.tamanho;
  for (const p of PEIXES_SITIO) {
    assert.ok(Math.abs(p.pos[0] - rx) <= rw / 2 - 0.5);
    assert.ok(Math.abs(p.pos[1] - rz) + p.amplitude <= rl / 2 - 0.5);
  }
  assert.ok(Math.abs(px) + pw / 2 <= SITIO_AREA_MEIAS.hx);
  assert.ok(Math.abs(rx) + rw / 2 <= SITIO_AREA_MEIAS.hx);
  assert.ok(px + pw / 2 < rx - rw / 2);
});

test('Sítio (Fatia 1): estrada chega na porteira (+Z) sem invadir calçadas e rochas ficam fora', () => {
  const sitio = TODOS_PREDIOS.find((p) => p.slug === 'SÍTIO');
  const curva = new THREE.CatmullRomCurve3(
    CAMINHOS[6].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', TENSAO_RUA
  );
  const pontos = curva.getSpacedPoints(140);
  const meiaBorda = LARGURA_RUA_BORDA / 2;

  const lotes = [
    ...TODOS_PREDIOS.filter((p) => p.slug !== 'PARQUE' && p.slug !== 'SÍTIO').map((p) => ({
      slug: p.slug, x: p.pos[0], z: p.pos[1],
      hx: p.size[0] / 2 + CALCADA_POR_LADO, hz: p.size[2] / 2 + CALCADA_POR_LADO,
    })),
    { slug: 'GARAGEM', x: GARAGEM_POS[0], z: GARAGEM_POS[1], hx: GARAGEM_SIZE[0] / 2 + CALCADA_POR_LADO, hz: GARAGEM_SIZE[2] / 2 + CALCADA_POR_LADO },
    { slug: 'POSTO', x: POSTO_POS[0], z: POSTO_POS[1], hx: POSTO_SIZE[0] / 2 + CALCADA_POR_LADO, hz: POSTO_SIZE[2] / 2 + CALCADA_POR_LADO },
  ];

  for (const pt of pontos) {
    for (const l of lotes) {
      assert.ok(!(Math.abs(pt.x - l.x) < l.hx + meiaBorda && Math.abs(pt.z - l.z) < l.hz + meiaBorda), `invadiu ${l.slug}`);
    }
  }
  const frente = pontos.filter((pt) => Math.abs(pt.x - sitio.pos[0]) <= 8);
  assert.ok(frente.length > 0 && frente.every((pt) => pt.z > sitio.pos[1] + PORTEIRA_SITIO.z));

  const fonte = fs.readFileSync(new URL('../src/components/Landscape.jsx', import.meta.url), 'utf8');
  const bloco = fonte.match(/export const ROCHAS = \[([\s\S]*?)\];/);
  const rochas = [...bloco[1].matchAll(/\[(-?\d+),\s*(-?\d+)\]/g)].map((m) => [Number(m[1]), Number(m[2])]);
  for (const slug of ['SÍTIO', 'SHOPPING']) {
    const { centro: [cx, cz], tamanho: [w, l] } = BAIRROS.find((b) => b.slug === slug).chao;
    for (const [rx, rz] of rochas) {
      assert.ok(!(Math.abs(rx - cx) <= w / 2 + 1 && Math.abs(rz - cz) <= l / 2 + 1), `rocha em ${slug}`);
    }
  }
});