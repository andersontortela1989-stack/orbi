import { useMemo, useRef } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETA3D, TINTAS } from '../brand/paleta3d.js';

const LUZES = [
  [-9, 4], [9, 5], [-12, 22], [12, 24], [-5, 42], [7, 48],
  [-27, 25], [27, 23], [-8, 60], [8, 65], [-10, 79], [5, 82],
];

function PostesMagicos() {
  return (
    <>
      <Instances limit={LUZES.length}>
        <cylinderGeometry args={[0.11, 0.16, 3.1, 10]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.72} />
        {LUZES.map(([x, z], i) => (
          <Instance key={i} position={[x, 1.55, z]} />
        ))}
      </Instances>
      <Instances limit={LUZES.length}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial
          color={PALETA3D.luminaria}
          emissive={PALETA3D.luminaria}
          emissiveIntensity={1.25}
          roughness={0.25}
        />
        {LUZES.map(([x, z], i) => (
          <Instance key={i} position={[x, 3.35, z]} />
        ))}
      </Instances>
    </>
  );
}

function FonteDoParque({ animar }) {
  const agua = useRef(null);
  useFrame((estado) => {
    if (!animar || !agua.current) return;
    agua.current.position.y = 1.55 + Math.sin(estado.clock.elapsedTime * 1.4) * 0.12;
    agua.current.rotation.y += 0.004;
  });

  return (
    <group position={[-1, 0, 72]}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[2.35, 2.6, 0.62, 24]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[1.95, 2.05, 0.24, 24]} />
        <meshStandardMaterial
          color={PALETA3D.agua}
          emissive={PALETA3D.agua}
          emissiveIntensity={0.25}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.24, 0.34, 1.0, 14]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
      </mesh>
      <mesh ref={agua} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.48, 16, 12]} />
        <meshStandardMaterial
          color={TINTAS.skyHi}
          emissive={PALETA3D.agua}
          emissiveIntensity={0.48}
          transparent
          opacity={0.86}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function DroneAmigo({ animar }) {
  const grupo = useRef(null);
  useFrame((estado) => {
    if (!grupo.current) return;
    const t = estado.clock.elapsedTime;
    grupo.current.position.set(
      11 + (animar ? Math.cos(t * 0.35) * 2.2 : 0),
      4.8 + (animar ? Math.sin(t * 0.9) * 0.25 : 0),
      33 + (animar ? Math.sin(t * 0.35) * 2.2 : 0)
    );
    if (animar) grupo.current.rotation.y = -t * 0.35;
  });
  return (
    <group ref={grupo} position={[11, 4.8, 33]} scale={0.9}>
      <mesh>
        <sphereGeometry args={[0.95, 16, 12]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.83]}>
        <boxGeometry args={[1.15, 0.56, 0.14]} />
        <meshStandardMaterial
          color={TINTAS.ink}
          emissive={TINTAS.blue}
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh position={[-0.23, 0.04, 0.94]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={TINTAS.blueSoft} />
      </mesh>
      <mesh position={[0.23, 0.04, 0.94]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={TINTAS.blueSoft} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.62, 8]} />
        <meshBasicMaterial color={TINTAS.violetDeep} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color={TINTAS.sun} />
      </mesh>
    </group>
  );
}

function Brilhos({ animar }) {
  const pontos = useRef(null);
  const posicoes = useMemo(() => {
    const dados = [];
    for (let i = 0; i < 30; i += 1) {
      const angulo = (i / 30) * Math.PI * 2;
      const raio = 8 + (i % 5) * 3.2;
      dados.push(Math.cos(angulo) * raio, 1.2 + (i % 4) * 0.6, 54 + Math.sin(angulo) * raio);
    }
    return new Float32Array(dados);
  }, []);
  useFrame((_, delta) => {
    if (animar && pontos.current) pontos.current.rotation.y += delta * 0.025;
  });
  return (
    <points ref={pontos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={TINTAS.glow}
        size={0.3}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

export function CityLife({ animar = true }) {
  return (
    <>
      <PostesMagicos />
      <FonteDoParque animar={animar} />
      <DroneAmigo animar={animar} />
      <Brilhos animar={animar} />
    </>
  );
}
