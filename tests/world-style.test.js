import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_2_5D, perfilVisual } from '../src/visual/world-style.js';

test('câmera 2,5D revela os dois eixos laterais do mundo', () => {
  const [x, y, z] = CAMERA_2_5D.offset;
  assert.ok(x > 0);
  assert.ok(z > 0);
  assert.ok(y > Math.max(x, z));
  assert.ok(y < x + z);
});

test('perfil normal preserva vida ambiental sem obrigar partículas', () => {
  const perfil = perfilVisual({
    modoTranquilo: false,
    animacoes: true,
    detalhesVisuais: true,
  });
  assert.equal(perfil.animacoes, true);
  assert.equal(perfil.detalhes, true);
  assert.equal(perfil.particulas, true);
  assert.ok(perfil.brilhoJanela > 0.5);
});

test('Modo Tranquilo reduz movimento, detalhes e brilho de forma atômica', () => {
  const perfil = perfilVisual({
    modoTranquilo: true,
    animacoes: true,
    detalhesVisuais: true,
  });
  assert.equal(perfil.animacoes, false);
  assert.equal(perfil.detalhes, false);
  assert.equal(perfil.particulas, false);
  assert.equal(perfil.velocidadeAmbiente, 0);
  assert.ok(perfil.brilhoJanela < 0.3);
});
