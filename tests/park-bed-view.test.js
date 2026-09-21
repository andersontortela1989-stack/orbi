import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CANTEIRO } from '../src/city/canteiro.js';

const source = new URL('../src/components/ParkBedView.jsx', import.meta.url);
const require = createRequire(import.meta.url);
const { code } = await transform(await readFile(source, 'utf8'), {
  loader: 'jsx', format: 'esm', jsx: 'automatic',
});
const resolved = code.replace(/from "([^"]+)"/g, (_, specifier) =>
  `from ${JSON.stringify(specifier.startsWith('.') ? new URL(specifier, source).href : pathToFileURL(require.resolve(specifier)).href)}`);
const { ParkBedView } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`);

test('vista para contagem acompanha as árvores reais sem imprimir a resposta', () => {
  const render = () => renderToStaticMarkup(createElement(ParkBedView));
  assert.equal((render().match(/data-tree=/g) || []).length, CANTEIRO.arvores.length);
  // Uma alteração futura no canteiro deve aparecer na vista, sem contagem fixa.
  CANTEIRO.arvores.push([-2, 59]);
  try {
    assert.equal((render().match(/data-tree=/g) || []).length, CANTEIRO.arvores.length);
    assert.equal(/<text[ >]/.test(render()), false);
  } finally { CANTEIRO.arvores.pop(); }
});
