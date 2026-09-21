import { useState } from 'react';
import { SchoolShape } from './SchoolShape.jsx';
import { paintCell } from './activities.js';
import {useGame} from '../../store/useGame.js';

const COLORS = [['blue','Azul'],['sun','Amarelo'],['coral','Coral'],['grass','Verde']];
const SHAPES = [['circle','Círculo'],['square','Quadrado'],['triangle','Triângulo']];
export function SchoolStudio({ onComplete, speak, onPublish }) {
  const [color,setColor]=useState('blue');
  const [shape,setShape]=useState('circle');
  const [history,setHistory]=useState([Array(16).fill(null)]);
  const [shown,setShown]=useState(false);
  const [published,setPublished]=useState(false);
  const board=history[history.length-1];
  function paint(index) {
    setHistory(h=>[...h.slice(-49),paintCell(h[h.length-1],index,{color,shape})]);
    setShown(false);
    setPublished(false);
  }
  return <div className="school-studio">
    <div className="school-tools">
      <fieldset><legend>Escolha a cor</legend><div className="school-swatches">
        {COLORS.map(([id,label])=><button key={id} aria-label={label} aria-pressed={color===id} onClick={()=>{setColor(id);speak(label);}}><SchoolShape color={id}/></button>)}
      </div></fieldset>
      <fieldset><legend>Escolha a forma</legend><div className="school-swatches">
        {SHAPES.map(([id,label])=><button key={id} aria-label={label} aria-pressed={shape===id} onClick={()=>{setShape(id);speak(label);}}><SchoolShape shape={id} color={color}/></button>)}
      </div></fieldset>
      <button className="school-small" disabled={history.length===1} onClick={()=>{setHistory(h=>h.slice(0,-1));setShown(false);setPublished(false);}}>↶ Desfazer</button>
    </div>
    <div className="school-paper" role="group" aria-label="Papel para criar com 16 espaços">
      {board.map((cell,i)=><button key={i} aria-label={`Pintar espaço ${i+1}${cell ? ', já pintado' : ''}`} onClick={()=>paint(i)}>{cell&&<SchoolShape {...cell}/>}</button>)}
    </div>
    <button className="school-primary school-show" disabled={!board.some(Boolean)||shown} onClick={()=>{setShown(true);onComplete();}}>✨ Mostrar ao Órbi</button>
    <button className="school-small school-show" disabled={!board.some(Boolean)||published} onClick={()=>{
      if(useGame.getState().publicarArteEscola(board)){setPublished(true);onPublish?.();speak('Sua criação está no mural da escola! Volte à cidade para ver.');}
    }}>🖼️ Colocar no mural</button>
    <p className="school-mural-note" role="status">{published?'Sua criação está na fachada! Volte à cidade para ver.':'Você pode colocar esta criação no mural. Ela fica lá enquanto a página estiver aberta.'}</p>
  </div>;
}
