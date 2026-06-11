/**
 * GARAGEM (frente "Garagem") — fonte única de ONDE da garagem + CATÁLOGO
 * de cores do carro. Render 3D em components/Garagem.jsx, painel 2D em
 * components/GaragemPanel.jsx.
 *
 * SERVIÇOS ≠ DESTINOS (decisão da frente, precedente do POSTO): a garagem
 * NÃO entra em bairros.js — tudo lá ganha sensor de chegada do GPS
 * automaticamente (destinos.js deriva TODOS_PREDIOS), e garagem não é
 * destino de missão. Como o POSTO, ela é serviço: prédio próprio + zona
 * entra/sai + painel. Limitações conscientes: sem sensor GPS, sem chip no
 * Caderninho (o POSTO também não tem).
 *
 * BÔNUS DE LETRAMENTO do catálogo: o nome de cada cor em CAIXA ALTA é a
 * PALAVRA da cor — a criança lê SOL e VÊ o carro ficar amarelo. Ler tem
 * consequência imediata e visível no mundo.
 *
 * GUARD-RAILS:
 *   - primeira cor alcançável na PRIMEIRA sessão (~10-15 moedas): a graça
 *     é escolher, não poupar. Nada premium inalcançável.
 *   - zero hex novo: toda tinta vem de TINTAS (paleta3d).
 *   - moedas insuficientes NUNCA é erro/vermelho: a cor aparece neutra
 *     ("ainda não dá") e a voz faz a conta com calma.
 *
 * Posição conferida contra as fileiras de moedas (city/moedas.js): zona
 * do sensor (padding 4) = x 24..44, z -26..-6 — nenhuma moeda dentro
 * (fileira B termina em x 21; fileira G começa em x 48.5). Mexeu na
 * posição, conferir lá.
 */

import { TINTAS, PALETA3D } from '../brand/paleta3d.js';

// Asfalto sul, lado leste — simétrico ao POSTO (que guarda o oeste, em
// [-34, 24]). Mesmo porte baixo e largo do posto: serviços têm a mesma cara.
export const GARAGEM_POS = [34, -16];
export const GARAGEM_SIZE = [12, 5, 12];

/**
 * Catálogo de cores do carro — id SEMÂNTICO (persiste na store; o hex
 * deriva daqui na hora de renderizar, rebrand-proof), nome em CAIXA ALTA
 * (a palavra que a criança lê), tinta da marca, preço em moedas.
 *
 * 5 opções no total (dosagem TEA: cabe no painel sem rolagem). Escadinha
 * 10/15/20/25: SOL cai na primeira sessão; tudo alcançável em 1-2 sessões.
 * Cabine/rodas seguem navy FIXO (identidade + contraste com qualquer
 * corpo — NUVEM funciona porque a cabine segura, truque do prédio HOSPITAL).
 */
export const CORES_CARRO = [
  { id: 'coral', nome: 'CORAL', tinta: TINTAS.coral, preco: 0 }, // de fábrica
  { id: 'sol',   nome: 'SOL',   tinta: TINTAS.sun,   preco: 10 },
  { id: 'ceu',   nome: 'CÉU',   tinta: TINTAS.blue,  preco: 15 },
  { id: 'capim', nome: 'CAPIM', tinta: TINTAS.grass, preco: 20 },
  { id: 'nuvem', nome: 'NUVEM', tinta: TINTAS.white, preco: 25 },
];

export const COR_POR_ID = Object.fromEntries(
  CORES_CARRO.map((c) => [c.id, c])
);

/**
 * Tinta do corpo do carro a partir do id persistido. Fallback no coral
 * oficial (PALETA3D.carro.corpo) — id desconhecido num save velho/torto
 * nunca quebra o render.
 */
export function tintaDoCarro(id) {
  return COR_POR_ID[id]?.tinta ?? PALETA3D.carro.corpo;
}
