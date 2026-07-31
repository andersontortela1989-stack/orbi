import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D } from '../brand/paleta3d.js';

/**
 * Ruas curvas do Órbi 2,5D. São uma pele visual sobre o Ground físico:
 * dirigir continua livre e todas as posições de sensores permanecem intactas.
 */
const CAMINHOS = Object.freeze([
  // eixo central: estádio → centro → parque
  [[-6, -38], [-5, -22], [0, -6], [-2, 13], [1, 31], [0, 52], [-2, 66]],
  // porto → centro → mercado
  [[-78, 28], [-61, 29], [-43, 27], [-24, 23], [-3, 20], [18, 21], [38, 23], [58, 27]],
  // centro → escola → parque/zoo
  [[-2, 15], [5, 29], [0, 41], [-4, 54], [-3, 68], [7, 76], [20, 78]],
  // saída para garagem
  [[0, -4], [12, -7], [22, -12], [34, -16]],
  // anel curto de serviços do centro
  [[-34, 24], [-27, 17], [-18, 8], [-4, 3], [11, 6], [22, 15]],
]);

function curvaDe(caminho) {
  return new THREE.CatmullRomCurve3(
    caminho.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'catmullrom',
    0.35
  );
}

function geometriaFaixa(caminho, largura) {
  const curva = curvaDe(caminho);
  const pontos = curva.getSpacedPoints(Math.max(18, caminho.length * 8));
  const posicoes = [];
  const indices = [];

  pontos.forEach((ponto, i) => {
    const anterior = pontos[Math.max(0, i - 1)];
    const proximo = pontos[Math.min(pontos.length - 1, i + 1)];
    const dx = proximo.x - anterior.x;
    const dz = proximo.z - anterior.z;
    const tamanho = Math.hypot(dx, dz) || 1;
    const nx = -dz / tamanho;
    const nz = dx / tamanho;
    const metade = largura / 2;
    posicoes.push(
      ponto.x + nx * metade, 0, ponto.z + nz * metade,
      ponto.x - nx * metade, 0, ponto.z - nz * metade
    );
    if (i < pontos.length - 1) {
      const base = i * 2;
      indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
    }
  });

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(posicoes, 3));
  geometria.setIndex(indices);
  geometria.computeVertexNormals();
  return geometria;
}

function dadosDasFaixas() {
  return CAMINHOS.flatMap((caminho, caminhoId) => {
    const curva = curvaDe(caminho);
    const quantidade = Math.max(5, caminho.length * 2);
    return Array.from({ length: quantidade }, (_, i) => {
      const t = (i + 0.65) / quantidade;
      const ponto = curva.getPointAt(Math.min(0.98, t));
      const tangente = curva.getTangentAt(Math.min(0.98, t));
      return {
        id: `${caminhoId}:${i}`,
        pos: [ponto.x, 0.044, ponto.z],
        rot: [0, Math.atan2(tangente.x, tangente.z), 0],
      };
    });
  });
}

export function RoadNetwork({ tranquilo = false }) {
  const geometrias = useMemo(
    () => CAMINHOS.map((caminho) => ({
      borda: geometriaFaixa(caminho, 7.6),
      rua: geometriaFaixa(caminho, 6.5),
    })),
    []
  );
  const faixas = useMemo(dadosDasFaixas, []);

  return (
    <>
      {geometrias.map((geometria, i) => (
        <group key={i}>
          <mesh geometry={geometria.borda} position={[0, 0.027, 0]}>
            <meshBasicMaterial color={PALETA3D.ruaBorda} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={geometria.rua} position={[0, 0.032, 0]}>
            <meshStandardMaterial
              color={PALETA3D.rua}
              roughness={0.92}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {!tranquilo && (
        <Instances limit={faixas.length}>
          <boxGeometry args={[0.18, 0.035, 1.2]} />
          <meshStandardMaterial
            color={PALETA3D.linhaRua}
            emissive={PALETA3D.linhaRua}
            emissiveIntensity={0.22}
            roughness={0.8}
          />
          {faixas.map((faixa) => (
            <Instance
              key={faixa.id}
              position={faixa.pos}
              rotation={faixa.rot}
            />
          ))}
        </Instances>
      )}
    </>
  );
}
