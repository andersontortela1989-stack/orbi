/**
 * ROTEIRO "UM DIA DO ÓRBI" (fatia R1) — a ordem fixa das missões.
 *
 * Substitui o sorteio de missões. No teste de 28/09/2026 o sorteio levou a
 * criança 5 a 6 vezes ao VET em cerca de 5 minutos, numa sequência sem
 * sentido (VET → FAROL → VET). Agora a volta conta um dia, do café ao jantar,
 * e recomeça sem cerimônia: nenhuma parada diz que o dia acabou.
 *
 * ORDEM FIXA, CONTEÚDO VARIA: os lugares vêm sempre na mesma ordem
 * (previsibilidade para TEA); o que varia é o que já variava dentro de cada
 * lugar — pães, bandeira, bicho do ZOO, fruta (chegadas-vivas.js) e o bicho
 * levado ao VET, sorteado aqui sem repetir o da volta anterior.
 *
 * FRONTEIRA: vira parada só o que o antigo sorteio gerava (leitura, ciências,
 * busca). Carona, aventura da água e horta continuam disparando por fora,
 * como antes; quando interrompem, a mesma parada é retomada.
 *
 * Módulo puro: sem React, sem store. A posição na volta é transitória (vive no
 * store, fora do save) — recarregar a página retoma pela missão salva.
 */
import { sortearAnimal } from './missoes-ciencias.js';
import { frasesDaMissao } from './missoes.js';

export const ROTEIRO = Object.freeze([
  Object.freeze({ tipo: 'gps', destino: 'PADARIA' }), // café da manhã
  Object.freeze({ tipo: 'gps', destino: 'ESCOLA' }), // hora da escola
  Object.freeze({ tipo: 'gps', destino: 'ESTÁDIO' }), // educação física
  Object.freeze({ tipo: 'busca', destino: 'GATO' }), // gatinho nas casas do centro
  Object.freeze({ tipo: 'gps', destino: 'ZOO' }), // visita aos bichos
  Object.freeze({ tipo: 'ciencias', destino: 'VET' }), // cuidar de um bicho
  Object.freeze({ tipo: 'gps', destino: 'MERCADO' }), // compras do jantar
  Object.freeze({ tipo: 'gps', destino: 'PIZZA' }), // o jantar
]);

/** Posição seguinte; depois da última, volta à primeira. */
export function proximaPosicao(posicao) {
  return (posicao + 1) % ROTEIRO.length;
}

/**
 * Missão nova para a parada `posicao`, no mesmo formato que o save já guarda:
 * { tipo, destino, concluida } e, em ciências, `animal`.
 */
export function missaoDaParada(posicao, { animalAnterior = null, random = Math.random } = {}) {
  const parada = ROTEIRO[posicao];
  if (!parada) return null;
  if (parada.tipo === 'ciencias') {
    return {
      tipo: 'ciencias',
      destino: parada.destino,
      animal: sortearAnimal(animalAnterior, random),
      concluida: false,
    };
  }
  return { tipo: parada.tipo, destino: parada.destino, concluida: false };
}

/** Posição da parada a que a missão corresponde, ou -1 se nenhuma. */
export function posicaoDaMissao(missao) {
  if (!missao) return -1;
  return ROTEIRO.findIndex((p) => p.tipo === missao.tipo && p.destino === missao.destino);
}

/**
 * INÍCIO — regra de retomada a partir da missão salva:
 *   - corresponde a uma parada e não foi concluída → retoma, com a MESMA missão;
 *   - corresponde a uma parada e já foi concluída → parada seguinte;
 *   - não há missão, ela não corresponde a nenhuma parada (formato do antigo
 *     sorteio) ou não é mais reconhecida (ex.: bicho que saiu do banco) →
 *     parada 1.
 */
export function inicioDoRoteiro(missaoSalva, opcoes = {}) {
  const reconhecida = !!missaoSalva && !!frasesDaMissao(missaoSalva);
  const posicao = reconhecida ? posicaoDaMissao(missaoSalva) : -1;
  if (posicao < 0) return { posicao: 0, missao: missaoDaParada(0, opcoes) };
  if (!missaoSalva.concluida) return { posicao, missao: missaoSalva };
  const proxima = proximaPosicao(posicao);
  return { posicao: proxima, missao: missaoDaParada(proxima, opcoes) };
}

/** Avanço normal: da parada atual para a seguinte. */
export function avancoDoRoteiro(posicaoAtual, opcoes = {}) {
  const proxima = proximaPosicao(posicaoAtual);
  return { posicao: proxima, missao: missaoDaParada(proxima, opcoes) };
}

/**
 * Regra de quando a próxima parada pode ser pedida: só com uma missão
 * concluída à espera, sem aventura ativa e com o foco de volta na missão.
 * Carona, painéis e aventura suspendem o avanço — a parada é retomada.
 */
export function podePedirProxima({ pendente, aventuraAtiva, temFocoMissao }) {
  return !!pendente && !aventuraAtiva && !!temFocoMissao;
}
