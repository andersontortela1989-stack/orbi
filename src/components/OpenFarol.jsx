import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { CALCADA_EXTRA } from '../city/geometria.js';
import { FAROL_LAYOUT } from '../city/porto.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

function NavioCargueiro({ x, z, w, l }) {
  return (
    <group position={[x, 0.18, z]}>
      {/* Casco escuro + faixa coral */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[w, 0.9, l]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <boxGeometry args={[w + 0.15, 0.22, l + 0.12]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
      </mesh>
      {/* Proa em cunha apontando para oeste (-X) */}
      <mesh position={[-w / 2 - 0.65, 0.52, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.1, 0.95, 2.1]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.65} />
      </mesh>
      {/* Ponte de comando branca na popa (+X) */}
      <mesh position={[w / 2 - 1.5, 1.85, 0]}>
        <boxGeometry args={[2.2, 1.7, l - 0.5]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 - 1.5, 2.15, 0]}>
        <boxGeometry args={[2.3, 0.45, l - 0.35]} />
        <meshStandardMaterial color={TINTAS.sky} roughness={0.3} />
      </mesh>
      {/* Chaminé */}
      <mesh position={[w / 2 - 1.4, 3.05, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.95, 10]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
      </mesh>
      {/* Contêineres no convés */}
      <mesh position={[-2.2, 1.55, -0.55]}>
        <boxGeometry args={[2.8, 0.95, 1.0]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
      </mesh>
      <mesh position={[-2.2, 1.55, 0.55]}>
        <boxGeometry args={[2.8, 0.95, 1.0]} />
        <meshStandardMaterial color={TINTAS.blue} roughness={0.6} />
      </mesh>
      <mesh position={[0.9, 1.55, 0]}>
        <boxGeometry args={[2.6, 0.95, 1.8]} />
        <meshStandardMaterial color={TINTAS.grass} roughness={0.6} />
      </mesh>
    </group>
  );
}

function BarcoPesca({ x, z, rot, cor }) {
  return (
    <group position={[x, 0.16, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[2.8, 0.52, 1.35]} />
        <meshStandardMaterial color={cor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[2.4, 0.14, 1.1]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.65} />
      </mesh>
      {/* Cabinezinha */}
      <mesh position={[0.45, 0.92, 0]}>
        <boxGeometry args={[0.95, 0.65, 0.85]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Pescador({ x, z, corCamisa, corChapeu }) {
  return (
    <group position={[x, 0.42, z]}>
      {/* Tronco */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.42, 0.52, 0.34]} />
        <meshStandardMaterial color={corCamisa} roughness={0.65} />
      </mesh>
      {/* Cabeça + chapéu */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#F7D3B5" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 10]} />
        <meshStandardMaterial color={corChapeu} roughness={0.6} />
      </mesh>
      {/* Varinha de pesca inclinada para a água (+Z) */}
      <mesh position={[0.18, 0.88, 0.72]} rotation={[0.95, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.8, 6]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.7} />
      </mesh>
    </group>
  );
}

function BaiaEPier({ detalhes }) {
  const { x, z, w, l, caisZ, pier, navio, barcos, pescadores } = FAROL_LAYOUT.baia;

  return (
    <group>
      {/* Espelho d'água da baía */}
      <mesh position={[x, 0.08, z]}>
        <boxGeometry args={[w, 0.14, l]} />
        <meshStandardMaterial color={TINTAS.blue} roughness={0.28} />
      </mesh>
      {/* Faixas sutis de espuma junto ao cais */}
      <mesh position={[x, 0.16, caisZ + 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.6, 0.42]} />
        <meshBasicMaterial color={TINTAS.blueSoft} />
      </mesh>

      {/* Muro do cais + cabeços de amarração */}
      <mesh position={[x, 0.22, caisZ]}>
        <boxGeometry args={[w + 0.4, 0.44, 0.65]} />
        <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.85} />
      </mesh>
      {[-14, -7, 0, 7, 14, 19].map((cx) => (
        <mesh key={cx} position={[cx, 0.54, caisZ]}>
          <cylinderGeometry args={[0.18, 0.22, 0.36, 8]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
        </mesh>
      ))}

      {/* Píer de madeira avançando sobre a água */}
      <group position={[pier.x, 0.24, pier.z]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[pier.w, 0.18, pier.l]} />
          <meshStandardMaterial color="#B57B4C" roughness={0.85} />
        </mesh>
        {[-1.35, 1.35].map((px) =>
          [-2.6, 0, 2.6].map((pz) => (
            <mesh key={px + '_' + pz} position={[px, -0.05, pz]}>
              <cylinderGeometry args={[0.14, 0.14, 0.6, 8]} />
              <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.85} />
            </mesh>
          ))
        )}
      </group>

      {/* Navio cargueiro atracado */}
      <NavioCargueiro {...navio} />

      {/* Barquinhos de pesca */}
      {barcos.map((b) => (
        <BarcoPesca key={b.id} {...b} />
      ))}

      {/* Pescadores no píer */}
      {detalhes && pescadores.map((p) => (
        <Pescador key={p.id} {...p} />
      ))}
    </group>
  );
}

/**
 * FAROL clássico listrado (coral e branco) + baía portuária com cais, píer,
 * navio cargueiro, barquinhos de pesca e pescadores.
 * Preserva exatamente a pegada [8, 14, 8] e o colisor do Building original.
 */
export function OpenFarol({ floorPos }) {
  const [x, z] = floorPos;
  const [w, h, l] = FAROL_LAYOUT.size;
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);

  return (
    <group position={[x, 0, z]}>
      {/* Calçada padrão */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[w + CALCADA_EXTRA, 0.16, l + CALCADA_EXTRA]} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.9} />
      </mesh>

      {/* Sombra sólida */}
      <mesh position={[SOMBRA_SOLIDA.dx, 0.2, SOMBRA_SOLIDA.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[w * 0.56, 20]} />
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

      {/* Base octogonal do farol */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[3.35, 3.6, 0.7, 16]} />
        <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.85} />
      </mesh>

      {/* Torre listrada em coral e branco */}
      {FAROL_LAYOUT.faixas.map((f, idx) => (
        <mesh key={idx} position={[0, f.y, 0]}>
          <cylinderGeometry args={[f.rTopo, f.rBase, f.h, 18]} />
          <meshStandardMaterial color={f.cor} roughness={0.62} />
        </mesh>
      ))}

      {/* Varanda circular */}
      <mesh position={[0, 10.1, 0]}>
        <cylinderGeometry args={[2.55, 2.2, 0.36, 18]} />
        <meshStandardMaterial color={TINTAS.ink} roughness={0.6} />
      </mesh>
      <mesh position={[0, 10.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.42, 0.09, 8, 24]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.55} />
      </mesh>

      {/* Lanterna de vidro com brilho quente estável */}
      <mesh position={[0, 11.35, 0]}>
        <cylinderGeometry args={[1.65, 1.75, 2.0, 16]} />
        <meshStandardMaterial
          color="#FFF3B0"
          emissive={TINTAS.sun}
          emissiveIntensity={Math.max(0.35, visual.brilhoJanela * 1.4)}
          roughness={0.2}
        />
      </mesh>

      {/* Cúpula arredondada + ponta */}
      <mesh position={[0, 12.5, 0]}>
        <sphereGeometry args={[1.82, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
      </mesh>
      <mesh position={[0, 14.3, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.75, 8]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
      </mesh>

      {/* Letreiro FAROL voltado para a rua (-Z/+X) */}
      <group position={[0, 8.6, -2.55]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[4.4, 1.35, 0.18]} />
          <meshBasicMaterial color={TINTAS.ink} />
        </mesh>
        <mesh>
          <boxGeometry args={[4.1, 1.06, 0.18]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.13]}
          fontSize={0.72}
          color={TINTAS.ink}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
          fontWeight={700}
        >
          FAROL
        </Text>
      </group>

      {/* Baía, píer, navio, barcos e pescadores */}
      <BaiaEPier detalhes={visual.detalhes} />
    </group>
  );
}
