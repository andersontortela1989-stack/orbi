import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { TINTAS } from '../brand/paleta3d.js';
import { enviarEventoAventura } from '../adventure/runtime.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { coordenadorAtividade } from '../activity/index.js';

const POSICOES = [
  [-44, 8], [-44, 14], [-44, 20], [-44, 26],
];
const RAIO_COLETA_2 = 2.7 * 2.7;

function Balde({ pos }) {
  return (
    <group position={[pos[0], 0.62, pos[1]]}>
      <mesh>
        <cylinderGeometry args={[0.58, 0.44, 0.9, 14]} />
        <meshLambertMaterial color={TINTAS.blue} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.49, 16]} />
        <meshBasicMaterial color={TINTAS.skyHi} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.06, 8, 16, Math.PI]} />
        <meshBasicMaterial color={TINTAS.ink} />
      </mesh>
    </group>
  );
}

/** Quatro baldes coletáveis, visíveis somente na etapa correspondente. */
export function BaldesAventura({ targetRef }) {
  const aventura = useAdventure();
  const [coletados, setColetados] = useState(() => new Set());
  const coletadosRef = useRef(new Set());

  useEffect(() => {
    coletadosRef.current = new Set();
    setColetados(new Set());
  }, [aventura.id]);

  useFrame(() => {
    if (aventura.etapa !== 'contar-baldes') return;
    if (!coordenadorAtividade.temFoco('em_missao')) return;
    const rb = targetRef.current;
    if (!rb) return;
    const carro = rb.translation();

    for (let i = 0; i < POSICOES.length; i += 1) {
      if (coletadosRef.current.has(i)) continue;
      const [x, z] = POSICOES[i];
      const dx = carro.x - x;
      const dz = carro.z - z;
      if (dx * dx + dz * dz >= RAIO_COLETA_2) continue;
      if (enviarEventoAventura({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 })) {
        coletadosRef.current.add(i);
        setColetados(new Set(coletadosRef.current));
      }
      break;
    }
  });

  if (aventura.etapa !== 'contar-baldes') return null;
  return (
    <>
      {POSICOES.map((pos, i) =>
        coletados.has(i) ? null : <Balde key={i} pos={pos} />
      )}
    </>
  );
}
