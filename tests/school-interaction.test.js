import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { criarInteracaoContextual, encaminharChegadaContextual } from '../src/interactions/contextual-interactions.js';
import { useGame } from '../src/store/useGame.js';

beforeEach(() => useGame.getState().resetar());
test('escola tem contexto próprio, sem alvo de pães, e mantém origem', () => {
  assert.deepEqual(criarInteracaoContextual('ESCOLA','exploracao'), {
    tipo:'escola-atividades-v1',lugar:'ESCOLA',origem:'exploracao',status:'ativa',
  });
  assert.equal(criarInteracaoContextual('ESCOLA','missao').status,'aguardando-celebracao');
});
test('sair da escola explorada preserva missão, economia e aprendizagem', () => {
  const mission={tipo:'gps',destino:'HOSPITAL',concluida:false};
  useGame.setState({missao:mission,moedas:8});
  const skills=structuredClone(useGame.getState().habilidades);
  assert.equal(useGame.getState().abrirInteracaoContextual('ESCOLA'),true);
  assert.equal(useGame.getState().concluirInteracaoContextual({quantidade:3}),false);
  assert.equal(useGame.getState().encerrarInteracaoContextual(),true);
  assert.equal(useGame.getState().interacaoContextual,null);
  assert.deepEqual(useGame.getState().missao,mission);
  assert.equal(useGame.getState().moedas,8);
  assert.deepEqual(useGame.getState().habilidades,skills);
});
test('chegada da missão espera celebração e saída avança uma única vez', () => {
  const s=useGame.getState();let advances=0;const original=s.proximaMissao;
  useGame.setState({proximaMissao:()=>advances++});
  try {
    assert.equal(encaminharChegadaContextual('ESCOLA',true,{preparar:s.prepararInteracaoContextual,abrir:s.abrirInteracaoContextual}),true);
    assert.equal(s.ativarInteracaoContextualPendente('ESCOLA'),true);
    assert.equal(s.encerrarInteracaoContextual(),true);
    assert.equal(s.encerrarInteracaoContextual(),false);
    assert.equal(advances,1);
  } finally {useGame.setState({proximaMissao:original});}
});
