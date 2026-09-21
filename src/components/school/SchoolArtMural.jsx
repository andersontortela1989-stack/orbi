import {useLayoutEffect,useState} from 'react';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {TINTAS} from '../../brand/paleta3d.js';

export function SchoolArtMural({board,face}){
 const [texture,setTexture]=useState(null);
 useLayoutEffect(()=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=TINTAS.paper;ctx.fillRect(0,0,256,256);
  board.forEach((cell,i)=>{
   if(!cell)return;
   const x=(i%4)*64,y=Math.floor(i/4)*64;
   ctx.fillStyle=TINTAS[cell.color];ctx.strokeStyle=TINTAS.ink;ctx.lineWidth=2;
   ctx.beginPath();
   if(cell.shape==='circle')ctx.arc(x+32,y+32,24,0,Math.PI*2);
   else if(cell.shape==='triangle'){ctx.moveTo(x+32,y+7);ctx.lineTo(x+57,y+56);ctx.lineTo(x+7,y+56);ctx.closePath();}
   else ctx.rect(x+8,y+8,48,48);
   ctx.fill();ctx.stroke();
  });
  const next=new CanvasTexture(canvas);next.colorSpace=SRGBColorSpace;setTexture(next);
  return()=>next.dispose();
 },[board]);
 return <group name="OrbiSchoolArt" position={[5.3,2.95,face+.14]}>
  <mesh position={[0,0,-.03]}><boxGeometry args={[3.65,3.65,.04]}/><meshBasicMaterial color={TINTAS.ink}/></mesh>
  <mesh><planeGeometry args={[3.4,3.4]}/><meshBasicMaterial map={texture} color={texture?'white':TINTAS.paper} toneMapped={false}/></mesh>
 </group>;
}
