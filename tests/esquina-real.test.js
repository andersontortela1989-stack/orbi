import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as THREE from 'three';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { CALCADA_POR_LADO } from '../src/city/geometria.js';
import { CAMINHOS, LARGURA_RUA_BORDA, TENSAO_RUA } from '../src/city/ruas.js';
import { LIMITE_FACHADA } from '../src/city/identidade.js';
import { ITENS_POR_ETAPA } from '../src/adventure/itens.js';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../src/brand/paleta3d.js';
import { SLUGS_ESQUINA, lerEstilo } from '../src/visual/estilo.js';
import { criarEsquina } from '../src/visual/esquina/esquina.js';

// A esquina é uma fábrica sem imports (ver o cabeçalho de esquina.js): aqui
// recebe as mesmas dependências que o Game.jsx passa.
const {
  ALTURA_LIVRE_TOLDO,
  CONTATO,
  PORTA_MERCADO,
  PROJECAO_TOLDO,
  RODAS_DO_CARRO,
  letreirosDaEsquina,
  limitesDaPeca,
  malhasDaEsquina,
  montarMalhaEsquina,
  orcamentoDaEsquina,
  pecasDaPadaria,
  pecasDoContato,
  pecasDoMercado,
} = criarEsquina({
  THREE, PALETA3D, TINTAS, SOMBRA_SOLIDA, SLUGS_ESQUINA,
  LOTES: Object.fromEntries(SLUGS_ESQUINA.map((s) => [s, TODOS_PREDIOS.find((p) => p.slug === s)])),
});

/**
 * PILOTO DA ESQUINA (PADARIA + MERCADO) em `?estilo=real` — 19/11/2026.
 *
 * Mesma câmera, mesmo trajeto, mesmos colisores e sensores do estilo padrão;
 * o que muda é o DESENHO dos dois prédios e das calçadas. Todo o código
 * visual do piloto vem num pacote carregado SOB DEMANDA: quem joga no estilo
 * padrão não baixa nada dele.
 *
 * Zonas (coordenadas do lote: x/z do centro do prédio, y do chão):
 *   chao     — calçada, meio-fio, juntas e rebaixo: até a borda da calçada,
 *              no máximo 0,3 de altura;
 *   corpo    — volume do prédio, dentro da pegada w × l (o colisor);
 *   fachada  — no máximo LIMITE_FACHADA para fora da pegada;
 *   alta     — toldo e beiral: acima da altura do carro;
 *   telhado  — acima do corpo, dentro da pegada (o pão do telhado inclusive).
 * Camadas: opaco, brilho (vitrine acesa), contorno e sombra (simulada).
 */

const PREDIO = new Map(TODOS_PREDIOS.map((p) => [p.slug, p]));
const PECAS = {
  PADARIA: pecasDaPadaria(PREDIO.get('PADARIA').size),
  MERCADO: pecasDoMercado(PREDIO.get('MERCADO').size),
};
const ZONAS = new Set(['chao', 'corpo', 'fachada', 'alta', 'telhado']);
const CAMADAS = new Set(['opaco', 'brilho', 'contorno', 'sombra']);
const TOL = 1e-6;
const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const porId = (slug, prefixo) => PECAS[slug].filter((p) => p.id.startsWith(prefixo));

// ------------------------------------------------------------ carregamento

test('a esquina vale só em ?estilo=real, para a PADARIA e o MERCADO', () => {
  assert.equal(lerEstilo('?estilo=real'), 'real');
  assert.equal(lerEstilo('?medir=1'), 'atual');
  assert.deepEqual([...SLUGS_ESQUINA], ['PADARIA', 'MERCADO']);
});

test('o código visual do piloto vem sob demanda: nada dele no pacote do estilo padrão', () => {
  const jogo = ler('src/components/Game.jsx');
  assert.match(jogo, /lazy\(\(\) =>\s*import\('\.\/EsquinaReal\.jsx'\)/, 'importação dinâmica');
  // o pacote do piloto não importa nada do jogo (senão o pacote do jogo
  // exportaria nomes a mais e o pacote inicial cresceria): só um ao outro
  const importsDe = (p) => [...ler(p).matchAll(/^import\s(?:[^'";]*?\sfrom\s)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual(importsDe('src/components/EsquinaReal.jsx'), ['../visual/esquina/esquina.js']);
  assert.deepEqual(importsDe('src/visual/esquina/esquina.js'), []);
  assert.doesNotMatch(ler('src/components/EsquinaReal.jsx'), /<[A-Za-z]/, 'sem JSX (o runtime do JSX é importado)');
  assert.doesNotMatch(jogo, /import \* as THREE/, 'three pelo nome: o pacote do jogo continua enxuto');
  assert.match(jogo, /\{estiloReal && \(\s*<Suspense fallback=\{null\}>\s*<EsquinaReal targetRef=\{carRef\} \/>/, 'só monta com ?estilo=real');
  // ninguém importa o piloto de forma estática
  const fontes = (pasta) =>
    readdirSync(new URL(`../${pasta}`, import.meta.url), { recursive: true })
      .filter((f) => /\.(js|jsx)$/.test(f))
      .map((f) => [`${pasta}/${f}`.replace(/\\/g, '/'), ler(`${pasta}/${f}`)]);
  for (const [arquivo, codigo] of fontes('src')) {
    if (arquivo.includes('/esquina/') || arquivo.endsWith('EsquinaReal.jsx')) continue;
    // caminhos dos imports ESTÁTICOS (`import ... from '…'` e `import '…'`)
    const estaticos = [...codigo.matchAll(/^import\s(?:[^'";]*?\sfrom\s)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
    for (const caminho of estaticos) {
      assert.doesNotMatch(caminho, /EsquinaReal|visual\/esquina\//, `${arquivo} importa o piloto de forma estática`);
    }
  }
  // o estudo anterior (V1) não é mais montado: sai do pacote do jogo
  const cidade = ler('src/components/City.jsx');
  assert.doesNotMatch(cidade, /PredioReal|RuaReal|predio-real/);
  assert.doesNotMatch(jogo, /import \{ PreCompilar \}/);
});

test('colisores: os mesmos do estilo padrão (pegada do lote), sem colisor novo', () => {
  const cidade = ler('src/components/City.jsx');
  // no piloto, a cidade ainda monta o colisor do lote, igual ao do Building
  assert.match(cidade, /SLUGS_ESQUINA\.includes\(p\.slug\)/);
  assert.match(cidade, /position=\{\[p\.pos\[0\], p\.size\[1\] \/ 2, p\.pos\[1\]\]\}/);
  assert.match(cidade, /<CuboidCollider args=\{\[p\.size\[0\] \/ 2, p\.size\[1\] \/ 2, p\.size\[2\] \/ 2\]\} \/>/);
  assert.match(ler('src/components/Building.jsx'), /<CuboidCollider args=\{\[w \/ 2, h \/ 2, l \/ 2\]\} \/>/);
  const esquina = ler('src/components/EsquinaReal.jsx');
  assert.doesNotMatch(esquina, /RigidBody|Collider/, 'o desenho não cria colisor');
});

// ------------------------------------------------------------ contrato

test('toda peça tem zona, camada, cor e fica acima do chão', () => {
  for (const [slug, pecas] of Object.entries(PECAS)) {
    assert.ok(pecas.length > 0, slug);
    const ids = new Set();
    for (const p of pecas) {
      assert.ok(ZONAS.has(p.zona), `${slug}/${p.id}: zona ${p.zona}`);
      assert.ok(CAMADAS.has(p.camada), `${slug}/${p.id}: camada ${p.camada}`);
      assert.match(p.cor, /^#[0-9a-f]{6}$/i, `${slug}/${p.id}: cor`);
      assert.ok(!ids.has(p.id), `${slug}/${p.id}: id repetido`);
      ids.add(p.id);
      assert.ok(limitesDaPeca(p).min[1] >= -TOL, `${slug}/${p.id} abaixo do chão`);
    }
  }
});

test('contrato por zona: corpo na pegada, fachada rasa, chão baixo, alta acima do carro', () => {
  for (const [slug, pecas] of Object.entries(PECAS)) {
    const [w, h, l] = PREDIO.get(slug).size;
    for (const p of pecas) {
      const { min, max } = limitesDaPeca(p);
      const fora = Math.max(-w / 2 - min[0], max[0] - w / 2, -l / 2 - min[2], max[2] - l / 2);
      const ate = (limite) => assert.ok(fora <= limite + TOL, `${slug}/${p.id} (${p.zona}) sai ${fora.toFixed(2)} da pegada`);
      if (p.zona === 'corpo') ate(0);
      if (p.zona === 'fachada') ate(LIMITE_FACHADA);
      if (p.zona === 'telhado') {
        ate(0);
        assert.ok(min[1] >= h - TOL, `${slug}/${p.id} abaixo do telhado`);
      }
      if (p.zona === 'chao') {
        ate(CALCADA_POR_LADO);
        assert.ok(max[1] <= 0.3 + TOL, `${slug}/${p.id} alto demais para o chão (${max[1].toFixed(2)})`);
      }
      if (p.zona === 'alta') {
        ate(CALCADA_POR_LADO);
        assert.ok(min[1] >= ALTURA_LIVRE_TOLDO - TOL, `${slug}/${p.id} baixo demais (${min[1].toFixed(2)})`);
      }
    }
  }
});

test('nada do piloto sobre a rua — nem o chão — no trecho entre os lotes e na curva', () => {
  const meiaRua = LARGURA_RUA_BORDA / 2;
  const amostras = CAMINHOS.flatMap((caminho) =>
    new THREE.CatmullRomCurve3(caminho.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', TENSAO_RUA)
      .getSpacedPoints(600)
      .map((p) => [p.x, p.z])
  );
  for (const [slug, pecas] of Object.entries(PECAS)) {
    const [px, pz] = PREDIO.get(slug).pos;
    for (const p of pecas) {
      const { min, max } = limitesDaPeca(p);
      for (const [rx, rz] of amostras) {
        // perto da esquina, vale também para o chão: o leito fica livre
        if (p.zona === 'chao' && !(rx > 30 && rx < 60 && rz > 18 && rz < 40)) continue;
        const dx = Math.max(px + min[0] - rx, 0, rx - (px + max[0]));
        const dz = Math.max(pz + min[2] - rz, 0, rz - (pz + max[2]));
        assert.ok(Math.hypot(dx, dz) > meiaRua - TOL, `${slug}/${p.id} sobre a rua em ${rx.toFixed(1)},${rz.toFixed(1)}`);
      }
    }
  }
});

test('os saquinhos da Horta seguem livres e longe das caixas de fruta', () => {
  const [mx, mz] = PREDIO.get('MERCADO').pos;
  const caixas = porId('MERCADO', 'caixa-fruta-').filter((p) => /^caixa-fruta-\d$/.test(p.id));
  for (const [sx, sz] of ITENS_POR_ETAPA['pegar-sementes'].posicoes) {
    for (const [slug, pecas] of Object.entries(PECAS)) {
      const [px, pz] = PREDIO.get(slug).pos;
      for (const p of pecas.filter((q) => q.zona !== 'chao' && q.camada !== 'sombra')) {
        const { min, max } = limitesDaPeca(p);
        const dentro = sx > px + min[0] && sx < px + max[0] && sz > pz + min[2] && sz < pz + max[2];
        assert.ok(!dentro, `saquinho em ${sx},${sz} dentro de ${slug}/${p.id}`);
      }
    }
    for (const c of caixas) {
      const d = Math.hypot(mx + c.pos[0] - sx, mz + c.pos[2] - sz);
      assert.ok(d >= 3, `caixa ${c.id} a ${d.toFixed(2)} do saquinho ${sx},${sz}`);
    }
  }
});

// ------------------------------------------------------------ PADARIA

test('PADARIA: pão grande no telhado, com volume, 3 cortes e contorno', () => {
  const [, h] = PREDIO.get('PADARIA').size;
  const [pao] = porId('PADARIA', 'pao-telhado');
  assert.ok(pao, 'pão do telhado');
  assert.equal(pao.zona, 'telhado');
  assert.equal(pao.forma, 'esfera');
  const { min, max } = limitesDaPeca(pao);
  assert.ok(max[0] - min[0] >= 4 && max[2] - min[2] >= 2.5, 'pão grande, visível no celular');
  assert.ok(max[1] - h >= 1.5, `pão com volume (${(max[1] - h).toFixed(2)} acima do corpo)`);
  const cortes = porId('PADARIA', 'pao-corte-');
  assert.equal(cortes.length, 3, '3 cortes');
  for (const c of cortes) {
    assert.notEqual(c.cor.toLowerCase(), pao.cor.toLowerCase(), 'o corte tem outra cor que a casca');
    assert.ok(limitesDaPeca(c).max[1] > max[1] - 0.6, `${c.id} no alto do pão`);
  }
  assert.ok(PECAS.PADARIA.some((p) => p.id === 'contorno-pao-telhado' && p.camada === 'contorno'));
  assert.equal(pao.cor, PALETA3D.pao.casca);
});

test('PADARIA: vitrines nas duas faces visíveis, com moldura, prateleiras, pães e luz', () => {
  const [w, , l] = PREDIO.get('PADARIA').size;
  for (const face of ['frente', 'lado']) {
    const vidro = porId('PADARIA', `vitrine-${face}`).filter((p) => p.camada === 'brilho');
    assert.ok(vidro.length >= 1, `vitrine ${face} acesa`);
    assert.ok(porId('PADARIA', `moldura-${face}`).length >= 4, `moldura ${face}`);
    assert.ok(porId('PADARIA', `prateleira-${face}`).length >= 1, `prateleira ${face}`);
    assert.ok(porId('PADARIA', `pao-vitrine-${face}`).length >= 3, `pães ${face}`);
  }
  // a frente é +Z e o lado é +X: as faces que a câmera vê
  for (const p of porId('PADARIA', 'moldura-frente')) assert.ok(limitesDaPeca(p).max[2] >= l / 2 - TOL);
  for (const p of porId('PADARIA', 'moldura-lado')) assert.ok(limitesDaPeca(p).max[0] >= w / 2 - TOL);
});

test('PADARIA: porta e placa na frente (+Z); placa legível', () => {
  const [, , l] = PREDIO.get('PADARIA').size;
  const porta = porId('PADARIA', 'porta');
  assert.ok(porta.length >= 1);
  assert.ok(porta.every((p) => limitesDaPeca(p).max[2] <= l / 2 + TOL && limitesDaPeca(p).max[2] >= l / 2 - 1.0));
  const placa = letreirosDaEsquina().find((t) => t.slug === 'PADARIA');
  assert.equal(placa.texto, 'PADARIA');
  assert.ok(placa.tamanho >= 0.9, 'fonte do tamanho das placas do estilo padrão');
  assert.ok(placa.posicao[2] > PREDIO.get('PADARIA').pos[1] + l / 2, 'na frente da fachada');
});

// ------------------------------------------------------------ MERCADO

test('MERCADO: fachada amarela e identidade verde (telhado e placa)', () => {
  const corpo = porId('MERCADO', 'corpo');
  assert.ok(corpo.length >= 1 && corpo.every((p) => p.cor === PALETA3D.predios.MERCADO));
  assert.ok(porId('MERCADO', 'telhado-verde').some((p) => p.cor === TINTAS.grass));
  assert.ok(porId('MERCADO', 'placa').some((p) => p.cor === TINTAS.grassDeep));
  const placa = letreirosDaEsquina().find((t) => t.slug === 'MERCADO');
  assert.equal(placa.texto, 'MERCADO');
  assert.ok(placa.tamanho >= 0.9);
});

test('MERCADO: toldo curto, acima do carro, listrado e com contorno (contraste com o carro verde)', () => {
  const [, , l] = PREDIO.get('MERCADO').size;
  const toldo = porId('MERCADO', 'toldo').filter((p) => p.camada === 'opaco');
  assert.ok(toldo.length >= 5, 'listras');
  const cores = new Set(toldo.map((p) => p.cor));
  assert.ok(cores.has(TINTAS.grassDeep) && cores.has(TINTAS.white), 'verde-escuro e branco');
  assert.ok(!cores.has(TINTAS.grass), 'nenhuma listra da cor do carro CAPIM');
  for (const p of toldo) {
    const { min, max } = limitesDaPeca(p);
    assert.ok(min[1] >= ALTURA_LIVRE_TOLDO - TOL, `${p.id} baixo`);
    assert.ok(max[2] - l / 2 <= PROJECAO_TOLDO + TOL, `${p.id} projeta ${(max[2] - l / 2).toFixed(2)}`);
  }
  assert.ok(ALTURA_LIVRE_TOLDO >= 2.6 && PROJECAO_TOLDO <= 1.0);
  assert.ok(porId('MERCADO', 'contorno-toldo').length >= 1);
});

test('MERCADO: entrada visível no meio da frente e vitrine lateral acesa', () => {
  const [w, , l] = PREDIO.get('MERCADO').size;
  const entrada = porId('MERCADO', 'entrada').filter((p) => p.camada === 'brilho');
  assert.ok(entrada.length >= 1, 'entrada acesa');
  for (const p of entrada) {
    const { min, max } = limitesDaPeca(p);
    assert.ok(Math.abs((min[0] + max[0]) / 2 - PORTA_MERCADO.x) < 0.3, 'entrada centrada na porta');
    assert.ok(max[2] <= l / 2 + TOL, 'entrada dentro da pegada');
    assert.ok(max[1] <= ALTURA_LIVRE_TOLDO, 'abaixo do toldo');
  }
  const vitrine = porId('MERCADO', 'vitrine-lado').filter((p) => p.camada === 'brilho');
  assert.ok(vitrine.length >= 1);
  assert.ok(vitrine.every((p) => limitesDaPeca(p).max[0] <= w / 2 + TOL && limitesDaPeca(p).max[0] >= w / 2 - 0.6));
  assert.ok(porId('MERCADO', 'prateleira-lado').length >= 2);
  assert.ok(porId('MERCADO', 'produto-').length >= 6);
});

test('MERCADO: duas caixas baixas de fruta junto à fachada, dentro da pegada (sem colisor novo)', () => {
  const [w, , l] = PREDIO.get('MERCADO').size;
  const caixas = PECAS.MERCADO.filter((p) => /^caixa-fruta-\d$/.test(p.id));
  assert.equal(caixas.length, 2);
  for (const c of caixas) {
    const { min, max } = limitesDaPeca(c);
    assert.ok(max[1] <= 0.8, `${c.id} baixa (${max[1].toFixed(2)})`);
    assert.ok(max[2] <= l / 2 + TOL && max[2] >= l / 2 - 0.2, `${c.id} rente à fachada, dentro da pegada`);
    assert.ok(Math.abs(min[0]) <= w / 2 && Math.abs(max[0]) <= w / 2);
    const frutas = PECAS.MERCADO.filter((p) => p.id.startsWith(`fruta-${c.id.slice(-1)}-`));
    assert.ok(frutas.length >= 6, `${c.id} cheia de frutas`);
    for (const f of frutas) {
      assert.ok(limitesDaPeca(f).max[1] <= 0.8 + TOL);
      assert.ok(limitesDaPeca(f).max[2] <= l / 2 + TOL, 'fruta dentro da pegada');
      assert.notEqual(f.cor, PALETA3D.moeda, 'fruta não parece moeda');
    }
  }
  // diferentes dos saquinhos: caixa de madeira retangular, não saco
  assert.ok(caixas.every((c) => c.forma === 'caixa'));
});

test('MERCADO: rebaixo da calçada alinhado à porta e meio-fio com espessura', () => {
  const [mx] = PREDIO.get('MERCADO').pos;
  const [, , l] = PREDIO.get('MERCADO').size;
  const [rebaixo] = porId('MERCADO', 'rebaixo');
  assert.ok(rebaixo, 'rebaixo');
  const { min, max } = limitesDaPeca(rebaixo);
  assert.ok(Math.abs((min[0] + max[0]) / 2 - PORTA_MERCADO.x) < 0.3, 'alinhado à porta');
  assert.ok(max[2] >= l / 2 + CALCADA_POR_LADO - 0.35, 'na borda da calçada, do lado da rua');
  assert.ok(max[1] < 0.16, 'mais baixo que o meio-fio');
  for (const slug of SLUGS_ESQUINA) {
    const meioFio = porId(slug, 'meio-fio');
    assert.ok(meioFio.length >= 4, `${slug}: meio-fio`);
    for (const m of meioFio) {
      const lim = limitesDaPeca(m);
      assert.ok(Math.min(lim.max[0] - lim.min[0], lim.max[2] - lim.min[2]) >= 0.25 - TOL, `${slug}/${m.id} fino demais`);
      assert.ok(lim.max[1] >= 0.2 && lim.max[1] <= 0.3, `${slug}/${m.id} altura`);
    }
    const juntas = porId(slug, 'junta');
    assert.ok(juntas.length >= 10, `${slug}: juntas do piso`);
    assert.ok(juntas.every((j) => Math.min(...j.tam.filter((_, i) => i !== 1)) <= 0.06), `${slug}: juntas discretas`);
  }
  // o ponto de parada (diante da porta, no leito) fica livre
  assert.ok(mx + PORTA_MERCADO.x > 0);
});

// ------------------------------------------------------------ luz e sombra

test('sombras simuladas: prédios no piso e toldo na fachada; sem sombra em tempo real', () => {
  for (const slug of SLUGS_ESQUINA) assert.ok(porId(slug, 'sombra-predio').some((p) => p.camada === 'sombra'), slug);
  assert.ok(porId('MERCADO', 'sombra-toldo').some((p) => p.camada === 'sombra'));
  const codigo = ler('src/components/EsquinaReal.jsx');
  assert.doesNotMatch(codigo, /castShadow|receiveShadow|shadows|EffectComposer|SSAO/);
});

test('mancha de contato sob os 4 pneus, que acompanha o carro (só lê a posição)', () => {
  assert.equal(RODAS_DO_CARRO.length, 4);
  const codigo = ler('src/components/EsquinaReal.jsx');
  assert.match(codigo, /useFrame\(/);
  assert.match(codigo, /targetRef\.current/);
  assert.match(codigo, /\.translation\(\)/);
  assert.match(codigo, /\.rotation\(\)/);
  assert.doesNotMatch(codigo, /setTranslation|setLinvel|applyImpulse/, 'não mexe na física');
});

test('Modo Tranquilo: luz estável, nada pulsa; a vitrine só fica mais suave', () => {
  const codigo = ler('src/components/EsquinaReal.jsx');
  assert.doesNotMatch(codigo, /elapsedTime|Math\.sin|performance\.now|Date\.now/, 'nada depende do tempo');
  assert.match(codigo, /tranquilo \? COR_BRILHO_TRANQUILO : COR_BRILHO/);
  // o único useFrame é o da mancha de contato
  assert.equal(codigo.match(/useFrame\(/g).length, 1);
});

// ------------------------------------------------------------ custo

test('montarMalhaEsquina: escala por eixo e contagem de triângulos', () => {
  const caixa = montarMalhaEsquina([{ forma: 'caixa', pos: [0, 0, 0], tam: [1, 1, 1], esc: [2, 1, 1], cor: '#ffffff' }]);
  assert.equal(caixa.triangulos, 12);
  const xs = [];
  for (let i = 0; i < caixa.posicoes.length; i += 3) xs.push(caixa.posicoes[i]);
  assert.equal(Math.max(...xs), 1, 'escala 2 em x');
  const esfera = montarMalhaEsquina([{ forma: 'esfera', pos: [0, 0, 0], raio: 1, lados: 8, aneis: 6, cor: '#ffffff' }]);
  assert.equal(esfera.triangulos, 2 * 8 * 5);
});

test('orçamento da esquina: poucas chamadas de desenho para os dois prédios', () => {
  const { chamadas, triangulos } = orcamentoDaEsquina();
  const malhas = malhasDaEsquina();
  assert.deepEqual(Object.keys(malhas).sort(), ['brilho', 'contorno', 'opaco', 'sombra']);
  assert.ok(chamadas <= 8, `chamadas ${chamadas}`);
  assert.ok(triangulos <= 16000, `triângulos ${triangulos}`);
});

test('orçamento por lugar (regra 7 do estilo real): até 6 chamadas e 3.000 triângulos, sem exceção', () => {
  // docs/PLANO_MESTRE.md, "Estilo real — regras de legibilidade", regra 7.
  // Chamadas do lugar: as malhas mescladas em que ele tem peças, mais o
  // letreiro (2 triângulos por letra, como em orcamentoDaEsquina).
  for (const slug of SLUGS_ESQUINA) {
    const letreiro = letreirosDaEsquina().find((t) => t.slug === slug);
    const triangulos = montarMalhaEsquina(PECAS[slug]).triangulos + letreiro.texto.length * 2;
    const chamadas = new Set(PECAS[slug].map((p) => p.camada)).size + 1;
    assert.ok(triangulos <= 3000, `${slug}: ${triangulos} triângulos (regra: até 3.000)`);
    assert.ok(chamadas <= 6, `${slug}: ${chamadas} chamadas (regra: até 6)`);
  }
});

// ------------------------------------------------- acabamento (20/11/2026)
// Avaliado na câmera do jogo (1280×720 e 740×360): vitrines mais altas,
// portas com recuo visível, pães grandes, produtos simplificados, a faixa
// de sombra do toldo, a mancha sob os pneus e a pré-compilação.

const alturaDe = (p) => { const { min, max } = limitesDaPeca(p); return max[1] - min[1]; };
const comprimentoDe = (p) => { const { min, max } = limitesDaPeca(p); return Math.max(max[0] - min[0], max[2] - min[2]); };
const peca = (slug, id) => PECAS[slug].find((p) => p.id === id);

test('vitrines mais altas, com menos parede acima; a altura dos prédios não muda', () => {
  const vitrines = { PADARIA: ['frente-1', 'frente-2', 'lado'], MERCADO: ['lado'] };
  for (const [slug, nomes] of Object.entries(vitrines)) {
    const [, h] = PREDIO.get(slug).size;
    assert.ok(Math.abs(limitesDaPeca(peca(slug, 'corpo')).max[1] - h) < TOL, `${slug}: altura do prédio`);
    for (const v of nomes) {
      const vidro = peca(slug, `vitrine-${v}`);
      assert.ok(alturaDe(vidro) >= 2.6, `${slug}/vitrine-${v}: ${alturaDe(vidro).toFixed(2)} de altura`);
      assert.ok(limitesDaPeca(vidro).max[1] >= 3.4, `${slug}/vitrine-${v}: parede demais acima`);
    }
  }
});

test('PADARIA: em cada vitrine, uma prateleira, poucos pães GRANDES e o fundo quente estável', () => {
  for (const v of ['frente-1', 'frente-2', 'lado']) {
    const prateleiras = porId('PADARIA', `prateleira-${v}-`);
    assert.equal(prateleiras.length, 1, `uma prateleira em ${v}`);
    const topo = limitesDaPeca(prateleiras[0]).max[1];
    const paes = porId('PADARIA', `pao-vitrine-${v}-`);
    assert.ok(paes.length >= 2 && paes.length <= 3, `${paes.length} pães em ${v}`);
    for (const p of paes) {
      assert.ok(comprimentoDe(p) >= 0.8, `${p.id}: ${comprimentoDe(p).toFixed(2)} de comprimento (pequeno no celular)`);
      assert.ok(alturaDe(p) >= 0.45, `${p.id}: baixo`);
      assert.ok(Math.abs(limitesDaPeca(p).min[1] - topo) <= 0.05, `${p.id}: apoiado na prateleira`);
    }
    const vidro = peca('PADARIA', `vitrine-${v}`);
    assert.equal(vidro.camada, 'brilho', 'fundo aceso sem iluminação: estável');
    const c = new THREE.Color(vidro.cor);
    assert.ok(c.r > c.g && c.g > c.b, 'fundo quente');
  }
});

test('PADARIA: a placa fica acima das vitrines, sem cobri-las', () => {
  const [, h] = PREDIO.get('PADARIA').size;
  const topoVitrines = Math.max(...porId('PADARIA', 'moldura-frente-').map((p) => limitesDaPeca(p).max[1]));
  for (const p of porId('PADARIA', 'placa')) {
    const { min, max } = limitesDaPeca(p);
    assert.ok(min[1] >= topoVitrines - TOL, `${p.id} cobre a vitrine (${min[1].toFixed(2)} < ${topoVitrines.toFixed(2)})`);
    assert.ok(max[1] <= h, `${p.id} acima do prédio`);
  }
  const { min, max } = limitesDaPeca(peca('PADARIA', 'placa'));
  const y = letreirosDaEsquina().find((t) => t.slug === 'PADARIA').posicao[1];
  assert.ok(y > min[1] && y < max[1], 'letreiro dentro da placa');
});

test('portas com recuo visível: fundo afastado da fachada, laterais em outra cor e soleira', () => {
  const casos = [
    ['PADARIA', 'porta', 'recuo-porta-', 'soleira-porta'],
    ['MERCADO', 'entrada-vidro', 'recuo-entrada-', 'soleira-entrada'],
  ];
  for (const [slug, idPorta, prefixoRecuo, idSoleira] of casos) {
    const f = PREDIO.get(slug).size[2] / 2;
    const zPorta = limitesDaPeca(peca(slug, idPorta)).max[2];
    assert.ok(f - zPorta >= 0.6, `${slug}: recuo da porta ${(f - zPorta).toFixed(2)}`);
    const laterais = porId(slug, prefixoRecuo);
    assert.ok(laterais.length >= 2, `${slug}: laterais do recuo`);
    for (const p of laterais) {
      assert.notEqual(p.cor.toLowerCase(), PALETA3D.predios[slug].toLowerCase(), `${p.id}: cor da parede (o recuo some)`);
      const { min, max } = limitesDaPeca(p);
      assert.ok(min[2] <= zPorta + 0.1 && max[2] >= f - 0.05, `${p.id} não cobre a fundura do recuo`);
    }
    const soleira = peca(slug, idSoleira);
    assert.ok(soleira, `${slug}: soleira`);
    assert.ok(limitesDaPeca(soleira).max[1] <= 0.3, `${slug}: soleira baixa`);
  }
});

test('MERCADO: faixa de sombra do toldo na parede, marcando a entrada', () => {
  const f = PREDIO.get('MERCADO').size[2] / 2;
  const faixa = porId('MERCADO', 'sombra-toldo-parede');
  assert.ok(faixa.length >= 1, 'faixa de sombra');
  const toldo = porId('MERCADO', 'toldo-').filter((p) => p.camada === 'opaco' && !p.id.includes('sanefa'));
  const xsToldo = toldo.flatMap((p) => [limitesDaPeca(p).min[0], limitesDaPeca(p).max[0]]);
  const topoToldo = Math.max(...toldo.map((p) => limitesDaPeca(p).max[1]));
  const vao = ['esquerda', 'direita', 'cima'].map((lado) => limitesDaPeca(peca('MERCADO', `moldura-entrada-${lado}`)));
  const [e0, e1, topoEntrada] = [vao[0].min[0], vao[1].max[0], vao[2].max[1]];
  for (const p of faixa) {
    assert.equal(p.camada, 'sombra');
    const { min, max } = limitesDaPeca(p);
    assert.ok(min[2] >= f - TOL && max[2] <= f + 0.15, `${p.id} fora da parede`);
    assert.ok(max[1] <= topoToldo + TOL, `${p.id} acima do toldo`);
    // sobre o vão da entrada, só acima dele: a sombra não flutua na frente da porta
    if (min[0] < e1 - TOL && max[0] > e0 + TOL) assert.ok(min[1] >= topoEntrada - TOL, `${p.id} na frente da entrada`);
  }
  const lim = faixa.map(limitesDaPeca);
  assert.ok(Math.min(...lim.map((l) => l.min[0])) <= Math.min(...xsToldo) + 0.1, 'da largura do toldo (esquerda)');
  assert.ok(Math.max(...lim.map((l) => l.max[0])) >= Math.max(...xsToldo) - 0.1, 'da largura do toldo (direita)');
  assert.ok(Math.max(...lim.map((l) => l.max[1])) - Math.min(...lim.map((l) => l.min[1])) >= 0.5, 'faixa alta o bastante para aparecer');
  // a câmera olha de cima: o próprio toldo esconde a parede logo abaixo dele
  // (conferido nos pixels: até ~2,4). A faixa desce dos lados da entrada até
  // onde a câmera vê.
  assert.ok(Math.min(...lim.map((l) => l.min[1])) <= 1.8, `faixa escondida sob o toldo (desce só até ${Math.min(...lim.map((l) => l.min[1])).toFixed(2)})`);
});

test('MERCADO: poucos produtos e grandes na vitrine (sem traços no celular)', () => {
  const produtos = porId('MERCADO', 'produto-');
  assert.ok(produtos.length >= 6 && produtos.length <= 8, `${produtos.length} produtos: simplificar, não acrescentar`);
  for (const p of produtos) {
    const { min, max } = limitesDaPeca(p);
    // vitrine lateral (+X): ao longo da parede é o eixo z
    assert.ok(max[2] - min[2] >= 0.45, `${p.id}: ${(max[2] - min[2]).toFixed(2)} de largura vira traço`);
    assert.ok(max[1] - min[1] >= 0.45, `${p.id}: baixo`);
  }
});

test('mancha de contato visível: acima do asfalto e do blob, além da carroceria, sem virar mancha preta', () => {
  const yRua = Number(ler('src/components/RoadNetwork.jsx').match(/geometria\.rua\} position=\{\[0, ([\d.]+), 0\]\}/)[1]);
  const yBlob = Number(ler('src/components/Cenario.jsx').match(/const BLOB_Y = ([\d.]+);/)[1]);
  assert.ok(CONTATO, 'CONTATO exportado');
  assert.ok(CONTATO.y > yRua + 0.01 && CONTATO.y > yBlob, `mancha em y ${CONTATO.y}: o asfalto (${yRua}) a esconde`);
  assert.ok(CONTATO.y < 0.1, 'rente ao chão');
  assert.ok(CONTATO.opacidade >= 0.3 && CONTATO.opacidade <= 0.5, `opacidade ${CONTATO.opacidade}`);
  const somada = 1 - (1 - CONTATO.opacidade) * (1 - SOMBRA_SOLIDA.opacidade);
  assert.ok(somada <= 0.55, `sobre o blob, ${somada.toFixed(2)}: vira mancha preta`);
  for (const p of pecasDoContato()) {
    const { min, max } = limitesDaPeca(p);
    assert.ok(Math.max(-min[0], max[0]) >= 0.9 + 0.5, `${p.id} escondida sob a carroceria`);
    assert.ok(max[2] - min[2] >= 1.2, `${p.id} curta`);
  }
  const codigo = ler('src/components/EsquinaReal.jsx');
  assert.match(codigo, /E\.CONTATO\.y/);
  assert.match(codigo, /E\.CONTATO\.opacidade/);
});

test('pré-compilação: a esquina só aparece depois de os materiais do piloto compilarem', () => {
  const codigo = ler('src/components/EsquinaReal.jsx');
  assert.match(codigo, /useState\(false\)/, 'começa escondida');
  assert.match(codigo, /visible: pronto/, 'escondida até compilar');
  assert.match(codigo, /compileAsync\(/, 'compila os materiais do pacote ao chegar');
  assert.match(codigo, /name: 'esquina-real'/);
  // compilar não basta: o custo do primeiro uso (programa, textura dos
  // letreiros, ponto de sincronia com a GPU) cai no primeiro DESENHO. Por
  // isso um desenho de 1×1 pixel, que nunca chega à tela, antes de mostrar
  assert.match(codigo, /onSync/, 'espera os letreiros ficarem prontos');
  assert.match(codigo, /setScissor\(0, 0, 1, 1\)/, 'primeiro desenho fora da tela');
  assert.match(codigo, /frustumCulled = false/, 'desenha mesmo fora da câmera');
  assert.match(ler('src/components/Game.jsx'), /React: \{[^}]*useState[^}]*\}/, 'useState entra por parâmetro');
});
