import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  criarRegistroDeMarcas,
  estadoIncremental,
  instalarSonda,
  registrarQuadro,
  textoEventos,
  textoPicos,
} from '../src/perf/medidor.js';
import { ligarSonda, marcar, sondaLigada } from '../src/perf/sonda.js';
import { storageSeguro } from '../src/save.js';

/**
 * M1c — marcas de SAVE (duração e tamanho do texto gravado), MOEDA e SOM, só
 * com a sonda ligada (`?medir=1`). O save é gravado a cada mudança da store
 * (cerca de 2 vezes por segundo dirigindo): por isso ele tem contadores
 * próprios, fora da lista de marcas, e a janela de cada pico é capturada NO
 * MOMENTO em que o quadro lento é detectado.
 */

function storageFalso() {
  const mapa = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  };
  return mapa;
}

test('sonda: ligada só depois de instalada; marcar repassa os dados', () => {
  ligarSonda(null);
  assert.equal(sondaLigada(), false);
  const vistos = [];
  ligarSonda((nome, dados) => vistos.push([nome, dados]));
  assert.equal(sondaLigada(), true);
  marcar('save', { ms: 1.5, caracteres: 10 });
  marcar('moeda');
  assert.deepEqual(vistos, [['save', { ms: 1.5, caracteres: 10 }], ['moeda', undefined]]);
  ligarSonda(null);
});

test('save: com a sonda ligada, marca duração e caracteres do texto gravado', () => {
  const mapa = storageFalso();
  const vistos = [];
  ligarSonda((nome, dados) => vistos.push([nome, dados]));
  const valor = { state: { moedas: 3 }, version: 8 };
  storageSeguro.setItem('chave', valor);
  ligarSonda(null);

  const texto = JSON.stringify(valor);
  assert.equal(mapa.get('chave'), texto, 'o texto gravado não muda');
  assert.equal(vistos.length, 1);
  assert.equal(vistos[0][0], 'save');
  assert.equal(vistos[0][1].caracteres, texto.length);
  assert.ok(Number.isFinite(vistos[0][1].ms) && vistos[0][1].ms >= 0);
});

test('save: sem ?medir=1 grava igual, não marca e não lê o relógio', () => {
  const mapa = storageFalso();
  ligarSonda(null);
  const registro = criarRegistroDeMarcas(() => 0);
  assert.equal(instalarSonda('', registro), false);

  const original = performance.now;
  let leituras = 0;
  performance.now = () => {
    leituras += 1;
    return 0;
  };
  try {
    storageSeguro.setItem('chave', { state: { moedas: 3 }, version: 8 });
  } finally {
    performance.now = original;
  }
  assert.equal(leituras, 0, 'nenhuma medição de tempo');
  assert.equal(mapa.get('chave'), '{"state":{"moedas":3},"version":8}');
  assert.deepEqual(registro.lista(), []);
  assert.deepEqual(registro.saves(), { total: 0, maiorMs: 0, caracteres: 0 });
});

test('registro: save vai para os contadores próprios, não para a lista de marcas', () => {
  let t = 0;
  const registro = criarRegistroDeMarcas(() => (t += 10));
  registro.marcar('moeda');
  registro.marcar('save', { ms: 2, caracteres: 300 });
  registro.marcar('save', { ms: 7.5, caracteres: 320 });
  registro.marcar('save', { ms: 1, caracteres: 340 });
  registro.marcar('som:moeda');
  assert.deepEqual(registro.lista().map((m) => m.nome), ['moeda', 'som:moeda']);
  assert.deepEqual(registro.saves(), { total: 3, maiorMs: 7.5, caracteres: 320 });
});

test('janela do pico: eventos, quantidade de gravações e duração somada', () => {
  let t = 0;
  const registro = criarRegistroDeMarcas(() => t);
  t = 600; registro.marcar('save', { ms: 9, caracteres: 300 }); // fora (antes de 650)
  t = 700; registro.marcar('pergunta');
  t = 820; registro.marcar('save', { ms: 12, caracteres: 300 });
  t = 830; registro.marcar('som:sucesso');
  t = 900; registro.marcar('save', { ms: 20.5, caracteres: 300 });
  // quadro de 200 ms que termina em 1000: janela 650..1000
  assert.deepEqual(registro.janela({ duracao: 200, agoraMs: 1000 }), {
    eventos: ['pergunta', 'som:sucesso'],
    saves: 2,
    savesMs: 32.5,
  });
});

test('600 gravações antes de um pico não apagam os eventos da janela desse pico', () => {
  let t = 0;
  const registro = criarRegistroDeMarcas(() => t);
  const e = estadoIncremental();
  registrarQuadro(e, 100, 100, 'explorando', 100, registro.janela); // aquecimento

  t = 700; registro.marcar('pergunta');
  for (let i = 0; i < 600; i += 1) {
    t = 701 + i * 0.1;
    registro.marcar('save', { ms: 0.1, caracteres: 300 });
  }
  t = 800; registro.marcar('som:sucesso');
  t = 1000;
  registrarQuadro(e, 200, 100, 'pergunta', 1000, registro.janela);

  // depois do pico, mais de 500 marcas de outro tipo estouram o teto da lista
  for (let i = 0; i < 700; i += 1) {
    t = 2000 + i;
    registro.marcar('moeda');
  }
  assert.equal(registro.lista().length, 500);
  assert.deepEqual(e.picos[0].janela.eventos, ['pergunta', 'som:sucesso']);
  assert.ok(e.picos[0].janela.saves > 0);

  const texto = textoEventos(e, { marcas: registro.lista(), saves: registro.saves() });
  assert.match(texto, /200,0 ms · 00:00 · pergunta: pergunta, som:sucesso · /);
});

test('resumo: linhas antigas idênticas e as linhas novas do save', () => {
  let t = 0;
  const registro = criarRegistroDeMarcas(() => t);
  const e = estadoIncremental();
  registrarQuadro(e, 100, 100, 'explorando', 100, registro.janela);
  t = 900; registro.marcar('pergunta');
  t = 950; registro.marcar('save', { ms: 12, caracteres: 318 });
  t = 960; registro.marcar('save', { ms: 20.5, caracteres: 321 });
  registrarQuadro(e, 200, 100, 'pergunta', 1000, registro.janela);
  t = 1900; registro.marcar('moeda');
  registrarQuadro(e, 60, 100, 'em_missao', 2000, registro.janela);

  assert.equal(textoPicos(e), [
    'picos (5 maiores, depois do aquecimento):',
    '  200,0 ms · 00:00 · pergunta',
    '  60,0 ms · 00:00 · em_missao',
    'acima de 50 ms por atividade: pergunta 1 · em_missao 1',
  ].join('\n'));

  const texto = textoEventos(e, {
    marcas: registro.lista(),
    tarefas: [],
    longtaskSuportado: true,
    saves: registro.saves(),
  });
  assert.equal(texto, [
    'eventos por pico (150 ms antes do quadro lento):',
    '  200,0 ms · 00:00 · pergunta: pergunta · save 2× (soma 32,5 ms)',
    '  60,0 ms · 00:00 · em_missao: moeda',
    'tarefas longas: 0',
    'gravações do save: 2 (maior 20,5 ms, 321 caracteres)',
  ].join('\n'));
});

test('resumo: sem gravação nenhuma, a linha diz zero', () => {
  const e = estadoIncremental();
  const texto = textoEventos(e, { longtaskSuportado: true, saves: { total: 0, maiorMs: 0, caracteres: 0 } });
  assert.equal(texto, [
    'eventos por pico (150 ms antes do quadro lento): nenhum pico',
    'tarefas longas: 0',
    'gravações do save: 0',
  ].join('\n'));
});

test('som: cada som marca o seu nome; a criação do contexto marca som:contexto', async () => {
  const no = () => ({ connect() {}, start() {}, stop() {} });
  const rampa = { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
  class ContextoFalso {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
    }
    createOscillator() {
      return { ...no(), frequency: rampa };
    }
    createGain() {
      return { ...no(), gain: rampa };
    }
  }
  storageFalso();
  globalThis.window = { AudioContext: ContextoFalso };
  const sons = await import('../src/audio/sons.js');

  const vistos = [];
  ligarSonda((nome) => vistos.push(nome));
  sons.somMoeda();
  sons.somSucesso();
  sons.somNeutro();
  sons.somTique();
  sons.somBuzina();
  ligarSonda(null);
  delete globalThis.window;

  assert.deepEqual(vistos, [
    'som:moeda',
    'som:contexto',
    'som:sucesso',
    'som:neutro',
    'som:tique',
    'som:buzina',
  ]);
});

test('moeda: a coleta da rua marca "moeda" junto de ganharMoeda(1)', () => {
  // Moedas.jsx é um componente do R3F (não roda no node:test): confere a fonte.
  const fonte = readFileSync(new URL('../src/components/Moedas.jsx', import.meta.url), 'utf8');
  assert.match(fonte, /ganharMoeda\(1\);\s*marcar\('moeda'\)/);
});
