import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ROTAS_FASE,
  caminhoDaFase,
  registrarEtapaFunil,
} from '../src/perf/funil.js';

test('funil: mapeia fases conhecidas e preserva query string e hash', () => {
  assert.equal(ROTAS_FASE.abertura, '/');
  assert.equal(ROTAS_FASE.intro, '/historia');
  assert.equal(ROTAS_FASE.jogo, '/jogar');
  assert.equal(caminhoDaFase('jogo', '?medir=1&faixa=6-7', '#topo'), '/jogar?medir=1&faixa=6-7#topo');
  assert.equal(caminhoDaFase('desconhecida', '?estilo=real'), '/?estilo=real');
});

test('funil: chama pushState ao entrar em intro/jogo e evita duplicar quando já está na rota', () => {
  const chamadas = [];
  const win = {
    location: { pathname: '/', search: '?medir=1', hash: '' },
    history: {
      pushState(_s, _t, url) {
        chamadas.push(['push', url]);
        win.location.pathname = url.split('?')[0];
      },
      replaceState(_s, _t, url) {
        chamadas.push(['replace', url]);
        win.location.pathname = url.split('?')[0];
      },
    },
  };

  assert.equal(registrarEtapaFunil('abertura', win), false);
  assert.equal(registrarEtapaFunil('intro', win), true);
  assert.equal(registrarEtapaFunil('intro', win), false);
  assert.equal(registrarEtapaFunil('jogo', win), true);
  assert.equal(registrarEtapaFunil('abertura', win), true);

  assert.deepEqual(chamadas, [
    ['push', '/historia?medir=1'],
    ['push', '/jogar?medir=1'],
    ['replace', '/?medir=1'],
  ]);
});

test('funil: ignora com segurança quando window/history não existem ou lançam erro', () => {
  assert.equal(registrarEtapaFunil('jogo', null), false);
  const restrito = {
    location: { pathname: '/', search: '', hash: '' },
    history: {
      pushState() { throw new Error('SecurityError'); },
    },
  };
  assert.equal(registrarEtapaFunil('jogo', restrito), false);
});

test('vercel.json: mantém rewrite SPA para /jogar e /historia não retornarem 404', () => {
  const cfg = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.ok(Array.isArray(cfg.rewrites));
  assert.ok(
    cfg.rewrites.some((r) => r.source === '/(.*)' && r.destination === '/index.html'),
    'rewrite SPA presente'
  );
});
