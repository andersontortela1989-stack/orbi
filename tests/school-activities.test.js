import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, BANDS, SUBJECTS, makeQuestion, checkAnswer, paintCell } from '../src/components/school/activities.js';

test('12 bases cobrem as quatro áreas nas três faixas com variações válidas',()=>{
  assert.equal(ACTIVITIES.length,12);
  for(const band of BANDS)for(const area of SUBJECTS){
    const found=ACTIVITIES.filter(a=>a.band===band.id&&a.subject===area.id);
    assert.equal(found.length,1);const a=found[0];assert.ok(a.variants.length>=2);
    for(let i=0;i<a.variants.length;i++){
      const q=makeQuestion(a.id,i,()=>0.3);assert.ok(q.prompt&&q.hint);
      if(q.kind!=='studio'){
        assert.equal(checkAnswer(q,q.answer),true);
        assert.equal(checkAnswer(q,'invalid'),false);
        assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);
        for(const id of Array.isArray(q.answer)?q.answer:[q.answer])assert.ok(q.options.some(o=>o.id===id));
      }
    }
  }
});
test('embaralhar e repetir não modifica o banco nem perde a resposta',()=>{
  const before=JSON.stringify(ACTIVITIES);
  for(const a of ACTIVITIES)for(let i=0;i<8;i++)makeQuestion(a.id,i,()=>0.99);
  assert.equal(JSON.stringify(ACTIVITIES),before);
  assert.equal(makeQuestion('desconhecida',0),null);
});
test('contagem e contas batem com os números realmente apresentados',()=>{
  for(const a of ACTIVITIES.filter(a=>a.subject==='math'))for(let i=0;i<a.variants.length;i++){
    const q=makeQuestion(a.id,i);assert.equal(Number(q.answer),q.value);
    const {a:left,b:right,op}=q.calculation;
    const expected=op==='+'?left+right:op==='−'?left-right:op==='×'?left*right:left/right;
    assert.equal(Number(q.answer),expected);
    if(q.visual)assert.equal(q.visual.length,expected);
    for(const o of q.options)if(o.dots!=null)assert.equal(o.dots,Number(o.id));
  }
});
test('pintura é imutável e recusa espaços inexistentes',()=>{
  const board=Array(16).fill(null);const painted=paintCell(board,3,{color:'blue',shape:'circle'});
  assert.equal(board[3],null);assert.deepEqual(painted[3],{color:'blue',shape:'circle'});
  assert.equal(paintCell(board,16,{color:'blue'}),board);
});
