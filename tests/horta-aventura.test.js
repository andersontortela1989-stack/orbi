import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coordenadorAtividade } from '../src/activity/index.js';
import {
  aventuraRuntime,
  enviarEventoAventura,
  iniciarHortaEscola,
} from '../src/adventure/runtime.js';
import { HORTA_BANDS } from '../src/school/horta.js';
import { criarHortaEscola } from '../src/school/horta-aventura.js';
import { useGame } from '../src/store/useGame.js';

// End-to-end pelo RUNTIME, não só pelo motor: prova foco, save e painel
// juntos — o mesmo padrão de adventure-runtime.test.js. Sem Canvas, sem React.

/** Coordenador e save zerados: cada faixa roda numa mesa limpa. */
function mesaLimpa() {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
}

/**
 * Telemetria de punição. `tentativa` só é emitida por `responder()`, que
 * serve à etapa `pergunta` — a Horta não tem nenhuma. Lista vazia é a prova
 * de que nada contou erro contra a criança.
 */
const punicoes = () =>
  aventuraRuntime.estado().eventos.filter((e) => e.evento === 'tentativa');

/** Dirige a aventura do convite até o painel de resumo, sem aferir nada. */
function jogarAteOResumo(band) {
  const { total, beds } = HORTA_BANDS[band];
  const porCanteiro = total / beds;

  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < total; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (let canteiro = 0; canteiro < beds; canteiro += 1) {
    for (let n = 0; n < porCanteiro; n += 1) {
      enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
    }
  }
  for (let canteiro = 0; canteiro < beds; canteiro += 1) {
    enviarEventoAventura({ tipo: 'distribuiu', item: 'agua', slot: canteiro });
  }
}

for (const band of Object.keys(HORTA_BANDS)) {
  const { total, beds } = HORTA_BANDS[band];
  const porCanteiro = total / beds;

  test(`faixa ${band}: a Horta vai do convite ao resumo sem punição`, () => {
    mesaLimpa();

    assert.equal(iniciarHortaEscola(band), true);
    assert.equal(coordenadorAtividade.estado().foco, 'historia', 'o convite fala');
    assert.equal(
      enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' }),
      false,
      'mundo fechado sob a fala: chegar cedo não pula etapa'
    );

    enviarEventoAventura({ tipo: 'toque' });
    assert.equal(aventuraRuntime.estado().etapa, 'ir-ao-mercado');
    assert.equal(coordenadorAtividade.estado().foco, 'em_missao');

    enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
    assert.equal(aventuraRuntime.estado().etapa, 'pegar-sementes');

    for (let n = 0; n < total; n += 1) {
      enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
    }
    assert.equal(
      aventuraRuntime.estado().etapa,
      'voltar-a-escola',
      `${total} sementes fecham a coleta`
    );

    enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
    assert.equal(aventuraRuntime.estado().etapa, 'plantar');

    // Canteiro a canteiro. Só o último toque fecha a etapa — é a partilha.
    for (let canteiro = 0; canteiro < beds; canteiro += 1) {
      for (let n = 0; n < porCanteiro; n += 1) {
        enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
      }
      const faltaCanteiro = canteiro < beds - 1;
      if (faltaCanteiro) {
        assert.equal(
          aventuraRuntime.estado().etapa,
          'plantar',
          'ainda falta canteiro: não avança'
        );
      }
    }
    assert.equal(aventuraRuntime.estado().etapa, 'regar');

    for (let canteiro = 0; canteiro < beds; canteiro += 1) {
      enviarEventoAventura({ tipo: 'distribuiu', item: 'agua', slot: canteiro });
    }

    // `mundo` e `recompensa` avançam sozinhos: o resumo já abre no fim da rega.
    assert.equal(aventuraRuntime.estado().etapa, 'fecho');
    assert.equal(coordenadorAtividade.estado().foco, 'resumo');

    const jogo = useGame.getState();
    assert.equal(jogo.worldFlags.horta_escola_viva, true);
    assert.ok(jogo.recompensas.includes('broto-da-escola'));
    assert.ok(jogo.descobertas.objetos.includes('semente'));
    assert.ok(jogo.descobertas.lugares.includes('MERCADO'));
    assert.ok(jogo.descobertas.lugares.includes('ESCOLA'));
    assert.ok(jogo.descobertas.contagens.includes(String(total)));

    assert.deepEqual(punicoes(), [], 'nenhuma tentativa contada');
    assert.equal(aventuraRuntime.estado().motor.tentativasTotal, 0);
    assert.equal(aventuraRuntime.estado().motor.ajudas, 0);

    enviarEventoAventura({ tipo: 'toque' });
    assert.equal(aventuraRuntime.estado().ativa, false, 'o resumo encerra');
    coordenadorAtividade.reiniciar();
  });
}

test('tocar de novo num canteiro cheio não empurra a etapa adiante', () => {
  mesaLimpa();
  assert.equal(iniciarHortaEscola('8-10'), true); // 6 sementes, 3 canteiros
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < 6; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });

  // Enche o canteiro 0 e insiste nele: nada acontece, nada quebra.
  enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: 0 });
  enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: 0 });
  for (let n = 0; n < 5; n += 1) {
    assert.equal(
      enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: 0 }),
      false,
      'canteiro cheio é no-op'
    );
  }
  assert.equal(aventuraRuntime.estado().etapa, 'plantar');
  assert.equal(aventuraRuntime.estado().motor.distribuido.length, 3);
  assert.deepEqual(punicoes(), [], 'insistir não é erro');

  // Completa os outros dois canteiros e rega — a etapa fecha no último, e o
  // módulo não fica com aventura ativa vazando pro teste seguinte.
  for (const canteiro of [1, 2]) {
    enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
    enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
  }
  assert.equal(aventuraRuntime.estado().etapa, 'regar');
  for (const canteiro of [0, 1, 2]) {
    enviarEventoAventura({ tipo: 'distribuiu', item: 'agua', slot: canteiro });
  }
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  coordenadorAtividade.reiniciar();
});

test('a definição de cada faixa deriva de HORTA_BANDS, sem número à mão', () => {
  for (const [band, cfg] of Object.entries(HORTA_BANDS)) {
    const def = criarHortaEscola(band);
    const etapa = Object.fromEntries(def.etapas.map((e) => [e.id, e]));

    assert.equal(def.faixa, band);
    assert.equal(def.faixaLabel, cfg.label);
    assert.equal(etapa['ir-ao-mercado'].lugar, 'MERCADO');
    assert.equal(etapa['pegar-sementes'].quantidade, cfg.total);
    assert.equal(etapa['pegar-sementes'].texto, cfg.task, 'reaproveita o texto da faixa');
    assert.equal(etapa['voltar-a-escola'].lugar, 'ESCOLA');
    assert.equal(etapa.plantar.slots, cfg.beds);
    assert.equal(etapa.plantar.porSlot, cfg.total / cfg.beds);
    assert.equal(etapa.regar.slots, cfg.beds);
    assert.equal(etapa.regar.porSlot, 1);
    assert.equal(etapa['horta-viva'].flag, 'horta_escola_viva');
    assert.equal(etapa.plantar.slots * etapa.plantar.porSlot, cfg.total, 'planta tudo que colheu');
  }
});

test('faixa desconhecida ou divisão quebrada não cria aventura nenhuma', () => {
  for (const ruim of ['invalida', undefined, null, '', 0]) {
    assert.equal(criarHortaEscola(ruim), null);
  }
});

/** Conclui a aventura em curso e fecha o resumo. */
function concluir(band) {
  jogarAteOResumo(band);
  enviarEventoAventura({ tipo: 'toque' });
}

test('uma aventura por vez — mas a horta já viva RECOMEÇA, e a flag continua', () => {
  mesaLimpa();
  assert.equal(iniciarHortaEscola('3-5'), true);
  assert.equal(iniciarHortaEscola('6-7'), false, 'já tem uma em curso');

  concluir('3-5');
  assert.equal(aventuraRuntime.estado().ativa, false);
  assert.equal(useGame.getState().worldFlags.horta_escola_viva, true);
  // A pilha se desfaz sozinha ao fim: liberar resumo, depois liberar em_missao.
  assert.equal(coordenadorAtividade.estado().foco, 'explorando');

  // A mudança no mundo é permanente; a brincadeira não é. Plantar de novo vale.
  assert.equal(iniciarHortaEscola('3-5'), true, 'a horta viva não tranca mais');
  assert.equal(
    useGame.getState().worldFlags.horta_escola_viva,
    true,
    'e a flag segue ligada durante a repetição'
  );

  concluir('3-5');
  mesaLimpa();
});

test('a segunda conclusão não entrega o adesivo de novo', () => {
  mesaLimpa();

  iniciarHortaEscola('3-5');
  concluir('3-5');
  const aposPrimeira = [...useGame.getState().recompensas];
  assert.deepEqual(aposPrimeira, ['broto-da-escola'], 'o adesivo é da primeira vez');

  assert.equal(iniciarHortaEscola('3-5'), true);
  concluir('3-5');

  assert.deepEqual(
    useGame.getState().recompensas,
    aposPrimeira,
    'registrarRecompensa já ignora repetido — nada de adesivo em dobro'
  );
  mesaLimpa();
});

test('a segunda conclusão não duplica descobertas', () => {
  mesaLimpa();

  iniciarHortaEscola('6-7'); // 4 sementes, 2 canteiros
  concluir('6-7');
  const aposPrimeira = structuredClone(useGame.getState().descobertas);
  assert.ok(aposPrimeira.objetos.includes('semente'));
  assert.ok(aposPrimeira.lugares.includes('MERCADO'));
  assert.ok(aposPrimeira.lugares.includes('ESCOLA'));
  assert.ok(aposPrimeira.contagens.includes('4'));

  assert.equal(iniciarHortaEscola('6-7'), true);
  concluir('6-7');

  assert.deepEqual(
    useGame.getState().descobertas,
    aposPrimeira,
    'listas idempotentes: nenhuma entrada repetida'
  );
  mesaLimpa();
});

test('concluída numa faixa, recomeça em OUTRA e vai até o fim sem punição', () => {
  mesaLimpa();

  iniciarHortaEscola('3-5'); // 3 sementes, 3 canteiros, 1 em cada
  concluir('3-5');

  // Faixa diferente: 6 sementes em 3 canteiros, 2 em cada.
  assert.equal(iniciarHortaEscola('8-10'), true);
  assert.equal(aventuraRuntime.estado().id, 'horta-escola-8-10');

  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().etapa, 'ir-ao-mercado');
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < 6; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  assert.equal(
    aventuraRuntime.estado().etapa,
    'voltar-a-escola',
    'a repetição conta 6, não os 3 da faixa anterior'
  );

  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (let canteiro = 0; canteiro < 3; canteiro += 1) {
    enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
    enviarEventoAventura({ tipo: 'distribuiu', item: 'semente', slot: canteiro });
  }
  assert.equal(aventuraRuntime.estado().etapa, 'regar', '2 em cada um dos 3');
  for (let canteiro = 0; canteiro < 3; canteiro += 1) {
    enviarEventoAventura({ tipo: 'distribuiu', item: 'agua', slot: canteiro });
  }

  assert.equal(aventuraRuntime.estado().etapa, 'fecho');
  assert.equal(coordenadorAtividade.estado().foco, 'resumo');
  assert.deepEqual(punicoes(), [], 'repetir não pune');
  assert.equal(aventuraRuntime.estado().motor.tentativasTotal, 0);
  assert.ok(useGame.getState().descobertas.contagens.includes('6'), 'contagem nova entra');

  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  mesaLimpa();
});
