import test from 'node:test';
import assert from 'node:assert/strict';
import {falar,pararFala} from '../src/audio/voz.js';
import {voiceState,setVoiceMuted,repeatVoice} from '../src/audio/voice-state.js';

test('silenciar cancela a voz, mantém texto repetível e reativar não despeja falas antigas',()=>{
 const said=[];let cancelled=0;
 globalThis.window={speechSynthesis:{getVoices:()=>[],addEventListener(){},speak:u=>said.push(u.text),cancel(){cancelled++;}}};
 globalThis.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
 setVoiceMuted(false);falar('Vamos observar.');assert.deepEqual(said,['Vamos observar.']);
 setVoiceMuted(true);assert.ok(cancelled>0);assert.equal(falar('Uma pista nova.'),false);assert.equal(repeatVoice(),false);
 assert.equal(voiceState.getSnapshot().text,'Uma pista nova.');setVoiceMuted(false);assert.equal(said.length,1);
 assert.equal(repeatVoice(),true);assert.deepEqual(said,['Vamos observar.','Uma pista nova.']);
 pararFala();assert.equal(repeatVoice(),false);
 delete globalThis.window;delete globalThis.SpeechSynthesisUtterance;
});
