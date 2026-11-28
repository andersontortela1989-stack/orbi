import { TINTAS } from '../brand/paleta3d.js';

/**
 * Layout geométrico do ESTÁDIO aberto (coordenadas locais ao centro [-6, -27]).
 *
 * Mantém a pegada histórica [18, 8, 14] e o mesmo colisor para não alterar
 * sensores de chegada, GPS nem dirigibilidade. O estacionamento fica na faixa
 * livre a leste (+X) dentro da ilha do bairro ESTÁDIO ([-25..+13] × [-38..-14]).
 */

const CORES_TORCIDA = Object.freeze([
  TINTAS.sun,
  TINTAS.coral,
  TINTAS.violet,
  TINTAS.blue,
  TINTAS.white,
  TINTAS.grass,
]);

const CORES_PELE = Object.freeze([
  '#F5CFA8',
  '#D9A172',
  '#8D5A3B',
  '#F1C29B',
]);

// Degraus das arquibancadas (coordenadas locais dentro de [-9..9] × [-7..7]).
export const ARQUIBANCADAS = Object.freeze([
  // Fundo (-Z): 3 degraus altos, bem visíveis na câmera 2,5D
  { id: 'norte-1', x: 0, z: -4.1, y: 0.72, w: 13.6, h: 0.72, l: 0.95 },
  { id: 'norte-2', x: 0, z: -5.05, y: 1.42, w: 14.6, h: 0.72, l: 0.95 },
  { id: 'norte-3', x: 0, z: -6.0, y: 2.12, w: 15.6, h: 0.72, l: 0.95 },
  // Frente (+Z): 2 degraus mais baixos para não tampar o gramado
  { id: 'sul-1', x: 0, z: 4.2, y: 0.68, w: 13.2, h: 0.68, l: 0.9 },
  { id: 'sul-2', x: 0, z: 5.15, y: 1.32, w: 14.2, h: 0.68, l: 0.9 },
  // Esquerda (-X): 3 degraus altos
  { id: 'oeste-1', x: -6.1, z: 0, y: 0.72, w: 0.95, h: 0.72, l: 7.4 },
  { id: 'oeste-2', x: -7.05, z: 0, y: 1.42, w: 0.95, h: 0.72, l: 8.6 },
  { id: 'oeste-3', x: -8.0, z: 0, y: 2.12, w: 0.95, h: 0.72, l: 9.8 },
  // Direita (+X): 2 degraus mais baixos para abrir visão do campo
  { id: 'leste-1', x: 6.1, z: 0, y: 0.68, w: 0.9, h: 0.68, l: 7.2 },
  { id: 'leste-2', x: 7.05, z: 0, y: 1.32, w: 0.9, h: 0.68, l: 8.2 },
]);

export const TORRES_REFLETOR = Object.freeze([
  { id: 'no', x: -8.45, z: -6.45, rotY: Math.PI * 0.25 },
  { id: 'ne', x: 8.45, z: -6.45, rotY: -Math.PI * 0.25 },
  { id: 'so', x: -8.45, z: 6.45, rotY: Math.PI * 0.75 },
  { id: 'se', x: 8.45, z: 6.45, rotY: -Math.PI * 0.75 },
]);

export const CAMPO = Object.freeze({
  w: 10.6,
  l: 6.8,
  y: 0.28,
  faixas: 6,
});

// Estacionamento na faixa livre leste (+X) do terreno do Estádio.
// Em coordenadas de mundo (floorPos = [-6, -27]): x ∈ [5.3, 11.7], z ∈ [-32.8, -20.2].
export const ESTACIONAMENTO = Object.freeze({
  x: 14.5,
  z: 0.5,
  w: 6.4,
  l: 12.6,
  vagas: 5,
  carros: Object.freeze([
    { vaga: 0, cor: TINTAS.blue },
    { vaga: 1, cor: TINTAS.violet },
    { vaga: 3, cor: TINTAS.grass },
    { vaga: 4, cor: TINTAS.skyDeep },
  ]),
});

// Gera torcida determinística distribuída sobre os degraus.
function gerarTorcida() {
  const lista = [];
  let seed = 17;
  const prox = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (const degrau of ARQUIBANCADAS) {
    const horizontal = degrau.w > degrau.l;
    const extensao = horizontal ? degrau.w - 1.2 : degrau.l - 1.2;
    const passo = 1.05;
    const qtd = Math.max(3, Math.floor(extensao / passo));
    const inicio = -((qtd - 1) * passo) / 2;

    for (let i = 0; i < qtd; i++) {
      // Pula poucos assentos de forma determinística para parecer natural.
      if (prox() < 0.14) continue;
      const desloc = inicio + i * passo + (prox() - 0.5) * 0.22;
      const x = horizontal ? degrau.x + desloc : degrau.x + (prox() - 0.5) * 0.14;
      const z = horizontal ? degrau.z + (prox() - 0.5) * 0.14 : degrau.z + desloc;
      const y = degrau.y + degrau.h / 2;
      const cor = CORES_TORCIDA[Math.floor(prox() * CORES_TORCIDA.length)];
      const pele = CORES_PELE[Math.floor(prox() * CORES_PELE.length)];
      lista.push(Object.freeze({ x, y, z, cor, pele }));
    }
  }
  return Object.freeze(lista);
}

export const TORCIDA = gerarTorcida();

export const ESTADIO_LAYOUT = Object.freeze({
  size: Object.freeze([18, 8, 14]),
  campo: CAMPO,
  arquibancadas: ARQUIBANCADAS,
  torres: TORRES_REFLETOR,
  torcida: TORCIDA,
  estacionamento: ESTACIONAMENTO,
});
