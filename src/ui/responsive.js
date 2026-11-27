/**
 * Regras puras de enquadramento responsivo do Órbi.
 *
 * A câmera ortográfica usa pixels por unidade de mundo. Quanto menor o zoom,
 * mais cidade cabe na tela. A função é pura para que resoluções reais possam
 * ser verificadas no node:test, sem Canvas, browser ou Three.js.
 */

export const ZOOM_MAXIMO = 16;
export const ZOOM_MINIMO_DESKTOP = 11;
// Piso de toque (A1.3): era 9 — no celular o carro ficava com ~32 px.
// Com 11, vai a ~39 px (estimativa). Verificação visual no celular em 29/09.
export const ZOOM_MINIMO_TOQUE = 11;

const ALTURA_MUNDO_ALVO = 56;
const LARGURA_MUNDO_DESKTOP = 92;
const LARGURA_MUNDO_TOQUE = 86;

const limitar = (valor, minimo, maximo) =>
  Math.max(minimo, Math.min(maximo, valor));

const dimensaoValida = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

/**
 * Calcula um zoom estável para o tamanho disponível. Usa largura E altura:
 * notebooks baixos deixam de cortar o entorno e celulares estreitos nunca
 * ampliam o mundo além do que cabe. O clamp preserva placas e coletáveis.
 */
export function calcularZoomViewport({ largura, altura, tactil = false } = {}) {
  const w = dimensaoValida(largura);
  const h = dimensaoValida(altura);
  if (!w || !h) return ZOOM_MAXIMO;

  const minimo = tactil ? ZOOM_MINIMO_TOQUE : ZOOM_MINIMO_DESKTOP;
  const larguraAlvo = tactil ? LARGURA_MUNDO_TOQUE : LARGURA_MUNDO_DESKTOP;
  const porLargura = w / larguraAlvo;
  const porAltura = h / ALTURA_MUNDO_ALVO;

  return limitar(Math.min(porLargura, porAltura), minimo, ZOOM_MAXIMO);
}

/**
 * Aparelho de toque? (coarse-pointer OU touch real — espelha o TACTIL do
 * TouchControls.) Mora aqui, fora dos componentes 3D, para a abertura poder
 * usar sem carregar o Three.js no pacote inicial.
 */
export function aparelhoDeToque() {
  if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0)
    return true;
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Aviso de virar o celular (A4.1). `retrato` vem do matchMedia e é null
 * quando o dado não existe — nesse caso NÃO mostra: falta de dado nunca
 * trava a tela. `somenteToque` (abertura) exige aparelho de toque, para o
 * desktop numa janela em pé não receber o aviso; sem ele (jogo), vale o
 * comportamento de antes: retrato mostra em qualquer aparelho.
 */
export function deveMostrarAvisoRetrato({ retrato, tactil, somenteToque = false }) {
  if (retrato !== true) return false;
  return somenteToque ? tactil === true : true;
}
