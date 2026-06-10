/**
 * CHEGADAS VIVAS — mini-interação de aprendizado na chegada.
 * (Fatias extras, fora da numeração do roadmap do adendo curricular.)
 *
 * Em vez de a chegada ser só uma frase, lugares "vivos" abrem uma pergunta
 * de ~10s: o Órbi pergunta de verdade e a criança responde tocando numa
 * carta. Estreou no ZOO (sons de animais); MERCADO (cores das frutas — artes)
 * e PADARIA (contagem de pães — matemática) entraram na fatia seguinte.
 *
 * GENERALIZÁVEL: cada lugar é uma entrada em GERADORES (slug do prédio →
 * função que sorteia a pergunta). Lugar novo = um gerador aqui — sem tocar
 * no painel, no controlador nem na store.
 *
 * A pergunta sai PRONTA e GENÉRICA daqui; o painel só exibe e fala, sem
 * saber de animais/frutas/números:
 *   habilidade      — chave registrada na store (dado honesto por toque)
 *   resposta        — `valor` da carta certa
 *   tituloAntes / tituloDestaque / tituloDepois — título CAIXA ALTA do
 *     painel (o destaque acende em Sol-deep; pode ser vazio)
 *   mostra          — (opcional) fileira de itens pra contar na tela
 *                     ({ emoji, quantidade }; só a PADARIA usa)
 *   opcoes          — 3 cartas { valor, emoji|null, rotulo } embaralhadas
 *                     (sem emoji, o rótulo vira número grande)
 *   dica            — instrução curta embaixo das cartas
 *   descoberta      — { categoria, id } do item pro Caderninho do Órbi
 *                     (registrado no acerto E na revelação: o Órbi aprendeu
 *                     o fato de qualquer jeito — narrativa generosa; a régua
 *                     honesta continua sendo `habilidades`)
 *   frasePergunta / fraseAcerto / fraseTenteDeNovo / fraseRevela — as 4
 *     falas do Órbi, em minúsculas (lição do TTS — CAIXA ALTA é soletrada)
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

function sortearItem(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ============================== ZOO ====================================
// Sons de animais (ciências) — reusa o banco de missoes-ciencias.js.

// Evita repetir o alvo da última visita — o mesmo lugar rende pergunta nova
// (estado de sessão, de propósito: não persiste nem precisa).
let ultimoAnimalPerguntado = null;

/** Pergunta de som de animal: 1 certa + 2 distratoras, embaralhadas. */
function sortearPerguntaAnimal(lugar) {
  const certo =
    sortearItem(ANIMAIS.filter((a) => a.slug !== ultimoAnimalPerguntado)) ??
    ANIMAIS[0];
  ultimoAnimalPerguntado = certo.slug;

  const distratoras = embaralhar(
    ANIMAIS.filter((a) => a.slug !== certo.slug)
  ).slice(0, 2);
  const opcoes = embaralhar([certo, ...distratoras]).map((a) => ({
    valor: a.slug,
    emoji: a.emoji,
    rotulo: a.slug,
  }));

  const nome = certo.slug.toLowerCase();
  const { artigo, som } = certo;
  return {
    lugar,
    habilidade: 'cienciasVida',
    resposta: certo.slug,
    tituloAntes: 'QUAL DESSES FAZ',
    tituloDestaque: som.toUpperCase(),
    tituloDepois: '?',
    mostra: null,
    opcoes,
    dica: 'TOQUE NO BICHO CERTO',
    descoberta: { categoria: 'animais', id: certo.slug },
    frasePergunta: `Qual desses faz ${som}?`,
    fraseAcerto: `Isso! ${capitalizar(artigo)} ${nome} faz ${som}! Você sabe demais!`,
    fraseTenteDeNovo: `Hmm, vamos ouvir de novo? ${capitalizar(som)}!`,
    fraseRevela: `É ${artigo} ${nome}! ${capitalizar(artigo)} ${nome} faz ${som}!`,
  };
}

// ============================ MERCADO ==================================
// Cores das frutas (artes). Banco próprio da mecânica — cores todas
// DISTINTAS de propósito: quaisquer 2 distratoras já têm cor diferente
// da certa (nunca há duas respostas plausíveis). Exportado: o Caderninho
// do Órbi (descobertas.js) deriva os adesivos daqui, sem duplicar banco.

export const FRUTAS = [
  { slug: 'MAÇÃ',    emoji: '🍎', artigo: 'a', cor: 'vermelha' },
  { slug: 'BANANA',  emoji: '🍌', artigo: 'a', cor: 'amarela' },
  { slug: 'UVA',     emoji: '🍇', artigo: 'a', cor: 'roxa' },
  { slug: 'LARANJA', emoji: '🍊', artigo: 'a', cor: 'laranja' },
  { slug: 'PERA',    emoji: '🍐', artigo: 'a', cor: 'verde' },
];

let ultimaFrutaPerguntada = null;

/** Pergunta de cor de fruta: "qual fruta é vermelha?" → toca na maçã. */
function sortearPerguntaCorFruta(lugar) {
  const certa =
    sortearItem(FRUTAS.filter((f) => f.slug !== ultimaFrutaPerguntada)) ??
    FRUTAS[0];
  ultimaFrutaPerguntada = certa.slug;

  const distratoras = embaralhar(
    FRUTAS.filter((f) => f.slug !== certa.slug)
  ).slice(0, 2);
  const opcoes = embaralhar([certa, ...distratoras]).map((f) => ({
    valor: f.slug,
    emoji: f.emoji,
    rotulo: f.slug,
  }));

  const nome = certa.slug.toLowerCase();
  const { artigo, cor } = certa;
  return {
    lugar,
    habilidade: 'cores',
    resposta: certa.slug,
    tituloAntes: 'QUAL FRUTA É',
    tituloDestaque: cor.toUpperCase(),
    tituloDepois: '?',
    mostra: null,
    opcoes,
    dica: 'TOQUE NA FRUTA CERTA',
    descoberta: { categoria: 'frutas', id: certa.slug },
    frasePergunta: `Qual fruta é ${cor}?`,
    fraseAcerto: `Isso! ${capitalizar(artigo)} ${nome} é ${cor}! Você sabe as cores!`,
    fraseTenteDeNovo: `Hmm, vamos ver de novo? ${capitalizar(cor)}!`,
    fraseRevela: `É ${artigo} ${nome}! ${capitalizar(artigo)} ${nome} é ${cor}!`,
  };
}

// ============================ PADARIA ==================================
// Contagem de pães (matemática). Sem banco: o conteúdo é o N sorteado.

// N pequeno (2–5): cabe na tela em pães grandes, contáveis no dedo.
// Exportado: o Caderninho deriva os slots de números daqui.
export const QUANTIDADES = [2, 3, 4, 5];

let ultimaQuantidade = null;

/** Pergunta de contagem: mostra N pães; cartas N-1 / N / N+1 (nunca zero). */
function sortearPerguntaPaes(lugar) {
  const n = sortearItem(QUANTIDADES.filter((q) => q !== ultimaQuantidade));
  ultimaQuantidade = n;

  const opcoes = embaralhar([n - 1, n, n + 1]).map((v) => ({
    valor: String(v),
    emoji: null, // sem emoji → o painel mostra o rótulo como NÚMERO grande
    rotulo: String(v),
  }));

  return {
    lugar,
    habilidade: 'contagem',
    resposta: String(n),
    tituloAntes: 'QUANTOS PÃES TEM AQUI?',
    tituloDestaque: '',
    tituloDepois: '',
    mostra: { emoji: '🍞', quantidade: n },
    opcoes,
    dica: 'TOQUE NO NÚMERO CERTO',
    descoberta: { categoria: 'contagens', id: String(n) },
    frasePergunta: 'Quantos pães tem aqui?',
    fraseAcerto: `Isso! São ${n} pães! Você conta muito bem!`,
    // não vaza a resposta: a dica é contar de novo, não a cor/som do alvo
    fraseTenteDeNovo: 'Hmm, vamos contar de novo?',
    fraseRevela: `São ${n} pães! ${n} pãezinhos!`,
  };
}

// slug do prédio → gerador de pergunta.
const GERADORES = {
  ZOO: sortearPerguntaAnimal,
  MERCADO: sortearPerguntaCorFruta,
  PADARIA: sortearPerguntaPaes,
};
