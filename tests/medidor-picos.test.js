import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoIncremental,
  leitorDeFoco,
  registrarQuadro,
  resumirQuadros,
  textoPicos,
  textoResumo,
} from '../src/perf/medidor.js';

/**
 * M1 — o medidor registra QUANDO e ONDE acontecem os picos, para o critério
 * B(1) da A3.3 ("picos concentrados no mesmo trecho ou evento") não depender
 * de anotação à mão: os 5 maiores quadros (duração, momento, atividade em
 * foco) e os quadros acima de 50 ms por atividade.
 */

// Aquecimento curto nos testes: 100 ms.
const AQ = 100;
function sessao(quadros) {
  const e = estadoIncremental();
  registrarQuadro(e, 100, AQ, 'explorando'); // aquecimento
  for (const [d, atividade] of quadros) registrarQuadro(e, d, AQ, atividade);
  return e;
}

test('top 5: guarda os maiores, do maior para o menor, com momento e atividade', () => {
  const e = sessao([
    [16, 'explorando'], [80, 'em_missao'], [20, 'explorando'], [146, 'pergunta'],
    [60, 'garagem'], [17, 'explorando'], [300, 'historia'], [55, 'resumo'], [90, 'em_missao'],
  ]);
  assert.deepEqual(e.picos.map((p) => p.duracao), [300, 146, 90, 80, 60]);
  assert.deepEqual(e.picos.map((p) => p.atividade), ['historia', 'pergunta', 'em_missao', 'em_missao', 'garagem']);
  // momento = fim do quadro na sessão (aquecimento incluído)
  assert.equal(e.picos[0].momentoMs, 100 + 16 + 80 + 20 + 146 + 60 + 17 + 300);
});

test('empate: o primeiro a acontecer fica; sessão curta guarda só o que existe', () => {
  const empate = sessao([
    [60, 'explorando'], [60, 'pergunta'], [60, 'garagem'], [60, 'resumo'],
    [60, 'historia'], [60, 'em_missao'],
  ]);
  assert.deepEqual(empate.picos.map((p) => p.atividade), ['explorando', 'pergunta', 'garagem', 'resumo', 'historia']);

  const curta = sessao([[30, 'explorando'], [70, 'pergunta']]);
  assert.deepEqual(curta.picos.map((p) => p.duracao), [70, 30]);

  const soAquecimento = estadoIncremental();
  registrarQuadro(soAquecimento, 50, AQ, 'explorando');
  assert.deepEqual(soAquecimento.picos, []); // aquecimento não entra
});

test('quadros acima de 50 ms contados por atividade em foco', () => {
  const e = sessao([
    [51, 'em_missao'], [50, 'em_missao'], [80, 'pergunta'], [16, 'pergunta'],
    [260, 'em_missao'], [70, null],
  ]);
  assert.deepEqual(e.lentosPorAtividade, { em_missao: 2, pergunta: 1, '—': 1 });
});

test('resumo antigo idêntico; as listas novas vêm só no fim', () => {
  const e = sessao([[16, 'explorando'], [146.2, 'pergunta'], [55, 'em_missao']]);
  const resumo = resumirQuadros([100, 16, 146.2, 55], { aquecimentoMs: AQ });
  const opcoes = { quando: '02/10/2026, 11:22:00', tela: { largura: 1707, altura: 879, dpr: 1.13 } };
  const antigo = textoResumo(resumo, opcoes);
  const completo = `${antigo}\n${textoPicos(e)}`;
  assert.ok(completo.startsWith(`${antigo}\n`));
  assert.equal(textoPicos(e), [
    'picos (5 maiores, depois do aquecimento):',
    '  146,2 ms · 00:00 · pergunta',
    '  55,0 ms · 00:00 · em_missao',
    '  16,0 ms · 00:00 · explorando',
    'acima de 50 ms por atividade: pergunta 1 · em_missao 1',
  ].join('\n'));
});

test('momento em mm:ss e listas vazias ditas com clareza', () => {
  const e = estadoIncremental();
  registrarQuadro(e, 125000, AQ, 'explorando'); // termina em 2:05
  assert.match(textoPicos(e), /125000,0 ms · 02:05 · explorando/);
  assert.match(textoPicos(e), /acima de 50 ms por atividade: explorando 1/);
  assert.equal(
    textoPicos(estadoIncremental()),
    'picos (5 maiores, depois do aquecimento): nenhum\nacima de 50 ms por atividade: nenhum'
  );
});

test('nada é lido nem registrado sem ?medir=1', () => {
  let leituras = 0;
  const ler = () => {
    leituras += 1;
    return 'explorando';
  };
  assert.equal(leitorDeFoco('', ler), null);
  assert.equal(leitorDeFoco('?estilo=real', ler), null);
  assert.equal(leitorDeFoco(undefined, ler), null);
  assert.equal(leituras, 0);
  const leitor = leitorDeFoco('?medir=1', ler);
  assert.equal(leitor(), 'explorando');
  assert.equal(leituras, 1);
});

test('registrarQuadro sem atividade continua funcionando (chamadas antigas)', () => {
  const e = estadoIncremental();
  registrarQuadro(e, 20000, AQ);
  assert.equal(e.quadros, 1);
  assert.equal(e.picos[0].atividade, null);
});
