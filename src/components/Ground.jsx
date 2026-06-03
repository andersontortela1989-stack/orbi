import { RigidBody } from '@react-three/rapier';

const SIZE = 400;
const THICKNESS = 1;

export function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
      <mesh position={[0, -THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[SIZE, THICKNESS, SIZE]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.95} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}
