import test from 'node:test';
import assert from 'node:assert/strict';

test('bandeja começa com cinco pães manipuláveis distintos', async () => {
  let modelo = null;
  try {
    modelo = await import('../src/city/padaria-model.js');
  } catch (_) {
    // RED explícito: o modelo local da MicroScene ainda não existe.
  }

  assert.ok(modelo, 'modelo da Padaria ainda não foi implementado');
  assert.deepEqual(modelo.PAES_DA_PADARIA, [1, 2, 3, 4, 5]);
});

test('tap alterna um pão entre bandeja e cesta sem duplicar', async () => {
  const modelo = await import('../src/city/padaria-model.js');
  assert.equal(
    typeof modelo.alternarPaoNaCesta,
    'function',
    'movimento reversível ainda não foi implementado'
  );

  const comPao = modelo.alternarPaoNaCesta([], 3);
  assert.deepEqual(comPao, [3]);
  assert.deepEqual(modelo.alternarPaoNaCesta(comPao, 3), []);
  assert.deepEqual(modelo.alternarPaoNaCesta([1, 3], 3), [1]);
});

test('contador confere a quantidade real da cesta contra o alvo', async () => {
  const modelo = await import('../src/city/padaria-model.js');
  assert.equal(
    typeof modelo.conferirPedido,
    'function',
    'conferência da cesta ainda não foi implementada'
  );

  assert.deepEqual(modelo.conferirPedido(3, [1, 4]), {
    alvo: 3,
    quantidade: 2,
    correto: false,
  });
  assert.deepEqual(modelo.conferirPedido(2, [1, 4]), {
    alvo: 2,
    quantidade: 2,
    correto: true,
  });
});
