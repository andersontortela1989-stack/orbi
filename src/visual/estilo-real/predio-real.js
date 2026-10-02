import { montarMalha, limitesDe } from '../geometria-mesclada.js';
import { orcamentoDoLugar } from '../pao-3d.js';
import { pecasDaPadaria, letreiroDaPadaria } from './padaria.js';
import { colisoresDoMercado, letreiroDoMercado, pecasDoMercado } from './mercado.js';

/**
 * PRÉDIOS DO ESTILO REAL (fatia V1) — o que muda é só o desenho.
 *
 * Pegada, posição e colisor saem do MESMO bairros.js que o Building usa
 * (`colisorDoLote`), então folgas, sensores, roteiro e física valem igual nos
 * dois estilos. PADARIA (V1.2) e MERCADO (V1.3); a rua real fica em rua.js.
 */

// Projeções altas (toldo, marquise, placa bandeira) só acima disto: o carro,
// com cabine e enfeite, chega a ~1,7. Uns 3 m no mundo real.
export const ALTURA_LIVRE = 2.4;

// `colisores`: colisores PRÓPRIOS além do prédio (coordenadas do lote) — hoje
// só a banca de frutas do MERCADO (regra própria da V1.3).
export const PREDIOS_REAIS = Object.freeze({
  PADARIA: Object.freeze({ pecas: pecasDaPadaria, letreiro: letreiroDaPadaria, colisores: () => [] }),
  MERCADO: Object.freeze({ pecas: pecasDoMercado, letreiro: letreiroDoMercado, colisores: colisoresDoMercado }),
});

/** Colisor do lote: idêntico ao do Building (centro a h/2, meia-extensão). */
export function colisorDoLote({ pos: [x, z], size: [w, h, l] }) {
  return { posicao: [x, h / 2, z], meiaExtensao: [w / 2, h / 2, l / 2] };
}

export const limitesDaPeca = limitesDe;

/**
 * Malhas já mescladas: opaca (cor por vértice), luz da vitrine e contorno
 * (cascas desenhadas pelo avesso, V1.2b).
 */
export function malhasDoPredio(slug, size) {
  const pecas = PREDIOS_REAIS[slug].pecas(size);
  const camada = (p) => p.camada ?? 'opaco';
  return {
    opaco: montarMalha(pecas.filter((p) => camada(p) === 'opaco')),
    luz: montarMalha(pecas.filter((p) => camada(p) === 'luz')),
    contorno: montarMalha(pecas.filter((p) => camada(p) === 'contorno')),
  };
}

/**
 * Chamadas de desenho e triângulos de um prédio real: malha opaca, luz da
 * vitrine, contorno, letreiro (o troika desenha cada letra como um quadrado:
 * 2 triângulos) e os pães sem contorno.
 */
export function orcamentoPredioReal(slug, size) {
  const { opaco, luz, contorno } = malhasDoPredio(slug, size);
  const letras = PREDIOS_REAIS[slug].letreiro(size).texto.replace(/\s/g, '').length;
  const paes = orcamentoDoLugar(slug, size, 'real');
  const malhas = [opaco, luz, contorno];
  return {
    chamadas: malhas.filter((m) => m.triangulos > 0).length + 1 + paes.chamadas,
    triangulos: malhas.reduce((s, m) => s + m.triangulos, 0) + letras * 2 + paes.triangulos,
  };
}
