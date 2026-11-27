import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criarEsperaDaFala } from '../src/adventure/espera-fala.js';

/**
 * ESPERA DA FALA — o contrato da Carona (Carona.jsx, `entregar`): espera o
 * `end` da voz e conclui UMA vez, com um temporizador de reserva. Aqui, com
 * um mínimo (tempo de leitura: a carta certa fica à vista) e um limite de
 * segurança. Relógio simulado (mock.timers).
 */

mock.timers.enable({ apis: ['setTimeout'] });

const MINIMO = 4200;
const LIMITE = 10000;

function nova() {
  const avancos = [];
  const espera = criarEsperaDaFala({
    minimoMs: MINIMO,
    limiteMs: LIMITE,
    aoAvancar: (motivo) => avancos.push(motivo),
  });
  return { espera, avancos };
}

test('fala mais longa que 4,2 s: espera o fim, avança uma vez', () => {
  const { espera, avancos } = nova();
  mock.timers.tick(MINIMO);
  assert.deepEqual(avancos, [], 'aos 4,2 s ainda fala');
  mock.timers.tick(2300);
  espera.falaTerminou('fim_da_fala');
  assert.deepEqual(avancos, ['fim_da_fala']);
  mock.timers.tick(LIMITE);
  assert.deepEqual(avancos, ['fim_da_fala'], 'o limite não avança de novo');
});

test('fala curta: fica no tempo de leitura e só então avança', () => {
  const { espera, avancos } = nova();
  mock.timers.tick(1500);
  espera.falaTerminou('fim_da_fala');
  assert.deepEqual(avancos, []);
  mock.timers.tick(MINIMO - 1500);
  assert.deepEqual(avancos, ['fim_da_fala']);
});

test('sem voz (desligada ou indisponível): tempo de leitura e segue', () => {
  const { espera, avancos } = nova();
  espera.falaTerminou('sem_voz');
  mock.timers.tick(MINIMO - 1);
  assert.deepEqual(avancos, []);
  mock.timers.tick(1);
  assert.deepEqual(avancos, ['sem_voz']);
});

test('fala interrompida por erro: tempo de leitura e segue, com o motivo', () => {
  const { espera, avancos } = nova();
  mock.timers.tick(800);
  espera.falaTerminou('erro');
  mock.timers.tick(MINIMO - 800);
  assert.deepEqual(avancos, ['erro']);
});

test('o navegador nunca responde: segue no limite de segurança', () => {
  const { avancos } = nova();
  mock.timers.tick(LIMITE - 1);
  assert.deepEqual(avancos, []);
  mock.timers.tick(1);
  assert.deepEqual(avancos, ['limite']);
});

test('fim que chega depois do limite não avança de novo', () => {
  const { espera, avancos } = nova();
  mock.timers.tick(LIMITE);
  espera.falaTerminou('fim_da_fala');
  espera.falaTerminou('erro');
  mock.timers.tick(LIMITE);
  assert.deepEqual(avancos, ['limite']);
});

test('cancelada (a aventura acabou): nunca avança', () => {
  const { espera, avancos } = nova();
  espera.cancelar();
  espera.falaTerminou('fim_da_fala');
  mock.timers.tick(LIMITE * 2);
  assert.deepEqual(avancos, []);
});

test('relógio padrão funciona com o setTimeout estrito do navegador', () => {
  // No navegador, setTimeout/clearTimeout nativos lançam "Illegal invocation"
  // se chamados como método de outro objeto (conferência de 19/11: a
  // revelação parou no meio). O Node não reclama; aqui imitamos o navegador.
  const originais = { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
  const estrito = (fn) =>
    function (...args) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
      return fn(...args);
    };
  globalThis.setTimeout = estrito(originais.setTimeout);
  globalThis.clearTimeout = estrito(originais.clearTimeout);
  try {
    const avancos = [];
    const espera = criarEsperaDaFala({ minimoMs: MINIMO, limiteMs: LIMITE, aoAvancar: (m) => avancos.push(m) });
    espera.falaTerminou('fim_da_fala');
    mock.timers.tick(MINIMO);
    assert.deepEqual(avancos, ['fim_da_fala']);
    criarEsperaDaFala({ minimoMs: MINIMO, limiteMs: LIMITE, aoAvancar: () => {} }).cancelar();
  } finally {
    globalThis.setTimeout = originais.setTimeout;
    globalThis.clearTimeout = originais.clearTimeout;
  }
});

test('o runtime usa a espera da fala na revelação', () => {
  const runtime = readFileSync(new URL('../src/adventure/runtime.js', import.meta.url), 'utf8');
  assert.match(runtime, /criarEsperaDaFala\(/);
});
