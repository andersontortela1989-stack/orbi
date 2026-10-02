import { PALETA3D } from '../../brand/paleta3d.js';
import { PALETA_REAL as C } from './paleta.js';

/**
 * PADARIA no ESTILO REAL (V1.2) — peças em dado puro, a partir das fotos de
 * uma padaria de bairro: sobrado de 2 andares com reboco areia e laje com
 * platibanda, caixa de ar-condicionado, faixa de letreiro escura com painel
 * creme e ícone de pão, marquise escura com friso claro e toldo claro, placa
 * bandeira com ícone de pão, portas de vidro, grade, janelas escuras em cima,
 * vitrine com balcão (os pães vêm da A2.1) e calçada caramelo com piso tátil
 * cinza e meio-fio.
 *
 * Nada da padaria real das fotos: nem nome, nem logo, nem mascote, nem
 * telefones — o letreiro diz só "PADARIA". Sem pilar listrado (contraste alto
 * cansa) e sem contorno de adesivo.
 *
 * Coordenadas do lote: x/z a partir do centro do prédio, y a partir do chão;
 * a frente é +Z (a câmera vê +Z e +X). Cada peça declara a ZONA que o teste de
 * contrato confere (tests/estilo-real.test.js). Camada 'luz' = vidro aceso da
 * vitrine, desenhado à parte com brilho próprio (o Modo Tranquilo reduz).
 */

const CALCADA = 2.2; // por lado (CALCADA_POR_LADO)
const PISO = 0.16; // topo da calçada

// Vitrine da esquerda: o dado dos pães da A2.1 (city/identidade.js) lê isto.
export const VITRINE_PADARIA_REAL = Object.freeze({
  centroX: -3.35,
  largura: 3.4,
  topoDoBalcao: PISO + 0.75,
});

const caixa = (id, zona, pos, tam, cor, extra = {}) => ({ id, zona, forma: 'caixa', pos, tam, cor, ...extra });

function calcada(w, l) {
  const fx = w / 2 + CALCADA;
  const fz = l / 2 + CALCADA;
  const mf = 0.25;
  return [
    caixa('calcada', 'chao', [0, PISO / 2, 0], [w + 2 * CALCADA, PISO, l + 2 * CALCADA], C.calcada),
    caixa('meio-fio-frente', 'chao', [0, 0.11, fz - mf / 2], [w + 2 * CALCADA, 0.22, mf], C.meioFio),
    caixa('meio-fio-fundo', 'chao', [0, 0.11, -fz + mf / 2], [w + 2 * CALCADA, 0.22, mf], C.meioFio),
    caixa('meio-fio-esquerda', 'chao', [-fx + mf / 2, 0.11, 0], [mf, 0.22, l + 2 * CALCADA], C.meioFio),
    caixa('meio-fio-direita', 'chao', [fx - mf / 2, 0.11, 0], [mf, 0.22, l + 2 * CALCADA], C.meioFio),
    caixa('piso-tatil', 'chao', [0, PISO + 0.01, l / 2 + 1.2], [w + 2, 0.02, 0.5], C.pisoTatil),
  ];
}

function volume(w, h, l) {
  const e = 0.25; // espessura da platibanda
  const p = 0.6; // altura da platibanda
  return [
    caixa('corpo', 'corpo', [0, h / 2, 0], [w, h, l], C.reboco),
    caixa('rodape', 'fachada', [0, 0.225, 0], [w + 0.04, 0.45, l + 0.04], C.rebocoSombra),
    caixa('laje', 'telhado', [0, h + 0.02, 0], [w - 2 * e, 0.04, l - 2 * e], C.laje),
    caixa('platibanda-frente', 'telhado', [0, h + p / 2, l / 2 - e / 2], [w, p, e], C.reboco),
    caixa('platibanda-fundo', 'telhado', [0, h + p / 2, -l / 2 + e / 2], [w, p, e], C.reboco),
    caixa('platibanda-esquerda', 'telhado', [-w / 2 + e / 2, h + p / 2, 0], [e, p, l], C.reboco),
    caixa('platibanda-direita', 'telhado', [w / 2 - e / 2, h + p / 2, 0], [e, p, l], C.reboco),
    caixa('pingadeira-frente', 'fachada', [0, h + p + 0.03, l / 2 - e / 2], [w + 0.1, 0.06, e + 0.1], C.pingadeira),
    caixa('pingadeira-fundo', 'fachada', [0, h + p + 0.03, -l / 2 + e / 2], [w + 0.1, 0.06, e + 0.1], C.pingadeira),
    caixa('pingadeira-esquerda', 'fachada', [-w / 2 + e / 2, h + p + 0.03, 0], [e + 0.1, 0.06, l + 0.1], C.pingadeira),
    caixa('pingadeira-direita', 'fachada', [w / 2 - e / 2, h + p + 0.03, 0], [e + 0.1, 0.06, l + 0.1], C.pingadeira),
    caixa('ar-condicionado', 'telhado', [-2.5, h + 0.04 + 0.45, -1.5], [1.6, 0.9, 1.0], C.ar),
    caixa('ar-condicionado-grade', 'telhado', [-2.5, h + 0.04 + 0.45, -1.5 + 0.515], [1.2, 0.6, 0.03], C.arGrade),
  ];
}

function terreo(w, l) {
  const f = l / 2;
  const v = VITRINE_PADARIA_REAL;
  const gradeX = Array.from({ length: 9 }, (_, i) => 1.75 + i * 0.4);
  return [
    // porta de vidro no meio
    caixa('porta-caixilho', 'fachada', [0, PISO + 1.275, f + 0.02], [2.2, 2.55, 0.04], C.caixilho),
    caixa('porta-vidro', 'fachada', [0, PISO + 1.2, f + 0.03], [2.0, 2.4, 0.06], C.vidroPorta),
    // vitrine com balcão (à esquerda): o vidro aceso é a camada 'luz'
    caixa('vitrine-caixilho', 'fachada', [v.centroX, v.topoDoBalcao + 0.775, f + 0.02], [v.largura + 0.2, 1.75, 0.04], C.caixilho),
    caixa('vitrine-vidro', 'fachada', [v.centroX, v.topoDoBalcao + 0.775, f + 0.025], [v.largura, 1.55, 0.05], C.vitrineLuz, { camada: 'luz' }),
    caixa('balcao', 'fachada', [v.centroX, PISO + 0.375, f + 0.14], [v.largura + 0.4, 0.75, 0.28], C.balcao),
    // janela com grade (à direita)
    caixa('janela-terreo', 'fachada', [3.35, PISO + 1.1, f + 0.025], [3.4, 2.2, 0.05], C.vidroEscuro),
    ...gradeX.map((x, i) => caixa(`grade-${i + 1}`, 'fachada', [x, PISO + 1.15, f + 0.08], [0.06, 2.3, 0.06], C.grade)),
    caixa('grade-travessa-baixo', 'fachada', [3.35, PISO + 0.15, f + 0.08], [3.5, 0.06, 0.06], C.grade),
    caixa('grade-travessa-cima', 'fachada', [3.35, PISO + 2.25, f + 0.08], [3.5, 0.06, 0.06], C.grade),
  ];
}

function letreiro(w, l) {
  const f = l / 2;
  const y = 3.65;
  const iconeX = -w / 2 + 1.4;
  return [
    caixa('faixa-letreiro', 'fachada', [0, y, f + 0.1], [w + 0.1, 1.1, 0.2], C.faixaEscura),
    caixa('painel-letreiro', 'fachada', [w * 0.08, y, f + 0.225], [w * 0.6, 0.78, 0.05], C.painelCreme),
    // ícone de pão (o 🍞 da pergunta de contagem), à esquerda do painel
    caixa('icone-pao-base', 'fachada', [iconeX, y - 0.06, f + 0.225], [0.8, 0.38, 0.05], PALETA3D.pao.lateral),
    {
      id: 'icone-pao-copa', zona: 'fachada', forma: 'cilindro', eixo: 'z', lados: 16,
      pos: [iconeX, y + 0.13, f + 0.225], raio: 0.44, comprimento: 0.05, cor: PALETA3D.pao.casca,
    },
  ];
}

function marquiseEToldo(w, l) {
  const f = l / 2;
  return [
    caixa('marquise', 'alta', [0, 2.95, f + 0.75], [w + 0.4, 0.25, 1.5], C.faixaEscura),
    caixa('friso', 'alta', [0, 2.95, f + 1.52], [w + 0.42, 0.08, 0.04], C.friso),
    // toldo inclinado: a frente mais baixa, sempre acima da altura livre
    caixa('toldo', 'alta', [-1.2, 2.68, f + 0.55], [w * 0.55, 0.05, 1.05], C.toldo, { rot: [0.2, 0, 0] }),
  ];
}

function placaBandeira(w, l) {
  const f = l / 2;
  const x = w / 2 - 0.7;
  const z = f + 0.85;
  return [
    caixa('placa-bandeira-suporte-cima', 'alta', [x, 5.35, f + 0.175], [0.06, 0.06, 0.35], C.grade),
    caixa('placa-bandeira-suporte-baixo', 'alta', [x, 4.15, f + 0.175], [0.06, 0.06, 0.35], C.grade),
    caixa('placa-bandeira', 'alta', [x, 4.75, z], [0.12, 1.5, 1.1], C.faixaEscura),
    // pão na face +X (a que a câmera vê)
    caixa('placa-bandeira-pao-base', 'alta', [x + 0.08, 4.62, z], [0.04, 0.42, 0.75], PALETA3D.pao.lateral),
    {
      id: 'placa-bandeira-pao-copa', zona: 'alta', forma: 'cilindro', eixo: 'x', lados: 16,
      pos: [x + 0.08, 4.83, z], raio: 0.42, comprimento: 0.04, cor: PALETA3D.pao.casca,
    },
  ];
}

function janelas(w, l) {
  const f = l / 2;
  const s = w / 2;
  const frente = [-3, 3].flatMap((x, i) => [
    caixa(`janela-caixilho-${i + 1}`, 'fachada', [x, 5.0, f + 0.02], [2.6, 1.7, 0.04], C.caixilho),
    caixa(`janela-${i + 1}`, 'fachada', [x, 5.0, f + 0.03], [2.4, 1.5, 0.06], C.vidroEscuro),
    caixa(`janela-montante-${i + 1}`, 'fachada', [x, 5.0, f + 0.04], [0.06, 1.5, 0.08], C.caixilho),
  ]);
  const lado = [-3, 3].flatMap((z, i) => [
    caixa(`janela-lateral-caixilho-${i + 1}`, 'fachada', [s + 0.02, 5.0, z], [0.04, 1.7, 2.6], C.caixilho),
    caixa(`janela-lateral-${i + 1}`, 'fachada', [s + 0.03, 5.0, z], [0.06, 1.5, 2.4], C.vidroEscuro),
    caixa(`janela-lateral-montante-${i + 1}`, 'fachada', [s + 0.04, 5.0, z], [0.08, 1.5, 0.06], C.caixilho),
  ]);
  const portao = caixa('portao-lateral', 'fachada', [s + 0.03, PISO + 1.2, -2.5], [0.06, 2.4, 3.2], C.grade);
  return [...frente, ...lado, portao];
}

/** Todas as peças da PADARIA real para o tamanho do lote [w, h, l]. */
export function pecasDaPadaria([w, h, l]) {
  return [
    ...calcada(w, l),
    ...volume(w, h, l),
    ...terreo(w, l),
    ...letreiro(w, l),
    ...marquiseEToldo(w, l),
    ...placaBandeira(w, l),
    ...janelas(w, l),
  ];
}

/** Texto do letreiro, sobre o painel creme. */
export function letreiroDaPadaria([w, , l]) {
  return {
    texto: 'PADARIA',
    posicao: [w * 0.08, 3.65, l / 2 + 0.26],
    tamanho: 0.6,
    cor: C.faixaEscura,
  };
}
