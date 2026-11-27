import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularZoomViewport,
  deveMostrarAvisoRetrato,
  ZOOM_MAXIMO,
  ZOOM_MINIMO_DESKTOP,
  ZOOM_MINIMO_TOQUE,
} from '../src/ui/responsive.js';

test('desktop amplo preserva o enquadramento aprovado', () => {
  assert.equal(
    calcularZoomViewport({ largura: 1920, altura: 1080 }),
    ZOOM_MAXIMO
  );
});
test('notebook baixo afasta a câmera sem perder legibilidade', () => {
  const zoom = calcularZoomViewport({ largura: 1366, altura: 768 });
  assert.ok(zoom < ZOOM_MAXIMO);
  assert.ok(zoom >= ZOOM_MINIMO_DESKTOP);
});

test('celular pequeno respeita o piso próprio para toque', () => {
  assert.equal(ZOOM_MINIMO_TOQUE, 11);
  assert.equal(
    calcularZoomViewport({ largura: 640, altura: 360, tactil: true }),
    11
  );
});

test('celular pequeno em retrato também respeita o piso de toque', () => {
  assert.equal(
    calcularZoomViewport({ largura: 360, altura: 800, tactil: true }),
    11
  );
});

test('tablet recebe mais detalhe que celular sem ultrapassar o teto', () => {
  const celular = calcularZoomViewport({ largura: 640, altura: 360, tactil: true });
  const tablet = calcularZoomViewport({ largura: 1180, altura: 820, tactil: true });
  assert.ok(tablet > celular);
  assert.ok(tablet <= ZOOM_MAXIMO);
});

test('dimensão ausente cai no zoom seguro', () => {
  assert.equal(calcularZoomViewport({ largura: 0, altura: 500 }), ZOOM_MAXIMO);
  assert.equal(calcularZoomViewport(), ZOOM_MAXIMO);
});

// ----- Aviso de virar o celular (A4.1) -----
// A orientação vem do matchMedia('(orientation: portrait)'), como no aviso do
// jogo: `retrato` é true/false, ou null quando o dado não existe.

test('abertura: celular (toque) em retrato mostra o aviso', () => {
  assert.equal(deveMostrarAvisoRetrato({ retrato: true, tactil: true, somenteToque: true }), true);
});

test('abertura: celular (toque) em paisagem não mostra', () => {
  assert.equal(deveMostrarAvisoRetrato({ retrato: false, tactil: true, somenteToque: true }), false);
});

test('abertura: desktop (sem toque) não mostra, nem em janela em pé', () => {
  assert.equal(deveMostrarAvisoRetrato({ retrato: true, tactil: false, somenteToque: true }), false);
  assert.equal(deveMostrarAvisoRetrato({ retrato: false, tactil: false, somenteToque: true }), false);
});

test('orientação desconhecida não mostra: falta de dado não trava a abertura', () => {
  for (const retrato of [null, undefined]) {
    assert.equal(deveMostrarAvisoRetrato({ retrato, tactil: true, somenteToque: true }), false);
    assert.equal(deveMostrarAvisoRetrato({ retrato, tactil: false, somenteToque: false }), false);
  }
});

test('jogo: comportamento de antes preservado (retrato mostra em qualquer aparelho)', () => {
  assert.equal(deveMostrarAvisoRetrato({ retrato: true, tactil: false }), true);
  assert.equal(deveMostrarAvisoRetrato({ retrato: true, tactil: true }), true);
  assert.equal(deveMostrarAvisoRetrato({ retrato: false, tactil: true }), false);
});
