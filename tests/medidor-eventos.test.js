import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  JANELA_EVENTO_MS,
  criarRegistroDeMarcas,
  estadoIncremental,
  eventosDoPico,
  instalarSonda,
  registrarQuadro,
  tarefasDoPico,
  textoEventos,
  textoPicos,
} from '../src/perf/medidor.js';
import { ligarSonda, marcar } from '../src/perf/sonda.js';

/**
 * M1b — QUAL evento acompanha cada pico: marcas de eventos conhecidos (chegada,
 * pergunta, fala, voz...) nos 150 ms antes do quadro lento e as tarefas longas
 * do navegador sobrepostas a ele. Só com `?medir=1`.
 */

// Quadro lento de 200 ms que TERMINA em t = 1000 (ocupa 800..1000); a janela
// de eventos vai de 650 (150 ms antes do início) até 1000.
const PICO = { duracao: 200, momentoMs: 61000, atividade: 'pergunta', agoraMs: 1000 };

test('janela de 150 ms', () => {
  assert.equal(JANELA_EVENTO_MS, 150);
});

test('evento dentro da janela é associado ao pico, na ordem em que aconteceu', () => {
  const marcas = [
    { nome: 'fora-antes', t: 640 },
    { nome: 'chegada', t: 660 },
    { nome: 'pergunta', t: 900 },
    { nome: 'fala', t: 1000 },
    { nome: 'fora-depois', t: 1001 },
  ];
  assert.deepEqual(eventosDoPico(PICO, marcas), ['chegada', 'pergunta', 'fala']);
});

test('nenhum evento fora da janela', () => {
  assert.deepEqual(eventosDoPico(PICO, [{ nome: 'a', t: 649.9 }, { nome: 'b', t: 1000.1 }]), []);
  assert.deepEqual(eventosDoPico({ ...PICO, agoraMs: null }, [{ nome: 'a', t: 900 }]), []);
});

test('tarefas longas sobrepostas ao quadro lento', () => {
  const tarefas = [
    { inicio: 700, duracao: 90 }, // 700..790: antes do quadro (800..1000)
    { inicio: 780, duracao: 60 }, // 780..840: sobrepõe
    { inicio: 950, duracao: 210 }, // 950..1160: sobrepõe
    { inicio: 1001, duracao: 80 }, // depois
  ];
  assert.deepEqual(tarefasDoPico(PICO, tarefas), [60, 210]);
});

test('sem ?medir=1 nada é marcado', () => {
  ligarSonda(null);
  const registro = criarRegistroDeMarcas(() => 0);
  assert.equal(instalarSonda('', registro), false);
  assert.equal(instalarSonda('?estilo=real', registro), false);
  marcar('chegada');
  assert.deepEqual(registro.lista(), []);

  let t = 0;
  const ligado = criarRegistroDeMarcas(() => (t += 10));
  assert.equal(instalarSonda('?medir=1', ligado), true);
  marcar('chegada');
  marcar('fala');
  assert.deepEqual(ligado.lista(), [{ nome: 'chegada', t: 10 }, { nome: 'fala', t: 20 }]);
  ligarSonda(null);
});

test('registro de marcas tem teto: guarda as mais recentes', () => {
  let t = 0;
  const registro = criarRegistroDeMarcas(() => (t += 1), 5);
  for (let i = 0; i < 8; i += 1) registro.marcar(`e${i}`);
  assert.deepEqual(registro.lista().map((m) => m.nome), ['e3', 'e4', 'e5', 'e6', 'e7']);
});

test('resumo antigo idêntico: as listas da M1 não mudam com o horário guardado', () => {
  const e = estadoIncremental();
  registrarQuadro(e, 100, 100, 'explorando', 100); // aquecimento
  registrarQuadro(e, 146.2, 100, 'pergunta', 246.2);
  registrarQuadro(e, 55, 100, 'em_missao', 301.2);
  assert.equal(e.picos[0].agoraMs, 246.2);
  assert.equal(textoPicos(e), [
    'picos (5 maiores, depois do aquecimento):',
    '  146,2 ms · 00:00 · pergunta',
    '  55,0 ms · 00:00 · em_missao',
    'acima de 50 ms por atividade: pergunta 1 · em_missao 1',
  ].join('\n'));
});

test('bloco novo: eventos e tarefas por pico, e o total de tarefas longas', () => {
  const e = estadoIncremental();
  registrarQuadro(e, 100, 100, 'explorando', 100);
  registrarQuadro(e, 200, 100, 'pergunta', 1000);
  registrarQuadro(e, 60, 100, 'em_missao', 2000);
  const texto = textoEventos(e, {
    marcas: [{ nome: 'pergunta', t: 900 }, { nome: 'voz-speak', t: 950 }],
    tarefas: [{ inicio: 950, duracao: 210 }, { inicio: 5000, duracao: 70 }],
    longtaskSuportado: true,
  });
  assert.equal(texto, [
    'eventos por pico (150 ms antes do quadro lento):',
    '  200,0 ms · 00:00 · pergunta: pergunta, voz-speak · tarefa longa 210,0 ms',
    '  60,0 ms · 00:00 · em_missao: nenhum',
    'tarefas longas: 2 (maior 210,0 ms)',
  ].join('\n'));
});

test('navegador sem longtask: o resumo diz isso', () => {
  const e = estadoIncremental();
  const texto = textoEventos(e, { marcas: [], tarefas: [], longtaskSuportado: false });
  assert.equal(texto, [
    'eventos por pico (150 ms antes do quadro lento): nenhum pico',
    'tarefas longas: não suportado neste navegador',
  ].join('\n'));
});
