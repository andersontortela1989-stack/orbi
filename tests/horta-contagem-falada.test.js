import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { criarHortaEscola } from '../src/school/horta-aventura.js';
import { cartaoDistribuir } from '../src/adventure/distribuir.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';

/**
 * CONTAGEM FALADA NO PLANTIO E NA REGA (20/11/2026).
 *
 * Jogando na faixa 3–5, a voz dizia "um, um, um" ao plantar: o motor falava
 * a conta DO canteiro tocado, e com uma semente por canteiro ela é sempre 1.
 * Agora:
 *   - plantio: fala o TOTAL plantado até agora, por extenso ("um", "dois",
 *     "três"… até "quatro" na 6–7 e "seis" na 8–10);
 *   - nas faixas com mais de uma por canteiro, quando um canteiro enche,
 *     acrescenta "Este canteiro tem duas.";
 *   - rega: fala o total de canteiros regados;
 *   - o cartão de repartir (🌱/💧 por canteiro) não muda, e o toque num
 *     canteiro cheio continua sem fala nem efeito;
 *   - coleta (saquinhos da Horta, baldes do parque): a voz também recebe o
 *     número por extenso ("um", "dois"…), não o algarismo.
 */

const REGUE = 'Agora regue os canteiros, um de cada vez.';
const FECHO = 'A professora Lia agradeceu! Vamos ver os brotinhos nascendo?';
const CHEIO = 'Este canteiro tem duas.';

const falas = (efeitos) => efeitos.filter((e) => e.tipo === 'falar').map((e) => e.texto);

/** A Horta da faixa, levada até o plantio pelo caminho que a criança faz. */
function ateOPlantio(band) {
  const aventura = criarAventura(criarHortaEscola(band, { random: () => 0.5 }));
  aventura.iniciar();
  aventura.enviar({ tipo: 'toque' }); // convite: VAMOS!
  aventura.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  if (aventura.etapa().id === 'quantas-sementes') {
    aventura.enviar({ tipo: 'respondeu', opcao: aventura.etapa().opcoes.find((o) => o.correta).id });
  }
  const { quantidade } = aventura.etapa();
  for (let i = 0; i < quantidade; i += 1) aventura.enviar({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  aventura.enviar({ tipo: 'chegou', lugar: 'ESCOLA' });
  assert.equal(aventura.etapa().id, 'plantar');
  return aventura;
}

/** Falas de cada toque, na ordem dos canteiros tocados. */
const tocar = (aventura, item, canteiros) =>
  canteiros.map((slot) => falas(aventura.enviar({ tipo: 'distribuiu', item, slot })));

/** Planta tudo na ordem simples (canteiro por canteiro) e chega à rega. */
function ateARega(band, beds, porCanteiro) {
  const aventura = ateOPlantio(band);
  tocar(aventura, 'semente', Array.from({ length: beds }, (_, i) => Array(porCanteiro).fill(i)).flat());
  assert.equal(aventura.etapa().id, 'regar');
  return aventura;
}

// ------------------------------------------------------------ coleta

/** A Horta da faixa, levada até a coleta dos saquinhos. */
function ateAColeta(band) {
  const aventura = criarAventura(criarHortaEscola(band, { random: () => 0.5 }));
  aventura.iniciar();
  aventura.enviar({ tipo: 'toque' });
  aventura.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  if (aventura.etapa().id === 'quantas-sementes') {
    aventura.enviar({ tipo: 'respondeu', opcao: aventura.etapa().opcoes.find((o) => o.correta).id });
  }
  assert.equal(aventura.etapa().id, 'pegar-sementes');
  return aventura;
}

const coletar = (aventura, item, vezes) =>
  Array.from({ length: vezes }, () => falas(aventura.enviar({ tipo: 'coletou', item, quantidade: 1 })));

const LEVE_SEMENTES = 'Agora leve as sementes até a escola.';

test('coleta da Horta: a voz conta os saquinhos por extenso, nas três faixas', () => {
  assert.deepEqual(coletar(ateAColeta('3-5'), 'semente', 3), [['um'], ['dois'], ['três', LEVE_SEMENTES]]);
  assert.deepEqual(coletar(ateAColeta('6-7'), 'semente', 4), [['um'], ['dois'], ['três'], ['quatro', LEVE_SEMENTES]]);
  assert.deepEqual(coletar(ateAColeta('8-10'), 'semente', 6), [
    ['um'], ['dois'], ['três'], ['quatro'], ['cinco'], ['seis', LEVE_SEMENTES],
  ]);
});

test('coleta do parque: a voz conta os baldes por extenso', () => {
  const aventura = criarAventura(PARQUE_COM_SEDE);
  aventura.iniciar();
  aventura.enviar({ tipo: 'toque' });
  aventura.enviar({ tipo: 'respondeu', opcao: aventura.etapa().opcoes.find((o) => o.correta).id });
  aventura.enviar({ tipo: 'chegou', lugar: aventura.etapa().lugar });
  assert.equal(aventura.etapa().tipo, 'coletar');
  const { item } = aventura.etapa();
  assert.deepEqual(coletar(aventura, item, 4), [['um'], ['dois'], ['três'], ['quatro', 'Agora leve a água até o parque.']]);
});

// ------------------------------------------------------------ plantio

test('3–5: o plantio conta o total — "um, dois, três" (antes: "um, um, um")', () => {
  const aventura = ateOPlantio('3-5');
  assert.deepEqual(tocar(aventura, 'semente', [0, 1, 2]), [['um'], ['dois'], ['três', REGUE]]);
});

test('6–7: o plantio conta até quatro e diz quando um canteiro enche', () => {
  assert.deepEqual(tocar(ateOPlantio('6-7'), 'semente', [0, 0, 1, 1]), [
    ['um'],
    ['dois', CHEIO],
    ['três'],
    ['quatro', CHEIO, REGUE],
  ]);
  // alternando os canteiros: a contagem é do total; o aviso, do canteiro que encheu
  assert.deepEqual(tocar(ateOPlantio('6-7'), 'semente', [0, 1, 0, 1]), [
    ['um'],
    ['dois'],
    ['três', CHEIO],
    ['quatro', CHEIO, REGUE],
  ]);
});

test('8–10: o plantio conta até seis e diz quando cada canteiro enche', () => {
  assert.deepEqual(tocar(ateOPlantio('8-10'), 'semente', [0, 0, 1, 1, 2, 2]), [
    ['um'],
    ['dois', CHEIO],
    ['três'],
    ['quatro', CHEIO],
    ['cinco'],
    ['seis', CHEIO, REGUE],
  ]);
});

// ------------------------------------------------------------ rega

test('rega: fala o total de canteiros regados, nas três faixas', () => {
  assert.deepEqual(tocar(ateARega('3-5', 3, 1), 'agua', [0, 1, 2]), [['um'], ['dois'], ['três', FECHO]]);
  assert.deepEqual(tocar(ateARega('6-7', 2, 2), 'agua', [0, 1]), [['um'], ['dois', FECHO]]);
  assert.deepEqual(tocar(ateARega('8-10', 3, 2), 'agua', [0, 1, 2]), [['um'], ['dois'], ['três', FECHO]]);
});

// ------------------------------------------------------------ o que não muda

test('toque em canteiro cheio continua sem fala e sem efeito', () => {
  const plantio = ateOPlantio('6-7');
  tocar(plantio, 'semente', [0, 0]);
  assert.deepEqual(plantio.enviar({ tipo: 'distribuiu', item: 'semente', slot: 0 }), []);
  assert.deepEqual(plantio.estado().distribuido, [2, 0]);
  // e o próximo toque válido continua a contagem de onde parou
  assert.deepEqual(tocar(plantio, 'semente', [1]), [['três']]);

  const umPorCanteiro = ateOPlantio('3-5');
  tocar(umPorCanteiro, 'semente', [0]);
  assert.deepEqual(umPorCanteiro.enviar({ tipo: 'distribuiu', item: 'semente', slot: 0 }), []);

  const rega = ateARega('8-10', 3, 2);
  tocar(rega, 'agua', [1]);
  assert.deepEqual(rega.enviar({ tipo: 'distribuiu', item: 'agua', slot: 1 }), []);
  assert.deepEqual(tocar(rega, 'agua', [0]), [['dois']]);
});

test('os resumos da H3 continuam iguais nas três faixas (primeira vez e repetição)', () => {
  const resumo = (band, repetida) => {
    const { fala, aprendizados, recompensas } = criarHortaEscola(band, { repetida }).etapas.find((e) => e.tipo === 'resumo');
    return { fala, aprendizados, recompensas };
  };
  const esperado = (saquinhos, porCanteiro) => [
    `Você buscou ${saquinhos} saquinhos de semente.`,
    `Você colocou ${porCanteiro} em cada canteiro.`,
    'Você foi ao mercado e voltou à escola.',
  ];
  for (const [band, saquinhos, porCanteiro] of [['3-5', 'três', 'uma semente'], ['6-7', 'quatro', 'duas sementes'], ['8-10', 'seis', 'duas sementes']]) {
    assert.deepEqual(resumo(band, false), { fala: FECHO, aprendizados: esperado(saquinhos, porCanteiro), recompensas: ['ADESIVO: BROTO DA ESCOLA'] });
    assert.deepEqual(resumo(band, true), {
      fala: 'Você cuidou da horta de novo! A professora Lia agradeceu.',
      aprendizados: esperado(saquinhos, porCanteiro),
      recompensas: [],
    });
  }
});

test('o cartão de repartir (🌱/💧 por canteiro) não muda', () => {
  const aventura = ateOPlantio('6-7');
  const efeitos = aventura.enviar({ tipo: 'distribuiu', item: 'semente', slot: 0 });
  const contador = efeitos.filter((e) => e.tipo === 'objetivo').at(-1).contador;
  assert.deepEqual(contador, { atual: 1, total: 4, slots: [1, 0], porSlot: 2, item: 'semente' });
  assert.deepEqual(cartaoDistribuir({ ativa: true, contador }), {
    item: 'semente',
    porSlot: 2,
    canteiros: [
      { indice: 0, quantidade: 1, cheio: false },
      { indice: 1, quantidade: 0, cheio: false },
    ],
  });
});
