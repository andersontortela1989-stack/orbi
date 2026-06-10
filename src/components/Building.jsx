import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { PALETA3D } from '../brand/paleta3d.js';

/**
 * Prédio = caixa com colisão real (RigidBody fixo, collider cuboid).
 * Sobre ele, um letreiro 3D em CAIXA ALTA, deitado no telhado, legível
 * pela câmera ortográfica de cima (alto contraste com outline preto).
 * Acompanha uma "calçada/lote" — quad fino visual sem colisão — para
 * o prédio sentar num pedaço de chão distinto do asfalto.
 *
 * API:
 *   <Building floorPos={[x, z]} size={[w, h, l]} color="#..." label="HOSPITAL" />
 *
 * floorPos = posição no plano (a altura é calculada automaticamente para o
 * prédio sentar no chão, com seu centro em y = h/2).
 */
export function Building({
  floorPos,
  size,
  color,
  label,
  labelColor = '#ffffff',
  labelOutline = '#000000',
  fontSize,
}) {
  const [x, z] = floorPos;
  const [w, h, l] = size;
  const lotSize = Math.max(w, l) + 4;
  // Tamanho proporcional ao prédio, com um PISO de legibilidade: no zoom mais
  // aberto (Fatia 7) os prédios pequenos (ex.: FAROL) teriam letreiro miúdo —
  // o Math.max garante que "FAROL" continue legível sem estourar o telhado.
  const finalFontSize = fontSize ?? Math.max(2.4, Math.min(w, l) * 0.22);

  return (
    <>
      {/* Calçada / lote — visual apenas, sem colisão */}
      <mesh
        position={[x, 0.02, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[lotSize, lotSize]} />
        {/* Calçada branca = "recheio de adesivo": o prédio fica colado num
            sticker. (Watch-point CENTRO: branco sobre chão paper.) */}
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.95} />
      </mesh>

      {/* Prédio: colisão real + letreiro 3D */}
      <RigidBody type="fixed" colliders="cuboid" position={[x, h / 2, z]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, l]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Letreiro deitado no telhado, voltado para cima.
            Rotação -PI/2 no X: plano XZ, top do texto aponta -Z = topo da tela. */}
        <Text
          position={[0, h / 2 + 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={finalFontSize}
          color={labelColor}
          outlineWidth={finalFontSize * 0.06}
          outlineColor={labelOutline}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
          fontWeight={700}
        >
          {label}
        </Text>
      </RigidBody>
    </>
  );
}
