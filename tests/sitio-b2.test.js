import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ELEMENTOS_SITIO,
  temChegadaViva,
  sortearChegadaViva,
} from '../src/missions/chegadas-vivas.js';
import {
  ehLugarVisitaLivre,
  podeAbrirVisitaLivre,
  resolverChegadaSensor,
  finalizarChegadaViva,
} from '../src/missions/visita-livre.js';
import { criarCoordenadorAtividade } from '../src/activity/activity-machine.js';
import { useGame } from '../src/store/useGame.js';

function prepararStoreLimpa() {
  useGame.getState().resetar();
  useGame.getState().proximaMissao(); // parada 0 = PADARIA
}

test('Sítio (Fatia 2): chegada viva rural montada com 3 cartas distintas e sem repetição consecutiva', () => {
  assert.equal(temChegadaViva('SÍTIO'), true);
  assert.equal(ELEMENTOS_SITIO.length, 4);

  let anterior = null;
  for (let i = 0; i < 8; i += 1) {
    const p = sortearChegadaViva('SÍTIO');
    assert.ok(p, 'pergunta sorteada para SÍTIO');
    assert.equal(p.lugar, 'SÍTIO');
    assert.equal(p.habilidade, 'cienciasVida');
    assert.equal(p.destaqueNeutro, true);
    assert.equal(p.mostra, null);
    assert.deepEqual(p.descoberta, { categoria: 'lugares', id: 'SÍTIO' });

    assert.equal(p.opcoes.length, 3, 'sempre 3 opções');
    const valores = p.opcoes.map((o) => o.valor);
    assert.equal(new Set(valores).size, 3, 'opções sem repetição');
    assert.ok(valores.includes(p.resposta), 'resposta certa presente');
    for (const o of p.opcoes) {
      assert.ok(o.emoji, `opção ${o.valor} tem emoji`);
      assert.equal(o.rotulo, o.valor);
    }

    if (anterior !== null) {
      assert.notEqual(p.resposta, anterior, 'não repete o mesmo elemento seguido');
    }
    anterior = p.resposta;

    for (const campo of ['frasePergunta', 'fraseAcerto', 'fraseTenteDeNovo', 'fraseRevela']) {
      assert.ok(typeof p[campo] === 'string' && p[campo].length > 0);
      assert.ok(!/\d/.test(p[campo]), `${campo} sem algarismos: "${p[campo]}"`);
    }
  }
});

test('Sítio (Fatia 2): visita livre abre ao estacionar e preserva a parada ativa do roteiro', () => {
  prepararStoreLimpa();
  const coordenador = criarCoordenadorAtividade();
  coordenador.pedirFoco('em_missao');

  assert.equal(ehLugarVisitaLivre('SÍTIO'), true);
  assert.equal(ehLugarVisitaLivre('SHOPPING'), true);

  const missaoAntes = { ...useGame.getState().missao };
  const posAntes = useGame.getState().roteiroPosicao;
  assert.equal(missaoAntes.destino, 'PADARIA');

  const s = useGame.getState();
  const resultado = resolverChegadaSensor('SÍTIO', {
    foco: coordenador.estado().foco,
    aventuraAtiva: false,
    chegadaVivaAtiva: !!s.chegadaViva,
    missaoConcluida: !!s.missao?.concluida,
    jaNaZona: false,
    processarChegada: s.processarChegada,
    temChegadaViva,
    registrarDescoberta: s.registrarDescoberta,
    abrirChegadaViva: s.abrirChegadaViva,
  });

  assert.equal(resultado, 'visita_livre');
  const depoisAbrir = useGame.getState();
  assert.equal(depoisAbrir.chegadaViva?.lugar, 'SÍTIO');
  assert.equal(depoisAbrir.chegadaViva?.visitaLivre, true);
  assert.ok(depoisAbrir.descobertas.lugares.includes('SÍTIO'));
  assert.deepEqual(depoisAbrir.missao, missaoAntes);
  assert.equal(depoisAbrir.roteiroPosicao, posAntes);

  assert.equal(coordenador.pedirFoco('pergunta'), true);
  const fechamento = finalizarChegadaViva(depoisAbrir.chegadaViva, {
    fecharChegadaViva: useGame.getState().fecharChegadaViva,
    proximaMissao: useGame.getState().proximaMissao,
  });
  coordenador.liberar('pergunta');

  assert.equal(fechamento, 'visita_livre');
  assert.equal(useGame.getState().chegadaViva, null);
  assert.deepEqual(useGame.getState().missao, missaoAntes);
  assert.equal(useGame.getState().roteiroPosicao, posAntes);
  assert.equal(coordenador.estado().foco, 'em_missao');
});

test('Sítio (Fatia 2): respeita focos ocupados, aventura ativa e anti-loop na vaga', () => {
  const bloqueados = [
    'tutorial', 'carona', 'abastecendo', 'garagem', 'caderninho',
    'pergunta', 'historia', 'resumo', 'configuracoes', 'pausado',
  ];
  for (const foco of bloqueados) {
    assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco }), false, `bloqueado em ${foco}`);
  }
  assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco: 'explorando' }), true);
  assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco: 'em_missao' }), true);
  assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco: 'em_missao', aventuraAtiva: true }), false);
  assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco: 'em_missao', missaoConcluida: true }), false);
  assert.equal(podeAbrirVisitaLivre({ slug: 'SÍTIO', foco: 'em_missao', jaNaZona: true }), false);
});