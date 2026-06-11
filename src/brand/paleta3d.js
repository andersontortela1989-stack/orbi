/**
 * PALETA 3D — ponte JS dos tokens "Mundo Adesivo" (colors.css) pro three.js.
 *
 * colors.css é CSS e só alcança o 2D (HUD, painéis, caderninho) — o <Canvas>
 * não lê var(--orbi-*). Este arquivo espelha os MESMOS valores e é, a partir
 * da fatia "Dia Adesivo", A FONTE ÚNICA DE COR do mundo 3D: nenhum hex de
 * cor de mundo hardcoded em componente 3D. (Posições continuam em
 * city/bairros.js — fonte única de ONDE; aqui é a fonte única de QUAL COR.)
 *
 * Mexeu na marca? Atualizar colors.css E aqui, com valores idênticos.
 */

/** Tintas cruas — espelho 1:1 de colors.css. */
export const TINTAS = {
  ink:       '#1C2746', // contorno, texto, sombra sólida
  inkSoft:   '#46557E',
  inkFaint:  '#8C96B4',

  sun:       '#FFC53D', // o astro da marca — destaque/celebração
  sunDeep:   '#E5A91F',
  sunSoft:   '#FFE0A0',

  grass:     '#5BBE6E',
  grassDeep: '#3F9E52',
  grassSoft: '#BDE8C5',

  coral:     '#F0623E',
  coralDeep: '#D14828',
  coralSoft: '#FBC4B5',

  blue:      '#58B6E8',
  blueDeep:  '#3997CC',
  blueSoft:  '#BEE5F8',

  sky:       '#DDF1FA', // superfície principal (céu claro)
  skyDeep:   '#A7DCF0',
  skyHi:     '#F0FAFE',
  paper:     '#FBF7EF',
  white:     '#FFFFFF',
  line:      '#C2DEEC',
};

/** Aliases semânticos do MUNDO — use estes nos componentes 3D. */
export const PALETA3D = {
  // céu e distância (o fog "engole" o horizonte na cor do céu profundo,
  // sem parede preta)
  ceu:       TINTAS.sky,
  neblina:   TINTAS.skyDeep,

  // chão-base = as RUAS (o negativo entre os chãos coloridos dos bairros):
  // asfalto claro azulado, legível como "rua" contra os bairros
  asfalto:   TINTAS.inkFaint,

  // grade de referência de velocidade (fica até as faixas da Fatia C):
  // presente, não gritante
  gradeLinha: TINTAS.line,
  gradeSecao: TINTAS.inkSoft,

  // lote/calçada sob cada prédio — "recheio de adesivo" branco
  calcada:   TINTAS.white,

  // chãos dos bairros — família -soft da marca + paper: distintos entre si,
  // calmos, e mantêm o papel da Fatia 7 (a cor do chão avisa o bairro)
  chaoCentro:  TINTAS.paper,    // centro quente
  chaoMercado: TINTAS.sunSoft,  // feira
  chaoPorto:   TINTAS.blueSoft, // água
  chaoParque:  TINTAS.grassSoft, // natureza

  // sticker dos prédios (Fatia B): contorno navy + placa branca de letreiro
  // com texto navy — TODO letreiro tem a mesma cara (previsibilidade TEA)
  contorno: TINTAS.ink,
  placa:    TINTAS.white,
  letreiro: TINTAS.ink,

  // UMA COR POR PRÉDIO (requisito da Fatia B): a cor é identidade
  // pedagógica do lugar — os chips do Caderninho herdam daqui via
  // bairros.js. Pares da mesma família nunca no mesmo bairro (exceção
  // consciente: PARQUE×ZOO, separados por valor claro/escuro).
  // Guard-rail: "vermelho banido" = sinal de feedback/erro, nunca cor de
  // mundo — FAROL coral-deep é cor de mundo, ok (o carro sempre foi
  // avermelhado).
  predios: {
    PIZZA:    TINTAS.coral,     // comida quente
    HOSPITAL: TINTAS.white,     // hospital clássico (contorno segura)
    ESCOLA:   TINTAS.sun,       // escola = sol/aprender
    MERCADO:  TINTAS.sunDeep,   // caramelo de feira
    PADARIA:  TINTAS.coralSoft, // pão/salmão claro
    PORTO:    TINTAS.blueDeep,  // água funda
    FAROL:    TINTAS.coralDeep, // farol vermelho clássico
    PARQUE:   TINTAS.grass,     // natureza
    ZOO:      TINTAS.grassDeep, // mata
    VET:      TINTAS.blue,      // clínica céu
    POSTO:    TINTAS.sunSoft,   // energia
  },

  // carro — avatar do Heitor: evolução pro coral oficial, não troca
  carro: {
    corpo:  TINTAS.coral,
    cabine: TINTAS.ink,
    farol:  TINTAS.sunSoft,
    roda:   TINTAS.ink,
  },

  // moeda coletável (frente "Moedas na rua") — âmbar do Sol da marca:
  // micro-celebração espalhada pelo asfalto, mesma família do destaque 2D
  moeda: TINTAS.sun,

  // props do cenário (Fatia C — decoração pura, ver Cenario.jsx)
  tronco:     TINTAS.inkSoft,
  copa:       TINTAS.grass,
  copaEscura: TINTAS.grassDeep,
  poste:      TINTAS.white,
  luminaria:  TINTAS.sun,
  faixa:      TINTAS.white,
};

/**
 * SOMBRA SÓLIDA (Fatia C) — o gesto --solid do 2D aplicado ao mundo 3D.
 *
 * CONSTANTE ÚNICA: toda sombra do mundo (prédios, árvores, postes, blob do
 * carro) usa este offset — uma direção só, como os cards do 2D sobreposto.
 *
 * Direção CONFERIDA contra a câmera (não assumida): a câmera fica em
 * alvo + (0, 44, 24) olhando o alvo, com up (0,1,0). Pelo lookAt:
 * eixo-X da câmera (direita da tela) = +x do mundo; eixo-Y da câmera
 * (cima da tela) ≈ (0, 0.48, -0.88), ou seja, "baixo na tela" ≈ +z do
 * mundo. Logo offset (+dx, +dz) = BAIXO-DIREITA NA TELA. Se a câmera
 * mudar de quadrante um dia, recalcular aqui.
 */
export const SOMBRA_SOLIDA = {
  dx: 0.6,
  dz: 0.6,
  opacidade: 0.16,
  cor: TINTAS.ink,
};
