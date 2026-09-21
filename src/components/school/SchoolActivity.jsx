import { useEffect, useRef, useState } from 'react';
import { falar } from '../../audio/voz.js';
import { checkAnswer } from './activities.js';
import { SchoolShape } from './SchoolShape.jsx';
import { SchoolStudio } from './SchoolStudio.jsx';
import {OrbiMoment} from '../OrbiMoment.jsx';

export const schoolSpeak = text => falar(text,{interrupt:true});
function OptionPicture({ option }) {
  return <>
    {option.emoji&&<span className="school-option-emoji" aria-hidden="true">{option.emoji}</span>}
    {option.dots!=null&&<span className="school-dots" aria-hidden="true">{Array.from({length:option.dots},(_,i)=><i key={i}/>)}</span>}
    {(option.color||option.shape)&&<SchoolShape color={option.color} shape={option.shape}/>}
    <span>{option.label}</span>
  </>;
}
export function SchoolActivity({ question:q, onNext, onComplete, onFreeArt }) {
  const [picked,setPicked]=useState([]);
  const [feedback,setFeedback]=useState('');
  const [done,setDone]=useState(false);
  const answered=useRef(false);
  const invitation=q.kind==='studio'?'Que ideia vamos criar hoje?':q.kind==='order'?'Qual parte vem primeiro? Vamos pensar juntos.':'Como podemos descobrir isso?';
  const [moment,setMoment]=useState({pose:'curioso',text:invitation});
  const narration=[invitation,q.passage,q.spoken||q.prompt].filter(Boolean).join(' ');
  useEffect(()=>{ schoolSpeak(narration); },[narration]);
  function complete() {
    if(answered.current&&q.kind!=='studio')return;
    answered.current=true;setDone(true);setFeedback(q.explanation);
    setMoment({pose:q.kind==='studio'?'admirando':'comemorando',text:q.kind==='studio'?'Olha quantas ideias cabem no nosso papel!':'Você me ajudou a descobrir!'});
    schoolSpeak(q.explanation);onComplete();
  }
  function answer(value) {
    if(answered.current)return;
    if(checkAnswer(q,value))complete();
    else {const text=`Vamos observar juntos. ${q.hint}`;setMoment({pose:'apontando',text:'Vamos olhar para esta pista.'});setFeedback(text);schoolSpeak(text);if(q.kind==='order')setPicked([]);}
  }
  function choose(id) {
    if(q.kind==='choice')answer(id);
    else {const next=[...picked,id];setPicked(next);if(next.length===q.answer.length)answer(next);else schoolSpeak(q.options.find(o=>o.id===id).label);}
  }
  return <div className={`school-activity school-kind-${q.kind}`}>
    <div className="school-question">
      {q.passage&&<p className="school-passage">{q.passage}</p>}
      <h2>{q.prompt}</h2>
      <OrbiMoment {...moment}/>
      {q.visual&&<div className="school-scene" aria-label={`${q.visual.length} maçãs`}>{q.visual.map((v,i)=><span key={i} aria-hidden="true">{v}</span>)}</div>}
      {q.scene&&<div className="school-scene" aria-hidden="true">{q.scene}</div>}
      {q.pattern&&<div className="school-pattern" aria-hidden="true">{q.pattern.map((color,i)=><SchoolShape key={i} color={color}/>)}<span>?</span></div>}
      <div className="school-help">
        <button className="school-small" onClick={()=>schoolSpeak(narration)}>🔊 Ouvir novamente</button>
        <button className="school-small" onClick={()=>{setMoment({pose:'apontando',text:'Vamos olhar para esta pista.'});setFeedback(q.hint);schoolSpeak(`Vamos olhar para esta pista. ${q.hint}`);}}>💡 Uma pista</button>
      </div>
    </div>
    <div className="school-work">
      {q.kind==='studio' ? <SchoolStudio onComplete={complete} speak={schoolSpeak} onPublish={()=>setMoment({pose:'admirando',text:'Sua ideia agora faz parte da nossa escola!'})}/> : <>
        {q.kind==='order'&&<div className="school-sequence" aria-label="Sua sequência">
          {q.answer.map((_,i)=><span key={i}>{picked[i] ? <OptionPicture option={q.options.find(o=>o.id===picked[i])}/> : <span>{i+1}</span>}</span>)}
          <button className="school-small" aria-label="Desfazer última escolha" disabled={!picked.length||done} onClick={()=>setPicked(p=>p.slice(0,-1))}>↶</button>
        </div>}
        <div className="school-options">
          {q.options.map(o=><button key={o.id} className="school-option" disabled={done||picked.includes(o.id)} aria-label={o.dots!=null?`${o.label} bolinhas`:o.label} onClick={()=>choose(o.id)}><OptionPicture option={o}/></button>)}
        </div>
      </>}
      <div className={`school-feedback${done?' is-done':''}`} role="status" aria-live="polite">{feedback}</div>
      <div className="school-next">
        {done&&<button className="school-primary" onClick={onNext}>Outra descoberta →</button>}
        {onFreeArt&&q.kind!=='studio'&&<button className="school-small" onClick={onFreeArt}>🎨 Criar livremente</button>}
      </div>
    </div>
  </div>;
}
