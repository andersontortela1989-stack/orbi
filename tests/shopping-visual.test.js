import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as ruas from '../src/city/ruas.js';
import { MOEDAS } from '../src/city/moedas.js';

test('Shopping (polimento): a ponta arredondada acompanha o fim do ramal e não alcança moedas ou postes', () => {
  const tampa = ruas.TAMPAS_ARREDONDADAS?.find((item) => item.caminho === 5);
  assert.ok(tampa, 'tampa arredondada definida para o ramal do Shopping');
  assert.deepEqual(tampa.centro, ruas.CAMINHOS[5].at(-1));
  assert.equal(tampa.raio, ruas.LARGURA_RUA_BORDA / 2);

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