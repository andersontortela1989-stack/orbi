import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolverChegadaSensor,
  finalizarChegadaViva,
  podeAbrirVisitaLivre,
} from '../src/missions/visita-livre.js';
import { temChegadaViva } from '../src/missions/chegadas-vivas.js';
import { criarCoordenadorAtividade } from '../src/activity/activity-machine.js';
import { useGame } from '../src/store/useGame.js';

function prepararStoreLimpa() {
  useGame.getState().resetar();
  useGame.getState().proximaMissao(); // parada 0 = PADARIA
}

test('Shopping (Fatia 3): visita livre abre ao estacionar e preserva a parada ativa do roteiro', () => {
  prepararStoreLimpa();
  const coordenador = criarCoordenadorAtividade();
  coordenador.pedirFoco('em_missao');

  const missaoAntes = { ...useGame.getState().missao };
  const posAntes = useGame.getState().roteiroPosicao;
  assert.equal(missaoAntes.destino, 'PADARIA');
  assert.equal(missaoAntes.concluida, false);

  const s = useGame.getState();
  const resultado = resolverChegadaSensor('SHOPPING', {
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
  assert.ok(depoisAbrir.chegadaViva, 'chegadaViva aberta para SHOPPING');
  assert.equal(depoisAbrir.chegadaViva.lugar, 'SHOPPING');
  assert.equal(depoisAbrir.chegadaViva.visitaLivre, true);
  assert.ok(
    depoisAbrir.descobertas.lugares.includes('SHOPPING'),
    'adesivo SHOPPING registrado no Caderninho'
  );
  assert.deepEqual(depoisAbrir.missao, missaoAntes, 'parada ativa não mudou');
  assert.equal(depoisAbrir.roteiroPosicao, posAntes, 'posição do roteiro não mudou');

  // Coordenador cede foco para a pergunta e devolve para em_missao ao fechar
  assert.equal(coordenador.pedirFoco('pergunta'), true);
  assert.equal(coordenador.estado().foco, 'pergunta');

  const fechamento = finalizarChegadaViva(depoisAbrir.chegadaViva, {
    fecharChegadaViva: useGame.getState().fecharChegadaViva,
    proximaMissao: useGame.getState().proximaMissao,
  });
  coordenador.liberar('pergunta');

  assert.equal(fechamento, 'visita_livre');
  assert.equal(useGame.getState().chegadaViva, null);
  assert.deepEqual(useGame.getState().missao, missaoAntes, 'parada PADARIA segue intacta após fechar');
  assert.equal(useGame.getState().roteiroPosicao, posAntes, 'roteiro não avançou');
  assert.equal(coordenador.estado().foco, 'em_missao', 'foco retornou para em_missao');
});

test('Shopping (Fatia 3): chegada viva normal de missão continua avançando o roteiro ao fechar', () => {
  prepararStoreLimpa();
  useGame.getState().abrirChegadaViva('PADARIA');
  const pergunta = useGame.getState().chegadaViva;
  assert.equal(pergunta.visitaLivre, undefined);

  const fechamento = finalizarChegadaViva(pergunta, {
    fecharChegadaViva: useGame.getState().fecharChegadaViva,
    proximaMissao: useGame.getState().proximaMissao,
  });

  assert.equal(fechamento, 'proxima_missao');
  assert.equal(useGame.getState().chegadaViva, null);
  assert.equal(useGame.getState().missao.destino, 'ESCOLA');
  assert.equal(useGame.getState().roteiroPosicao, 1);
});

test('Shopping (Fatia 3): respeita o coordenador de atividades e não interrompe outra atividade', () => {
  const focosBloqueados = [
    'tutorial',
    'carona',
    'abastecendo',
    'garagem',
    'caderninho',
    'pergunta',
    'historia',
    'resumo',
    'configuracoes',
    'pausado',
  ];

  for (const foco of focosBloqueados) {
    assert.equal(
      podeAbrirVisitaLivre({ slug: 'SHOPPING', foco }),
      false,
      `não deve abrir com foco ${foco}`
    );
  }

  assert.equal(podeAbrirVisitaLivre({ slug: 'SHOPPING', foco: 'explorando' }), true);
  assert.equal(podeAbrirVisitaLivre({ slug: 'SHOPPING', foco: 'em_missao' }), true);
  assert.equal(
    podeAbrirVisitaLivre({ slug: 'SHOPPING', foco: 'em_missao', aventuraAtiva: true }),
    false,
    'não abre durante aventura'
  );
  assert.equal(
    podeAbrirVisitaLivre({ slug: 'SHOPPING', foco: 'em_missao', missaoConcluida: true }),
    false,
    'não abre durante celebração de missão concluída'
  );
  assert.equal(
    podeAbrirVisitaLivre({ slug: 'SHOPPING', foco: 'em_missao', chegadaVivaAtiva: true }),
    false,
    'não abre com outra pergunta aberta'
  );
});

test('Shopping (Fatia 3): anti-loop impede reabertura sem sair da vaga e não afeta outros lugares', () => {
  let aberturas = 0;
  const deps = (jaNaZona) => ({
    foco: 'em_missao',
    aventuraAtiva: false,
    chegadaVivaAtiva: false,
    missaoConcluida: false,
    jaNaZona,
    processarChegada: () => false,
    temChegadaViva,
    registrarDescoberta: () => {},
    abrirChegadaViva: () => {
      aberturas += 1;
      return true;
    },
  });

  // 1ª entrada abre
  assert.equal(resolverChegadaSensor('SHOPPING', deps(false)), 'visita_livre');
  // Ainda dentro da vaga não reabre
  assert.equal(resolverChegadaSensor('SHOPPING', deps(true)), 'ignorado');
  // Depois de sair e voltar, abre novamente
  assert.equal(resolverChegadaSensor('SHOPPING', deps(false)), 'visita_livre');
  assert.equal(aberturas, 2);

  // Outros lugares fora da parada ativa continuam ignorados (sem mudar comportamento)
  assert.equal(resolverChegadaSensor('ZOO', deps(false)), 'ignorado');
  assert.equal(resolverChegadaSensor('MERCADO', deps(false)), 'ignorado');
  assert.equal(aberturas, 2);
});