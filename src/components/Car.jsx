import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard.js';
import { PALETA3D } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { tintaDoCarro } from '../city/garagem.js';

// =====================================================================
//  PARÂMETROS DE GAME FEEL  —  AJUSTE AQUI, SENTINDO.
//  Tudo que define "como é dirigir" mora neste bloco.
// =====================================================================
const ACEL            = 18;    // força de aceleração (m/s² alvo)
const V_MAX           = 14;    // velocidade máxima frente (m/s) — ré usa metade
const GIRO            = 2.4;   // rad/s de rotação em velocidade plena
const GRIP            = 0.90;  // aderência lateral normal: 1 = sobre trilhos, ~0.85 = drift gostoso
const ATRITO          = 0.98;  // rolamento ao soltar o acelerador (fração mantida por 1/60s)
const FREIO_MAO_GRIP  = 0.6;   // grip reduzido com ESPAÇO (handbrake = derrapa mais)
// =====================================================================

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

    // Clamp do dt para sobreviver a freezes / tab pausada
    const dt = Math.min(deltaRaw, 1 / 30);

    const v = rb.linvel();
    const h = heading.current;

    // Eixos locais do carro no plano XZ
    const fwdX   = Math.sin(h);
    const fwdZ   = Math.cos(h);
    const rightX = fwdZ;
    const rightZ = -fwdX;

    // Decompõe velocidade em componente "para frente" e "lateral"
    let vF = v.x * fwdX   + v.z * fwdZ;
    let vL = v.x * rightX + v.z * rightZ;

    // Aceleração / ré
    if (input.current.up)   vF += ACEL * dt;
    if (input.current.down) vF -= ACEL * dt;

    // Sem input longitudinal → rolamento (frame-rate independente)
    if (!input.current.up && !input.current.down) {
      vF *= Math.pow(ATRITO, dt * 60);
    }

    // Limites de velocidade (ré mais lenta que frente)
    vF = Math.max(-V_MAX * 0.5, Math.min(V_MAX, vF));

    // Direção: só vira em movimento; inverte com ré
    const fator = Math.min(1, Math.abs(vF) / V_MAX);
    const sgn = Math.sign(vF) || 1;
    if (input.current.left)  heading.current += GIRO * dt * fator * sgn;
    if (input.current.right) heading.current -= GIRO * dt * fator * sgn;

    // Grip lateral — A DERRAPAGEM MORA AQUI.
    // Espaço pressionado = handbrake = grip menor = drift maior.
    const grip = input.current.space ? FREIO_MAO_GRIP : GRIP;
    vL *= Math.pow(grip, dt * 60);

    // Recompõe a velocidade (preserva Y para a gravidade continuar agindo)
    rb.setLinvel(
      {
        x: fwdX * vF + rightX * vL,
        y: v.y,
        z: fwdZ * vF + rightZ * vL,
      },
      true
    );

    // Rotação aplicada como quaternion apenas no eixo Y
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
