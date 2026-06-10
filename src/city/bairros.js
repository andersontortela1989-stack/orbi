/**
 * FONTE ÚNICA DE VERDADE da cidade (Fatia 7) — bairros temáticos contíguos.
 *
 * Antes (Fatias 4–5): as posições dos prédios viviam DUAS vezes — no City.jsx
 * (render) e no destinos.js (sensores do GPS) — com um comentário avisando do
 * risco de drift. Esta fatia multiplica os prédios, então centralizamos tudo
 * aqui: `City.jsx` desenha a partir de BAIRROS, e `destinos.js` deriva a API do
 * GPS (DESTINOS_GPS / PREDIOS_GPS / FRASE_PEDIDO / FRASE_CHEGADA) também daqui.
 * Mexeu num prédio? Mexe num lugar só.
 *
 * MUNDO CONTÍNUO, SEM MENU: os bairros são regiões de chão coloridas, lado a
 * lado, separadas por faixas do asfalto-base escuro (as "ruas"). O carro
 * simplesmente dirige e entra na região — a cor do chão é que avisa "mudei de
 * bairro", sem texto. Guard-rails TEA+TDAH: paleta calma e distinta por bairro,
 * poucos prédios por região, geometria simples (roda liso no notebook).
 *
 * Layout (visto de cima; spawn do carro em 0,0, olhando para +z):
 *
 *                       [ PARQUE ]  [ ZOO ]            ← bairro PARQUE (norte)
 *                                      [ VET ]
 *
 *              [ ESCOLA ]                              ← CENTRO
 *   [ PORTO ]                                  [ MERCADO ]
 *   [ FAROL ]   [PIZZA] [HOSPITAL]             [ PADARIA ]
 *   bairro PORTO        🚗 spawn               bairro MERCADO
 *   (oeste)                                    (leste)
 *
 * Cada prédio:
 *   slug   — palavra do letreiro (CAIXA ALTA) E chave da missão de GPS
 *   pos    — [x, z] no plano
 *   size   — [w, h, l]
 *   cor    — cor do prédio
 *   rotuloCor / rotuloContorno — (opcional) contraste do letreiro
 *   pedido / chegada — frases pt-BR narradas pelo GPS, no tom do adendo de
 *     narrativa: o PEDIDO é curiosidade do Órbi (ele não conhece nada da
 *     Terra), e a CHEGADA sempre ENSINA de volta — o Órbi "aprende" e repete
 *     o que o lugar é ("então PADARIA é onde faz PÃO!"). Estrutura previsível
 *     ("Uau! Então…") de propósito: previsibilidade acalma (guard-rail TEA).
 *   soCiencias — (opcional, Fatia 8) prédio FORA do sorteio de leitura do GPS:
 *     chegar nele sempre acontece dentro de uma missão temática, que traz as
 *     próprias frases (ex.: VET ← missoes-ciencias.js). Ganha sensor de
 *     chegada e letreiro normalmente.
 */

export const BAIRROS = [
  {
    slug: 'CENTRO',
    corChao: '#363b43', // asfalto neutro
    chao: { centro: [0, 24], tamanho: [70, 60] },
    predios: [
      {
        slug: 'PIZZA',
        pos: [-20, 15],
        size: [12, 6, 12],
        cor: '#c45c4c',
        pedido: 'Que cheiro bom! O que é pizza? Me leva lá?',
        chegada: 'Uau! Então isso é pizza! Comida redonda e gostosa!',
      },
      {
        slug: 'HOSPITAL',
        pos: [20, 15],
        size: [14, 10, 14],
        cor: '#b6d3e3',
        rotuloCor: '#1a2733',
        rotuloContorno: '#ffffff',
        pedido: 'O que é hospital? Vamos ver?',
        chegada: 'Uau! Então isso é um hospital! Aqui cuida das pessoas!',
      },
      {
        slug: 'ESCOLA',
        pos: [0, 38],
        size: [16, 7, 12],
        cor: '#d4b75c',
        rotuloCor: '#2a1f0a',
        rotuloContorno: '#ffffff',
        pedido: 'O que é escola? Me mostra?',
        chegada: 'Uau! Então isso é uma escola! Aqui a gente aprende!',
      },
    ],
  },

  {
    slug: 'MERCADO',
    corChao: '#5b4a2e', // marrom quente (feira/mercado)
    chao: { centro: [57, 28], tamanho: [42, 58] },
    predios: [
      {
        slug: 'MERCADO',
        pos: [52, 18],
        size: [14, 8, 14],
        cor: '#cf923f',
        rotuloCor: '#2a1c08',
        rotuloContorno: '#ffffff',
        pedido: 'O que é mercado? Me leva lá?',
        chegada: 'Uau! Então isso é um mercado! Aqui a gente compra comida!',
      },
      {
        slug: 'PADARIA',
        pos: [60, 44],
        size: [12, 6, 12],
        cor: '#dcc06f',
        rotuloCor: '#2a1f0a',
        rotuloContorno: '#ffffff',
        pedido: 'Que cheirinho! O que é padaria? Vamos ver?',
        chegada: 'Uau! Então padaria é onde faz pão!',
      },
    ],
  },

  {
    slug: 'PORTO',
    corChao: '#2c4753', // azul-petróleo (água/porto)
    chao: { centro: [-61, 29], tamanho: [42, 58] },
    predios: [
      {
        slug: 'PORTO',
        pos: [-58, 16],
        size: [16, 7, 14],
        cor: '#79a7bd',
        rotuloCor: '#10242e',
        rotuloContorno: '#ffffff',
        pedido: 'O que é porto? Me mostra?',
        chegada: 'Uau! Então isso é um porto! Aqui os barcos param!',
      },
      {
        slug: 'FAROL',
        pos: [-64, 42],
        size: [8, 14, 8],
        cor: '#d96a5a',
        rotuloCor: '#ffffff',
        rotuloContorno: '#10242e',
        pedido: 'O que é farol? Vamos ver?',
        chegada: 'Uau! Então isso é um farol! Ele acende pra guiar os barcos!',
      },
    ],
  },

  {
    slug: 'PARQUE',
    corChao: '#3b5a36', // verde (parque/natureza)
    chao: { centro: [0, 74], tamanho: [58, 40] },
    predios: [
      {
        slug: 'PARQUE',
        pos: [-14, 72],
        size: [12, 5, 12],
        cor: '#6aa45c',
        rotuloCor: '#10240c',
        rotuloContorno: '#ffffff',
        pedido: 'O que é parque? Me leva lá?',
        chegada: 'Uau! Então isso é um parque! Aqui brinca no meio das árvores!',
      },
      {
        slug: 'ZOO',
        pos: [14, 78],
        size: [12, 6, 12],
        cor: '#8cbf6c',
        rotuloCor: '#10240c',
        rotuloContorno: '#ffffff',
        pedido: 'O que é zoo? Me mostra?',
        chegada: 'Uau! Então isso é um zoo! Aqui moram os bichos!',
      },
      {
        slug: 'VET',
        pos: [22, 62],
        size: [12, 7, 12],
        cor: '#a8c8b0',
        rotuloCor: '#14301c',
        rotuloContorno: '#ffffff',
        // Sem pedido/chegada próprios: as frases vêm do banco de animais
        // (missoes-ciencias.js) — chegar aqui sempre tem um bichinho junto.
        soCiencias: true,
        // `fato` cobre o adesivo do Caderninho (os outros prédios usam a
        // própria frase de chegada como fato; o VET não tem uma).
        fato: 'Uau! Então vet é o médico dos animais!',
      },
    ],
  },
];

/** Lista achatada de todos os prédios da cidade (todos os bairros). */
export const TODOS_PREDIOS = BAIRROS.flatMap((b) => b.predios);
