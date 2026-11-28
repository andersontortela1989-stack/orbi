import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CLUBES_BRASIL, CLUBE_POR_SLUG, REGIOES_BRASIL } from '../src/missions/clubes.js';
import { sortearChegadaViva, sortearPerguntaClube } from '../src/missions/chegadas-vivas.js';
import { conteudoDescoberta, falaDescoberta } from '../src/missions/descobertas.js';

test('Clubes do Brasil: cobre os 12 clubes e todas as 5 regiões do Brasil', () => {
  assert.equal(CLUBES_BRASIL.length, 12);
  const esperados = [
    'PALMEIRAS', 'SÃO PAULO', 'SANTOS', 'CORINTHIANS',
    'FLAMENGO', 'VASCO', 'CRUZEIRO', 'BAHIA',
    'GRÊMIO', 'INTERNACIONAL', 'GOIÁS', 'REMO',
  ];
  for (const slug of esperados) {
    assert.ok(CLUBE_POR_SLUG[slug], `clube ${slug} cadastrado`);
  }

  const regioesPresentes = new Set(CLUBES_BRASIL.map((c) => c.regiao));
  for (const regiao of REGIOES_BRASIL) {
    assert.ok(regioesPresentes.has(regiao), `região ${regiao} coberta`);
  }
});

test('Clubes do Brasil: pergunta tem 3 cartas sem colisão, cita estado/região e sem algarismos na voz', () => {
  for (let i = 0; i < 24; i += 1) {
    const p = sortearPerguntaClube('ESTÁDIO');
    assert.equal(p.opcoes.length, 3);
    const clube = CLUBE_POR_SLUG[p.resposta];
    assert.ok(clube);
    assert.match(p.dica, new RegExp(clube.regiao.toUpperCase()));
    for (const fala of [p.frasePergunta, p.fraseAcerto, p.fraseTenteDeNovo, p.fraseRevela]) {
      assert.doesNotMatch(fala, /\d/, `fala sem algarismo: ${fala}`);
    }
    const valores = new Set(p.opcoes.map((o) => o.valor));
    assert.equal(valores.size, 3, 'três clubes distintos');
  }
});

test('ESTÁDIO: alterna entre Países do Mundo e Clubes do Brasil', () => {
  const categorias = new Set();
  for (let i = 0; i < 6; i += 1) {
    const p = sortearChegadaViva('ESTÁDIO');
    categorias.add(p.descoberta.categoria);
  }
  assert.ok(categorias.has('paises'), 'sorteia países');
  assert.ok(categorias.has('clubes'), 'sorteia clubes');
});

test('Caderninho e Bandeira: todos os clubes têm SVG, adesivo e fala com região', () => {
  const bandeiraSrc = fs.readFileSync('src/components/Bandeira.jsx', 'utf8');
  for (const c of CLUBES_BRASIL) {
    assert.ok(
      bandeiraSrc.includes(`${c.slug}:`) || bandeiraSrc.includes(`'${c.slug}':`),
      `SVG existe para ${c.slug}`
    );
    const card = conteudoDescoberta('clubes', c.slug);
    assert.equal(card?.bandeira, c.slug);
    const fala = falaDescoberta('clubes', c.slug);
    assert.ok(fala && fala.includes(c.regiaoVoz), `fala cita região de ${c.slug}`);
  }
});
