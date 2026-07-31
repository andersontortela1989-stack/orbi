import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { PALETA3D, TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

const DEITADO = [-Math.PI / 2, 0, 0];

function Fonte({ animar, tranquilo }) {
  const agua = useRef(null);
  useFrame((estado) => {
    if (!animar || !agua.current) return;
    agua.current.position.y = 1.48 + Math.sin(estado.clock.elapsedTime * 1.4) * 0.1;
    agua.current.rotation.y += 0.004;
  });

  return (
    <group position={[2, 0, 0]}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[2.05, 2.3, 0.62, 24]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[1.72, 1.82, 0.24, 24]} />
        <meshStandardMaterial
          color={PALETA3D.agua}
          emissive={PALETA3D.agua}
          emissiveIntensity={tranquilo ? 0.08 : 0.28}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.22, 0.31, 0.92, 14]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
      </mesh>
      <mesh ref={agua} position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.43, 16, 12]} />
        <meshStandardMaterial
          color={TINTAS.skyHi}
          emissive={PALETA3D.agua}
          emissiveIntensity={tranquilo ? 0.1 : 0.5}
          transparent
          opacity={0.86}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function PlacaParque() {
  return (
    <group position={[0, 0, 8.4]}>
      {[-3.15, 3.15].map((x) => (
        <mesh key={x} position={[x, 1.45, 0]}>
          <cylinderGeometry args={[0.16, 0.21, 2.9, 10]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[7.2, 1.65, 0.3]} />
        <meshStandardMaterial color={TINTAS.grassDeep} roughness={0.62} />
      </mesh>
      <Text
        position={[0, 2.45, 0.18]}
        fontSize={0.92}
        color={TINTAS.white}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        fontWeight={700}
      >
        PARQUE
      </Text>
    </group>
  );
}

function Playground() {
  return (
    <group position={[-7, 0, -0.8]}>
      {/* Escorregador */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.8, 0.28, 1.8]} />
        <meshStandardMaterial color={TINTAS.violet} roughness={0.55} />
      </mesh>
      {[-0.7, 0.7].flatMap((x) => [-0.7, 0.7].map((z) => (
        <mesh key={`${x}:${z}`} position={[x, 0.62, z]}>
          <cylinderGeometry args={[0.11, 0.14, 1.25, 8]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.7} />
        </mesh>
      )))}
      <mesh position={[0, 0.72, 1.65]} rotation={[0.62, 0, 0]}>
        <boxGeometry args={[1.15, 0.18, 2.6]} />
        <meshStandardMaterial color={TINTAS.blue} roughness={0.48} />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.8, 1.25, 4]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.58} />
      </mesh>

      {/* Gangorra */}
      <mesh position={[3.2, 0.62, -0.2]} rotation={[0, 0.2, 0.12]}>
        <boxGeometry args={[3.8, 0.22, 0.45]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
      </mesh>
      <mesh position={[3.2, 0.28, -0.2]}>
        <cylinderGeometry args={[0.18, 0.45, 0.58, 10]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.72} />
      </mesh>
    </group>
  );
}

function Bancos() {
  return (
    <>
      {[[-5.5, -6.6, 0], [6.3, 5.6, Math.PI]].map(([x, z, rot], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[2.8, 0.28, 0.72]} />
            <meshStandardMaterial color={TINTAS.sunDeep} roughness={0.68} />
          </mesh>
          {[-1.05, 1.05].map((px) => (
            <mesh key={px} position={[px, 0.28, 0]}>
              <boxGeometry args={[0.22, 0.65, 0.55]} />
              <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.72} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/**
 * Parque aberto do bairro norte. Mantém a âncora histórica [-14,72] usada
 * pelos sensores, mas troca o antigo cubo por uma praça-jardim sem colisões
 * invisíveis. Flores, carona e aventura continuam em suas camadas originais.
 */
export function OpenPark({ floorPos }) {
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const [x, z] = floorPos;

  return (
    <group position={[x, 0, z]}>
      {/* Gramado oval e caminho circular; ambos são apenas visuais. */}
      <mesh position={[0, 0.037, 0]} rotation={DEITADO} scale={[1.38, 1, 1.02]}>
        <circleGeometry args={[10.2, 48]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.043, 0]} rotation={DEITADO} scale={[1.32, 1, 0.96]}>
        <circleGeometry args={[10.0, 48]} />
        <meshStandardMaterial color={TINTAS.grass} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.052, 0]} rotation={DEITADO} scale={[1.16, 1, 0.78]}>
        <ringGeometry args={[6.1, 7.35, 48]} />
        <meshStandardMaterial color={TINTAS.sunSoft} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.055, 0]}>
        <boxGeometry args={[2.3, 0.08, 18.2]} />
        <meshStandardMaterial color={TINTAS.sunSoft} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.058, 0]}>
        <boxGeometry args={[24.2, 0.08, 2.1]} />
        <meshStandardMaterial color={TINTAS.sunSoft} roughness={0.92} />
      </mesh>

      <Fonte animar={visual.animacoes} tranquilo={visual.tranquilo} />
      <PlacaParque />
      {visual.detalhes && (
        <>
          <Playground />
          <Bancos />
        </>
      )}
    </group>
  );
}
