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
};
