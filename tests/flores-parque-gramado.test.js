import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POSICOES_FLORES } from '../src/city/flores-parque.js';
import { TODOS_PREDIOS } from '../src/city/bairros.js';

/**
 * FLORES DENTRO DO GRAMADO DO PARQUE (conferência de 19/11): a flor em
 * (−10, 81) encostava na borda do gramado verde ainda em botão e, crescida,
 * passava dela. Regra: cada flor CRESCIDA fica inteira no gramado verde, fora
 * da trilha amarela e dos caminhos em cruz, com MARGEM mínima de 0,5 unidade
 * do mundo (meia flor) entre o contorno dela e cada um desses limites.
 *
 * A geometria vem do próprio desenho (OpenPark.jsx e FloresParque.jsx): se o
 * parque mudar, o teste acompanha.
 */

const MARGEM = 0.5;
const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const PARQUE = ler('src/components/OpenPark.jsx');
const FLOR = ler('src/components/FloresParque.jsx');

const [CX, CZ] = TODOS_PREDIOS.find((p) => p.slug === 'PARQUE').pos;

// Gramado verde: círculo de raio r com escala [sx, 1, sz] (uma elipse).
const verde = PARQUE.match(
  /scale=\{\[([\d.]+), 1, ([\d.]+)\]\}>\s*<circleGeometry args=\{\[([\d.]+), 48\]\} \/>\s*<meshStandardMaterial color=\{TINTAS\.grass\}/
);
// Trilha: anel [interno, externo] com escala [sx, 1, sz].
const trilha = PARQUE.match(/scale=\{\[([\d.]+), 1, ([\d.]+)\]\}>\s*<ringGeometry args=\{\[([\d.]+), ([\d.]+), 48\]\}/);
// Caminhos em cruz: caixas baixas (altura 0,08) centradas no parque.
const caminhos = [...PARQUE.matchAll(/<boxGeometry args=\{\[([\d.]+), 0\.08, ([\d.]+)\]\} \/>/g)].map((m) => [
  Number(m[1]),
  Number(m[2]),
]);

// Raio da flor crescida: pétala a 0,28 do caule, esfera de 0,55 com escala 0,42.
const RAIO_FLOR = 0.28 + 0.55 * 0.42;

const elipse = (a, b, n = 2880) =>
  Array.from({ length: n }, (_, i) => [a * Math.cos((2 * Math.PI * i) / n), b * Math.sin((2 * Math.PI * i) / n)]);
const ate = ([x, z], pontos) => Math.min(...pontos.map(([px, pz]) => Math.hypot(x - px, z - pz)));
const ateCaixa = ([x, z], [w, d]) => Math.hypot(Math.max(0, Math.abs(x) - w / 2), Math.max(0, Math.abs(z) - d / 2));

test('a geometria do parque e da flor foi lida do desenho', () => {
  assert.ok(verde, 'gramado verde em OpenPark.jsx');
  assert.ok(trilha, 'trilha em OpenPark.jsx');
  assert.equal(caminhos.length, 2, 'dois caminhos em cruz');
  assert.match(FLOR, /Math\.cos\(angulo\) \* 0\.28/, 'pétala a 0,28 do caule');
  assert.match(FLOR, /scale=\{\[0\.42, 0\.18, 0\.42\]\}/, 'pétala com escala 0,42');
  assert.match(FLOR, /<sphereGeometry args=\{\[0\.55, /, 'pétala de raio 0,55');
  assert.equal(POSICOES_FLORES.length, 8);
});

test('as 8 flores crescidas ficam no gramado verde, a pelo menos 0,5 da borda', () => {
  const [sx, sz, r] = [Number(verde[1]), Number(verde[2]), Number(verde[3])];
  const borda = elipse(r * sx, r * sz);
  for (const [x, z] of POSICOES_FLORES) {
    const p = [x - CX, z - CZ];
    assert.ok((p[0] / (r * sx)) ** 2 + (p[1] / (r * sz)) ** 2 < 1, `(${x}, ${z}) fora do gramado`);
    const folga = ate(p, borda) - RAIO_FLOR;
    assert.ok(folga >= MARGEM, `(${x}, ${z}): ${folga.toFixed(2)} da borda do gramado (mínimo ${MARGEM})`);
  }
});

test('as 8 flores crescidas ficam fora da trilha, a pelo menos 0,5 dela', () => {
  const [sx, sz, ri, re] = trilha.slice(1).map(Number);
  const dentroDela = elipse(ri * sx, ri * sz);
  const foraDela = elipse(re * sx, re * sz);
  for (const [x, z] of POSICOES_FLORES) {
    const p = [x - CX, z - CZ];
    const raio = Math.hypot(p[0] / sx, p[1] / sz);
    assert.ok(raio < ri || raio > re, `(${x}, ${z}) em cima da trilha`);
    const folga = Math.min(ate(p, dentroDela), ate(p, foraDela)) - RAIO_FLOR;
    assert.ok(folga >= MARGEM, `(${x}, ${z}): ${folga.toFixed(2)} da trilha (mínimo ${MARGEM})`);
  }
});

test('as 8 flores crescidas ficam fora dos caminhos, a pelo menos 0,5 deles', () => {
  for (const [x, z] of POSICOES_FLORES) {
    const p = [x - CX, z - CZ];
    for (const caixa of caminhos) {
      const folga = ateCaixa(p, caixa) - RAIO_FLOR;
      assert.ok(folga >= MARGEM, `(${x}, ${z}): ${folga.toFixed(2)} do caminho ${caixa.join('×')} (mínimo ${MARGEM})`);
    }
  }
});
