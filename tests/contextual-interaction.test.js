import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const registry = await import('../src/interactions/contextual-interactions.js');
const { useGame } = await import('../src/store/useGame.js');
const { CHAVE_SAVE, SAVE_VERSION } = await import('../src/save.js');

beforeEach(() => {
  registry.CAPACIDADES_CONTEXTUAIS.PADARIA = true;
  useGame.getState().resetar();
});

test('registry contextual reconhece os lugares habilitados e preserva os legados', async () => {
  let registry = null;
  try {
    registry = await import('../src/interactions/contextual-interactions.js');
  } catch (_) {
    // RED explícito: o módulo ainda não existe.
  }

  assert.ok(registry, 'registry contextual ainda não foi implementado');
  assert.equal(registry.temInteracaoContextual('PADARIA'), true);
  assert.equal(registry.temInteracaoContextual('ESCOLA'), true);
  assert.equal(registry.temInteracaoContextual('MERCADO'), false);
  assert.equal(registry.temInteracaoContextual('ZOO'), false);
});

test('factory congela origem e estado inicial de missão ou exploração', async () => {
  const registry = await import('../src/interactions/contextual-interactions.js');
  assert.equal(
    typeof registry.criarInteracaoContextual,
    'function',
    'factory contextual ainda não foi implementada'
  );

  const missao = registry.criarInteracaoContextual('PADARIA', 'missao', () => 0);
  const exploracao = registry.criarInteracaoContextual('PADARIA', 'exploracao', () => 0.99);

  assert.deepEqual(missao, {
    tipo: 'padaria-paes-v1',
    lugar: 'PADARIA',
    origem: 'missao',
    alvo: 2,
    status: 'aguardando-celebracao',
  });
  assert.deepEqual(exploracao, {
    tipo: 'padaria-paes-v1',
    lugar: 'PADARIA',
    origem: 'exploracao',
    alvo: 5,
    status: 'ativa',
  });
  assert.equal(registry.criarInteracaoContextual('MERCADO', 'exploracao'), null);
});

test('roteamento usa somente lugar e resultado da chegada, sem filtro de tipo', async () => {
  const registry = await import('../src/interactions/contextual-interactions.js');
  assert.equal(
    typeof registry.encaminharChegadaContextual,
    'function',
    'roteamento contextual ainda não foi implementado'
  );

  for (const tipoFixture of ['gps', 'ciencias']) {
    const chamadas = [];
    const encaminhou = registry.encaminharChegadaContextual('PADARIA', true, {
      preparar: (lugar, origem) => chamadas.push({ lugar, origem }),
      abrir: () => assert.fail(`não deve abrir imediatamente para ${tipoFixture}`),
    });
    assert.equal(encaminhou, true);
    assert.deepEqual(chamadas, [{ lugar: 'PADARIA', origem: 'missao' }]);
  }

  const exploracao = [];
  assert.equal(
    registry.encaminharChegadaContextual('PADARIA', false, {
      preparar: () => assert.fail('exploração não prepara celebração'),
      abrir: (lugar, origem) => exploracao.push({ lugar, origem }),
    }),
    true
  );
  assert.deepEqual(exploracao, [{ lugar: 'PADARIA', origem: 'exploracao' }]);

  assert.equal(
    registry.encaminharChegadaContextual('MERCADO', false, {
      preparar: () => assert.fail('lugar legado não prepara contexto'),
      abrir: () => assert.fail('lugar legado não abre contexto'),
    }),
    false
  );

  assert.equal(
    registry.encaminharChegadaContextual(
      'PADARIA',
      false,
      {
        preparar: () => assert.fail('fluxo prioritário não prepara contexto'),
        abrir: () => assert.fail('fluxo prioritário não abre contexto'),
      },
      { bloqueado: true }
    ),
    false
  );
});

test('exploração na Padaria abre contexto e preserva a missão incompatível', () => {
  assert.equal(
    typeof useGame.getState().abrirInteracaoContextual,
    'function',
    'ação de abertura contextual ainda não foi implementada'
  );

  const missao = { tipo: 'gps', destino: 'HOSPITAL', concluida: false };
  useGame.setState({ missao });
  const processada = useGame.getState().processarChegada('PADARIA');
  assert.equal(processada, false);

  const encaminhou = registry.encaminharChegadaContextual('PADARIA', processada, {
    preparar: useGame.getState().prepararInteracaoContextual,
    abrir: useGame.getState().abrirInteracaoContextual,
  });

  assert.equal(encaminhou, true);
  assert.deepEqual(useGame.getState().missao, missao);
  assert.equal(useGame.getState().interacaoContextual?.origem, 'exploracao');
  assert.equal(useGame.getState().interacaoContextual?.status, 'ativa');
});

test('chegada válida da Padaria prepara handoff sem filtro paralelo GPS/Ciências', () => {
  assert.equal(
    typeof useGame.getState().prepararInteracaoContextual,
    'function',
    'ação de preparo contextual ainda não foi implementada'
  );

  for (const missao of [
    { tipo: 'gps', destino: 'PADARIA', concluida: false },
    { tipo: 'ciencias', destino: 'PADARIA', animal: 'GATO', concluida: false },
  ]) {
    useGame.getState().resetar();
    useGame.setState({ missao });

    const processada = useGame.getState().processarChegada('PADARIA');
    assert.equal(processada, true, missao.tipo);
    assert.equal(
      registry.encaminharChegadaContextual('PADARIA', processada, {
        preparar: useGame.getState().prepararInteracaoContextual,
        abrir: useGame.getState().abrirInteracaoContextual,
      }),
      true,
      missao.tipo
    );

    const contexto = useGame.getState().interacaoContextual;
    assert.equal(contexto?.origem, 'missao', missao.tipo);
    assert.equal(contexto?.status, 'aguardando-celebracao', missao.tipo);
    assert.equal('contagem_contextual_v1' in useGame.getState().habilidades, false);
  }
});

test('callback pós-celebração ativa o handoff de missão sem ChegadaViva simultânea', () => {
  assert.equal(
    typeof useGame.getState().ativarInteracaoContextualPendente,
    'function',
    'ativação pós-celebração ainda não foi implementada'
  );

  useGame.setState({
    missao: { tipo: 'gps', destino: 'PADARIA', concluida: false },
  });
  const processada = useGame.getState().processarChegada('PADARIA');
  registry.encaminharChegadaContextual('PADARIA', processada, {
    preparar: useGame.getState().prepararInteracaoContextual,
    abrir: useGame.getState().abrirInteracaoContextual,
  });

  assert.equal(useGame.getState().ativarInteracaoContextualPendente('PADARIA'), true);
  assert.equal(useGame.getState().interacaoContextual?.origem, 'missao');
  assert.equal(useGame.getState().interacaoContextual?.status, 'ativa');
  assert.equal(useGame.getState().chegadaViva, null);
  assert.equal(useGame.getState().ativarInteracaoContextualPendente('PADARIA'), false);
});

test('capacidade desabilitada executa o fallback legado existente da Padaria', () => {
  assert.equal(
    typeof registry.resolverPosCelebracaoContextual,
    'function',
    'resolver pós-celebração ainda não foi implementado'
  );

  registry.CAPACIDADES_CONTEXTUAIS.PADARIA = false;
  useGame.setState({
    missao: { tipo: 'gps', destino: 'PADARIA', concluida: false },
  });
  const processada = useGame.getState().processarChegada('PADARIA');
  assert.equal(
    registry.encaminharChegadaContextual('PADARIA', processada, {
      preparar: useGame.getState().prepararInteracaoContextual,
      abrir: useGame.getState().abrirInteracaoContextual,
    }),
    false
  );

  const resultado = registry.resolverPosCelebracaoContextual('PADARIA', {
    ativar: useGame.getState().ativarInteracaoContextualPendente,
    fallback: () => useGame.getState().abrirChegadaViva('PADARIA'),
  });

  assert.equal(resultado, 'legado');
  assert.equal(useGame.getState().interacaoContextual, null);
  assert.ok(useGame.getState().chegadaViva);
});

test('abertura contextual concorrente é recusada sem sobrescrever a ativa', () => {
  assert.equal(useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao'), true);
  const primeira = useGame.getState().interacaoContextual;

  assert.equal(useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao'), false);
  assert.equal(useGame.getState().prepararInteracaoContextual('PADARIA', 'missao'), false);
  assert.deepEqual(useGame.getState().interacaoContextual, primeira);
});

test('abertura contextual recusa painéis incompatíveis já ativos', () => {
  const cenarios = [
    { chegadaViva: { lugar: 'ZOO' } },
    { caderninhoAberto: true },
    { garagemPerto: true },
    { postoPerto: true, combustivel: 50 },
  ];

  for (const estado of cenarios) {
    useGame.getState().resetar();
    useGame.setState(estado);
    assert.equal(useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao'), false);
    assert.equal(useGame.getState().interacaoContextual, null);
  }
});

test('conclusão 02.A é idempotente e grava zero Learning Data contextual', () => {
  assert.equal(
    typeof useGame.getState().concluirInteracaoContextual,
    'function',
    'conclusão funcional ainda não foi implementada'
  );
  useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao');
  const alvo = useGame.getState().interacaoContextual.alvo;
  const habilidadesAntes = structuredClone(useGame.getState().habilidades);
  const descobertasAntes = structuredClone(useGame.getState().descobertas);

  assert.equal(useGame.getState().concluirInteracaoContextual({ quantidade: alvo + 1 }), false);
  assert.equal(useGame.getState().interacaoContextual.status, 'ativa');
  assert.equal(useGame.getState().concluirInteracaoContextual({ quantidade: alvo }), true);
  assert.equal(useGame.getState().interacaoContextual.status, 'concluida');
  assert.equal(useGame.getState().concluirInteracaoContextual({ quantidade: alvo }), false);

  assert.deepEqual(useGame.getState().habilidades, habilidadesAntes);
  assert.deepEqual(useGame.getState().descobertas, descobertasAntes);
  assert.equal('contagem_contextual_v1' in useGame.getState().habilidades, false);
});

test('encerrar exploração e resetar limpam o contexto sem alterar a missão', () => {
  assert.equal(
    typeof useGame.getState().encerrarInteracaoContextual,
    'function',
    'encerramento contextual ainda não foi implementado'
  );
  const missao = { tipo: 'gps', destino: 'HOSPITAL', concluida: false };
  useGame.setState({ missao });
  useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao');

  assert.equal(useGame.getState().encerrarInteracaoContextual(), true);
  assert.equal(useGame.getState().interacaoContextual, null);
  assert.deepEqual(useGame.getState().missao, missao);
  assert.equal(useGame.getState().encerrarInteracaoContextual(), false);

  useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao');
  useGame.getState().resetar();
  assert.equal(useGame.getState().interacaoContextual, null);
});

test('encerrar interação de missão delega a próxima missão uma única vez', () => {
  const proximaOriginal = useGame.getState().proximaMissao;
  let chamadas = 0;
  useGame.setState({ proximaMissao: () => { chamadas += 1; } });
  try {
    useGame.getState().prepararInteracaoContextual('PADARIA', 'missao');
    useGame.getState().ativarInteracaoContextualPendente('PADARIA');

    assert.equal(useGame.getState().encerrarInteracaoContextual(), true);
    assert.equal(useGame.getState().encerrarInteracaoContextual(), false);
    assert.equal(chamadas, 1);
  } finally {
    useGame.setState({ proximaMissao: proximaOriginal });
  }
});

test('falha de ativação descarta handoff pendente antes do fallback legado', () => {
  assert.equal(
    typeof useGame.getState().descartarInteracaoContextualPendente,
    'function',
    'limpeza de handoff pendente ainda não foi implementada'
  );
  useGame.getState().prepararInteracaoContextual('PADARIA', 'missao');
  registry.CAPACIDADES_CONTEXTUAIS.PADARIA = false;

  const resultado = registry.resolverPosCelebracaoContextual('PADARIA', {
    ativar: useGame.getState().ativarInteracaoContextualPendente,
    limpar: useGame.getState().descartarInteracaoContextualPendente,
    fallback: () => useGame.getState().abrirChegadaViva('PADARIA'),
  });

  assert.equal(resultado, 'legado');
  assert.equal(useGame.getState().interacaoContextual, null);
  assert.ok(useGame.getState().chegadaViva);
});

test('save v6 preserva exatamente 11 campos e exclui estado contextual', () => {
  useGame.getState().abrirInteracaoContextual('PADARIA', 'exploracao');
  const envelope = JSON.parse(storage.get(CHAVE_SAVE));
  const campos = Object.keys(envelope.state).sort();

  assert.equal(envelope.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION, 6);
  assert.deepEqual(campos, [
    'combustivel',
    'corCarro',
    'coresCompradas',
    'desbloqueados',
    'descobertas',
    'habilidades',
    'introVista',
    'missao',
    'moedas',
    'nome',
    'veiculo',
  ]);
  assert.equal('interacaoContextual' in envelope.state, false);
  assert.equal('contagem_contextual_v1' in envelope.state.habilidades, false);
});

test('input só é bloqueado enquanto a interação contextual está na superfície', () => {
  assert.equal(
    typeof registry.interacaoContextualBloqueiaInput,
    'function',
    'contrato de bloqueio de input ainda não foi implementado'
  );
  assert.equal(registry.interacaoContextualBloqueiaInput(null), false);
  assert.equal(registry.interacaoContextualBloqueiaInput({ status: 'aguardando-celebracao' }), false);
  assert.equal(registry.interacaoContextualBloqueiaInput({ status: 'ativa' }), true);
  assert.equal(registry.interacaoContextualBloqueiaInput({ status: 'concluida' }), true);
});

test('tipo contextual desconhecido falha fechado sem concluir ou avançar missão', () => {
  const proximaOriginal = useGame.getState().proximaMissao;
  let chamadas = 0;
  useGame.setState({
    interacaoContextual: {
      tipo: 'tipo-futuro-desconhecido',
      lugar: 'PADARIA',
      origem: 'missao',
      alvo: 2,
      status: 'ativa',
    },
    proximaMissao: () => { chamadas += 1; },
  });
  try {
    assert.equal(useGame.getState().concluirInteracaoContextual({ quantidade: 2 }), false);
    assert.equal(useGame.getState().encerrarInteracaoContextual(), false);
    assert.equal(chamadas, 0);
    assert.equal(useGame.getState().interacaoContextual?.tipo, 'tipo-futuro-desconhecido');
  } finally {
    useGame.setState({ proximaMissao: proximaOriginal, interacaoContextual: null });
  }
});
