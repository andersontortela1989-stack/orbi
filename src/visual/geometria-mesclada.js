import * as THREE from 'three';

/**
 * Construtor de geometria MESCLADA com cor por vértice (estilo real, V1).
 *
 * Um prédio do estilo real tem dezenas de peças (frisos, grades, janelas,
 * toldo...). Desenhadas uma a uma, seriam dezenas de chamadas de desenho;
 * mescladas numa malha só, com a cor guardada em cada vértice, viram UMA
 * chamada com um material compartilhado.
 *
 * Peça: { forma: 'caixa', tam: [w, h, d] } ou
 *       { forma: 'cilindro', raio, comprimento, lados, eixo: 'x'|'y'|'z' },
 *       sempre com pos [x, y, z] (centro), rot [rx, ry, rz] opcional (Euler,
 *       radianos) e cor '#rrggbb'.
 *
 * `montarMalha` é pura (arrays tipados, testável em node:test);
 * `geometriaDe` só embrulha o resultado numa BufferGeometry.
 */

// Variação sutil e ESTÁVEL por peça (±4% de brilho): tira a cara de cor
// chapada sem textura e sem sorteio (o mesmo prédio sai sempre igual).
const VARIACAO = 0.04;
function variacao(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const f = x - Math.floor(x);
  return 1 + (f * 2 - 1) * VARIACAO;
}

const EIXO_PARA_Y = {
  y: new THREE.Euler(0, 0, 0),
  x: new THREE.Euler(0, 0, Math.PI / 2),
  z: new THREE.Euler(Math.PI / 2, 0, 0),
};

function geometriaDaPeca(peca) {
  if (peca.forma === 'caixa') return new THREE.BoxGeometry(...peca.tam);
  if (peca.forma === 'cilindro') {
    const g = new THREE.CylinderGeometry(peca.raio, peca.raio, peca.comprimento, peca.lados ?? 16);
    const e = EIXO_PARA_Y[peca.eixo ?? 'y'];
    return g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(e));
  }
  throw new TypeError(`Forma desconhecida: ${peca.forma}`);
}

function matrizDaPeca(peca) {
  const rot = new THREE.Euler(...(peca.rot ?? [0, 0, 0]));
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...peca.pos),
    new THREE.Quaternion().setFromEuler(rot),
    new THREE.Vector3(1, 1, 1)
  );
}

/** Caixa alinhada aos eixos que envolve a peça, em coordenadas do lote. */
export function limitesDe(peca) {
  const g = geometriaDaPeca(peca);
  g.applyMatrix4(matrizDaPeca(peca));
  g.computeBoundingBox();
  const { min, max } = g.boundingBox;
  g.dispose();
  return { min: [min.x, min.y, min.z], max: [max.x, max.y, max.z] };
}

/** Junta as peças numa malha só. Devolve arrays tipados e a contagem. */
export function montarMalha(pecas) {
  const partes = pecas.map((peca, i) => {
    const g = geometriaDaPeca(peca).applyMatrix4(matrizDaPeca(peca));
    const cor = new THREE.Color(peca.cor).multiplyScalar(variacao(i));
    return { g, cor };
  });
  const totalVertices = partes.reduce((s, { g }) => s + g.attributes.position.count, 0);
  const totalIndices = partes.reduce((s, { g }) => s + g.index.count, 0);

  const posicoes = new Float32Array(totalVertices * 3);
  const normais = new Float32Array(totalVertices * 3);
  const cores = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);

  let v = 0;
  let k = 0;
  for (const { g, cor } of partes) {
    const n = g.attributes.position.count;
    posicoes.set(g.attributes.position.array, v * 3);
    normais.set(g.attributes.normal.array, v * 3);
    for (let i = 0; i < n; i += 1) {
      cores[(v + i) * 3] = cor.r;
      cores[(v + i) * 3 + 1] = cor.g;
      cores[(v + i) * 3 + 2] = cor.b;
    }
    const idx = g.index.array;
    for (let i = 0; i < idx.length; i += 1) indices[k + i] = idx[i] + v;
    v += n;
    k += idx.length;
    g.dispose();
  }
  return { posicoes, normais, cores, indices, triangulos: totalIndices / 3 };
}

/** BufferGeometry pronta para um <mesh> com material de cor por vértice. */
export function geometriaDe(malha) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(malha.posicoes, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(malha.normais, 3));
  g.setAttribute('color', new THREE.BufferAttribute(malha.cores, 3));
  g.setIndex(new THREE.BufferAttribute(malha.indices, 1));
  g.computeBoundingSphere();
  return g;
}
