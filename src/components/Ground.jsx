import { RigidBody } from '@react-three/rapier';
import { PALETA3D } from '../brand/paleta3d.js';

const SIZE = 400;
const THICKNESS = 1;

export function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
      <mesh position={[0, -THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[SIZE, THICKNESS, SIZE]} />
        {/* Chão-base = as RUAS (o negativo entre os chãos dos bairros):
            asfalto claro do dia adesivo. */}
        <meshStandardMaterial color={PALETA3D.asfalto} roughness={0.95} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}
