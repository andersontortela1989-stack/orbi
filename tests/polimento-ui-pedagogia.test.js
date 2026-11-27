import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criarAventura } from '../src/adventure/adventure-engine.js';
import { criarHortaEscola } from '../src/school/horta-aventura.js';
import { sortearChegadaViva } from '../src/missions/chegadas-vivas.js';

const ler = (caminho) =>
  readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8');

test('MERCADO: palavra da cor usa destaque visual neutro (evita conflito de cor no enunciado)', () => {
  for (let i = 0; i < 15; i += 1) {
    const p = sortearChegadaViva('MERCADO');
    assert.equal(p.destaqueNeutro, true);
    assert.ok(p.tituloDestaque.length > 0);
  }
  const painel = ler('src/components/ChegadaVivaPanel.jsx');
  assert.match(painel, /viva-som--neutro/);
});

test('ESTÁDIO: cartas mostram só a bandeira sem repetir o nome do país, preservando aria-label', () => {
  for (let i = 0; i < 15; i += 1) {
    const p = sortearChegadaViva('ESTÁDIO');
    assert.equal(p.opcoes.length, 3);
    assert.ok(p.tituloDestaque.length > 0, 'nome do país permanece no enunciado');
    for (const o of p.opcoes) {
      assert.equal(o.bandeira, o.valor);
      assert.equal(o.rotulo, null, 'não repete o nome do país na carta');
      assert.equal(o.ariaLabel, o.valor, 'acessibilidade preservada via ariaLabel');
    }
  }
  const painel = ler('src/components/ChegadaVivaPanel.jsx');
  assert.match(painel, /aria-label=\{o\.ariaLabel \|\| undefined\}/);
});

test('Horta (coleta): faixa visual é enxuta ("Pegue os saquinhos") mantendo explicação completa na voz', () => {
  for (const [band, esperadoPorExtenso] of [
    ['3-5', 'três'],
    ['6-7', 'quatro'],
    ['8-10', 'seis'],
  ]) {
    const aventura = criarAventura(criarHortaEscola(band, { random: () => 0.5 }));
    aventura.iniciar();
    aventura.enviar({ tipo: 'toque' }); // VAMOS!
    let efeitos = aventura.enviar({ tipo: 'chegou', lugar: 'MERCADO' });
    if (aventura.etapa().id === 'quantas-sementes') {
      const certa = aventura.etapa().opcoes.find((o) => o.correta).id;
      efeitos = aventura.enviar({ tipo: 'respondeu', opcao: certa });
    }
    assert.equal(aventura.etapa().id, 'pegar-sementes');

    const obj = efeitos.find((e) => e.tipo === 'objetivo');
    const fala = efeitos.find((e) => e.tipo === 'falar');
    assert.equal(obj?.texto, 'Pegue os saquinhos');
    assert.equal(
      fala?.texto,
      `Pegue ${esperadoPorExtenso} saquinhos. Cada um tem uma semente.`
    );
  }
});

test('Tela inicial: atalhos Área dos Pais e ver a história de novo ficam fora do container escalado', () => {
  const start = ler('src/components/StartScreen.jsx');
  const idxFechaStartScreen = start.indexOf('{/* Overlay da Área dos pais');
  const idxParents = start.indexOf('className="start-parents"');
  const idxHistoria = start.indexOf('className="start-historia"');
  assert.ok(idxFechaStartScreen > 0);
  assert.ok(idxParents > idxFechaStartScreen, 'Área dos pais fora do .start-screen escalado');
  assert.ok(idxHistoria > idxFechaStartScreen, 'ver a história de novo fora do .start-screen escalado');
});
