import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  criarCoordenadorAtividade,
  ESPEC_ATIVIDADE,
} from '../src/activity/activity-machine.js';

test('pergunta e caderninho bloqueiam direção; posto e garagem não criam softlock', () => {
  const c = criarCoordenadorAtividade();
  assert.equal(c.podeDirigir(), true);

  c.pedirFoco('pergunta');
  assert.equal(c.podeDirigir(), false);
  c.liberar('pergunta');

  c.pedirFoco('caderninho');
  assert.equal(c.podeDirigir(), false);
  c.liberar('caderninho');

  for (const atividade of ['abastecendo', 'garagem']) {
    c.pedirFoco(atividade);
    assert.equal(c.podeDirigir(), true, `${atividade} precisa permitir sair da zona`);
    c.liberar(atividade);
  }
});

test('carona suspende missão, bloqueia sua voz e a devolve ao terminar', () => {
  const chamadas = [];
  const voz = {
    falar: (texto) => {
      chamadas.push(['falar', texto]);
      return true;
    },
    calar: () => chamadas.push(['calar']),
  };
  const c = criarCoordenadorAtividade({ voz });

  c.pedirFoco('em_missao');
  assert.equal(c.falar('em_missao', 'Vamos ao parque'), true);
  c.pedirFoco('carona');

  assert.equal(c.falar('em_missao', 'fala de fundo'), false);
  assert.equal(c.falar('carona', 'Sobe aqui!'), true);
  assert.equal(c.liberar('carona'), true);
  assert.equal(c.temFoco('em_missao'), true);
  assert.ok(chamadas.filter(([tipo]) => tipo === 'calar').length >= 3);
});

test('painel não interrompível só cede à pausa', () => {
  const c = criarCoordenadorAtividade();
  c.pedirFoco('garagem');

  assert.equal(c.pedirFoco('pergunta'), false);
  assert.equal(c.pedirFoco('carona'), false);
  assert.equal(c.pausar(), true);
  assert.equal(c.estado().foco, 'pausado');
  assert.equal(c.retomar(), true);
  assert.equal(c.estado().foco, 'garagem');
});

test('chamado da aventura congela o mundo e devolve a missão ao continuar', () => {
  const c = criarCoordenadorAtividade();
  c.pedirFoco('em_missao');
  c.pedirFoco('historia');
  assert.equal(c.estado().mundo, false);
  assert.equal(c.podeDirigir(), false);
  assert.equal(c.pedirFoco('pergunta'), false);
  c.liberar('historia');
  assert.equal(c.estado().foco, 'em_missao');
});

test('não duplica atividade suspensa na pilha', () => {
  const c = criarCoordenadorAtividade();
  c.pedirFoco('em_missao');
  c.pedirFoco('carona');

  assert.equal(c.pedirFoco('em_missao'), false);
  assert.deepEqual(c.estado().pilha, ['explorando', 'em_missao', 'carona']);
});

test('snapshot mantém identidade enquanto não há transição e notifica só em mudança', () => {
  const c = criarCoordenadorAtividade();
  const primeiro = c.estado();
  let notificacoes = 0;
  const sair = c.assinar(() => { notificacoes += 1; });

  assert.equal(c.estado(), primeiro);
  c.pedirFoco('explorando');
  assert.equal(notificacoes, 0);

  c.pedirFoco('em_missao');
  assert.equal(notificacoes, 1);
  assert.notEqual(c.estado(), primeiro);
  sair();
});

test('tabela de atividades cobre as políticas futuras sem bloquear a base', () => {
  assert.equal(ESPEC_ATIVIDADE.explorando.dirigir, true);
  assert.equal(ESPEC_ATIVIDADE.resumo.dirigir, false);
  assert.equal(ESPEC_ATIVIDADE.pausado.voz, false);
  assert.equal(ESPEC_ATIVIDADE.historia.mundo, false);
});
