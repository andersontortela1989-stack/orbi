/**
 * Regras puras de enquadramento responsivo do Órbi.
 *
 * A câmera ortográfica usa pixels por unidade de mundo. Quanto menor o zoom,
 * mais cidade cabe na tela. A função é pura para que resoluções reais possam
 * ser verificadas no node:test, sem Canvas, browser ou Three.js.
 */

export const ZOOM_MAXIMO = 16;
export const ZOOM_MINIMO_DESKTOP = 11;
export const ZOOM_MINIMO_TOQUE = 9;

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
