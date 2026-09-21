// Preferência e última fala apenas nesta página; não alteram o save do jogo.
let snapshot={muted:false,text:''};
let repeat=null;
const listeners=new Set();
function update(next){snapshot={...snapshot,...next};listeners.forEach(fn=>fn());}
export const voiceState={getSnapshot:()=>snapshot,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
export function rememberVoice(text,again){repeat=again;if(snapshot.text!==text)update({text});}
export function clearVoice(){repeat=null;if(snapshot.text)update({text:''});}
export function setVoiceMuted(muted){
 if(snapshot.muted===muted)return;
 update({muted});
 if(muted&&typeof window!=='undefined')window.speechSynthesis?.cancel();
}
export function repeatVoice(){return !snapshot.muted&&repeat?repeat():false;}
