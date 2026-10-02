import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { paesDoLugar, recursosDoPao } from '../visual/pao-3d.js';

/**
 * Adereços de identidade de um lugar (ficha A2) — hoje, os pães da PADARIA.
 *
 * Posições, escalas e regras vêm do dado puro city/identidade.js; geometrias
 * e materiais, de visual/pao-3d.js (uma instância de cada, compartilhada).
 * Os dois têm teste em node:test, inclusive o orçamento de chamadas e
 * triângulos. Aqui só o desenho.
 *
 * ESTÁTICO e sem RigidBody: não lê o Modo Tranquilo (identidade é informação,
 * não enfeite) e o carro só sente o colisor do Building. Todos os pães do
 * lugar dividem 4 InstancedMesh (base, copa e os dois contornos): 4 chamadas
 * de desenho por lugar, com qualquer quantidade de pães.
 */
export function AderecosLugar({ slug, floorPos, size }) {
  const paes = useMemo(() => paesDoLugar(slug, size), [slug, size]);
  if (paes.length === 0) return null;

  const { camadas } = recursosDoPao();
  const [x, z] = floorPos;
  return (
    <group position={[x, 0, z]}>
      {camadas.map(({ geometria, material }, c) => (
        <Instances key={c} limit={paes.length} geometry={geometria} material={material}>
          {paes.map((p, i) => (
            <Instance key={i} position={p.posicao} rotation={p.rotacao} scale={p.escala} />
          ))}
        </Instances>
      ))}
    </group>
  );
}
