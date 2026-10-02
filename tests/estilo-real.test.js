import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { CALCADA_POR_LADO, PADDING_CHEGADA } from '../src/city/geometria.js';
import { CAMINHOS, LARGURA_RUA_BORDA, TENSAO_RUA } from '../src/city/ruas.js';
import { LIMITE_FACHADA, aderecosDoLugar } from '../src/city/identidade.js';
import { lerEstilo } from '../src/visual/estilo.js';
import { pontoDeMedicao } from '../src/perf/medidor.js';
import { montarMalha } from '../src/visual/geometria-mesclada.js';
import {
  ALTURA_LIVRE,
  PREDIOS_REAIS,
  colisorDoLote,
  limitesDaPeca,
  orcamentoPredioReal,
} from '../src/visual/estilo-real/predio-real.js';
import { PALETA_REAL } from '../src/visual/estilo-real/paleta.js';
import { TRACO_REAL } from '../src/visual/estilo-real/padaria.js';
import { PALETA3D } from '../src/brand/paleta3d.js';

/**
 * ESTILO REAL, fatia V1 (V1.1 infraestrutura + V1.2 PADARIA). O estilo real
 * troca só o DESENHO: pegada, posição e colisor são os do Building, então
 * folgas, sensores e roteiro valem igual nos dois estilos.
 *
 * Zonas das peças (coordenadas do lote: x/z do centro do prédio, y do chão):
 *   chao     — piso da calçada, até a borda da calçada, rente ao chão;
 *   corpo    — o volume do prédio, dentro da pegada w × l;
 *   fachada  — no máximo LIMITE_FACHADA para fora da pegada;
 *   alta     — toldo, marquise, placa bandeira: até a borda da calçada,
 *              acima da altura do carro (ALTURA_LIVRE), nunca sobre a rua;
 *   telhado  — em cima da laje, dentro da pegada.
 */

const PREDIO = new Map(TODOS_PREDIOS.map((p) => [p.slug, p]));
const TOL = 1e-6;

// ---------------------------------------------------------------- chave

test('lerEstilo: só "real" liga o estilo novo; qualquer outro valor é o atual', () => {
  assert.equal(lerEstilo('?estilo=real'), 'real');
  assert.equal(lerEstilo('?medir=1&estilo=real&ponto=PADARIA'), 'real');
  for (const s of ['', '?estilo=REAL', '?estilo=atual', '?estilo=', '?estilo=foo', undefined, null]) {
    assert.equal(lerEstilo(s), 'atual', String(s));
  }
});

test('ponto de medição só age com ?medir=1 e ponto conhecido', () => {
  assert.equal(pontoDeMedicao('?ponto=PADARIA'), null);
  assert.equal(pontoDeMedicao('?medir=1'), null);
  assert.equal(pontoDeMedicao('?medir=1&ponto=ESCOLA'), null);
  assert.equal(pontoDeMedicao(undefined), null);
  assert.ok(pontoDeMedicao('?medir=1&ponto=PADARIA'));
});

test('ponto PADARIA: em frente à fachada, fora do sensor de chegada', () => {
  const { pos, size } = PREDIO.get('PADARIA');
  const { posicao } = pontoDeMedicao('?medir=1&ponto=PADARIA');
  const [x, , z] = posicao;
  assert.ok(Math.abs(x - pos[0]) < size[0] / 2, 'alinhado com a fachada');
  // frente +Z; o carro mede 3,5 de comprido (metade 1,75)
  assert.ok(z - 1.75 > pos[1] + size[2] / 2 + PADDING_CHEGADA, 'não dispara a chegada');
  assert.ok(z - 1.75 > pos[1] + size[2] / 2 + CALCADA_POR_LADO, 'fora da calçada');
});

// ---------------------------------------------------------------- pegada

test('estilo real não muda pegada nem posição: colisor igual ao do Building', () => {
  for (const slug of Object.keys(PREDIOS_REAIS)) {
    const { pos, size } = PREDIO.get(slug);
    const [w, h, l] = size;
    assert.deepEqual(colisorDoLote(PREDIO.get(slug)), {
      posicao: [pos[0], h / 2, pos[1]],
      meiaExtensao: [w / 2, h / 2, l / 2],
    });
  }
});

// ---------------------------------------------------------------- contratos

function pecasDe(slug) {
  return PREDIOS_REAIS[slug].pecas(PREDIO.get(slug).size);
}

test('toda peça do estilo real tem zona conhecida, cor e fica acima do chão', () => {
  for (const slug of Object.keys(PREDIOS_REAIS)) {
    for (const peca of pecasDe(slug)) {
      assert.ok(['chao', 'corpo', 'fachada', 'alta', 'telhado'].includes(peca.zona), peca.id);
      assert.match(peca.cor, /^#[0-9a-f]{6}$/i, peca.id);
      assert.ok(limitesDaPeca(peca).min[1] >= -TOL, `${peca.id} abaixo do chão`);
    }
  }
});

test('contrato por zona: corpo, fachada, telhado, chão e projeção alta', () => {
  for (const slug of Object.keys(PREDIOS_REAIS)) {
    const [w, h, l] = PREDIO.get(slug).size;
    for (const peca of pecasDe(slug)) {
      const { min, max } = limitesDaPeca(peca);
      const dentro = (mx, mz) =>
        min[0] >= -mx - TOL && max[0] <= mx + TOL && min[2] >= -mz - TOL && max[2] <= mz + TOL;
      const id = `${slug}/${peca.id}`;
      if (peca.zona === 'corpo') assert.ok(dentro(w / 2, l / 2), `${id} sai da pegada`);
      if (peca.zona === 'fachada') {
        assert.ok(dentro(w / 2 + LIMITE_FACHADA, l / 2 + LIMITE_FACHADA), `${id} passa de ${LIMITE_FACHADA}`);
      }
      if (peca.zona === 'telhado') {
        assert.ok(dentro(w / 2, l / 2), `${id} sai da laje`);
        assert.ok(min[1] >= h - TOL, `${id} abaixo da laje`);
      }
      if (peca.zona === 'chao') {
        assert.ok(dentro(w / 2 + CALCADA_POR_LADO, l / 2 + CALCADA_POR_LADO), `${id} sai da calçada`);
        assert.ok(max[1] <= 0.3, `${id} não é chão`);
      }
      if (peca.zona === 'alta') {
        assert.ok(dentro(w / 2 + CALCADA_POR_LADO, l / 2 + CALCADA_POR_LADO), `${id} passa da calçada`);
        assert.ok(min[1] >= ALTURA_LIVRE - TOL, `${id} abaixo da altura livre: ${min[1]}`);
      }
    }
  }
});

test('altura livre das projeções fica acima do carro', () => {
  // corpo do carro: colisor de 0,8 de altura; cabine e enfeite até ~1,7
  assert.ok(ALTURA_LIVRE >= 2.2, `ALTURA_LIVRE ${ALTURA_LIVRE}`);
});

test('nenhuma peça do estilo real fica sobre a rua', () => {
  const amostras = CAMINHOS.flatMap((caminho) => {
    const curva = new THREE.CatmullRomCurve3(
      caminho.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      'catmullrom',
      TENSAO_RUA
    );
    return curva.getSpacedPoints(400).map((p) => [p.x, p.z]);
  });
  const meiaRua = LARGURA_RUA_BORDA / 2;
  for (const slug of Object.keys(PREDIOS_REAIS)) {
    const { pos } = PREDIO.get(slug);
    for (const peca of pecasDe(slug)) {
      if (peca.zona === 'chao') continue; // piso da calçada: a rua passa por baixo, por desenho (dívida 14)
      const { min, max } = limitesDaPeca(peca);
      for (const [rx, rz] of amostras) {
        const dx = Math.max(pos[0] + min[0] - rx, 0, rx - (pos[0] + max[0]));
        const dz = Math.max(pos[1] + min[2] - rz, 0, rz - (pos[1] + max[2]));
        assert.ok(Math.hypot(dx, dz) > meiaRua, `${slug}/${peca.id} sobre a rua em ${rx.toFixed(1)},${rz.toFixed(1)}`);
      }
    }
  }
});

test('PADARIA real: tem os elementos aprovados e nada da padaria das fotos', () => {
  const ids = pecasDe('PADARIA').map((p) => p.id);
  for (const parte of ['platibanda', 'ar-condicionado', 'faixa-letreiro', 'painel-letreiro',
    'icone-pao', 'marquise', 'friso', 'toldo', 'placa-bandeira', 'porta-vidro', 'grade',
    'janela', 'balcao', 'calcada', 'piso-tatil', 'meio-fio']) {
    assert.ok(ids.some((id) => id.startsWith(parte)), `falta ${parte}`);
  }
  assert.ok(!ids.some((id) => id.includes('pilar')), 'sem pilar listrado');
  const { texto } = PREDIOS_REAIS.PADARIA.letreiro(PREDIO.get('PADARIA').size);
  assert.equal(texto, 'PADARIA');
});

// ---------------------------------------------------------------- legibilidade (V1.2b)

// Luminância relativa (WCAG) de '#rrggbb' e razão de contraste entre duas cores.
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const pecaDe = (slug, id) => pecasDe(slug).find((p) => p.id === id);

test('V1.2b: contorno fino de volta, na cor escura da paleta (não preto), em camada própria', () => {
  const contornos = pecasDe('PADARIA').filter((p) => p.camada === 'contorno');
  for (const alvo of ['volume', 'marquise', 'toldo', 'placa-bandeira', 'faixa-letreiro']) {
    assert.ok(contornos.some((p) => p.id === `contorno-${alvo}`), `falta contorno de ${alvo}`);
  }
  for (const p of contornos) {
    assert.equal(p.cor, PALETA_REAL.contorno, p.id);
    assert.notEqual(p.cor.toLowerCase(), '#000000');
    assert.ok(luminancia(p.cor) < 0.06, `${p.id} não é escuro`);
  }
  assert.ok(TRACO_REAL > 0 && TRACO_REAL <= 0.1, `traço ${TRACO_REAL}`);
});

test('V1.2b: fachada contrasta com o chão do bairro (sem bege sobre areia)', () => {
  const reboco = pecaDe('PADARIA', 'corpo').cor;
  assert.ok(contraste(reboco, PALETA3D.chaoMercado) >= 1.8,
    `reboco × areia: ${contraste(reboco, PALETA3D.chaoMercado).toFixed(2)}`);
});

test('V1.2b: calçada cinza-clara como a da cidade, com meio-fio e piso tátil cinza', () => {
  assert.equal(pecaDe('PADARIA', 'calcada').cor.toLowerCase(), PALETA3D.calcada.toLowerCase());
  const tatil = pecaDe('PADARIA', 'piso-tatil').cor;
  assert.ok(contraste(tatil, PALETA3D.calcada) >= 1.5, 'piso tátil some na calçada');
  assert.ok(pecasDe('PADARIA').some((p) => p.id.startsWith('meio-fio')));
});

test('V1.2b: toldo em cor lisa que se destaca da fachada e não lembra a moeda', () => {
  const toldo = pecaDe('PADARIA', 'toldo').cor;
  assert.ok(contraste(toldo, pecaDe('PADARIA', 'corpo').cor) >= 1.5, 'toldo some na fachada');
  assert.ok(contraste(toldo, PALETA3D.chaoMercado) >= 1.5, 'toldo some no chão');
  assert.notEqual(toldo.toLowerCase(), PALETA3D.moeda.toLowerCase());
  assert.ok(!pecasDe('PADARIA').some((p) => p.id.includes('listra')), 'sem listras');
});

test('V1.2b: vitrine acesa mais clara que a fachada', () => {
  const vidro = pecaDe('PADARIA', 'vitrine-vidro');
  assert.equal(vidro.camada, 'luz');
  assert.ok(luminancia(vidro.cor) > luminancia(pecaDe('PADARIA', 'corpo').cor) * 2);
});

test('V1.2b: letreiro grande, escuro sobre creme, cabe no painel', () => {
  const size = PREDIO.get('PADARIA').size;
  const letreiro = PREDIOS_REAIS.PADARIA.letreiro(size);
  const painel = pecaDe('PADARIA', 'painel-letreiro');
  assert.ok(letreiro.tamanho >= 1.0, `fonte ${letreiro.tamanho} (placa atual: até 1,15)`);
  assert.ok(contraste(letreiro.cor, painel.cor) >= 7, 'texto escuro sobre creme');
  // largura aproximada do texto em caixa alta (≈ 0,67 da fonte por letra)
  assert.ok(letreiro.texto.length * letreiro.tamanho * 0.67 <= painel.tam[0], 'texto maior que o painel');
  assert.ok(letreiro.tamanho * 1.05 <= painel.tam[1], 'texto mais alto que o painel');
});

test('V1.2b: pães da vitrine maiores, ainda dentro da regra de 0,3 u', () => {
  const size = PREDIO.get('PADARIA').size;
  const [paes] = aderecosDoLugar('PADARIA', size, 'real');
  for (const inst of paes.instancias) assert.ok(inst.escala[1] >= 1.0, `altura ${inst.escala[1]}`);
  assert.ok(paes.limites.max[2] <= size[2] / 2 + LIMITE_FACHADA + TOL);
});

// ---------------------------------------------------------------- pães

test('PADARIA real: só os 3 pães da vitrine (o do telhado vira placa bandeira)', () => {
  const size = PREDIO.get('PADARIA').size;
  const reais = aderecosDoLugar('PADARIA', size, 'real');
  assert.deepEqual(reais.map((a) => a.lugar), ['fachada']);
  assert.equal(reais[0].instancias.length, 3);
  const [w, , l] = size;
  const { min, max } = reais[0].limites;
  assert.ok(max[2] <= l / 2 + LIMITE_FACHADA + TOL && min[1] >= 0);
  assert.ok(max[0] <= w / 2 && min[0] >= -w / 2);
  // o estilo atual continua igual
  assert.deepEqual(aderecosDoLugar('PADARIA', size).map((a) => a.lugar).sort(), ['fachada', 'telhado']);
});

// ---------------------------------------------------------------- malha

test('montarMalha: caixa = 12 triângulos, cilindro de n lados = 4n', () => {
  const caixa = montarMalha([{ forma: 'caixa', pos: [0, 0, 0], tam: [1, 1, 1], cor: '#ffffff' }]);
  assert.equal(caixa.triangulos, 12);
  assert.equal(caixa.posicoes.length, 24 * 3);
  assert.equal(caixa.cores.length, caixa.posicoes.length);
  const cil = montarMalha([{ forma: 'cilindro', pos: [0, 0, 0], raio: 1, comprimento: 1, lados: 10, cor: '#ffffff' }]);
  assert.equal(cil.triangulos, 40);
});

test('montarMalha: cor por vértice com variação sutil (no máximo ±4%)', () => {
  const pecas = Array.from({ length: 8 }, (_, i) => ({
    id: `p${i}`, forma: 'caixa', pos: [i * 2, 0, 0], tam: [1, 1, 1], cor: '#808080',
  }));
  const { cores } = montarMalha(pecas);
  const base = new THREE.Color('#808080').r;
  const vistos = new Set();
  for (let i = 0; i < cores.length; i += 3) {
    assert.ok(Math.abs(cores[i] / base - 1) <= 0.04 + 1e-6, `variação ${cores[i] / base}`);
    vistos.add(cores[i].toFixed(5));
  }
  assert.ok(vistos.size > 1, 'tem alguma variação');
});

// ---------------------------------------------------------------- orçamento

test('orçamento da PADARIA real: no máximo 6 chamadas e 3.000 triângulos', () => {
  const { chamadas, triangulos } = orcamentoPredioReal('PADARIA', PREDIO.get('PADARIA').size);
  assert.ok(chamadas <= 6, `chamadas: ${chamadas}`);
  assert.ok(triangulos <= 3000, `triângulos: ${triangulos}`);
});
