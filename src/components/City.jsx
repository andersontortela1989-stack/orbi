import { useMemo } from 'react';
import * as THREE from 'three';
import { Building } from './Building.jsx';
import { OpenPark } from './OpenPark.jsx';
import { BAIRROS } from '../city/bairros.js';
import { TINTAS } from '../brand/paleta3d.js';

function geometriaRetanguloArredondado(largura, profundidade, raio) {
  const x = -largura / 2;
  const y = -profundidade / 2;
  const r = Math.min(raio, largura / 2, profundidade / 2);
  const forma = new THREE.Shape();
  forma.moveTo(x + r, y);
  forma.lineTo(x + largura - r, y);
  forma.quadraticCurveTo(x + largura, y, x + largura, y + r);
  forma.lineTo(x + largura, y + profundidade - r);
  forma.quadraticCurveTo(x + largura, y + profundidade, x + largura - r, y + profundidade);
  forma.lineTo(x + r, y + profundidade);
  forma.quadraticCurveTo(x, y + profundidade, x, y + profundidade - r);
  forma.lineTo(x, y + r);
  forma.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(forma, 4);
}

function IlhaBairro({ bairro }) {
  const [largura, profundidade] = bairro.chao.tamanho;
  const base = useMemo(
    () => geometriaRetanguloArredondado(largura + 0.9, profundidade + 0.9, 2.2),
    [largura, profundidade]
  );
  const miolo = useMemo(
    () => geometriaRetanguloArredondado(largura, profundidade, 1.8),
    [largura, profundidade]
  );
  const [x, z] = bairro.chao.centro;
  return (
    <>
      <mesh geometry={base} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.9} />
      </mesh>
      <mesh geometry={miolo} position={[x, 0.018, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={bairro.corChao} roughness={0.9} metalness={0} />
      </mesh>
    </>
  );
}

/**
 * Cidade em BAIRROS temáticos contíguos (Fatia 7).
 *
 * Mundo contínuo, SEM menu e SEM teleporte: o carro dirige e entra na região.
 * Cada bairro tem um CHÃO colorido próprio (identidade visual da região — o
 * jogador sente que mudou de bairro pela cor, sem texto avisando) e seus
 * prédios com letreiros 3D em CAIXA ALTA. As regiões ficam lado a lado,
 * separadas por faixas do asfalto-base escuro (as "ruas"), o que dá uma
 * transição suave sem costura dura entre cores.
 *
 * Tudo vem de uma fonte única (src/city/bairros.js) — a mesma que alimenta os
 * sensores do GPS, então render e missão nunca saem de sincronia.
 *
 * Guard-rails: paleta calma e distinta por bairro, poucos prédios por região,
 * geometria simples (performance > riqueza visual — roda liso no notebook).
 */
export function City() {
  return (
    <>
      {BAIRROS.map((bairro) => (
        <group key={bairro.slug}>
          {/* Ilha urbana arredondada: substitui os recortes retangulares de
              protótipo sem mudar o Ground físico. A base violeta funciona
              como meio-fio e a camada colorida identifica cada bairro. */}
          <IlhaBairro bairro={bairro} />

          {bairro.predios.map((p) => (
            p.slug === 'PARQUE' ? (
              <OpenPark key={p.slug} floorPos={p.pos} />
            ) : (
              <Building
                key={p.slug}
                floorPos={p.pos}
                size={p.size}
                color={p.cor}
                label={p.slug}
              />
            )
          ))}
        </group>
      ))}
    </>
  );
}
