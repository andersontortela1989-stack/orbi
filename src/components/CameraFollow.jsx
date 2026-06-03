import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Offset fixo em espaço de mundo (câmera NÃO gira com o carro — vista tática).
const OFFSET = new THREE.Vector3(0, 35, 22);
const LERP_SPEED = 5;

// Reutilizados a cada frame (evita alocação no hot path).
const _targetPos = new THREE.Vector3();
const _desired = new THREE.Vector3();

export function CameraFollow({ targetRef }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    const rb = targetRef.current;
    if (!rb) return;

    const t = rb.translation();
    _targetPos.set(t.x, t.y, t.z);
    _desired.copy(_targetPos).add(OFFSET);

    // Lerp frame-rate independente
    const alpha = 1 - Math.exp(-LERP_SPEED * dt);
    camera.position.lerp(_desired, alpha);
    camera.lookAt(_targetPos);
  });

  return null;
}
