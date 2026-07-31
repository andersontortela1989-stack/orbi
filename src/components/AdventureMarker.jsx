import { PREDIOS_GPS } from '../missions/destinos.js';
import { TINTAS } from '../brand/paleta3d.js';
import { useAdventure } from '../adventure/useAdventure.js';

const POR_SLUG = Object.fromEntries(PREDIOS_GPS.map((predio) => [predio.slug, predio]));

/** Anel calmo que aparece apenas após pedido de ajuda ou 45 segundos. */
export function AdventureMarker() {
  const destaque = useAdventure().destaque;
  const predio = POR_SLUG[destaque];
  if (!predio) return null;
  const [x, z] = predio.floorPos;
  const raio = Math.max(predio.size[0], predio.size[2]) * 0.75;

  return (
    <group position={[x, 0.08, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[raio, raio + 0.7, 32]} />
        <meshBasicMaterial color={TINTAS.sun} />
      </mesh>
      <mesh position={[0, predio.size[1] + 2.2, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial color={TINTAS.sun} />
      </mesh>
    </group>
  );
}

