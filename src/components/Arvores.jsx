import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';

/**
 * Árvores adesivas REUTILIZÁVEIS — extraídas do Cenario na Frente 5,
 * quando o CANTEIRO contável virou o segundo consumidor (regra da casa:
 * extrair quando chega o 2º consumidor real — precedente ZoneSensor).
 *
 * Cada posição continua representando UMA árvore, inclusive no canteiro de
 * contagem. A copa ganhou facetas suaves, escala orgânica e um pequeno
 * degradê superior; o tronco segue simples e sem colisão.
 *
 * Receita: copa icosaedro + contorno navy BackSide (traço ADITIVO no raio) +
 * tronco fino sem contorno próprio +
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

function escalaDaCopa(i, extra = 0) {
  const variacao = [
    [1.0, 1.08, 0.94],
    [0.94, 1.0, 1.08],
    [1.07, 0.96, 1.0],
  ][i % 3];
  return variacao.map((valor) => valor + extra);
}

export function Arvores({ posicoes }) {
  return (
    <>
      {/* contorno sticker das copas (aditivo: raio + TRACO) */}
      <Instances limit={posicoes.length}>
        <icosahedronGeometry args={[COPA_R + TRACO, 1]} />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {posicoes.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x, COPA_Y, z]}
            rotation={[0, (i * Math.PI) / 7, 0]}
            scale={escalaDaCopa(i, 0.035)}
          />
        ))}
      </Instances>
      {/* copas — capim/capim-deep alternados (variedade calma) */}
      <Instances limit={posicoes.length}>
        <icosahedronGeometry args={[COPA_R, 1]} />
        <meshStandardMaterial roughness={0.78} />
        {posicoes.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x, COPA_Y, z]}
            rotation={[0, (i * Math.PI) / 7, 0]}
            scale={escalaDaCopa(i)}
            color={i % 2 ? PALETA3D.copaEscura : PALETA3D.copa}
          />
        ))}
      </Instances>
      {/* Luz de copa: não é outra árvore; é um pequeno volume sobreposto que
          dá profundidade de ilustração mantendo a silhueta contável. */}
      <Instances limit={posicoes.length}>
        <sphereGeometry args={[COPA_R * 0.48, 12, 10]} />
        <meshStandardMaterial color={TINTAS.grass} roughness={0.72} />
        {posicoes.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x - 0.42, COPA_Y + 0.65, z - 0.28]}
            scale={i % 2 ? 0.82 : 1}
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
