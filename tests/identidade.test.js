import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import {
  ADERECOS,
  LIMITE_FACHADA,
  aderecosDoLugar,
  pontosDeApoio,
  telhadoPiramide,
} from '../src/city/identidade.js';

/**
 * IDENTIDADE DOS LUGARES (fatia A2.1) — contrato dos adereços.
 *
 * Coordenadas locais ao lote: x e z a partir do centro do prédio, y a partir
 * do chão. A pegada é w × l (o colisor do Building); a calçada fica fora dela.
 * `limites` é a caixa alinhada aos eixos que envolve o adereço COM o contorno.
 */

const PREDIO = new Map(TODOS_PREDIOS.map((p) => [p.slug, p]));
const TOL = 1e-9;

function todosOsAderecos() {
  return Object.keys(ADERECOS).flatMap((slug) =>
    aderecosDoLugar(slug, PREDIO.get(slug).size).map((a) => ({ slug, a }))
  );
}

test('só há adereços para lugares que existem em BAIRROS', () => {
  for (const slug of Object.keys(ADERECOS)) {
    assert.ok(PREDIO.has(slug), `${slug} não existe em BAIRROS`);
  }
});

test('no máximo 2 adereços por lugar', () => {
  for (const [slug, lista] of Object.entries(ADERECOS)) {
    assert.ok(lista.length >= 1 && lista.length <= 2, `${slug}: ${lista.length}`);
  }
});

test('a PADARIA tem os pães da vitrine e o pão do telhado', () => {
  const lugares = aderecosDoLugar('PADARIA', PREDIO.get('PADARIA').size)
    .map((a) => a.lugar)
    .sort();
  assert.deepEqual(lugares, ['fachada', 'telhado']);
});

test('o dado declara que nenhum adereço tem colisor', () => {
  for (const lista of Object.values(ADERECOS)) {
    for (const declarado of lista) assert.equal(declarado.colisor, false);
  }
  for (const { a } of todosOsAderecos()) assert.equal(a.colisor, false);
});

test('todo adereço fica acima do chão', () => {
  for (const { slug, a } of todosOsAderecos()) {
    assert.ok(a.limites.min[1] >= 0, `${slug}/${a.id}: y mínimo ${a.limites.min[1]}`);
  }
});

test(`adereço de fachada fica a no máximo ${LIMITE_FACHADA} u fora da pegada w × l`, () => {
  assert.equal(LIMITE_FACHADA, 0.3);
  for (const { slug, a } of todosOsAderecos()) {
    if (a.lugar !== 'fachada') continue;
    const [w, , l] = PREDIO.get(slug).size;
    const { min, max } = a.limites;
    assert.ok(max[0] <= w / 2 + LIMITE_FACHADA + TOL, `${slug}/${a.id}: x máx ${max[0]}`);
    assert.ok(min[0] >= -w / 2 - LIMITE_FACHADA - TOL, `${slug}/${a.id}: x mín ${min[0]}`);
    assert.ok(max[2] <= l / 2 + LIMITE_FACHADA + TOL, `${slug}/${a.id}: z máx ${max[2]}`);
    assert.ok(min[2] >= -l / 2 - LIMITE_FACHADA - TOL, `${slug}/${a.id}: z mín ${min[2]}`);
  }
});

test('adereço de telhado fica dentro da pegada w × l', () => {
  for (const { slug, a } of todosOsAderecos()) {
    if (a.lugar !== 'telhado') continue;
    const [w, , l] = PREDIO.get(slug).size;
    const { min, max } = a.limites;
    assert.ok(max[0] <= w / 2 && min[0] >= -w / 2, `${slug}/${a.id}: x ${min[0]}..${max[0]}`);
    assert.ok(max[2] <= l / 2 && min[2] >= -l / 2, `${slug}/${a.id}: z ${min[2]}..${max[2]}`);
  }
});

test('pão do telhado assenta na face do telhado: sem flutuar e longe da ponta', () => {
  const size = PREDIO.get('PADARIA').size;
  const telhado = telhadoPiramide(size);
  const pao = aderecosDoLugar('PADARIA', size).find((a) => a.lugar === 'telhado');

  for (const inst of pao.instancias) {
    for (const [x, y, z] of pontosDeApoio(inst)) {
      // dentro da face frontal (+Z): nem na ponta, nem caindo para as laterais
      assert.ok(Math.abs(x) / telhado.ax <= z / telhado.az, `fora da face: x=${x} z=${z}`);
      assert.ok(z <= telhado.az, `além da beirada: z=${z}`);
      // encostado na face: os 4 cantos da base no plano do telhado
      const yFace = telhado.yBase + telhado.altura * (1 - z / telhado.az);
      assert.ok(Math.abs(y - yFace) < 1e-6, `flutua ou afunda: y=${y} face=${yFace}`);
    }
  }
});
