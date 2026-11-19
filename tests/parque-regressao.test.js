import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coordenadorAtividade } from '../src/activity/index.js';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';
import {
  aventuraRuntime,
  enviarEventoAventura,
  iniciarParqueComSede,
} from '../src/adventure/runtime.js';
import { useGame } from '../src/store/useGame.js';
import { ROTEIROS_PARQUE } from './fixtures/roteiro-parque.mjs';

/**
 * REGRESSÃO DO PARQUE (H1) — a Horta mexe no motor (convite com AGORA NÃO,
 * item no contador do repartir). A aventura do parque tem de se comportar
 * EXATAMENTE como antes: mesma sequência de efeitos, evento a evento, contra a
 * gravação feita com o motor anterior à H1
 * (fixtures/parque-com-sede-efeitos.json).
 *
 * H3 (19/11/2026): regravado SÓ nas três linhas e na fala do resumo (regra
 * de texto: a ação observada, não a habilidade suposta). Todo o resto da
 * gravação ficou idêntico.
 */

const GRAVADO = JSON.parse(
  readFileSync(new URL('./fixtures/parque-com-sede-efeitos.json', import.meta.url), 'utf8')
);

for (const [nome, eventos] of Object.entries(ROTEIROS_PARQUE)) {
  test(`motor: o parque produz os mesmos efeitos de antes (roteiro "${nome}")`, () => {
    const aventura = criarAventura(PARQUE_COM_SEDE);
    const esperado = GRAVADO[nome];
    assert.deepEqual(aventura.iniciar(), esperado.iniciar, 'início');
    eventos.forEach((evento, i) => {
      const efeitos = aventura.enviar(evento);
      assert.deepEqual(efeitos, esperado.passos[i].efeitos, `passo ${i}: ${JSON.stringify(evento)}`);
      assert.equal(aventura.etapa()?.id ?? null, esperado.passos[i].etapa, `etapa no passo ${i}`);
    });
    assert.deepEqual(aventura.estado(), esperado.final, 'estado final');
  });
}

test('runtime: o parque começa sozinho, percorre as etapas e grava flag e recompensa', () => {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();

  // início sozinho: o AdventureController chama isto a cada troca de foco
  assert.equal(iniciarParqueComSede(), true);
  const painel = aventuraRuntime.estado().painel;
  assert.equal(painel.tipo, 'mensagem');
  assert.equal(painel.botao, 'VAMOS AJUDAR!');
  assert.equal(painel.botaoSecundario ?? null, null, 'o parque não tem AGORA NÃO');
  assert.equal(enviarEventoAventura({ tipo: 'recusar' }), false, 'recusar não existe no parque');
  assert.equal(aventuraRuntime.estado().ativa, true);

  const etapas = [aventuraRuntime.estado().etapa];
  const passo = (evento) => {
    enviarEventoAventura(evento);
    const etapa = aventuraRuntime.estado().etapa;
    if (etapas[etapas.length - 1] !== etapa) etapas.push(etapa);
  };
  passo({ tipo: 'toque' });
  passo({ tipo: 'respondeu', opcao: 'agua' });
  passo({ tipo: 'chegou', lugar: 'PORTO' });
  for (let n = 0; n < 4; n += 1) passo({ tipo: 'coletou', item: 'balde_agua', quantidade: 1 });
  passo({ tipo: 'chegou', lugar: 'PARQUE' });
  assert.deepEqual(etapas, ['chamado', 'saber', 'ir-ao-porto', 'contar-baldes', 'voltar-ao-parque', 'fecho']);

  const jogo = useGame.getState();
  assert.equal(jogo.worldFlags.parque_florido, true);
  assert.deepEqual(jogo.recompensas, ['flor-do-parque', 'regador-no-teto']);
  assert.deepEqual(jogo.descobertas.objetos, ['agua', 'flor-do-parque']);
  assert.ok(jogo.descobertas.lugares.includes('PORTO'));
  assert.ok(jogo.descobertas.lugares.includes('PARQUE'));
  assert.ok(jogo.descobertas.contagens.includes('4'));

  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  assert.equal(coordenadorAtividade.estado().foco, 'explorando');

  // florido, o parque não recomeça (ao contrário da Horta)
  assert.equal(iniciarParqueComSede(), false);
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
});
