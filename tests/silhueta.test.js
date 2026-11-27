import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CORES_CARRO, tintaDoCarro } from '../src/city/garagem.js';
import {
  ALTURA_MINIMA_SILHUETA,
  ORDEM_CARRO,
  ORDEM_SILHUETA,
  caixasDaSilhueta,
  criarMateriaisSilhueta,
  orcamentoSilhueta,
} from '../src/visual/silhueta.js';

/**
 * S1 — SILHUETA DO CARRO atrás de obstáculos. Uma versão simplificada do
 * carro é desenhada com o teste de profundidade INVERTIDO (só passa onde a
 * cena está na frente) DEPOIS do mundo e ANTES do carro de verdade; o carro,
 * desenhado por último, cobre a silhueta onde ele mesmo aparece.
 */

const CARRO = { largura: 1.8, altura: 0.8, comprimento: 3.5 };

test('materiais: teste de profundidade invertido, sem escrever profundidade, sólidos', () => {
  const { preenchimento, contorno } = criarMateriaisSilhueta('#f0623e');
  for (const m of [preenchimento, contorno]) {
    assert.equal(m.depthFunc, THREE.GreaterDepth);
    assert.equal(m.depthWrite, false);
    assert.equal(m.depthTest, true);
    assert.equal(m.transparent, false, 'cor lisa e sólida');
    assert.equal(m.opacity, 1);
  }
  assert.equal(contorno.side, THREE.BackSide, 'contorno como casca pelo avesso');
  assert.equal(preenchimento.side, THREE.FrontSide);
});

test('ordem de desenho: mundo (0) → silhueta → carro', () => {
  assert.ok(ORDEM_SILHUETA > 0);
  assert.ok(ORDEM_CARRO > ORDEM_SILHUETA);
});

test('a silhueta nunca desce até o chão, a calçada ou o meio-fio', () => {
  // calçada dos lotes 0,16; camada violeta 0,215; meio-fio do estilo real 0,22
  assert.ok(ALTURA_MINIMA_SILHUETA >= 0.3);
  // coordenadas locais do carro: o centro do colisor; o chão fica em −altura/2
  for (const c of caixasDaSilhueta(CARRO)) {
    const baseNoMundo = c.pos[1] - c.tam[1] / 2 + CARRO.altura / 2;
    assert.ok(baseNoMundo >= ALTURA_MINIMA_SILHUETA - 1e-9, `${c.id}: base a ${baseNoMundo}`);
  }
});

test('a cor da silhueta acompanha a pintura do carro, em todas as cores da garagem', () => {
  for (const cor of CORES_CARRO) {
    const tinta = tintaDoCarro(cor.id);
    const { preenchimento } = criarMateriaisSilhueta(tinta);
    assert.equal(`#${preenchimento.color.getHexString()}`, tinta.toLowerCase(), cor.id);
  }
});

test('sem animação: a silhueta é a mesma em qualquer perfil (nada pisca nem pulsa)', () => {
  const a = criarMateriaisSilhueta('#f0623e');
  const b = criarMateriaisSilhueta('#f0623e');
  assert.equal(a.preenchimento.color.getHex(), b.preenchimento.color.getHex());
  assert.equal(a.preenchimento.onBeforeRender, THREE.Material.prototype.onBeforeRender);
  assert.equal(caixasDaSilhueta.length, 1); // depende só das medidas do carro
});

test('orçamento: no máximo +2 chamadas', () => {
  const { chamadas, triangulos } = orcamentoSilhueta(CARRO);
  assert.ok(chamadas <= 2, `chamadas: ${chamadas}`);
  assert.ok(triangulos > 0 && triangulos <= 100, `triângulos: ${triangulos}`);
});
