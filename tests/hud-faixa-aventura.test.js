import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * FAIXA DA AVENTURA NO TOPO (conferência de 19/11): no notebook (1280×720) a
 * faixa da coleta ia de 137 a 1143 px numa linha só, e o cartão de moedas
 * (até 236 px) e os botões do canto direito (a partir de 1064 px) cobriam o
 * começo e o fim do texto. No celular deitado, a faixa ocupava 3 linhas e o
 * 💡 DICA (top fixo) invadia a borda dela.
 *
 * Regra: a faixa da aventura e o DICA ficam numa coluna centrada, com largura
 * limitada ao vão entre o cartão e os botões; o DICA vem logo abaixo da faixa
 * e desce junto quando ela quebra em linhas. A medida real (sem sobreposição
 * e dentro da tela) é feita no navegador, pelo DOM.
 *
 * O cartão de repartir (plantar e regar) vem na mesma coluna, abaixo do DICA:
 * com top fixo, a faixa de 2 linhas do notebook empurrava o DICA para cima
 * dele (conferência de 19/11, medida no DOM: DICA 128–165 px, cartão a 144).
 */

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const HUD = ler('src/components/HUD.jsx');
const CSS = ler('src/styles.css');
// A coluna mora no CSS do pacote do jogo (importado pelo HUD), como o 🔊 do
// repetir-fala.css: o CSS inicial da abertura não cresce.
const TOPO = ler('src/components/adv-topo.css');

/** Corpo de um bloco de seletor de topo (primeira ocorrência, sem @media). */
function bloco(seletor, texto = TOPO) {
  const achado = texto.match(new RegExp(`^${seletor.replace(/\./g, '\\.')} \\{([^}]*)\\}`, 'm'));
  return achado?.[1] ?? null;
}

/** Bloco do celular deitado (max-height: 500px e paisagem) do HUD compacto. */
function blocoDeitado() {
  const inicio = CSS.indexOf('/* ===== HUD compacto em telas baixas');
  assert.ok(inicio > 0, 'bloco do HUD compacto existe');
  return CSS.slice(inicio, CSS.indexOf('/* Celulares especialmente estreitos', inicio));
}

/** O mesmo recorte de tela, no CSS da coluna. */
function topoDeitado() {
  const achado = TOPO.match(/@media \(max-height: 500px\) and \(orientation: landscape\) \{([\s\S]*)\}\s*$/);
  assert.ok(achado, 'adv-topo.css tem o bloco do celular deitado');
  return achado[1];
}

test('HUD: a faixa da aventura e o 💡 DICA moram na mesma coluna, nessa ordem', () => {
  const coluna = HUD.match(/<div className="adv-topo">([\s\S]*?)\n {8}<\/div>/);
  assert.ok(coluna, 'existe a coluna .adv-topo');
  const dentro = coluna[1];
  const faixa = dentro.indexOf('mission-banner');
  const dica = dentro.indexOf('adv-ajuda');
  assert.ok(faixa >= 0 && dica > faixa, 'a faixa vem antes do DICA, dentro da coluna');
  assert.match(dentro, /aventura\.objetivo/);
});

test('HUD: o cartão de repartir vem na mesma coluna, abaixo do DICA', () => {
  const dentro = HUD.match(/<div className="adv-topo">([\s\S]*?)\n {8}<\/div>/)[1];
  const dica = dentro.indexOf('adv-ajuda');
  const cartao = dentro.indexOf('<PainelDistribuir />');
  assert.ok(cartao > dica, 'o cartão vem depois do DICA');
  assert.match(HUD, /^import \{ PainelDistribuir \} from '\.\/PainelDistribuir\.jsx';$/m);
  // montado uma vez só: sai do GameExperience
  const jogo = ler('src/GameExperience.jsx');
  assert.doesNotMatch(jogo, /<PainelDistribuir \/>/, 'o jogo não monta outro cartão');
  // o cartão continua decidindo sozinho quando aparece (etapa de repartir e
  // foco em missão), sem herdar as condições da faixa
  assert.match(ler('src/components/PainelDistribuir.jsx'), /if \(!cartao \|\| foco !== 'em_missao'\) return null;/);
});

test('CSS: o cartão de repartir não tem posição própria (segue a coluna)', () => {
  const cartao = bloco('.adv-repartir', CSS);
  assert.ok(cartao);
  assert.doesNotMatch(cartao, /position:\s*fixed|top:|transform:/);
  assert.match(cartao, /pointer-events:\s*auto/, 'os canteiros continuam tocáveis');
  const baixo = CSS.match(/@media \(max-height: 500px\) and \(orientation: landscape\) \{\s*\.adv-repartir \{([^}]*)\}/);
  assert.ok(baixo, 'regra do cartão em tela baixa');
  assert.doesNotMatch(baixo[1], /top:/);
});

test('CSS: a coluna é fixa no topo, centrada, e empilha faixa e DICA', () => {
  const c = bloco('.adv-topo');
  assert.ok(c, 'regra .adv-topo');
  assert.match(c, /position:\s*fixed/);
  assert.match(c, /top:\s*var\(--ui-safe-top\)/);
  assert.match(c, /flex-direction:\s*column/);
  assert.match(c, /align-items:\s*center/);
  assert.match(c, /pointer-events:\s*none/, 'o vão da coluna não rouba toques do mundo');
  assert.match(HUD, /^import '\.\/adv-topo\.css';$/m, 'o HUD importa o CSS da coluna');
  assert.doesNotMatch(CSS, /\.adv-topo/, 'nada da coluna no CSS inicial');
});

test('CSS: a largura da coluna deixa livre o cartão de moedas e os botões da direita', () => {
  const c = bloco('.adv-topo');
  // folga de cada lado = margem segura + a maior largura (cartão 220 px de
  // largura mínima; botões da direita ocupam 112 + 32 + 56 = 200 px) + respiro
  assert.match(c, /--adv-folga:\s*calc\(max\(var\(--ui-safe-left\), var\(--ui-safe-right\)\) \+ 220px \+ var\(--space-3\)\)/);
  assert.match(c, /max-width:\s*max\(240px, calc\(100vw - 2 \* var\(--adv-folga\)\)\)/);
  assert.match(bloco('.hud', CSS), /min-width:\s*220px/, 'o cartão de moedas ainda mede 220 px');
  assert.match(CSS, /right:\s*calc\(var\(--ui-safe-right\) \+ 112px \+ var\(--space-6\)\);\s*z-index: 15;\s*width: 56px;/,
    'o botão de conforto ainda termina a 200 px da margem');

  // no deitado: cartão clamp(126px, 22vw, 160px); botões 84 + 16 + 42 = 142 px
  assert.match(topoDeitado(), /\.adv-topo \{[^}]*--adv-folga:\s*calc\(max\(var\(--ui-safe-left\), var\(--ui-safe-right\)\) \+ max\(clamp\(126px, 22vw, 160px\), 142px\) \+ var\(--space-2\)\)/);
  assert.match(blocoDeitado(), /width:\s*clamp\(126px, 22vw, 160px\)/, 'o cartão compacto ainda usa esse clamp');
});

test('CSS: dentro da coluna, a faixa ocupa a largura dela e o DICA não tem posição própria', () => {
  const faixa = bloco('.adv-topo .mission-banner');
  assert.ok(faixa, 'regra .adv-topo .mission-banner');
  assert.match(faixa, /position:\s*static/);
  assert.match(faixa, /transform:\s*none/);
  assert.match(faixa, /max-width:\s*100%/);

  const dica = bloco('.adv-ajuda', CSS);
  assert.ok(dica);
  assert.doesNotMatch(dica, /position:\s*fixed|top:/, 'o DICA não tem mais top fixo');
  assert.match(dica, /pointer-events:\s*auto/, 'o DICA continua tocável dentro da coluna');
  assert.doesNotMatch(blocoDeitado(), /\.adv-ajuda \{[^}]*top:/, 'nem no celular deitado');
});

test('a faixa das outras missões não muda (CHEGAMOS!, GPS, combustível)', () => {
  const m = bloco('.mission-banner', CSS);
  assert.match(m, /position:\s*fixed/);
  assert.match(m, /max-width:\s*calc\(100vw - var\(--ui-safe-left\) - var\(--ui-safe-right\)\)/);
  assert.match(m, /z-index:\s*10/);
});
