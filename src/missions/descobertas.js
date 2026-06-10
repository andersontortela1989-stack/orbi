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
import { TODOS_PREDIOS } from '../city/bairros.js';

const FRUTA_POR_SLUG = Object.fromEntries(FRUTAS.map((f) => [f.slug, f]));
const PREDIO_POR_SLUG = Object.fromEntries(TODOS_PREDIOS.map((p) => [p.slug, p]));

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
  return null;
}
