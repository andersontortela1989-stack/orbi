/**
 * VISITA LIVRE (Shopping — Fatia 3) — regra pura para abrir chegadas vivas
 * fora da parada ativa do roteiro, sem interromper outras atividades nem
 * alterar a missão em andamento.
 *
 * Sem React, sem Rapier e sem store: testável diretamente em node:test.
 */

export const LUGARES_VISITA_LIVRE = Object.freeze(['SHOPPING', 'SÍTIO']);
export const FOCOS_VISITA_LIVRE = Object.freeze(['explorando', 'em_missao']);

/** O lugar pode abrir sua chegada viva espontaneamente fora do roteiro? */
export function ehLugarVisitaLivre(slug) {
  return LUGARES_VISITA_LIVRE.includes(slug);
}

/**
 * Decide se a entrada no sensor pode disparar uma visita livre agora.
 * Respeita o coordenador de atividades (nunca fura carona, painéis, pausa ou
 * aventuras) e evita reabertura em loop enquanto o carro não sair da vaga.
 */
export function podeAbrirVisitaLivre({
  slug,
  foco,
  aventuraAtiva = false,
  chegadaVivaAtiva = false,
  missaoConcluida = false,
  jaNaZona = false,
}) {
  if (!ehLugarVisitaLivre(slug)) return false;
  if (!FOCOS_VISITA_LIVRE.includes(foco)) return false;
  if (aventuraAtiva || chegadaVivaAtiva || missaoConcluida || jaNaZona) {
    return false;
  }
  return true;
}

/**
 * Orquestração pura de uma entrada no ArrivalSensor:
 *  1) Aventura ativa com foco de missão -> encaminha para a aventura.
 *  2) Foco de missão -> tenta concluir a parada ativa do roteiro.
 *  3) Visita livre elegível -> registra o lugar no Caderninho e abre a
 *     chegada viva marcada com `visitaLivre: true`, preservando o roteiro.
 */
export function resolverChegadaSensor(
  slug,
  {
    foco,
    aventuraAtiva = false,
    chegadaVivaAtiva = false,
    missaoConcluida = false,
    jaNaZona = false,
    enviarEventoAventura,
    processarChegada,
    temChegadaViva,
    registrarDescoberta,
    abrirChegadaViva,
  }
) {
  if (foco === 'em_missao') {
    if (aventuraAtiva) {
      enviarEventoAventura?.({ tipo: 'chegou', lugar: slug });
      return 'aventura';
    }
    if (processarChegada?.(slug)) {
      return 'missao';
    }
  }

  if (
    podeAbrirVisitaLivre({
      slug,
      foco,
      aventuraAtiva,
      chegadaVivaAtiva,
      missaoConcluida,
      jaNaZona,
    }) &&
    temChegadaViva?.(slug)
  ) {
    registrarDescoberta?.('lugares', slug);
    const abriu = abrirChegadaViva?.(slug, { visitaLivre: true });
    return abriu === false ? 'ignorado' : 'visita_livre';
  }

  return 'ignorado';
}

/**
 * Fechamento da ChegadaVivaPanel:
 *  - chegada de missão do roteiro -> fecha e avança para a próxima parada;
 *  - visita livre -> apenas fecha, preservando a parada ativa intacta.
 */
export function finalizarChegadaViva(
  pergunta,
  { fecharChegadaViva, proximaMissao }
) {
  fecharChegadaViva();
  if (pergunta?.visitaLivre) {
    return 'visita_livre';
  }
  proximaMissao();
  return 'proxima_missao';
}