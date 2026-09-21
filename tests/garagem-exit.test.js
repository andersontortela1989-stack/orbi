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
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
const { useGame } = await import('../src/store/useGame.js');

// Compile the real panel in memory with Vite's existing JSX compiler.
// Capture React elements to invoke the actual button handlers without adding
// a DOM dependency. Browser layout, effects and physical touch remain separate checks.
const panelUrl = new URL('../src/components/GaragemPanel.jsx', import.meta.url);
const require = createRequire(import.meta.url);
const reactUrl = pathToFileURL(require.resolve('react')).href;
const { code } = await transform(await readFile(panelUrl, 'utf8'), {
  loader: 'jsx', format: 'esm', jsxFactory: 'captureElement',
});
const resolvedCode = code.replace(
  /import \{ useGame \} from ([^;]+);/,
  `import { useGame as actualStore } from $1;
  const useGame = Object.assign(selector => selector(actualStore.getState()), {
    getState: actualStore.getState,
  });`
).replace(/from "([^"]+)"/g, (_, specifier) => {
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
  // The selector adapter reads the real store's current fixture; subscription
  // and effect lifecycles require the browser check, not this server renderer.
  return renderToStaticMarkup(createElement(GaragemPanel));
}

function clickButton(label) {
  renderPanel();
  const button = elements.find((element) => element.type === 'button' &&
    renderToStaticMarkup(element).includes(label));
  assert.ok(button, `botão acessível ausente: ${label}`);
  button.props.onClick({ currentTarget: { blur() {} } });
}

beforeEach(() => {
  useGame.getState().resetar();
  useGame.getState().setGaragemPerto(true);
});

test('sair da garagem descarta preview sem comprar nem alterar o progresso', () => {
  useGame.setState({ moedas: 30 });
  clickButton('SOL');
  assert.equal(useGame.getState().corPreview, 'sol');
  const before = useGame.getState();
  clickButton('VOLTAR À CIDADE');
  assert.deepEqual(useGame.getState(), {
    ...before, garagemPerto: false, corPreview: null,
  });
  assert.equal(renderPanel(), '');
  // Unrelated updates while still in the zone cannot reopen the panel.
  useGame.getState().abastecer(-1);
  assert.equal(renderPanel(), '');
});

test('sair funciona sem moedas e preserva seleção de cor já comprada', () => {
  useGame.setState({ moedas: 0, coresCompradas: ['coral', 'sol'] });
  clickButton('SOL');
  assert.equal(useGame.getState().corCarro, 'sol');
  clickButton('NUVEM');
  assert.equal(useGame.getState().corPreview, 'nuvem');
  clickButton('VOLTAR À CIDADE');
  assert.equal(renderPanel(), '');
  assert.equal(useGame.getState().corPreview, null);
  assert.equal(useGame.getState().corCarro, 'sol');
  assert.equal(useGame.getState().moedas, 0);
  assert.deepEqual(useGame.getState().coresCompradas, ['coral', 'sol']);
});

test('compra explícita continua debitando uma vez e saída permite nova visita', () => {
  useGame.setState({ moedas: 30 });
  clickButton('SOL');
  clickButton('PINTAR DE');
  assert.equal(useGame.getState().moedas, 20);
  assert.equal(useGame.getState().corCarro, 'sol');
  assert.deepEqual(useGame.getState().coresCompradas, ['coral', 'sol']);
  clickButton('VOLTAR À CIDADE');
  assert.equal(renderPanel(), '');
  useGame.getState().setGaragemPerto(false);
  useGame.getState().setGaragemPerto(true);
  assert.ok(renderPanel().includes('PINTAR O CARRO'));
  clickButton('SOL');
  assert.equal(useGame.getState().moedas, 20);
  clickButton('VOLTAR À CIDADE');
  assert.equal(renderPanel(), '');
});
