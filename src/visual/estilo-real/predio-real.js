import { montarMalha, limitesDe } from '../geometria-mesclada.js';
import { orcamentoDoLugar } from '../pao-3d.js';
import { pecasDaPadaria, letreiroDaPadaria } from './padaria.js';

/**
 * PRÉDIOS DO ESTILO REAL (fatia V1) — o que muda é só o desenho.
 *
 * Pegada, posição e colisor saem do MESMO bairros.js que o Building usa
 * (`colisorDoLote`), então folgas, sensores, roteiro e física valem igual nos
 * dois estilos. Hoje: só a PADARIA (V1.2); MERCADO e rua vêm na V1.3.
 */

// Projeções altas (toldo, marquise, placa bandeira) só acima disto: o carro,
// com cabine e enfeite, chega a ~1,7. Uns 3 m no mundo real.
export const ALTURA_LIVRE = 2.4;

export const PREDIOS_REAIS = Object.freeze({
  PADARIA: Object.freeze({ pecas: pecasDaPadaria, letreiro: letreiroDaPadaria }),
});

/** Colisor do lote: idêntico ao do Building (centro a h/2, meia-extensão). */
export function colisorDoLote({ pos: [x, z], size: [w, h, l] }) {
  return { posicao: [x, h / 2, z], meiaExtensao: [w / 2, h / 2, l / 2] };
}

export const limitesDaPeca = limitesDe;

/** Malha opaca (cor por vértice) e malha da luz da vitrine, já mescladas. */
export function malhasDoPredio(slug, size) {
  const pecas = PREDIOS_REAIS[slug].pecas(size);
  return {
    opaco: montarMalha(pecas.filter((p) => p.camada !== 'luz')),
    luz: montarMalha(pecas.filter((p) => p.camada === 'luz')),
  };
}

/**
 * Chamadas de desenho e triângulos de um prédio real: malha opaca, luz da
 * vitrine, letreiro (o troika desenha cada letra como um quadrado: 2
 * triângulos) e os pães sem contorno.
 */
export function orcamentoPredioReal(slug, size) {
  const { opaco, luz } = malhasDoPredio(slug, size);
  const letras = PREDIOS_REAIS[slug].letreiro(size).texto.replace(/\s/g, '').length;
  const paes = orcamentoDoLugar(slug, size, 'real');
  return {
    chamadas: (opaco.triangulos > 0) + (luz.triangulos > 0) + 1 + paes.chamadas,
    triangulos: opaco.triangulos + luz.triangulos + letras * 2 + paes.triangulos,
  };
}
