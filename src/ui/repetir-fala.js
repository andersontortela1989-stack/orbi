/**
 * Botão de repetir a fala do Órbi (C1): habilitado só quando há uma fala
 * guardada para a atividade em foco E a voz está ligada. Com a voz desligada
 * o botão aparece desabilitado — nunca finge que vai falar.
 */
export function podeRepetirFala({ fala, vozLigada }) {
  return Boolean(fala) && vozLigada !== false;
}
