import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BAIRROS } from '../src/city/bairros.js';
import {
  ARQUIBANCADAS,
  CAMPO,
  ESTACIONAMENTO,
  ESTADIO_LAYOUT,
  TORCIDA,
  TORRES_REFLETOR,
} from '../src/city/estadio.js';

const bairroEstadio = BAIRROS.find((b) => b.slug === 'ESTÁDIO');
const predioEstadio = bairroEstadio.predios.find((p) => p.slug === 'ESTÁDIO');

test('Estádio: campo, arquibancadas e torres cabem na pegada [18, 14] e ficam acima do chão', () => {
  const [w, , l] = predioEstadio.size;
  assert.deepEqual(ESTADIO_LAYOUT.size, predioEstadio.size);
  assert.ok(CAMPO.w < w && CAMPO.l < l, 'gramado cabe dentro do estádio');
  assert.ok(CAMPO.y > 0, 'gramado acima do chão');

  for (const d of ARQUIBANCADAS) {
    assert.ok(Math.abs(d.x) + d.w / 2 <= w / 2 + 0.01, `degrau ${d.id} dentro de X`);
    assert.ok(Math.abs(d.z) + d.l / 2 <= l / 2 + 0.01, `degrau ${d.id} dentro de Z`);
    assert.ok(d.y > 0, `degrau ${d.id} acima do chão`);
  }

  assert.equal(TORRES_REFLETOR.length, 4);
  for (const t of TORRES_REFLETOR) {
    assert.ok(Math.abs(t.x) <= w / 2 && Math.abs(t.z) <= l / 2, `torre ${t.id} na borda da arena`);
  }
});

test('Estádio: torcida é determinística, povoada e assenta sobre os degraus', () => {
  assert.ok(TORCIDA.length >= 60, `torcida com pelo menos 60 pessoas (tem ${TORCIDA.length})`);
  const [w, , l] = predioEstadio.size;
  for (const pessoa of TORCIDA) {
    assert.ok(Math.abs(pessoa.x) < w / 2, 'torcedor dentro de X');
    assert.ok(Math.abs(pessoa.z) < l / 2, 'torcedor dentro de Z');
    assert.ok(pessoa.y > 0.5, 'torcedor sobre um degrau');
  }
});

test('Estádio: estacionamento cabe na ilha do bairro sem invadir o prédio', () => {
  const [px, pz] = predioEstadio.pos;
  const [pw] = predioEstadio.size;
  const [cx, cz] = bairroEstadio.chao.centro;
  const [cw, cl] = bairroEstadio.chao.tamanho;

  const estMinX = px + ESTACIONAMENTO.x - ESTACIONAMENTO.w / 2;
  const estMaxX = px + ESTACIONAMENTO.x + ESTACIONAMENTO.w / 2;
  const estMinZ = pz + ESTACIONAMENTO.z - ESTACIONAMENTO.l / 2;
  const estMaxZ = pz + ESTACIONAMENTO.z + ESTACIONAMENTO.l / 2;

  assert.ok(estMinX >= px + pw / 2 + 2.0, 'estacionamento fora do prédio e da calçada');
  assert.ok(estMaxX <= cx + cw / 2 - 0.5, 'estacionamento dentro da borda leste da ilha');
  assert.ok(estMinZ >= cz - cl / 2 + 0.5, 'estacionamento dentro da borda norte da ilha');
  assert.ok(estMaxZ <= cz + cl / 2 - 0.5, 'estacionamento dentro da borda sul da ilha');
  assert.ok(ESTACIONAMENTO.vagas >= 4 && ESTACIONAMENTO.carros.length >= 3);
});

test('City.jsx: monta OpenEstadio para o slug ESTÁDIO preservando colisor no componente', () => {
  const citySrc = fs.readFileSync('src/components/City.jsx', 'utf8');
  const estadioSrc = fs.readFileSync('src/components/OpenEstadio.jsx', 'utf8');
  assert.ok(citySrc.includes("import { OpenEstadio } from './OpenEstadio.jsx'"));
  assert.ok(citySrc.includes('<OpenEstadio'));
  assert.ok(estadioSrc.includes('<CuboidCollider args={[w / 2, h / 2, l / 2]} />'));
  assert.ok(estadioSrc.includes('ESTÁDIO'));
});
