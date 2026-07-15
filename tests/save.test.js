/**
 * Casos de teste do save (P0-06 + P1-07) — rodam DIRETO no runner nativo do
 * Node (`npm test`), sem dependência nova: src/save.js é JS puro e este mock
 * de localStorage (Map por trás) reproduz o contrato que ele usa.
 *
 * Cobre exatamente os casos pedidos na fatia: chave ausente, save vazio,
 * JSON corrompido, versão futura (recusa) e ida-e-volta export→limpar→import.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAVE_VERSION,
  CHAVE_SAVE,
  CHAVE_BACKUP_IMPORT,
  CHAVE_BACKUP_CORROMPIDO,
  storageSeguro,
  validarSaveImportado,
  resumoDoSave,
  backupDoSaveAtual,
  paraBase64,
  deBase64,
} from '../src/save.js';

beforeEach(() => {
  const m = new Map();
  globalThis.localStorage = {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
});

// Um save válido no formato exato que o zustand/persist grava.
function saveValido() {
  return {
    state: {
      nome: 'José', // acento de propósito: exercita o Base64 UTF-8-seguro
      introVista: true,
      veiculo: 'carro',
      moedas: 42,
      combustivel: 80,
      descobertas: {
        lugares: ['PARQUE', 'ZOO'],
        animais: ['capivara'],
        frutas: [],
        contagens: ['c1', 'c2', 'c3'],
        paises: ['brasil'],
      },
      habilidades: { contagem: { acertos: 3, tentativas: 4 } },
    },
    version: SAVE_VERSION,
  };
}

// === anti-reset-silencioso (storageSeguro.getItem) ===

test('chave ausente (primeiro acesso): estado seguro, SEM backup de corrupção', () => {
  assert.equal(storageSeguro.getItem(CHAVE_SAVE), null);
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), null);
});

test('save vazio (string vazia): tratado como corrompido, bruto preservado', () => {
  localStorage.setItem(CHAVE_SAVE, '');
  assert.equal(storageSeguro.getItem(CHAVE_SAVE), null); // jogável
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), '');
});

test('JSON corrompido: bruto vai pro backup ANTES de qualquer escrita, original intacto', () => {
  const corrompido = '{"state":{"moedas":42,"nom'; // truncado no meio
  localStorage.setItem(CHAVE_SAVE, corrompido);
  assert.equal(storageSeguro.getItem(CHAVE_SAVE), null); // jogável
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), corrompido);
  assert.equal(localStorage.getItem(CHAVE_SAVE), corrompido); // não apagou
});

test('backup de corrupção NÃO é sobrescrito: o PRIMEIRO (mais próximo do bom) vence', () => {
  localStorage.setItem(CHAVE_SAVE, '{"state":{"moedas":42'); // 1ª leitura corrompida
  storageSeguro.getItem(CHAVE_SAVE);
  localStorage.setItem(CHAVE_SAVE, '{"st'); // degradou mais; 2ª e 3ª leituras
  storageSeguro.getItem(CHAVE_SAVE);
  storageSeguro.getItem(CHAVE_SAVE);
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), '{"state":{"moedas":42');
});

test('JSON válido mas shape parcial (sem state): mesmo tratamento de corrompido', () => {
  localStorage.setItem(CHAVE_SAVE, '{"moedas":42}');
  assert.equal(storageSeguro.getItem(CHAVE_SAVE), null);
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), '{"moedas":42}');
});

test('save válido: hidrata normal, nada de backup', () => {
  storageSeguro.setItem(CHAVE_SAVE, saveValido());
  assert.deepEqual(storageSeguro.getItem(CHAVE_SAVE), saveValido());
  assert.equal(localStorage.getItem(CHAVE_BACKUP_CORROMPIDO), null);
});

// === validação do import ===

test('versão futura é recusada; até SAVE_VERSION é aceita', () => {
  assert.equal(validarSaveImportado({ state: {}, version: SAVE_VERSION + 1 }), false);
  assert.equal(validarSaveImportado({ state: {}, version: SAVE_VERSION }), true);
  assert.equal(validarSaveImportado({ state: {}, version: 1 }), true);
});

test('import inválido: sem state, version não-numérica, 0, null, não-objeto', () => {
  assert.equal(validarSaveImportado({ version: 6 }), false);
  assert.equal(validarSaveImportado({ state: {}, version: '6' }), false);
  assert.equal(validarSaveImportado({ state: {}, version: 0 }), false);
  assert.equal(validarSaveImportado(null), false);
  assert.equal(validarSaveImportado('texto'), false);
});

// === resumo mostrado antes de confirmar ===

test('resumo soma as 5 categorias de descobertas e ecoa nome/veículo/moedas', () => {
  const r = resumoDoSave(saveValido());
  assert.deepEqual(r, {
    nome: 'José',
    veiculo: 'carro',
    moedas: 42,
    totalDescobertas: 7, // 2 lugares + 1 animal + 0 frutas + 3 contagens + 1 país
  });
});

test('resumo de save antigo (sem descobertas/nome): defaults, sem quebrar', () => {
  const r = resumoDoSave({ state: { moedas: 5 }, version: 1 });
  assert.deepEqual(r, { nome: '', veiculo: 'carro', moedas: 5, totalDescobertas: 0 });
});

// === backup antes da escrita destrutiva do import ===

test('com save presente: copia pra orbi-save-bkp e libera a substituição', () => {
  storageSeguro.setItem(CHAVE_SAVE, saveValido());
  const original = localStorage.getItem(CHAVE_SAVE);
  assert.equal(backupDoSaveAtual(), true);
  assert.equal(localStorage.getItem(CHAVE_BACKUP_IMPORT), original);
});

test('sem save (primeiro aparelho): nada destrutivo, libera sem criar backup', () => {
  assert.equal(backupDoSaveAtual(), true);
  assert.equal(localStorage.getItem(CHAVE_BACKUP_IMPORT), null);
});

// === ida-e-volta export → limpar → import ===

test('export → limpar → import reconstrói o save byte a byte (com acento no nome)', () => {
  storageSeguro.setItem(CHAVE_SAVE, saveValido());

  // export (o que o botão COPIAR faz): string crua → Base64
  const codigo = paraBase64(localStorage.getItem(CHAVE_SAVE));

  // "outro aparelho": save some daqui
  localStorage.removeItem(CHAVE_SAVE);
  assert.equal(storageSeguro.getItem(CHAVE_SAVE), null);

  // import (o que TRAZER + confirmar fazem): decodifica, valida, resume,
  // backup, grava
  const json = deBase64(codigo);
  const dados = JSON.parse(json);
  assert.equal(validarSaveImportado(dados), true);
  assert.equal(resumoDoSave(dados).nome, 'José');
  assert.equal(backupDoSaveAtual(), true);
  localStorage.setItem(CHAVE_SAVE, json);

  assert.deepEqual(storageSeguro.getItem(CHAVE_SAVE), saveValido());
});
