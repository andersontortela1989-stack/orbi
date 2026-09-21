import { HORTA_BANDS } from './horta.js';

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

// Números por extenso: o Heitor lê palavra inteira (leitura global), e o TTS
// pronuncia "três" melhor do que "3" no meio da frase.
const FEMININO = { 1: 'uma', 2: 'duas', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis' };
const MASCULINO = { 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis' };

const porExtenso = (n, tabela) => tabela[n] ?? String(n);

/**
 * Monta a aventura da faixa pedida.
 *
 * Devolve `null` — nunca lança — quando a faixa não existe ou quando as
 * sementes não dividem certo entre os canteiros. Uma divisão quebrada faria a
 * etapa `distribuir` jamais fechar, e travar a criança no meio é pior que não
 * começar.
 *
 * @param {'3-5'|'6-7'|'8-10'} band
 */
export function criarHortaEscola(band) {
  const cfg = HORTA_BANDS[band];
  if (!cfg) return null;

  const { total, beds, label, task } = cfg;
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
      },
      {
        id: 'ir-ao-mercado',
        tipo: 'ir_para',
        lugar: 'MERCADO',
        texto: 'Vamos ao mercado pegar as sementes.',
        dica: 'O mercado é onde a gente compra comida.',
        destacarApos: 45,
      },
      {
        id: 'pegar-sementes',
        tipo: 'coletar',
        item: 'semente',
        quantidade: total,
        // A instrução por faixa já existia em HORTA_BANDS.task — é o texto
        // que o conteúdo original usava exatamente aqui. Reaproveitado.
        texto: task,
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
        texto: `Reparta as sementes nos canteiros: ${porExtenso(porCanteiro, FEMININO)} em cada um.`,
        dica: `São ${porExtenso(beds, MASCULINO)} canteiros, e todos recebem a mesma quantidade.`,
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
        itens: ['broto-da-escola'],
        descobertas: [
          { categoria: 'objetos', id: 'semente' },
          { categoria: 'lugares', id: 'MERCADO' },
          { categoria: 'lugares', id: 'ESCOLA' },
          { categoria: 'contagens', id: String(total) },
        ],
      },
      {
        id: 'fecho',
        tipo: 'resumo',
        fala: 'A professora Lia agradeceu! Olha os brotinhos no pátio da escola!',
        aprendizados: [
          `Você contou até ${porExtenso(total, MASCULINO)}`,
          `Você repartiu as sementes em ${porExtenso(beds, MASCULINO)} canteiros`,
          'Você encontrou o mercado e a escola',
        ],
        recompensas: ['ADESIVO: BROTO DA ESCOLA'],
      },
    ],
  });
}
