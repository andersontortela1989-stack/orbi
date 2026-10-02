/**
 * Traçado das ruas curvas — dado puro (fatia V1, estilo real), para que o
 * teste "nenhuma peça sobre a rua" leia o MESMO traçado que o RoadNetwork
 * desenha. Antes viviam dentro do RoadNetwork.jsx, fora do alcance do
 * node:test.
 *
 * Cada caminho é uma curva Catmull-Rom por estes pontos [x, z], com
 * TENSAO_RUA; a faixa de asfalto tem LARGURA_RUA e a borda escura, por fora,
 * LARGURA_RUA_BORDA.
 */
export const CAMINHOS = Object.freeze([
  // eixo central: estádio → centro → parque
  [[-6, -38], [-5, -22], [0, -6], [-2, 13], [1, 31], [0, 52], [-2, 66]],
  // porto → centro → mercado. V1.3: o fim passava SOB a fachada do MERCADO
  // (dívida 14); agora sobe na costura do bairro e termina ENTRE os lotes do
  // MERCADO e da PADARIA, reto em z ≈ 31,6 (tests/rua-mercado.test.js).
  [[-78, 28], [-61, 29], [-43, 27], [-24, 23], [-3, 20], [18, 21], [34, 24], [39.5, 30.5],
    [46, 31.6], [52, 31.6], [58, 31.6]],
  // centro → escola → parque/zoo
  [[-2, 15], [5, 29], [0, 41], [-4, 54], [-3, 68], [7, 76], [20, 78]],
  // saída para garagem
  [[0, -4], [12, -7], [22, -12], [34, -16]],
  // anel curto de serviços do centro
  [[-34, 24], [-27, 17], [-18, 8], [-4, 3], [11, 6], [22, 15]],
]);

export const TENSAO_RUA = 0.35;
export const LARGURA_RUA = 6.5;
export const LARGURA_RUA_BORDA = 7.6;
