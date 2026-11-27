import * as THREE from 'three';
import { CAMINHOS, LARGURA_RUA_BORDA, TENSAO_RUA } from '../../city/ruas.js';
import { montarMalha } from '../geometria-mesclada.js';
import { PALETA_REAL as C } from './paleta.js';
import { caixa, contorno } from './pecas.js';

/**
 * RUA ENTRE A PADARIA E O MERCADO no ESTILO REAL (V1.3) — o trecho reto do
 * fim do caminho 2 (x ≈ 44 → 58, eixo em z ≈ 31,6): meio-fio dos dois lados,
 * calçada contínua ao norte (a do sul é a calçada do MERCADO), 2 postes,
 * 2 árvores em canteiro e 1 lixeira. Tudo FORA do leito: na rua, só a pintura
 * que já existe (faixa tracejada do RoadNetwork e a travessia do Cenario).
 *
 * Coordenadas do MUNDO (não do lote). Grupos: 'base' (meio-fio, calçadas,
 * postes) e 'extra' (árvores e lixeira — o Modo Tranquilo esconde). Sem
 * colisor: o mobiliário segue a regra das árvores da cidade (atravessar é
 * previsível e inofensivo; parede invisível não).
 */

const X_INICIO = 44;
const X_FIM = 58;
const MEIA_BORDA = LARGURA_RUA_BORDA / 2;
const MEIO_FIO = Object.freeze({ largura: 0.25, altura: 0.2 });
const PISO_RUA = 0.15; // calçada da rua (a dos lotes tem 0,16)

const eixo = new THREE.CatmullRomCurve3(
  CAMINHOS[1].map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  'catmullrom',
  TENSAO_RUA
).getSpacedPoints(800).map((p) => [p.x, p.z]);

/** z do eixo da rua na altura x (trecho final do caminho 2). */
function zDoEixo(x) {
  return eixo.reduce((a, b) => (Math.abs(b[0] - x) < Math.abs(a[0] - x) ? b : a))[1];
}

function meiosFios() {
  const pecas = [];
  for (let x = X_INICIO + 1, i = 1; x < X_FIM; x += 2, i += 1) {
    const z = zDoEixo(x);
    const d = MEIA_BORDA + MEIO_FIO.largura / 2;
    pecas.push(
      caixa(`meio-fio-sul:${i}`, 'chao', [x, MEIO_FIO.altura / 2, z - d], [2.02, MEIO_FIO.altura, MEIO_FIO.largura], C.meioFio, { grupo: 'base' }),
      caixa(`meio-fio-norte:${i}`, 'chao', [x, MEIO_FIO.altura / 2, z + d], [2.02, MEIO_FIO.altura, MEIO_FIO.largura], C.meioFio, { grupo: 'base' }),
      // ao sul, completa até a calçada do MERCADO (que termina em z 27,2)
      caixa(`calcada-sul:${i}`, 'chao', [x, PISO_RUA / 2, z - MEIA_BORDA - MEIO_FIO.largura - 0.175], [2.02, PISO_RUA, 0.35], C.calcada, { grupo: 'base' })
    );
    // ao norte: calçada contínua de 2 u até a PADARIA; onde a calçada da
    // PADARIA já começa (x ≥ 51,8), só a fresta até ela
    const largura = x < 51.8 ? 2.0 : 0.15;
    pecas.push(caixa(`calcada-norte:${i}`, 'chao', [x, PISO_RUA / 2, z + MEIA_BORDA + MEIO_FIO.largura + largura / 2], [2.02, PISO_RUA, largura], C.calcada, { grupo: 'base' }));
  }
  return pecas;
}

/** Poste com braço e luminária voltados para a rua (sentido ±1 em z). */
function poste(n, x, z, sentido) {
  const haste = { id: `poste-${n}:haste`, zona: 'chao', grupo: 'base', forma: 'cilindro', lados: 8, pos: [x, 2.1, z], raio: 0.08, comprimento: 4.2, cor: C.poste };
  const braco = caixa(`poste-${n}:braco`, 'chao', [x, 4.15, z + sentido * 0.35], [0.06, 0.06, 0.7], C.poste, { grupo: 'base' });
  const luz = caixa(`poste-${n}:luz`, 'chao', [x, 4.06, z + sentido * 0.65], [0.3, 0.12, 0.4], C.luminaria, { grupo: 'base' });
  return [haste, braco, luz, contorno(haste), contorno(braco)];
}

/** Árvore em canteiro: canteiro, tronco e copa de 3 esferas (grupo 'extra'). */
function arvore(n, x, z) {
  const extra = { grupo: 'extra' };
  const canteiro = caixa(`arvore-${n}:canteiro`, 'chao', [x, 0.1, z], [1.1, 0.2, 1.1], C.canteiro, extra);
  const tronco = { id: `arvore-${n}:tronco`, zona: 'chao', ...extra, forma: 'cilindro', lados: 8, pos: [x, 1.0, z], raio: 0.14, comprimento: 1.6, cor: C.tronco };
  const copa = [[-0.35, 2.2, 0, C.copa], [0.35, 2.25, 0.1, C.copaClara], [0, 2.75, -0.05, C.copa]].map(([dx, y, dz, cor], i) => ({
    id: `arvore-${n}:copa-${i + 1}`, zona: 'chao', ...extra, forma: 'esfera', lados: 6, aneis: 5, pos: [x + dx, y, z + dz], raio: 0.75, cor,
  }));
  return [canteiro, tronco, ...copa, contorno(tronco), ...copa.map((c) => contorno(c))];
}

function lixeira(x, z) {
  const extra = { grupo: 'extra' };
  const corpo = { id: 'lixeira:corpo', zona: 'chao', ...extra, forma: 'cilindro', lados: 8, pos: [x, PISO_RUA + 0.4, z], raio: 0.25, comprimento: 0.8, cor: C.lixeira };
  const tampa = { id: 'lixeira:tampa', zona: 'chao', ...extra, forma: 'cilindro', lados: 8, pos: [x, PISO_RUA + 0.83, z], raio: 0.28, comprimento: 0.06, cor: C.lixeiraTampa };
  return [corpo, tampa, contorno(corpo)];
}

/** Todas as peças da rua real (coordenadas do mundo). */
export function pecasDaRua() {
  const zN = zDoEixo(47) + MEIA_BORDA + MEIO_FIO.largura; // borda interna da calçada norte
  return [
    ...meiosFios(),
    // postes: um em cada calçada, a luminária para o lado da rua
    ...poste(1, 45.6, zN + 0.4, -1),
    ...poste(2, 60.5, 27.0, 1),
    // árvores: esquina leste do MERCADO (fora da linha de visão do leito —
    // na calçada norte, em x 49, escondia até 33% do carro) e calçada dos
    // fundos da PADARIA
    ...arvore(1, 60.3, 24.0),
    ...arvore(2, 56.0, 36.9),
    ...lixeira(47.0, zN + 0.7),
  ];
}

/** Malhas mescladas por grupo e camada (base/extra × opaco/contorno). */
export function malhasDaRua() {
  const pecas = pecasDaRua();
  const filtro = (grupo, camada) => pecas.filter((p) => p.grupo === grupo && (p.camada ?? 'opaco') === camada);
  return {
    base: montarMalha(filtro('base', 'opaco')),
    baseContorno: montarMalha(filtro('base', 'contorno')),
    extra: montarMalha(filtro('extra', 'opaco')),
    extraContorno: montarMalha(filtro('extra', 'contorno')),
  };
}

/** Chamadas e triângulos da rua real (teto proposto: 4 e 2.000). */
export function orcamentoRuaReal() {
  const malhas = Object.values(malhasDaRua());
  return {
    chamadas: malhas.filter((m) => m.triangulos > 0).length,
    triangulos: malhas.reduce((s, m) => s + m.triangulos, 0),
  };
}
