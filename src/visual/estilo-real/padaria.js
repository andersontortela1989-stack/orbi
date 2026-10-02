import { PALETA3D } from '../../brand/paleta3d.js';
import { PALETA_REAL as C } from './paleta.js';

/**
 * PADARIA no ESTILO REAL (V1.2, legibilidade na V1.2b) — peças em dado puro,
 * a partir das fotos de uma padaria de bairro: sobrado de 2 andares com laje
 * e platibanda, caixa de ar-condicionado, faixa de letreiro escura com painel
 * creme e ícone de pão, marquise escura com friso claro e toldo liso, placa
 * bandeira com ícone de pão, portas de vidro, grade, janelas escuras em cima,
 * vitrine acesa com balcão (os pães vêm da A2.1) e calçada cinza-clara com
 * piso tátil cinza e meio-fio.
 *
 * Nada da padaria real das fotos: nem nome, nem logo, nem mascote, nem
 * telefones — o letreiro diz só "PADARIA". Sem pilar listrado e sem listras.
 *
 * V1.2b: reboco que contrasta com a areia do bairro, letreiro do tamanho das
 * placas do estilo atual, vitrine mais larga e acesa, toldo azul e contorno
 * fino escuro (camada 'contorno': cascas um pouco maiores, desenhadas pelo
 * avesso, como no Building — uma chamada só para todas).
 *
 * Coordenadas do lote: x/z a partir do centro do prédio, y a partir do chão;
 * a frente é +Z (a câmera vê +Z e +X). Cada peça declara a ZONA que o teste de
 * contrato confere (tests/estilo-real.test.js). Camada 'luz' = vidro aceso da
 * vitrine, desenhado à parte com brilho próprio (o Modo Tranquilo reduz).
 */

const CALCADA = 2.2; // por lado (CALCADA_POR_LADO)
const PISO = 0.16; // topo da calçada

// Espessura do contorno fino (o Building usa 0,2; aqui é mais discreto).
export const TRACO_REAL = 0.08;

// Vitrine da esquerda: o dado dos pães da A2.1 (city/identidade.js) lê isto.
export const VITRINE_PADARIA_REAL = Object.freeze({
  centroX: -3.55,
  largura: 4.6,
  topoDoBalcao: PISO + 0.4,
});

// A câmera 2,5D desce ~1,13 de altura por unidade de profundidade (offset
// 34 em y, 30 em z): uma projeção de profundidade d esconde ~1,13·d da parede
// abaixo dela. Por isso a marquise é rasa e o toldo é curto (V1.2b).
const VIDRO_ALTURA = 1.64;

// Faixa do letreiro (V1.2b: mais alta, para caber letra grande).
const FAIXA = Object.freeze({ y: 3.85, altura: 1.4 });
const JANELA_Y = 5.3;
const JANELA_ALTURA = 1.0;

const caixa = (id, zona, pos, tam, cor, extra = {}) => ({ id, zona, forma: 'caixa', pos, tam, cor, ...extra });

/** Casca do contorno: a mesma caixa, TRACO_REAL maior por lado. */
function contorno(peca, zona = peca.zona) {
  const t = 2 * TRACO_REAL;
  return {
    id: `contorno-${peca.id}`,
    zona,
    forma: 'caixa',
    camada: 'contorno',
    pos: peca.pos,
    rot: peca.rot,
    tam: [peca.tam[0] + t, peca.tam[1] + t, peca.tam[2] + t],
    cor: C.contorno,
  };
}

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
  const topo = h + p + 0.06;
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
    // contorno da silhueta inteira (corpo + platibanda): a casca parte do
    // chão (y = 0) e passa um traço acima do topo da platibanda
    contorno(caixa('volume', 'fachada', [0, topo / 2 + TRACO_REAL, 0], [w, topo, l], C.reboco)),
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
    caixa('vitrine-caixilho', 'fachada', [v.centroX, v.topoDoBalcao + VIDRO_ALTURA / 2, f + 0.02], [v.largura + 0.2, VIDRO_ALTURA + 0.2, 0.04], C.caixilho),
    caixa('vitrine-vidro', 'fachada', [v.centroX, v.topoDoBalcao + VIDRO_ALTURA / 2, f + 0.025], [v.largura, VIDRO_ALTURA, 0.05], C.vitrineLuz, { camada: 'luz' }),
    caixa('balcao', 'fachada', [v.centroX, PISO + 0.2, f + 0.14], [v.largura + 0.2, 0.4, 0.28], C.balcao),
    // janela com grade (à direita)
    caixa('janela-terreo', 'fachada', [3.35, PISO + 1.1, f + 0.025], [3.4, 2.2, 0.05], C.vidroEscuro),
    ...gradeX.map((x, i) => caixa(`grade-${i + 1}`, 'fachada', [x, PISO + 1.15, f + 0.08], [0.06, 2.3, 0.06], C.grade)),
    caixa('grade-travessa-baixo', 'fachada', [3.35, PISO + 0.15, f + 0.08], [3.5, 0.06, 0.06], C.grade),
    caixa('grade-travessa-cima', 'fachada', [3.35, PISO + 2.25, f + 0.08], [3.5, 0.06, 0.06], C.grade),
  ];
}

function letreiro(w, l) {
  const f = l / 2;
  const { y, altura } = FAIXA;
  const iconeX = -w / 2 + 1.3;
  const faixa = caixa('faixa-letreiro', 'fachada', [0, y, f + 0.1], [w + 0.1, altura, 0.2], C.faixaEscura);
  return [
    faixa,
    contorno(faixa),
    caixa('painel-letreiro', 'fachada', [w * 0.07, y, f + 0.225], [w * 0.64, altura - 0.25, 0.05], C.painelCreme),
    // ícone de pão (o 🍞 da pergunta de contagem), à esquerda do painel
    caixa('icone-pao-base', 'fachada', [iconeX, y - 0.1, f + 0.225], [1.0, 0.48, 0.05], PALETA3D.pao.lateral),
    {
      id: 'icone-pao-copa', zona: 'fachada', forma: 'cilindro', eixo: 'z', lados: 16,
      pos: [iconeX, y + 0.14, f + 0.225], raio: 0.54, comprimento: 0.05, cor: PALETA3D.pao.casca,
    },
  ];
}

function marquiseEToldo(w, l) {
  const f = l / 2;
  // marquise RASA (0,5): funda, ela escondia a vitrine e o toldo da câmera
  const marquise = caixa('marquise', 'alta', [0, 3.05, f + 0.25], [w + 0.4, 0.25, 0.5], C.faixaEscura);
  // toldo inclinado, liso e curto, logo abaixo e à frente da marquise: a
  // frente mais baixa, sempre acima da altura livre
  const toldo = caixa('toldo', 'alta', [-2.4, 2.8, f + 0.4], [7.2, 0.05, 0.8], C.toldo, { rot: [0.25, 0, 0] });
  return [
    marquise,
    contorno(marquise),
    caixa('friso', 'alta', [0, 3.05, f + 0.52 + TRACO_REAL], [w + 0.42, 0.08, 0.04], C.friso),
    toldo,
    contorno(toldo),
  ];
}

function placaBandeira(w, l) {
  const f = l / 2;
  const x = w / 2 - 0.7;
  const z = f + 0.85;
  const placa = caixa('placa-bandeira', 'alta', [x, 4.75, z], [0.12, 1.5, 1.1], C.faixaEscura);
  return [
    caixa('placa-bandeira-suporte-cima', 'alta', [x, 5.35, f + 0.175], [0.06, 0.06, 0.35], C.grade),
    caixa('placa-bandeira-suporte-baixo', 'alta', [x, 4.15, f + 0.175], [0.06, 0.06, 0.35], C.grade),
    placa,
    contorno(placa),
    // pão na face +X (a que a câmera vê), por fora do contorno
    caixa('placa-bandeira-pao-base', 'alta', [x + 0.06 + TRACO_REAL + 0.02, 4.62, z], [0.04, 0.42, 0.75], PALETA3D.pao.lateral),
    {
      id: 'placa-bandeira-pao-copa', zona: 'alta', forma: 'cilindro', eixo: 'x', lados: 16,
      pos: [x + 0.06 + TRACO_REAL + 0.02, 4.83, z], raio: 0.42, comprimento: 0.04, cor: PALETA3D.pao.casca,
    },
  ];
}

function janelas(w, l) {
  const f = l / 2;
  const s = w / 2;
  const y = JANELA_Y;
  const a = JANELA_ALTURA;
  const frente = [-3, 3].flatMap((x, i) => [
    caixa(`janela-caixilho-${i + 1}`, 'fachada', [x, y, f + 0.02], [2.6, a + 0.2, 0.04], C.caixilho),
    caixa(`janela-${i + 1}`, 'fachada', [x, y, f + 0.03], [2.4, a, 0.06], C.vidroEscuro),
    caixa(`janela-montante-${i + 1}`, 'fachada', [x, y, f + 0.04], [0.06, a, 0.08], C.caixilho),
  ]);
  const lado = [-3, 3].flatMap((z, i) => [
    caixa(`janela-lateral-caixilho-${i + 1}`, 'fachada', [s + 0.02, y, z], [0.04, a + 0.2, 2.6], C.caixilho),
    caixa(`janela-lateral-${i + 1}`, 'fachada', [s + 0.03, y, z], [0.06, a, 2.4], C.vidroEscuro),
    caixa(`janela-lateral-montante-${i + 1}`, 'fachada', [s + 0.04, y, z], [0.08, a, 0.06], C.caixilho),
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

/** Texto do letreiro: escuro, grande (como as placas do estilo atual). */
export function letreiroDaPadaria([w, , l]) {
  return {
    texto: 'PADARIA',
    posicao: [w * 0.07, FAIXA.y, l / 2 + 0.26],
    tamanho: 1.0,
    cor: C.faixaEscura,
  };
}
