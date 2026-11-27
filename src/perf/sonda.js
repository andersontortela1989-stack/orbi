/**
 * SONDA DE EVENTOS (M1b) — ponto único por onde o jogo avisa "aconteceu X"
 * (chegada, pergunta, fala, voz...), para o medidor dizer QUAL evento
 * acompanha cada pico.
 *
 * Fica no pacote inicial porque o coordenador e a voz (que também estão lá)
 * a chamam. DESLIGADA por padrão: `marcar` não faz nada até o medidor ligá-la,
 * e o medidor só a liga com `?medir=1`. Sem medição, o custo é uma checagem.
 */
let registrar = null;

/** O medidor liga (ou desliga, com null) a sonda. */
export function ligarSonda(fn) {
  registrar = typeof fn === 'function' ? fn : null;
}

/** A medição está ligada? (M1c: quem mede tempo só o faz com a sonda ligada.) */
export function sondaLigada() {
  return registrar !== null;
}

/**
 * Marca um evento conhecido, pelo nome fixo; `dados` (M1c, opcional) leva as
 * medidas do evento (o save manda duração e tamanho). Sem medição: não faz nada.
 */
export function marcar(nome, dados) {
  if (registrar !== null) registrar(nome, dados);
}
