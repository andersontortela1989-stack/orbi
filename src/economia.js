/**
 * Constantes e helpers da economia (Fatia 5).
 *
 * Centralizadas aqui pra que HUD, FuelController e RefuelPanel falem a MESMA
 * língua — sem números mágicos duplicados que saem de sincronia.
 *
 * Filosofia (guard-rail TEA+TDAH):
 *   - números pequenos e legíveis (contagem 1–N, com N pequeno);
 *   - sem game over: tanque vazio desacelera suave e ainda dá pra chegar ao posto;
 *   - "afinar sentindo" — estes valores são pra você ajustar pelo feel.
 */

// Capacidade do tanque em "litros" (a unidade que a criança CONTA ao abastecer).
// 10 mantém o "FALTAM N LITROS" sempre dentro de 1–10 (BNCC 2º ano: número 1–15).
export const TANQUE_LITROS = 10;

// % de combustível abaixo do qual o POSTO abre a interação de abastecimento.
export const LIMIAR_ABASTECER = 60;

// % que dispara o aviso calmo "a gasolina está baixa" (uma vez por episódio).
export const LIMIAR_BAIXO = 25;

// % de combustível gasto por METRO andado. Consumo proporcional à distância:
// parado não gasta; quanto mais e mais rápido anda, mais consome.
// Tunável: maior = abastece com mais frequência.
export const CONSUMO_POR_METRO = 0.08;

// Velocidade máxima (m/s) no modo RESERVA (tanque vazio): o carro ainda anda
// devagarinho segurando a seta, pra SEMPRE conseguir chegar ao posto. Sem dead-end.
export const V_LIMP = 3;

// Fator de desaceleração suave por frame (a 60fps) quando o tanque está vazio.
// < 1 = freia gradual; perto de 1 = desliza por mais tempo antes de parar.
export const PARADA_SUAVE = 0.965;

/**
 * Quantos litros faltam pra encher, inteiro em 1..TANQUE_LITROS.
 * É o "N" do "FALTAM N LITROS" — o número que a criança vai contar.
 */
export function litrosFaltando(combustivel) {
  const pctPorLitro = 100 / TANQUE_LITROS;
  const faltam = Math.ceil((100 - combustivel) / pctPorLitro);
  return Math.max(1, Math.min(TANQUE_LITROS, faltam));
}

/**
 * "O painel de abastecer deve estar aberto?" — UMA fonte da verdade,
 * consumida pelo HUD (pra esconder o banner do GPS) e pelo RefuelPanel
 * (pra renderizar). Evita que as duas cópias da condição saiam de sincronia.
 */
export function postoAtivo(combustivel, postoPerto) {
  return postoPerto && combustivel < LIMIAR_ABASTECER;
}
