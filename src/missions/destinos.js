/**
 * API da missão de GPS (Fatias 4–7).
 *
 * A partir da Fatia 7, TUDO é derivado de src/city/bairros.js — a fonte única
 * de verdade da cidade. Não há mais espelhamento manual de posições com o
 * City.jsx (que era o risco de drift avisado aqui antes): mover um prédio em
 * bairros.js atualiza, de uma vez, o render E os sensores do GPS.
 *
 * As exportações abaixo mantêm exatamente o mesmo formato de antes, então
 * MissionController, MissionSensors e a store (useGame) continuam funcionando
 * sem mudança — só que agora a missão sorteia destinos pela cidade INTEIRA
 * (todos os bairros), não só os 3 prédios originais.
 */
import { TODOS_PREDIOS } from '../city/bairros.js';

/** Slugs de todos os destinos possíveis (todos os prédios de todos os bairros). */
export const DESTINOS_GPS = TODOS_PREDIOS.map((p) => p.slug);

/** Geometria de cada destino, para os sensores de chegada (um por prédio). */
export const PREDIOS_GPS = TODOS_PREDIOS.map((p) => ({
  slug: p.slug,
  floorPos: p.pos,
  size: p.size,
}));

/** Frases pedindo o destino (artigos pt-BR corretos). */
export const FRASE_PEDIDO = Object.fromEntries(
  TODOS_PREDIOS.map((p) => [p.slug, p.pedido])
);

/** Frases comemorando a chegada — feedback ASSIMÉTRICO: erro não fala nada. */
export const FRASE_CHEGADA = Object.fromEntries(
  TODOS_PREDIOS.map((p) => [p.slug, p.chegada])
);
