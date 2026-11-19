/**
 * ESPERA DA FALA — esperar a voz e avançar UMA vez.
 *
 * O mesmo contrato da Carona (components/Carona.jsx, `entregar`): a fala
 * avisa o fim (`onEnd`, que também cobre o erro de síntese), um temporizador
 * de reserva cobre o navegador que nunca avisa, e uma guarda impede a dupla
 * conclusão. Aqui, com um mínimo: a carta revelada fica à vista pelo tempo de
 * leitura mesmo quando a fala acaba cedo, não existe ou falha.
 *
 * Motivos do avanço (vão para a telemetria do runtime):
 *   'fim_da_fala' — o navegador informou o fim;
 *   'erro'        — o navegador informou erro na síntese;
 *   'sem_voz'     — nada foi falado (voz desligada, indisponível, sem foco);
 *   'limite'      — o navegador não respondeu até o limite de segurança.
 */
// Relógio do navegador. As funções globais são CHAMADAS por embrulhos, nunca
// guardadas como métodos de outro objeto: no navegador, `obj.setTimeout()`
// com o setTimeout nativo lança "Illegal invocation" (o Node não reclama).
const RELOGIO_GLOBAL = Object.freeze({
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
});

export function criarEsperaDaFala({
  minimoMs,
  limiteMs,
  aoAvancar,
  relogio = RELOGIO_GLOBAL,
}) {
  let avancou = false;
  let minimoPassou = false;
  let motivoDaFala = null; // definido quando a fala termina (ou não existe)

  const avancar = (motivo) => {
    if (avancou) return;
    avancou = true;
    relogio.clearTimeout(tMinimo);
    relogio.clearTimeout(tLimite);
    aoAvancar(motivo);
  };

  const tMinimo = relogio.setTimeout(() => {
    minimoPassou = true;
    if (motivoDaFala) avancar(motivoDaFala);
  }, minimoMs);
  const tLimite = relogio.setTimeout(() => avancar('limite'), limiteMs);

  return {
    /** A fala acabou ('fim_da_fala'), falhou ('erro') ou nem houve ('sem_voz'). */
    falaTerminou(motivo) {
      if (avancou || motivoDaFala) return;
      motivoDaFala = motivo;
      if (minimoPassou) avancar(motivo);
    },
    /** A aventura acabou ou outra espera começou: nunca avança. */
    cancelar() {
      avancou = true;
      relogio.clearTimeout(tMinimo);
      relogio.clearTimeout(tLimite);
    },
  };
}
