import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { coordenadorAtividade } from '../src/activity/index.js';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { PARQUE_COM_SEDE } from '../src/adventure/parque-com-sede.js';
import {
  aventuraRuntime,
  enviarEventoAventura,
  iniciarHortaEscola,
} from '../src/adventure/runtime.js';
import { FAIXA_HORTA_PADRAO, criarConviteHorta } from '../src/adventure/convites.js';
import { ITENS_POR_ETAPA, itensDaEtapa } from '../src/adventure/itens.js';
import { cartaoDistribuir, eventoDoCanteiro } from '../src/adventure/distribuir.js';
import { CAMINHOS, LARGURA_RUA, TENSAO_RUA } from '../src/city/ruas.js';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { colisoresDoMercado } from '../src/visual/estilo-real/mercado.js';
import { CATEGORIAS_CADERNINHO, conteudoDescoberta } from '../src/missions/descobertas.js';
import { HORTA_BANDS } from '../src/school/horta.js';
import { criarHortaEscola } from '../src/school/horta-aventura.js';
import { useGame } from '../src/store/useGame.js';

/**
 * H1 — A HORTA JOGÁVEL (faixa 3–5). O motor já percorria a Horta; a H1 liga
 * o que a criança vê: convite na chegada à ESCOLA (uma vez por sessão, com
 * AGORA NÃO), sacos de semente no MERCADO coletados dirigindo, cartão de
 * repartir na ESCOLA, resumo e os adesivos no Caderninho.
 */

function mesaLimpa() {
  coordenadorAtividade.reiniciar();
  useGame.getState().resetar();
}

/** Do convite (já aberto) até o painel de resumo, como a criança jogaria. */
function jogarDoConviteAoResumo(band = FAIXA_HORTA_PADRAO) {
  const { total, beds } = HORTA_BANDS[band];
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < total; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < beds; canteiro += 1) {
      while (true) {
        const cartao = cartaoDistribuir(aventuraRuntime.estado());
        if (!cartao || cartao.item !== item || cartao.canteiros[canteiro].cheio) break;
        enviarEventoAventura(eventoDoCanteiro(cartao, canteiro));
      }
    }
  }
}

/** Leva o roteiro até a parada ESCOLA concluída (a 2ª do dia). */
function chegarNaEscolaDoRoteiro() {
  const jogo = useGame.getState();
  jogo.proximaMissao(); // parada 1: PADARIA
  useGame.getState().proximaMissao(); // parada 2: ESCOLA
  assert.equal(useGame.getState().missao.destino, 'ESCOLA');
  coordenadorAtividade.pedirFoco('em_missao');
  assert.equal(useGame.getState().processarChegada('ESCOLA'), true);
  return useGame.getState().missao;
}

// ---------------------------------------------------------------- convite

test('faixa padrão da Horta é 3–5 até a H4', () => {
  assert.equal(FAIXA_HORTA_PADRAO, '3-5');
});

test('convite: só na parada ESCOLA concluída, uma vez por sessão', () => {
  const pedidos = [];
  const convite = criarConviteHorta((band) => (pedidos.push(band), true));
  assert.equal(convite.tentar({ tipo: 'gps', destino: 'PADARIA', concluida: true }), false);
  assert.equal(convite.tentar({ tipo: 'gps', destino: 'ESCOLA', concluida: false }), false);
  assert.equal(convite.tentar(null), false);
  assert.deepEqual(pedidos, []);

  assert.equal(convite.tentar({ tipo: 'gps', destino: 'ESCOLA', concluida: true }), true);
  assert.deepEqual(pedidos, ['3-5']);
  assert.equal(
    convite.tentar({ tipo: 'gps', destino: 'ESCOLA', concluida: true }),
    false,
    'a segunda passagem pela ESCOLA na mesma sessão não convida'
  );
  assert.deepEqual(pedidos, ['3-5']);
});

test('convite que não pôde abrir (foco ocupado) não conta como feito', () => {
  let livre = false;
  const convite = criarConviteHorta(() => livre);
  const escola = { tipo: 'gps', destino: 'ESCOLA', concluida: true };
  assert.equal(convite.tentar(escola), false);
  livre = true;
  assert.equal(convite.tentar(escola), true, 'tenta de novo na próxima passagem');
});

test('convite com outra atividade em foco: a Horta não começa por baixo', () => {
  mesaLimpa();
  coordenadorAtividade.pedirFoco('abastecendo');
  const convite = criarConviteHorta(iniciarHortaEscola);
  assert.equal(convite.tentar({ tipo: 'gps', destino: 'ESCOLA', concluida: true }), false);
  assert.equal(aventuraRuntime.estado().ativa, false);
  coordenadorAtividade.liberar('abastecendo');
  mesaLimpa();
});

test('na ESCOLA do roteiro: a Horta abre o convite e o roteiro avança calado para o ESTÁDIO', () => {
  mesaLimpa();
  const missao = chegarNaEscolaDoRoteiro();
  const convite = criarConviteHorta(iniciarHortaEscola);

  // a ordem do MissionController: primeiro a Horta, depois a próxima parada
  assert.equal(convite.tentar(missao), true);
  useGame.getState().proximaMissao();

  assert.equal(aventuraRuntime.estado().ativa, true);
  assert.equal(aventuraRuntime.estado().id, 'horta-escola-3-5');
  assert.equal(coordenadorAtividade.estado().foco, 'historia');
  const painel = aventuraRuntime.estado().painel;
  assert.equal(painel.tipo, 'mensagem');
  assert.equal(painel.botao, 'VAMOS!');
  assert.equal(painel.botaoSecundario, 'AGORA NÃO');
  assert.deepEqual(useGame.getState().missao, {
    tipo: 'gps',
    destino: 'ESTÁDIO',
    concluida: false,
  });

  // AGORA NÃO: encerra sem recompensa, sem flag, sem descoberta da Horta
  const descobertasAntes = structuredClone(useGame.getState().descobertas);
  assert.equal(enviarEventoAventura({ tipo: 'recusar' }), true);
  assert.equal(aventuraRuntime.estado().ativa, false);
  assert.equal(aventuraRuntime.estado().painel, null);
  const jogo = useGame.getState();
  assert.deepEqual(jogo.recompensas, []);
  assert.equal(jogo.worldFlags.horta_escola_viva ?? false, false);
  assert.deepEqual(jogo.descobertas, descobertasAntes);
  assert.deepEqual(jogo.missao, { tipo: 'gps', destino: 'ESTÁDIO', concluida: false });
  assert.notEqual(coordenadorAtividade.estado().foco, 'historia', 'o painel liberou o foco');
  assert.equal(
    aventuraRuntime.estado().eventos.filter((e) => e.evento === 'tentativa').length,
    0,
    'recusar não é erro'
  );
  mesaLimpa();
});

test('AGORA NÃO só vale no convite: depois dele, recusar não faz nada', () => {
  mesaLimpa();
  assert.equal(iniciarHortaEscola('3-5'), true);
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().etapa, 'ir-ao-mercado');
  assert.equal(enviarEventoAventura({ tipo: 'recusar' }), false);
  assert.equal(aventuraRuntime.estado().ativa, true);
  jogarDoConviteAoResumoDaqui();
  mesaLimpa();
});

/** Termina a Horta 3–5 a partir de "ir ao mercado". */
function jogarDoConviteAoResumoDaqui() {
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  for (let n = 0; n < 3; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < 3; canteiro += 1) {
      enviarEventoAventura({ tipo: 'distribuiu', item, slot: canteiro });
    }
  }
  enviarEventoAventura({ tipo: 'toque' });
}

test('motor: recusar numa fala sem botão secundário é ignorado', () => {
  const aventura = criarAventura(PARQUE_COM_SEDE);
  aventura.iniciar();
  assert.deepEqual(aventura.enviar({ tipo: 'recusar' }), []);
  assert.equal(aventura.etapa().id, 'chamado');
});

// ------------------------------------------------- sessões e recompensa

test('nova sessão depois da conclusão: convida de novo e não duplica recompensa', () => {
  mesaLimpa();
  const escola = { tipo: 'gps', destino: 'ESCOLA', concluida: true };

  const sessao1 = criarConviteHorta(iniciarHortaEscola);
  assert.equal(sessao1.tentar(escola), true);
  jogarDoConviteAoResumo();
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(useGame.getState().worldFlags.horta_escola_viva, true);
  const recompensas = [...useGame.getState().recompensas];
  const descobertas = structuredClone(useGame.getState().descobertas);
  assert.deepEqual(recompensas, ['broto-da-escola']);
  assert.equal(sessao1.tentar(escola), false, 'mesma sessão: não convida de novo');

  const sessao2 = criarConviteHorta(iniciarHortaEscola);
  assert.equal(sessao2.tentar(escola), true, 'a horta viva não tranca o convite');
  jogarDoConviteAoResumo();
  assert.equal(coordenadorAtividade.estado().foco, 'resumo');
  enviarEventoAventura({ tipo: 'toque' });
  assert.deepEqual(useGame.getState().recompensas, recompensas, 'adesivo só na primeira');
  assert.deepEqual(useGame.getState().descobertas, descobertas, 'nenhuma descoberta repetida');
  mesaLimpa();
});

// ---------------------------------------------------------------- coleta

test('coleta: a Horta pede saquinhos de semente dirigindo, contados por extenso', () => {
  const def = criarHortaEscola('3-5');
  const coletar = def.etapas.find((e) => e.id === 'pegar-sementes');
  assert.equal(coletar.tipo, 'coletar');
  assert.equal(coletar.item, 'semente');
  // H3 (j): cada saquinho carrega uma semente.
  assert.equal(coletar.texto, 'Pegue três saquinhos. Cada um tem uma semente.');
});

test('coleta: os baldes do parque não mudam e os sacos usam o item da Horta', () => {
  assert.deepEqual(ITENS_POR_ETAPA['contar-baldes'].posicoes, [
    [-44, 8], [-44, 14], [-44, 20], [-44, 26],
  ]);
  assert.equal(ITENS_POR_ETAPA['contar-baldes'].item, 'balde_agua');
  assert.equal(ITENS_POR_ETAPA['pegar-sementes'].item, 'semente');
  const maior = Math.max(...Object.values(HORTA_BANDS).map((b) => b.total));
  assert.ok(ITENS_POR_ETAPA['pegar-sementes'].posicoes.length >= maior, 'cabe a maior faixa');
});

test('coleta: mostra só a quantidade pedida, e nada fora da etapa', () => {
  assert.equal(itensDaEtapa('ir-ao-mercado', null), null);
  assert.equal(itensDaEtapa(null, null), null);
  const tres = itensDaEtapa('pegar-sementes', { atual: 0, total: 3 });
  assert.equal(tres.item, 'semente');
  assert.equal(tres.posicoes.length, 3);
  assert.equal(itensDaEtapa('pegar-sementes', { atual: 0, total: 6 }).posicoes.length, 6);
  assert.equal(itensDaEtapa('contar-baldes', { atual: 0, total: 4 }).posicoes.length, 4);
});

test('coleta: os sacos ficam na rua em frente ao MERCADO, fora de prédios e da banca', () => {
  const eixo = new THREE.CatmullRomCurve3(
    CAMINHOS[1].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    'catmullrom',
    TENSAO_RUA
  ).getSpacedPoints(800);
  const mercado = TODOS_PREDIOS.find((p) => p.slug === 'MERCADO');
  const banca = colisoresDoMercado(mercado.size)[0];
  const posicoes = ITENS_POR_ETAPA['pegar-sementes'].posicoes;

  for (const [x, z] of posicoes) {
    const distRua = Math.min(...eixo.map((p) => Math.hypot(p.x - x, p.z - z)));
    assert.ok(distRua <= LARGURA_RUA / 2 - 0.5, `(${x}, ${z}) no leito: ${distRua.toFixed(2)}`);
    for (const predio of TODOS_PREDIOS) {
      const [px, pz] = predio.pos;
      const [w, , l] = predio.size;
      const dentro = Math.abs(x - px) < w / 2 + 1 && Math.abs(z - pz) < l / 2 + 1;
      assert.equal(dentro, false, `(${x}, ${z}) dentro de ${predio.slug}`);
    }
    const bx = mercado.pos[0] + banca.posicao[0];
    const bz = mercado.pos[1] + banca.posicao[2];
    assert.ok(
      Math.abs(x - bx) > banca.meiaExtensao[0] + 1 || Math.abs(z - bz) > banca.meiaExtensao[2] + 1,
      'longe da banca'
    );
    const [mx, mz] = mercado.pos;
    assert.ok(Math.hypot(x - mx, z - mz) < 20, 'perto do MERCADO');
  }
  for (let i = 0; i < posicoes.length; i += 1) {
    for (let j = i + 1; j < posicoes.length; j += 1) {
      const d = Math.hypot(posicoes[i][0] - posicoes[j][0], posicoes[i][1] - posicoes[j][1]);
      assert.ok(d >= 4, `sacos ${i} e ${j} a ${d.toFixed(2)}`);
    }
  }
});

// -------------------------------------------------------- cartão de repartir

test('cartão de repartir: só aparece nas etapas de repartir, com o item certo', () => {
  mesaLimpa();
  assert.equal(cartaoDistribuir(aventuraRuntime.estado()), null, 'sem aventura');
  iniciarHortaEscola('3-5');
  assert.equal(cartaoDistribuir(aventuraRuntime.estado()), null, 'no convite');
  enviarEventoAventura({ tipo: 'toque' });
  enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' });
  assert.equal(cartaoDistribuir(aventuraRuntime.estado()), null, 'na coleta');
  for (let n = 0; n < 3; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });

  const plantar = cartaoDistribuir(aventuraRuntime.estado());
  assert.equal(plantar.item, 'semente');
  assert.equal(plantar.porSlot, 1);
  assert.deepEqual(plantar.canteiros, [
    { indice: 0, quantidade: 0, cheio: false },
    { indice: 1, quantidade: 0, cheio: false },
    { indice: 2, quantidade: 0, cheio: false },
  ]);

  // o cartão envia o canteiro tocado
  assert.deepEqual(eventoDoCanteiro(plantar, 1), { tipo: 'distribuiu', item: 'semente', slot: 1 });
  assert.equal(enviarEventoAventura(eventoDoCanteiro(plantar, 1)), true);
  assert.deepEqual(aventuraRuntime.estado().motor.distribuido, [0, 1, 0]);
  const depois = cartaoDistribuir(aventuraRuntime.estado());
  assert.deepEqual(depois.canteiros[1], { indice: 1, quantidade: 1, cheio: true });

  enviarEventoAventura(eventoDoCanteiro(depois, 0));
  enviarEventoAventura(eventoDoCanteiro(depois, 2));
  const regar = cartaoDistribuir(aventuraRuntime.estado());
  assert.equal(regar.item, 'agua', 'a rega usa o mesmo cartão');
  for (const c of regar.canteiros) enviarEventoAventura(eventoDoCanteiro(regar, c.indice));
  assert.equal(cartaoDistribuir(aventuraRuntime.estado()), null, 'no resumo, some');
  assert.equal(coordenadorAtividade.estado().foco, 'resumo');
  enviarEventoAventura({ tipo: 'toque' });
  mesaLimpa();
});

test('durante a Horta, chegar ao MERCADO avança a Horta e não mexe no roteiro', () => {
  mesaLimpa();
  const missao = chegarNaEscolaDoRoteiro();
  criarConviteHorta(iniciarHortaEscola).tentar(missao);
  useGame.getState().proximaMissao();
  enviarEventoAventura({ tipo: 'toque' });

  assert.equal(enviarEventoAventura({ tipo: 'chegou', lugar: 'MERCADO' }), true);
  assert.equal(aventuraRuntime.estado().etapa, 'pegar-sementes');
  assert.deepEqual(useGame.getState().missao, { tipo: 'gps', destino: 'ESTÁDIO', concluida: false });

  // e o sensor encaminha a chegada para a aventura antes do roteiro
  const sensores = readFileSync(new URL('../src/components/MissionSensors.jsx', import.meta.url), 'utf8');
  assert.match(sensores, /if \(aventuraAtiva\(\)\) \{\s*enviarEventoAventura\(\{ tipo: 'chegou', lugar: slug \}\);\s*return;/);

  // termina a aventura: o runtime é único no processo
  for (let n = 0; n < 3; n += 1) {
    enviarEventoAventura({ tipo: 'coletou', item: 'semente', quantidade: 1 });
  }
  enviarEventoAventura({ tipo: 'chegou', lugar: 'ESCOLA' });
  for (const item of ['semente', 'agua']) {
    for (let canteiro = 0; canteiro < 3; canteiro += 1) {
      enviarEventoAventura({ tipo: 'distribuiu', item, slot: canteiro });
    }
  }
  enviarEventoAventura({ tipo: 'toque' });
  assert.equal(aventuraRuntime.estado().ativa, false);
  mesaLimpa();
});

// ------------------------------------------------------------- Caderninho

test('Caderninho: semente e broto da escola viram adesivos', () => {
  const objetos = CATEGORIAS_CADERNINHO.find((c) => c.id === 'objetos').possiveis;
  for (const id of ['semente', 'broto-da-escola']) {
    assert.ok(objetos.includes(id), id);
    const conteudo = conteudoDescoberta('objetos', id);
    assert.ok(conteudo?.emoji && conteudo?.rotulo && conteudo?.fato, id);
  }
  assert.equal(conteudoDescoberta('objetos', 'broto-da-escola').rotulo, 'BROTO DA ESCOLA');
});

test('Caderninho: todo adesivo prometido no resumo é registrado pela aventura e aparece', () => {
  const aventuras = [PARQUE_COM_SEDE, ...Object.keys(HORTA_BANDS).map(criarHortaEscola)];
  for (const def of aventuras) {
    const recompensa = def.etapas.find((e) => e.tipo === 'recompensa');
    const resumo = def.etapas.find((e) => e.tipo === 'resumo');
    const rotulos = recompensa.descobertas
      .map((d) => conteudoDescoberta(d.categoria, d.id)?.rotulo)
      .filter(Boolean);
    for (const texto of resumo.recompensas.filter((r) => r.startsWith('ADESIVO: '))) {
      const rotulo = texto.slice('ADESIVO: '.length);
      assert.ok(rotulos.includes(rotulo), `${def.id}: "${rotulo}" sem adesivo no Caderninho`);
    }
  }
});

test('Horta completa: registra semente e broto no Caderninho', () => {
  mesaLimpa();
  iniciarHortaEscola('3-5');
  jogarDoConviteAoResumo();
  const objetos = useGame.getState().descobertas.objetos;
  assert.ok(objetos.includes('semente'));
  assert.ok(objetos.includes('broto-da-escola'));
  enviarEventoAventura({ tipo: 'toque' });
  mesaLimpa();
});
