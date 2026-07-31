import { Instance, Instances } from '@react-three/drei';
import { PALETA3D, TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

const DEITADO = [-Math.PI / 2, 0, 0];

const MANCHAS = [
  [-52, -18, 24, 15, '#70649B'], [36, -27, 26, 17, '#665B91'],
  [-94, 4, 31, 23, '#655A8E'], [93, 8, 28, 21, '#73639A'],
  [-78, 76, 29, 22, '#655A8E'], [75, 82, 31, 24, '#70649B'],
  [2, 112, 38, 19, '#695D94'],
];

const ROCHAS = [
  [-78, -18], [-69, -23], [-58, -28], [69, -25], [79, -17],
  [-103, 24], [-96, 35], [96, 34], [104, 45], [-70, 101],
  [-55, 109], [56, 108], [72, 102], [-8, 118], [12, 119],
];

/** Paisagem contínua abaixo da cidade; não participa de sensores ou física. */
export function Landscape() {
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);

  return (
    <>
      {MANCHAS.map(([x, z, sx, sz, cor], i) => (
        <mesh key={i} position={[x, 0.006, z]} rotation={DEITADO} scale={[sx, sz, 1]}>
          <circleGeometry args={[1, 32]} />
          <meshStandardMaterial
            color={visual.tranquilo ? PALETA3D.terrenoCalmo : cor}
            roughness={0.96}
          />
        </mesh>
      ))}

      {visual.detalhes && (
        <>
          <Instances limit={ROCHAS.length}>
            <dodecahedronGeometry args={[1.15, 0]} />
            <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.82} />
            {ROCHAS.map(([x, z], i) => (
              <Instance
                key={i}
                position={[x, 0.72 + (i % 3) * 0.12, z]}
                rotation={[0, i * 0.63, 0]}
                scale={[1 + (i % 2) * 0.35, 0.7 + (i % 3) * 0.12, 0.9]}
              />
            ))}
          </Instances>
          <Instances limit={ROCHAS.length}>
            <sphereGeometry args={[0.55, 10, 8]} />
            <meshStandardMaterial color={TINTAS.magenta} roughness={0.72} />
            {ROCHAS.map(([x, z], i) => (
              <Instance key={i} position={[x + 1.25, 0.48, z - 0.8]} scale={i % 2 ? 0.72 : 1} />
            ))}
          </Instances>
        </>
      )}
    </>
  );
}
