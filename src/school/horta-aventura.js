import { HORTA_BANDS } from './horta.js';
import { FEMININO, MASCULINO, porExtenso } from '../missions/por-extenso.js';

/**
 * A HORTA DA ESCOLA — a mesma horta do golden-rebuild, redita como `etapas[]`
 * na língua do `adventure-engine` desta branch.
 *
 * `horta.js` guarda o modelo ANTIGO (máquina de estados com `hortaAction`) e
 * fica INTOCADO. Os dois descrevem o mesmo conteúdo, mas só este aqui fala com
 * o motor. Moram separados de propósito: no dia em que nada mais chamar
 * `hortaAction`, aquele arquivo some inteiro, sem cirurgia neste.
 *
 * Nenhum número de faixa está escrito aqui — tudo vem de HORTA_BANDS.
 */

// Números por extenso (missions/por-extenso.js): o Heitor lê palavra inteira
// (leitura global), e o TTS pronuncia "três" melhor do que "3" no meio da frase.

/** O adesivo da Horta; tê-lo nas recompensas marca a Horta como repetida. */
export const RECOMPENSA_HORTA = 'broto-da-escola';

const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** "uma semente" / "duas sementes" — singular e plural certos. */
const sementes = (n) => `${porExtenso(n, FEMININO)} semente${n === 1 ? '' : 's'}`;

/**
 * H3 (a): "quantas sementes precisamos levar?" — só nas faixas com
 * `perguntarTotal` (hoje, a 6–7). Três cartas em ordem crescente, com o
 * desenho da quantidade; a janela é sorteada entre {total−2…total},
 * {total−1…total+1} e {total…total+2}, para a certa não ficar sempre no
 * meio. A dica ajuda a pensar sem dizer o total; a revelação segue a regra
 * do motor.
 */
function perguntaDoTotal(total, beds, porCanteiro, random) {
  const cada = porExtenso(porCanteiro, FEMININO);
  const inicio = Math.max(1, total - 2 + Math.min(2, Math.floor(random() * 3)));
  return {
    id: 'quantas-sementes',
    tipo: 'pergunta',
    texto:
      `${maiuscula(porExtenso(beds, MASCULINO))} canteiros vão receber ${cada} sementes cada. ` +
      'Quantas sementes precisamos levar?',
    opcoes: [inicio, inicio + 1, inicio + 2].map((n) => ({
      id: String(n),
      rotulo: String(n),
      emoji: '🌰'.repeat(n),
      ...(n === total ? { correta: true } : {}),
    })),
    reforco: `Vamos contar de novo? ${maiuscula(Array(beds).fill(cada).join(' e mais '))}.`,
    dica:
      beds === 2
        ? `Conte ${sementes(porCanteiro)} para um canteiro e ${cada} para o outro.`
        : `Conte ${sementes(porCanteiro)} para cada um dos ${porExtenso(beds, MASCULINO)} canteiros.`,
    // A resposta, dita só ao revelar (3º erro). A pista acima não a diz.
    revelacao:
      `${maiuscula(sementes(porCanteiro))} em cada canteiro. ` +
      `${maiuscula(Array(beds).fill(cada).join(' mais '))} são ${porExtenso(total, FEMININO)}.`,
  };
}

/**
 * Monta a aventura da faixa pedida.
 *
 * Devolve `null` — nunca lança — quando a faixa não existe ou quando as
 * sementes não dividem certo entre os canteiros. Uma divisão quebrada faria a
 * etapa `distribuir` jamais fechar, e travar a criança no meio é pior que não
 * começar.
 *
 * `repetida` (H3): a criança já tem o broto. O resumo celebra a ação e não
 * anuncia o adesivo de novo (dívida 37).
 *
 * `random` sorteia a janela das cartas da pergunta (testes passam um fixo).
 *
 * @param {'3-5'|'6-7'|'8-10'} band
 * @param {{ repetida?: boolean, random?: () => number }} [opcoes]
 */
export function criarHortaEscola(band, { repetida = false, random = Math.random } = {}) {
  const cfg = HORTA_BANDS[band];
  if (!cfg) return null;

  const { total, beds, label, perguntarTotal } = cfg;
  const porCanteiro = total / beds;
  if (!Number.isInteger(porCanteiro) || porCanteiro < 1) return null;

  return Object.freeze({
    id: `horta-escola-${band}`,
    titulo: 'A HORTA DA ESCOLA',
    bairro: 'ESCOLA',
    faixa: band,
    faixaLabel: label,
    duracao: 10,
    etapas: [
      {
        id: 'convite',
        tipo: 'fala',
        texto:
          'A professora Lia quer uma horta no pátio da escola. ' +
          'Vamos buscar as sementes no mercado?',
        espera: 'toque',
        botao: 'VAMOS!',
        // H1: o convite chega sem a criança pedir (na ESCOLA do roteiro) —
        // por isso pode ser recusado, sem perder nada.
        botaoSecundario: 'AGORA NÃO',
      },
      {
        id: 'ir-ao-mercado',
        tipo: 'ir_para',
        lugar: 'MERCADO',
        texto: 'Vamos ao mercado pegar as sementes.',
        dica: 'O mercado é onde a gente compra comida.',
        destacarApos: 45,
      },
      ...(perguntarTotal ? [perguntaDoTotal(total, beds, porCanteiro, random)] : []),
      {
        id: 'pegar-sementes',
        tipo: 'coletar',
        item: 'semente',
        quantidade: total,
        // H1: os saquinhos são coletados DIRIGINDO, como os baldes do parque
        // (ItensAventura). H3 (j): cada saquinho carrega UMA semente — a
        // coleta conta saquinhos, o plantio conta sementes, e os dois batem.
        texto: `Pegue ${porExtenso(total, MASCULINO)} saquinhos. Cada um tem uma semente.`,
        dica: `Vamos contar juntos até ${porExtenso(total, MASCULINO)}.`,
      },
      {
        id: 'voltar-a-escola',
        tipo: 'entregar',
        lugar: 'ESCOLA',
        texto: 'Agora leve as sementes até a escola.',
        dica: 'A escola é o prédio da placa ESCOLA, no centro da cidade.',
      },
      {
        // O coração pedagógico: repartir, não contar. Por isso `distribuir`
        // e não um segundo `coletar` — ver a nota no adventure-engine.
        id: 'plantar',
        tipo: 'distribuir',
        item: 'semente',
        slots: beds,
        porSlot: porCanteiro,
        texto: `Plante ${sementes(porCanteiro)} em cada canteiro.`,
        dica: `São ${porExtenso(beds, MASCULINO)} canteiros, e todos recebem a mesma quantidade.`,
        // A voz conta o total plantado ("um, dois, três…"); com mais de uma
        // por canteiro, o toque que enche um canteiro diz também quantas ele
        // tem — a mesma quantidade em todos é o que se reparte aqui.
        ...(porCanteiro > 1 ? { aoEncher: `Este canteiro tem ${porExtenso(porCanteiro, FEMININO)}.` } : {}),
      },
      {
        id: 'regar',
        tipo: 'distribuir',
        item: 'agua',
        slots: beds,
        porSlot: 1,
        texto: 'Agora regue os canteiros, um de cada vez.',
        dica: 'Ainda falta água em algum canteiro. Toque nele.',
      },
      { id: 'horta-viva', tipo: 'mundo', flag: 'horta_escola_viva' },
      {
        id: 'premio',
        tipo: 'recompensa',
        itens: [RECOMPENSA_HORTA],
        descobertas: [
          { categoria: 'objetos', id: 'semente' },
          { categoria: 'objetos', id: 'broto-da-escola' },
          { categoria: 'lugares', id: 'MERCADO' },
          { categoria: 'lugares', id: 'ESCOLA' },
          { categoria: 'contagens', id: String(total) },
        ],
      },
      {
        id: 'fecho',
        tipo: 'resumo',
        // H3 (g): o resumo descreve a ação que o jogo observou, não a
        // habilidade que supõe. Os brotos só nascem quando o resumo fecha
        // (H2), por isso a fala convida a olhar, em vez de dizer "olha".
        fala: repetida
          ? 'Você cuidou da horta de novo! A professora Lia agradeceu.'
          : 'A professora Lia agradeceu! Vamos ver os brotinhos nascendo?',
        aprendizados: [
          `Você buscou ${porExtenso(total, MASCULINO)} saquinhos de semente.`,
          `Você colocou ${sementes(porCanteiro)} em cada canteiro.`,
          'Você foi ao mercado e voltou à escola.',
        ],
        recompensas: repetida ? [] : ['ADESIVO: BROTO DA ESCOLA'],
      },
    ],
  });
}
