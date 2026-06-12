/**
 * Missão de BUSCA (Frente 5 — fusão mundo/conteúdo): o Órbi viu um bicho
 * e pede pra criança MOSTRAR onde — sem marcador de GPS, busca visual
 * ativa guiada por uma PISTA DE LUGAR ("perto da água"), nunca por
 * comando. O bicho é SEGREDO: descobrir qual é faz parte da recompensa
 * (o pedido diz "um bicho"; a chegada revela nome + som).
 *
 * Deriva TUDO das fontes existentes — zero banco novo:
 *   city/bichos.js  → posição (BuscaSensor) e pista (frases daqui);
 *   missoes-ciencias.js (banco ANIMAIS) → artigo e som da celebração.
 * A seta de dependência é a de sempre: missions deriva de city.
 *
 * Consumido via registry (missoes.js, caso 'busca') — o controlador não
 * sabe que a busca existe, como manda a costura do §E.
 */
import { BICHOS, BICHO_POR_SLUG } from '../city/bichos.js';
import { ANIMAL_POR_SLUG } from './missoes-ciencias.js';

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Sorteia o slug do bicho procurado, evitando repetir o último (mesma
 * regra de variedade do sorteio de destinos/animais).
 */
export function sortearBicho(ultimoSlug) {
  const candidatos = BICHOS.filter((b) => b.slug !== ultimoSlug);
  const sorteado =
    candidatos[Math.floor(Math.random() * candidatos.length)] ?? BICHOS[0];
  return sorteado.slug;
}

/**
 * Frases { pedido, chegada } da busca, ou null se o slug não existe mais
 * (save antigo → o controlador descarta e sorteia nova, contrato do
 * registry). Tom do adendo: pedido é curiosidade com pista de LUGAR;
 * chegada celebra revelando o bicho com o som do banco — o MESMO som
 * que o quiz do ZOO pergunta (ponte mundo↔conteúdo fechando o ciclo).
 */
export function frasesDaBusca(slug) {
  const bicho = BICHO_POR_SLUG[slug];
  const animal = ANIMAL_POR_SLUG[slug];
  if (!bicho || !animal) return null;
  const nome = slug.toLowerCase();
  return {
    pedido: `Eu vi um bicho ${bicho.pista}! Me mostra onde?`,
    chegada: `Achou! ${capitalizar(animal.artigo)} ${nome} estava ${bicho.pista}! ${capitalizar(animal.som)}!`,
  };
}
