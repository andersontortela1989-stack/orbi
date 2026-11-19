import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coordenadorAtividade } from '../src/activity/index.js';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';
import { aventuraRuntime, enviarEventoAventura, iniciarHortaEscola } from '../src/adventure/runtime.js';
import { ITENS_POR_ETAPA, RAIO_COLETA, SACO, formaDoSaco } from '../src/adventure/itens.js';
import { cartaoDistribuir, eventoDoCanteiro } from '../src/adventure/distribuir.js';
import { CATEGORIAS_CADERNINHO, conteudoDescoberta, falaDescoberta } from '../src/missions/descobertas.js';
import { HORTA_BANDS } from '../src/school/horta.js';
import { RECOMPENSA_HORTA, criarHortaEscola } from '../src/school/horta-aventura.js';
import { useGame } from '../src/store/useGame.js';
import { CAMERA_2_5D } from '../src/visual/world-style.js';
import { ESCALA_BOTAO, POSICOES_FLORES, escalaInicialDasFlores, floresCrescem } from '../src/city/flores-parque.js';

/**
 * H3 — TEXTOS, CADERNINHO E SACOS DA HORTA.
 *  (a) faixa 6–7: pergunta "quantas sementes" na chegada ao MERCADO;
 *  (b) números do Caderninho sem "pãezinhos";
 *  (c) repetição da Horta sem prometer adesivo;
 *  (d) sacos maiores e com contraste, dentro do limite de oclusão;
 *  (g) resumos descrevem a ação observada;
 *  (i) sem o `task` morto em horta.js;
 *  (j) unidade coerente: cada saquinho carrega uma semente.
 */

const ler = (caminho) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8');
const BANDS = Object.keys(HORTA_BANDS);
const etapasPorId = (def) => Object.fromEntries(def.etapas.map((e) => [e.id, e]));
const resumoDe = (def) => def.etapas.find((e) => e.tipo === 'resumo');

const ESPERADO = {
  '3-5': { total: 'três', porCanteiro: 'uma semente' },
  '6-7': { total: 'quatro', porCanteiro: 'duas sementes' },
  '8-10': { total: 'seis', porCanteiro: 'duas sementes' },
};

/** Todos os textos que a criança ouve ou lê numa definição de aventura. */
function textosDe(def) {
  const out = [];
  for (const e of def.etapas) {
    for (const campo of ['texto', 'fala', 'dica', 'reforco']) if (e[campo]) out.push(e[campo]);
    for (const a of e.aprendizados ?? []) out.push(a);
    for (const o of e.opcoes ?? []) out.push(o.rotulo);
  }
  return out;
}

function todasAsAventuras() {
  const defs = [PARQUE_COM_SEDE];
  for (const band of BANDS) {
    defs.push(criarHortaEscola(band), criarHortaEscola(band, { repetida: true }));
  }
  return defs;
}

// ------------------------------------------------- (a) pergunta da faixa 6–7

test('(a) faixa 6–7: pergunta entre a chegada ao MERCADO e a coleta', () => {
  const def = criarHortaEscola('6-7');
  const ids = def.etapas.map((e) => e.id);
  const i = ids.indexOf('quantas-sementes');
  assert.ok(i > 0, 'a etapa existe');
  assert.equal(ids[i - 1], 'ir-ao-mercado');
  assert.equal(ids[i + 1], 'pegar-sementes');

  const { total } = HORTA_BANDS['6-7'];
  const p = criarHortaEscola('6-7', { random: () => 0.5 }).etapas[i];
  assert.equal(p.tipo, 'pergunta');
  assert.equal(p.texto, 'Dois canteiros vão receber duas sementes cada. Quantas sementes precisamos levar?');
  assert.deepEqual(p.opcoes.map((o) => o.id), [total - 1, total, total + 1].map(String));
  assert.deepEqual(p.opcoes.map((o) => o.rotulo), ['3', '4', '5']);
  assert.deepEqual(p.opcoes.map((o) => [...o.emoji].length), [3, 4, 5], 'desenho da quantidade');
  assert.deepEqual(p.opcoes.filter((o) => o.correta).map((o) => o.id), [String(total)]);
  assert.equal(p.reforco, 'Vamos contar de novo? Duas e mais duas.');
  assert.equal(p.dica, 'Conte duas sementes para um canteiro e duas para o outro.');
  for (const ajuda of [p.reforco, p.dica]) {
    assert.ok(!/quatro|\b4\b/i.test(ajuda), `a ajuda não entrega a resposta: ${ajuda}`);
  }
});

test('(a) cartas da 6–7: janela sorteada entre {2,3,4}, {3,4,5} e {4,5,6}, sempre crescente, com a certa', () => {
  const cartas = (random) =>
    criarHortaEscola('6-7', { random }).etapas.find((e) => e.id === 'quantas-sementes').opcoes;
  assert.deepEqual(cartas(() => 0).map((o) => o.id), ['2', '3', '4']);
  assert.deepEqual(cartas(() => 0.5).map((o) => o.id), ['3', '4', '5']);
  assert.deepEqual(cartas(() => 0.999).map((o) => o.id), ['4', '5', '6']);

  const janelas = new Set();
  for (let n = 0; n < 300; n += 1) {
    const opcoes = cartas(Math.random);
    const nums = opcoes.map((o) => Number(o.id));
    janelas.add(nums.join(','));
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b), 'ordem crescente');
    assert.deepEqual(opcoes.filter((o) => o.correta).map((o) => o.id), ['4'], 'a certa está sempre');
    assert.deepEqual(opcoes.map((o) => [...o.emoji].length), nums, 'desenho = número');
  }
  assert.deepEqual([...janelas].sort(), ['2,3,4', '3,4,5', '4,5,6'], 'as três janelas aparecem');
});

test('(a) faixas 3–5 e 8–10 não têm pergunta; só a 6–7 pede em HORTA_BANDS', () => {
  for (const band of ['3-5', '8-10']) {
    assert.equal(criarHortaEscola(band).etapas.some((e) => e.tipo === 'pergunta'), false, band);
  }
  assert.deepEqual(
    BANDS.filter((b) => HORTA_BANDS[b].perguntarTotal),
    ['6-7']
  );
});

test('(a) faixa 6–7 no motor: três erros revelam pela regra atual e a Horta segue', () => {
  const aventura = criarAventura(criarHortaEscola('6-7'));
  aventura.iniciar();
  aventura.enviar({ tipo: 'toque' });
  aventura.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  assert.equal(aventura.etapa().id, 'quantas-sementes');
  aventura.enviar({ tipo: 'respondeu', opcao: '3' });
  aventura.enviar({ tipo: 'respondeu', opcao: '5' });
  const revelou = aventura.enviar({ tipo: 'respondeu', opcao: '3' });
  assert.deepEqual(revelou.find((e) => e.tipo === 'revelar_resposta'), { tipo: 'revelar_resposta', opcao: '4' });
  aventura.enviar({ tipo: 'continuar' });
  assert.equal(aventura.etapa().id, 'pegar-sementes');
});

// ------------------------------------------------------ (b) Caderninho

test('(b) adesivo de número: só o número, sem pães, para qualquer origem', () => {
  const extenso = { 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis' };
  for (const [n, nome] of Object.entries(extenso)) {
    const c = conteudoDescoberta('contagens', n);
    const fato = `O Órbi conheceu o número ${nome} com você!`;
    assert.deepEqual(c, { numero: n, rotulo: nome.toUpperCase(), fato });
    assert.equal(falaDescoberta('contagens', n), fato);
    assert.ok(!/p[ãa]o|pãezinhos|🍞/i.test(JSON.stringify(c)), n);
  }
  assert.deepEqual(
    CATEGORIAS_CADERNINHO.find((c) => c.id === 'contagens').possiveis,
    ['2', '3', '4', '5'],
    'os números possíveis não mudam (sem "?" para o 6)'
  );
});

test('(b) Caderninho desenha o número grande no lugar do emoji', () => {
  const cad = ler('src/components/Caderninho.jsx');
  assert.match(cad, /c\.numero \?/);
  assert.match(cad, /className="cad-numero"/);
  assert.match(ler('src/styles.css'), /\.cad-numero\s*\{/);
});

// ------------------------------------------------------ (c) repetição

test('(c) primeira conclusão: adesivo e convite para ver os brotinhos', () => {
  for (const band of BANDS) {
    const fecho = resumoDe(criarHortaEscola(band));
    assert.equal(fecho.fala, 'A professora Lia agradeceu! Vamos ver os brotinhos nascendo?');
    assert.deepEqual(fecho.recompensas, ['ADESIVO: BROTO DA ESCOLA']);
  }
});

test('(c) repetição: celebra a ação, sem anunciar adesivo', () => {
  for (const band of BANDS) {
    const primeira = resumoDe(criarHortaEscola(band));
    const repetida = resumoDe(criarHortaEscola(band, { repetida: true }));
    assert.equal(repetida.fala, 'Você cuidou da horta de novo! A professora Lia agradeceu.');
    assert.deepEqual(repetida.recompensas, []);
    assert.deepEqual(repetida.aprendizados, primeira.aprendizados, 'as ações são as mesmas');
  }
  assert.equal(RECOMPENSA_HORTA, 'broto-da-escola');
});

function mesaLimpa() {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
}

function jogarAteOResumo(band) {
  const { total, beds } = HORTA_BANDS[band];
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  const painel = aventuraRuntime.estado().painel;
  if (painel?.tipo === 'pergunta') {
    enviarEventoAventura({ tipo: 'respondeu', opcao: String(total) });
  }
  for (let n = 0; n < total; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < beds; canteiro += 1) {
      while (true) {
        const cartao = cartaoDistribuir(aventuraRuntime.estado());
        if (!cartao || cartao.item !== item || cartao.canteiros[canteiro].cheio) break;
        enviarEventoAventura(eventoDoCanteiro(cartao, canteiro));
      }
    }
  }
}

test('(c) runtime: a primeira Horta entrega o adesivo; a seguinte segue o caminho de repetição', () => {
  mesaLimpa();
  for (const [vez, esperado] of [[1, ['ADESIVO: BROTO DA ESCOLA']], [2, []]]) {
    assert.equal(iniciarHortaEscola('3-5'), true, `começa (${vez}ª)`);
    jogarAteOResumo('3-5');
    const painel = aventuraRuntime.estado().painel;
    assert.equal(painel.tipo, 'resumo', `resumo (${vez}ª)`);
    assert.deepEqual(painel.recompensas, esperado, `recompensas (${vez}ª)`);
    enviarEventoAventura({ tipo: 'toque' });
    assert.equal(aventuraRuntime.estado().ativa, false);
  }
  assert.deepEqual(
    useGame.getState().recompensas.filter((r) => r === RECOMPENSA_HORTA),
    [RECOMPENSA_HORTA],
    'o adesivo entra uma vez só'
  );
  mesaLimpa();
});

test('(c) runtime: a faixa 6–7 passa pela pergunta e chega ao resumo', () => {
  mesaLimpa();
  assert.equal(iniciarHortaEscola('6-7'), true);
  jogarAteOResumo('6-7');
  assert.equal(aventuraRuntime.estado().painel?.tipo, 'resumo');
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  mesaLimpa();
});

// ------------------------------------------- flores do parque (como os brotos)

test('parque: a fala do resumo convida a ver as flores, que crescem ao fechar', () => {
  assert.equal(resumoDe(PARQUE_COM_SEDE).fala, 'Você cuidou do parque! Vamos ver as flores crescendo?');
});

test('flores: esperam o resumo fechar; prontas com a flag do save; não crescem de novo', () => {
  const base = { florida: true, floridaAoAbrir: false, jaCresceram: false, aventuraAtiva: true };
  assert.equal(floresCrescem({ ...base, florida: false, aventuraAtiva: false }), false, 'sem flag, botões');
  assert.equal(floresCrescem(base), false, 'resumo aberto: ainda não');
  assert.equal(floresCrescem({ ...base, aventuraAtiva: false }), true, 'resumo fechado: crescem');
  assert.equal(floresCrescem({ ...base, floridaAoAbrir: true }), true, 'flag do save: prontas');
  assert.equal(floresCrescem({ ...base, jaCresceram: true }), true, 'outra aventura não as encolhe');
  assert.equal(escalaInicialDasFlores(true), 1);
  assert.equal(escalaInicialDasFlores(false), ESCALA_BOTAO);
  assert.equal(POSICOES_FLORES.length, 8);
});

test('flores: cada uma cresce em torno da própria base (dívida 38), e sem animação vão direto', () => {
  const fonte = ler('src/components/FloresParque.jsx');
  assert.ok(!/<group ref=\{grupo\}>/.test(fonte), 'sem o grupo único na origem do mundo');
  assert.match(fonte, /grupos\.current/);
  assert.match(fonte, /floresCrescem\(/);
  assert.match(fonte, /useAdventure\(\)/);
  assert.match(fonte, /visual\.animacoes/);
  assert.match(fonte, /POSICOES_FLORES/);
});

// ------------------------------------------------------ (g) resumos

test('(g) parque: o resumo descreve a ação observada', () => {
  assert.deepEqual(resumoDe(PARQUE_COM_SEDE).aprendizados, [
    'O Órbi aprendeu que as plantas bebem água.',
    'Você buscou quatro baldes de água.',
    'Você foi ao porto e voltou ao parque.',
  ]);
});

test('(g) horta: buscou N saquinhos, colocou K semente(s), foi ao mercado e voltou à escola', () => {
  for (const band of BANDS) {
    const { total, porCanteiro } = ESPERADO[band];
    assert.deepEqual(resumoDe(criarHortaEscola(band)).aprendizados, [
      `Você buscou ${total} saquinhos de semente.`,
      `Você colocou ${porCanteiro} em cada canteiro.`,
      'Você foi ao mercado e voltou à escola.',
    ], band);
  }
});

test('(g) regra: nenhum texto põe "você" como sujeito de contou, sabe, conhece ou aprendeu', () => {
  for (const def of todasAsAventuras()) {
    for (const t of textosDe(def)) {
      assert.ok(!/\bvocê\s+(contou|sabe|conhece|aprendeu)\b/i.test(t), `${def.id}: "${t}"`);
    }
  }
});

// ------------------------------------------------------ (i) sem task

test('(i) HORTA_BANDS sem o campo task (dado morto)', () => {
  for (const band of BANDS) assert.equal('task' in HORTA_BANDS[band], false, band);
  assert.ok(!ler('src/school/horta.js').includes('task'));
});

test('(i) só faz pergunta quem espera resposta (pergunta, fala com botão, resumo)', () => {
  const respondem = (e) => e.tipo === 'pergunta' || e.tipo === 'resumo' || (e.tipo === 'fala' && e.botao);
  for (const def of todasAsAventuras()) {
    for (const e of def.etapas) {
      if (respondem(e)) continue;
      for (const campo of ['texto', 'fala', 'dica']) {
        assert.ok(!String(e[campo] ?? '').includes('?'), `${def.id}/${e.id}.${campo}: "${e[campo]}"`);
      }
    }
  }
});

// ------------------------------------------------------ (j) unidade

test('(j) cada saquinho carrega uma semente: coleta em saquinhos, plantio em sementes', () => {
  for (const band of BANDS) {
    const def = criarHortaEscola(band);
    const e = etapasPorId(def);
    const { total, porCanteiro } = ESPERADO[band];
    assert.equal(e['pegar-sementes'].quantidade, e.plantar.slots * e.plantar.porSlot, 'saquinhos = sementes plantadas');
    assert.equal(e['pegar-sementes'].texto, `Pegue ${total} saquinhos. Cada um tem uma semente.`);
    assert.equal(e.plantar.texto, `Plante ${porCanteiro} em cada canteiro.`);
    assert.ok(!/saquinho/.test(e.plantar.texto + e.plantar.dica), 'plantio fala em semente');
    for (const t of textosDe(def)) {
      assert.ok(!/\bsacos?\b/i.test(t), `sem "saco": "${t}"`);
    }
  }
});

// ------------------------------------------------------ (d) sacos

test('(d) sacos: 1,3×, contorno navy pelo avesso, amarrado coral, até 4 malhas, sem vertexColors', () => {
  assert.ok(SACO.escala >= 1.3, `escala ${SACO.escala}`);
  const fonte = ler('src/components/ItensAventura.jsx');
  const saco = fonte.slice(fonte.indexOf('function Saco('), fonte.indexOf('const VISUAL'));
  assert.ok((saco.match(/<mesh\b/g) ?? []).length <= 4, 'no máximo 4 malhas por saco');
  assert.match(saco, /side=\{THREE\.BackSide\}/);
  assert.match(saco, /PALETA3D\.contorno/);
  assert.match(saco, /TINTAS\.coral/);
  assert.match(saco, /scale=\{escala\}/);
  assert.ok(!/vertexColors/.test(fonte));
  assert.match(fonte, /RAIO_COLETA/, 'o raio de coleta vem de itens.js');
  assert.ok(!/2\.7\s*\*\s*2\.7/.test(fonte), 'sem raio repetido no componente');
});

test('(d) oclusão: com o carro fora do raio de coleta, nenhum saco esconde mais de 25% dele', () => {
  const off = CAMERA_2_5D.offset;
  const n = Math.hypot(...off);
  const D = off.map((v) => v / n);
  // raio até a câmera contra um cilindro vertical (eixo em x,z; raio r; de y0 a y1)
  const bate = (o, c) => {
    let ta = (c.y0 - o[1]) / D[1];
    let tb = (c.y1 - o[1]) / D[1];
    if (ta > tb) [ta, tb] = [tb, ta];
    ta = Math.max(ta, 1e-4);
    if (ta > tb) return false;
    const px = o[0] - c.x;
    const pz = o[2] - c.z;
    const A = D[0] * D[0] + D[2] * D[2];
    const B = 2 * (px * D[0] + pz * D[2]);
    const t = Math.min(Math.max(-B / (2 * A), ta), tb);
    const dx = px + t * D[0];
    const dz = pz + t * D[2];
    return dx * dx + dz * dz <= c.r * c.r;
  };
  const pontos = (cx, cz, rumo) => {
    const c = Math.cos(rumo);
    const s = Math.sin(rumo);
    const pts = [];
    for (const fx of [-0.9, -0.45, 0, 0.45, 0.9]) {
      for (const fy of [0.3, 0.55, 0.8]) {
        for (const fz of [-1.75, -0.875, 0, 0.875, 1.75]) {
          pts.push([cx + fx * c + fz * s, fy, cz - fx * s + fz * c]);
        }
      }
    }
    return pts;
  };
  let pior = 0;
  let medidas = 0;
  for (const pos of ITENS_POR_ETAPA['pegar-sementes'].posicoes) {
    const forma = formaDoSaco(pos);
    const [sx, sz] = pos;
    for (let x = sx - 8; x <= sx + 8; x += 0.25) {
      for (let z = sz - 8; z <= sz + 8; z += 0.25) {
        if (Math.hypot(x - sx, z - sz) < RAIO_COLETA) continue;
        for (const rumo of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
          const pts = pontos(x, z, rumo);
          const escondidos = pts.filter((p) => forma.some((c) => bate(p, c))).length;
          pior = Math.max(pior, escondidos / pts.length);
          medidas += 1;
        }
      }
    }
  }
  assert.ok(medidas > 50000, `posições medidas: ${medidas}`);
  assert.ok(pior <= 0.25, `pior caso: ${(pior * 100).toFixed(1)}% do carro escondido`);
  // a forma usada na conta cobre o saco inteiro: base no chão, topo do broto
  const [corpo, broto] = formaDoSaco([0, 0]);
  assert.equal(corpo.y0, 0);
  assert.ok(broto.y1 >= (SACO.broto.y + SACO.broto.raio * SACO.broto.achatado) * SACO.escala - 1e-9);
});
