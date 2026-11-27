/**
 * CARONA — fonte única de ONDE o cachorrinho espera e de onde ele é entregue.
 * Render, voz e fluxo em components/Carona.jsx.
 *
 * A ENTREGA não tem número próprio: é a âncora do PARQUE em bairros.js. Antes
 * a Carona copiava essa posição à mão; mover o parque deixava a entrega para
 * trás sem aviso.
 */

import { TODOS_PREDIOS } from './bairros.js';

// Calçada do CENTRO, ao sul da PIZZA. A zona de embarque não encosta em
// nenhum lote, sensor de chegada ou zona de serviço — tests/folgas-cidade.test.js
// confere (cão DEDICADO — não é o CACHORRO da missão de busca, que segue perto
// da garagem).
export const CARONA_ESPERA_POS = [-9, 1];

// Zona de embarque: caixinha em volta do cão + padding generoso (chegar perto).
export const CARONA_EMBARQUE_SIZE = [2, 2, 2];
export const CARONA_EMBARQUE_PADDING = 3;

// Zona de entrega = a âncora da praça do PARQUE (bairros.js: pos/size).
const PARQUE = TODOS_PREDIOS.find((p) => p.slug === 'PARQUE');
export const CARONA_ENTREGA_POS = PARQUE.pos;
export const CARONA_ENTREGA_SIZE = PARQUE.size;
