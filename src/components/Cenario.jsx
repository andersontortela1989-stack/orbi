import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';

/**
 * CENÁRIO (Fatia C da frente Mundo Adesivo 3D) — decoração PURA.
 *
 * FRONTEIRA (gravada aqui de propósito):
 *   bairros.js  = entidades JOGÁVEIS — sensores, missões e chips do
 *                 Caderninho DERIVAM de lá.
 *   Cenario.jsx = decoração — NADA deriva daqui: sem sensor, sem missão,
 *                 sem chip. Se um prop um dia virar jogável, ele MIGRA
 *                 pra bairros.js.
 *
 * Conteúdo (poucos e calmos — dosagem TEA, nada anima):
 *   - árvores no PARQUE (InstancedMesh): SEM colisão — parede invisível
 *     é punição imprevisível; atravessar é previsível e inofensivo.
 *   - postes nas bordas do asfalto (luminária é COR sol, não luz real).
 *   - faixas de travessia nas 3 entradas de bairro, derivadas dos vãos
 *     reais medidos entre os chãos (PORTO↔CENTRO, CENTRO↔MERCADO,
 *     CENTRO↔PARQUE).
 *   - sombras SÓLIDAS de tudo + blob do carro (SOMBRA_SOLIDA: offset
 *     único do mundo inteiro, baixo-direita na tela).
 *
 * Z-FIGHTING = GUARD-RAIL TEA ("nada pisca"): cada plano translúcido tem
 * um Y próprio na pilha do chão e `depthWrite: false` —
 *   chão-base 0 · chão de bairro 0.005 · Grid 0.01 · faixas 0.016 ·
 *   calçada 0.02 · sombras estáticas 0.03/0.034 · blob do carro 0.045
 */

// ---------------------------------------------------------------- árvores
// Bordas norte/oeste do chão do PARQUE (x -29..29, z 54..94), longe dos
// lotes de PARQUE/ZOO/VET e da entrada sul (faixa de travessia).
const ARVORES = [
  [-26, 60], [-26, 74], [-26, 88], [-16, 92], [-6, 90],
  [4, 92], [14, 90], [24, 92], [27, 86], [-20, 58],
];
const COPA_R = 1.7;
const COPA_Y = 3.0;
const TRONCO_H = 2.0;
const TRACO = 0.22; // mesmo traço aditivo do Building

// ---------------------------------------------------------------- postes
const POSTES = [
  [-37.5, 12], [-37.5, 44], [-12, -12], [12, -12], [50, -10], [33, 60],
];
const HASTE_H = 3.4;

// ---------------------------------------------------------------- faixas
// 5 barras por travessia; barras PERPENDICULARES à direção de quem entra
// no bairro. escala = [comprimento x, comprimento z] do plano deitado.
const PASSOS = [-2.6, -1.3, 0, 1.3, 2.6];
const FAIXAS = [
  // entrada do PORTO (vão x -40..-35; dirige-se em -x)
  ...PASSOS.map((off) => ({ pos: [-37.5 + off, 29], escala: [0.8, 4.5] })),
  // entrada do MERCADO (costura x≈35.5; dirige-se em +x)
  ...PASSOS.map((off) => ({ pos: [35.5 + off, 28], escala: [0.8, 4.5] })),
  // entrada do PARQUE (borda z≈54 entre os lotes; dirige-se em +z)
  ...PASSOS.map((off) => ({ pos: [4, 53 + off], escala: [6, 0.8] })),
];

const DEITADO = [-Math.PI / 2, 0, 0];

/** Material de sombra sólida compartilhado (props estáticos). */
function MaterialSombra() {
  return (
    <meshBasicMaterial
      color={SOMBRA_SOLIDA.cor}
      transparent
      opacity={SOMBRA_SOLIDA.opacidade}
      depthWrite={false}
    />
  );
}

export function Cenario() {
  return (
    <>
      {/* ===== ÁRVORES (sem colisão) ===== */}
      {/* contorno sticker das copas (aditivo: raio + TRACO) */}
      <Instances limit={ARVORES.length}>
        <icosahedronGeometry args={[COPA_R + TRACO, 0]} />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {ARVORES.map(([x, z], i) => (
          <Instance key={i} position={[x, COPA_Y, z]} />
        ))}
      </Instances>
      {/* copas — capim/capim-deep alternados (variedade calma) */}
      <Instances limit={ARVORES.length}>
        <icosahedronGeometry args={[COPA_R, 0]} />
        <meshLambertMaterial />
        {ARVORES.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x, COPA_Y, z]}
            color={i % 2 ? PALETA3D.copaEscura : PALETA3D.copa}
          />
        ))}
      </Instances>
      {/* troncos (finos — sem contorno próprio; a tinta inkSoft já lê) */}
      <Instances limit={ARVORES.length}>
        <cylinderGeometry args={[0.32, 0.38, TRONCO_H, 8]} />
        <meshLambertMaterial color={PALETA3D.tronco} />
        {ARVORES.map(([x, z], i) => (
          <Instance key={i} position={[x, TRONCO_H / 2, z]} />
        ))}
      </Instances>
      {/* sombras sólidas das árvores */}
      <Instances limit={ARVORES.length}>
        <circleGeometry args={[COPA_R, 20]} />
        <MaterialSombra />
        {ARVORES.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
            rotation={DEITADO}
          />
        ))}
      </Instances>

      {/* ===== POSTES ===== */}
      <Instances limit={POSTES.length}>
        <cylinderGeometry args={[0.12, 0.16, HASTE_H, 8]} />
        <meshLambertMaterial color={PALETA3D.poste} />
        {POSTES.map(([x, z], i) => (
          <Instance key={i} position={[x, HASTE_H / 2, z]} />
        ))}
      </Instances>
      {/* luminária com contorno (esfera = sticker do sol no alto) */}
      <Instances limit={POSTES.length}>
        <sphereGeometry args={[0.45 + TRACO * 0.7, 12, 12]} />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {POSTES.map(([x, z], i) => (
          <Instance key={i} position={[x, HASTE_H + 0.3, z]} />
        ))}
      </Instances>
      <Instances limit={POSTES.length}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color={PALETA3D.luminaria} />
        {POSTES.map(([x, z], i) => (
          <Instance key={i} position={[x, HASTE_H + 0.3, z]} />
        ))}
      </Instances>
      {/* sombras sólidas dos postes */}
      <Instances limit={POSTES.length}>
        <circleGeometry args={[0.5, 16]} />
        <MaterialSombra />
        {POSTES.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
            rotation={DEITADO}
          />
        ))}
      </Instances>

      {/* ===== FAIXAS DE TRAVESSIA ===== */}
      <Instances limit={FAIXAS.length}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={PALETA3D.faixa} />
        {FAIXAS.map((f, i) => (
          <Instance
            key={i}
            position={[f.pos[0], 0.016, f.pos[1]]}
            rotation={DEITADO}
            scale={[f.escala[0], f.escala[1], 1]}
          />
        ))}
      </Instances>
    </>
  );
}

/**
 * Blob do carro — a sombra sólida que ANDA. Círculo (não elipse: o blob não
 * gira com o carro; uma elipse fixa destoaria no drift), seguindo o carro
 * por useFrame com o MESMO offset do mundo. Lê o RigidBody como o
 * CameraFollow — Car.jsx não é tocado.
 */
const BLOB_Y = 0.045;

export function BlobShadow({ targetRef }) {
  const ref = useRef(null);

  useFrame(() => {
    const rb = targetRef.current;
    if (!rb || !ref.current) return;
    const t = rb.translation();
    ref.current.position.set(
      t.x + SOMBRA_SOLIDA.dx,
      BLOB_Y,
      t.z + SOMBRA_SOLIDA.dz
    );
  });

  return (
    <mesh ref={ref} rotation={DEITADO} scale={1.7}>
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial
        color={SOMBRA_SOLIDA.cor}
        transparent
        opacity={SOMBRA_SOLIDA.opacidade}
        depthWrite={false}
      />
    </mesh>
  );
}
