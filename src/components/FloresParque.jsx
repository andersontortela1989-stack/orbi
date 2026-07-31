import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';

const POSICOES = [
  [-21, 66], [-17, 64], [-11, 64], [-7, 67],
  [-21, 78], [-17, 80], [-10, 81], [-6, 77],
];

function Flor({ pos, cor }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.2, 8]} />
        <meshLambertMaterial color={TINTAS.grassDeep} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angulo) => (
        <mesh
          key={angulo}
          position={[Math.cos(angulo) * 0.28, 1.28, Math.sin(angulo) * 0.28]}
          scale={[0.42, 0.18, 0.42]}
        >
          <sphereGeometry args={[0.55, 10, 8]} />
          <meshLambertMaterial color={cor} />
        </mesh>
      ))}
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshBasicMaterial color={TINTAS.sun} />
      </mesh>
    </group>
  );
}

/** Consequência visual permanente da aventura do parque. */
export function FloresParque() {
  const florida = useGame((s) => !!s.worldFlags?.parque_florido);
  const grupo = useRef(null);
  const escala = useRef(florida ? 1 : 0.28);
  const anterior = useRef(florida);

  useEffect(() => {
    if (florida && !anterior.current) escala.current = 0.28;
    anterior.current = florida;
  }, [florida]);

  useFrame((_, delta) => {
    if (!grupo.current) return;
    const alvo = florida ? 1 : 0.28;
    escala.current += (alvo - escala.current) * Math.min(1, delta * 2.2);
    grupo.current.scale.setScalar(escala.current);
  });

  return (
    <group ref={grupo}>
      {POSICOES.map((pos, i) => (
        <Flor
          key={`${pos[0]}:${pos[1]}`}
          pos={pos}
          cor={i % 2 === 0 ? TINTAS.coral : TINTAS.blue}
        />
      ))}
    </group>
  );
}

