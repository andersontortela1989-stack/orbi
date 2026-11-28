import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { CALCADA_EXTRA } from '../city/geometria.js';
import { PORTO_LAYOUT } from '../city/porto.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

const TRACO = 0.2;

function Conteiner({ x, y, z, w, h, l, cor }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[w, h, l]} />
        <meshStandardMaterial color={cor} roughness={0.62} />
      </mesh>
      {/* Friso escuro superior para dar leitura de contêiner */}
      <mesh position={[0, h / 2 + 0.04, 0]}>
        <boxGeometry args={[w + 0.08, 0.08, l + 0.08]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.7} />
      </mesh>
    </group>
  );
}

function GuindastePortuario() {
  const { x, z, altura, lanca } = PORTO_LAYOUT.guindaste;
  return (
    <group position={[x, 0.1, z]}>
      {/* Base de concreto */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.2, 0.6, 2.2]} />
        <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.85} />
      </mesh>
      {/* Torre amarela */}
      <mesh position={[0, altura / 2 + 0.3, 0]}>
        <boxGeometry args={[0.9, altura, 0.9]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
      </mesh>
      {/* Cabine do operador */}
      <mesh position={[0.7, altura - 1.2, 0.4]}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color={TINTAS.blueSoft} roughness={0.35} />
      </mesh>
      {/* Lança horizontal apontando para o pátio de contêineres */}
      <mesh position={[lanca / 2 - 1.2, altura + 0.35, 0]}>
        <boxGeometry args={[lanca, 0.65, 0.7]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
      </mesh>
      {/* Cabo e gancho */}
      <mesh position={[lanca - 2.1, altura - 1.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3.6, 6]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.7} />
      </mesh>
      <mesh position={[lanca - 2.1, altura - 3.5, 0]}>
        <boxGeometry args={[0.55, 0.35, 0.55]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * PORTO detalhado (armazém portuário + torre de controle + contêineres + guindaste).
 * Preserva exatamente a pegada [16, 7, 14] e o colisor do Building original.
 */
export function OpenPorto({ floorPos }) {
  const [x, z] = floorPos;
  const [w, h, l] = PORTO_LAYOUT.size;
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const corParede = PALETA3D.predios.PORTO;

  return (
    <group position={[x, 0, z]}>
      {/* Calçada padrão */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[w + CALCADA_EXTRA, 0.16, l + CALCADA_EXTRA]} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.9} />
      </mesh>

      {/* Sombra sólida */}
      <mesh position={[SOMBRA_SOLIDA.dx, 0.2, SOMBRA_SOLIDA.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.5, l + 0.5]} />
        <meshBasicMaterial
          color={SOMBRA_SOLIDA.cor}
          transparent
          opacity={SOMBRA_SOLIDA.opacidade + 0.04}
          depthWrite={false}
        />
      </mesh>

      {/* Colisor único idêntico ao Building histórico */}
      <RigidBody type="fixed" colliders={false} position={[0, h / 2, 0]}>
        <CuboidCollider args={[w / 2, h / 2, l / 2]} />
      </RigidBody>

      {/* Corpo principal do armazém */}
      <group position={[0, h / 2, 0]}>
        <mesh scale={[(w + 2 * TRACO) / w, (h + 2 * TRACO) / h, (l + 2 * TRACO) / l]}>
          <boxGeometry args={[w, h, l]} />
          <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <boxGeometry args={[w, h, l]} />
          <meshStandardMaterial color={corParede} roughness={0.68} />
        </mesh>
      </group>

      {/* Telhado industrial em duas águas + claraboias */}
      <mesh position={[0, h + 0.2, 0]}>
        <boxGeometry args={[w + 0.6, 0.36, l + 0.6]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.7} />
      </mesh>
      <mesh position={[0, h + 0.72, 0]}>
        <boxGeometry args={[w - 1.4, 0.75, l - 2.0]} />
        <meshStandardMaterial color={TINTAS.blueSoft} roughness={0.7} />
      </mesh>

      {/* Torre de controle portuária no canto superior */}
      <group position={[4.8, h + 1.1, -3.2]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[3.4, 2.6, 3.4]} />
          <meshStandardMaterial color={TINTAS.white} roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[3.55, 0.95, 3.55]} />
          <meshStandardMaterial
            color={TINTAS.sky}
            emissive={TINTAS.sky}
            emissiveIntensity={visual.brilhoJanela}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 2.75, 0]}>
          <boxGeometry args={[3.9, 0.3, 3.9]} />
          <meshStandardMaterial color={TINTAS.ink} roughness={0.6} />
        </mesh>
      </group>

      {/* Portões de doca na fachada frontal (+Z) */}
      {[-4.4, 0, 4.4].map((dx) => (
        <group key={dx} position={[dx, 1.55, l / 2 + 0.06]}>
          <mesh>
            <boxGeometry args={[2.8, 2.9, 0.14]} />
            <meshStandardMaterial color={TINTAS.ink} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[2.4, 2.55, 0.08]} />
            <meshStandardMaterial color={TINTAS.blueSoft} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Letreiro PORTO */}
      <group position={[0, 5.4, l / 2 + 0.25]}>
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[6.4, 1.75, 0.2]} />
          <meshBasicMaterial color={TINTAS.ink} />
        </mesh>
        <mesh>
          <boxGeometry args={[6.05, 1.42, 0.2]} />
          <meshStandardMaterial color={TINTAS.white} roughness={0.55} />
        </mesh>
        <Text
          position={[0, 0, 0.14]}
          fontSize={0.96}
          color={TINTAS.ink}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
          fontWeight={700}
        >
          PORTO
        </Text>
      </group>

      {/* Pátio de contêineres e guindaste */}
      {PORTO_LAYOUT.conteineres.map((c) => (
        <Conteiner key={c.id} {...c} />
      ))}
      <GuindastePortuario />
    </group>
  );
}
