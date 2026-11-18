/**
 * ITENS COLETÁVEIS DAS AVENTURAS — onde ficam e o que são, por etapa `coletar`
 * (H1: generaliza os baldes do parque para os sacos de semente da Horta).
 *
 * Coleta por proximidade, dirigindo (ItensAventura.jsx), sem física nova.
 * Dados puros: os testes conferem que cada saco fica no leito da rua, fora
 * de prédios e da banca do MERCADO.
 */
export const ITENS_POR_ETAPA = Object.freeze({
  // PARQUE COM SEDE — os mesmos quatro baldes de sempre, perto do PORTO
  'contar-baldes': Object.freeze({
    item: 'balde_agua',
    visual: 'balde',
    posicoes: Object.freeze([[-44, 8], [-44, 14], [-44, 20], [-44, 26]]),
  }),
  // HORTA DA ESCOLA — sacos de semente na rua em frente ao MERCADO (eixo em
  // z ≈ 31,6). Ordem de aparição: a faixa 3–5 usa os três primeiros, uma
  // fileira do lado do MERCADO; as faixas maiores usam a segunda fileira.
  'pegar-sementes': Object.freeze({
    item: 'semente',
    visual: 'saco',
    posicoes: Object.freeze([
      [47, 30], [52.5, 30], [58, 30],
      [44.5, 33.5], [50, 33.5], [55.5, 33.5],
    ]),
  }),
});

/**
 * Itens visíveis na etapa: `null` fora de uma etapa de coleta conhecida;
 * senão o item e as primeiras `contador.total` posições.
 */
export function itensDaEtapa(etapa, contador) {
  const def = ITENS_POR_ETAPA[etapa];
  if (!def) return null;
  const total = Math.max(0, Math.min(def.posicoes.length, contador?.total ?? def.posicoes.length));
  return { item: def.item, visual: def.visual, posicoes: def.posicoes.slice(0, total) };
}
