import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETA3D, TINTAS } from '../brand/paleta3d.js';
import { enviarEventoAventura } from '../adventure/runtime.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { RAIO_COLETA, SACO, itensDaEtapa } from '../adventure/itens.js';
import { coordenadorAtividade } from '../activity/index.js';

const RAIO_COLETA_2 = RAIO_COLETA * RAIO_COLETA;

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
 *
 * H3: 1,3× maior, contorno navy pelo avesso (o mesmo material básico do
 * contorno dos prédios e dos canteiros da ESCOLA) e amarrado coral, para
 * destacar do asfalto. Quatro malhas; medidas em adventure/itens.js (SACO).
 */
function Saco({ pos }) {
  const { escala, corpo, amarrado, broto, contorno } = SACO;
  const borda = contorno / escala; // espessura local, para dar 0,08 no mundo
  return (
    <group position={[pos[0], 0, pos[1]]} scale={escala}>
      <mesh position={[0, corpo.altura / 2, 0]}>
        <cylinderGeometry
          args={[corpo.raioTopo + borda, corpo.raioBase + borda, corpo.altura + 2 * borda, 12]}
        />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, corpo.altura / 2, 0]}>
        <cylinderGeometry args={[corpo.raioTopo, corpo.raioBase, corpo.altura, 12]} />
        <meshLambertMaterial color={TINTAS.paper} />
      </mesh>
      <mesh position={[0, amarrado.y, 0]}>
        <cylinderGeometry args={[amarrado.raioTopo, amarrado.raioBase, amarrado.altura, 12]} />
        <meshBasicMaterial color={TINTAS.coral} />
      </mesh>
      <mesh position={[0, broto.y, 0]} scale={[1, broto.achatado, 1]}>
        <sphereGeometry args={[broto.raio, 10, 8]} />
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
