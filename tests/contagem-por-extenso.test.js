import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUANTIDADES, sortearChegadaViva } from '../src/missions/chegadas-vivas.js';
import { CANTEIRO } from '../src/city/canteiro.js';
import * as economia from '../src/economia.js';

/**
 * CONTAGENS POR EXTENSO NAS FALAS QUE AS CRIANÇAS OUVEM (20/11/2026).
 *
 * A voz recebe o número por extenso ("três"), como no plantio, na rega e na
 * coleta da Horta — nunca o algarismo. Três situações:
 *   - pergunta de chegada da PADARIA: acerto "Isso! São três pães!" e
 *     revelação "São três pães." (sem repetir o número em "pãezinhos");
 *   - convite do posto: "Me ajuda a contar? Faltam quatro!" ("Falta um!"
 *     no singular);
 *   - pergunta de chegada do PARQUE (árvores do canteiro), pronta para
 *     quando o PARQUE entrar no roteiro.
 */

const SEM_ALGARISMO = /^[^0-9]*$/;
const MASCULINO = { 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez' };
const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** As 4 falas que o painel da chegada entrega à voz. */
const falasDaChegada = (p) => [p.frasePergunta, p.fraseAcerto, p.fraseTenteDeNovo, p.fraseRevela];

test('PADARIA: as falas da pergunta não têm algarismo, em todas as quantidades', () => {
  const vistas = new Map();
  for (let i = 0; i < 400 && vistas.size < QUANTIDADES.length; i += 1) {
    const p = sortearChegadaViva('PADARIA');
    vistas.set(Number(p.resposta), p);
  }
  assert.deepEqual([...vistas.keys()].sort(), [...QUANTIDADES].sort(), 'todas as quantidades sorteadas');
  for (const [n, p] of vistas) {
    for (const fala of falasDaChegada(p)) assert.match(fala, SEM_ALGARISMO, `n=${n}: "${fala}"`);
    assert.equal(p.fraseAcerto, `Isso! São ${MASCULINO[n]} pães!`);
    assert.equal(p.fraseRevela, `São ${MASCULINO[n]} pães.`, 'sem repetir o número em "pãezinhos"');
  }
});

test('posto: o convite fala quantos litros faltam por extenso, de 1 a 10', () => {
  assert.equal(typeof economia.convitePosto, 'function', 'a fala do convite sai de economia.js (testável)');
  for (let n = 1; n <= economia.TANQUE_LITROS; n += 1) {
    assert.match(economia.convitePosto(n), SEM_ALGARISMO, `n=${n}`);
  }
  assert.equal(economia.convitePosto(4), 'Me ajuda a contar? Faltam quatro!');
  assert.equal(economia.convitePosto(10), 'Me ajuda a contar? Faltam dez!');
  assert.equal(economia.convitePosto(1), 'Me ajuda a contar? Falta um!', 'singular');
  // o painel do posto fala exatamente essa frase, e nenhuma outra com número
  const painel = ler('src/components/RefuelPanel.jsx');
  assert.match(painel, /falarDaAtividade\('abastecendo', convitePosto\(n\)/);
  assert.doesNotMatch(painel, /Faltam \$\{/);
});

test('PARQUE: as falas da pergunta das árvores não têm algarismo', () => {
  const p = sortearChegadaViva('PARQUE');
  const n = CANTEIRO.arvores.length;
  assert.equal(p.resposta, String(n));
  for (const fala of falasDaChegada(p)) assert.match(fala, SEM_ALGARISMO, `"${fala}"`);
  assert.equal(n, 4);
  assert.equal(p.fraseAcerto, 'Isso! São quatro árvores! Você conta muito bem!');
  assert.equal(p.fraseRevela, 'São quatro árvores! Quatro arvorezinhas!');
});
