import { useEffect, useRef, useState } from 'react';
import { Orbi } from './Orbi.jsx';
import { AreaPais } from './AreaPais.jsx';
import { useGame } from '../store/useGame.js';

/**
 * Tela de abertura do Órbi — fiel a "Órbi - Tela de Abertura.html".
 *
 * Logo (wordmark adesivo + planeta no "Ó") + tagline "um mundo pra descobrir"
 * + Órbi acenando + botão JOGAR grande + cantinho "Área dos pais".
 *
 * Composição em "canvas fixo" 1280×800 escalado pra caber em qualquer janela
 * (mesma técnica do mock: garante que o enquadramento aprovado nunca quebre).
 *
 * JOGAR: Órbi comemora + balãozinho ("Vamos explorar!") num respiro curtinho,
 * depois entra na cidade. Guard-rail TEA+TDAH: resposta clara a UMA ação,
 * movimento contido, tudo gated em prefers-reduced-motion.
 *
 * "Área dos pais" é PLACEHOLDER por ora (visual, fiel ao mock) — fiação real
 * fica pra um passo futuro. O botão de som saiu junto com o tema cantado
 * (decisão de produto): ele só ligava/desligava a música, e botão sem efeito
 * viola a previsibilidade TEA. Volta com o tema novo, numa atualização futura.
 */

// SVGs estáticos copiados verbatim do mock (markup confiável → innerHTML ok).
const ACCENT_SVG =
  '<svg viewBox="0 0 60 60" width="100%" height="100%"><circle cx="30" cy="30" r="20" fill="#FFC53D" stroke="#1C2746" stroke-width="6"/><ellipse cx="30" cy="30" rx="29" ry="9" transform="rotate(-20 30 30)" fill="none" stroke="#1C2746" stroke-width="5"/></svg>';

const SUN_PLANET_SVG =
  '<svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="30" fill="#FFC53D" stroke="#1C2746" stroke-width="6"/><ellipse cx="48" cy="48" rx="44" ry="14" transform="rotate(-22 48 48)" fill="none" stroke="#1C2746" stroke-width="5"/></svg>';

// MESMA cidade que o Heitor dirige — re-tonalizada pro entardecer espacial.
// Silhueta idêntica (elo com o mundo do jogo), só a cor muda: casinhas em
// tons crepúsculo e janelas ACESAS (creme quente) = cidade ao anoitecer.
const GROUND_SVG = `
  <svg viewBox="0 0 1280 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.96">
      <g>
        <rect x="150" y="92" width="74" height="96" rx="14" fill="#8E9FD4" stroke="#1C2746" stroke-width="5"/>
        <rect x="166" y="110" width="18" height="18" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="192" y="110" width="18" height="18" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="232" y="64" width="64" height="124" rx="14" fill="#C9A8D6" stroke="#1C2746" stroke-width="5"/>
        <rect x="248" y="84" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="270" y="84" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="248" y="114" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="270" y="114" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
      </g>
      <g>
        <rect x="980" y="74" width="68" height="116" rx="14" fill="#7E9BC4" stroke="#1C2746" stroke-width="5"/>
        <rect x="997" y="94" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="1019" y="94" width="16" height="16" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="1056" y="98" width="74" height="92" rx="14" fill="#C98FA8" stroke="#1C2746" stroke-width="5"/>
        <rect x="1073" y="116" width="18" height="18" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
        <rect x="1099" y="116" width="18" height="18" rx="4" fill="#FFE9A8" stroke="#1C2746" stroke-width="3"/>
      </g>
    </g>
    <path d="M0 120 Q 360 64 640 96 Q 960 128 1280 92 L1280 300 L0 300 Z" fill="#6E5AA0" stroke="#1C2746" stroke-width="6"/>
    <path d="M120 300 Q 220 214 320 300 Z" fill="#574484" opacity="0.32"/>
    <path d="M900 300 Q 1010 206 1120 300 Z" fill="#574484" opacity="0.32"/>
  </svg>`;

// estrela-adesivo: MESMO shape da intro "A Chegada" (coerência intro→abertura).
const STAR_SVG = (s) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 34 34"><path d="M17 1 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 z" fill="#FFFFFF" stroke="#1C2746" stroke-width="2.6"/></svg>`;

// campo de estrelas discretas — posições FIXAS (calmas), longe do centro
// (onde ficam logo/Órbi/JOGAR). Pulso suave e escalonado no CSS.
const ESTRELAS = [
  { left: 470, top: 96, s: 20 },
  { left: 760, top: 70, s: 14 },
  { left: 980, top: 150, s: 22 },
  { left: 250, top: 250, s: 16 },
  { left: 1130, top: 240, s: 18 },
  { left: 150, top: 430, s: 13 },
  { left: 1080, top: 430, s: 15 },
  { left: 600, top: 56, s: 12 },
];

// planeta grande e ESTÁVEL — redondo, lavanda, com faixas suaves recortadas
// no círculo (giram MUITO devagar: lê como rotação calma, nunca agressiva).
const BIG_PLANET_SVG = `
  <svg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="bp"><circle cx="130" cy="130" r="92"/></clipPath></defs>
    <circle cx="130" cy="130" r="92" fill="#B59BE0" stroke="#1C2746" stroke-width="7"/>
    <g clip-path="url(#bp)">
      <ellipse cx="130" cy="100" rx="120" ry="15" fill="#C9B6EC" opacity="0.85"/>
      <ellipse cx="130" cy="150" rx="120" ry="20" fill="#A487D6" opacity="0.75"/>
      <circle cx="92"  cy="176" r="13" fill="#A487D6"/>
      <circle cx="172" cy="116" r="9"  fill="#C9B6EC"/>
    </g>
  </svg>`;

const ENTER_DELAY_MS = 1100; // respiro da comemoração antes de entrar na cidade

function Raw({ html, className, style }) {
  return <div className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function StartScreen({ onPlay, onVerHistoria }) {
  const introVista = useGame((s) => s.introVista);
  const [scale, setScale] = useState(1);
  const [pose, setPose] = useState('acenando');
  const [pressed, setPressed] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [paisAberto, setPaisAberto] = useState(false);
  const busy = useRef(false);

  // Escala o canvas fixo 1280×800 pra caber na janela (nunca trava em 0).
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
      if (s > 0) setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const jogar = () => {
    if (busy.current) return;
    busy.current = true;

    const reduz =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setPressed(true);
    setPose('comemorando');
    setBubble(true);

    setTimeout(() => onPlay && onPlay(), reduz ? 550 : ENTER_DELAY_MS);
  };

  return (
    <div className="orbi-start">
      <div className="start-screen" style={{ transform: `scale(${scale})` }}>
        {/* DECOR — céu de entardecer espacial: planetas estáveis + estrelas calmas */}
        <div className="start-decor">
          <Raw className="start-big-planet" html={BIG_PLANET_SVG} />
          <Raw className="start-sun-planet" html={SUN_PLANET_SVG} />
          {ESTRELAS.map((e, i) => (
            <Raw
              key={i}
              className="start-star"
              style={{ left: e.left, top: e.top, width: e.s, height: e.s, animationDelay: `${(i % 4) * 0.9}s` }}
              html={STAR_SVG(e.s)}
            />
          ))}
        </div>

        {/* COLINA + CIDADE */}
        <Raw className="start-ground" html={GROUND_SVG} />

        {/* CONTEÚDO */}
        <div className="start-content">
          <div className="start-logo">
            <span className="start-wm">
              <span className="start-o-unit">
                O
                <Raw className="start-acc" html={ACCENT_SVG} />
              </span>
              rbi
            </span>
            <span className="start-tagline">um mundo pra descobrir</span>
          </div>

          <div className="start-orbi-wrap">
            <Orbi pose={pose} className="start-orbi" />
            <div className={'start-bubble' + (bubble ? ' show' : '')}>Vamos explorar!</div>
          </div>

          <button
            className={'start-play' + (pressed ? ' press' : '')}
            onClick={jogar}
            aria-label="Jogar"
          >
            <span className="start-tri" aria-hidden="true" />
            JOGAR
          </button>

          {/* discreto: só depois da intro vista (adendo de narrativa) */}
          {introVista && onVerHistoria && (
            <button className="start-historia" onClick={onVerHistoria}>
              ver a história de novo
            </button>
          )}
        </div>

        {/* CANTINHOS: só "Área dos pais" por ora — o botão de som saiu com o
            tema cantado (ver doc do componente); volta com o tema novo. */}
        <button
          className="start-parents"
          onClick={() => setPaisAberto(true)}
          aria-label="Área dos pais"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="3" fill="#fff" stroke="#46557E" strokeWidth="2.4" />
            <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="#46557E" strokeWidth="2.4" fill="none" />
          </svg>
          Área dos pais
        </button>
      </div>

      {/* Overlay da Área dos pais — filho de .orbi-start (NÃO de .start-screen,
          que tem transform: scale()): position:fixed lá dentro seria escalado.
          Fica FORA da moldura escalada, ocupando a viewport inteira. */}
      {paisAberto && <AreaPais onFechar={() => setPaisAberto(false)} />}
    </div>
  );
}
