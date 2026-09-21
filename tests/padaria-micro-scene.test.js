import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const { useGame } = await import('../src/store/useGame.js');
const { criarInteracaoContextual } = await import('../src/interactions/contextual-interactions.js');

beforeEach(() => {
  useGame.getState().resetar();
});

test('bandeja começa com cinco pães manipuláveis distintos', async () => {
  let modelo = null;
  try {
    modelo = await import('../src/components/micro-scenes/padaria-model.js');
  } catch (_) {
    // RED explícito: o modelo local da MicroScene ainda não existe.
  }

  assert.ok(modelo, 'modelo da Padaria ainda não foi implementado');
  assert.deepEqual(modelo.PAES_DA_PADARIA, [1, 2, 3, 4, 5]);
});

test('alvo é sorteado uma vez, permanece congelado e pertence a 2–5', async () => {
  const modelo = await import('../src/components/micro-scenes/padaria-model.js');
  const alvos = [0, 0.25, 0.5, 0.99].map((amostra) =>
    criarInteracaoContextual('PADARIA', 'exploracao', () => amostra).alvo
  );
  assert.deepEqual(alvos, [2, 3, 4, 5]);

  let sorteios = 0;
  const interacao = criarInteracaoContextual('PADARIA', 'exploracao', () => {
    sorteios += 1;
    return 0.5;
  });
  const alvoInicial = interacao.alvo;
  const cesta = modelo.alternarPaoNaCesta([], 1);
  modelo.conferirPedido(interacao.alvo, cesta);

  assert.equal(interacao.alvo, alvoInicial);
  assert.equal(sorteios, 1);
  assert.ok(interacao.alvo >= 2 && interacao.alvo <= 5);
});

test('tap alterna um pão entre bandeja e cesta sem duplicar', async () => {
  const modelo = await import('../src/components/micro-scenes/padaria-model.js');
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
  const modelo = await import('../src/components/micro-scenes/padaria-model.js');
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

test('conferência só conclui a quantidade correta e mantém zero Learning Data', async () => {
  const modelo = await import('../src/components/micro-scenes/padaria-model.js');
  assert.equal(
    typeof modelo.conferirEConcluirPedido,
    'function',
    'ponte funcional da conferência ainda não foi implementada'
  );

  useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao');
  const alvo = useGame.getState().interacaoContextual.alvo;
  const habilidadesAntes = structuredClone(useGame.getState().habilidades);
  const descobertasAntes = structuredClone(useGame.getState().descobertas);
  const cestaIncompleta = modelo.PAES_DA_PADARIA.slice(0, alvo - 1);
  const cestaCorreta = modelo.PAES_DA_PADARIA.slice(0, alvo);

  assert.deepEqual(
    modelo.conferirEConcluirPedido(
      alvo,
      cestaIncompleta,
      useGame.getState().concluirInteracaoContextual
    ),
    { alvo, quantidade: alvo - 1, correto: false, concluiu: false }
  );
  assert.equal(useGame.getState().interacaoContextual.status, 'ativa');

  assert.deepEqual(
    modelo.conferirEConcluirPedido(
      alvo,
      cestaCorreta,
      useGame.getState().concluirInteracaoContextual
    ),
    { alvo, quantidade: alvo, correto: true, concluiu: true }
  );
  assert.equal(useGame.getState().interacaoContextual.status, 'concluida');

  assert.equal(
    modelo.conferirEConcluirPedido(
      alvo,
      cestaCorreta,
      useGame.getState().concluirInteracaoContextual
    ).concluiu,
    false
  );
  assert.deepEqual(useGame.getState().habilidades, habilidadesAntes);
  assert.deepEqual(useGame.getState().descobertas, descobertasAntes);
  assert.equal('contagem_contextual_v1' in useGame.getState().habilidades, false);
});
