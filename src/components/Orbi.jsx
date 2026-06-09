import { useMemo } from 'react';
import { orbiSvg } from '../brand/orbi.js';

/**
 * Personagem Órbi como componente React — fonte única pra Fase 2 (abertura)
 * e Fase 3 (momentos do jogo).
 *
 * O SVG vem do gerador (src/brand/orbi.js): markup ESTÁTICO e confiável
 * (nosso próprio código, sem entrada do usuário), então `dangerouslySetInnerHTML`
 * é seguro aqui e evita reconverter ~40 nós SVG pra JSX à mão.
 *
 * Props:
 *  - pose: 'acenando' | 'comemorando' | 'curioso' | 'parado'
 *  - bust: só cabeça+tronco (p/ avatar/ícone)
 *  - className, style: repassados ao wrapper
 */
export function Orbi({ pose = 'parado', bust = false, className = '', style }) {
  const html = useMemo(() => orbiSvg(pose, { bust }), [pose, bust]);
  return (
    <div
      className={'orbi-char' + (className ? ' ' + className : '')}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
