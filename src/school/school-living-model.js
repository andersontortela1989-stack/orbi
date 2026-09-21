import {HORTA_BANDS} from './horta.js';
const COLORS=['blue','sun','coral','grass'];
const SHAPES=['circle','square','triangle'];
export function copySchoolArt(board){
 if(!Array.isArray(board)||board.length!==16||!board.some(Boolean))return null;
 if(Array.from(board).some(c=>c!==null&&(!c||!COLORS.includes(c.color)||!SHAPES.includes(c.shape))))return null;
 return board.map(c=>c?{color:c.color,shape:c.shape}:null);
}
export function gardenView(h){
 const cfg=HORTA_BANDS[h?.band];if(!cfg)return null;
 const beds=[],seeds=[],sprouts=[];
 const width=3.3/cfg.beds;
 for(let i=0;i<cfg.beds;i++){
  const x=-7.65+width*(i+.5),z=8.3;
  beds.push({x,z,width:width-.09,wet:!!h.watered[i]});
  const count=Math.max(0,Math.min(cfg.total/cfg.beds,h.planted[i]||0));
  for(let j=0;j<count;j++){
   const plant={x,z:z+(j-(count-1)/2)*.65};
   (h.stage==='concluida'?sprouts:seeds).push(plant);
  }
 }
 return {beds,seeds,sprouts};
}
