import * as THREE from 'three';
import { PALETA3D } from '../brand/paleta3d.js';
import { montarMalha } from './geometria-mesclada.js';

/**
 * S1 — SILHUETA DO CARRO atrás de obstáculos (prédio, árvore, banca...): o
 * carro nunca some de vista. Vale para os dois estilos e para a cidade toda;
 * colisor, física e câmera não mudam.
 *
 * Técnica: uma versão simplificada do carro (corpo + cabine) desenhada com o
 * teste de profundidade INVERTIDO (`GreaterDepth`) — só aparece onde a cena
 * já desenhada está NA FRENTE dela. A ordem de desenho é o que faz funcionar:
 *   mundo (0) → silhueta (ORDEM_SILHUETA) → carro de verdade (ORDEM_CARRO).
 * Desenhada antes do carro, a silhueta não "vê" o próprio carro; desenhado
 * depois, o carro cobre a silhueta onde ele mesmo aparece.
 *
 * Cor: o PREENCHIMENTO é a tinta do carro (acompanha a pintura da garagem — a
 * criança reconhece "o meu carro"); o CONTORNO é a tinta escura da marca, que
 * separa a silhueta de qualquer fachada, inclusive da terracota da PADARIA
 * real, próxima do coral de fábrica. Sólida, parada, sem piscar nem pulsar.
 *
 * A silhueta começa a ALTURA_MINIMA_SILHUETA do chão: calçada (0,16) e
 * meio-fio (0,22) nunca a disparam, nem o carro passando sobre a calçada.
 */

export const ORDEM_SILHUETA = 10;
export const ORDEM_CARRO = 20;
export const ALTURA_MINIMA_SILHUETA = 0.3;
const TRACO_SILHUETA = 0.1;

/**
 * Caixas da silhueta em coordenadas LOCAIS do carro (origem no centro do
 * colisor; o chão fica em −altura/2). Preenchimento: corpo acima da altura
 * mínima e cabine. Contorno: as mesmas caixas, maiores dos lados e em cima —
 * nunca para baixo.
 */
export function caixasDaSilhueta({ largura, altura, comprimento }) {
  const chao = -altura / 2;
  const base = chao + ALTURA_MINIMA_SILHUETA;
  const topoCorpo = altura / 2;
  const preenchimento = [
    { id: 'corpo', pos: [0, (base + topoCorpo) / 2, 0], tam: [largura, topoCorpo - base, comprimento] },
    { id: 'cabine', pos: [0, altura * 0.6, -0.25], tam: [largura * 0.85, altura * 0.55, comprimento * 0.45] },
  ];
  const t = TRACO_SILHUETA;
  const contorno = preenchimento.map((c) => ({
    id: `contorno-${c.id}`,
    pos: [c.pos[0], c.pos[1] + t / 2, c.pos[2]],
    tam: [c.tam[0] + 2 * t, c.tam[1] + t, c.tam[2] + 2 * t],
  }));
  const caixa = (camada) => (c) => ({ ...c, camada, forma: 'caixa', cor: '#ffffff' });
  return [...preenchimento.map(caixa('preenchimento')), ...contorno.map(caixa('contorno'))];
}

/** Malhas mescladas da silhueta: preenchimento e contorno (2 chamadas). */
export function malhasDaSilhueta(carro) {
  const caixas = caixasDaSilhueta(carro);
  return {
    preenchimento: montarMalha(caixas.filter((c) => c.camada === 'preenchimento')),
    contorno: montarMalha(caixas.filter((c) => c.camada === 'contorno')),
  };
}

export function orcamentoSilhueta(carro) {
  const { preenchimento, contorno } = malhasDaSilhueta(carro);
  return { chamadas: 2, triangulos: preenchimento.triangulos + contorno.triangulos };
}

/** Materiais sólidos de profundidade invertida; `cor` = tinta do carro. */
export function criarMateriaisSilhueta(cor) {
  const comum = { depthTest: true, depthWrite: false, depthFunc: THREE.GreaterDepth };
  return {
    preenchimento: new THREE.MeshBasicMaterial({ ...comum, color: cor }),
    contorno: new THREE.MeshBasicMaterial({ ...comum, color: PALETA3D.contorno, side: THREE.BackSide }),
  };
}
