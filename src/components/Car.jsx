import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard.js';
import { PALETA3D } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { tintaDoCarro } from '../city/garagem.js';
import { stepVehicle, VEHICLE_TUNING } from '../game/vehiclePhysics.js';

// Dimensões do carro (visual + colisão)
const CAR_W = 1.8;
const CAR_H = 0.8;
const CAR_L = 3.5;
const WHEEL_R = 0.35;
const WHEEL_T = 0.3;

// Objetos reutilizados (evita alocação no useFrame)
const _q = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);

export function Car({ rigidBodyRef }) {
  const heading = useRef(0); // ângulo Y em radianos
  const input = useKeyboard();
  const localRef = useRef(null);
  const ref = rigidBodyRef ?? localRef;

  // Cor do chassi via store (frente "Garagem") — edição VISUAL apenas,
  // precedente da Fatia B: troca de cor re-renderiza só o material; o
  // RigidBody é o mesmo elemento React (não remonta) e a física acima
  // não muda. corPreview (experimentando na garagem) vence corCarro.
  const corCorpo = useGame((s) => tintaDoCarro(s.corPreview ?? s.corCarro));

  useFrame((_, deltaRaw) => {
    const rb = ref.current;
    if (!rb) return;

    // stepVehicle faz o clamp de dt e toda a matemática fora do React.
    // Car é o ÚNICO componente que escreve movimento no RigidBody.
    const modo = useGame.getState().combustivel > 0 ? 'normal' : 'reserve';
    const proximo = stepVehicle({
      velocity: rb.linvel(),
      heading: heading.current,
      input: input.current,
      dt: deltaRaw,
      mode: modo,
      tuning: VEHICLE_TUNING,
    });

    heading.current = proximo.heading;
    rb.setLinvel(proximo.velocity, true);

    // Rotação aplicada como quaternion apenas no eixo Y.
    _q.setFromAxisAngle(_yAxis, heading.current);
    rb.setRotation(_q, true);
  });

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, true, false]}
      position={[0, 1, 0]}
      linearDamping={0}
      angularDamping={0}
      mass={1}
    >
      {/* Um único collider para o carro inteiro — wheels são visual */}
      <CuboidCollider args={[CAR_W / 2, CAR_H / 2, CAR_L / 2]} friction={0.4} />

      {/* Chassi — cor escolhida na garagem (coral de fábrica = o coral
          OFICIAL da Fatia B). Cabine/rodas seguem navy FIXO: identidade +
          contraste garantido com qualquer corpo do catálogo. */}
      <mesh>
        <boxGeometry args={[CAR_W, CAR_H, CAR_L]} />
        <meshStandardMaterial color={corCorpo} roughness={0.55} />
      </mesh>

      {/* Cabine (visual, deslocada para trás → indica "frente") */}
      <mesh position={[0, CAR_H * 0.6, -0.25]}>
        <boxGeometry args={[CAR_W * 0.85, CAR_H * 0.55, CAR_L * 0.45]} />
        <meshStandardMaterial color={PALETA3D.carro.cabine} roughness={0.4} />
      </mesh>

      {/* "Faróis" — referência visual da frente do carro */}
      <mesh position={[0, 0, CAR_L / 2 - 0.05]}>
        <boxGeometry args={[CAR_W * 0.75, CAR_H * 0.25, 0.1]} />
        <meshStandardMaterial
          color={PALETA3D.carro.farol}
          emissive={PALETA3D.carro.farol}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Rodas (visual apenas) */}
      {[
        [+CAR_W / 2 + WHEEL_T / 2, -CAR_H / 2 + WHEEL_R * 0.5, +CAR_L / 3],
        [-CAR_W / 2 - WHEEL_T / 2, -CAR_H / 2 + WHEEL_R * 0.5, +CAR_L / 3],
        [+CAR_W / 2 + WHEEL_T / 2, -CAR_H / 2 + WHEEL_R * 0.5, -CAR_L / 3],
        [-CAR_W / 2 - WHEEL_T / 2, -CAR_H / 2 + WHEEL_R * 0.5, -CAR_L / 3],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[WHEEL_R, WHEEL_R, WHEEL_T, 16]} />
          <meshStandardMaterial color={PALETA3D.carro.roda} roughness={0.8} />
        </mesh>
      ))}
    </RigidBody>
  );
}
