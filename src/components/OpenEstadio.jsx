import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { CALCADA_EXTRA } from '../city/geometria.js';
import { ESTADIO_LAYOUT } from '../city/estadio.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

function Gramado() {
  const { w, l, y, faixas } = ESTADIO_LAYOUT.campo;
  const faixaW = w / faixas;
  const linhaY = y + 0.04;

  return (
    <group>
      {/* Faixas alternadas do gramado */}
      {Array.from({ length: faixas }).map((_, i) => {
        const x = -w / 2 + faixaW * (i + 0.5);
        const cor = i % 2 === 0 ? PALETA3D.copa : '#4AAE60';
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[faixaW + 0.01, l]} />
            <meshStandardMaterial color={cor} roughness={0.85} />
          </mesh>
        );
      })}

      {/* Linhas brancas do campo */}
      <mesh position={[0, linhaY, -l / 2 + 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.5, 0.12]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>
      <mesh position={[0, linhaY, l / 2 - 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.5, 0.12]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>
      <mesh position={[-w / 2 + 0.25, linhaY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, l - 0.5]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>
      <mesh position={[w / 2 - 0.25, linhaY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, l - 0.5]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>
      <mesh position={[0, linhaY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, l - 0.5]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>

      {/* Círculo central e marca do centro */}
      <mesh position={[0, linhaY + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1.05, 24]} />
        <meshBasicMaterial color={TINTAS.white} />
      </mesh>
      <mesh position={[0, linhaY + 0.14, 0]}>
        <sphereGeometry args={[0.17, 10, 10]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.4} />
      </mesh>

      {/* Áreas e traves (oeste e leste) */}
      {[-1, 1].map((lado) => {
        const areaX = lado * (w / 2 - 1.05);
        const golX = lado * (w / 2 - 0.15);
        return (
          <group key={lado}>
            <mesh position={[areaX - lado * 0.8, linhaY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 3.1]} />
              <meshBasicMaterial color={TINTAS.white} />
            </mesh>
            <mesh position={[areaX, linhaY, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.6, 0.1]} />
              <meshBasicMaterial color={TINTAS.white} />
            </mesh>
            <mesh position={[areaX, linhaY, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.6, 0.1]} />
              <meshBasicMaterial color={TINTAS.white} />
            </mesh>

            {/* Trave + rede */}
            <mesh position={[golX, y + 0.45, -0.85]}>
              <boxGeometry args={[0.1, 0.9, 0.1]} />
              <meshStandardMaterial color={TINTAS.white} roughness={0.4} />
            </mesh>
            <mesh position={[golX, y + 0.45, 0.85]}>
              <boxGeometry args={[0.1, 0.9, 0.1]} />
              <meshStandardMaterial color={TINTAS.white} roughness={0.4} />
            </mesh>
            <mesh position={[golX, y + 0.9, 0]}>
              <boxGeometry args={[0.1, 0.1, 1.8]} />
              <meshStandardMaterial color={TINTAS.white} roughness={0.4} />
            </mesh>
            <mesh position={[golX + lado * 0.24, y + 0.44, 0]}>
              <boxGeometry args={[0.42, 0.84, 1.68]} />
              <meshBasicMaterial color={TINTAS.white} transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TorcidaInstanciada({ mostrarCompleta }) {
  const lista = useMemo(() => {
    if (mostrarCompleta) return ESTADIO_LAYOUT.torcida;
    return ESTADIO_LAYOUT.torcida.filter((_, i) => i % 2 === 0);
  }, [mostrarCompleta]);

  const corposRef = useRef(null);
  const cabecasRef = useRef(null);

  useEffect(() => {
    const corpos = corposRef.current;
    const cabecas = cabecasRef.current;
    if (!corpos || !cabecas) return;

    const dummy = new THREE.Object3D();
    const cor = new THREE.Color();

    lista.forEach((p, i) => {
      dummy.position.set(p.x, p.y + 0.2, p.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      corpos.setMatrixAt(i, dummy.matrix);
      cor.set(p.cor);
      corpos.setColorAt(i, cor);

      dummy.position.set(p.x, p.y + 0.52, p.z);
      dummy.updateMatrix();
      cabecas.setMatrixAt(i, dummy.matrix);
      cor.set(p.pele);
      cabecas.setColorAt(i, cor);
    });

    corpos.instanceMatrix.needsUpdate = true;
    cabecas.instanceMatrix.needsUpdate = true;
    if (corpos.instanceColor) corpos.instanceColor.needsUpdate = true;
    if (cabecas.instanceColor) cabecas.instanceColor.needsUpdate = true;
  }, [lista]);

  return (
    <group>
      <instancedMesh ref={corposRef} args={[null, null, lista.length]}>
        <boxGeometry args={[0.36, 0.4, 0.3]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={cabecasRef} args={[null, null, lista.length]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={TINTAS.white} roughness={0.65} />
      </instancedMesh>
    </group>
  );
}

function TorresRefletor({ brilho }) {
  return (
    <group>
      {ESTADIO_LAYOUT.torres.map((t) => (
        <group key={t.id} position={[t.x, 0.2, t.z]} rotation={[0, t.rotY, 0]}>
          <mesh position={[0, 2.9, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 5.8, 8]} />
            <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.6} />
          </mesh>
          <mesh position={[0, 5.85, 0.14]} rotation={[0.32, 0, 0]}>
            <boxGeometry args={[1.35, 0.62, 0.22]} />
            <meshStandardMaterial color={PALETA3D.contorno} roughness={0.6} />
          </mesh>
          <mesh position={[0, 5.85, 0.27]} rotation={[0.32, 0, 0]}>
            <boxGeometry args={[1.15, 0.44, 0.08]} />
            <meshStandardMaterial
              color={TINTAS.glow}
              emissive={TINTAS.glow}
              emissiveIntensity={brilho}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Estacionamento() {
  const { x, z, w, l, vagas, carros } = ESTADIO_LAYOUT.estacionamento;
  const passoVaga = (l - 1.2) / vagas;
  const inicioZ = -l / 2 + 0.6;

  return (
    <group position={[x, 0, z]}>
      {/* Borda / meio-fio */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[w + 0.45, 0.12, l + 0.45]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.85} />
      </mesh>
      {/* Asfalto do estacionamento */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[w, 0.08, l]} />
        <meshStandardMaterial color={PALETA3D.asfalto} roughness={0.9} />
      </mesh>

      {/* Linhas das vagas */}
      {Array.from({ length: vagas + 1 }).map((_, i) => {
        const linhaZ = inicioZ + i * passoVaga;
        return (
          <mesh key={i} position={[0.45, 0.18, linhaZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w - 1.5, 0.1]} />
            <meshBasicMaterial color={TINTAS.white} />
          </mesh>
        );
      })}

      {/* Carrinhos estacionados (puramente decorativos, sem colisor extra) */}
      {carros.map((c) => {
        const carroZ = inicioZ + (c.vaga + 0.5) * passoVaga;
        return (
          <group key={c.vaga} position={[0.55, 0.17, carroZ]}>
            <mesh position={[0, 0.34, 0]}>
              <boxGeometry args={[2.1, 0.5, 1.15]} />
              <meshStandardMaterial color={c.cor} roughness={0.55} />
            </mesh>
            <mesh position={[0.12, 0.72, 0]}>
              <boxGeometry args={[1.1, 0.38, 0.96]} />
              <meshStandardMaterial color={TINTAS.ink} roughness={0.45} />
            </mesh>
            {[-0.65, 0.65].map((rx) =>
              [-0.58, 0.58].map((rz) => (
                <mesh key={rx + '_' + rz} position={[rx, 0.18, rz]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.18, 0.18, 0.14, 10]} />
                  <meshStandardMaterial color={TINTAS.ink} roughness={0.8} />
                </mesh>
              ))
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Arena aberta do ESTÁDIO (padrão OpenPark / OpenSitio):
 * campo com faixas, linhas e traves, arquibancadas em degraus com torcida
 * instanciada, 4 refletores, fachada frontal com placa ESTÁDIO e estacionamento
 * lateral dentro da própria ilha do bairro.
 */
export function OpenEstadio({ floorPos }) {
  const [x, z] = floorPos;
  const [w, h, l] = ESTADIO_LAYOUT.size;
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const corParede = PALETA3D.predios['ESTÁDIO'];

  return (
    <group position={[x, 0, z]}>
      {/* Calçada do lote (mesma base dos prédios) */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[w + CALCADA_EXTRA, 0.16, l + CALCADA_EXTRA]} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.175, 0]}>
        <boxGeometry args={[w + 3.2, 0.08, l + 3.2]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.88} />
      </mesh>

      {/* Sombra sólida */}
      <mesh position={[SOMBRA_SOLIDA.dx, 0.23, SOMBRA_SOLIDA.dz]} rotation={[-Math.PI / 2, 0, 0]}>
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

      {/* Piso interno da arena */}
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[w - 0.4, 0.08, l - 0.4]} />
        <meshStandardMaterial color={TINTAS.sky} roughness={0.88} />
      </mesh>

      <Gramado />

      {/* Degraus das arquibancadas */}
      {ESTADIO_LAYOUT.arquibancadas.map((d) => (
        <mesh key={d.id} position={[d.x, d.y, d.z]}>
          <boxGeometry args={[d.w, d.h, d.l]} />
          <meshStandardMaterial color={TINTAS.skyHi} roughness={0.78} />
        </mesh>
      ))}

      <TorcidaInstanciada mostrarCompleta={visual.detalhes} />

      {/* Paredes externas do anel (mais altas atrás, mais baixas na frente) */}
      {/* Fundo -Z */}
      <mesh position={[0, 2.0, -l / 2 + 0.35]}>
        <boxGeometry args={[w, 3.6, 0.7]} />
        <meshStandardMaterial color={corParede} roughness={0.68} />
      </mesh>
      {/* Cobertura amarela no fundo -Z */}
      <mesh position={[0, 3.92, -l / 2 + 1.15]}>
        <boxGeometry args={[w + 0.4, 0.26, 2.4]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
      </mesh>

      {/* Lateral esquerda -X */}
      <mesh position={[-w / 2 + 0.35, 2.0, 0]}>
        <boxGeometry args={[0.7, 3.6, l]} />
        <meshStandardMaterial color={corParede} roughness={0.68} />
      </mesh>
      {/* Cobertura amarela na lateral -X */}
      <mesh position={[-w / 2 + 1.15, 3.92, 0]}>
        <boxGeometry args={[2.4, 0.26, l + 0.4]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
      </mesh>

      {/* Frente +Z (mais baixa para liberar a vista do campo) */}
      <mesh position={[0, 1.4, l / 2 - 0.35]}>
        <boxGeometry args={[w, 2.4, 0.7]} />
        <meshStandardMaterial color={corParede} roughness={0.68} />
      </mesh>
      {/* Faixa amarela na fachada +Z */}
      <mesh position={[0, 0.56, l / 2 + 0.05]}>
        <boxGeometry args={[w * 0.92, 0.48, 0.14]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
      </mesh>

      {/* Lateral direita +X (mais baixa para liberar a vista do campo) */}
      <mesh position={[w / 2 - 0.35, 1.4, 0]}>
        <boxGeometry args={[0.7, 2.4, l]} />
        <meshStandardMaterial color={corParede} roughness={0.68} />
      </mesh>
      <mesh position={[w / 2 + 0.05, 0.56, 0]}>
        <boxGeometry args={[0.14, 0.48, l * 0.88]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
      </mesh>

      {/* Portal de entrada + placa ESTÁDIO na fachada +Z */}
      <mesh position={[0, 1.15, l / 2 + 0.14]}>
        <boxGeometry args={[2.8, 2.0, 0.24]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.5} />
      </mesh>
      <group position={[0, 2.95, l / 2 + 0.26]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[6.95, 2.05, 0.2]} />
          <meshBasicMaterial color={TINTAS.violetDeep} />
        </mesh>
        <mesh>
          <boxGeometry args={[6.6, 1.7, 0.2]} />
          <meshStandardMaterial color={TINTAS.sun} emissive={TINTAS.sun} emissiveIntensity={0.08} roughness={0.55} />
        </mesh>
        <Text
          position={[0, 0, 0.13]}
          fontSize={1.08}
          color={TINTAS.ink}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.045}
          fontWeight={700}
        >
          ESTÁDIO
        </Text>
      </group>

      <TorresRefletor brilho={visual.brilhoJanela} />
      <Estacionamento />
    </group>
  );
}
