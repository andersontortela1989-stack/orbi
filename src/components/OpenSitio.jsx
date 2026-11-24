import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';
import {
  CAVALOS_SITIO,
  PASTO_SITIO,
  PEIXES_SITIO,
  PORTEIRA_SITIO,
  RIO_SITIO,
} from '../city/sitio.js';

const DEITADO = [-Math.PI / 2, 0, 0];
const TRACO_CAVALO = 0.12;
const ESCALA_CAVALO = 1.45;

function ContornoCaixa({ position, size }) {
  const [w, h, l] = size;
  return (
    <mesh
      position={position}
      scale={[
        (w + 2 * TRACO_CAVALO) / w,
        (h + 2 * TRACO_CAVALO) / h,
        (l + 2 * TRACO_CAVALO) / l,
      ]}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
    </mesh>
  );
}

/** Cavalo estático no estilo sticker de Bichos.jsx (sem colisor). */
function Cavalo({ cor }) {
  const crina = PALETA3D.sitio.crina;
  return (
    <>
      <ContornoCaixa position={[0, 0.56, -0.05]} size={[0.72, 0.62, 1.55]} />
      <mesh position={[0, 0.56, -0.05]}>
        <boxGeometry args={[0.72, 0.62, 1.55]} />
        <meshLambertMaterial color={cor} />
      </mesh>
      <ContornoCaixa position={[0, 0.92, 0.72]} size={[0.36, 0.55, 0.42]} />
      <mesh position={[0, 0.92, 0.72]}>
        <boxGeometry args={[0.36, 0.55, 0.42]} />
        <meshLambertMaterial color={cor} />
      </mesh>
      <mesh position={[0, 1.05, 1.02]}>
        <boxGeometry args={[0.3, 0.28, 0.52]} />
        <meshLambertMaterial color={cor} />
      </mesh>
      <mesh position={[0, 1.18, 0.48]}>
        <boxGeometry args={[0.16, 0.14, 0.72]} />
        <meshLambertMaterial color={crina} />
      </mesh>
      <mesh position={[-0.12, 1.28, 0.76]}>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        <meshLambertMaterial color={cor} />
      </mesh>
      <mesh position={[0.12, 1.28, 0.76]}>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        <meshLambertMaterial color={cor} />
      </mesh>
      <mesh position={[0, 0.68, -1.04]} rotation={[1.2, 0, 0]}>
        <boxGeometry args={[0.14, 0.58, 0.14]} />
        <meshLambertMaterial color={crina} />
      </mesh>
      {[-0.22, 0.22].flatMap((px) =>
        [-0.52, 0.44].map((pz) => (
          <mesh key={`${px}:${pz}`} position={[px, 0.16, pz]}>
            <boxGeometry args={[0.14, 0.34, 0.14]} />
            <meshLambertMaterial color={crina} />
          </mesh>
        ))
      )}
    </>
  );
}

/** Porteira de madeira aberta na frente (+Z) com placa SÍTIO. */
function PorteiraSitio() {
  const meioVao = PORTEIRA_SITIO.vaoLivre / 2;
  const madeira = PALETA3D.sitio.madeira;
  const cerca = PALETA3D.sitio.cerca;

  return (
    <group position={[0, 0, PORTEIRA_SITIO.z]}>
      {[-meioVao, meioVao].map((px) => (
        <mesh key={px} position={[px, 1.5, 0]}>
          <boxGeometry args={[0.38, 3.0, 0.38]} />
          <meshLambertMaterial color={madeira} />
        </mesh>
      ))}
      <mesh position={[0, 2.75, 0]}>
        <boxGeometry args={[PORTEIRA_SITIO.vaoLivre + 1.2, 0.32, 0.32]} />
        <meshLambertMaterial color={cerca} />
      </mesh>
      <mesh position={[0, 2.75, 0.08]}>
        <boxGeometry args={[5.4, 1.35, 0.26]} />
        <meshStandardMaterial color={TINTAS.grassDeep} roughness={0.62} />
      </mesh>
      <Text
        position={[0, 2.75, 0.24]}
        fontSize={0.86}
        color={TINTAS.white}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        fontWeight={700}
      >
        SÍTIO
      </Text>
    </group>
  );
}

/** Cercado baixo em U ao redor do pasto (aberto na frente para visibilidade). */
function CercadoPasto() {
  const [cx, cz] = PASTO_SITIO.centro;
  const [w, l] = PASTO_SITIO.tamanho;
  const cerca = PALETA3D.sitio.cerca;
  const madeira = PALETA3D.sitio.madeira;

  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.032, 0]} rotation={DEITADO}>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial color={PALETA3D.sitio.pasto} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.62, -l / 2]}>
        <boxGeometry args={[w, 0.16, 0.16]} />
        <meshLambertMaterial color={cerca} />
      </mesh>
      <mesh position={[0, 0.32, -l / 2]}>
        <boxGeometry args={[w, 0.14, 0.14]} />
        <meshLambertMaterial color={cerca} />
      </mesh>
      {[-w / 2, w / 2].map((sx) => (
        <group key={sx} position={[sx, 0, 0]}>
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.16, 0.16, l]} />
            <meshLambertMaterial color={cerca} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.14, 0.14, l]} />
            <meshLambertMaterial color={cerca} />
          </mesh>
        </group>
      ))}
      {[-w / 2, w / 2].flatMap((sx) =>
        [-l / 2, 0, l / 2].map((sz) => (
          <mesh key={`${sx}:${sz}`} position={[sx, 0.46, sz]}>
            <boxGeometry args={[0.24, 0.92, 0.24]} />
            <meshLambertMaterial color={madeira} />
          </mesh>
        ))
      )}
    </group>
  );
}

/** Rio calmo com margem de areia e 3 peixinhos (imóveis no Modo Tranquilo). */
function RioSitio({ animar, tranquilo }) {
  const [cx, cz] = RIO_SITIO.centro;
  const [w, l] = RIO_SITIO.tamanho;
  const peixesRef = useRef([]);

  useFrame((estado) => {
    if (!animar) return;
    const t = estado.clock.elapsedTime;
    PEIXES_SITIO.forEach((p, i) => {
      const grupo = peixesRef.current[i];
      if (!grupo) return;
      grupo.position.z = p.pos[1] + Math.sin(t * 0.7 + p.fase) * p.amplitude;
    });
  });

  return (
    <group>
      <mesh position={[cx, 0.028, cz]} rotation={DEITADO}>
        <planeGeometry args={[w + 2.2, l + 2.0]} />
        <meshStandardMaterial color={PALETA3D.sitio.margem} roughness={0.94} />
      </mesh>
      <mesh position={[cx, 0.036, cz]} rotation={DEITADO}>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial
          color={PALETA3D.sitio.rio}
          emissive={PALETA3D.sitio.rioFundo}
          emissiveIntensity={tranquilo ? 0.06 : 0.18}
          roughness={0.3}
        />
      </mesh>
      {PEIXES_SITIO.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => { peixesRef.current[i] = el; }}
          position={[p.pos[0], 0.14, p.pos[1]]}
        >
          <mesh scale={[0.7, 0.45, 1.35]}>
            <sphereGeometry args={[0.42, 12, 10]} />
            <meshLambertMaterial color={PALETA3D.sitio.peixe} />
          </mesh>
          <mesh position={[0, 0, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.26, 0.42, 4]} />
            <meshLambertMaterial color={PALETA3D.sitio.peixe} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Espaço aberto do SÍTIO no quadrante sudoeste (padrão OpenPark):
 * sem colisores invisíveis, com porteira legível, pasto de cavalos e rio.
 */
export function OpenSitio({ floorPos }) {
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const [x, z] = floorPos;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.026, 3.2]} rotation={DEITADO}>
        <planeGeometry args={[4.8, 13.6]} />
        <meshStandardMaterial color={PALETA3D.sitio.trilha} roughness={0.94} />
      </mesh>

      <PorteiraSitio />
      <CercadoPasto />
      <RioSitio animar={visual.animacoes} tranquilo={visual.tranquilo} />

      {CAVALOS_SITIO.map((c) => (
        <group key={c.id}>
          <group
            position={[c.pos[0], 0, c.pos[1]]}
            rotation={[0, c.heading, 0]}
            scale={ESCALA_CAVALO}
          >
            <Cavalo cor={PALETA3D.sitio[c.pelagem]} />
          </group>
          <mesh
            position={[c.pos[0] + SOMBRA_SOLIDA.dx, 0.038, c.pos[1] + SOMBRA_SOLIDA.dz]}
            rotation={DEITADO}
          >
            <circleGeometry args={[1.15, 18]} />
            <meshBasicMaterial
              color={SOMBRA_SOLIDA.cor}
              transparent
              opacity={SOMBRA_SOLIDA.opacidade}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}