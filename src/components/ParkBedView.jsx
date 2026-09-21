import { CANTEIRO } from '../city/canteiro.js';
import { TINTAS } from '../brand/paleta3d.js';

/** Vista para observar e contar; usa o canteiro real, nunca a resposta do quiz. */
export function ParkBedView() {
  const { centro, tamanho } = CANTEIRO.base;
  return (
    <svg className="park-bed-view" viewBox="0 0 320 100" role="img"
      aria-label="Vista das árvores do canteiro do parque">
      <rect x="5" y="5" width="310" height="90" rx="18" fill={TINTAS.grassSoft} />
      <rect x="12" y="60" width="296" height="30" rx="8" fill={TINTAS.paper} />
      {CANTEIRO.arvores.map(([x, z], i) => (
        <g key={`${x}-${z}`} data-tree={i} transform={`translate(${160 + (x-centro[0])*256/tamanho[0]},${(z-centro[1])*20/tamanho[1]})`}>
          <ellipse cx="7" cy="77" rx="20" ry="8" fill={TINTAS.inkFaint} />
          <path d="M-4 47H4V78H-4Z" fill={TINTAS.inkSoft} />
          <path d="M0 15L23 28V52L0 66L-23 52V28Z" fill={i%2 ? TINTAS.grassDeep : TINTAS.grass} stroke={TINTAS.ink} strokeWidth="3" />
          <path d="M0 20L18 30L7 48L-15 49L-18 30Z" fill={TINTAS.grass} />
        </g>
      ))}
    </svg>
  );
}
