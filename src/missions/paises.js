/**
 * Banco FIXO de PAÍSES DO MUNDO (Frente 6 — ESTÁDIO) — alimenta o quiz
 * de bandeiras da chegada viva do ESTÁDIO e a seção PAÍSES do Caderninho.
 *
 * GUARD-RAIL DE IP (INVIOLÁVEL): bandeiras de países e nomes de países
 * SOMENTE — zero escudos de seleção, zero logos FIFA/Copa, zero nomes de
 * jogadores. A palavra "Copa" NÃO existe em nenhuma string do jogo: o
 * tema é PAÍSES DO MUNDO (o contexto sazonal é da casa, não do software).
 *
 * CURADORIA DO BANCO (12 países, decidida no gate da frente):
 *   - ARÁBIA SAUDITA ficou FORA por respeito: a bandeira carrega a
 *     shahada (texto sagrado) — não se simplifica num SVG infantil com
 *     respeito; melhor não entrar.
 *   - CORÉIA DO SUL (taegeuk + trigramas) e NOVA ZELÂNDIA/AUSTRÁLIA
 *     (Union Jack no cantão) ficaram fora por ILEGIBILIDADE em tamanho
 *     de carta.
 *   - EUA entra e fecha o trio anfitrião de 2026 com MÉXICO e CANADÁ.
 *
 * Campos:
 *   slug    — nome em CAIXA ALTA: É o rótulo lido na carta (pedagogia de
 *             leitura, como o GATO do quiz do ZOO) e a chave do SVG em
 *             components/Bandeira.jsx e da descoberta no caderninho.
 *   nomeVoz — nome falado, minúsculas (TTS soletra CAIXA ALTA; "EUA"
 *             vira "estados unidos" — sigla soletrada não é fala).
 *   de      — contração da pergunta ("do brasil", "da frança", "dos
 *             estados unidos", "de portugal").
 *   cores   — descrição falada das cores, usada SÓ na fala do QUIZ
 *             (fraseAcerto/fraseRevela do ESTÁDIO). O fato do Caderninho
 *             NÃO deriva daqui — é o fatoVoz (desacoplados de propósito:
 *             mexer num não vaza no outro).
 *   cor       — GRUPO DE COR (eixo 1) pro sorteio de distratoras.
 *   estrutura — ESQUELETO da bandeira (eixo 2): 'tri-vertical',
 *             'tri-horizontal' ou null (forma única — não colide com
 *             ninguém). Dois eixos ORTOGONAIS de propósito: um rótulo só
 *             não captura cor E forma — França/México (tricolores
 *             verticais de cores distintas) escapavam quando isto era um
 *             campo único. O filtro `colide` (chegadas-vivas.js) exclui
 *             distratora que bata em QUALQUER eixo: as 3 cartas nunca são
 *             confundíveis (Senegal nunca ao lado de Gana nem de França;
 *             Japão nunca ao lado de Canadá).
 *   fatoVoz — fato do Caderninho (card + voz ao toque), bespoke por país,
 *             minúsculo, com o marco diferenciador (sol, estrela, círculo,
 *             folhinha...). Lido por conteudoDescoberta (descobertas.js);
 *             a voz monta "${nomeVoz}! ${fatoVoz}".
 */

export const PAISES = [
  { slug: 'BRASIL',    nomeVoz: 'brasil',          de: 'do',  cores: 'verde e amarela',                       cor: 'verde-amarelo',          estrutura: null,             fatoVoz: 'a bandeira verde e amarela!' },
  { slug: 'ARGENTINA', nomeVoz: 'argentina',       de: 'da',  cores: 'azul e branca',                         cor: 'azul-branco',            estrutura: 'tri-horizontal', fatoVoz: 'azul-clara e branca, com o sol no meio!' },
  { slug: 'FRANÇA',    nomeVoz: 'frança',          de: 'da',  cores: 'azul, branca e vermelha',               cor: 'azul-branco-vermelho',   estrutura: 'tri-vertical',   fatoVoz: 'azul, branca e vermelha, em três faixas!' },
  { slug: 'ESPANHA',   nomeVoz: 'espanha',         de: 'da',  cores: 'vermelha e amarela',                    cor: 'vermelho-amarelo',       estrutura: 'tri-horizontal', fatoVoz: 'vermelha e amarela!' },
  { slug: 'JAPÃO',     nomeVoz: 'japão',           de: 'do',  cores: 'branca com uma bola vermelha',          cor: 'branco-vermelho',        estrutura: null,             fatoVoz: 'branca com um círculo vermelho no meio!' },
  { slug: 'SENEGAL',   nomeVoz: 'senegal',         de: 'do',  cores: 'verde, amarela e vermelha',             cor: 'verde-amarelo',          estrutura: 'tri-vertical',   fatoVoz: 'verde, amarela e vermelha, com uma estrela verde no meio!' },
  { slug: 'GANA',      nomeVoz: 'gana',            de: 'de',  cores: 'vermelha, amarela e verde',             cor: 'verde-amarelo',          estrutura: 'tri-horizontal', fatoVoz: 'vermelha, amarela e verde, com uma estrela preta no meio!' },
  { slug: 'MÉXICO',    nomeVoz: 'méxico',          de: 'do',  cores: 'verde, branca e vermelha',              cor: 'verde-vermelho',         estrutura: 'tri-vertical',   fatoVoz: 'verde, branca e vermelha, com uma águia no meio!' },
  { slug: 'CANADÁ',    nomeVoz: 'canadá',          de: 'do',  cores: 'vermelha e branca com uma folha',       cor: 'branco-vermelho',        estrutura: 'tri-vertical',   fatoVoz: 'vermelha e branca, com a folhinha no meio!' },
  { slug: 'EUA',       nomeVoz: 'estados unidos',  de: 'dos', cores: 'de listras vermelhas com estrelinhas',  cor: 'azul-branco-vermelho',   estrutura: null,             fatoVoz: 'listras e muitas estrelas!' },
  { slug: 'ALEMANHA',  nomeVoz: 'alemanha',        de: 'da',  cores: 'preta, vermelha e amarela',             cor: 'preto-vermelho-amarelo', estrutura: 'tri-horizontal', fatoVoz: 'preta, vermelha e amarela!' },
  { slug: 'PORTUGAL',  nomeVoz: 'portugal',        de: 'de',  cores: 'verde e vermelha',                      cor: 'verde-vermelho',         estrutura: null,             fatoVoz: 'verde e vermelha!' },
];

/** Busca por slug (gerador do quiz, caderninho e Bandeira.jsx). */
export const PAIS_POR_SLUG = Object.fromEntries(
  PAISES.map((p) => [p.slug, p])
);

/**
 * Países cuja IDENTIDADE depende de uma marca CENTRAL — sem ela, o desenho
 * vira OUTRA bandeira real (México sem águia = Itália; Senegal sem estrela =
 * Mali; Canadá sem folha = Peru). Fonte ÚNICA: alimenta o DEV-check de
 * fidelidade em Bandeira.jsx E o gate-fotos individual (ii) futuro — paises.js
 * é leaf (sem React), então o gate em node importa daqui, não do Bandeira.jsx.
 */
export const EMBLEMA_CENTRAL = new Set([
  'MÉXICO', 'SENEGAL', 'CANADÁ', 'GANA', 'ARGENTINA', 'BRASIL', 'PORTUGAL',
]);
