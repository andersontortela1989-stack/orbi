import { TINTAS } from '../brand/paleta3d.js';
import { TODOS_PREDIOS } from '../city/bairros.js';
import { montarMalha } from '../visual/geometria-mesclada.js';
import { PALETA_REAL } from '../visual/estilo-real/paleta.js';
import { caixa, contorno } from '../visual/estilo-real/pecas.js';

/**
 * A HORTA VIVA NO MUNDO (H2) — três canteiros baixos na faixa leste da ESCOLA,
 * o lado que a câmera vê. Vazios antes da primeira Horta (uma pista parada:
 * sem brilho, sem sensor, sem toque — decoração nunca vira missão); com
 * `horta_escola_viva`, dois brotos em cada canteiro.
 *
 * Posição e alturas saem da conta de oclusão da H2 (tests/horta-mundo.test.js):
 * canteiro até 0,20 e brotos até 0,6 acima da calçada não escondem o carro
 * mais do que hoje em nenhuma posição perto da ESCOLA. Sem corpo físico: o
 * carro passa por dentro, como pelas árvores da rua real.
 *
 * O mesmo visual nos dois estilos: a horta acompanha a ESCOLA, que ainda não
 * tem versão no estilo real. Dado puro; HortaEscola.jsx desenha.
 */

// Topo da camada violeta da calçada do Building (0,175 + 0,08 / 2).
export const BASE_HORTA = 0.215;
export const ALTURA_CANTEIRO = 0.2;
export const ALTURA_MAX_BROTO = 0.6;
export const ESCALA_INICIAL_BROTOS = 0.28; // como as flores do parque

// Cores de grupo: cada grupo é desenhado com UM material de cor lisa (sem cor
// por vértice), para não criar programa de shader novo no estilo atual.
export const COR_TERRA = PALETA_REAL.canteiro;
export const COR_BROTO = TINTAS.grass;

const ESCOLA = TODOS_PREDIOS.find((p) => p.slug === 'ESCOLA');
const [EX, EZ] = ESCOLA.pos;
const [EW] = ESCOLA.size;

const X_CANTEIRO = EX + EW / 2 + 1.0; // 0,4 da parede leste
const Z_CANTEIROS = [-3, 0, 3].map((dz) => EZ + dz);
const TAM_CANTEIRO = [1.2, ALTURA_CANTEIRO, 2.4];
const TOPO = BASE_HORTA + ALTURA_CANTEIRO;

function broto(id, x, z) {
  const cor = COR_BROTO;
  return [
    { id: `${id}:caule`, zona: 'horta', forma: 'cilindro', lados: 6, pos: [x, TOPO + 0.14, z], raio: 0.05, comprimento: 0.28, cor },
    caixa(`${id}:folha-1`, 'horta', [x - 0.14, TOPO + 0.24, z], [0.3, 0.04, 0.16], cor, { rot: [0, 0, 0.45] }),
    caixa(`${id}:folha-2`, 'horta', [x + 0.14, TOPO + 0.24, z], [0.3, 0.04, 0.16], cor, { rot: [0, 0, -0.45] }),
    { id: `${id}:olho`, zona: 'horta', forma: 'esfera', lados: 6, aneis: 4, pos: [x, TOPO + 0.29, z], raio: 0.09, cor },
  ];
}

/** Peças da horta em coordenadas do mundo, por grupo de desenho. */
export function pecasDaHortaEscola({ viva }) {
  const canteiros = Z_CANTEIROS.map((z, i) =>
    caixa(`canteiro-${i + 1}`, 'horta', [X_CANTEIRO, BASE_HORTA + ALTURA_CANTEIRO / 2, z], TAM_CANTEIRO, COR_TERRA)
  );
  const brotos = viva
    ? Z_CANTEIROS.flatMap((z, i) =>
        [-0.55, 0.55].flatMap((dz, j) => broto(`canteiro-${i + 1}/broto-${j + 1}`, X_CANTEIRO, z + dz))
      )
    : [];
  return { canteiros, contorno: canteiros.map((c) => contorno(c)), brotos };
}

/** Malhas mescladas por grupo (canteiros, contorno, brotos). */
export function malhasDaHortaEscola({ viva }) {
  const pecas = pecasDaHortaEscola({ viva });
  return {
    canteiros: montarMalha(pecas.canteiros),
    contorno: montarMalha(pecas.contorno),
    brotos: viva ? montarMalha(pecas.brotos) : null,
  };
}

/** Chamadas de desenho e triângulos (teto da H2: +3 chamadas). */
export function orcamentoHortaEscola({ viva }) {
  const malhas = Object.values(malhasDaHortaEscola({ viva })).filter(Boolean);
  return {
    chamadas: malhas.length,
    triangulos: malhas.reduce((s, m) => s + m.triangulos, 0),
  };
}

/** Altura da terra: os brotos crescem a partir dela (escala só em y). */
export const TOPO_DA_TERRA = TOPO;

/**
 * Brotos à vista? Com a flag ligada, mas escondidos enquanto a aventura que
 * acabou de ligá-la ainda mostra o resumo: aparecem quando ele fecha. Já
 * vistos nesta sessão, ou com a flag vinda do save, ficam sempre à vista
 * (repetir a Horta não os esconde).
 */
export function brotosVisiveis({ viva, vivaAoAbrir, jaApareceram, aventuraAtiva }) {
  return !!viva && (!!vivaAoAbrir || !!jaApareceram || !aventuraAtiva);
}

/** Escala em y quando aparecem: crescem uma vez; prontos ao recarregar ou sem animação. */
export function escalaInicialDosBrotos({ vivaAoAbrir, animacoes }) {
  return vivaAoAbrir || !animacoes ? 1 : ESCALA_INICIAL_BROTOS;
}
