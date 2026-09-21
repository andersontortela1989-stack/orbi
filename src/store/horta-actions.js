import {createHorta,hortaAction,hortaDestination} from '../adventures/horta.js';
import {postoAtivo} from '../economia.js';
const busy=s=>!!s.chegadaViva||s.caderninhoAberto||s.garagemPerto||postoAtivo(s.combustivel,s.postoPerto);
const context=lugar=>({tipo:'horta-v1',lugar,status:'ativa',origem:'aventura'});
export function criarAcoesHorta(set,get) {
 return {
  iniciarHorta:band=>{
   const s=get(),c=s.interacaoContextual;
   if(c?.tipo!=='escola-atividades-v1'||c.status!=='ativa'||busy(s))return false;
   const h=s.horta&&s.horta.stage!=='concluida'?{...s.horta,active:true}:createHorta(band);
   if(!h)return false;
   // Resolve a chegada escolar anterior uma vez; a aventura não ocupa missao.
   set({horta:h});s.encerrarInteracaoContextual();set({interacaoContextual:context('ESCOLA')});return true;
  },
  chegarHorta:lugar=>{
   const s=get();
   if(!s.horta?.active||s.interacaoContextual||busy(s)||hortaDestination(s.horta)!==lugar)return false;
   set({interacaoContextual:context(lugar)});return true;
  },
  verCaminhoHorta:()=>{
   const s=get();if(!s.horta?.active||s.interacaoContextual||busy(s))return false;
   set({interacaoContextual:context(null)});return true;
  },
  agirHorta:(action,index)=>{
   const s=get(),c=s.interacaoContextual,h=s.horta;
   if(!h?.active||c?.tipo!=='horta-v1'||c.status!=='ativa'||c.lugar!==hortaDestination(h))return false;
   const next=hortaAction(h,action,index);if(next===h)return false;
   set({horta:next,...(['partir','levar'].includes(action)?{interacaoContextual:null}:{})});return true;
  },
  fecharHorta:()=>{
   const s=get();if(s.interacaoContextual?.tipo!=='horta-v1')return false;
   set({interacaoContextual:null,...(s.horta?.stage==='concluida'?{horta:{...s.horta,active:false}}:{})});return true;
  },
  pausarHorta:()=>{
   const s=get();if(!s.horta?.active)return false;
   set({horta:{...s.horta,active:false},...(s.interacaoContextual?.tipo==='horta-v1'?{interacaoContextual:null}:{})});return true;
  },
 };
}
