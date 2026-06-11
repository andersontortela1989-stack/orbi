/**
 * MOEDAS NA RUA (frente extra "Moedas") — fonte única de ONDE das moedas
 * coletáveis + constantes de coleta/respawn. Render e lógica em
 * components/Moedas.jsx (mesmo par bairros.js ↔ City.jsx).
 *
 * FRONTEIRA (releitura da gravada no Cenario.jsx):
 *   src/city/ = lado JOGÁVEL do mundo — um arquivo por camada:
 *     bairros.js — prédios/missões (sensores, GPS e chips derivam de lá)
 *     moedas.js  — coletáveis (a coleta de Moedas.jsx deriva daqui)
 *   Cenario.jsx segue decoração PURA — nada jogável deriva de lá.
 *
 * GUARD-RAILS da frente (invioláveis):
 *   - moeda NUNCA é fracasso: nenhuma única, nenhuma cronometrada, nenhuma
 *     some sem ser coletada; ignorar = neutro. Respawn calmo (~60s, sem
 *     pisca de aviso) e SÓ com o carro fora do raio — sem coleta fantasma.
 *   - tempero do trajeto, não objetivo que grita: sem setas, sem "faltam X".
 *   - coleta por PROXIMIDADE (distância XZ em useFrame), zero física.
 *
 * DISTRIBUIÇÃO: fileiras de 3 no asfalto-base (o "negativo" entre os chãos
 * dos bairros) e nas aproximações das entradas — recompensa o trajeto
 * natural, não exige desvio. Coordenadas afinadas contra os chãos de
 * bairros.js, os lotes (calçada = max(w,l)+4 do Building) e a zona do
 * POSTO; mexeu em chão/prédio/posto, conferir aqui.
 */

// Raio de coleta no plano XZ (unidades de mundo). GENEROSO de propósito:
// "passou por cima = pegou", sem exigir precisão fina. Afinar pelo feel.
export const RAIO_COLETA = 2.6;

// Segundos até a moeda coletada reaparecer. Respawn calmo: ela simplesmente
// volta (scale 0 → 1 num frame), sem pisca-pisca de aviso.
export const RESPAWN_SEGUNDOS = 60;

// Distância EXTRA além do raio exigida pro respawn: se o carro estiver
// parado em cima do ponto quando o timer vence, a moeda espera ele se
// afastar — nunca nasce e é coletada no mesmo frame (plim do nada).
export const FOLGA_RESPAWN = 1.5;

// Passo entre moedas da fileira. MAIOR que RAIO_COLETA de propósito: o
// carro pega 1-2-3 em sequência (escadinha de plims), nunca as três num
// frame só.
const PASSO_FILEIRA = 4;

/** Fileira de 3 moedas centrada em [cx, cz], na direção [dx, dz]. */
const fileira = ([cx, cz], [dx, dz]) =>
  [-1, 0, 1].map((k) => [
    cx + k * PASSO_FILEIRA * dx,
    cz + k * PASSO_FILEIRA * dz,
  ]);

/**
 * Todas as moedas da cidade — 10 fileiras de 3 (30 moedas), layout FIXO.
 * Estado de coleta vive na memória da sessão (Moedas.jsx): reload = cidade
 * sempre acorda igual (todas de volta), contador persistido intacto.
 *
 * Nenhuma fileira dentro da zona do POSTO (sensor com padding 4:
 * x -44..-24, z 14..34): plim nunca toca com o painel de abastecer aberto —
 * as fileiras do corredor do PORTO param antes (z ≤ 10) e retomam depois
 * (z ≥ 38), com margem maior que RAIO_COLETA.
 */
export const MOEDAS = [
  // primeira reta do spawn (0,0 olhando +z) — recompensa nos primeiros
  // segundos de jogo, entre os lotes de PIZZA e HOSPITAL
  ...fileira([0, 11], [0, 1]),

  // reta sul do CENTRO (asfalto z=-10, onde já moram os postes)
  ...fileira([-17, -10], [1, 0]),
  ...fileira([17, -10], [1, 0]),
  // portão de retorno atrás do spawn (mesma reta, vão central)
  ...fileira([0, -10], [1, 0]),

  // corredor do PORTO (a rua larga x≈-37.5) — antes e depois da zona do POSTO
  ...fileira([-37.5, 6], [0, 1]),
  ...fileira([-37.5, 42], [0, 1]),

  // aproximação da entrada do MERCADO (leva à faixa de travessia em x≈35.5)
  ...fileira([28.5, 28], [1, 0]),

  // aproximação da entrada do PARQUE (leva à faixa em z≈53; x=12 passa ao
  // largo do lote da ESCOLA, que termina em x=10)
  ...fileira([12, 48], [0, 1]),

  // anel externo sul — pra quem explora além do centro
  ...fileira([52.5, -8], [1, 0]),   // sul do MERCADO
  ...fileira([-52.5, -6], [1, 0]),  // sul do PORTO
];
