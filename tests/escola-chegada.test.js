import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolverPosChegada } from '../src/missions/chegada-ordem.js';
import {
  sortearChegadaViva,
  temChegadaViva,
} from '../src/missions/chegadas-vivas.js';

const SEM_ALGARISMO = /^[^0-9]*$/;
const CHEGADA_ESCOLA = Object.freeze({
  tipo: 'gps',
  destino: 'ESCOLA',
  concluida: true,
});

/** Réplica leve do contrato de criarConviteHorta (tentar + jaOferecido). */
function criarConviteSimulado(iniciar, faixa = '3-5') {
  let feito = false;
  return Object.freeze({
    tentar(missao) {
      if (feito) return false;
      if (missao?.tipo !== 'gps' || missao.destino !== 'ESCOLA' || !missao.concluida) {
        return false;
      }
      if (!iniciar(faixa)) return false;
      feito = true;
      return true;
    },
    jaOferecido() {
      return feito;
    },
  });
}

test('ESCOLA: primeira chegada elegível prioriza convite da Horta e não abre pergunta escolar', () => {
  const eventos = [];
  const conviteHorta = criarConviteSimulado((faixa) => {
    eventos.push(`convite:${faixa}`);
    return true;
  });

  const resultado = resolverPosChegada(CHEGADA_ESCOLA, {
    conviteHorta,
    temChegadaViva,
    abrirChegadaViva: (destino) => eventos.push(`pergunta:${destino}`),
    proximaMissao: () => eventos.push('proxima_missao'),
  });

  assert.equal(resultado, 'convite_horta');
  assert.deepEqual(eventos, ['convite:3-5', 'proxima_missao']);
});

test('ESCOLA (aceitar convite): encerra a 1ª chegada sem pergunta e só abre a pergunta em chegada posterior', () => {
  const eventos = [];
  let hortaAtiva = false;
  const conviteHorta = criarConviteSimulado(() => {
    hortaAtiva = true;
    eventos.push('convite_aberto');
    return true;
  });

  const deps = {
    conviteHorta,
    temChegadaViva,
    abrirChegadaViva: (destino) => eventos.push(`pergunta:${destino}`),
    proximaMissao: () => eventos.push('proxima_missao'),
  };

  // 1ª chegada: abre o convite da Horta (não abre pergunta)
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'convite_horta');
  // Criança aceita e conclui a Horta
  assert.equal(hortaAtiva, true);
  hortaAtiva = false;
  eventos.push('horta_concluida');

  // 2ª chegada posterior à Escola: agora abre a pergunta escolar
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'chegada_viva');
  assert.deepEqual(eventos, [
    'convite_aberto',
    'proxima_missao',
    'horta_concluida',
    'pergunta:ESCOLA',
  ]);
});

test('ESCOLA (recusar convite): devolve a direção sem pergunta e só abre a pergunta em chegada posterior', () => {
  const eventos = [];
  let conviteAberto = false;
  const conviteHorta = criarConviteSimulado(() => {
    conviteAberto = true;
    eventos.push('convite_aberto');
    return true;
  });

  const deps = {
    conviteHorta,
    temChegadaViva,
    abrirChegadaViva: (destino) => eventos.push(`pergunta:${destino}`),
    proximaMissao: () => eventos.push('proxima_missao'),
  };

  // 1ª chegada: abre o convite da Horta (não abre pergunta)
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'convite_horta');
  // Criança recusa ("AGORA NÃO"): encerra a interação daquela chegada
  assert.equal(conviteAberto, true);
  conviteAberto = false;
  eventos.push('convite_recusado');

  // 2ª chegada posterior à Escola: agora abre a pergunta escolar
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'chegada_viva');
  assert.deepEqual(eventos, [
    'convite_aberto',
    'proxima_missao',
    'convite_recusado',
    'pergunta:ESCOLA',
  ]);
});

test('ESCOLA: se convite não pôde abrir (foco ocupado), pergunta escolar não fura a fila', () => {
  const eventos = [];
  let livre = false;
  const conviteHorta = criarConviteSimulado(() => {
    if (!livre) return false;
    eventos.push('convite_aberto');
    return true;
  });

  const deps = {
    conviteHorta,
    temChegadaViva,
    abrirChegadaViva: (destino) => eventos.push(`pergunta:${destino}`),
    proximaMissao: () => eventos.push('proxima_missao'),
  };

  // 1ª chegada com foco ocupado: convite não abriu e pergunta NÃO pode furar fila
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'proxima_missao');
  // 2ª chegada agora elegível: convite da Horta ainda tem prioridade
  livre = true;
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'convite_horta');
  // 3ª chegada posterior: pergunta escolar liberada
  assert.equal(resolverPosChegada(CHEGADA_ESCOLA, deps), 'chegada_viva');

  assert.deepEqual(eventos, [
    'proxima_missao',
    'convite_aberto',
    'proxima_missao',
    'pergunta:ESCOLA',
  ]);
});

test('ESCOLA: pergunta de referência das maçãs (2 + 3 = 5) com dois grupos separados, pista e revelação exatas', () => {
  assert.equal(temChegadaViva('ESCOLA'), true);
  const p = sortearChegadaViva('ESCOLA');

  assert.equal(p.lugar, 'ESCOLA');
  assert.equal(p.habilidade, 'contagem');
  assert.equal(p.resposta, '5');
  assert.deepEqual(
    p.opcoes.map((o) => o.valor).sort(),
    ['4', '5', '6'],
    'cartas devem ser 4, 5 e 6'
  );
  assert.ok(
    p.opcoes.every((o) => o.emoji === null && o.rotulo === o.valor),
    'cartas numéricas sem emoji'
  );
  assert.deepEqual(p.mostra, { emoji: '🍎', grupos: [2, 3] });
  assert.equal(
    p.fraseTenteDeNovo,
    'Conte as duas e continue contando as que chegaram.'
  );
  assert.equal(p.fraseRevela, 'Duas e mais três são cinco maçãs.');

  for (const fala of [p.frasePergunta, p.fraseAcerto, p.fraseTenteDeNovo, p.fraseRevela]) {
    assert.match(fala, SEM_ALGARISMO, `fala sem algarismo: "${fala}"`);
  }
});

test('demais chegadas vivas (PADARIA, MERCADO, ZOO, PARQUE, ESTÁDIO) seguem intactas', () => {
  for (const lugar of ['PADARIA', 'MERCADO', 'ZOO', 'PARQUE', 'ESTÁDIO']) {
    assert.equal(temChegadaViva(lugar), true);
    const p = sortearChegadaViva(lugar);
    assert.equal(p.lugar, lugar);
    assert.equal(p.opcoes.length, 3);
  }
  const padaria = sortearChegadaViva('PADARIA');
  assert.equal(padaria.mostra.emoji, '🍞');
  assert.equal(typeof padaria.mostra.quantidade, 'number');
  assert.equal(padaria.mostra.grupos, undefined);
});
