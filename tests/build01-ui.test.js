import test from 'node:test';
import assert from 'node:assert/strict';

import { deveExigirLandscape } from '../src/ui/build01.js';

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
