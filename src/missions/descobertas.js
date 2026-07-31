/**
 * CADERNINHO DO ÓRBI — conteúdo visual das descobertas.
 *
 * O álbum do que o Órbi aprendeu COM a criança (inversão pedagógica: nunca
 * "o que você aprendeu", sempre "o que o Órbi descobriu graças a você").
 *
 * Tudo aqui é DERIVADO dos bancos existentes (animais, frutas, quantidades,
 * prédios) — nenhum conteúdo duplicado: mexeu no banco, o álbum acompanha.
 *
 * Costura pra Fatia 13 (relatório BNCC): o relatório lerá `habilidades`
 * (números honestos); o caderninho lê `descobertas` (itens) + este módulo
 * (visual). Dois consumidores, zero acoplamento.
 */
import { ANIMAIS, ANIMAL_POR_SLUG } from './missoes-ciencias.js';
import { FRUTAS, QUANTIDADES } from './chegadas-vivas.js';
import { PAISES, PAIS_POR_SLUG } from './paises.js';
import { TODOS_PREDIOS } from '../city/bairros.js';

const FRUTA_POR_SLUG = Object.fromEntries(FRUTAS.map((f) => [f.slug, f]));
const PREDIO_POR_SLUG = Object.fromEntries(TODOS_PREDIOS.map((p) => [p.slug, p]));
const OBJETOS = {
  agua: {
    emoji: '💧',
    rotulo: 'ÁGUA',
    fato: 'A água ajuda as plantas a crescer!',
  },
  'flor-do-parque': {
    emoji: '🌼',
    rotulo: 'FLOR DO PARQUE',
    fato: 'Esta flor cresceu quando você levou água ao parque!',
  },
};

/**
 * Seções do caderninho, na ordem de exibição. LUGARES primeiro: preenche a
 * cada chegada, então a primeira abertura real já tem conteúdo no topo.
 * `possiveis` alimenta os slots-mistério ("?") — itens que o Órbi ainda vai
 * descobrir (curiosidade dele, nunca déficit da criança).
 */
export const CATEGORIAS_CADERNINHO = [
  { id: 'lugares',   titulo: 'LUGARES',  possiveis: TODOS_PREDIOS.map((p) => p.slug) },
  { id: 'animais',   titulo: 'BICHOS',   possiveis: ANIMAIS.map((a) => a.slug) },
  { id: 'frutas',    titulo: 'FRUTAS',   possiveis: FRUTAS.map((f) => f.slug) },
  { id: 'contagens', titulo: 'NÚMEROS',  possiveis: QUANTIDADES.map(String) },
  { id: 'paises',    titulo: 'PAÍSES',   possiveis: PAISES.map((p) => p.slug) },
  { id: 'objetos',   titulo: 'OBJETOS',  possiveis: Object.keys(OBJETOS) },
];

/**
 * Conteúdo visual de um adesivo: { emoji? , cor?, rotulo, fato } — emoji
 * quando o banco tem (bicho/fruta/pão), `cor` quando o adesivo é o chip
 * colorido do prédio. `fato` é o que o Órbi aprendeu, na voz dele.
 * Retorna null pra id desconhecido (ex.: item de save de versão futura).
 */
export function conteudoDescoberta(categoria, id) {
  if (categoria === 'animais') {
    const a = ANIMAL_POR_SLUG[id];
    return a ? { emoji: a.emoji, rotulo: a.slug, fato: `faz ${a.som}!` } : null;
  }
  if (categoria === 'frutas') {
    const f = FRUTA_POR_SLUG[id];
    return f ? { emoji: f.emoji, rotulo: f.slug, fato: `é ${f.cor}!` } : null;
  }
  if (categoria === 'contagens') {
    return { emoji: '🍞', rotulo: id, fato: `${id} pãezinhos!` };
  }
  if (categoria === 'lugares') {
    const p = PREDIO_POR_SLUG[id];
    return p ? { cor: p.cor, rotulo: p.slug, fato: p.fato ?? p.chegada } : null;
  }
  if (categoria === 'paises') {
    const p = PAIS_POR_SLUG[id];
    // `bandeira` no lugar de emoji/cor: o adesivo renderiza o SVG de
    // components/Bandeira.jsx (emoji de bandeira não existe no Windows).
    // `fato` = fatoVoz bespoke do banco; card E voz leem a MESMA fonte
    // (falaDescoberta deriva daqui), então nunca divergem.
    return p
      ? { bandeira: p.slug, rotulo: p.slug, fato: p.fatoVoz }
      : null;
  }
  if (categoria === 'objetos') {
    return OBJETOS[id] ?? null;
  }
  return null;
}

/**
 * Fala do adesivo ao TOQUE (frente "Caderninho falante") — derivada do
 * MESMO conteudoDescoberta acima, zero banco novo: mexeu no banco, a fala
 * acompanha. Composição explícita por categoria (a FORMA do `fato` decide):
 *   animais/frutas  — fato é FRAGMENTO ("faz miau!") → rótulo + fato;
 *   contagens       — fato já contém o rótulo ("3 pãezinhos!") → direto;
 *   lugares         — fato é frase completa do Órbi → direto.
 *
 * REGRA DA VOZ EM MINÚSCULAS: o rótulo é rebaixado na fala ("gato! faz
 * miau!", nunca "GATO!...") — alguns TTS soletram CAIXA ALTA, o mesmo
 * motivo do nomeParaVoz em voz.js. A CAIXA ALTA fica no visual do card.
 * (Os fatos de lugares já vêm minúsculos do banco — conferido.)
 *
 * Retorna null pra id desconhecido: toque vira silêncio, nunca erro.
 */
export function falaDescoberta(categoria, id) {
  const c = conteudoDescoberta(categoria, id);
  if (!c) return null;
  if (categoria === 'animais' || categoria === 'frutas') {
    return `${String(c.rotulo).toLowerCase()}! ${c.fato}`;
  }
  // Países: rótulo + fato, mas pelo nomeVoz do banco — "EUA" minúsculo
  // seria soletrado torto; "estados unidos! a bandeira de listras...".
  if (categoria === 'paises') {
    const p = PAIS_POR_SLUG[id];
    return p ? `${p.nomeVoz}! ${c.fato}` : null;
  }
  return c.fato;
}

// Contrato DEV (mesmo espírito do banco↔desenho do Bandeira.jsx): todo país
// precisa de fatoVoz — sem ele, conteudoDescoberta devolve fato undefined e o
// card/voz viram "undefined" (quebra de confiança, pior que bug normal pra
// criança TEA).
if (import.meta.env?.DEV) {
  for (const p of PAISES) {
    if (!p.fatoVoz) console.warn(`[descobertas] país sem fatoVoz: ${p.slug}`);
  }
}
