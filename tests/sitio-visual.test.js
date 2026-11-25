import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import * as sitio from '../src/city/sitio.js';
import * as ruas from '../src/city/ruas.js';
import { MOEDAS } from '../src/city/moedas.js';

const distanciaMinima = (x, z, amostras) => Math.min(...amostras.map((p) => Math.hypot(x - p.x, z - p.z)));

function curvaAmostrada(pontos) {
  const curva = new THREE.CatmullRomCurve3(
    pontos.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'catmullrom',
    0.35
  );
  return curva.getSpacedPoints(240);
}

test('Sítio (polimento): curso sinuoso, peixes e pedrinhas cabem na área sem colisores', () => {
  const agua = sitio.TRAMOS_RIO_SITIO;
  const margens = sitio.MARGEM_TRAMOS_RIO;
  assert.equal(agua.length, 3, 'três trechos curvos de água');
  assert.equal(margens.length, agua.length);
  assert.equal(sitio.PEDRINHAS_RIO_SITIO.length, 4);
  for (const trecho of [...agua, ...margens]) {
    assert.ok(Math.abs(trecho.pos[0]) + trecho.rx <= sitio.SITIO_AREA_MEIAS.hx);
    assert.ok(Math.abs(trecho.pos[1]) + trecho.rz <= sitio.SITIO_AREA_MEIAS.hz);
  }
  const peixeNaAgua = (x, z) => agua.some((t) => {
    const dx = x - t.pos[0], dz = z - t.pos[1];
    const cos = Math.cos(t.rotY), sin = Math.sin(t.rotY);
    const localX = cos * dx + sin * dz;
    const localZ = -sin * dx + cos * dz;
    return (localX / t.rx) ** 2 + (localZ / t.rz) ** 2 < 0.82;
  });
  for (const peixe of sitio.PEIXES_SITIO) {
    for (const deslocamento of [-peixe.amplitude, 0, peixe.amplitude]) {
      assert.ok(peixeNaAgua(peixe.pos[0], peixe.pos[1] + deslocamento), `${peixe.id} saiu da água`);
    }
  }
  for (const pedra of sitio.PEDRINHAS_RIO_SITIO) {
    assert.ok(Math.abs(pedra.pos[0]) < sitio.SITIO_AREA_MEIAS.hx);
    assert.ok(Math.abs(pedra.pos[1]) < sitio.SITIO_AREA_MEIAS.hz);
  }
});

test('Sítio (polimento): a ponta arredondada acompanha o fim do ramal e não alcança moedas ou postes', () => {
  const tampa = ruas.TAMPAS_ARREDONDADAS?.find((item) => item.caminho === 6);
  assert.ok(tampa, 'tampa arredondada definida para o ramal do Sítio');
  assert.deepEqual(tampa.centro, ruas.CAMINHOS[6].at(-1));
  assert.equal(tampa.raio, ruas.LARGURA_RUA_BORDA / 2);

  const fonte = fs.readFileSync(new URL('../src/components/RoadNetwork.jsx', import.meta.url), 'utf8');
  assert.match(fonte, /TAMPAS_ARREDONDADAS/, 'RoadNetwork renderiza a ponta arredondada');

  const cenario = fs.readFileSync(new URL('../src/components/Cenario.jsx', import.meta.url), 'utf8');
  const blocoPostes = cenario.match(/const POSTES = \[([\s\S]*?)\];/);
  assert.ok(blocoPostes, 'POSTES encontrado em Cenario.jsx');
  const postes = [...blocoPostes[1].matchAll(/\[(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/g)]
    .map((m) => [Number(m[1]), Number(m[2])]);

  for (const [px, pz] of postes) {
    assert.ok(Math.hypot(tampa.centro[0] - px, tampa.centro[1] - pz) >= tampa.raio + 0.5);
  }
  for (const [mx, mz] of MOEDAS) {
    assert.ok(Math.hypot(tampa.centro[0] - mx, tampa.centro[1] - mz) > tampa.raio);
  }
});
