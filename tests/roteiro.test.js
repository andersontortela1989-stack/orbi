import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROTEIRO,
  proximaPosicao,
  missaoDaParada,
  posicaoDaMissao,
  inicioDoRoteiro,
  avancoDoRoteiro,
  podePedirProxima,
} from '../src/missions/roteiro.js';
import { frasesDaMissao } from '../src/missions/missoes.js';
import { useGame } from '../src/store/useGame.js';
import { coordenadorAtividade } from '../src/activity/index.js';
import {
  aventuraAtiva,
  enviarEventoAventura,
  iniciarParqueComSede,
} from '../src/adventure/runtime.js';

// A lista aprovada em 28/09/2026 (Proposta B), na ordem exata.
const ESPERADO = [
  ['gps', 'PADARIA'],
  ['gps', 'ESCOLA'],
  ['gps', 'ESTÁDIO'],
  ['busca', 'GATO'],
  ['gps', 'ZOO'],
  ['ciencias', 'VET'],
  ['gps', 'MERCADO'],
  ['gps', 'PIZZA'],
];

// Busca conta como o LUGAR do bicho, lido da pista de city/bichos.js:
// "perto da água" = PORTO · "no meio das casas do centro" = casas do centro ·
// "no capim do parque" = PARQUE · "na feira do mercado" = MERCADO ·
// "perto da garagem" = GARAGEM.
const LUGAR_DA_BUSCA = {
  PATO: 'PORTO',
  GATO: 'CASAS DO CENTRO',
  VACA: 'PARQUE',
  GALINHA: 'MERCADO',
  CACHORRO: 'GARAGEM',
};
const lugarDaParada = (p) => (p.tipo === 'busca' ? LUGAR_DA_BUSCA[p.destino] : p.destino);

// Sorteio controlado: devolve os valores em sequência, em ciclo.
const sorteio = (...valores) => {
  let i = 0;
  return () => valores[i++ % valores.length];
};

function percorrer(voltas, random) {
  const visitadas = [];
  let passo = inicioDoRoteiro(null, { random });
  visitadas.push(passo.missao);
  let animalAnterior = passo.missao.animal ?? null;
  for (let n = 1; n < voltas * ROTEIRO.length; n += 1) {
    passo = avancoDoRoteiro(passo.posicao, { animalAnterior, random });
    if (passo.missao.tipo === 'ciencias') animalAnterior = passo.missao.animal;
    visitadas.push(passo.missao);
  }
  return visitadas;
}

test('ordem determinística: duas voltas reproduzem a lista duas vezes', () => {
  const visitadas = percorrer(2, sorteio(0.1, 0.9));
  assert.deepEqual(
    visitadas.map((m) => [m.tipo, m.destino]),
    [...ESPERADO, ...ESPERADO]
  );
});

test('nenhum lugar repetido na volta (busca conta como o lugar do bicho)', () => {
  const lugares = ROTEIRO.map(lugarDaParada);
  assert.equal(new Set(lugares).size, ROTEIRO.length, lugares.join(', '));
});

test('virada sem repetição: a última parada não é o lugar da primeira', () => {
  assert.notEqual(lugarDaParada(ROTEIRO.at(-1)), lugarDaParada(ROTEIRO[0]));
  assert.equal(proximaPosicao(ROTEIRO.length - 1), 0);
});

test('toda parada gera missão válida', () => {
  ROTEIRO.forEach((_, i) => {
    const m = missaoDaParada(i, { random: () => 0.5 });
    assert.ok(frasesDaMissao(m), `parada ${i + 1} (${m.destino}) sem frases`);
    assert.equal(m.concluida, false);
  });
});

test('identificação: a missão de cada parada é reconhecida como aquela posição', () => {
  ROTEIRO.forEach((_, i) => {
    assert.equal(posicaoDaMissao(missaoDaParada(i, { random: () => 0.5 })), i);
  });
});

test('início: retoma, avança ou recomeça conforme a missão salva', () => {
  const p5 = missaoDaParada(4, { random: () => 0.5 }); // ZOO
  const p8 = missaoDaParada(7, { random: () => 0.5 }); // PIZZA

  // não concluída da parada 5 → retoma a parada 5, com a MESMA missão
  const retoma = inicioDoRoteiro(p5);
  assert.equal(retoma.posicao, 4);
  assert.equal(retoma.missao, p5);

  // concluída da parada 5 → parada 6
  assert.equal(inicioDoRoteiro({ ...p5, concluida: true }).posicao, 5);

  // concluída da parada 8 → parada 1
  assert.equal(inicioDoRoteiro({ ...p8, concluida: true }).posicao, 0);

  // missões antigas do sorteio, fora do roteiro → parada 1
  const antigas = [
    { tipo: 'gps', destino: 'HOSPITAL', concluida: false },
    { tipo: 'busca', destino: 'PATO', concluida: false },
  ];
  for (const antiga of antigas) {
    const r = inicioDoRoteiro(antiga);
    assert.equal(r.posicao, 0, antiga.destino);
    assert.equal(r.missao.destino, 'PADARIA');
  }

  // sem save → parada 1
  assert.equal(inicioDoRoteiro(null).posicao, 0);
  assert.equal(inicioDoRoteiro(undefined).missao.destino, 'PADARIA');

  // ciências salva com bicho que não existe mais → não é "a mesma missão"
  assert.equal(
    inicioDoRoteiro({ tipo: 'ciencias', destino: 'VET', animal: 'DRAGAO', concluida: false }).posicao,
    0
  );
});

test('conteúdo varia sem mudar a ordem: bicho do VET não repete o da volta anterior', () => {
  // mesmo sorteio (0) nas duas voltas: sem a regra, o bicho seria o mesmo
  const visitadas = percorrer(3, () => 0);
  const vets = visitadas.filter((m) => m.tipo === 'ciencias').map((m) => m.animal);
  assert.equal(vets.length, 3);
  assert.notEqual(vets[0], vets[1]);
  assert.notEqual(vets[1], vets[2]);
  assert.deepEqual(
    visitadas.map((m) => m.destino),
    [...ESPERADO, ...ESPERADO, ...ESPERADO].map(([, d]) => d)
  );
});

test('regra de avanço: só pede a próxima com o foco na missão e sem aventura', () => {
  assert.equal(podePedirProxima({ pendente: true, aventuraAtiva: false, temFocoMissao: true }), true);
  assert.equal(podePedirProxima({ pendente: false, aventuraAtiva: false, temFocoMissao: true }), false);
  assert.equal(podePedirProxima({ pendente: true, aventuraAtiva: true, temFocoMissao: true }), false);
  assert.equal(podePedirProxima({ pendente: true, aventuraAtiva: false, temFocoMissao: false }), false);
});

// ---------- integração com o store e o coordenador ----------

function comecarDoZero() {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
}

// A proteção contra a chamada dupla do StrictMode fica no MissionController
// (React: o início só chama proximaMissao com a posição ainda nula) e não é
// coberta por node:test. No store, duas chamadas seguidas a partir da posição
// nula avançam uma parada — a primeira aplica o início, a segunda avança.
test('store: início na parada 1 e avanço pela lista', () => {
  comecarDoZero();
  const jogo = () => useGame.getState();
  assert.equal(jogo().roteiroPosicao, null);

  jogo().proximaMissao(); // início (posição nula)
  assert.equal(jogo().roteiroPosicao, 0);
  assert.equal(jogo().missao.destino, 'PADARIA');

  jogo().completarMissao();
  jogo().proximaMissao();
  assert.equal(jogo().roteiroPosicao, 1);
  assert.equal(jogo().missao.destino, 'ESCOLA');
});

test('store: missão salva não concluída da parada 5 é retomada no início', () => {
  comecarDoZero();
  const p5 = missaoDaParada(4, { random: () => 0.5 });
  useGame.setState({ missao: p5, roteiroPosicao: null });
  useGame.getState().proximaMissao();
  assert.equal(useGame.getState().roteiroPosicao, 4);
  assert.deepEqual(useGame.getState().missao, p5);
});

test('chegada errada não avança', () => {
  comecarDoZero();
  useGame.getState().proximaMissao(); // PADARIA
  assert.equal(useGame.getState().processarChegada('HOSPITAL'), false);
  assert.equal(useGame.getState().missao.concluida, false);
  assert.equal(useGame.getState().roteiroPosicao, 0);
  assert.equal(useGame.getState().missao.destino, 'PADARIA');
});

test('interrupção por carona e por aventura não avança o roteiro', () => {
  comecarDoZero();
  const jogo = () => useGame.getState();
  coordenadorAtividade.pedirFoco('em_missao');
  jogo().proximaMissao(); // PADARIA
  const antes = { posicao: jogo().roteiroPosicao, missao: jogo().missao };
  const podeAgora = () =>
    podePedirProxima({
      pendente: true,
      aventuraAtiva: aventuraAtiva(),
      temFocoMissao: coordenadorAtividade.temFoco('em_missao'),
    });

  // carona toma o foco
  coordenadorAtividade.pedirFoco('carona');
  assert.equal(podeAgora(), false);
  coordenadorAtividade.liberar('carona');
  assert.equal(jogo().roteiroPosicao, antes.posicao);
  assert.equal(jogo().missao, antes.missao);
  assert.equal(podeAgora(), true);

  // aventura da água: enquanto ativa, nada avança; ao terminar, mesma parada
  assert.equal(iniciarParqueComSede(), true);
  assert.equal(podeAgora(), false);
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'respondeu', opcao: 'agua' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'PORTO' });
  for (let n = 0; n < 4; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'PARQUE' });
  enviarEventoAventura({ tipo: 'toque' }); // fecha o resumo
  assert.equal(aventuraAtiva(), false);
  assert.equal(jogo().roteiroPosicao, antes.posicao);
  assert.equal(jogo().missao, antes.missao);
  coordenadorAtividade.reiniciar();
});
