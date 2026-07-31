import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coordenadorAtividade } from '../src/activity/index.js';
import {
  aventuraRuntime,
  enviarEventoAventura,
  iniciarParqueComSede,
} from '../src/adventure/runtime.js';
import { useGame } from '../src/store/useGame.js';

test('runtime aplica foco, bloqueia eventos escondidos e grava a consequência', () => {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();

  assert.equal(iniciarParqueComSede(), true);
  assert.equal(coordenadorAtividade.estado().foco, 'historia');
  assert.equal(coordenadorAtividade.estado().mundo, false);
  assert.equal(enviarEventoAventura({ tipo: 'chegou', lugar: 'PORTO' }), false);

  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(coordenadorAtividade.estado().foco, 'pergunta');
  enviarEventoAventura({ tipo: 'respondeu', opcao: 'agua' });
  assert.equal(aventuraRuntime.estado().etapa, 'ir-ao-porto');

  enviarEventoAventura({ tipo: 'chegou', lugar: 'PORTO' });
  for (let n = 0; n < 4; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'PARQUE' });

  const jogo = useGame.getState();
  assert.equal(jogo.worldFlags.parque_florido, true);
  assert.ok(jogo.recompensas.includes('regador-no-teto'));
  assert.ok(jogo.descobertas.objetos.includes('agua'));
  assert.equal(coordenadorAtividade.estado().foco, 'resumo');

  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  coordenadorAtividade.reiniciar();
});

