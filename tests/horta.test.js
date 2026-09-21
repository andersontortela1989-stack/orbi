import test from 'node:test';
import assert from 'node:assert/strict';
import { createHorta, hortaAction, hortaDestination, HORTA_BANDS } from '../src/school/horta.js';
test('horta percorre etapas reais nas três faixas sem aceitar saltos ou toques extras',()=>{
 for(const band of Object.keys(HORTA_BANDS)){
  let h=createHorta(band);assert.equal(h.stage,'convite');
  assert.equal(hortaAction(h,'plantar',0),h);
  h=hortaAction(h,'partir');assert.equal(hortaDestination(h),'MERCADO');
  assert.equal(hortaAction(h,'levar'),h);
  const {total,beds}=HORTA_BANDS[band];
  for(let i=0;i<total;i++)h=hortaAction(h,'coletar');
  assert.equal(h.collected,total);assert.equal(hortaAction(h,'coletar'),h);
  h=hortaAction(h,'levar');assert.equal(hortaDestination(h),'ESCOLA');
  assert.equal(hortaAction(h,'terminarPlantio'),h);
  for(let b=0;b<beds;b++){
   for(let i=0;i<total/beds;i++)h=hortaAction(h,'plantar',b);
   assert.equal(hortaAction(h,'plantar',b),h);
  }
  assert.equal(h.planted.reduce((a,b)=>a+b,0),total);
  h=hortaAction(h,'terminarPlantio');assert.equal(h.stage,'regar');
  assert.equal(hortaAction(h,'observar'),h);
  for(let b=0;b<beds;b++)h=hortaAction(h,'regar',b);
  assert.equal(hortaAction(h,'regar',0),h);
  h=hortaAction(h,'observar');assert.equal(h.stage,'observar');
  h=hortaAction(h,'crescer');assert.equal(h.stage,'concluida');
  assert.equal(hortaAction(h,'crescer'),h);
 }
});
test('modelo recusa faixa, índice e ação inválidos sem mutar o estado anterior',()=>{
 assert.equal(createHorta('invalid'),null);
 let h=createHorta('3-5');const before=JSON.stringify(h);
 hortaAction(h,'partir');assert.equal(JSON.stringify(h),before);
 assert.equal(hortaAction(h,'fake'),h);
 h={...h,stage:'plantar'};
 for(const i of [-1,3,NaN,1.5])assert.equal(hortaAction(h,'plantar',i),h);
});
