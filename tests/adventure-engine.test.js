import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';

function tipos(efeitos) {
  return efeitos.map((efeito) => efeito.tipo);
}

test('aventura começa com foco e chamado, sem depender do browser', () => {
  const corredor = criarAventura(PARQUE_COM_SEDE);
  const efeitos = corredor.iniciar();
  assert.deepEqual(tipos(efeitos), [
    'foco', 'telemetria', 'telemetria', 'foco', 'mensagem', 'falar',
  ]);
  assert.equal(corredor.etapa().id, 'chamado');
  assert.equal(corredor.estado().concluida, false);
});

test('terceiro erro revela a resposta e agenda avanço sem punir nem travar', () => {
  const corredor = criarAventura(PARQUE_COM_SEDE);
  corredor.iniciar();
  corredor.enviar({ tipo: 'toque' });

  for (let n = 1; n <= 2; n += 1) {
    const efeitos = corredor.enviar({ tipo: 'respondeu', opcao: 'areia' });
    assert.ok(tipos(efeitos).includes('falar'));
    assert.ok(!tipos(efeitos).includes('revelar_resposta'));
  }

  const terceira = corredor.enviar({ tipo: 'respondeu', opcao: 'papel' });
  assert.ok(tipos(terceira).includes('revelar_resposta'));
  assert.ok(tipos(terceira).includes('agendar'));
  assert.equal(corredor.estado().tentativasTotal, 3);

  corredor.enviar({ tipo: 'continuar' });
  assert.equal(corredor.etapa().id, 'ir-ao-porto');
});

test('ajuda conta como apoio e destaca o destino, sem penalidade', () => {
  const corredor = criarAventura(PARQUE_COM_SEDE);
  corredor.iniciar();
  corredor.enviar({ tipo: 'toque' });
  corredor.enviar({ tipo: 'respondeu', opcao: 'agua' });

  const efeitos = corredor.enviar({ tipo: 'pedir_ajuda' });
  assert.deepEqual(tipos(efeitos), ['telemetria', 'falar', 'destacar']);
  assert.equal(corredor.estado().ajudas, 1);
  assert.equal(corredor.estado().tentativasTotal, 0);
});

test('fluxo completo produz mundo permanente, recompensas, resumo e métricas', () => {
  const corredor = criarAventura(PARQUE_COM_SEDE);
  corredor.iniciar();
  corredor.enviar({ tipo: 'toque' });
  corredor.enviar({ tipo: 'respondeu', opcao: 'agua' });
  corredor.enviar({ tipo: 'tick', segundos: 12 });
  corredor.enviar({ tipo: 'chegou', lugar: 'PORTO' });

  for (let n = 0; n < 4; n += 1) {
    corredor.enviar({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 });
  }
  assert.equal(corredor.etapa().id, 'voltar-ao-parque');

  const chegada = corredor.enviar({ tipo: 'chegou', lugar: 'PARQUE' });
  assert.ok(chegada.some((efeito) => efeito.tipo === 'mundo' && efeito.flag === 'parque_florido'));
  assert.equal(chegada.filter((efeito) => efeito.tipo === 'recompensa').length, 2);
  assert.equal(chegada.filter((efeito) => efeito.tipo === 'descoberta').length, 5);
  assert.ok(tipos(chegada).includes('resumo'));

  const fim = corredor.enviar({ tipo: 'toque' });
  assert.ok(tipos(fim).includes('fim'));
  assert.equal(corredor.estado().concluida, true);
  assert.equal(fim.find((efeito) => efeito.tipo === 'fim').segundos, 12);
});

test('eventos fora da etapa não avançam a aventura', () => {
  const corredor = criarAventura(PARQUE_COM_SEDE);
  corredor.iniciar();
  assert.deepEqual(corredor.enviar({ tipo: 'chegou', lugar: 'PARQUE' }), []);
  assert.equal(corredor.etapa().id, 'chamado');
});
