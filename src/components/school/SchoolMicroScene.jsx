import { useEffect, useRef, useState } from 'react';
import { pararFala } from '../../audio/voz.js';
import { Orbi } from '../Orbi.jsx';
import {VoiceControls} from '../VoiceControls.jsx';
import { BANDS, SUBJECTS, makeQuestion } from './activities.js';
import { SchoolActivity, schoolSpeak } from './SchoolActivity.jsx';
import './school.css';

const WELCOME='Aqui podemos contar, descobrir palavras, conhecer histórias e criar arte. Vamos aprender juntos?';
export function SchoolMicroScene({ onSair, onHorta, hortaPausada }) {
  const [screen,setScreen]=useState('welcome');
  const [band,setBand]=useState(null);
  const [subject,setSubject]=useState(null);
  const [rounds,setRounds]=useState({});
  const [question,setQuestion]=useState(null);
  const [visited,setVisited]=useState([]);
  const root=useRef(null);
  const body=useRef(null);
  const exit=useRef(null);
  const selectedBand=BANDS.find(b=>b.id===band);
  const selectedSubject=SUBJECTS.find(s=>s.id===subject);
  useEffect(()=>{exit.current?.focus();return()=>pararFala();},[]);
  useEffect(()=>{
    if(screen!=='welcome')body.current?.focus({preventScroll:true});
    if(body.current)body.current.scrollTop=0;
  },[screen,question]);
  useEffect(()=>{
    if(screen==='welcome')schoolSpeak(WELCOME);
    if(screen==='bands')schoolSpeak('Com a ajuda de um adulto, escolha por onde começar. Você pode mudar depois.');
    if(screen==='menu')schoolSpeak('O que vamos descobrir? Matemática, Português, História e vida, ou Artes?');
  },[screen]);
  function openSubject(id) {
    const activityId=`${band}-${id}`;
    setSubject(id);setQuestion(makeQuestion(activityId,rounds[activityId]||0));setScreen('activity');
  }
  function next() {
    const id=`${band}-${subject}`,round=(rounds[id]||0)+1;
    setRounds(r=>({...r,[id]:round}));setQuestion(makeQuestion(id,round));
  }
  function complete() { const id=`${band}-${subject}`;setVisited(v=>v.includes(id)?v:[...v,id]); }
  function close() {pararFala();onSair();}
  function trapFocus(e) {
    if(e.key==='Escape'){e.stopPropagation();close();return;}
    if(e.key!=='Tab')return;
    const buttons=[...root.current.querySelectorAll('button:not(:disabled)')];
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
  return <div className="school-room" ref={root} onKeyDown={trapFocus}>
    <header className="school-header">
      <div className="school-heading"><span aria-hidden="true">🏫</span><div><strong>Escola do Órbi</strong><small>{screen==='activity'?selectedSubject.label:'Um mundo para aprender'}</small></div></div>
      <div className="school-header-actions"><VoiceControls/><button ref={exit} className="school-small school-exit" onClick={close}>Voltar à cidade ↗</button></div>
    </header>
    <div className="school-body" ref={body} tabIndex={-1} key={screen}>
      {screen==='welcome'&&<div className="school-welcome">
        <Orbi pose="acenando" className="school-guide"/>
        <div><p className="school-eyebrow">Pode entrar, a escola é sua!</p><h1>Vamos aprender?</h1><p>{WELCOME}</p>
          <button className="school-primary" onClick={()=>setScreen('bands')}>✨ Vamos aprender!</button>
          <button className="school-small" onClick={()=>schoolSpeak(WELCOME)}>🔊 Ouvir novamente</button>
        </div>
      </div>}
      {screen==='bands'&&<div className="school-selection">
        <h1>Por onde vamos começar?</h1><p>Escolha com um adulto. A faixa é um ponto de partida e pode mudar quando quiser.</p>
        <div className="school-band-list">{BANDS.map(b=><button key={b.id} className="school-band" onClick={()=>{setBand(b.id);setScreen('menu');}}><span aria-hidden="true">{b.emoji}</span><strong>{b.title}</strong><small>{b.label}</small></button>)}</div>
        <p className="school-note">Cada criança aprende no seu tempo. Aqui podemos experimentar juntos.</p>
      </div>}
      {(screen==='menu'||screen==='activity')&&<nav className="school-nav" aria-label="Caminhos da escola">
        {screen==='activity'&&<button className="school-small" onClick={()=>setScreen('menu')}>← Cantinhos</button>}
        <button className="school-small" onClick={()=>setScreen('bands')}>{selectedBand.emoji} {selectedBand.label} · Mudar</button>
      </nav>}
      {screen==='menu'&&<div className="school-selection">
        <h1>O que vamos descobrir?</h1><p>Escolha um cantinho. O Órbi aprende com você.</p>
        <div className="school-subjects">{SUBJECTS.map(s=><button key={s.id} className={`school-subject school-color-${s.color}`} onClick={()=>openSubject(s.id)}><span className="school-subject-icon" aria-hidden="true">{s.emoji}</span><div><strong>{s.label}</strong><small>{s.description}</small>{visited.includes(`${band}-${s.id}`)&&<small>✨ Exploramos nesta visita</small>}</div><span aria-hidden="true">→</span></button>)}</div>
        {onHorta&&<button className="school-subject school-color-grass horta-invite" onClick={()=>onHorta(band)}><span className="school-subject-icon" aria-hidden="true">🌱</span><div><strong>{hortaPausada?'Continuar a Horta':'Aventura: Horta da Escola'}</strong><small>Escola, mercado e uma horta para cuidar juntos</small></div><span aria-hidden="true">→</span></button>}
      </div>}
      {screen==='activity'&&<SchoolActivity key={`${question.activityId}-${question.variant}-${question.free?'free':'base'}`} question={question} onNext={next} onComplete={complete} onFreeArt={subject==='arts'?()=>setQuestion({...makeQuestion('3-5-arts'),activityId:`${band}-arts`,free:true}):null}/>}
    </div>
  </div>;
}
