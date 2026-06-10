/**
 * CHEGADAS VIVAS — mini-interação de aprendizado na chegada.
 * (Fatia extra, fora da numeração do roadmap do adendo curricular.)
 *
 * Em vez de a chegada ser só uma frase, lugares "vivos" abrem uma pergunta
 * de ~10s: o Órbi pergunta de verdade ("qual desses faz muu?") e a criança
 * responde tocando numa carta. Estreia no ZOO, reusando o banco de animais
 * de missoes-ciencias.js (o som do bicho É o conteúdo).
 *
 * GENERALIZÁVEL DE NASCENÇA: cada lugar com chegada viva é uma entrada em
 * GERADORES (slug do prédio → função que sorteia a pergunta). MERCADO,
 * PADARIA etc. entram nas próximas fatias adicionando um gerador aqui —
 * sem tocar no painel, no controlador nem na store.
 *
 * A pergunta sai PRONTA daqui (opções embaralhadas + as 4 frases de voz
 * montadas): o componente do painel só exibe e fala, sem saber de animais.
 * Frases de voz em minúsculas (lição do TTS — CAIXA ALTA é soletrada);
 * a CAIXA ALTA fica no visual do painel.
 */
import { ANIMAIS } from './missoes-ciencias.js';

/** Lugar tem chegada viva? (MissionController decide abrir o painel.) */
export function temChegadaViva(slug) {
  return !!GERADORES[slug];
}

/** Sorteia a pergunta do lugar, ou null se ele não tem chegada viva. */
export function sortearChegadaViva(slug) {
  const gerar = GERADORES[slug];
  return gerar ? gerar(slug) : null;
}

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Fisher-Yates — embaralha sem viciar (cópia; não muda o original). */
function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Evita repetir o animal da última visita — o mesmo ZOO rende pergunta nova
// (estado de sessão, de propósito: não persiste nem precisa).
let ultimoAnimalPerguntado = null;

/** Pergunta de som de animal (ZOO): 1 certa + 2 distratoras, embaralhadas. */
function sortearPerguntaAnimal(lugar) {
  const candidatos = ANIMAIS.filter((a) => a.slug !== ultimoAnimalPerguntado);
  const certo =
    candidatos[Math.floor(Math.random() * candidatos.length)] ?? ANIMAIS[0];
  ultimoAnimalPerguntado = certo.slug;

  const distratoras = embaralhar(
    ANIMAIS.filter((a) => a.slug !== certo.slug)
  ).slice(0, 2);
  const opcoes = embaralhar([certo, ...distratoras]).map((a) => ({
    slug: a.slug,
    emoji: a.emoji,
  }));

  const nome = certo.slug.toLowerCase();
  const { artigo, som } = certo;
  return {
    lugar,
    animal: certo.slug,
    som, // o painel mostra "QUAL DESSES FAZ MUU?"
    opcoes,
    frasePergunta: `Qual desses faz ${som}?`,
    fraseAcerto: `Isso! ${capitalizar(artigo)} ${nome} faz ${som}! Você sabe demais!`,
    fraseTenteDeNovo: `Hmm, vamos ouvir de novo? ${capitalizar(som)}!`,
    fraseRevela: `É ${artigo} ${nome}! ${capitalizar(artigo)} ${nome} faz ${som}!`,
  };
}

// slug do prédio → gerador de pergunta. SÓ o ZOO nesta fatia (estreia).
const GERADORES = {
  ZOO: sortearPerguntaAnimal,
};
