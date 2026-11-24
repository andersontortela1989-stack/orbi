import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ESTACOES_SHOPPING,
  temChegadaViva,
  sortearChegadaViva,
} from '../src/missions/chegadas-vivas.js';

test('Shopping (Fatia 2): chegada viva registrada e montada com 3 cartas distintas', () => {
  assert.equal(temChegadaViva('SHOPPING'), true);
  assert.equal(ESTACOES_SHOPPING.length, 4);

  const p = sortearChegadaViva('SHOPPING');
  assert.ok(p, 'pergunta sorteada para SHOPPING');
  assert.equal(p.lugar, 'SHOPPING');
  assert.equal(p.habilidade, 'leituraGlobal');
  assert.equal(p.destaqueNeutro, true);
  assert.equal(p.mostra, null);
  assert.deepEqual(p.descoberta, { categoria: 'lugares', id: 'SHOPPING' });

  assert.equal(p.opcoes.length, 3, 'sempre 3 opções');
  const valores = p.opcoes.map((o) => o.valor);
  assert.equal(new Set(valores).size, 3, 'opções sem repetição');
  assert.ok(valores.includes(p.resposta), 'resposta certa presente entre as opções');
  for (const o of p.opcoes) {
    assert.ok(o.emoji, `opção ${o.valor} tem emoji`);
    assert.equal(o.rotulo, o.valor);
  }
});

test('Shopping (Fatia 2): não repete a mesma estação em duas visitas seguidas', () => {
  let anterior = null;
  for (let i = 0; i < 8; i += 1) {
    const p = sortearChegadaViva('SHOPPING');
    if (anterior !== null) {
      assert.notEqual(p.resposta, anterior, 'estação mudou na visita seguinte');
    }
    anterior = p.resposta;
  }
});

test('Shopping (Fatia 2): falas não contêm algarismos e mantêm tom acolhedor', () => {
  for (let i = 0; i < 8; i += 1) {
    const p = sortearChegadaViva('SHOPPING');
    for (const campo of ['frasePergunta', 'fraseAcerto', 'fraseTenteDeNovo', 'fraseRevela']) {
      assert.ok(typeof p[campo] === 'string' && p[campo].length > 0, `${campo} preenchido`);
      assert.ok(!/\d/.test(p[campo]), `${campo} sem algarismos: "${p[campo]}"`);
    }
  }
});