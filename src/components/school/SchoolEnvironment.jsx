import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { createSchoolLayout } from './school-layout.js';
import {useGame} from '../../store/useGame.js';
import {SchoolLivingEnvironment} from './SchoolLivingEnvironment.jsx';
import {SchoolArtMural} from './SchoolArtMural.jsx';

export function SchoolEnvironment({building}) {
  const layout = useMemo(() => createSchoolLayout(building), [building]);
  const horta=useGame(s=>s.horta);
  const art=useGame(s=>s.arteEscola);
  if (!layout) return null;
  const boxes=layout.boxes.filter(b=>!(horta&&b.id.startsWith('flower--1-'))&&!(art&&b.zone==='mural'));
  const crowns=layout.crowns.filter(b=>!(horta&&b.id.startsWith('plant--1-')));
  const revision=`${!!horta}-${!!art}`;
  return (
    <group name="OrbiSchoolEnvironment" position={layout.origin}>
      {/* Decoração estática: matrizes e cores são enviadas uma única vez. */}
      <Instances key={`static-boxes-${revision}`} limit={boxes.length} frames={1}>
        <boxGeometry args={[1,1,1]} />
        {/* Pintura adesiva: cores chapadas como a placa, sem luz adicional. */}
        <meshBasicMaterial />
        {boxes.map(item => (
          <Instance key={item.id} position={item.position} scale={item.scale} color={item.color} />
        ))}
      </Instances>
      <Instances key={`static-crowns-${revision}`} limit={crowns.length} frames={1}>
        <icosahedronGeometry args={[0.5,0]} />
        <meshLambertMaterial />
        {crowns.map(item => (
          <Instance key={item.id} position={item.position} scale={item.scale} color={item.color} />
        ))}
      </Instances>
      {horta&&<SchoolLivingEnvironment horta={horta}/>}
      {art&&<SchoolArtMural board={art} face={building.size[2]/2+.27}/>}
    </group>
  );
}
