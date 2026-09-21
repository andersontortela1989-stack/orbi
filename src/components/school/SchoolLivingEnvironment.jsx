import {Instances,Instance} from '@react-three/drei';
import {TINTAS,PALETA3D} from '../../brand/paleta3d.js';
import {gardenView} from './school-living-model.js';

export function SchoolLivingEnvironment({horta}){
 const garden=gardenView(horta);if(!garden)return null;
 const boxes=garden.beds.map((b,i)=>({id:`soil-${i}`,p:[b.x,.46,b.z],s:[b.width,.10,1.24],c:b.wet?PALETA3D.terraHortaMolhada:PALETA3D.terraHorta}));
 const leaves=[];
 garden.beds.forEach((b,i)=>{
  if(b.wet)boxes.push({id:`water-${i}`,p:[b.x,.53,b.z+.48],s:[b.width-.14,.035,.15],c:TINTAS.blue});
 });
 garden.seeds.forEach((b,i)=>leaves.push({id:`seed-${i}`,p:[b.x,.58,b.z],s:[.34,.22,.34],c:TINTAS.sun}));
 garden.sprouts.forEach((b,i)=>{
  boxes.push({id:`stem-${i}`,p:[b.x,.9,b.z],s:[.09,.85,.09],c:TINTAS.grassDeep});
  leaves.push({id:`leaf-a-${i}`,p:[b.x-.18,1.02,b.z],s:[.55,.3,.42],c:TINTAS.grass});
  leaves.push({id:`leaf-b-${i}`,p:[b.x+.17,1.25,b.z],s:[.5,.32,.4],c:TINTAS.grass});
 });
 // frames=1 é reiniciado somente quando uma ação muda as peças exibidas.
 const revision=JSON.stringify(garden);
 return <group name="OrbiLivingGarden" userData={{beds:garden.beds.length,seeds:garden.seeds.length,sprouts:garden.sprouts.length}}>
  <Instances key={`boxes-${revision}`} limit={boxes.length} frames={1}><boxGeometry/><meshBasicMaterial/>{boxes.map(b=><Instance key={b.id} position={b.p} scale={b.s} color={b.c}/>)}</Instances>
  {leaves.length>0&&<Instances key={`leaves-${revision}`} limit={leaves.length} frames={1}><icosahedronGeometry args={[.5,0]}/><meshBasicMaterial/>{leaves.map(b=><Instance key={b.id} position={b.p} scale={b.s} color={b.c}/>)}</Instances>}
 </group>;
}
