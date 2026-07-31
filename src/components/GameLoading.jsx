import { Orbi } from './Orbi.jsx';

/** Fallback honesto: não inventa porcentagem enquanto o mundo 3D é baixado. */
export function GameLoading() {
  return (
    <div className="game-loading" role="status" aria-live="polite">
      <div className="game-loading-orbi" aria-hidden="true">
        <Orbi pose="acenando" />
      </div>
      <strong>PREPARANDO A CIDADE…</strong>
      <span>O Órbi está deixando tudo pronto para explorar.</span>
      <div className="game-loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
