import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';

/**
 * Árvores adesivas REUTILIZÁVEIS — extraídas do Cenario na Frente 5,
 * quando o CANTEIRO contável virou o segundo consumidor (regra da casa:
 * extrair quando chega o 2º consumidor real — precedente ZoneSensor).
 *
 * Mesma receita da Fatia C, intocada: copa icosaedro + contorno navy
 * BackSide (traço ADITIVO no raio) + tronco fino sem contorno próprio +
 * sombra SÓLIDA no Y 0.03 da pilha anti-z-fighting (documentada no
 * Cenario.jsx). Copas alternadas capim/capim-deep por índice (variedade
 * calma). 4 draw calls por GRUPO (instanced), qualquer quantidade.
 *
 * SEM COLISÃO, como sempre: parede invisível é punição imprevisível;
 * atravessar é previsível e inofensivo.
 */
const COPA_R = 1.7;
const COPA_Y = 3.0;
const TRONCO_H = 2.0;
const TRACO = 0.22; // mesmo traço aditivo do Building
const DEITADO = [-Math.PI / 2, 0, 0];

export function Arvores({ posicoes }) {
  return (
    <>
      {/* contorno sticker das copas (aditivo: raio + TRACO) */}
      <Instances limit={posicoes.length}>
        <icosahedronGeometry args={[COPA_R + TRACO, 0]} />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {posicoes.map(([x, z], i) => (
          <Instance key={i} position={[x, COPA_Y, z]} />
        ))}
      </Instances>
      {/* copas — capim/capim-deep alternados (variedade calma) */}
      <Instances limit={posicoes.length}>
        <icosahedronGeometry args={[COPA_R, 0]} />
        <meshLambertMaterial />
        {posicoes.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x, COPA_Y, z]}
            color={i % 2 ? PALETA3D.copaEscura : PALETA3D.copa}
          />
        ))}
      </Instances>
      {/* troncos (finos — sem contorno próprio; a tinta inkSoft já lê) */}
      <Instances limit={posicoes.length}>
        <cylinderGeometry args={[0.32, 0.38, TRONCO_H, 8]} />
        <meshLambertMaterial color={PALETA3D.tronco} />
        {posicoes.map(([x, z], i) => (
          <Instance key={i} position={[x, TRONCO_H / 2, z]} />
        ))}
      </Instances>
      {/* sombras sólidas */}
      <Instances limit={posicoes.length}>
        <circleGeometry args={[COPA_R, 20]} />
        <meshBasicMaterial
          color={SOMBRA_SOLIDA.cor}
          transparent
          opacity={SOMBRA_SOLIDA.opacidade}
          depthWrite={false}
        />
        {posicoes.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
            rotation={DEITADO}
          />
        ))}
      </Instances>
    </>
  );
}
