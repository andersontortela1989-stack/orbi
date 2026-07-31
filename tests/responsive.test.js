import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularZoomViewport,
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
  assert.equal(
    calcularZoomViewport({ largura: 640, altura: 360, tactil: true }),
    ZOOM_MINIMO_TOQUE
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
