import {useSyncExternalStore} from 'react';
import {voiceState,setVoiceMuted,repeatVoice} from '../audio/voice-state.js';
import './orbi-participation.css';

export function VoiceControls({compact=false,repeat=false}){
 const {muted,text}=useSyncExternalStore(voiceState.subscribe,voiceState.getSnapshot);
 return <div className={`orbi-voice-controls${compact?' is-compact':''}`} aria-label="Voz do Órbi">
  {repeat&&<button type="button" disabled={muted||!text} aria-label="Repetir última fala do Órbi" title="Repetir última fala" onClick={e=>{repeatVoice();e.currentTarget.blur();}}>↻</button>}
  <button type="button" aria-label={muted?'Ativar voz do Órbi':'Silenciar voz do Órbi'} aria-pressed={muted} title={muted?'Ativar voz do Órbi':'Silenciar voz do Órbi'} onClick={e=>{setVoiceMuted(!muted);e.currentTarget.blur();}}>
   <span aria-hidden="true">{muted?'🔇':'🔊'}</span>{!compact&&<span>{muted?'Voz desligada':'Voz ligada'}</span>}
  </button>
 </div>;
}
