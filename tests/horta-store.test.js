import test,{beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store/useGame.js';
beforeEach(()=>useGame.getState().resetar());
const start=()=>{useGame.getState().abrirInteracaoContextual('ESCOLA');return useGame.getState().iniciarHorta('6-7');};
test('convite exige escola, não substitui missão e chegada errada não coleta sementes',()=>{
 const s=useGame.getState();const mission={tipo:'gps',destino:'MERCADO',concluida:false};useGame.setState({missao:mission});
 assert.equal(s.iniciarHorta('6-7'),false);assert.equal(start(),true);
 assert.equal(s.agirHorta('partir'),true);assert.equal(useGame.getState().interacaoContextual,null);
 assert.equal(s.chegarHorta('VET'),false);assert.equal(s.agirHorta('coletar'),false);
 assert.equal(s.processarChegada('MERCADO'),false);assert.deepEqual(useGame.getState().missao,mission);
 assert.equal(s.chegarHorta('MERCADO'),true);assert.equal(s.agirHorta('coletar'),true);
 assert.equal(useGame.getState().horta.collected,1);
});
test('pausar preserva etapa e libera missão, retomar na escola não permite coletar lá',()=>{
 const s=useGame.getState();start();s.agirHorta('partir');s.chegarHorta('MERCADO');s.agirHorta('coletar');s.pausarHorta();
 assert.equal(useGame.getState().horta.active,false);assert.equal(useGame.getState().horta.collected,1);
 s.abrirInteracaoContextual('ESCOLA');assert.equal(s.iniciarHorta('3-5'),true);
 assert.equal(useGame.getState().horta.band,'6-7');assert.equal(s.agirHorta('coletar'),false);
 s.fecharHorta();s.chegarHorta('MERCADO');assert.equal(s.agirHorta('coletar'),true);
 assert.equal(useGame.getState().horta.collected,2);
});
test('painéis concorrentes, busca e save permanecem protegidos',()=>{
 const s=useGame.getState();start();s.agirHorta('partir');useGame.setState({garagemPerto:true});assert.equal(s.chegarHorta('MERCADO'),false);
 useGame.setState({missao:{tipo:'busca',destino:'GATO',concluida:false}});assert.equal(s.processarBusca('GATO'),false);
 const saved=useGame.persist.getOptions().partialize(useGame.getState());assert.equal(Object.keys(saved).length,11);assert.equal('horta' in saved,false);
 s.resetar();assert.equal(useGame.getState().horta,null);
});
test('iniciar após chegada de missão avança uma vez e fechar a horta não avança de novo',()=>{
 const s=useGame.getState();let calls=0;const next=s.proximaMissao;
 useGame.setState({proximaMissao:()=>{calls++;}});
 try {
  s.prepararInteracaoContextual('ESCOLA');s.ativarInteracaoContextualPendente('ESCOLA');
  assert.equal(s.iniciarHorta('3-5'),true);assert.equal(calls,1);
  s.fecharHorta();s.pausarHorta();assert.equal(calls,1);
 }finally{useGame.setState({proximaMissao:next});}
});
