/**
 * R1 — recarga única quando uma parte do jogo some depois de uma promoção.
 *
 * Uma aba aberta antes da promoção guarda o index.html antigo; ao tocar em
 * JOGAR, ela pede o GameExperience do hash antigo, que não existe mais. O
 * Vite dispara `vite:preloadError`. Recarregar UMA vez traz o index.html
 * novo. A trava (marca no sessionStorage) impede repetição infinita: sem
 * conseguir gravar a marca, não recarrega.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHAVE_RECARGA,
  JANELA_RECARGA_MS,
  deveRecarregar,
  instalarRecargaDeVersao,
} from '../src/recarga-versao.js';

function storageFalso(inicial = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
  };
}

function janelaFalsa(storage) {
  const ouvintes = {};
  const janela = {
    recargas: 0,
    addEventListener: (tipo, fn) => {
      ouvintes[tipo] = fn;
    },
    location: {
      reload: () => {
        janela.recargas += 1;
      },
    },
    disparar(tipo) {
      const evento = {
        impedido: false,
        preventDefault() {
          this.impedido = true;
        },
      };
      ouvintes[tipo]?.(evento);
      return evento;
    },
  };
  Object.defineProperty(janela, 'sessionStorage', {
    get: () => {
      if (storage instanceof Error) throw storage;
      return storage;
    },
  });
  return janela;
}

const AGORA = 1_000_000_000;

test('sem marca: recarrega e grava a marca', () => {
  const s = storageFalso();
  assert.equal(deveRecarregar({ sessionStorage: s }, AGORA), true);
  assert.equal(s.getItem(CHAVE_RECARGA), String(AGORA));
});

test('marca recente: não recarrega e não mexe na marca', () => {
  const marca = String(AGORA - 3000);
  const s = storageFalso({ [CHAVE_RECARGA]: marca });
  assert.equal(deveRecarregar({ sessionStorage: s }, AGORA), false);
  assert.equal(s.getItem(CHAVE_RECARGA), marca);
});

test('marca antiga: recarrega de novo e atualiza a marca', () => {
  const s = storageFalso({ [CHAVE_RECARGA]: String(AGORA - JANELA_RECARGA_MS - 1) });
  assert.equal(deveRecarregar({ sessionStorage: s }, AGORA), true);
  assert.equal(s.getItem(CHAVE_RECARGA), String(AGORA));
});

test('storage que lança erro na leitura ou na gravação: não recarrega', () => {
  const lerFalha = {
    getItem: () => {
      throw new Error('bloqueado');
    },
    setItem: () => {},
  };
  const gravarFalha = {
    getItem: () => null,
    setItem: () => {
      throw new Error('cota');
    },
  };
  assert.equal(deveRecarregar({ sessionStorage: lerFalha }, AGORA), false);
  assert.equal(deveRecarregar({ sessionStorage: gravarFalha }, AGORA), false);
  assert.equal(deveRecarregar({}, AGORA), false, 'sem sessionStorage');
  assert.equal(deveRecarregar(janelaFalsa(new Error('SecurityError')), AGORA), false);
});

test('ouvinte: a primeira falha recarrega uma vez; a seguinte deixa o erro seguir', () => {
  const janela = janelaFalsa(storageFalso());
  instalarRecargaDeVersao(janela);

  const primeiro = janela.disparar('vite:preloadError');
  assert.equal(primeiro.impedido, true, 'segura o erro enquanto recarrega');
  assert.equal(janela.recargas, 1);

  // Pré-carga e lazy pedem o mesmo arquivo: o segundo evento chega logo depois.
  const segundo = janela.disparar('vite:preloadError');
  assert.equal(segundo.impedido, false, 'não segura o erro de novo');
  assert.equal(janela.recargas, 1, 'nunca recarrega duas vezes seguidas');
});

test('ouvinte: sessionStorage inacessível não recarrega nem segura o erro', () => {
  const janela = janelaFalsa(new Error('SecurityError'));
  instalarRecargaDeVersao(janela);
  const evento = janela.disparar('vite:preloadError');
  assert.equal(evento.impedido, false);
  assert.equal(janela.recargas, 0);
});

test('main.jsx instala o ouvinte antes de montar o App', () => {
  const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const instala = main.indexOf('instalarRecargaDeVersao(window)');
  assert.ok(instala > 0, 'main.jsx chama instalarRecargaDeVersao(window)');
  assert.ok(instala < main.indexOf('createRoot('), 'antes do createRoot');
});
