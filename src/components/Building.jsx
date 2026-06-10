import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';

/**
 * Prédio ADESIVO (Fatia B da frente Mundo Adesivo 3D) = caixa com colisão
 * real + o look sticker da marca:
 *
 *  - CONTORNO navy (inverted hull): segunda caixa com faces viradas pra
 *    dentro (BackSide), TRACO maior em cada direção. A escala é ADITIVA
 *    por eixo — espessura constante em unidades de mundo: prédio grande e
 *    pequeno têm o MESMO traço, como o contorno uniforme da marca.
 *  - PLACA DE LETREIRO padronizada: rim navy + recheio branco + texto navy,
 *    deitada no telhado. TODO letreiro tem a mesma cara em qualquer cor de
 *    prédio — legibilidade máxima e previsibilidade (guard-rail TEA). O
 *    letreiro é instrumento de alfabetização: troika (SDF) mantido.
 *  - Corpo em meshLambertMaterial: resposta difusa chapada (sem brilho
 *    especular do PBR) — casa com o dia adesivo e é mais barato.
 *
 * API:
 *   <Building floorPos={[x, z]} size={[w, h, l]} color="#..." label="HOSPITAL" />
 *
 * floorPos = posição no plano (a altura é calculada automaticamente para o
 * prédio sentar no chão, com seu centro em y = h/2).
 */

// Traço do contorno em UNIDADES DE MUNDO (aditivo) — ~4px no zoom 18,
// na régua do --outline do 2D.
const TRACO = 0.22;
// Traço do rim da placa de letreiro (mais fino: a placa é menor).
const TRACO_PLACA = 0.16;

export function Building({ floorPos, size, color, label, fontSize }) {
  const [x, z] = floorPos;
  const [w, h, l] = size;
  const lotSize = Math.max(w, l) + 4;
  // Tamanho proporcional ao prédio, com um PISO de legibilidade: no zoom mais
  // aberto (Fatia 7) os prédios pequenos (ex.: FAROL) teriam letreiro miúdo —
  // o Math.max garante que "FAROL" continue legível sem estourar o telhado.
  const finalFontSize = fontSize ?? Math.max(2.4, Math.min(w, l) * 0.22);

  // Placa dimensionada pelo texto (~0.66 × fontSize por caractere, bold +
  // letterSpacing). Em rótulos longos (HOSPITAL) ela passa um pouco do
  // telhado — overhang de placa é gesto de sticker, aceito.
  const placaW = label.length * finalFontSize * 0.66 + 1.0;
  const placaL = finalFontSize * 1.5;

  return (
    <>
      {/* Calçada / lote — visual apenas, sem colisão */}
      <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[lotSize, lotSize]} />
        {/* Calçada branca = "recheio de adesivo": o prédio fica colado num
            sticker. (Watch-point CENTRO: branco sobre chão paper.) */}
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.95} />
      </mesh>

      {/* Sombra SÓLIDA do prédio (Fatia C) — o gesto --solid da marca:
          plano navy translúcido do footprint, offset único do mundo
          (baixo-direita na tela). y=0.034 acima da calçada (0.02) e
          depthWrite:false — camadas documentadas no Cenario.jsx
          (z-fighting = guard-rail "nada pisca"). */}
      <mesh
        position={[x + SOMBRA_SOLIDA.dx, 0.034, z + SOMBRA_SOLIDA.dz]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[w, l]} />
        <meshBasicMaterial
          color={SOMBRA_SOLIDA.cor}
          transparent
          opacity={SOMBRA_SOLIDA.opacidade}
          depthWrite={false}
        />
      </mesh>

      {/* Prédio: colisão real + contorno + placa de letreiro */}
      <RigidBody type="fixed" colliders="cuboid" position={[x, h / 2, z]}>
        {/* Contorno sticker — a base desce TRACO abaixo de y=0 e some
            dentro do chão. */}
        <mesh
          scale={[(w + 2 * TRACO) / w, (h + 2 * TRACO) / h, (l + 2 * TRACO) / l]}
        >
          <boxGeometry args={[w, h, l]} />
          <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        </mesh>

        {/* Corpo */}
        <mesh>
          <boxGeometry args={[w, h, l]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Placa do letreiro: rim navy embaixo, recheio branco em cima
            (o branco fica "proud" — visto de cima, sobra a borda navy). */}
        <mesh position={[0, h / 2 + 0.05, 0]}>
          <boxGeometry
            args={[placaW + 2 * TRACO_PLACA, 0.1, placaL + 2 * TRACO_PLACA]}
          />
          <meshBasicMaterial color={PALETA3D.contorno} />
        </mesh>
        <mesh position={[0, h / 2 + 0.1, 0]}>
          <boxGeometry args={[placaW, 0.1, placaL]} />
          <meshBasicMaterial color={PALETA3D.placa} />
        </mesh>

        {/* Letreiro deitado no telhado, voltado para cima.
            Rotação -PI/2 no X: plano XZ, top do texto aponta -Z = topo da
            tela. Navy sobre placa branca: contraste máximo, sem outline. */}
        <Text
          position={[0, h / 2 + 0.18, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={finalFontSize}
          color={PALETA3D.letreiro}
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
