import test from 'node:test';
import assert from 'node:assert/strict';

import { deveExigirLandscape, estadoCombustivelHud } from '../src/ui/build01.js';

test('orientation gate aparece somente durante gameplay em portrait', () => {
  const casos = [
    { fase: 'abertura', retrato: true, esperado: false },
    { fase: 'intro', retrato: true, esperado: false },
    { fase: 'jogo', retrato: false, esperado: false },
    { fase: 'jogo', retrato: true, esperado: true },
  ];

  for (const caso of casos) {
    assert.equal(
      deveExigirLandscape(caso.fase, caso.retrato),
      caso.esperado,
      `${caso.fase}/${caso.retrato ? 'portrait' : 'landscape'}`
    );
  }
});

test('HUD de combustível fica oculto quando saudável e contextual quando baixo', () => {
  assert.deepEqual(estadoCombustivelHud(100, 25), {
    visivel: false,
    nivel: 'saudavel',
    percentual: 100,
  });
  assert.deepEqual(estadoCombustivelHud(25, 25), {
    visivel: true,
    nivel: 'baixo',
    percentual: 25,
  });
  assert.deepEqual(estadoCombustivelHud(0, 25), {
    visivel: true,
    nivel: 'critico',
    percentual: 0,
  });
});
