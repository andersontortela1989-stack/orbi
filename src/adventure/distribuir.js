/**
 * CARTÃO DE REPARTIR (H1) — o que o PainelDistribuir mostra numa etapa
 * `distribuir` (plantar sementes, regar canteiros), lido do contador que o
 * motor já emite. Serve a qualquer etapa de repartir, não só à Horta.
 *
 * Não há resposta errada: canteiro cheio aparece cheio e o toque nele não faz
 * nada (o motor já trata como no-op silencioso).
 */

/** `null` quando não há etapa de repartir em curso. */
export function cartaoDistribuir(estadoAventura) {
  const contador = estadoAventura?.ativa ? estadoAventura.contador : null;
  if (!contador || !Array.isArray(contador.slots) || !contador.item) return null;
  const porSlot = contador.porSlot;
  return {
    item: contador.item,
    porSlot,
    canteiros: contador.slots.map((quantidade, indice) => ({
      indice,
      quantidade,
      cheio: quantidade >= porSlot,
    })),
  };
}

/** Evento que o toque num canteiro envia ao runtime. */
export function eventoDoCanteiro(cartao, indice) {
  return { tipo: 'distribuiu', item: cartao.item, slot: indice };
}
