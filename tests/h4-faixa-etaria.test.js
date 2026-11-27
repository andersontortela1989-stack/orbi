import { test, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAVE_FAIXA_ETARIA,
  FAIXA_ETARIA_PADRAO,
  FAIXAS_ETARIAS,
  normalizarFaixaEtaria,
  lerFaixaEtaria,
  salvarFaixaEtaria,
} from '../src/faixa-etaria.js';
import { CHAVE_SAVE } from '../src/save.js';
import { criarConviteHorta, faixaDaHorta } from '../src/adventure/convites.js';
import { criarPortaoParental, DURACAO_PORTAO_MS } from '../src/ui/portao-parental.js';

function criarStorageMock() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
    mapa,
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorageMock();
});

test('H4: padrão é 3-5 e normalização aceita apenas as três faixas válidas', () => {
  assert.equal(FAIXA_ETARIA_PADRAO, '3-5');
  assert.deepEqual(FAIXAS_ETARIAS.map((f) => f.id), ['3-5', '6-7', '8-10']);
  assert.equal(normalizarFaixaEtaria('3-5'), '3-5');
  assert.equal(normalizarFaixaEtaria('6-7'), '6-7');
  assert.equal(normalizarFaixaEtaria('8-10'), '8-10');
  assert.equal(normalizarFaixaEtaria('11-12'), '3-5');
  assert.equal(normalizarFaixaEtaria(null), '3-5');
  assert.equal(normalizarFaixaEtaria(undefined), '3-5');
});

test('H4: ler e salvar faixa etária persistem com fallback seguro em dado corrompido', () => {
  assert.equal(lerFaixaEtaria(), '3-5');
  assert.equal(salvarFaixaEtaria('6-7'), '6-7');
  assert.equal(localStorage.getItem(CHAVE_FAIXA_ETARIA), '6-7');
  assert.equal(lerFaixaEtaria(), '6-7');

  localStorage.setItem(CHAVE_FAIXA_ETARIA, 'invalida');
  assert.equal(lerFaixaEtaria(), '3-5');

  const quebrado = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('cheio'); },
  };
  assert.equal(lerFaixaEtaria(quebrado), '3-5');
  assert.equal(salvarFaixaEtaria('8-10', quebrado), '8-10');
});

test('H4: trocar a faixa nunca altera o save principal do jogo', () => {
  const saveOriginal = JSON.stringify({ state: { moedas: 35, nome: 'Heitor' }, version: 8 });
  localStorage.setItem(CHAVE_SAVE, saveOriginal);

  salvarFaixaEtaria('8-10');
  salvarFaixaEtaria('6-7');

  assert.equal(localStorage.getItem(CHAVE_SAVE), saveOriginal);
});

test('H4: faixaDaHorta usa a faixa escolhida pelos pais e mantém override ?medir=1&faixa=', () => {
  salvarFaixaEtaria('6-7');
  assert.equal(faixaDaHorta(''), '6-7');
  assert.equal(faixaDaHorta('?faixa=8-10'), '6-7', 'sem ?medir=1 não sobrescreve');
  assert.equal(faixaDaHorta('?medir=1&faixa=8-10'), '8-10', 'com ?medir=1 sobrescreve para teste');
  assert.equal(faixaDaHorta('?medir=1&faixa=invalida'), '6-7', 'faixa inválida na URL volta à escolhida');
});

test('H4: convite com resolverFaixa lê a troca feita pelos pais sem recarregar a página', () => {
  const pedidos = [];
  const convite = criarConviteHorta(
    (f) => { pedidos.push(f); return true; },
    '3-5',
    () => faixaDaHorta('')
  );
  salvarFaixaEtaria('8-10');
  assert.equal(convite.tentar({ tipo: 'gps', destino: 'ESCOLA', concluida: true }), true);
  assert.deepEqual(pedidos, ['8-10']);
});

test('H4: portão parental ignora toque rápido e abre somente ao segurar 1,5 s', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    let aberturas = 0;
    let toquesRapidos = 0;
    const portao = criarPortaoParental({
      onAbrir: () => { aberturas += 1; },
      onToqueRapido: () => { toquesRapidos += 1; },
    });

    portao.iniciar();
    mock.timers.tick(500);
    portao.cancelar({ notificarToqueRapido: true });
    mock.timers.tick(2000);
    assert.equal(aberturas, 0);
    assert.equal(toquesRapidos, 1);

    portao.iniciar();
    mock.timers.tick(DURACAO_PORTAO_MS);
    assert.equal(aberturas, 1);
    assert.equal(portao.estaAtivo(), false);

    portao.iniciar();
    portao.destruir();
    mock.timers.tick(DURACAO_PORTAO_MS * 2);
    assert.equal(aberturas, 1);
  } finally {
    mock.timers.reset();
  }
});
