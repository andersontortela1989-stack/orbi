import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { encerrarChegadaVivaAposFala } from '../src/missions/visita-livre.js';

function criarRelogioFalso() {
  let agora = 0;
  let proximoId = 1;
  const fila = new Map();
  return {
    setTimeout(fn, ms) {
      const id = proximoId++;
      fila.set(id, { fn, quando: agora + ms });
      return id;
    },
    clearTimeout(id) {
      fila.delete(id);
    },
    avancar(ms) {
      agora += ms;
      for (const [id, item] of [...fila.entries()]) {
        if (item.quando <= agora) {
          fila.delete(id);
          item.fn();
        }
      }
    },
  };
}

test('chegada viva: explicacao longa (Shopping/Sitio) nao corta aos 2,2 s e so fecha ao fim da fala', () => {
  const relogio = criarRelogioFalso();
  let fechou = 0;
  let onEndRecebido = null;

  encerrarChegadaVivaAposFala({
    texto: 'Isso! Na loja de brinquedos tem ursinhos e jogos!',
    falar: (_texto, opts) => {
      assert.equal(opts.interrupt, true);
      onEndRecebido = opts.onEnd;
      return true;
    },
    aoFechar: () => { fechou += 1; },
    minimoMs: 2200,
    limiteMs: 9000,
    relogio,
  });

  relogio.avancar(2200);
  assert.equal(fechou, 0, 'nao pode fechar antes de a fala terminar');

  relogio.avancar(1800);
  assert.equal(fechou, 0);

  onEndRecebido({ type: 'end' });
  assert.equal(fechou, 1, 'fecha assim que a explicacao termina apos o minimo');
});

test('chegada viva: fala curta ou sem voz respeita o tempo minimo de leitura', () => {
  const relogio = criarRelogioFalso();
  let fechou = 0;

  encerrarChegadaVivaAposFala({
    texto: 'Isso! A abelha faz mel pertinho das flores!',
    falar: () => false,
    aoFechar: () => { fechou += 1; },
    minimoMs: 2200,
    limiteMs: 9000,
    relogio,
  });

  relogio.avancar(2199);
  assert.equal(fechou, 0);
  relogio.avancar(1);
  assert.equal(fechou, 1);
});

test('chegada viva: teto de seguranca evita travamento e ChegadaVivaPanel usa a espera', () => {
  const relogio = criarRelogioFalso();
  let fechou = 0;
  let onEndRecebido = null;

  encerrarChegadaVivaAposFala({
    texto: 'E o cavalo! O cavalo vive no pasto do sitio!',
    falar: (_texto, opts) => {
      onEndRecebido = opts.onEnd;
      return true;
    },
    aoFechar: () => { fechou += 1; },
    minimoMs: 2200,
    limiteMs: 9000,
    relogio,
  });

  relogio.avancar(9000);
  assert.equal(fechou, 1);
  onEndRecebido({ type: 'end' });
  assert.equal(fechou, 1, 'onEnd tardio nao fecha duas vezes');

  const painel = fs.readFileSync(new URL('../src/components/ChegadaVivaPanel.jsx', import.meta.url), 'utf8');
  assert.match(painel, /encerrarChegadaVivaAposFala/);
});