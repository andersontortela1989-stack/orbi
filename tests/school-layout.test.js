import test from 'node:test';
import assert from 'node:assert/strict';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { MOEDAS, RAIO_COLETA } from '../src/city/moedas.js';
import { createSchoolLayout } from '../src/school/school-layout.js';

const school = TODOS_PREDIOS.find(p => p.slug === 'ESCOLA');

test('planta usa a escola real sem mudar os dados do destino', () => {
  const before = structuredClone(school);
  const layout = createSchoolLayout(school);
  assert.deepEqual(layout.origin, [0, 0, 38]);
  assert.deepEqual(school, before);
  assert.equal(createSchoolLayout({ slug: 'HOSPITAL' }), null);
});

test('volumes cabem no lote e mantêm aproximação e moedas livres', () => {
  const layout = createSchoolLayout(school);
  const ids = new Set();
  for (const item of [...layout.boxes, ...layout.crowns]) {
    assert.ok(!ids.has(item.id)); ids.add(item.id);
    assert.ok(item.position.every(Number.isFinite));
    assert.ok(item.scale.every(n => Number.isFinite(n) && n > 0));
    // As copas usam icosaedro de raio 0.5: seu AABB cabe nesta mesma caixa.
    const [x,y,z] = item.position;
    const [w,h,l] = item.scale;
    const minX=x-w/2, maxX=x+w/2, minZ=z-l/2, maxZ=z+l/2;
    assert.ok(minX >= -10 && maxX <= 10 && minZ >= -10 && maxZ <= 10, item.id);
    if (item.zone !== 'paving' && y-h/2 < 2) {
      const blocksEntry = maxX > -3.2 && minX < 3.2 && maxZ > 6.4 && minZ < 10;
      assert.equal(blocksEntry, false, item.id);
    }
    if (item.zone === 'garden') {
      for (const [mx,mz] of MOEDAS) {
        const dx=Math.max(minX+school.pos[0]-mx, 0, mx-(maxX+school.pos[0]));
        const dz=Math.max(minZ+school.pos[1]-mz, 0, mz-(maxZ+school.pos[1]));
        assert.ok(Math.hypot(dx,dz) > RAIO_COLETA, item.id);
      }
    }
  }
});
