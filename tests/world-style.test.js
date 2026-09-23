import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CAMERA_2_5D,
  ZINDEX_BALAO_MUNDO,
  ZINDEX_PISO_HUD,
  perfilVisual,
} from '../src/visual/world-style.js';

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

const CSS = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

/** z-index declarado dentro do bloco de um seletor de topo do styles.css. */
function zIndexDe(seletor) {
  const bloco = CSS.match(new RegExp(`^\\${seletor} \\{([^}]*)\\}`, 'm'));
  const achado = bloco?.[1].match(/z-index:\s*(\d+)/);
  return achado ? Number(achado[1]) : null;
}

test('balão do mundo fica sempre abaixo do HUD', () => {
  const [teto, base] = ZINDEX_BALAO_MUNDO;
  assert.ok(teto < ZINDEX_PISO_HUD, 'o teto do balão não alcança o piso do HUD');
  assert.ok(base >= 0 && base < teto, 'o intervalo é decrescente e não negativo');

  // O piso declarado tem de bater com o CSS de verdade — é isso que faz a
  // constante valer alguma coisa no dia em que alguém mexer no HUD.
  assert.equal(zIndexDe('.hud'), ZINDEX_PISO_HUD, '.hud mudou de camada');
  assert.equal(
    zIndexDe('.mission-banner'),
    ZINDEX_PISO_HUD,
    '.mission-banner mudou de camada (é ele que mostra CHEGAMOS!)'
  );
});
