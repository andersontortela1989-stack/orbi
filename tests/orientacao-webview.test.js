import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehNavegadorEmbutido, tentarGirarPaisagem } from '../src/ui/orientacao.js';

test('orientação: detecta navegadores embutidos (Threads, Instagram, LinkedIn) e libera Chrome/Safari', () => {
  assert.equal(ehNavegadorEmbutido('Mozilla/5.0 (Linux; Android 14) Barcelona/340.0'), true);
  assert.equal(ehNavegadorEmbutido('Mozilla/5.0 (iPhone) Instagram 310.0'), true);
  assert.equal(ehNavegadorEmbutido('Mozilla/5.0 LinkedInApp'), true);
  assert.equal(ehNavegadorEmbutido('Mozilla/5.0 (Linux; Android 14) Chrome/126.0 Mobile Safari/537.36'), false);
  assert.equal(ehNavegadorEmbutido('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1'), false);
});

test('orientação: tentarGirarPaisagem aciona fullscreen + lock quando suportado e falha com calma quando bloqueado', async () => {
  const chamadas = [];
  const winOk = {
    screen: {
      orientation: {
        async lock(modo) { chamadas.push('lock:' + modo); },
      },
    },
  };
  const docOk = {
    fullscreenElement: null,
    documentElement: {
      async requestFullscreen() { chamadas.push('fullscreen'); },
    },
  };
  const resOk = await tentarGirarPaisagem(winOk, docOk);
  assert.equal(resOk.ok, true);
  assert.deepEqual(chamadas, ['fullscreen', 'lock:landscape']);

  const winBloq = {
    screen: {
      orientation: {
        async lock() { throw new Error('NotSupportedError'); },
      },
    },
  };
  const resBloq = await tentarGirarPaisagem(winBloq, { fullscreenElement: null, documentElement: {} });
  assert.equal(resBloq.ok, false);
});
