import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { CALCADA_POR_LADO, PADDING_CHEGADA } from '../src/city/geometria.js';
import { PREDIOS_GPS } from '../src/missions/destinos.js';
import { MOEDAS } from '../src/city/moedas.js';
import { BICHOS } from '../src/city/bichos.js';
import { CARONA_ESPERA_POS } from '../src/city/carona.js';
import { CAMERA_2_5D } from '../src/visual/world-style.js';
import { limitesDe } from '../src/visual/geometria-mesclada.js';
import {
  ALTURA_CANTEIRO,
  ALTURA_MAX_BROTO,
  BASE_HORTA,
  ESCALA_INICIAL_BROTOS,
  brotosVisiveis,
  escalaInicialDosBrotos,
  orcamentoHortaEscola,
  pecasDaHortaEscola,
} from '../src/school/horta-mundo.js';

/**
 * H2 — A HORTA VIVA NO MUNDO. Três canteiros baixos na faixa leste da ESCOLA
 * (dentro do lote, fora do colisor do prédio, sem corpo físico). Vazios antes
 * da primeira Horta; com `horta_escola_viva`, dois brotos em cada um, que
 * crescem uma vez quando o resumo fecha.
 */

const ESCOLA = TODOS_PREDIOS.find((p) => p.slug === 'ESCOLA');
const [EX, EZ] = ESCOLA.pos;
const [EW, EH, EL] = ESCOLA.size;
const todas = (viva) => Object.values(pecasDaHortaEscola({ viva })).flat();
const caixas = (viva) => todas(viva).map(limitesDe);

// ------------------------------------------------------------------ posição

test('posição: tudo dentro do lote da ESCOLA e a pelo menos 0,3 do colisor do prédio', () => {
  for (const b of caixas(true)) {
    assert.ok(b.min[0] >= EX - EW / 2 - CALCADA_POR_LADO - 1e-9 && b.max[0] <= EX + EW / 2 + CALCADA_POR_LADO + 1e-9, 'x no lote');
    assert.ok(b.min[2] >= EZ - EL / 2 - CALCADA_POR_LADO - 1e-9 && b.max[2] <= EZ + EL / 2 + CALCADA_POR_LADO + 1e-9, 'z no lote');
    const fora =
      b.min[0] >= EX + EW / 2 + 0.3 - 1e-9 ||
      b.max[0] <= EX - EW / 2 - 0.3 + 1e-9 ||
      b.min[2] >= EZ + EL / 2 + 0.3 - 1e-9 ||
      b.max[2] <= EZ - EL / 2 - 0.3 + 1e-9;
    assert.ok(fora, `peça encosta no prédio: ${JSON.stringify(b)}`);
  }
});

test('posição: do lado que a câmera vê (leste) e longe de moedas, bichos e do cão', () => {
  for (const b of caixas(true)) {
    assert.ok(b.min[0] > EX + EW / 2, 'faixa leste');
    const longe = ([x, z]) => {
      const gx = Math.max(b.min[0] - x, 0, x - b.max[0]);
      const gz = Math.max(b.min[2] - z, 0, z - b.max[2]);
      return Math.hypot(gx, gz) >= 2;
    };
    for (const m of MOEDAS) assert.ok(longe(m), `moeda ${m}`);
    for (const bicho of BICHOS) assert.ok(longe(bicho.pos), bicho.slug);
    assert.ok(longe(CARONA_ESPERA_POS), 'cão da carona');
  }
});

test('sensor e física: o sensor da ESCOLA não muda e a horta não tem corpo físico', () => {
  const sensor = PREDIOS_GPS.find((p) => p.slug === 'ESCOLA');
  assert.deepEqual(sensor.floorPos, [0, 38]);
  assert.deepEqual(sensor.size, [16, 7, 12]);
  assert.equal(PADDING_CHEGADA, 3.5);
  const fonte = readFileSync(new URL('../src/components/HortaEscola.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(fonte, /RigidBody|Collider|rapier/);
  const sensores = readFileSync(new URL('../src/components/MissionSensors.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(sensores, /horta/i);
});

// ------------------------------------------------------------------- alturas

test('alturas: canteiro até 0,20 e brotos até 0,6 acima da calçada', () => {
  const { canteiros, brotos } = pecasDaHortaEscola({ viva: true });
  assert.equal(ALTURA_CANTEIRO, 0.2);
  assert.equal(ALTURA_MAX_BROTO, 0.6);
  for (const b of canteiros.map(limitesDe)) {
    assert.ok(b.max[1] - BASE_HORTA <= ALTURA_CANTEIRO + 1e-9, `canteiro: ${b.max[1]}`);
    assert.ok(b.min[1] >= BASE_HORTA - 1e-9, 'apoiado na calçada');
  }
  for (const b of brotos.map(limitesDe)) {
    assert.ok(b.max[1] - BASE_HORTA <= ALTURA_MAX_BROTO + 1e-9, `broto: ${b.max[1]}`);
    assert.ok(b.min[1] >= BASE_HORTA + ALTURA_CANTEIRO - 0.05, 'brota da terra');
  }
});

// ---------------------------------------------------------- antes e depois

test('antes da flag: três canteiros vazios, com contorno; depois: dois brotos em cada', () => {
  const antes = pecasDaHortaEscola({ viva: false });
  assert.equal(antes.canteiros.length, 3);
  assert.equal(antes.contorno.length, 3, 'contorno só nos canteiros');
  assert.deepEqual(antes.brotos, []);

  const depois = pecasDaHortaEscola({ viva: true });
  assert.equal(depois.canteiros.length, 3);
  assert.equal(depois.contorno.length, 3, 'brotos sem contorno, como as flores do parque');
  const porCanteiro = new Map();
  for (const peca of depois.brotos) {
    const [canteiro, broto] = peca.id.split(':')[0].split('/');
    porCanteiro.set(canteiro, (porCanteiro.get(canteiro) ?? new Set()).add(broto));
  }
  assert.equal(porCanteiro.size, 3);
  for (const brotos of porCanteiro.values()) assert.equal(brotos.size, 2);
  // cada broto fica dentro do seu canteiro (visto de cima)
  for (const peca of depois.brotos) {
    const c = limitesDe(depois.canteiros[Number(peca.id.split('/')[0].replace('canteiro-', '')) - 1]);
    const b = limitesDe(peca);
    assert.ok(b.min[0] >= c.min[0] && b.max[0] <= c.max[0] && b.min[2] >= c.min[2] && b.max[2] <= c.max[2], peca.id);
  }
});

// ------------------------------------------------------------------ oclusão

test('oclusão: o carro não fica mais escondido perto da ESCOLA, e os canteiros ficam à vista', () => {
  const off = CAMERA_2_5D.offset;
  const n = Math.hypot(...off);
  const D = off.map((v) => v / n);
  const box = (min, max) => ({ min, max });
  const predios = TODOS_PREDIOS.filter((p) => p.slug !== 'PARQUE').map((p) => {
    const [x, z] = p.pos;
    const [w, h, l] = p.size;
    return box([x - w / 2, 0, z - l / 2], [x + w / 2, h, z + l / 2]);
  });
  const horta = caixas(true);
  const bate = (o, b) => {
    let t0 = 1e-4;
    let t1 = 1e9;
    for (let i = 0; i < 3; i += 1) {
      let a = (b.min[i] - o[i]) / D[i];
      let c = (b.max[i] - o[i]) / D[i];
      if (a > c) [a, c] = [c, a];
      t0 = Math.max(t0, a);
      t1 = Math.min(t1, c);
      if (t0 > t1) return false;
    }
    return true;
  };
  const pontos = (cx, cz, rumo, y0) => {
    const c = Math.cos(rumo);
    const s = Math.sin(rumo);
    const pts = [];
    for (const fx of [-0.9, -0.45, 0, 0.45, 0.9]) {
      for (const fy of [0.3, 0.55, 0.8]) {
        for (const fz of [-1.75, -0.875, 0, 0.875, 1.75]) {
          pts.push([cx + fx * c + fz * s, y0 + fy, cz - fx * s + fz * c]);
        }
      }
    }
    return pts;
  };
  const hx = EW / 2 + PADDING_CHEGADA;
  const hz = EL / 2 + PADDING_CHEGADA;
  let pior = 0;
  let medidas = 0;
  for (let x = EX - hx - 2; x <= EX + hx + 2; x += 1) {
    for (let z = EZ - hz - 2; z <= EZ + hz + 2; z += 1) {
      if (Math.abs(x - EX) < EW / 2 + 1 && Math.abs(z - EZ) < EL / 2 + 1) continue;
      for (const rumo of [0, Math.PI / 4, Math.PI / 2]) {
        const naCalcada = Math.abs(x - EX) <= EW / 2 + CALCADA_POR_LADO && Math.abs(z - EZ) <= EL / 2 + CALCADA_POR_LADO;
        const pts = pontos(x, z, rumo, naCalcada ? BASE_HORTA : 0);
        const xs = pts.map((p) => p[0]);
        const zs = pts.map((p) => p[2]);
        const emCima = horta.some(
          (b) => Math.min(...xs) < b.max[0] && Math.max(...xs) > b.min[0] && Math.min(...zs) < b.max[2] && Math.max(...zs) > b.min[2]
        );
        if (emCima) continue; // sem colisor, o carro passa por dentro (fora da conta)
        const antes = pts.filter((p) => predios.some((b) => bate(p, b))).length;
        const depois = pts.filter((p) => predios.some((b) => bate(p, b)) || horta.some((b) => bate(p, b))).length;
        pior = Math.max(pior, (depois - antes) / pts.length);
        medidas += 1;
      }
    }
  }
  assert.ok(medidas > 1000, `posições medidas: ${medidas}`);
  assert.equal(pior, 0, `acréscimo de oclusão: ${(pior * 100).toFixed(1)}%`);

  // o topo de cada canteiro não fica atrás do prédio
  for (const c of pecasDaHortaEscola({ viva: false }).canteiros.map(limitesDe)) {
    const topo = [(c.min[0] + c.max[0]) / 2, c.max[1], (c.min[2] + c.max[2]) / 2];
    assert.equal(predios.some((b) => bate(topo, b)), false, 'canteiro à vista');
  }
  assert.ok(EH > 0);
});

// ---------------------------------------------------------------- orçamento

test('orçamento: 2 chamadas antes da flag, 3 depois, menos de 1.000 triângulos', () => {
  const antes = orcamentoHortaEscola({ viva: false });
  const depois = orcamentoHortaEscola({ viva: true });
  assert.equal(antes.chamadas, 2);
  assert.equal(depois.chamadas, 3);
  assert.ok(depois.triangulos > 0 && depois.triangulos < 1000, `triângulos: ${depois.triangulos}`);
});

// --------------------------------------------------------------- crescimento

test('crescimento: escondidos durante a aventura, aparecem quando o resumo fecha', () => {
  const base = { viva: true, vivaAoAbrir: false, jaApareceram: false };
  assert.equal(brotosVisiveis({ ...base, viva: false, aventuraAtiva: false }), false, 'sem flag, sem brotos');
  assert.equal(brotosVisiveis({ ...base, aventuraAtiva: true }), false, 'flag ligada sob o resumo');
  assert.equal(brotosVisiveis({ ...base, aventuraAtiva: false }), true, 'resumo fechado: aparecem');
});

test('crescimento: cresce uma vez; pronto ao recarregar e com animações desligadas', () => {
  assert.equal(ESCALA_INICIAL_BROTOS, 0.28);
  assert.equal(escalaInicialDosBrotos({ vivaAoAbrir: false, animacoes: true }), 0.28, 'cresce');
  assert.equal(escalaInicialDosBrotos({ vivaAoAbrir: true, animacoes: true }), 1, 'recarregar: pronto');
  assert.equal(escalaInicialDosBrotos({ vivaAoAbrir: false, animacoes: false }), 1, 'Modo Tranquilo: pronto');
});

test('crescimento: repetir a Horta não esconde nem faz crescer de novo', () => {
  // mesma sessão: já apareceram, a aventura repetida não os esconde
  assert.equal(
    brotosVisiveis({ viva: true, vivaAoAbrir: false, jaApareceram: true, aventuraAtiva: true }),
    true
  );
  // outra sessão: a flag já vinha ligada
  assert.equal(
    brotosVisiveis({ viva: true, vivaAoAbrir: true, jaApareceram: false, aventuraAtiva: true }),
    true
  );
});
