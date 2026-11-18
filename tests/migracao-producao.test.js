import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAVE_SAVE, SAVE_VERSION } from '../src/save.js';

/**
 * MIGRAÇÃO DA PRODUÇÃO — o save que está hoje no aparelho de quem joga em
 * produção (origin/main, SAVE_VERSION 6) abre na versão desta branch sem
 * perder nada. Passa pela store REAL (persist + migrate + merge), não só pela
 * função pura: cada caso carrega uma instância nova de useGame.js com o save
 * já no localStorage, como num reload.
 *
 * Formato copiado de `git show origin/main:src/store/useGame.js` (partialize)
 * e `origin/main:src/save.js` (SAVE_VERSION = 6): 11 chaves de topo,
 * 7 habilidades e 5 categorias de descobertas.
 */

const armazenado = new Map();
globalThis.localStorage = {
  getItem: (k) => (armazenado.has(k) ? armazenado.get(k) : null),
  setItem: (k, v) => armazenado.set(k, String(v)),
  removeItem: (k) => armazenado.delete(k),
};

let caso = 0;
/** Grava o texto bruto do save e carrega uma store nova, como num reload. */
async function abrirCom(save) {
  armazenado.clear();
  armazenado.set(CHAVE_SAVE, JSON.stringify(save));
  caso += 1;
  const url = new URL(`../src/store/useGame.js?migracao=${caso}`, import.meta.url);
  const { useGame } = await import(url.href);
  return useGame;
}

const lido = () => JSON.parse(armazenado.get(CHAVE_SAVE));

// Save v6 completo, como o persist de origin/main grava (nome com acento,
// descobertas nas 5 categorias, cor comprada, missão em andamento).
const SAVE_V6 = {
  state: {
    nome: 'Joaquim Ângelo',
    introVista: true,
    veiculo: 'carro',
    desbloqueados: ['carro'],
    moedas: 37,
    combustivel: 62.5,
    corCarro: 'ceu',
    coresCompradas: ['coral', 'ceu'],
    missao: { tipo: 'gps', destino: 'PADARIA', concluida: false },
    habilidades: {
      leituraGlobal: { acertos: 9, tentativas: 11 },
      contagem: { acertos: 6, tentativas: 8 },
      adicao: { acertos: 2, tentativas: 2 },
      navegacao: { acertos: 14, tentativas: 14 },
      cienciasVida: { acertos: 4, tentativas: 5 },
      cores: { acertos: 3, tentativas: 4 },
      geografia: { acertos: 1, tentativas: 3 },
    },
    descobertas: {
      lugares: ['PADARIA', 'VET', 'ESTÁDIO'],
      animais: ['GATO', 'CACHORRO'],
      frutas: ['MAÇÃ', 'BANANA'],
      contagens: ['3', '5'],
      paises: ['BRASIL', 'ARGENTINA'],
    },
  },
  version: 6,
};

test('save v6 da produção: nome, veículo, cor, moedas, descobertas e habilidades preservados', async () => {
  assert.equal(SAVE_VERSION, 8, 'esta branch grava v8');
  const useGame = await abrirCom(SAVE_V6);
  const s = useGame.getState();
  const v6 = SAVE_V6.state;

  assert.equal(s.nome, 'Joaquim Ângelo');
  assert.equal(s.introVista, true);
  assert.equal(s.veiculo, 'carro');
  assert.deepEqual(s.desbloqueados, ['carro']);
  assert.equal(s.moedas, 37);
  assert.equal(s.combustivel, 62.5);
  assert.equal(s.corCarro, 'ceu');
  assert.deepEqual(s.coresCompradas, ['coral', 'ceu']);
  assert.deepEqual(s.missao, v6.missao);
  assert.deepEqual(s.habilidades, v6.habilidades);
  for (const [categoria, itens] of Object.entries(v6.descobertas)) {
    assert.deepEqual(s.descobertas[categoria], itens, categoria);
  }

  // o que a v6 não tinha nasce no padrão, sem apagar nada
  assert.deepEqual(s.descobertas.objetos, []);
  assert.deepEqual(s.worldFlags, {});
  assert.deepEqual(s.recompensas, []);
  assert.equal(typeof s.preferencias, 'object');
  assert.equal(s.preferencias.modoTranquilo, false);
});

test('save v6 da produção: a primeira gravação já é v8 e mantém o progresso', async () => {
  await abrirCom(SAVE_V6);
  const gravado = lido();
  assert.equal(gravado.version, 8);
  assert.equal(gravado.state.nome, 'Joaquim Ângelo');
  assert.equal(gravado.state.moedas, 37);
  assert.equal(gravado.state.corCarro, 'ceu');
  assert.deepEqual(gravado.state.habilidades, SAVE_V6.state.habilidades);
  assert.deepEqual(gravado.state.descobertas.paises, ['BRASIL', 'ARGENTINA']);
  assert.ok('preferencias' in gravado.state);
  assert.ok('worldFlags' in gravado.state);
  assert.ok('recompensas' in gravado.state);
});

test('save v6 da produção: o jogo segue — roteiro, habilidade e descoberta funcionam', async () => {
  const useGame = await abrirCom(SAVE_V6);
  useGame.getState().proximaMissao();
  const missao = useGame.getState().missao;
  assert.equal(typeof missao.tipo, 'string');
  assert.equal(missao.concluida, false);

  useGame.getState().registrarHabilidade('geografia', true);
  assert.deepEqual(useGame.getState().habilidades.geografia, { acertos: 2, tentativas: 4 });
  useGame.getState().registrarDescoberta('paises', 'ESPANHA');
  assert.deepEqual(useGame.getState().descobertas.paises, ['BRASIL', 'ARGENTINA', 'ESPANHA']);
  assert.equal(lido().state.nome, 'Joaquim Ângelo');
});

test('save v6 com missão de busca (que o roteiro não tem): abre e recomeça o roteiro', async () => {
  const useGame = await abrirCom({
    ...SAVE_V6,
    state: { ...SAVE_V6.state, missao: { tipo: 'busca', destino: 'PATO', concluida: false } },
  });
  assert.deepEqual(useGame.getState().missao, { tipo: 'busca', destino: 'PATO', concluida: false });
  useGame.getState().proximaMissao();
  assert.notEqual(useGame.getState().missao.tipo, 'busca');
  assert.equal(useGame.getState().moedas, 37);
});

test('save v6 com campos ausentes (jogador antigo ou import parcial): defaults sem perder o resto', async () => {
  // Jogador que veio da v1–v5 e foi migrado em main, ou save importado pela
  // Área dos Pais (main aceita `state` parcial): sem cor, sem missão, sem
  // geografia nem países, sem combustível.
  const useGame = await abrirCom({
    state: {
      nome: 'Maria Antônia',
      introVista: true,
      veiculo: 'carro',
      desbloqueados: ['carro'],
      moedas: 12,
      habilidades: {
        leituraGlobal: { acertos: 3, tentativas: 4 },
        contagem: { acertos: 1, tentativas: 1 },
      },
      descobertas: { lugares: ['PADARIA'], animais: ['GATO'] },
    },
    version: 6,
  });
  const s = useGame.getState();
  assert.equal(s.nome, 'Maria Antônia');
  assert.equal(s.moedas, 12);
  assert.deepEqual(s.habilidades.leituraGlobal, { acertos: 3, tentativas: 4 });
  assert.deepEqual(s.habilidades.geografia, { acertos: 0, tentativas: 0 });
  assert.deepEqual(s.habilidades.cores, { acertos: 0, tentativas: 0 });
  assert.deepEqual(s.descobertas.lugares, ['PADARIA']);
  assert.deepEqual(s.descobertas.animais, ['GATO']);
  for (const categoria of ['frutas', 'contagens', 'paises', 'objetos']) {
    assert.deepEqual(s.descobertas[categoria], [], categoria);
  }
  assert.equal(s.corCarro, 'coral');
  assert.deepEqual(s.coresCompradas, ['coral']);
  assert.equal(s.combustivel, 100);
  assert.deepEqual(s.missao, { tipo: 'nenhuma', destino: null, concluida: false });

  // as chaves injetadas funcionam (não viram no-op)
  useGame.getState().registrarHabilidade('geografia', true);
  useGame.getState().registrarDescoberta('paises', 'BRASIL');
  assert.deepEqual(useGame.getState().habilidades.geografia, { acertos: 1, tentativas: 1 });
  assert.deepEqual(useGame.getState().descobertas.paises, ['BRASIL']);
  useGame.getState().proximaMissao();
  assert.equal(typeof useGame.getState().missao.tipo, 'string');
  assert.equal(lido().version, 8);
});
