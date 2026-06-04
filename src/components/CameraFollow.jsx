import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// === Enquadramento (ajuste de câmera da cidade grande) ===
// Câmera ORTOGRÁFICA: o "afastar" é o ZOOM, NÃO a distância (mover a câmera
// longe não muda o tamanho na tela). Menor zoom = vê mais cidade.
// Forçamos o zoom AQUI (e não só no prop do <Canvas>) de propósito: o R3F só usa
// aquele prop na MONTAGEM inicial — mexer lá não atualiza a câmera viva e "some"
// no HMR. Setar camera.zoom no loop garante que o enquadramento sempre vale.
//   ↑ ZOOM = mais perto · ↓ ZOOM = vê mais cidade. Afinar pelo feel.
const ZOOM = 14;

// OFFSET = posição da câmera relativa ao carro (câmera NÃO gira com o carro —
// vista tática). Numa ortográfica define só o ÂNGULO (inclinação iso) e qual
// ponto fica centralizado, não o tamanho na tela. Mais altura vs Z = visão mais
// "de cima" → placas de telhado mais retas e legíveis.
const OFFSET = new THREE.Vector3(0, 44, 24);
const LERP_SPEED = 5;

// Reutilizados a cada frame (evita alocação no hot path).
const _targetPos = new THREE.Vector3();
const _desired = new THREE.Vector3();

export function CameraFollow({ targetRef }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    // Garante o zoom de enquadramento mesmo após HMR/resize. Custa nada depois
    // de assentar: só recalcula a projeção quando o valor realmente muda.
    if (camera.isOrthographicCamera && camera.zoom !== ZOOM) {
      camera.zoom = ZOOM;
      camera.updateProjectionMatrix();
    }

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
