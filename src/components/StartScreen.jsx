import { useEffect, useRef, useState } from 'react';
import { Orbi } from './Orbi.jsx';
import { useGame } from '../store/useGame.js';

/**
 * Tela de abertura do Órbi — fiel a "Órbi - Tela de Abertura.html".
 *
 * Logo (wordmark adesivo + planeta no "Ó") + tagline "um mundo pra descobrir"
 * + Órbi acenando + botão JOGAR grande + cantinhos (som / Área dos pais).
 *
 * Composição em "canvas fixo" 1280×800 escalado pra caber em qualquer janela
 * (mesma técnica do mock: garante que o enquadramento aprovado nunca quebre).
 *
 * JOGAR: Órbi comemora + balãozinho ("Vamos explorar!") num respiro curtinho,
 * depois entra na cidade. Guard-rail TEA+TDAH: resposta clara a UMA ação,
 * movimento contido, tudo gated em prefers-reduced-motion.
 *
 * Som e "Área dos pais" são PLACEHOLDERS por ora (visuais, fiéis ao mock) —
 * fiação real fica pra um passo futuro.
 */

// SVGs estáticos copiados verbatim do mock (markup confiável → innerHTML ok).
const ACCENT_SVG =
  '<svg viewBox="0 0 60 60" width="100%" height="100%"><circle cx="30" cy="30" r="20" fill="#FFC53D" stroke="#1C2746" stroke-width="6"/><ellipse cx="30" cy="30" rx="29" ry="9" transform="rotate(-20 30 30)" fill="none" stroke="#1C2746" stroke-width="5"/></svg>';

const SUN_PLANET_SVG =
  '<svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="30" fill="#FFC53D" stroke="#1C2746" stroke-width="6"/><ellipse cx="48" cy="48" rx="44" ry="14" transform="rotate(-22 48 48)" fill="none" stroke="#1C2746" stroke-width="5"/></svg>';

const GROUND_SVG = `
  <svg viewBox="0 0 1280 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.96">
      <g>
        <rect x="150" y="92" width="74" height="96" rx="14" fill="#BEE5F8" stroke="#1C2746" stroke-width="5"/>
        <rect x="166" y="110" width="18" height="18" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="192" y="110" width="18" height="18" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="232" y="64" width="64" height="124" rx="14" fill="#FFE0A0" stroke="#1C2746" stroke-width="5"/>
        <rect x="248" y="84" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="270" y="84" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="248" y="114" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="270" y="114" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
      </g>
      <g>
        <rect x="980" y="74" width="68" height="116" rx="14" fill="#BDE8C5" stroke="#1C2746" stroke-width="5"/>
        <rect x="997" y="94" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="1019" y="94" width="16" height="16" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="1056" y="98" width="74" height="92" rx="14" fill="#FBC4B5" stroke="#1C2746" stroke-width="5"/>
        <rect x="1073" y="116" width="18" height="18" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
        <rect x="1099" y="116" width="18" height="18" rx="4" fill="#fff" stroke="#1C2746" stroke-width="3"/>
      </g>
    </g>
    <path d="M0 120 Q 360 64 640 96 Q 960 128 1280 92 L1280 300 L0 300 Z" fill="#5BBE6E" stroke="#1C2746" stroke-width="6"/>
    <path d="M120 300 Q 220 214 320 300 Z" fill="#3F9E52" opacity="0.28"/>
    <path d="M900 300 Q 1010 206 1120 300 Z" fill="#3F9E52" opacity="0.28"/>
  </svg>`;

const SPARK = (fill) =>
  `<svg width="100%" height="100%" viewBox="0 0 34 34"><path d="M17 1 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 z" fill="${fill}" stroke="#1C2746" stroke-width="3"/></svg>`;

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
  const [somOn, setSomOn] = useState(true);
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
        {/* DECOR */}
        <div className="start-decor">
          <Raw className="start-sun-planet" html={SUN_PLANET_SVG} />
          <div className="start-cloud start-cloud--a"><i /></div>
          <div className="start-cloud start-cloud--b"><i /></div>
          <div className="start-cloud start-cloud--c"><i /></div>
          <Raw className="start-spark" style={{ left: 540, top: 120, width: 34, height: 34 }} html={SPARK('#FFC53D')} />
          <Raw className="start-spark" style={{ right: 120, top: 300, width: 26, height: 26 }} html={SPARK('#F0623E')} />
          <Raw className="start-spark" style={{ left: 240, top: 470, width: 22, height: 22 }} html={SPARK('#58B6E8')} />
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

        {/* CANTINHOS (placeholders por ora) */}
        <div className="start-controls">
          <button
            className="start-rbtn"
            onClick={() => setSomOn((v) => !v)}
            aria-label={somOn ? 'Som ligado' : 'Som desligado'}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path
                d="M5 11 H10 L16 6 V24 L10 19 H5 Z"
                fill="#FFC53D"
                stroke="#1C2746"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {somOn && (
                <path
                  d="M20 11 Q23 15 20 19 M23 8 Q28 15 23 22"
                  stroke="#1C2746"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </button>
        </div>

        <button className="start-parents" onClick={(e) => e.preventDefault()} aria-label="Área dos pais">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="3" fill="#fff" stroke="#46557E" strokeWidth="2.4" />
            <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="#46557E" strokeWidth="2.4" fill="none" />
          </svg>
          Área dos pais
        </button>
      </div>
    </div>
  );
}
