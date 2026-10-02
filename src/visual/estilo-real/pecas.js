import { PALETA_REAL } from './paleta.js';

/**
 * Auxiliares das peças do ESTILO REAL, compartilhados pela PADARIA, pelo
 * MERCADO e pela rua (V1.3). Peças são dado puro: o construtor de geometria
 * mesclada (visual/geometria-mesclada.js) as transforma em malha.
 */

export const CALCADA = 2.2; // por lado (CALCADA_POR_LADO)
export const PISO = 0.16; // topo da calçada

// Espessura do contorno fino (o Building usa 0,2; aqui é mais discreto).
export const TRACO_REAL = 0.08;

export const caixa = (id, zona, pos, tam, cor, extra = {}) => ({ id, zona, forma: 'caixa', pos, tam, cor, ...extra });

/**
 * Casca do contorno: a mesma peça, TRACO_REAL maior por lado, desenhada pelo
 * avesso na camada 'contorno' (regra 1 de legibilidade: nunca sem contorno).
 */
export function contorno(peca, extra = {}) {
  const t = TRACO_REAL;
  const casca = {
    ...peca,
    id: peca.id.includes(':') ? peca.id.replace(':', ':contorno-') : `contorno-${peca.id}`,
    camada: 'contorno',
    cor: PALETA_REAL.contorno,
    ...extra,
  };
  if (peca.forma === 'caixa') casca.tam = peca.tam.map((v) => v + 2 * t);
  else if (peca.forma === 'cilindro') {
    casca.raio = peca.raio + t;
    casca.comprimento = peca.comprimento + 2 * t;
  } else if (peca.forma === 'esfera') casca.raio = peca.raio + t;
  return casca;
}
