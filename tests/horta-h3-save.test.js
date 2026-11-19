import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAVE_SAVE, SAVE_VERSION } from '../src/save.js';

/**
 * H3 — PRESERVAÇÃO DOS SAVES. Um save v8 gravado antes da H3 (números 3, 4 e
 * 6 no Caderninho, broto-da-escola nas recompensas) abre sem mudar versão nem
 * formato: o Caderninho mostra o texto novo dos números e a próxima Horta
 * segue o caminho de repetição.
 *
 * O save vai para o localStorage ANTES de a store ser importada: a store e o
 * runtime deste arquivo hidratam dele, como num reload.
 */

const armazenado = new Map();
globalThis.localStorage = {
  getItem: (k) => (armazenado.has(k) ? armazenado.get(k) : null),
  setItem: (k, v) => armazenado.set(k, String(v)),
  removeItem: (k) => armazenado.delete(k),
};

const SAVE_V8 = {
  state: {
    nome: '',
    introVista: true,
    veiculo: 'carro',
    desbloqueados: ['carro'],
    moedas: 20,
    combustivel: 40,
    corCarro: 'coral',
    coresCompradas: ['coral'],
    missao: { tipo: 'gps', destino: 'ESCOLA', concluida: false },
    habilidades: {},
    descobertas: {
      objetos: ['agua', 'flor-do-parque', 'semente', 'broto-da-escola'],
      lugares: ['MERCADO', 'ESCOLA'],
      contagens: ['3', '4', '6'],
    },
    worldFlags: { parque_florido: true, horta_escola_viva: true },
    recompensas: ['flor-do-parque', 'regador-no-teto', 'broto-da-escola'],
    preferencias: {},
  },
  version: 8,
};

armazenado.set(CHAVE_SAVE, JSON.stringify(SAVE_V8));

const { useGame } = await import('../src/store/useGame.js');
const { coordenadorAtividade } = await import('../src/activity/index.js');
const { aventuraRuntime, enviarEventoAventura, iniciarHortaEscola } = await import(
  '../src/adventure/runtime.js'
);
const { cartaoDistribuir, eventoDoCanteiro } = await import('../src/adventure/distribuir.js');
const { conteudoDescoberta, falaDescoberta } = await import('../src/missions/descobertas.js');

test('SAVE_VERSION continua 8', () => {
  assert.equal(SAVE_VERSION, 8);
});

test('save v8 com números 3, 4 e 6: o Caderninho mostra o texto novo, sem erro', () => {
  const contagens = useGame.getState().descobertas.contagens;
  assert.deepEqual(contagens, ['3', '4', '6'], 'hidratou do save');
  const nomes = { 3: 'três', 4: 'quatro', 6: 'seis' };
  for (const id of contagens) {
    const c = conteudoDescoberta('contagens', id);
    assert.equal(c.numero, id);
    assert.equal(c.fato, `O Órbi conheceu o número ${nomes[id]} com você!`);
    assert.equal(falaDescoberta('contagens', id), c.fato);
  }
});

test('save v8 com broto-da-escola: a próxima Horta segue o caminho de repetição', () => {
  coordenadorAtividade.reiniciar();
  assert.equal(iniciarHortaEscola('3-5'), true);
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < 3; n += 1) enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < 3; canteiro += 1) {
      const cartao = cartaoDistribuir(aventuraRuntime.estado());
      if (cartao?.item === item) enviarEventoAventura(eventoDoCanteiro(cartao, canteiro));
    }
  }
  const painel = aventuraRuntime.estado().painel;
  assert.equal(painel?.tipo, 'resumo');
  assert.deepEqual(painel.recompensas, [], 'sem anunciar o adesivo de novo');
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);

  // o formato gravado não muda: mesma versão, broto uma vez só
  const gravado = JSON.parse(armazenado.get(CHAVE_SAVE));
  assert.equal(gravado.version, 8);
  assert.deepEqual(
    gravado.state.recompensas.filter((r) => r === 'broto-da-escola'),
    ['broto-da-escola']
  );
});
