import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

/**
 * REVELAÇÃO DA 6–7 NO RUNTIME, COM VOZ SIMULADA (speechSynthesis e
 * SpeechSynthesisUtterance de mentira; relógio simulado com mock.timers).
 *
 * Contrato (o mesmo da Carona): o 4 fica destacado enquanto a explicação
 * fala; "Pegue quatro saquinhos…" só começa depois do fim dela; sem voz, com
 * erro ou sem resposta do navegador, a carta fica à vista pelo tempo de
 * leitura e a aventura segue (no limite de segurança, se preciso); um fim
 * atrasado nunca avança outra etapa nem repete a coleta.
 */

const faladas = [];
const linha = []; // ordem de speak e cancel, como a voz do navegador recebe
globalThis.SpeechSynthesisUtterance = class {
  constructor(texto) {
    this.text = texto;
  }
};
const sinteseSimulada = {
  speak: (u) => {
    faladas.push(u);
    linha.push(`speak:${u.text}`);
  },
  cancel: () => linha.push('cancel'),
  getVoices: () => [],
  addEventListener: () => {},
};
globalThis.window = { speechSynthesis: sinteseSimulada };

const armazenado = new Map();
globalThis.localStorage = {
  getItem: (k) => (armazenado.has(k) ? armazenado.get(k) : null),
  setItem: (k, v) => armazenado.set(k, String(v)),
  removeItem: (k) => armazenado.delete(k),
};

mock.timers.enable({ apis: ['setTimeout'] });

const { useGame } = await import('../src/store/useGame.js');
const { coordenadorAtividade } = await import('../src/activity/index.js');
const { aventuraRuntime, enviarEventoAventura, iniciarHortaEscola } = await import(
  '../src/adventure/runtime.js'
);
const { LIMITE_ESPERA_FALA_MS, TEMPO_DE_LEITURA_MS } = await import(
  '../src/adventure/adventure-engine.js'
);
const { cartaoDistribuir, eventoDoCanteiro } = await import('../src/adventure/distribuir.js');
const { CHAVE_SAVE } = await import('../src/save.js');

const REVELACAO = 'Duas sementes em cada canteiro. Duas mais duas são quatro.';
const textos = () => faladas.map((u) => u.text);
const coletas = () => textos().filter((t) => t.startsWith('Pegue quatro saquinhos')).length;
const estado = () => aventuraRuntime.estado();
const avancos = () =>
  estado().eventos.filter((e) => e.evento === 'revelacao_seguiu').map((e) => e.dados.motivo);

function ateARevelacao({ voz = true } = {}) {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
  useGame.getState().setPreferencia('voz', voz);
  faladas.length = 0;
  linha.length = 0;
  assert.equal(iniciarHortaEscola('6-7', { random: () => 0.999 }), true);
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  assert.equal(estado().etapa, 'quantas-sementes');
  assert.deepEqual(estado().painel.opcoes.map((o) => o.id), ['4', '5', '6'], 'sorteio fixo');
  enviarEventoAventura({ tipo: 'respondeu', opcao: '5' });
  enviarEventoAventura({ tipo: 'respondeu', opcao: '6' });
  enviarEventoAventura({ tipo: 'respondeu', opcao: '5' });
  assert.equal(estado().painel.respostaRevelada, '4', 'o 4 destacado');
  return faladas.find((u) => u.text === REVELACAO) ?? null;
}

function encerrar() {
  // conclui a Horta em curso (o runtime é único por processo)
  for (let n = 0; n < 4; n += 1) enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < 2; canteiro += 1) {
      while (true) {
        const cartao = cartaoDistribuir(estado());
        if (!cartao || cartao.item !== item || cartao.canteiros[canteiro].cheio) break;
        enviarEventoAventura(eventoDoCanteiro(cartao, canteiro));
      }
    }
  }
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(estado().ativa, false, 'aventura encerrada');
}

// ------------------------------------------------- 1. voz ativa, fala longa

test('1. explicação de 6,5 s: o 4 fica destacado e a coleta só começa depois do fim', () => {
  const revelacao = ateARevelacao();
  assert.ok(revelacao, 'texto enviado à voz');
  assert.equal(linha[linha.indexOf(`speak:${REVELACAO}`) - 1], 'cancel', 'corta a fila antes');

  mock.timers.tick(TEMPO_DE_LEITURA_MS);
  assert.equal(estado().painel?.respostaRevelada, '4', 'aos 4,2 s, o 4 ainda à vista');
  assert.equal(coletas(), 0);
  mock.timers.tick(1800);
  assert.equal(estado().painel?.respostaRevelada, '4', 'aos 6 s, ainda à vista');
  assert.equal(coletas(), 0);

  mock.timers.tick(500);
  revelacao.onend({ type: 'end' }); // o navegador informou o fim aos 6,5 s
  assert.equal(estado().etapa, 'pegar-sementes');
  assert.equal(coletas(), 1, 'a coleta, uma vez');
  assert.deepEqual(avancos(), ['fim_da_fala']);
  mock.timers.tick(LIMITE_ESPERA_FALA_MS);
  assert.equal(coletas(), 1, 'o limite não repete a coleta');
  encerrar();
});

// ------------------------------------ 2. sem voz, erro ou sem resposta

test('2a. voz desligada: o 4 fica à vista pelo tempo de leitura e a aventura segue', () => {
  const revelacao = ateARevelacao({ voz: false });
  assert.equal(revelacao, null, 'nada enviado à voz');
  mock.timers.tick(TEMPO_DE_LEITURA_MS - 1);
  assert.equal(estado().painel?.respostaRevelada, '4');
  mock.timers.tick(1);
  assert.equal(estado().etapa, 'pegar-sementes');
  assert.deepEqual(avancos(), ['sem_voz']);
  encerrar();
});

test('2b. voz indisponível no navegador: tempo de leitura e segue', () => {
  delete globalThis.window.speechSynthesis;
  try {
    const revelacao = ateARevelacao();
    assert.equal(revelacao, null);
    mock.timers.tick(TEMPO_DE_LEITURA_MS);
    assert.equal(estado().etapa, 'pegar-sementes');
    assert.deepEqual(avancos(), ['sem_voz']);
    encerrar();
  } finally {
    globalThis.window.speechSynthesis = sinteseSimulada;
  }
});

test('2c. fala interrompida por erro: tempo de leitura e segue', () => {
  const revelacao = ateARevelacao();
  mock.timers.tick(900);
  revelacao.onerror({ type: 'error' }); // o navegador informou erro
  assert.equal(estado().painel?.respostaRevelada, '4', 'o 4 continua à vista');
  mock.timers.tick(TEMPO_DE_LEITURA_MS - 900);
  assert.equal(estado().etapa, 'pegar-sementes');
  assert.deepEqual(avancos(), ['erro']);
  assert.equal(coletas(), 1);
  encerrar();
});

test('2d. o navegador nunca responde: segue no limite de segurança', () => {
  ateARevelacao();
  mock.timers.tick(LIMITE_ESPERA_FALA_MS - 1);
  assert.equal(estado().etapa, 'quantas-sementes');
  assert.equal(coletas(), 0);
  mock.timers.tick(1);
  assert.equal(estado().etapa, 'pegar-sementes');
  assert.deepEqual(avancos(), ['limite']);
  encerrar();
});

// ------------------------------------------- 3. fim depois do limite

test('3. fim que chega depois do limite não avança outra etapa nem repete a coleta', () => {
  const revelacao = ateARevelacao();
  mock.timers.tick(LIMITE_ESPERA_FALA_MS);
  assert.equal(estado().etapa, 'pegar-sementes');
  assert.equal(coletas(), 1);

  revelacao.onend({ type: 'end' }); // chega atrasado
  revelacao.onerror({ type: 'error' });
  mock.timers.tick(LIMITE_ESPERA_FALA_MS);
  assert.equal(estado().etapa, 'pegar-sementes', 'continua na coleta');
  assert.equal(coletas(), 1, 'a instrução da coleta não se repete');
  assert.deepEqual(avancos(), ['limite'], 'um avanço só');
  encerrar();
});

// ------------------------------------------------ progresso salvo

test('a chave de faixa e o sorteio fixo não entram no progresso salvo', () => {
  ateARevelacao();
  mock.timers.tick(LIMITE_ESPERA_FALA_MS);
  encerrar();
  const gravado = JSON.parse(armazenado.get(CHAVE_SAVE));
  assert.equal(gravado.version, 8);
  assert.ok(!/faixa|6-7|random|sorteio/i.test(JSON.stringify(gravado.state)), 'nada de faixa no save');
});
