import { RigidBody } from '@react-three/rapier';
import { PALETA3D } from '../brand/paleta3d.js';

const SIZE = 400;
const THICKNESS = 1;

export function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
      <mesh position={[0, -THICKNESS / 2, 0]}>
        <boxGeometry args={[SIZE, THICKNESS, SIZE]} />
        {/* Terreno contínuo da cidade mágica. As ruas agora são desenhadas
            explicitamente por RoadNetwork, então o espaço entre bairros não
            precisa mais parecer um vazio de asfalto. */}
        <meshStandardMaterial color={PALETA3D.terreno} roughness={0.95} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}
