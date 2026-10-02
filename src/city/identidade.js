/**
 * IDENTIDADE DOS LUGARES (ficha A2) — adereços que mostram o que acontece em
 * cada lugar sem depender da placa: a criança reconhece a PADARIA pelos pães.
 *
 * Dado puro, testável em node:test (tests/identidade.test.js). O desenho fica
 * em components/AderecosLugar.jsx; o Building e o seu Marco não mudam.
 *
 * Regras (ficha A2 e fatia A2.1):
 *   - no máximo 2 adereços por lugar (excesso visual cansa);
 *   - adereço é informação, não enfeite: ESTÁTICO e visível também no Modo
 *     Tranquilo;
 *   - sem colisor e sem sensor: o carro sente só o colisor do Building;
 *   - adereço de fachada sai no máximo LIMITE_FACHADA da parede (pegada
 *     w × l), para o colisor da parede impedir o carro de atravessá-lo;
 *     adereço de telhado fica dentro da pegada.
 *
 * Coordenadas locais ao lote: x e z a partir do centro do prédio, y a partir
 * do chão. A câmera 2,5D vê as fachadas +Z e +X (CAMERA_2_5D).
 */

import { VITRINE_PADARIA_REAL } from '../visual/estilo-real/padaria.js';

export const LIMITE_FACHADA = 0.3;

// Traço do contorno escuro, mesma técnica do Building (casca BackSide). Mais
// fino que os 0,2 do prédio porque o pão é pequeno.
export const TRACO_ADERECO = 0.12;

// Pão de forma em unidades locais (a instância escala): base em caixa e copa
// em cilindro deitado (eixo Z), como o 🍞 da pergunta de contagem. A origem
// fica no centro da face de APOIO: y = 0 é onde o pão encosta.
export const PAO_FORMA = Object.freeze({
  base: Object.freeze([1, 0.55, 1]),
  copaRaio: 0.6,
});

// ESPELHO do Building.jsx — que não muda nesta fatia. Se a janela ou o
// telhado em pirâmide mudarem lá, mude aqui também.
//   Janelas (Building.jsx:104): faixa e altura do vidro da fachada +Z.
//   Telhado 'piramide' (Building.jsx:44): cone de 4 lados girado 45°,
//   escala [w × 0,67; 1,85; l × 0,67], centro a h/2 + 0,92 do meio do prédio.
const VIDRO_FRENTE = 0.16; // vidro em l/2 + 0,12, com 0,08 de espessura
const PIRAMIDE = Object.freeze({ escala: 0.67, altura: 1.85, elevacao: 0.92 });

/** Janela da fachada +Z, em coordenadas do lote. */
function janelaFrontal([, h]) {
  const faixaY = Math.min(0.35, h * 0.04);
  const altura = Math.max(1.15, h * 0.23);
  return { base: h / 2 + faixaY - altura / 2, altura };
}

/**
 * Face frontal (+Z) do telhado em pirâmide: um triângulo com base na beirada
 * (z = az, |x| ≤ ax) e vértice no centro. Altura da face em z:
 *   y = yBase + altura × (1 − z / az).
 */
export function telhadoPiramide([w, h, l]) {
  return {
    yBase: h + PIRAMIDE.elevacao - PIRAMIDE.altura / 2,
    altura: PIRAMIDE.altura,
    ax: PIRAMIDE.escala * w * Math.SQRT1_2,
    az: PIRAMIDE.escala * l * Math.SQRT1_2,
  };
}

// ---------------------------------------------------------------- geometria

/** Gira em torno de X (o único giro usado pelos adereços) e translada. */
function transformar([x, y, z], { posicao, rotacao }) {
  const c = Math.cos(rotacao[0]);
  const s = Math.sin(rotacao[0]);
  return [
    posicao[0] + x,
    posicao[1] + y * c - z * s,
    posicao[2] + y * s + z * c,
  ];
}

/** Os 4 cantos da face de apoio do pão, em coordenadas do lote. */
export function pontosDeApoio(inst) {
  const [bx, , bz] = PAO_FORMA.base;
  const [sx, , sz] = inst.escala;
  return [-1, 1].flatMap((i) =>
    [-1, 1].map((k) =>
      transformar([(i * bx * sx) / 2, 0, (k * bz * sz) / 2], inst)
    )
  );
}

/** Caixa alinhada aos eixos que envolve o pão COM o contorno. */
function limitesDoPao(inst) {
  const [bx, by, bz] = PAO_FORMA.base;
  const t = TRACO_ADERECO;
  const meiaX = Math.max(bx / 2, PAO_FORMA.copaRaio) + t;
  const [sx, sy, sz] = inst.escala;
  const xs = [-meiaX * sx, meiaX * sx];
  const ys = [-t * sy, (by + PAO_FORMA.copaRaio + t) * sy];
  const zs = [-(bz / 2 + t) * sz, (bz / 2 + t) * sz];
  const cantos = xs.flatMap((x) =>
    ys.flatMap((y) => zs.map((z) => transformar([x, y, z], inst)))
  );
  return {
    min: [0, 1, 2].map((e) => Math.min(...cantos.map((p) => p[e]))),
    max: [0, 1, 2].map((e) => Math.max(...cantos.map((p) => p[e]))),
  };
}

function juntarLimites(lista) {
  return {
    min: [0, 1, 2].map((e) => Math.min(...lista.map((b) => b.min[e]))),
    max: [0, 1, 2].map((e) => Math.max(...lista.map((b) => b.max[e]))),
  };
}

// ---------------------------------------------------------------- adereços

/** Três pães de forma na vitrine da fachada +Z, encostados no vidro. */
function paesNaVitrine(size) {
  const [, , l] = size;
  const janela = janelaFrontal(size);
  const escala = [1.2, 0.95, 0.4];
  const meiaProfundidade = (PAO_FORMA.base[2] / 2 + TRACO_ADERECO) * escala[2];
  // A frente do contorno fica 0,01 aquém do limite; o miolo do pão entra na
  // parede e só o relevo aparece à frente do vidro.
  const z = l / 2 + LIMITE_FACHADA - meiaProfundidade - 0.01;
  const y = janela.base + 0.04;
  return [-2.1, 0, 2.1].map((x) => ({
    posicao: [x, y, z],
    rotacao: [0, 0, 0],
    escala,
  }));
}

/** Pão grande deitado na face +Z do telhado, rente à inclinação. */
function paoNoTelhado(size) {
  const telhado = telhadoPiramide(size);
  const inclinacao = Math.atan2(telhado.altura, telhado.az);
  const z = telhado.az * 0.56;
  const y = telhado.yBase + telhado.altura * (1 - z / telhado.az);
  return [{ posicao: [0, y, z], rotacao: [inclinacao, 0, 0], escala: [2, 1.6, 2.4] }];
}

/**
 * Estilo real (V1.2): os 3 pães sentados no balcão da vitrine da PADARIA real
 * (visual/estilo-real/padaria.js). Mesmo contrato da fachada: a frente fica
 * no máximo LIMITE_FACHADA para fora da parede; o resto entra no vidro.
 */
function paesNaVitrineReal([, , l]) {
  const v = VITRINE_PADARIA_REAL;
  // V1.2b: pães maiores, visíveis de longe; a profundidade continua rasa
  // para a frente não passar de LIMITE_FACHADA.
  const escala = [1.15, 1.1, 0.3];
  const meiaProfundidade = (PAO_FORMA.base[2] / 2 + TRACO_ADERECO) * escala[2];
  const z = l / 2 + LIMITE_FACHADA - meiaProfundidade - 0.01;
  const passo = v.largura * 0.3;
  return [-passo, 0, passo].map((dx) => ({
    posicao: [v.centroX + dx, v.topoDoBalcao, z],
    rotacao: [0, 0, 0],
    escala,
  }));
}

export const ADERECOS = Object.freeze({
  PADARIA: Object.freeze([
    Object.freeze({ id: 'paes-vitrine', lugar: 'fachada', forma: 'pao', colisor: false, montar: paesNaVitrine }),
    Object.freeze({ id: 'pao-telhado', lugar: 'telhado', forma: 'pao', colisor: false, montar: paoNoTelhado }),
  ]),
});

// No estilo real o pão do telhado sai: a laje é plana e a placa bandeira com
// o ícone de pão faz esse papel (decisão de 02/10).
export const ADERECOS_REAIS = Object.freeze({
  PADARIA: Object.freeze([
    Object.freeze({ id: 'paes-vitrine', lugar: 'fachada', forma: 'pao', colisor: false, montar: paesNaVitrineReal }),
  ]),
});

/**
 * Adereços prontos de um lugar (vazio se o lugar não tem identidade).
 * `estilo` 'real' usa ADERECOS_REAIS quando o lugar tem versão real.
 */
export function aderecosDoLugar(slug, size, estilo = 'atual') {
  const tabela = estilo === 'real' && ADERECOS_REAIS[slug] ? ADERECOS_REAIS : ADERECOS;
  return (tabela[slug] ?? []).map(({ montar, ...declarado }) => {
    const instancias = montar(size);
    return {
      ...declarado,
      instancias,
      limites: juntarLimites(instancias.map(limitesDoPao)),
    };
  });
}
