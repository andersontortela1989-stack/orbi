import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarCoordenadorAtividade } from '../src/activity/activity-machine.js';
import {
  coordenadorAtividade,
  falarDaAtividade,
  falarNoFoco,
} from '../src/activity/index.js';
import {
  aventuraRuntime,
  enviarEventoAventura,
  iniciarParqueComSede,
} from '../src/adventure/runtime.js';
import { useGame } from '../src/store/useGame.js';
import { podeRepetirFala } from '../src/ui/repetir-fala.js';

/**
 * BOTÃO DE REPETIR A FALA (fatia C1). O coordenador é o ponto único por onde
 * toda fala do jogo passa; ele guarda a última fala de cada atividade e
 * "repetir" devolve a da atividade EM FOCO.
 */

function vozFalsa() {
  const chamadas = [];
  return {
    chamadas,
    voz: {
      falar: (texto, opts) => {
        chamadas.push({ texto, opts });
        return true;
      },
      calar: () => {},
    },
  };
}

test('repetir fala de novo a última fala da atividade em foco', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.pedirFoco('em_missao');
  c.falar('em_missao', 'O que é padaria? Vamos ver?');
  chamadas.length = 0;

  assert.equal(c.estado().fala, 'O que é padaria? Vamos ver?');
  assert.equal(c.repetir(), true);
  assert.deepEqual(chamadas.map((ch) => ch.texto), ['O que é padaria? Vamos ver?']);
});

test('troca de foco troca a fonte da repetição', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.pedirFoco('em_missao');
  c.falar('em_missao', 'pedido da missão');
  c.pedirFoco('pergunta');
  assert.equal(c.estado().fala, null); // a pergunta ainda não falou
  c.falar('pergunta', 'Quantos pães tem aqui?');
  chamadas.length = 0;

  c.repetir();
  c.liberar('pergunta');
  c.repetir();
  assert.deepEqual(
    chamadas.map((ch) => ch.texto),
    ['Quantos pães tem aqui?', 'pedido da missão']
  );
});

test('sem fala ainda: nada a repetir e a voz não é chamada', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  assert.equal(c.estado().fala, null);
  assert.equal(c.repetir(), false);
  assert.equal(chamadas.length, 0);
});

test('fala bloqueada: de quem não é dono NÃO é guardada; pela pausa, É guardada', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.pedirFoco('em_missao');
  c.falar('em_missao', 'pedido');

  // 1) Não é dona: a carona tem o foco, a fala de fundo da missão se perde.
  c.pedirFoco('carona');
  c.falar('em_missao', 'fala de fundo');
  c.liberar('carona');
  assert.equal(c.estado().fala, 'pedido');

  // 2) Pausa: a fala era do foco, só não pode ser ouvida agora.
  c.pausar();
  chamadas.length = 0;
  assert.equal(c.falar('em_missao', 'pedido novo'), false);
  assert.equal(chamadas.length, 0); // nada foi dito durante a pausa
  c.retomar();
  assert.equal(c.estado().fala, 'pedido novo');
});

test('fala bloqueada pela pausa é repetida depois de despausar', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.pedirFoco('em_missao');
  c.pausar();
  c.falar('em_missao', 'O que é padaria? Vamos ver?');
  assert.equal(c.repetir(), false); // pausado não fala
  c.retomar();
  chamadas.length = 0;
  assert.equal(c.repetir(), true);
  assert.deepEqual(chamadas.map((ch) => ch.texto), ['O que é padaria? Vamos ver?']);
});

test('fala global (céu, combustível) é dita mas não substitui a fala da missão', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.pedirFoco('em_missao');
  c.falar('em_missao', 'pedido da missão');
  chamadas.length = 0;
  assert.equal(c.falar('em_missao', 'noite!', { guardar: false }), true);
  assert.deepEqual(chamadas.map((ch) => ch.texto), ['noite!']);
  assert.equal(c.estado().fala, 'pedido da missão');
});

test('falarNoFoco não vira a fala a repetir', () => {
  coordenadorAtividade.reiniciar();
  coordenadorAtividade.pedirFoco('em_missao');
  falarDaAtividade('em_missao', 'pedido da missão');
  falarNoFoco('Ih, a gasolina está baixa! Me leva no posto?');
  assert.equal(coordenadorAtividade.estado().fala, 'pedido da missão');
  coordenadorAtividade.reiniciar();
});

test('atividade sem voz (pausado, configurações) não repete', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.falar('explorando', 'oi');
  c.pausar();
  chamadas.length = 0;
  assert.equal(c.repetir(), false);
  assert.equal(chamadas.length, 0);
});

test('toques rápidos: cada repetição corta a fala em curso, nunca enfileira', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.falar('explorando', 'oi');
  chamadas.length = 0;
  c.repetir();
  c.repetir();
  c.repetir();
  assert.equal(chamadas.length, 3);
  for (const { opts } of chamadas) assert.equal(opts?.interrupt, true);
});

test('repetir não dispara de novo o onEnd da fala original', () => {
  const { voz, chamadas } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  let fins = 0;
  c.falar('explorando', 'oi', { onEnd: () => (fins += 1) });
  chamadas.length = 0;
  c.repetir();
  assert.equal(chamadas[0].opts.onEnd, undefined);
  assert.equal(fins, 0);
});

test('reiniciar esquece as falas guardadas', () => {
  const { voz } = vozFalsa();
  const c = criarCoordenadorAtividade({ voz });
  c.falar('explorando', 'oi');
  c.reiniciar();
  assert.equal(c.estado().fala, null);
  assert.equal(c.repetir(), false);
});

test('botão habilitado só com fala guardada e voz ligada', () => {
  assert.equal(podeRepetirFala({ fala: null, vozLigada: true }), false);
  assert.equal(podeRepetirFala({ fala: 'oi', vozLigada: false }), false);
  assert.equal(podeRepetirFala({ fala: 'oi', vozLigada: true }), true);
});

// O runtime da aventura é único na sessão e não tem reinício: os dois casos
// da aventura ficam num teste só, na ordem em que a criança os vive.
test('aventura: repetir na pergunta não muda tentativas, apoios, etapa nem save; depois do acerto repete o objetivo', () => {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
  assert.equal(iniciarParqueComSede(), true);
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(coordenadorAtividade.estado().foco, 'pergunta');
  // uma tentativa errada antes, para o contador não estar em zero
  enviarEventoAventura({ tipo: 'respondeu', opcao: 'nao-existe' });

  const salvo = (s) =>
    JSON.stringify(Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')));
  const antes = aventuraRuntime.estado();
  const jogoAntes = salvo(useGame.getState());

  coordenadorAtividade.repetir();
  coordenadorAtividade.repetir();

  const depois = aventuraRuntime.estado();
  for (const campo of ['indice', 'tentativasEtapa', 'tentativasTotal', 'ajudas']) {
    assert.equal(depois.motor[campo], antes.motor[campo], campo);
  }
  assert.deepEqual(depois.painel, antes.painel);
  assert.equal(coordenadorAtividade.estado().foco, 'pergunta');
  assert.equal(salvo(useGame.getState()), jogoAntes);

  // Acertou: a pergunta sai do foco e a fala a repetir passa a ser o objetivo.
  enviarEventoAventura({ tipo: 'respondeu', opcao: 'agua' });
  assert.equal(coordenadorAtividade.estado().foco, 'em_missao');
  assert.equal(coordenadorAtividade.estado().fala, aventuraRuntime.estado().objetivo);
  coordenadorAtividade.reiniciar();
});
