/**
 * Constantes da missão de GPS (Fatia 4).
 *
 * IMPORTANTE: PREDIOS_GPS espelha as posições e dimensões definidas em
 * src/components/City.jsx. Se um prédio for movido/redimensionado lá, atualizar
 * aqui também — drift entre os dois resulta no sensor desalinhado com a porta
 * (jogador chega no prédio certo e nada acontece, ou aciona sem entrar).
 *
 * Optou-se por NÃO importar de City pra manter City.jsx intacta nesta fatia.
 */

export const DESTINOS_GPS = ['PIZZA', 'HOSPITAL', 'ESCOLA'];

export const PREDIOS_GPS = [
  { slug: 'PIZZA',    floorPos: [-20, 15], size: [12, 6, 12] },
  { slug: 'HOSPITAL', floorPos: [20, 15],  size: [14, 10, 14] },
  { slug: 'ESCOLA',   floorPos: [0, 38],   size: [16, 7, 12] },
];

/** Frases pedindo o destino (artigos pt-BR corretos). */
export const FRASE_PEDIDO = {
  PIZZA:    'Quero ir até a pizza',
  HOSPITAL: 'Quero ir até o hospital',
  ESCOLA:   'Quero ir até a escola',
};

/** Frases comemorando a chegada — feedback ASSIMÉTRICO: erro não fala nada. */
export const FRASE_CHEGADA = {
  PIZZA:    'Boa! Chegamos na pizza!',
  HOSPITAL: 'Boa! Chegamos no hospital!',
  ESCOLA:   'Boa! Chegamos na escola!',
};
