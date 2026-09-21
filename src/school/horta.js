export const HORTA_BANDS = {
  '3-5': {total:3,beds:3,label:'3–5 anos',task:'Vamos levar três sementes. Toque para colocar uma de cada vez na cestinha.'},
  '6-7': {total:4,beds:2,label:'6–7 anos',task:'Dois canteiros vão receber duas sementes cada. Quantas sementes precisamos levar?'},
  '8-10': {total:6,beds:3,label:'8–10 anos',task:'Vamos repartir seis sementes igualmente entre três canteiros. Primeiro, separe as seis sementes.'},
};
export function createHorta(band) {
  const config=HORTA_BANDS[band];
  return config?{band,active:true,stage:'convite',collected:0,planted:Array(config.beds).fill(0),watered:Array(config.beds).fill(false)}:null;
}
export function hortaDestination(h) { return h?.stage==='sementes'?'MERCADO':'ESCOLA'; }
export function hortaAction(h,action,index) {
  if(!h||!HORTA_BANDS[h.band])return h;
  const {total,beds}=HORTA_BANDS[h.band];
  const valid=Number.isInteger(index)&&index>=0&&index<beds;
  if(action==='partir'&&h.stage==='convite')return {...h,stage:'sementes'};
  if(action==='coletar'&&h.stage==='sementes'&&h.collected<total)return {...h,collected:h.collected+1};
  if(action==='levar'&&h.stage==='sementes'&&h.collected===total)return {...h,stage:'plantar'};
  if(action==='plantar'&&h.stage==='plantar'&&valid&&h.planted[index]<total/beds)return {...h,planted:h.planted.map((n,i)=>i===index?n+1:n)};
  if(action==='terminarPlantio'&&h.stage==='plantar'&&h.planted.every(n=>n===total/beds))return {...h,stage:'regar'};
  if(action==='regar'&&h.stage==='regar'&&valid&&!h.watered[index])return {...h,watered:h.watered.map((v,i)=>v||i===index)};
  if(action==='observar'&&h.stage==='regar'&&h.watered.every(Boolean))return {...h,stage:'observar'};
  if(action==='crescer'&&h.stage==='observar')return {...h,stage:'concluida'};
  return h;
}
