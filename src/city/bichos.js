/**
 * BICHOS NO MUNDO (frente extra "Bichos no mundo") — fonte única de ONDE
 * da fauna. Render em components/Bichos.jsx (par de sempre: dados aqui,
 * visual lá — como bairros↔City e moedas↔Moedas).
 *
 * CONTRATO COM O QUIZ (o propósito da frente): todo slug daqui DEVE
 * existir no banco ANIMAIS de missions/missoes-ciencias.js — o bicho que
 * a criança VÊ no mundo é o MESMO que aparece no quiz do ZOO e na missão
 * do VET (mesmo slug → mesmo emoji, som e frases). Bicho novo aqui sem
 * entrada no banco quebra a ponte mundo↔conteúdo (Bichos.jsx avisa em
 * dev). Este arquivo fica DADOS PUROS, sem importar o banco: a direção
 * de dependência do projeto é missions deriva de city, nunca o inverso.
 *
 * FRONTEIRA: os bichos nasceram aqui na Frente 4 (presença visual pura)
 * já mirando a Frente 5 — que chegou: a MISSÃO DE BUSCA deriva daqui
 * (missions/busca.js lê posição e pista; BuscaSensor lê posição). A
 * aposta da fronteira pagou: virou jogável sem migrar.
 *
 * GUARD-RAILS (invioláveis):
 *   - ESTÁTICO PURO: nada anda, nada persegue, nada aparece/some — o
 *     pato de hoje está no mesmo lugar amanhã (previsibilidade TEA).
 *     Respiração sutil é alavanca de gate, não padrão.
 *   - SEM COLISÃO (precedente das árvores): atravessar = passa direto.
 *   - Poucos e calmos: 5 no mundo inteiro, dosagem das árvores.
 *
 * POSIÇÕES: âncoras semânticas derivadas de bairros.js (lote/calçada de
 * cada prédio = max(w,l)+4, ver Building), conferidas contra fileiras de
 * moedas (city/moedas.js), zonas de serviço (POSTO x -44..-24/z 14..34;
 * GARAGEM x 24..44/z -26..-6) e árvores/postes do Cenario. `heading` em
 * radianos, todos distintos (nenhum par paralelo — variedade calma).
 */

// `pista`/`pistaCurta` (Frente 5 — missão de busca): a pista descreve o
// LUGAR do bicho (dado do mundo → mora aqui), nunca o bicho — descobrir
// QUAL bicho é parte da recompensa. `pista` em minúsculas (vai pra VOZ;
// TTS soletra CAIXA ALTA); `pistaCurta` em CAIXA ALTA (vai pro banner).
export const BICHOS = [
  // beira d'água do PORTO (chão azul), no vão entre os lotes PORTO/FAROL
  {
    slug: 'PATO',
    pos: [-50, 34],
    heading: 0.6,
    pista: 'perto da água',
    pistaCurta: 'ÁGUA?',
  },

  // esquina de vizinhança do CENTRO, entre os lotes de PIZZA e ESCOLA
  {
    slug: 'GATO',
    pos: [-14, 32],
    heading: -2.2,
    pista: 'no meio das casas do centro',
    pistaCurta: 'CASAS?',
  },

  // pasto de capim do PARQUE, no vão entre os lotes PARQUE/ZOO
  {
    slug: 'VACA',
    pos: [0, 84],
    heading: 2.9,
    pista: 'no capim do parque',
    pistaCurta: 'CAPIM?',
  },

  // feira — leste do lote do MERCADO (chão sol-soft)
  {
    slug: 'GALINHA',
    pos: [70, 22],
    heading: -0.9,
    pista: 'na feira do mercado',
    pistaCurta: 'FEIRA?',
  },

  // cão de oficina, ao lado da GARAGEM (fora da zona; fileira G de moedas
  // a ~3 — se atropelar visualmente, deslizar 2-3 unidades a leste no gate)
  {
    slug: 'CACHORRO',
    pos: [46, -14],
    heading: 1.7,
    pista: 'perto da garagem',
    pistaCurta: 'GARAGEM?',
  },
];

/** Busca por slug — consumido pela missão de busca (F5) e pelo HUD. */
export const BICHO_POR_SLUG = Object.fromEntries(
  BICHOS.map((b) => [b.slug, b])
);
