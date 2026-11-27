export const PAES_DA_PADARIA = Object.freeze([1, 2, 3, 4, 5]);

export function alternarPaoNaCesta(paesNaCesta, paoId) {
  return paesNaCesta.includes(paoId)
    ? paesNaCesta.filter((id) => id !== paoId)
    : [...paesNaCesta, paoId];
}

export function conferirPedido(alvo, paesNaCesta) {
  const quantidade = paesNaCesta.length;
  return {
    alvo,
    quantidade,
    correto: quantidade === alvo,
  };
}

export function conferirEConcluirPedido(alvo, paesNaCesta, concluir) {
  const resultado = conferirPedido(alvo, paesNaCesta);
  if (!resultado.correto) return { ...resultado, concluiu: false };
  return {
    ...resultado,
    concluiu: concluir({ quantidade: resultado.quantidade }) === true,
  };
}
