import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * F1 — o OBJETIVO da aventura tem de ser falado (e guardado para o 🔊).
 *
 * Defeito (anterior à C1): o <MissionController> monta DEPOIS do
 * <AdventureController>. Na primeira jogada (sem missão salva), o efeito de
 * registro dele roda com o valor da renderização — "nada ativo" — e LIBERA
 * `em_missao`, que a aventura acabara de pedir. A pilha fica
 * [explorando, historia]; depois do acerto o foco cai em `explorando`, que não
 * é dono de voz da aventura, e o objetivo some calado.
 *
 * Correção: toda etapa com objetivo (ir_para, coletar, entregar, distribuir)
 * pede o foco de `em_missao` antes de falar. O motor continua puro: só
 * declara o efeito; o coordenador continua o dono único da voz.
 *
 * Voz: o voz.js REAL roda contra uma síntese falsa, para contar o que foi
 * de fato dito (sem som).
 */
const ditas = [];
globalThis.window = globalThis;
globalThis.speechSynthesis = {
  speak: (u) => ditas.push(u.text),
  cancel: () => {},
  getVoices: () => [],
  addEventListener: () => {},
};
globalThis.SpeechSynthesisUtterance = class {
  constructor(texto) {
    this.text = texto;
  }
};

const { criarAventura } = await import('../src/adventure/adventure-engine.js');
const { PARQUE_COM_SEDE } = await import('../src/adventure/parque-com-sede.js');
const { coordenadorAtividade } = await import('../src/activity/index.js');
const { aventuraRuntime, enviarEventoAventura, iniciarParqueComSede } = await import(
  '../src/adventure/runtime.js'
);
const { useGame } = await import('../src/store/useGame.js');
const { frasesDaMissao } = await import('../src/missions/missoes.js');

const PERGUNTA = {
  id: 'p',
  tipo: 'pergunta',
  texto: 'Pergunta?',
  opcoes: [{ id: 'sim', rotulo: 'SIM', emoji: '✅', correta: true }],
  reforco: 'de novo',
  dica: 'é sim',
};

const OBJETIVOS = {
  ir_para: { id: 'o', tipo: 'ir_para', lugar: 'PORTO', texto: 'Vamos ao porto.' },
  coletar: { id: 'o', tipo: 'coletar', item: 'balde_agua', quantidade: 2, texto: 'Pegue dois baldes.' },
  entregar: { id: 'o', tipo: 'entregar', lugar: 'PARQUE', texto: 'Leve ao parque.' },
  distribuir: { id: 'o', tipo: 'distribuir', item: 'semente', slots: 2, porSlot: 1, texto: 'Uma em cada.' },
};

test('motor: toda etapa com objetivo pede o foco de em_missao antes de falar', () => {
  for (const [tipo, etapa] of Object.entries(OBJETIVOS)) {
    const corredor = criarAventura({ id: `t-${tipo}`, etapas: [PERGUNTA, etapa] });
    corredor.iniciar();
    const efeitos = corredor.enviar({ tipo: 'respondeu', opcao: 'sim' });
    const iLibera = efeitos.findIndex(
      (e) => e.tipo === 'foco' && e.acao === 'liberar' && e.atividade === 'pergunta'
    );
    const iPede = efeitos.findIndex(
      (e) => e.tipo === 'foco' && e.acao === 'pedir' && e.atividade === 'em_missao'
    );
    const iFala = efeitos.findIndex((e) => e.tipo === 'falar' && e.texto === etapa.texto);
    assert.ok(iPede >= 0, `${tipo}: não pede em_missao`);
    assert.ok(iLibera < iPede && iPede < iFala, `${tipo}: ordem ${iLibera}, ${iPede}, ${iFala}`);
  }
});

test('aventura do parque: objetivos falados uma vez, guardados para o 🔊 e roteiro retomado', () => {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
  useGame.getState().proximaMissao(); // primeira parada do roteiro
  const missaoAntes = useGame.getState().missao;
  const posicaoAntes = useGame.getState().roteiroPosicao;
  const pedido = frasesDaMissao(missaoAntes).pedido;

  assert.equal(iniciarParqueComSede(), true);
  // O que o MissionController faz na primeira jogada: libera em_missao.
  coordenadorAtividade.liberar('em_missao');
  assert.deepEqual(coordenadorAtividade.estado().pilha, ['explorando', 'historia']);

  enviarEventoAventura({ tipo: 'toque' });
  ditas.length = 0;
  enviarEventoAventura({ tipo: 'respondeu', opcao: 'agua' });

  const irAoPorto = 'Vamos ao porto buscar água para as flores.';
  assert.equal(coordenadorAtividade.estado().foco, 'em_missao');
  assert.deepEqual(ditas, [irAoPorto]); // falado, uma vez só
  assert.equal(coordenadorAtividade.estado().fala, irAoPorto); // e guardado

  ditas.length = 0;
  enviarEventoAventura({ tipo: 'chegou', lugar: 'PORTO' });
  assert.deepEqual(ditas, ['Pegue quatro baldes de água.']);
  assert.equal(coordenadorAtividade.estado().fala, 'Pegue quatro baldes de água.');

  ditas.length = 0;
  for (let n = 0; n < 4; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 });
  }
  assert.ok(ditas.includes('Agora leve a água até o parque.'));
  assert.equal(ditas.filter((t) => t === 'Agora leve a água até o parque.').length, 1);
  assert.equal(coordenadorAtividade.estado().fala, 'Agora leve a água até o parque.');

  enviarEventoAventura({ tipo: 'chegou', lugar: 'PARQUE' });
  enviarEventoAventura({ tipo: 'toque' }); // fecha o resumo
  assert.equal(aventuraRuntime.estado().ativa, false);

  // O pedido do roteiro não foi dito durante a aventura.
  assert.ok(!ditas.includes(pedido));
  // Ao fim, a MESMA parada do roteiro continua (o MissionController a retoma).
  assert.equal(useGame.getState().missao.destino, missaoAntes.destino);
  assert.equal(useGame.getState().roteiroPosicao, posicaoAntes);
  assert.ok(!coordenadorAtividade.estaAtiva('em_missao')); // devolvido ao roteiro
  coordenadorAtividade.reiniciar();
});
