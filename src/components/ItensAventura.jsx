import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { TINTAS } from '../brand/paleta3d.js';
import { enviarEventoAventura } from '../adventure/runtime.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { itensDaEtapa } from '../adventure/itens.js';
import { coordenadorAtividade } from '../activity/index.js';

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

/**
 * Saco de semente da Horta (H1): saco claro amarrado, com um broto em cima —
 * nada de caramelo (é a cor dos pães da PADARIA, que não são coletáveis).
 */
function Saco({ pos }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.42, 0.56, 1.0, 12]} />
        <meshLambertMaterial color={TINTAS.paper} />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.12, 12]} />
        <meshBasicMaterial color={TINTAS.inkSoft} />
      </mesh>
      <mesh position={[0, 1.32, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshLambertMaterial color={TINTAS.grass} />
      </mesh>
    </group>
  );
}

const VISUAL = { balde: Balde, saco: Saco };

/**
 * Coletáveis das aventuras (baldes do parque, sacos de semente da Horta),
 * visíveis somente na etapa de coleta correspondente. Posições e item vêm de
 * adventure/itens.js; a coleta é por proximidade, dirigindo, sem física nova.
 */
export function ItensAventura({ targetRef }) {
  const aventura = useAdventure();
  const itens = itensDaEtapa(aventura.etapa, aventura.contador);
  const [coletados, setColetados] = useState(() => new Set());
  const coletadosRef = useRef(new Set());

  useEffect(() => {
    coletadosRef.current = new Set();
    setColetados(new Set());
  }, [aventura.id, aventura.etapa]);

  useFrame(() => {
    if (!itens) return;
    if (!coordenadorAtividade.temFoco('em_missao')) return;
    const rb = targetRef.current;
    if (!rb) return;
    const carro = rb.translation();

    for (let i = 0; i < itens.posicoes.length; i += 1) {
      if (coletadosRef.current.has(i)) continue;
      const [x, z] = itens.posicoes[i];
      const dx = carro.x - x;
      const dz = carro.z - z;
      if (dx * dx + dz * dz >= RAIO_COLETA_2) continue;
      if (enviarEventoAventura({ tipo: 'coletou', item: itens.item, quantidade: 1 })) {
        coletadosRef.current.add(i);
        setColetados(new Set(coletadosRef.current));
      }
      break;
    }
  });

  if (!itens) return null;
  const Visual = VISUAL[itens.visual];
  return (
    <>
      {itens.posicoes.map((pos, i) =>
        coletados.has(i) ? null : <Visual key={i} pos={pos} />
      )}
    </>
  );
}
