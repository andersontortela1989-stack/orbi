import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AQUECIMENTO_MS,
  estadoIncremental,
  lerIncremental,
  medicaoAtiva,
  registrarQuadro,
  resumirQuadros,
  textoResumo,
} from '../src/perf/medidor.js';

// 20 ms por quadro divide o aquecimento (10 000 ms) em exatamente 500 quadros.
const regulares = (n, ms = 20) => Array(n).fill(ms);

test('quadros regulares: aquecimento ignorado e estatísticas estáveis', () => {
  const r = resumirQuadros(regulares(1000));
  assert.equal(r.ignorados, AQUECIMENTO_MS / 20);
  assert.equal(r.quadros, 500);
  assert.equal(r.duracaoSessaoMs, 20000);
  assert.equal(r.mediana, 20);
  assert.equal(r.p95, 20);
  assert.equal(r.maior, 20);
  assert.equal(r.pctAcima50, 0);
  assert.equal(r.acima250, 0);
});

test('picos: conta lentos acima de 50 ms e travadas acima de 250 ms', () => {
  // 500 de aquecimento + 90 normais + 8 lentos + 2 travadas = 100 medidos.
  const quadros = [
    ...regulares(500),
    ...regulares(90, 16),
    ...regulares(8, 60),
    300,
    400,
  ];
  const r = resumirQuadros(quadros);
  assert.equal(r.quadros, 100);
  assert.equal(r.pctAcima50, 10);
  assert.equal(r.acima250, 2);
  assert.equal(r.maior, 400);
  assert.equal(r.mediana, 16);
  // posto mais próximo: 95º de 100 ordenados = um dos quadros de 60 ms
  assert.equal(r.p95, 60);
});

test('exatamente no limiar não conta como lento nem como travada', () => {
  const r = resumirQuadros([...regulares(500), 50, 250], { aquecimentoMs: AQUECIMENTO_MS });
  assert.equal(r.quadros, 2);
  assert.equal(r.acima250, 0);
  assert.equal(r.pctAcima50, 50); // só o 250 passa de 50
});

test('mediana com quantidade par é a média dos dois do meio', () => {
  const r = resumirQuadros([10, 20, 30, 40], { aquecimentoMs: 0 });
  assert.equal(r.mediana, 25);
});

test('lista vazia: nada medido, estatísticas nulas (nunca zero)', () => {
  const r = resumirQuadros([]);
  assert.deepEqual(r, {
    quadros: 0,
    ignorados: 0,
    descartados: 0,
    duracaoSessaoMs: 0,
    mediana: null,
    p95: null,
    maior: null,
    pctAcima50: null,
    acima250: 0,
  });
  // entrada que não é lista se comporta como lista vazia
  assert.equal(resumirQuadros(undefined).quadros, 0);
});

test('sessão menor que o aquecimento: tudo ignorado, duração informada', () => {
  const r = resumirQuadros(regulares(100));
  assert.equal(r.quadros, 0);
  assert.equal(r.ignorados, 100);
  assert.equal(r.duracaoSessaoMs, 2000);
  assert.equal(r.mediana, null);
  assert.equal(r.pctAcima50, null);
});

test('valores inválidos são descartados e contados', () => {
  const r = resumirQuadros([NaN, -5, Infinity, 'x', 20], { aquecimentoMs: 0 });
  assert.equal(r.descartados, 4);
  assert.equal(r.quadros, 1);
});

test('medição só liga com ?medir=1', () => {
  assert.equal(medicaoAtiva('?medir=1'), true);
  assert.equal(medicaoAtiva('?x=2&medir=1'), true);
  assert.equal(medicaoAtiva(''), false);
  assert.equal(medicaoAtiva('?medir=0'), false);
  assert.equal(medicaoAtiva('?medir=true'), false);
  assert.equal(medicaoAtiva(undefined), false);
});

test('texto de resumo traz os números e omite o que não foi informado', () => {
  const r = resumirQuadros([...regulares(500), ...regulares(98, 16), 60, 300]);
  const texto = textoResumo(r, {
    render: { chamadas: 290, triangulos: 45210, geometrias: 180, texturas: 12 },
    tela: { largura: 800, altura: 360, dpr: 2.625 },
    quando: '30/09/2026 18:05',
  });
  assert.match(texto, /quadros medidos: 100/);
  assert.match(texto, /aquecimento de 10 s: 500 quadros ignorados/);
  assert.match(texto, /mediana: 16,0 ms/);
  assert.match(texto, /acima de 50 ms: 2,0% · acima de 250 ms: 1/);
  assert.match(texto, /render: 290 chamadas/);
  assert.match(texto, /tela: 800×360 · DPR 2,63/);
  assert.match(texto, /quando: 30\/09\/2026 18:05/);

  const semExtras = textoResumo(resumirQuadros([]));
  assert.doesNotMatch(semExtras, /render:|tela:|quando:/);
  assert.match(semExtras, /mediana: — ms/);
});

// ----- Estatística incremental: tem de bater com resumirQuadros -----

// Soma os quadros um a um, como o coletor faz a cada quadro.
function incremental(duracoes, aquecimentoMs = AQUECIMENTO_MS) {
  const estado = estadoIncremental();
  for (const d of duracoes) registrarQuadro(estado, d, aquecimentoMs);
  return lerIncremental(estado);
}

// Os campos que a estatística incremental cobre (mediana e p95 ficam de fora).
function semOrdenacao(resumo) {
  const { mediana, p95, ...resto } = resumo;
  return resto;
}

const CENARIOS = {
  regulares: [regulares(1000)],
  picos: [[...regulares(500), ...regulares(90, 16), ...regulares(8, 60), 300, 400]],
  'limiar exato': [[...regulares(500), 50, 250]],
  vazio: [[]],
  'sessão menor que o aquecimento': [regulares(100)],
  inválidos: [[NaN, -5, Infinity, 'x', 20], 0],
};

for (const [nome, [dados, aquecimentoMs = AQUECIMENTO_MS]] of Object.entries(CENARIOS)) {
  test(`incremental bate com resumirQuadros: ${nome}`, () => {
    assert.deepEqual(
      incremental(dados, aquecimentoMs),
      semOrdenacao(resumirQuadros(dados, { aquecimentoMs }))
    );
  });
}

test('incremental: valores esperados nos cenários de referência', () => {
  const picos = incremental(CENARIOS.picos[0]);
  assert.equal(picos.quadros, 100);
  assert.equal(picos.pctAcima50, 10);
  assert.equal(picos.acima250, 2);
  assert.equal(picos.maior, 400);

  const curta = incremental(regulares(100));
  assert.equal(curta.quadros, 0);
  assert.equal(curta.ignorados, 100);
  assert.equal(curta.maior, null);
  assert.equal(curta.pctAcima50, null);

  const invalidos = incremental([NaN, -5, Infinity, 'x', 20], 0);
  assert.equal(invalidos.descartados, 4);
  assert.equal(invalidos.quadros, 1);
});

test('registrarQuadro altera o próprio estado, sem criar outro', () => {
  const estado = estadoIncremental();
  assert.equal(registrarQuadro(estado, 20, 0), estado);
  assert.equal(registrarQuadro(estado, NaN, 0), estado);
  assert.equal(estado.quadros, 1);
  assert.equal(estado.descartados, 1);
});
