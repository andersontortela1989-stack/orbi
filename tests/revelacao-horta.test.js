import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criarAventura, LIMITE_ESPERA_FALA_MS } from '../src/adventure/adventure-engine.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';
import { FAIXA_HORTA_PADRAO, criarConviteHorta, faixaDaHorta } from '../src/adventure/convites.js';
import { criarHortaEscola } from '../src/school/horta-aventura.js';
import { pontoDeMedicao } from '../src/perf/medidor.js';
import { instalarPonteDeTeste } from '../src/perf/ponte-teste.js';

/**
 * REVELAÇÃO DA HORTA 6–7 E CHAVES DE TESTE.
 *
 * O motor revelava falando a própria `dica`. Agora a etapa `pergunta` aceita
 * `revelacao` (o texto falado ao revelar). Com ele, a revelação espera a fala
 * terminar antes de seguir (mínimo de 4,2 s, com limite de segurança). Sem
 * ele, nada muda — a pergunta do parque segue idêntica (o fixture de
 * regressão passa sem regravação).
 */

const pergunta67 = (random = () => 0.5) =>
  criarHortaEscola('6-7', { random }).etapas.find((e) => e.id === 'quantas-sementes');

test('6–7: a pista continua igual; a revelação tem texto próprio', () => {
  const p = pergunta67();
  assert.equal(p.dica, 'Conte duas sementes para um canteiro e duas para o outro.');
  assert.equal(p.revelacao, 'Duas sementes em cada canteiro. Duas mais duas são quatro.');
});

test('6–7: nem a pista nem o reforço dizem "quatro"; só a revelação diz', () => {
  const p = pergunta67();
  for (const ajuda of [p.dica, p.reforco]) assert.ok(!/quatro|\b4\b/i.test(ajuda), ajuda);
  assert.match(p.revelacao, /quatro/);
});

test('motor: o 💡 da 6–7 fala a pista, não a revelação', () => {
  const a = criarAventura(criarHortaEscola('6-7', { random: () => 0.5 }));
  a.iniciar();
  a.enviar({ tipo: 'toque' });
  a.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  const ajuda = a.enviar({ tipo: 'pedir_ajuda' });
  assert.deepEqual(
    ajuda.filter((e) => e.tipo === 'falar').map((e) => e.texto),
    ['Conte duas sementes para um canteiro e duas para o outro.']
  );
});

test('motor: no 3º erro da 6–7, fala a revelação e espera o fim da fala para seguir', () => {
  const a = criarAventura(criarHortaEscola('6-7', { random: () => 0.5 }));
  a.iniciar();
  a.enviar({ tipo: 'toque' });
  a.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  a.enviar({ tipo: 'respondeu', opcao: '3' });
  a.enviar({ tipo: 'respondeu', opcao: '5' });
  const efeitos = a.enviar({ tipo: 'respondeu', opcao: '3' });
  assert.deepEqual(efeitos.slice(-3), [
    { tipo: 'revelar_resposta', opcao: '4' },
    {
      tipo: 'falar',
      texto: 'Duas sementes em cada canteiro. Duas mais duas são quatro.',
      aguardarFim: true,
      interromper: true,
    },
    {
      tipo: 'agendar',
      depoisMs: 4200,
      aposFala: true,
      limiteMs: LIMITE_ESPERA_FALA_MS,
      evento: { tipo: 'continuar' },
    },
  ]);
  assert.ok(LIMITE_ESPERA_FALA_MS > 4200 && LIMITE_ESPERA_FALA_MS <= 15000);
  // e só então a coleta
  const depois = a.enviar({ tipo: 'continuar' });
  assert.equal(a.etapa().id, 'pegar-sementes');
  assert.ok(depois.some((e) => e.tipo === 'falar' && e.texto.startsWith('Pegue quatro saquinhos')));
});

test('sem "revelacao": a pergunta do parque revela como antes (dica + 4,2 s fixos)', () => {
  assert.equal('revelacao' in PARQUE_COM_SEDE.etapas.find((e) => e.id === 'saber'), false);
  const a = criarAventura(PARQUE_COM_SEDE);
  a.iniciar();
  a.enviar({ tipo: 'toque' });
  a.enviar({ tipo: 'respondeu', opcao: 'areia' });
  a.enviar({ tipo: 'respondeu', opcao: 'papel' });
  const efeitos = a.enviar({ tipo: 'respondeu', opcao: 'areia' });
  assert.deepEqual(efeitos.slice(-3), [
    { tipo: 'revelar_resposta', opcao: 'agua' },
    { tipo: 'falar', texto: 'É a água! Ela cai da nuvem e ajuda a planta a crescer.' },
    { tipo: 'agendar', depoisMs: 4200, evento: { tipo: 'continuar' } },
  ]);
});

test('3–5 e 8–10 continuam sem pergunta', () => {
  for (const band of ['3-5', '8-10']) {
    assert.equal(criarHortaEscola(band).etapas.some((e) => e.tipo === 'pergunta'), false, band);
  }
});

// ------------------------------------------------ chave de teste da faixa

test('?faixa= só vale junto com ?medir=1', () => {
  assert.equal(faixaDaHorta('?medir=1&faixa=6-7'), '6-7');
  assert.equal(faixaDaHorta('?faixa=8-10&medir=1'), '8-10');
  assert.equal(faixaDaHorta('?medir=1&faixa=3-5'), '3-5');
  assert.equal(faixaDaHorta('?faixa=6-7'), FAIXA_HORTA_PADRAO, 'sem medir: ignorada');
  assert.equal(faixaDaHorta('?medir=1&faixa=11-12'), FAIXA_HORTA_PADRAO, 'faixa desconhecida');
  assert.equal(faixaDaHorta(''), FAIXA_HORTA_PADRAO);
  assert.equal(faixaDaHorta(undefined), FAIXA_HORTA_PADRAO);
});

test('o convite usa a faixa recebida; sem faixa, a padrão', () => {
  const pedidos = [];
  const pedir = (band) => (pedidos.push(band), true);
  const escola = { tipo: 'gps', destino: 'ESCOLA', concluida: true };
  criarConviteHorta(pedir).tentar(escola);
  criarConviteHorta(pedir, '6-7').tentar(escola);
  assert.deepEqual(pedidos, [FAIXA_HORTA_PADRAO, '6-7']);
  assert.match(
    readFileSync(new URL('../src/adventure/convites.js', import.meta.url), 'utf8'),
    /criarConviteHorta\(\s*iniciarHortaEscola,\s*faixaDaHorta\(/
  );
});

// -------------------------------------------- conferência no navegador

test('ponto de medição no PARQUE: em frente ao canteiro, só com ?medir=1', () => {
  assert.equal(pontoDeMedicao('?ponto=PARQUE'), null);
  const p = pontoDeMedicao('?medir=1&ponto=PARQUE');
  assert.ok(p);
  assert.deepEqual(p.posicao, [-14, 1, 72 + 6 + 8]);
});

test('sem ?medir=1: window.__orbiTeste não existe e nada é registrado', () => {
  for (const search of ['', '?faixa=6-7', '?ponto=PARQUE&faixa=6-7', '?medir=0', '?medir=sim']) {
    const falar = (u) => u;
    const sintese = { speak: falar };
    const janela = { speechSynthesis: sintese };
    const ok = instalarPonteDeTeste(janela, search, {
      enviar: () => true,
      iniciarHorta: () => true,
      estado: () => ({}),
    });
    assert.equal(ok, false, search);
    assert.equal('__orbiTeste' in janela, false, `${search}: sem ponte`);
    assert.equal(sintese.speak, falar, `${search}: a voz não é embrulhada`);
    assert.equal('__orbiRegistrando' in sintese, false, `${search}: sem registro de voz`);
    sintese.speak({ text: 'Oi!' }); // fala normal, nada guardado em lugar nenhum
    assert.deepEqual(Object.keys(janela), ['speechSynthesis']);
  }
  // e o jogo só chama a ponte atrás do MEDIR (lido de ?medir=1)
  const jogo = readFileSync(new URL('../src/GameExperience.jsx', import.meta.url), 'utf8');
  const chamadas = jogo.match(/instalarPonteDeTeste\(/g) ?? [];
  assert.equal(chamadas.length, 1, 'uma chamada só');
  assert.match(jogo, /if \(MEDIR\) \{\s*instalarPonteDeTeste\(window, window\.location\.search,/);
});

test('ponte de teste: só com ?medir=1; registra o texto falado e o fim da fala', () => {
  const sem = {};
  assert.equal(instalarPonteDeTeste(sem, '?faixa=6-7', {}), false);
  assert.equal('__orbiTeste' in sem, false);

  const faladas = [];
  const janela = {
    speechSynthesis: { speak: (u) => faladas.push(u) },
  };
  let agora = 1000;
  const enviados = [];
  const ok = instalarPonteDeTeste(janela, '?medir=1&faixa=6-7', {
    enviar: (e) => (enviados.push(e), true),
    iniciarHorta: (band) => band,
    estado: () => ({ ativa: true }),
    agora: () => agora,
  });
  assert.equal(ok, true);
  const t = janela.__orbiTeste;
  assert.equal(t.horta(), '6-7', 'usa a faixa da chave de teste');

  // sorteio fixo das cartas pela ponte (sem tocar no Math.random da página)
  const pedidos = [];
  const comCartas = {};
  instalarPonteDeTeste(comCartas, '?medir=1&faixa=6-7', {
    enviar: () => true,
    iniciarHorta: (band, opcoes) => (pedidos.push([band, opcoes.random?.()]), true),
    estado: () => ({}),
  });
  comCartas.__orbiTeste.horta({ cartas: 'altas' });
  comCartas.__orbiTeste.horta({ cartas: 'baixas' });
  comCartas.__orbiTeste.horta();
  assert.deepEqual(pedidos, [['6-7', 0.999], ['6-7', 0], ['6-7', undefined]]);
  const cartas = criarHortaEscola('6-7', { random: () => 0.999 })
    .etapas.find((e) => e.id === 'quantas-sementes').opcoes.map((o) => o.id);
  assert.deepEqual(cartas, ['4', '5', '6'], "'altas' dá a janela {4,5,6}");
  t.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
  assert.deepEqual(enviados, [{ tipo: 'chegou', lugar: 'MERCADO' }]);

  const fins = [];
  const u = { text: 'Duas mais duas são quatro.', listeners: {}, addEventListener(tipo, fn) { this.listeners[tipo] = fn; } };
  u.onend = () => fins.push('original');
  janela.speechSynthesis.speak(u);
  assert.equal(faladas.length, 1, 'a fala chega à voz de verdade');
  agora = 4500;
  u.listeners.end();
  assert.deepEqual(t.vozes, [{ texto: 'Duas mais duas são quatro.', inicio: 1000, fim: 4500, como: 'end' }]);
});
