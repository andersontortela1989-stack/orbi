import { useGame } from '../store/useGame.js';

/**
 * HUD 2D — overlay React sobre o <Canvas>.
 * Mostra só o essencial: moedas (número) + combustível (barra).
 * Sem botões, sem texto em excesso. Guard-rail TEA: poucas informações,
 * alto contraste, CAIXA ALTA.
 *
 * Usa seletores do zustand → re-render só quando o slice usado muda.
 */
export function HUD() {
  const moedas = useGame((s) => s.moedas);
  const combustivel = useGame((s) => s.combustivel);
  const pct = Math.max(0, Math.min(100, combustivel));

  return (
    <div className="hud" aria-live="polite">
      <div className="hud-row">
        <span className="hud-icon" aria-hidden="true">🪙</span>
        <span className="hud-value">{moedas}</span>
      </div>

      <div className="hud-row">
        <span className="hud-icon" aria-hidden="true">⛽</span>
        <div
          className="hud-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(pct)}
          aria-label="combustível"
        >
          <div className="hud-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
