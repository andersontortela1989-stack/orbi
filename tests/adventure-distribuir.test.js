import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAventura } from '../src/adventure/adventure-engine.js';

// Aventuras SINTÉTICAS: o motor tem de funcionar sozinho antes de qualquer
// conteúdo real. Nada aqui importa horta.js nem parque-com-sede.js.

const FECHO = { id: 'fim', tipo: 'resumo', fala: 'Pronto!', aprendizados: ['Você repartiu'] };

/** 2 canteiros, 1 em cada — o caso mínimo. */
const umPorCanteiro = () =>
  criarAventura({
    id: 'teste-distribuir',
    titulo: 'TESTE',
    etapas: [
      {
        id: 'repartir',
        tipo: 'distribuir',
        item: 'semente',
        slots: 2,
        porSlot: 1,
        texto: 'Coloque uma semente em cada canteiro.',
        dica: 'Uma em cada.',
      },
      FECHO,
    ],
  });

/** 2 canteiros, 2 em cada — exercita o teto por slot. */
const doisPorCanteiro = () =>
  criarAventura({
    id: 'teste-distribuir-2',
    titulo: 'TESTE 2',
    etapas: [
      {
        id: 'repartir',
        tipo: 'distribuir',
        item: 'semente',
        slots: 2,
        porSlot: 2,
        texto: 'Duas sementes em cada canteiro.',
        dica: 'Duas em cada.',
      },
      FECHO,
    ],
  });

const de = (efeitos, tipo) => efeitos.filter((e) => e.tipo === tipo);
const contador = (efeitos) => de(efeitos, 'objetivo').at(-1)?.contador ?? null;
const por = (item, slot) => ({ tipo: 'distribuiu', item, slot });

test('a etapa abre com todos os canteiros vazios e anuncia o objetivo', () => {
  const aventura = umPorCanteiro();
  const efeitos = aventura.iniciar();

  assert.equal(aventura.etapa().id, 'repartir');
  assert.deepEqual(contador(efeitos), {
    atual: 0,
    total: 2,
    slots: [0, 0],
    porSlot: 1,
  });
  assert.deepEqual(de(efeitos, 'falar').map((e) => e.texto), [
    'Coloque uma semente em cada canteiro.',
  ]);
  assert.deepEqual(aventura.estado().distribuido, [0, 0]);
});

test('preencher um canteiro mostra o progresso e NÃO conclui a etapa', () => {
  const aventura = umPorCanteiro();
  aventura.iniciar();

  const efeitos = aventura.enviar(por('semente', 0));

  assert.deepEqual(contador(efeitos), {
    atual: 1,
    total: 2,
    slots: [1, 0],
    porSlot: 1,
  });
  assert.equal(aventura.etapa().id, 'repartir', 'ainda na etapa');
  assert.equal(de(efeitos, 'resumo').length, 0, 'não avançou pro fecho');
  assert.deepEqual(de(efeitos, 'falar').map((e) => e.texto), ['1']);
});

test('preencher todos os canteiros conclui e avança sozinho', () => {
  const aventura = umPorCanteiro();
  aventura.iniciar();
  aventura.enviar(por('semente', 0));

  const efeitos = aventura.enviar(por('semente', 1));

  assert.deepEqual(contador(efeitos).slots, [1, 1]);
  assert.equal(contador(efeitos).atual, 2);
  assert.equal(aventura.etapa().id, 'fim', 'avançou pro fecho');
  assert.equal(de(efeitos, 'resumo').length, 1);
});

test('tocar de novo num canteiro cheio não duplica, não passa do teto e não quebra', () => {
  const aventura = doisPorCanteiro();
  aventura.iniciar();
  aventura.enviar(por('semente', 0));
  aventura.enviar(por('semente', 0));
  assert.deepEqual(aventura.estado().distribuido, [2, 0], 'canteiro 0 cheio');

  const extra = aventura.enviar(por('semente', 0));

  assert.deepEqual(extra, [], 'no-op silencioso: nem efeito, nem fala repetida');
  assert.deepEqual(aventura.estado().distribuido, [2, 0], 'não passou do teto');
  assert.equal(aventura.etapa().id, 'repartir', 'canteiro 1 ainda está vazio');
});

test('distribuir não tem caminho de erro: nada pune, nada regride', () => {
  const aventura = umPorCanteiro();
  aventura.iniciar();

  const ruidos = [
    aventura.enviar({ tipo: 'distribuiu', item: 'outro', slot: 0 }),
    aventura.enviar({ tipo: 'distribuiu', item: 'semente', slot: 9 }),
    aventura.enviar({ tipo: 'distribuiu', item: 'semente', slot: -1 }),
    aventura.enviar({ tipo: 'distribuiu', item: 'semente', slot: 1.5 }),
    aventura.enviar({ tipo: 'distribuiu', item: 'semente' }),
    aventura.enviar({ tipo: 'respondeu', opcao: 'qualquer' }),
  ];

  for (const efeitos of ruidos) {
    assert.deepEqual(efeitos, [], 'toque inválido é ignorado, não punido');
  }
  assert.deepEqual(aventura.estado().distribuido, [0, 0]);
  const estado = aventura.estado();
  assert.equal(estado.tentativasEtapa, 0, 'nenhuma tentativa foi contada');
  assert.equal(estado.tentativasTotal, 0);
  assert.equal(estado.aguardandoContinuacao, false, 'nada revelou resposta');
});

test('pedir ajuda fala a dica e conta como apoio, sem penalidade', () => {
  const aventura = umPorCanteiro();
  aventura.iniciar();

  const efeitos = aventura.enviar({ tipo: 'pedir_ajuda' });

  assert.deepEqual(de(efeitos, 'falar').map((e) => e.texto), ['Uma em cada.']);
  assert.equal(aventura.estado().ajudas, 1);
  assert.equal(aventura.estado().tentativasTotal, 0, 'ajuda não é tentativa');
  assert.deepEqual(aventura.estado().distribuido, [0, 0], 'ajuda não preenche nada');
});

test('duas por canteiro: fala a conta DO canteiro tocado e só conclui no último', () => {
  const aventura = doisPorCanteiro();
  aventura.iniciar();

  const falas = [];
  for (const slot of [0, 1, 0]) {
    const efeitos = aventura.enviar(por('semente', slot));
    falas.push(de(efeitos, 'falar')[0].texto);
  }
  assert.equal(aventura.etapa().id, 'repartir', 'três de quatro: ainda na etapa');

  const ultimo = aventura.enviar(por('semente', 1));
  falas.push(de(ultimo, 'falar')[0].texto);

  assert.deepEqual(falas, ['1', '1', '2', '2'], 'conta do canteiro, não o total');
  assert.deepEqual(contador(ultimo).slots, [2, 2]);
  assert.equal(aventura.etapa().id, 'fim');
});

test('o snapshot anterior não muda quando um canteiro é preenchido depois', () => {
  const aventura = umPorCanteiro();
  aventura.iniciar();
  const antes = aventura.estado().distribuido;

  aventura.enviar(por('semente', 0));

  assert.deepEqual(antes, [0, 0], 'estado() devolve cópia rasa: o array é substituído, nunca mutado');
  assert.deepEqual(aventura.estado().distribuido, [1, 0]);
});

test('definição malformada rende etapa pobre, nunca um crash', () => {
  const aventura = criarAventura({
    id: 'teste-distribuir-torto',
    titulo: 'TORTO',
    etapas: [
      { id: 'repartir', tipo: 'distribuir', item: 'semente', texto: 'Sem slots nem porSlot.' },
      FECHO,
    ],
  });

  const abertura = aventura.iniciar();
  assert.deepEqual(contador(abertura), { atual: 0, total: 1, slots: [0], porSlot: 1 });

  aventura.enviar(por('semente', 0));
  assert.equal(aventura.etapa().id, 'fim', 'um slot de um: conclui no primeiro toque');
});
