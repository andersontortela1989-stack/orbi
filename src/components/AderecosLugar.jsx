import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { camadasDoEstilo, paesDoLugar } from '../visual/pao-3d.js';

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
 *
 * `estilo` 'real' (V1): só os pães da vitrine real e sem os contornos de
 * adesivo — 2 chamadas.
 */
export function AderecosLugar({ slug, floorPos, size, estilo = 'atual' }) {
  const paes = useMemo(() => paesDoLugar(slug, size, estilo), [slug, size, estilo]);
  if (paes.length === 0) return null;

  const camadas = camadasDoEstilo(estilo);
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
