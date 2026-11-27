/**
 * ITENS COLETÁVEIS DAS AVENTURAS — onde ficam e o que são, por etapa `coletar`
 * (H1: generaliza os baldes do parque para os sacos de semente da Horta).
 *
 * Coleta por proximidade, dirigindo (ItensAventura.jsx), sem física nova.
 * Dados puros: os testes conferem que cada saco fica no leito da rua, fora
 * de prédios e da banca do MERCADO.
 */
/** Distância (centro do carro ao centro do item) em que o item é coletado. */
export const RAIO_COLETA = 2.7;

/**
 * SACO DE SEMENTE (H3 (d)) — medidas locais do desenho (ItensAventura.jsx) e
 * a escala no mundo. No notebook os sacos ficavam pequenos e claros sobre o
 * asfalto: agora 1,3×, com contorno navy de 0,08 (pelo avesso) e amarrado
 * coral. A oclusão do carro é conferida com `formaDoSaco` (limite de 25%).
 */
export const SACO = Object.freeze({
  escala: 1.3,
  corpo: Object.freeze({ raioTopo: 0.42, raioBase: 0.56, altura: 1.0 }),
  amarrado: Object.freeze({ raioTopo: 0.2, raioBase: 0.3, altura: 0.12, y: 1.04 }),
  broto: Object.freeze({ raio: 0.3, y: 1.32, achatado: 0.6 }),
  contorno: 0.08, // espessura no mundo
});

/**
 * Forma do saco no mundo, em cilindros verticais { x, z, r, y0, y1 }, para a
 * conta de oclusão: corpo + amarrado (com o contorno) e o broto.
 */
export function formaDoSaco([x, z]) {
  const { escala: s, corpo, amarrado, broto, contorno: b } = SACO;
  const topoAmarrado = (amarrado.y + amarrado.altura / 2) * s;
  return [
    { x, z, r: corpo.raioBase * s + b, y0: 0, y1: topoAmarrado + b },
    { x, z, r: broto.raio * s, y0: topoAmarrado, y1: (broto.y + broto.raio * broto.achatado) * s },
  ];
}

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
