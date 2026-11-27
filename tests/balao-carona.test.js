import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularDesvioBalao } from '../src/ui/balao-carona.js';

const VIEWPORT_PAISAGEM = { width: 844, height: 320 };

// Controles do canto superior direito em celular deitado (42x42 + 48x48 abaixo).
const CONTROLES_TOPO_DIREITO = [
  { left: 686, top: 16, right: 728, bottom: 58 }, // engrenagem (.sensory-trigger--game)
  { left: 736, top: 16, right: 778, bottom: 58 }, // sol (.ceu-btn)
  { left: 786, top: 16, right: 828, bottom: 58 }, // caderninho (.cad-btn)
  { left: 780, top: 66, right: 828, bottom: 114 }, // repetir fala (.repetir-btn--hud)
];

function retanguloFinal(balao, res) {
  const left = balao.x - balao.width / 2 + res.dx;
  const top = balao.y - balao.height / 2 + res.dy;
  return {
    left,
    top,
    right: left + balao.width,
    bottom: top + balao.height,
  };
}

function sobrepoe(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

test('sem sobreposição com controles, o balão fica exatamente sobre o cão', () => {
  const balao = { x: 420, y: 180, width: 150, height: 42 };
  const res = calcularDesvioBalao(balao, CONTROLES_TOPO_DIREITO, VIEWPORT_PAISAGEM);
  assert.equal(res.desviado, false);
  assert.equal(res.dx, 0);
  assert.equal(res.dy, 0);
});

test('quando passa atrás da engrenagem e do sol (enquadramento da PIZZA), desvia sem tocar nos controles', () => {
  const balao = { x: 732, y: 40, width: 150, height: 42 };
  const res = calcularDesvioBalao(balao, CONTROLES_TOPO_DIREITO, VIEWPORT_PAISAGEM);
  assert.equal(res.desviado, true);

  const final = retanguloFinal(balao, res);
  assert.ok(final.left >= 8 && final.right <= VIEWPORT_PAISAGEM.width - 8);
  assert.ok(final.top >= 8 && final.bottom <= VIEWPORT_PAISAGEM.height - 8);

  for (const ctrl of CONTROLES_TOPO_DIREITO) {
    assert.equal(sobrepoe(final, ctrl), false, 'balão não pode sobrepor nenhum controle');
  }
});

test('na aproximação pela esquerda da engrenagem, o desvio é suave e sem salto brusco', () => {
  const balao = { x: 615, y: 40, width: 150, height: 42 };
  const res = calcularDesvioBalao(balao, CONTROLES_TOPO_DIREITO, VIEWPORT_PAISAGEM);
  assert.equal(res.desviado, true);

  const final = retanguloFinal(balao, res);
  assert.ok(final.right <= CONTROLES_TOPO_DIREITO[0].left, 'desvia para a esquerda da engrenagem');
  assert.equal(res.dy, 0);
});

test('fora do viewport visível, não força deslocamento', () => {
  const balao = { x: 1100, y: 40, width: 150, height: 42 };
  const res = calcularDesvioBalao(balao, CONTROLES_TOPO_DIREITO, VIEWPORT_PAISAGEM);
  assert.equal(res.desviado, false);
  assert.equal(res.dx, 0);
  assert.equal(res.dy, 0);
});
