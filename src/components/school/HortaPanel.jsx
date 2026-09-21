import {useEffect,useRef,useState} from 'react';
import {useGame} from '../../store/useGame.js';
import {falar,pararFala} from '../../audio/voz.js';
import {HORTA_BANDS,hortaDestination} from '../../adventures/horta.js';

import {OrbiMoment} from '../OrbiMoment.jsx';
import {VoiceControls} from '../VoiceControls.jsx';
import {SchoolThankYou,SCHOOL_THANK_YOU} from './SchoolThankYou.jsx';
import './school.css';
import './horta.css';

const say=text=>falar(text,{interrupt:true});
const titles={convite:'Uma horta para a escola',sementes:'Vamos separar as sementes',plantar:'Cada canteiro recebe sua parte',regar:'Agora vamos cuidar',observar:'Plantas precisam de tempo',concluida:'Nossa horta começou a crescer!'};
function Sprout({grown=false}) {
 return <svg className="horta-sprout" viewBox="0 0 120 95" aria-hidden="true"><ellipse cx="60" cy="84" rx="48" ry="9" fill="#b77748"/><path d="M60 81V39" fill="none" stroke="#1c2746" strokeWidth="5"/><path d="M60 58C29 62 21 43 23 27C46 25 62 35 60 58Z" fill="#5bbe6e" stroke="#1c2746" strokeWidth="3"/><path d="M60 43C61 22 78 15 99 18C98 39 80 48 60 43Z" fill="#9ad578" stroke="#1c2746" strokeWidth="3"/>{grown&&<path d="M58 74C31 78 16 66 13 53C34 47 50 54 58 74Z" fill="#5bbe6e" stroke="#1c2746" strokeWidth="3"/>}</svg>;
}
export function HortaPanel() {
 const h=useGame(s=>s.horta),c=useGame(s=>s.interacaoContextual);
 const root=useRef(null),body=useRef(null),exit=useRef(null);
 const [shownHint,setShownHint]=useState(false);
 const cfg=HORTA_BANDS[h.band],dest=hortaDestination(h);
 const local=c.lugar===dest;
 const guideText=!local?'Vamos procurar nossa próxima parada juntos.':h.stage==='concluida'?'Olha o que nosso cuidado ajudou a crescer!':h.stage==='observar'?'O que será que mudou na nossa horta?':'Você me ajuda a cuidar desta horta?';
 const text=!local?`Nossa próxima parada é ${dest==='MERCADO'?'o mercado, para buscar sementes':'a escola, para cuidar da horta'}. Dirija até lá e chegue perto do prédio.`:
  h.stage==='convite'?'Vamos criar uma horta? Primeiro buscamos sementes no mercado. Depois voltamos à escola para plantar e cuidar.':
  h.stage==='sementes'?cfg.task:
  h.stage==='plantar'?`Temos ${cfg.total} sementes e ${cfg.beds} canteiros. Vamos colocar ${cfg.total/cfg.beds} em cada canteiro. Toque na terra para plantar.`:
  h.stage==='regar'?'As sementes estão na terra. Toque no regador de cada canteiro. As plantas precisam de água, luz e cuidados para crescer.':
  h.stage==='observar'?'Uma planta não cresce na mesma hora. Vamos imaginar que alguns dias passaram, com luz e cuidados. Cada planta cresce no seu tempo.':
  `Na nossa história, apareceram brotinhos! ${SCHOOL_THANK_YOU}`;
 const hint=!local?'Siga o nome do lugar indicado no alto da cidade. Você pode fazer uma pausa e continuar na escola.':h.stage==='sementes'?`Precisamos de ${cfg.total}. Coloque uma semente de cada vez e conte as que já estão na cestinha.`:h.stage==='plantar'?`Reparta igualmente: cada canteiro recebe ${cfg.total/cfg.beds} semente${cfg.total/cfg.beds>1?'s':''}.`:'Observe cada canteiro. Água, luz e tempo ajudam nossa horta a crescer.';
 useEffect(()=>{exit.current?.focus();return()=>pararFala();},[]);
 useEffect(()=>{if(body.current)body.current.scrollTop=0;setShownHint(false);say(`${guideText} ${text}`);},[text,guideText]);
 function close(){pararFala();useGame.getState().fecharHorta();}
 function act(action,index){
  if(!useGame.getState().agirHorta(action,index))return;
  const next=useGame.getState().horta;
  if(action==='coletar')say(`${next.collected} de ${cfg.total} sementes.`);
  if(action==='plantar')say(`Canteiro ${index+1}: ${next.planted[index]} de ${cfg.total/cfg.beds}.`);
  if(action==='regar')say('Este canteiro recebeu água.');
 }
 function keys(e){
  if(e.key==='Escape'){e.stopPropagation();close();}
  if(e.key==='Tab'){
   const bs=[...root.current.querySelectorAll('button:not(:disabled)')],first=bs[0],last=bs[bs.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
 }
 const allPlanted=h.planted.every(n=>n===cfg.total/cfg.beds),allWatered=h.watered.every(Boolean);
 const moment=shownHint?{pose:'apontando',text:'Vamos observar esta pista juntos.'}:{pose:h.stage==='concluida'?'admirando':'curioso',text:guideText};
 return <div className="school-room horta-room" ref={root} onKeyDown={keys}>
  <header className="school-header"><div className="school-heading"><span aria-hidden="true">🌱</span><div><strong>Horta da Escola</strong><small>{cfg.label} · Uma aventura em três paradas</small></div></div><div className="school-header-actions"><VoiceControls/><button ref={exit} className="school-small school-exit" onClick={close}>Voltar à cidade ↗</button></div></header>
  <div className="school-body" ref={body}>
   <ol className="horta-trail" aria-label="Caminho da aventura"><li className={h.stage==='convite'?'is-current':''}>🏫 Convite</li><li className={h.stage==='sementes'?'is-current':''}>🧺 Mercado</li><li className={!['convite','sementes'].includes(h.stage)?'is-current':''}>🌱 Horta</li></ol>
   <div className="horta-layout">
    <div className="horta-story"><h1>{local?titles[h.stage]:`Vamos ${dest==='MERCADO'?'ao mercado':'à escola'}?`}</h1><OrbiMoment {...moment}/><p>{text}</p><div className="school-help"><button className="school-small" onClick={()=>say(`${guideText} ${text}`)}>🔊 Ouvir novamente</button><button className="school-small" onClick={()=>{setShownHint(true);say(hint);}}>💡 Uma pista</button></div>
     {shownHint&&<p className="horta-success" role="status">{hint}</p>}{h.stage!=='concluida'&&<><button className="school-small" onClick={()=>{pararFala();useGame.getState().pausarHorta();}}>Pausar aventura</button><p className="horta-note">Para continuar, volte à escola. A horta fica guardada enquanto esta página estiver aberta.</p></>}
    </div>
    <div className="horta-work">
     {(!local||h.stage==='convite')&&<div className="horta-postcard"><div className="horta-route-pictures" aria-hidden="true">🏫 <span>→</span> 🧺 <span>→</span> 🌱</div>{local&&<button className="school-primary" onClick={()=>act('partir')}>Buscar sementes no mercado →</button>}{!local&&<button className="school-primary" onClick={close}>Vamos dirigir!</button>}</div>}
     {local&&h.stage==='sementes'&&<div className="horta-market"><div className="horta-awning" aria-hidden="true"/><p className="horta-count" role="status" aria-live="polite">{h.collected} / {cfg.total} sementes</p><div className="horta-basket" aria-label={`${h.collected} sementes na cestinha`}>{Array.from({length:cfg.total},(_,i)=><span key={i} className={i<h.collected?'is-filled':''} aria-hidden="true">{i<h.collected?'🫘':'·'}</span>)}</div><button className="school-primary" disabled={h.collected===cfg.total} onClick={()=>act('coletar')}>🫘 Colocar uma semente</button>{h.collected===cfg.total&&<><p className="horta-success">A cestinha está pronta. Vamos plantar na escola!</p><button className="school-primary" onClick={()=>act('levar')}>Levar sementes à escola →</button></>}</div>}
     {local&&!['convite','sementes'].includes(h.stage)&&<>
      <div className="horta-beds">{h.planted.map((n,i)=><div className="horta-bed" key={i}><strong>Canteiro {i+1}</strong>
       {['observar','concluida'].includes(h.stage)?(h.stage==='concluida'?<Sprout grown/>:<span className="horta-earth" aria-hidden="true">{Array.from({length:n},(_,j)=><span key={j}>🫘</span>)}</span>):<div className="horta-soil" aria-hidden="true">{Array.from({length:cfg.total/cfg.beds},(_,j)=><span key={j}>{j<n?'🫘':'○'}</span>)}</div>}
       {h.stage==='plantar'&&<button className="school-small" aria-label={`Plantar no canteiro ${i+1}`} disabled={n===cfg.total/cfg.beds} onClick={()=>act('plantar',i)}>🌱 {n} / {cfg.total/cfg.beds}</button>}
       {h.stage==='regar'&&<button className="school-small" aria-label={`Regar canteiro ${i+1}`} disabled={h.watered[i]} onClick={()=>act('regar',i)}>{h.watered[i]?'💧 Regado':'🚿 Regar'}</button>}
      </div>)}</div>
      {h.stage==='plantar'&&<button className="school-primary" disabled={!allPlanted} onClick={()=>act('terminarPlantio')}>Plantamos! Vamos cuidar →</button>}
      {h.stage==='regar'&&<button className="school-primary" disabled={!allWatered} onClick={()=>act('observar')}>Vamos observar →</button>}
      {h.stage==='observar'&&<><p className="horta-time">☀️ Alguns dias depois, na nossa história…</p><button className="school-primary" onClick={()=>act('crescer')}>Ver o que aconteceu →</button></>}
      {h.stage==='concluida'&&<><SchoolThankYou/><button className="school-primary" onClick={close}>Concluir aventura</button></>}
     </>}
    </div>
   </div>
  </div>
 </div>;
}
