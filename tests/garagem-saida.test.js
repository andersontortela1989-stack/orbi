import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const { useGame } = await import('../src/store/useGame.js');
const { coordenadorAtividade } = await import('../src/activity/index.js');

// Harness portado de tests/garagem-exit.test.js da branch congelada.
//
// Compila o painel REAL em memória com o mesmo JSX do Vite e captura os
// elementos React, para invocar os handlers de verdade sem trazer um DOM.
// O que ele NÃO cobre: `useEffect` não roda no renderizador estático, então
// layout, ciclo de vida e toque físico continuam sendo verificação separada.
const panelUrl = new URL('../src/components/GaragemPanel.jsx', import.meta.url);
const require = createRequire(import.meta.url);
const reactUrl = pathToFileURL(require.resolve('react')).href;
const { code } = await transform(await readFile(panelUrl, 'utf8'), {
  loader: 'jsx',
  format: 'esm',
  jsxFactory: 'captureElement',
});
const resolvedCode = code
  .replace(
    /import \{ useGame \} from ([^;]+);/,
    `import { useGame as actualStore } from $1;
    const useGame = Object.assign(selector => selector(actualStore.getState()), {
      getState: actualStore.getState,
    });`
  )
  .replace(/from "([^"]+)"/g, (_, specifier) => {
    const url = specifier.startsWith('.')
      ? new URL(specifier, panelUrl).href
      : pathToFileURL(require.resolve(specifier)).href;
    return `from ${JSON.stringify(url)}`;
  });
const moduleCode = `import { createElement } from ${JSON.stringify(reactUrl)};
export const elements = [];
function captureElement(type, props, ...children) {
  const element = createElement(type, props, ...children);
  elements.push(element);
  return element;
}
${resolvedCode}`;
const { GaragemPanel, elements } = await import(
  `data:text/javascript;base64,${Buffer.from(moduleCode).toString('base64')}`
);

function renderPanel() {
  elements.length = 0;
  return renderToStaticMarkup(createElement(GaragemPanel));
}

function botao(label) {
  renderPanel();
  return elements.find(
    (el) => el.type === 'button' && renderToStaticMarkup(el).includes(label)
  );
}

function clicar(label) {
  const alvo = botao(label);
  assert.ok(alvo, `botão acessível ausente: ${label}`);
  alvo.props.onClick({ currentTarget: { blur() {} } });
}

const SAIR = 'VOLTAR À CIDADE';

beforeEach(() => {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
  useGame.getState().setGaragemPerto(true);
});

test('o botão de sair existe nos TRÊS estados do painel', () => {
  // 1. sem nada escolhido
  assert.ok(botao(SAIR), 'estado inicial');

  // 2. com uma cor já comprada vestida (coral vem de fábrica)
  clicar('CORAL');
  assert.ok(botao(SAIR), 'depois de vestir cor já comprada');

  // 3. com preview de cor nova, alcançável, ao lado do botão PINTAR
  useGame.setState({ moedas: 30 });
  clicar('SOL');
  assert.ok(botao('PINTAR DE'), 'o botão de compra aparece');
  assert.ok(botao(SAIR), 'e o de sair continua lá, junto');

  // 4. e logo depois de comprar
  clicar('PINTAR DE');
  assert.ok(botao(SAIR), 'depois de comprar');
});

test('sair descarta a prévia sem comprar nem mexer no progresso', () => {
  useGame.setState({ moedas: 30 });
  clicar('SOL');
  assert.equal(useGame.getState().corPreview, 'sol');

  const antes = useGame.getState();
  clicar(SAIR);

  assert.deepEqual(useGame.getState(), {
    ...antes,
    garagemPerto: false,
    corPreview: null,
  });
  assert.equal(renderPanel(), '', 'o painel fecha');

  // Com o carro ainda na zona, o sensor não dispara onEnter de novo — uma
  // atualização qualquer da store não pode reabrir o painel sozinha.
  useGame.getState().abastecer(-1);
  assert.equal(renderPanel(), '', 'e não reabre');
});

test('sair funciona sem moedas e preserva a cor já comprada', () => {
  useGame.setState({ moedas: 0, coresCompradas: ['coral', 'sol'] });
  clicar('SOL');
  assert.equal(useGame.getState().corCarro, 'sol', 'já comprada veste grátis');

  clicar('NUVEM'); // 25 moedas, inalcançável: só entra em prévia
  assert.equal(useGame.getState().corPreview, 'nuvem');

  clicar(SAIR);
  assert.equal(renderPanel(), '');
  assert.equal(useGame.getState().corPreview, null, 'prévia descartada');
  assert.equal(useGame.getState().corCarro, 'sol', 'cor vestida mantida');
  assert.equal(useGame.getState().moedas, 0, 'fechar não cobra');
  assert.deepEqual(useGame.getState().coresCompradas, ['coral', 'sol']);
});

test('comprar debita uma vez e sair permite voltar depois sem cobrar de novo', () => {
  useGame.setState({ moedas: 30 });
  clicar('SOL');
  clicar('PINTAR DE');
  assert.equal(useGame.getState().moedas, 20);
  assert.equal(useGame.getState().corCarro, 'sol');
  assert.deepEqual(useGame.getState().coresCompradas, ['coral', 'sol']);

  clicar(SAIR);
  assert.equal(renderPanel(), '');

  // Sair da zona e voltar: o painel abre de novo, a cor segue comprada.
  useGame.getState().setGaragemPerto(false);
  useGame.getState().setGaragemPerto(true);
  assert.ok(renderPanel().includes('PINTAR O CARRO'), 'reabre ao reentrar');

  clicar('SOL');
  assert.equal(useGame.getState().moedas, 20, 'vestir de novo é grátis');
  clicar(SAIR);
  assert.equal(renderPanel(), '');
});

test('depois do botão, o foco do coordenador não fica preso em garagem', () => {
  // O painel liga o ciclo de vida pelo `useRegistrarAtividade('garagem', aberto)`,
  // e `useEffect` não roda no renderizador estático. Então as duas metades são
  // provadas separadas:
  //   1. o clique deixa `aberto` falso — é a entrada que o hook observa;
  //   2. com essa entrada, o coordenador solta a garagem e devolve a direção.
  coordenadorAtividade.pedirFoco('garagem');
  assert.equal(coordenadorAtividade.estado().foco, 'garagem');

  clicar(SAIR);

  const s = useGame.getState();
  assert.equal(s.garagemPerto && !s.caderninhoAberto, false, 'hook recebe ativa=false');

  coordenadorAtividade.liberar('garagem');
  assert.equal(coordenadorAtividade.estado().foco, 'explorando');
  assert.equal(coordenadorAtividade.estaAtiva('garagem'), false);
  assert.equal(coordenadorAtividade.podeDirigir(), true, 'a direção volta inteira');
});

test('sair dirigindo continua fechando o painel, sem depender do botão', () => {
  useGame.setState({ moedas: 30 });
  clicar('SOL');
  assert.equal(useGame.getState().corPreview, 'sol');

  // É o que o ZoneSensor faz no onIntersectionExit.
  useGame.getState().setGaragemPerto(false);

  assert.equal(renderPanel(), '');
  assert.equal(useGame.getState().corPreview, null);
  assert.equal(useGame.getState().moedas, 30, 'nada foi cobrado');
});
