/**
 * ORDEM DAS CHEGADAS — decisão pura após a celebração de uma parada concluída.
 *
 * Na ESCOLA:
 *  1) Na primeira chegada elegível da sessão, o convite da Horta tem prioridade
 *     sobre qualquer pergunta escolar. Aceitar ou recusar encerra aquela
 *     interação; o roteiro avança silenciosamente e a pergunta NÃO abre.
 *  2) Se o convite ainda não pôde abrir (ex.: foco ocupado), a pergunta
 *     escolar não fura a fila — o convite segue pendente para a próxima
 *     chegada elegível à ESCOLA.
 *  3) Somente em uma chegada posterior à ESCOLA (após o convite já ter sido
 *     oferecido na sessão) a pergunta escolar pode abrir.
 *
 * Nos demais lugares, mantém o fluxo padrão: chegada viva se houver, senão
 * próxima parada do roteiro.
 */
export function resolverPosChegada(
  missao,
  { conviteHorta, temChegadaViva, abrirChegadaViva, proximaMissao }
) {
  if (missao?.tipo === 'gps' && missao.destino === 'ESCOLA') {
    if (conviteHorta.tentar(missao)) {
      proximaMissao();
      return 'convite_horta';
    }
    if (typeof conviteHorta.jaOferecido === 'function' && !conviteHorta.jaOferecido()) {
      proximaMissao();
      return 'proxima_missao';
    }
  }
  if (missao?.tipo === 'gps' && temChegadaViva(missao.destino)) {
    abrirChegadaViva(missao.destino);
    return 'chegada_viva';
  }
  proximaMissao();
  return 'proxima_missao';
}
