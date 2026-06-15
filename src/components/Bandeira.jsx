import { Children } from 'react';
import { PAIS_POR_SLUG, EMBLEMA_CENTRAL } from '../missions/paises.js';

/**
 * BANDEIRAS em SVG sticker (Frente 6 — ESTÁDIO). Por que SVG e não emoji:
 * teste empírico no Edge/Windows da casa mostrou que emoji de bandeira
 * NÃO renderiza (vira par de letras — o Windows não tem os glifos). De
 * quebra, bandeira desenhada fica na linguagem visual da marca.
 *
 * GUARD-RAIL DE IP (INVIOLÁVEL): bandeiras de países SOMENTE — zero
 * escudos de seleção, zero logos FIFA/Copa. Simplificações respeitosas e
 * documentadas: ESPANHA e MÉXICO sem a heráldica central (complexa
 * demais pra carta), EUA com 7 listras + cantão de pontinhos (régua de
 * legibilidade infantil — vexilologicamente "errado", pedagogicamente
 * certo). A curadoria de QUAIS países está em missions/paises.js.
 *
 * EXCEÇÃO DE COR documentada: os hex aqui são as CORES REAIS de cada
 * bandeira — bandeira é CONTEÚDO pedagógico (precisa ser reconhecível
 * no mundo real), não decoração do mundo; a regra "toda cor de mundo
 * via paleta3d" não se aplica. O contorno sticker fica no CSS
 * (.bandeira: borda navy via token).
 *
 * viewBox 30×20 (3:2). Dimensionamento via className (CSS).
 */

/** Polígono de estrela de 5 pontas (pontos pré-computados — sem random). */
function estrela(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const ang = (-90 + i * 36) * (Math.PI / 180);
    const raio = i % 2 === 0 ? r : r * 0.42;
    pts.push(
      `${(cx + raio * Math.cos(ang)).toFixed(2)},${(cy + raio * Math.sin(ang)).toFixed(2)}`
    );
  }
  return pts.join(' ');
}

const DESENHOS = {
  // BRASIL: verde + losango amarelo + disco azul (globo). EMBLEMA OBRIGATÓRIO
  // — sem o disco vira losango vazio.
  BRASIL: (
    <>
      <rect width="30" height="20" fill="#009C3B" />
      <polygon points="15,2.5 27,10 15,17.5 3,10" fill="#FFDF00" />
      <circle cx="15" cy="10" r="3.6" fill="#002776" />
    </>
  ),
  // ARGENTINA: celeste/branco/celeste horizontal + sol (disco dourado). EMBLEMA
  // OBRIGATÓRIO — sem o disco vira triband celeste sem identidade.
  ARGENTINA: (
    <>
      <rect width="30" height="20" fill="#74ACDF" />
      <rect y="6.7" width="30" height="6.6" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="2.4" fill="#F6B40E" />
    </>
  ),
  // FRANÇA: azul/branco/vermelho vertical, tricolor liso (sem emblema).
  FRANÇA: (
    <>
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </>
  ),
  // ESPANHA: vermelho/amarelo/vermelho horizontal 1:2:1. Brasão omitido
  // (simplificação documentada); a bandeira civil sem brasão é válida.
  ESPANHA: (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </>
  ),
  // JAPÃO: campo branco + disco vermelho central.
  JAPÃO: (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="5" fill="#BC002D" />
    </>
  ),
  // SENEGAL: verde/amarelo/vermelho vertical + estrela verde. EMBLEMA
  // OBRIGATÓRIO — sem a estrela vira o MALI.
  SENEGAL: (
    <>
      <rect width="10" height="20" fill="#00853F" />
      <rect x="10" width="10" height="20" fill="#FDEF42" />
      <rect x="20" width="10" height="20" fill="#E31B23" />
      <polygon points={estrela(15, 10, 3.4)} fill="#00853F" />
    </>
  ),
  // GANA: vermelho/amarelo/verde horizontal + estrela preta. EMBLEMA
  // OBRIGATÓRIO — sem a estrela vira tricolor pan-africano genérico.
  GANA: (
    <>
      <rect width="30" height="20" fill="#CE1126" />
      <rect y="6.7" width="30" height="6.6" fill="#FCD116" />
      <rect y="13.3" width="30" height="6.7" fill="#006B3F" />
      <polygon points={estrela(15, 10, 3.4)} fill="#000000" />
    </>
  ),
  // MÉXICO: verde/branco/vermelho vertical + brasão evocado (medalhão
  // verde+marrom+vermelho). EMBLEMA OBRIGATÓRIO — sem ele vira a ITÁLIA.
  MÉXICO: (
    <>
      <rect width="10" height="20" fill="#006847" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
      <rect x="20" width="10" height="20" fill="#CE1126" />
      {/* Brasão evocado pela PALETA, não pela silhueta (águia em ~3px lê como
          mancha): disco verde (folhagem/base) EMOLDURA o oval marrom (águia)
          nos 4 lados — anel verde 1.0 vert / 1.5 horiz — e o ponto vermelho
          (cobra) cai no anel verde, à direita do marrom (contraste alto).
          Diferencia da ITÁLIA, cujo centro é branco puro. */}
      <circle cx="15" cy="10" r="3" fill="#2E7D32" />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#6B4423" />
      <circle cx="17.25" cy="10" r="0.6" fill="#C62828" />
    </>
  ),
  // CANADÁ: vermelho/branco/vermelho vertical + folha de bordo. EMBLEMA
  // OBRIGATÓRIO — sem a folha vira o PERU.
  CANADÁ: (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="7.5" height="20" fill="#D52B1E" />
      <rect x="22.5" width="7.5" height="20" fill="#D52B1E" />
      {/* folha de bordo simplificada (silhueta de 3 pontas) */}
      <polygon
        points="15,3.5 16.6,7 19.8,6 17.8,9.5 21,11.5 15.8,12 15.8,16.5 14.2,16.5 14.2,12 9,11.5 12.2,9.5 10.2,6 13.4,7"
        fill="#D52B1E"
      />
    </>
  ),
  // EUA: 7 listras (régua infantil) + cantão azul com pontinhos. Simplificação
  // documentada (real: 13 listras / 50 estrelas).
  EUA: (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      {[0, 2, 4, 6].map((i) => (
        <rect key={i} y={i * (20 / 7)} width="30" height={20 / 7} fill="#B22234" />
      ))}
      <rect width="13" height={(20 / 7) * 4} fill="#3C3B6E" />
      {/* estrelas como pontinhos — régua de legibilidade infantil */}
      {[2.5, 6.5, 10.5].flatMap((x) =>
        [2.2, 5.7, 9.2].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#FFFFFF" />
        ))
      )}
    </>
  ),
  // ALEMANHA: preto/vermelho/dourado horizontal.
  ALEMANHA: (
    <>
      <rect width="30" height="6.7" fill="#000000" />
      <rect y="6.7" width="30" height="6.6" fill="#DD0000" />
      <rect y="13.3" width="30" height="6.7" fill="#FFCE00" />
    </>
  ),
  // PORTUGAL: verde 40% / vermelho 60% vertical + esfera armilar (disco amarelo
  // na divisa). EMBLEMA OBRIGATÓRIO — sem o disco vira bicolor sem identidade.
  PORTUGAL: (
    <>
      <rect width="12" height="20" fill="#046A38" />
      <rect x="12" width="18" height="20" fill="#DA291C" />
      <circle cx="12" cy="10" r="3.4" fill="#FFE900" />
    </>
  ),
};

/**
 * <Bandeira slug="BRASIL" className="viva-bandeira" /> — slug do banco
 * PAISES. Slug sem desenho não renderiza nada (e avisa em dev: o banco e
 * os desenhos precisam andar juntos).
 */
export function Bandeira({ slug, className }) {
  const desenho = DESENHOS[slug];
  if (!desenho) return null;
  return (
    <svg
      viewBox="0 0 30 20"
      className={'bandeira' + (className ? ` ${className}` : '')}
      aria-hidden="true"
    >
      {desenho}
    </svg>
  );
}

// Checagem DEV do contrato banco↔desenhos (mesmo padrão do Bichos.jsx).
if (import.meta.env?.DEV) {
  for (const slug of Object.keys(PAIS_POR_SLUG)) {
    if (!DESENHOS[slug]) {
      console.warn(`[Bandeira] país sem desenho: ${slug}`);
    }
  }
  for (const slug of Object.keys(DESENHOS)) {
    if (!PAIS_POR_SLUG[slug]) {
      console.warn(`[Bandeira] desenho sem país no banco: ${slug}`);
    }
  }
}

// Invariante de FIDELIDADE (i): país emblema-dependente (EMBLEMA_CENTRAL) cujo
// desenho só tem faixas (<rect>) virou outra bandeira real — foi o bug do
// MÉXICO (3 rects = Itália). Exige ≥1 elemento não-<rect> (circle/polygon/
// ellipse = a marca central).
// LIMITE (de propósito): cobre "país DO SET perdeu o emblema", NÃO "país com
// emblema ficou fora do Set" — quem não está no Set não é checado. Protege a
// classe de bug que aconteceu, não a fidelidade total (essa pede olho humano:
// gate-fotos ii).
if (import.meta.env?.DEV) {
  for (const slug of EMBLEMA_CENTRAL) {
    const filhos = Children.toArray(DESENHOS[slug]?.props?.children);
    const temMarca = filhos.some((f) => f?.type && f.type !== 'rect');
    if (!temMarca) {
      console.warn(
        `[Bandeira] ${slug} é emblema-dependente mas o desenho só tem faixas (<rect>) — vira outra bandeira (ex.: MÉXICO sem águia = Itália)`
      );
    }
  }
}
