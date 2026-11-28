import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BAIRROS } from '../src/city/bairros.js';
import {
  BAIA_PORTO,
  CONTEINERES_PORTO,
  FAROL_LAYOUT,
  GUINDASTE_PORTO,
  PORTO_LAYOUT,
} from '../src/city/porto.js';

const bairroPorto = BAIRROS.find((b) => b.slug === 'PORTO');
const predioPorto = bairroPorto.predios.find((p) => p.slug === 'PORTO');
const predioFarol = bairroPorto.predios.find((p) => p.slug === 'FAROL');

test('Porto aberto: contêineres e guindaste cabem na ilha do bairro longe da estrada', () => {
  const [px, pz] = predioPorto.pos;
  const [cx, cz] = bairroPorto.chao.centro;
  const [cw, cl] = bairroPorto.chao.tamanho;

  assert.deepEqual(PORTO_LAYOUT.size, predioPorto.size);
  assert.ok(CONTEINERES_PORTO.length >= 6);

  for (const c of CONTEINERES_PORTO) {
    const wx = px + c.x;
    const wz = pz + c.z;
    assert.ok(wx - c.w / 2 >= cx - cw / 2 + 1.0, `contêiner ${c.id} dentro da borda oeste`);
    assert.ok(wz - c.l / 2 >= cz - cl / 2 + 1.0, `contêiner ${c.id} dentro da borda norte`);
    assert.ok(wz + c.l / 2 <= 23, `contêiner ${c.id} longe da estrada em z ≈ 28`);
  }

  const gx = px + GUINDASTE_PORTO.x;
  const gz = pz + GUINDASTE_PORTO.z;
  assert.ok(gx >= cx - cw / 2 + 2 && gz >= cz - cl / 2 + 2, 'guindaste dentro da ilha do Porto');
});

test('Farol aberto: baía, cais, píer, navio, barcos e pescadores cabem na faixa sul da ilha', () => {
  const [fx, fz] = predioFarol.pos;
  const [cx, cz] = bairroPorto.chao.centro;
  const [cw, cl] = bairroPorto.chao.tamanho;

  assert.deepEqual(FAROL_LAYOUT.size, predioFarol.size);
  assert.equal(FAROL_LAYOUT.faixas.length, 4);

  const minX = fx + BAIA_PORTO.x - BAIA_PORTO.w / 2;
  const maxX = fx + BAIA_PORTO.x + BAIA_PORTO.w / 2;
  const minZ = fz + BAIA_PORTO.z - BAIA_PORTO.l / 2;
  const maxZ = fz + BAIA_PORTO.z + BAIA_PORTO.l / 2;

  assert.ok(minX >= cx - cw / 2 + 0.5, 'baía dentro da borda oeste');
  assert.ok(maxX <= cx + cw / 2 - 0.5, 'baía dentro da borda leste');
  assert.ok(minZ >= fz + 5.0, 'baía recuada da base do Farol');
  assert.ok(maxZ <= cz + cl / 2 - 0.2, 'baía dentro da borda sul da ilha');
  assert.ok(BAIA_PORTO.barcos.length >= 2 && BAIA_PORTO.pescadores.length >= 2);
});

test('City.jsx: monta OpenPorto e OpenFarol preservando colisores nos componentes', () => {
  const citySrc = fs.readFileSync('src/components/City.jsx', 'utf8');
  const portoSrc = fs.readFileSync('src/components/OpenPorto.jsx', 'utf8');
  const farolSrc = fs.readFileSync('src/components/OpenFarol.jsx', 'utf8');

  assert.ok(citySrc.includes("import { OpenPorto } from './OpenPorto.jsx'"));
  assert.ok(citySrc.includes("import { OpenFarol } from './OpenFarol.jsx'"));
  assert.ok(citySrc.includes('<OpenPorto'));
  assert.ok(citySrc.includes('<OpenFarol'));
  assert.ok(portoSrc.includes('<CuboidCollider args={[w / 2, h / 2, l / 2]} />'));
  assert.ok(farolSrc.includes('<CuboidCollider args={[w / 2, h / 2, l / 2]} />'));
});
