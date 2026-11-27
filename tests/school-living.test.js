import test from 'node:test';
import assert from 'node:assert/strict';
import {gardenView,copySchoolArt} from '../src/school/school-living-model.js';
import {createHorta,HORTA_BANDS} from '../src/school/horta.js';
test('horta visual reflete sementes, água e brotos reais nas três faixas',()=>{
 assert.equal(gardenView(null),null);
 for(const band of Object.keys(HORTA_BANDS)){
  let h=createHorta(band);const cfg=HORTA_BANDS[band];
  assert.equal(gardenView(h).seeds.length,0);
  h={...h,stage:'plantar',planted:Array(cfg.beds).fill(cfg.total/cfg.beds)};
  const before=JSON.stringify(h);assert.equal(gardenView(h).seeds.length,cfg.total);assert.equal(gardenView(h).sprouts.length,0);
  h={...h,stage:'observar',watered:Array(cfg.beds).fill(true)};assert.ok(gardenView(h).beds.every(b=>b.wet));
  const done=gardenView({...h,stage:'concluida'});assert.equal(done.sprouts.length,cfg.total);assert.equal(done.seeds.length,0);
  for(const item of [...done.beds,...done.sprouts]){assert.ok(item.x>=-7.8&&item.x<=-4.2);assert.ok(item.z>=7.55&&item.z<=9.05);}
  assert.equal(before,JSON.stringify({...h,stage:'plantar',watered:Array(cfg.beds).fill(false)}));
 }
});
test('mural exige 16 células válidas, copia formas e não aceita desenho vazio',()=>{
 const board=Array(16).fill(null);assert.equal(copySchoolArt(board),null);board[4]={shape:'circle',color:'coral'};
 const copy=copySchoolArt(board);assert.deepEqual(copy,board);board[4].color='blue';assert.equal(copy[4].color,'coral');
 assert.equal(copySchoolArt([null]),null);board[2]={color:'bad',shape:'circle'};assert.equal(copySchoolArt(board),null);
 const sparse=Array(16);sparse[0]={shape:'circle',color:'blue'};assert.equal(copySchoolArt(sparse),null);
});
