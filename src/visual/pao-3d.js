import * as THREE from 'three';
import { PALETA3D } from '../brand/paleta3d.js';
import { PAO_FORMA, TRACO_ADERECO, aderecosDoLugar } from '../city/identidade.js';

/**
 * Geometrias e materiais dos pães da PADARIA (A2.1), fora do componente para
 * o orçamento ser conferido em node:test (tests/pao-3d.test.js) com as MESMAS
 * peças que o AderecosLugar.jsx desenha.
 *
 * UMA instância de cada geometria e material, criada na primeira vez e
 * compartilhada por todos os pães (nunca descartada: são 4 geometrias e 3
 * materiais pequenos, reaproveitados se o jogo for remontado).
 *
 * Cada camada vira um InstancedMesh: 1 chamada de desenho com qualquer
 * quantidade de pães. As duas cascas de contorno dividem o mesmo material.
 */

// Copa (cilindro): 20 lados → 80 triângulos por pão. Com 4 pães a PADARIA
// fica em ~740 triângulos, bem abaixo do orçamento de 2.000 do teste.
export const SEGMENTOS_COPA = 20;

let recursos = null;

export function recursosDoPao() {
  if (recursos) return recursos;
  const [bx, by, bz] = PAO_FORMA.base;
  const r = PAO_FORMA.copaRaio;
  // e = folga do contorno; a origem fica na face de apoio (y = 0).
  const base = (e) =>
    new THREE.BoxGeometry(bx + 2 * e, by + 2 * e, bz + 2 * e).translate(0, by / 2, 0);
  const copa = (e) =>
    new THREE.CylinderGeometry(r + e, r + e, bz + 2 * e, SEGMENTOS_COPA)
      .rotateX(Math.PI / 2)
      .translate(0, by, 0);

  const contorno = new THREE.MeshBasicMaterial({
    color: PALETA3D.contorno,
    side: THREE.BackSide,
  });
  const lateral = new THREE.MeshStandardMaterial({ color: PALETA3D.pao.lateral, roughness: 0.6 });
  const casca = new THREE.MeshStandardMaterial({ color: PALETA3D.pao.casca, roughness: 0.55 });

  recursos = Object.freeze({
    // Ordem de desenho: contornos primeiro, como no Building.
    camadas: Object.freeze([
      Object.freeze({ geometria: base(TRACO_ADERECO), material: contorno, contorno: true }),
      Object.freeze({ geometria: copa(TRACO_ADERECO), material: contorno, contorno: true }),
      Object.freeze({ geometria: base(0), material: lateral, contorno: false }),
      Object.freeze({ geometria: copa(0), material: casca, contorno: false }),
    ]),
  });
  return recursos;
}

/** Camadas a desenhar: o estilo real não tem contorno de adesivo (V1). */
export function camadasDoEstilo(estilo = 'atual') {
  const { camadas } = recursosDoPao();
  return estilo === 'real' ? camadas.filter((c) => !c.contorno) : camadas;
}

/** Todos os pães do lugar (vitrine e telhado), prontos para as instâncias. */
export function paesDoLugar(slug, size, estilo = 'atual') {
  return aderecosDoLugar(slug, size, estilo)
    .filter((a) => a.forma === 'pao')
    .flatMap((a) => a.instancias);
}

const triangulos = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

/** Chamadas de desenho e triângulos dos pães de um lugar. */
export function orcamentoDoLugar(slug, size, estilo = 'atual') {
  const paes = paesDoLugar(slug, size, estilo);
  if (paes.length === 0) return { chamadas: 0, triangulos: 0 };
  const camadas = camadasDoEstilo(estilo);
  return {
    chamadas: camadas.length,
    triangulos: camadas.reduce((soma, c) => soma + triangulos(c.geometria) * paes.length, 0),
  };
}
