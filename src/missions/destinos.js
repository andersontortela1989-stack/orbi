/**
 * API das missões de lugar (Fatias 4–8).
 *
 * A partir da Fatia 7, TUDO é derivado de src/city/bairros.js — a fonte única
 * de verdade da cidade. Não há mais espelhamento manual de posições com o
 * City.jsx (que era o risco de drift avisado aqui antes): mover um prédio em
 * bairros.js atualiza, de uma vez, o render E os sensores do GPS.
 *
 * Fatia 8: prédios com `soCiencias` (a clínica VET) ganham sensor de chegada
 * (PREDIOS_GPS) mas NÃO entram no sorteio de leitura (DESTINOS_GPS) nem nas
 * frases do GPS — chegar neles sempre acontece dentro de uma missão temática,
 * que traz as próprias frases (missoes-ciencias.js).
 */
import { TODOS_PREDIOS } from '../city/bairros.js';

/** Prédios que entram no sorteio de LEITURA do GPS (sem os soCiencias). */
const PREDIOS_LEITURA = TODOS_PREDIOS.filter((p) => !p.soCiencias);

/** Slugs dos destinos sorteáveis pela missão de GPS. */
export const DESTINOS_GPS = PREDIOS_LEITURA.map((p) => p.slug);

/**
 * Geometria de TODOS os prédios, para os sensores de chegada — um por prédio,
 * inclusive os soCiencias (o VET precisa de sensor pra missão de Ciências).
 */
export const PREDIOS_GPS = TODOS_PREDIOS.map((p) => ({
  slug: p.slug,
  floorPos: p.pos,
  size: p.size,
}));

/** Frases pedindo o destino (artigos pt-BR corretos). */
export const FRASE_PEDIDO = Object.fromEntries(
  PREDIOS_LEITURA.map((p) => [p.slug, p.pedido])
);

/** Frases comemorando a chegada — feedback ASSIMÉTRICO: erro não fala nada. */
export const FRASE_CHEGADA = Object.fromEntries(
  PREDIOS_LEITURA.map((p) => [p.slug, p.chegada])
);
