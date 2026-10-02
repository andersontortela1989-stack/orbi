import { PALETA_REAL as C } from './paleta.js';
import { CALCADA, PISO, caixa, contorno } from './pecas.js';

/**
 * MERCADO no ESTILO REAL (V1.3) — peças em dado puro, pelas 7 regras de
 * legibilidade (docs/PLANO_MESTRE.md): fachada térrea larga em branco-gelo,
 * faixa verde de letreiro com painel claro e texto escuro "MERCADO", toldo
 * azul liso (diferente do verde da PADARIA), 3 portas de enrolar meio
 * abertas e uma BANCA DE FRUTAS na calçada da frente — laranja, maçã, banana
 * e uva, reconhecíveis pela cor e pelo formato, porque se ligam à pergunta
 * das cores na chegada.
 *
 * BANCA (regra própria, aprovada em 02/10): zona 'banca', até
 * PROFUNDIDADE_BANCA para fora da fachada, dentro da calçada, no máximo 1,2 de
 * altura e com COLISOR PRÓPRIO (`colisoresDoMercado`) — o carro não a
 * atravessa. Com 0,3 u (a regra de fachada) as frutas mal apareceriam de cima.
 *
 * Coordenadas do lote: x/z a partir do centro do prédio, y a partir do chão;
 * a frente é +Z e dá para a rua nova (caminho 2, V1.3).
 */

export const PROFUNDIDADE_BANCA = 1.0;

const FAIXA = Object.freeze({ y: 6.4, altura: 1.6 });
const PORTAS_X = [-4.5, 0, 4.5];
const PORTA_LARGURA = 3.4;

// Banca em frente à porta da esquerda.
const BANCA = Object.freeze({ x: -4.5, largura: 3.4, profundidade: 0.84, altura: 0.35 });
const CAIXOTE = Object.freeze({ largura: 0.78, altura: 0.3, profundidade: 0.8 });

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
    // piso tátil entre a banca e o meio-fio
    caixa('piso-tatil', 'chao', [0, PISO + 0.01, l / 2 + 1.55], [w + 2, 0.02, 0.4], C.pisoTatil),
  ];
}

function volume(w, h, l) {
  const e = 0.25;
  const p = 0.5;
  const topo = h + p + 0.06;
  return [
    caixa('corpo', 'corpo', [0, h / 2, 0], [w, h, l], C.brancoGelo),
    caixa('rodape', 'fachada', [0, 0.225, 0], [w + 0.04, 0.45, l + 0.04], C.rodapeCinza),
    caixa('laje', 'telhado', [0, h + 0.02, 0], [w - 2 * e, 0.04, l - 2 * e], C.laje),
    caixa('platibanda-frente', 'telhado', [0, h + p / 2, l / 2 - e / 2], [w, p, e], C.brancoGelo),
    caixa('platibanda-fundo', 'telhado', [0, h + p / 2, -l / 2 + e / 2], [w, p, e], C.brancoGelo),
    caixa('platibanda-esquerda', 'telhado', [-w / 2 + e / 2, h + p / 2, 0], [e, p, l], C.brancoGelo),
    caixa('platibanda-direita', 'telhado', [w / 2 - e / 2, h + p / 2, 0], [e, p, l], C.brancoGelo),
    caixa('pingadeira-frente', 'fachada', [0, h + p + 0.03, l / 2 - e / 2], [w + 0.1, 0.06, e + 0.1], C.pingadeira),
    caixa('pingadeira-direita', 'fachada', [w / 2 - e / 2, h + p + 0.03, 0], [e + 0.1, 0.06, l + 0.1], C.pingadeira),
    caixa('ar-condicionado', 'telhado', [3, h + 0.04 + 0.45, -2], [1.8, 0.9, 1.1], C.ar),
    contorno(caixa('volume', 'fachada', [0, topo / 2 + 0.08, 0], [w, topo, l], C.brancoGelo)),
  ];
}

function letreiro(w, l) {
  const f = l / 2;
  const { y, altura } = FAIXA;
  const iconeX = -w / 2 + 1.1;
  const faixa = caixa('faixa-letreiro', 'fachada', [0, y, f + 0.1], [w + 0.1, altura, 0.2], C.verdeMercado);
  return [
    faixa,
    contorno(faixa),
    caixa('painel-letreiro', 'fachada', [0.3, y, f + 0.225], [w * 0.7, altura - 0.35, 0.05], C.painelClaro),
    // ícone de laranja com folha, à esquerda do painel
    {
      id: 'icone-laranja', zona: 'fachada', forma: 'cilindro', eixo: 'z', lados: 16,
      pos: [iconeX, y - 0.08, f + 0.225], raio: 0.45, comprimento: 0.05, cor: C.laranja,
    },
    caixa('icone-folha', 'fachada', [iconeX + 0.15, y + 0.45, f + 0.225], [0.3, 0.14, 0.05], C.folha),
  ];
}

function portas(l) {
  const f = l / 2;
  return PORTAS_X.flatMap((x, i) => {
    const n = i + 1;
    return [
      caixa(`porta-caixilho-${n}`, 'fachada', [x, PISO + 1.75, f + 0.015], [PORTA_LARGURA + 0.2, 3.5, 0.03], C.caixilho),
      // meio aberta: o vão escuro embaixo e a porta de enrolar descida até a metade
      caixa(`porta-aberta-${n}`, 'fachada', [x, PISO + 0.9, f + 0.02], [PORTA_LARGURA, 1.8, 0.04], C.portaAberta),
      caixa(`porta-enrolar-${n}`, 'fachada', [x, PISO + 2.6, f + 0.04], [PORTA_LARGURA, 1.6, 0.06], C.portaEnrolar),
      ...[2.2, 2.6, 3.0].map((y, k) =>
        caixa(`porta-nervura-${n}-${k + 1}`, 'fachada', [x, y, f + 0.05], [PORTA_LARGURA, 0.05, 0.08], C.nervura)
      ),
    ];
  });
}

function toldo(w, l) {
  const f = l / 2;
  // liso e curto (regra 5), acima das portas; a frente mais baixa
  const peca = caixa('toldo', 'alta', [0, 4.3, f + 0.4], [w * 0.9, 0.05, 0.8], C.toldoAzul, { rot: [0.25, 0, 0] });
  return [peca, contorno(peca)];
}

function lateral(w) {
  const s = w / 2;
  return [-3, 3].flatMap((z, i) => [
    caixa(`janela-lateral-caixilho-${i + 1}`, 'fachada', [s + 0.02, 5.0, z], [0.04, 1.4, 2.8], C.caixilho),
    caixa(`janela-lateral-${i + 1}`, 'fachada', [s + 0.03, 5.0, z], [0.06, 1.2, 2.6], C.vidroEscuro),
  ]);
}

/** Banca de frutas: base, 4 caixotes e as frutas (zona 'banca'). */
function banca(l) {
  const f = l / 2;
  const zc = f + BANCA.profundidade / 2;
  const topoBase = PISO + BANCA.altura;
  const topoCaixote = topoBase + CAIXOTE.altura;
  const base = caixa('banca-base', 'banca', [BANCA.x, PISO + BANCA.altura / 2, zc], [BANCA.largura, BANCA.altura, BANCA.profundidade], C.bancaBase);
  const caixotesX = [-1.24, -0.41, 0.41, 1.24].map((dx) => BANCA.x + dx);
  const pecas = [
    base,
    contorno(base),
    ...caixotesX.map((x, i) =>
      caixa(`caixote-${i + 1}`, 'banca', [x, topoBase + CAIXOTE.altura / 2, zc], [CAIXOTE.largura, CAIXOTE.altura, CAIXOTE.profundidade], C.caixote)
    ),
  ];
  const grade = (cx) => [-0.22, 0, 0.22].flatMap((dx) => [-0.18, 0.18].map((dz) => [cx + dx, zc + dz]));
  const esfera = (id, [x, z], y, raio, cor) => ({ id, zona: 'banca', forma: 'esfera', lados: 6, aneis: 4, pos: [x, y, z], raio, cor });

  // laranja e maçã: bolas grandes, 6 por caixote
  grade(caixotesX[0]).forEach((p, i) => pecas.push(esfera(`fruta-laranja-${i + 1}`, p, topoCaixote + 0.15, 0.17, C.laranja)));
  grade(caixotesX[1]).forEach((p, i) => pecas.push(esfera(`fruta-maca-${i + 1}`, p, topoCaixote + 0.14, 0.16, C.maca)));
  // banana: compridas, deitadas lado a lado
  [-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].forEach((dz, i) =>
    pecas.push({
      id: `fruta-banana-${i + 1}`, zona: 'banca', forma: 'cilindro', eixo: 'x', lados: 6,
      pos: [caixotesX[2], topoCaixote + 0.065, zc + dz], raio: 0.065, comprimento: 0.55, cor: C.banana,
    })
  );
  // uva: 2 cachos de bolinhas pequenas (3 + 2 + 1)
  const cacho = [[-0.14, 0.07], [0, 0.07], [0.14, 0.07], [-0.07, 0.19], [0.07, 0.19], [0, 0.31]];
  [-0.2, 0.2].forEach((dz, c) =>
    cacho.forEach(([dx, dy], i) =>
      pecas.push(esfera(`fruta-uva-${c + 1}-${i + 1}`, [caixotesX[3] + dx, zc + dz], topoCaixote + dy, 0.07, C.uva))
    )
  );
  return pecas;
}

/** Todas as peças do MERCADO real para o tamanho do lote [w, h, l]. */
export function pecasDoMercado([w, h, l]) {
  return [
    ...calcada(w, l),
    ...volume(w, h, l),
    ...letreiro(w, l),
    ...portas(l),
    ...toldo(w, l),
    ...lateral(w),
    ...banca(l),
  ];
}

/** Texto do letreiro: escuro sobre o painel claro (fonte 1,1). */
export function letreiroDoMercado([, , l]) {
  return {
    texto: 'MERCADO',
    posicao: [0.3, FAIXA.y, l / 2 + 0.26],
    tamanho: 1.1,
    cor: C.faixaEscura,
  };
}

/**
 * Colisor PRÓPRIO da banca (coordenadas do lote): cobre base, caixotes,
 * frutas e o contorno, do chão até 1,2 — o carro encosta e não atravessa.
 */
export function colisoresDoMercado([, , l]) {
  const f = l / 2;
  return [{
    posicao: [BANCA.x, 0.6, f + BANCA.profundidade / 2],
    meiaExtensao: [BANCA.largura / 2 + 0.1, 0.6, BANCA.profundidade / 2 + 0.08],
  }];
}
