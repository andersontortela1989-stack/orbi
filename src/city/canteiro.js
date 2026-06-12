/**
 * CANTEIRO DO PARQUE (Frente 5 — contagem REAL) — as árvores CONTÁVEIS
 * do quiz de contagem do PARQUE. É a migração que a fronteira previu:
 * árvore que vira conteúdo de quiz é JOGÁVEL, então mora em src/city/
 * (as 10 decorativas seguem no Cenario, fora de qualquer contagem). O
 * gerador do quiz (chegadas-vivas.js) deriva o N daqui — mexeu no
 * canteiro, o quiz acompanha sozinho.
 *
 * N FIXO = 4 (decisão da frente): o mundo nunca muda (guard-rail "nada
 * aparece/some"), então a resposta é sempre a mesma — previsibilidade é
 * FEATURE (TEA); a contagem variável continua na PADARIA. 4 ∈ QUANTIDADES
 * (2-5): cartas N−1/N/N+1 = 3/4/5.
 *
 * DELIMITAÇÃO SEM CERCA: fileira reta + canteiro de calçada branca
 * embaixo ("recheio de adesivo", a linguagem dos lotes) — alinhamento +
 * base comum agrupam perceptualmente, nada cerca. Folga ≥8 de qualquer
 * árvore decorativa (a vizinha [-20,58] foi relocada pra [-27,66] nesta
 * frente) — a criança nunca fica em dúvida sobre o que contar.
 *
 * POSIÇÃO: sul do lote do PARQUE (lote x -22..-6, z 64..80). Na chegada,
 * o carro está no lote (z ≈ 70) e o canteiro (z 59 < carro) aparece
 * ACIMA do painel do quiz na tela (+z do mundo = baixo da tela; o painel
 * ancora embaixo). Conferido contra: faixa de travessia do PARQUE
 * (x 4, z 53±2.6), fileira F de moedas (x 12, z 44..52) e decorativas.
 */
export const CANTEIRO = {
  // retângulo de calçada branca no chão: centro [x, z] e tamanho [w, l]
  base: { centro: [-10, 59], tamanho: [16, 5] },

  // as N árvores contáveis — passo 4, folga clara entre copas (r ~1.9)
  arvores: [
    [-16, 59],
    [-12, 59],
    [-8, 59],
    [-4, 59],
  ],
};
