import { iniciarHortaEscola } from './runtime.js';
import { medicaoAtiva } from '../perf/medidor.js';
import { HORTA_BANDS } from '../school/horta.js';

/**
 * CONVITE DA HORTA (H1) — quando a Horta da escola é oferecida à criança.
 *
 * Regra: na chegada à ESCOLA do roteiro "Um dia do Órbi" (parada concluída),
 * UMA vez por sessão. A horta já viva não tranca o convite: a Horta é
 * repetível (decisão de 22/09) e a recompensa só sai na primeira conclusão
 * (o runtime e a store já ignoram repetidos).
 *
 * "Sessão" é a vida da página: o registro mora em memória, fora do save.
 * Recarregar a página é uma sessão nova.
 *
 * Convite que não pôde abrir (outra atividade em foco, outra aventura em
 * curso) NÃO conta como feito: a próxima passagem pela ESCOLA tenta de novo.
 */

/** Faixa da Horta até a H4 (escolha dos pais na Área dos Pais). */
export const FAIXA_HORTA_PADRAO = '3-5';

/**
 * Chave de teste: `?medir=1&faixa=6-7` (ou 3-5, 8-10) força a faixa da Horta,
 * para conferir as faixas maiores antes da H4. Sem `?medir=1`, ou com faixa
 * desconhecida, vale a faixa padrão.
 */
export function faixaDaHorta(search) {
  if (!medicaoAtiva(search)) return FAIXA_HORTA_PADRAO;
  const faixa = new URLSearchParams(search).get('faixa');
  return Object.hasOwn(HORTA_BANDS, faixa) ? faixa : FAIXA_HORTA_PADRAO;
}

/** `iniciar(faixa)` devolve true quando a aventura de fato começou. */
export function criarConviteHorta(iniciar, faixa = FAIXA_HORTA_PADRAO) {
  let feito = false;
  return Object.freeze({
    tentar(missao) {
      if (feito) return false;
      if (missao?.tipo !== 'gps' || missao.destino !== 'ESCOLA' || !missao.concluida) {
        return false;
      }
      if (!iniciar(faixa)) return false;
      feito = true;
      return true;
    },
  });
}

/** O convite desta sessão (o MissionController usa este). */
export const conviteHortaDaSessao = criarConviteHorta(
  iniciarHortaEscola,
  faixaDaHorta(typeof location !== 'undefined' ? location.search : '')
);
