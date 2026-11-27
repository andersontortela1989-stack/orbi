/**
 * R2 — tela calma quando a parte do jogo não carrega.
 *
 * Sem Error Boundary, a falha do GameExperience desmontava a árvore inteira e
 * sobrava a tela vazia. Agora a CargaSegura (em volta do <Suspense> do App)
 * mostra o Órbi parado, uma frase curta e TENTAR DE NOVO, que recarrega. Sem
 * texto técnico, sem vermelho, sem som; nada se mexe (vale para o Modo
 * Tranquilo também).
 *
 * Para o adulto conferir sem DevTools: `?medir=1&falha=carga` faz o
 * GameExperience falhar de propósito. Sem `?medir=1`, nunca falha.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BOTAO_FALHA_CARGA,
  CargaSegura,
  TEXTO_FALHA_CARGA,
  tentarDeNovo,
} from '../src/ui/carga-segura.js';
import { falhaDeCargaSimulada } from '../src/perf/medidor.js';

const ler = (caminho) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8');

test('sem falha, a CargaSegura mostra o jogo (os filhos)', () => {
  const limite = new CargaSegura({ children: 'jogo', tela: 'tela' });
  assert.equal(limite.render(), 'jogo');
});

test('quando a parte do jogo falha, a CargaSegura troca para a tela calma', () => {
  const limite = new CargaSegura({ children: 'jogo', tela: 'tela' });
  limite.state = { ...limite.state, ...CargaSegura.getDerivedStateFromError(new Error('404')) };
  assert.equal(limite.render(), 'tela');
});

test('TENTAR DE NOVO recarrega a página uma vez', () => {
  let recargas = 0;
  const original = globalThis.location;
  globalThis.location = { reload: () => (recargas += 1) };
  try {
    tentarDeNovo({ type: 'click' }); // o React passa o evento; ele é ignorado
  } finally {
    globalThis.location = original;
  }
  assert.equal(recargas, 1);
});

test('textos: frase curta, sem termo técnico, botão TENTAR DE NOVO', () => {
  assert.equal(BOTAO_FALHA_CARGA, 'TENTAR DE NOVO');
  assert.ok(TEXTO_FALHA_CARGA.split(/\s+/).length <= 6, 'frase curta');
  assert.equal(TEXTO_FALHA_CARGA, TEXTO_FALHA_CARGA.toUpperCase(), 'caixa alta, como o resto do jogo');
  for (const tecnico of ['ERRO', 'FALH', 'CARREG', 'REDE', 'INTERNET', 'CÓDIGO', '404', 'HTTP', 'ARQUIVO']) {
    assert.ok(!TEXTO_FALHA_CARGA.includes(tecnico), `sem "${tecnico}"`);
  }
});

test('App.jsx: o <Suspense> do jogo fica dentro da CargaSegura, com a tela de falha', () => {
  const app = ler('src/App.jsx');
  const abre = app.indexOf('<CargaSegura');
  assert.ok(abre > 0, 'App usa a CargaSegura');
  assert.ok(abre < app.indexOf('<Suspense'), 'CargaSegura abre antes do Suspense');
  assert.ok(app.indexOf('</Suspense>') < app.indexOf('</CargaSegura>'), 'e fecha depois');
  assert.match(app, /tela=\{<GameLoading falhou \/>\}/);
});

test('tela de falha (GameLoading falhou): Órbi parado, sem som, sem voz, sem animação, sem vermelho', () => {
  const tela = ler('src/components/GameLoading.jsx');
  const codigo = tela.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /pose=\{falhou \? 'parado'/);
  assert.match(codigo, /TEXTO_FALHA_CARGA/);
  assert.match(codigo, /BOTAO_FALHA_CARGA/);
  assert.match(codigo, /onClick=\{tentarDeNovo\}/);
  assert.match(codigo, /falhou \? ' parado'/);
  assert.ok(!/audio\/|som|falar|voz/i.test(codigo), 'sem som nem voz');
  assert.ok(!/style=|coral|red|vermelh/i.test(codigo), 'sem cor própria');

  const css = ler('src/styles.css');
  const regra = css.match(/\.game-loading-orbi\.parado\s*\{([^}]*)\}/);
  assert.ok(regra, 'regra do Órbi parado existe');
  assert.match(regra[1], /animation:\s*none/);
});

test('falha simulada só com ?medir=1&falha=carga', () => {
  assert.equal(falhaDeCargaSimulada('?medir=1&falha=carga'), true);
  assert.equal(falhaDeCargaSimulada('?falha=carga&medir=1'), true);
  assert.equal(falhaDeCargaSimulada('?falha=carga'), false, 'sem o medidor, nunca');
  assert.equal(falhaDeCargaSimulada('?medir=1'), false);
  assert.equal(falhaDeCargaSimulada('?medir=1&falha=outra'), false);
  assert.equal(falhaDeCargaSimulada(''), false);
  assert.equal(falhaDeCargaSimulada(undefined), false);
});

test('GameExperience falha de propósito só no modo de teste, e fora do pacote inicial', () => {
  const jogo = ler('src/GameExperience.jsx');
  assert.match(jogo, /falhaDeCargaSimulada\(window\.location\.search\)/);
  assert.match(jogo, /if \(FALHA_SIMULADA\) throw/);
  // A simulação mora no GameExperience (carregado sob demanda): o App e o
  // main não ganham nada com ela.
  assert.ok(!ler('src/App.jsx').includes('falhaDeCargaSimulada'));
  assert.ok(!ler('src/main.jsx').includes('falhaDeCargaSimulada'));
});
